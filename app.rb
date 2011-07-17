#####################################################
# CONFIG
# {{{
require 'sinatra'
require 'datamapper'
require 'gibbon'
require 'logger'
require 'erubis'
require 'sinatra/session'
require 'dm-validations'
require 'rack-flash'
require 'pusher'
require 'json'

configure :development do
  # Set up logging
  Dir.mkdir('logs') unless File.exist?('logs')
  $log = Logger.new('logs/output.log','weekly')
  $log.level = Logger::DEBUG
end

# Globally set erubis to render with auto-escaping of html
set :erubis, :escape_html => true

# Configure Pusher Gem
Pusher.app_id = '6874'
Pusher.key = '8db0551b82359d1c5636'
Pusher.secret = 'd3c313aa2552dd33d1b9'

# Set up sinatra-session
set :session_fail, '/login'
set :session_secret, 'mailchimp'
set :session_expire, 2592000

# Use Rack-Flash
use Rack::Flash, :accessorize => [:notice, :success, :error]
#}}}

# Set up the DB
# {{{
DataMapper.setup(:default, ENV['DATABASE_URL'] || "sqlite3://#{Dir.pwd}/app.db")

class User
  include DataMapper::Resource
  property :id, Serial
  property :name, String, :required => true,
    :messages => {
    :presence  => 'Your name is required!',
  }
  property :email, String, :required => true, :unique => true,
    :format   => :email_address,
    :messages => {
    :presence  => 'Your email address is required!',
    :is_unique => 'We already have that email.',
    :format    => 'Doesn\'t look like an email address to me...'
  }
  property :url_photo, String, :required => true
  property :is_admin, Integer
  property :created_at, DateTime
  property :updated_at, DateTime
  has n, :urls
  has n, :tags
  has 1, :category
  has 1, :neighborhood
end

class Tag
  include DataMapper::Resource
  belongs_to :user, :required => true
  property :id, Serial
  property :name, String
  property :created_at, DateTime
end

class Category
  include DataMapper::Resource
  belongs_to :user, :required => true
  property :id, Serial
  property :name, String
  property :created_at, DateTime
end

class Neighborhood
  include DataMapper::Resource
  belongs_to :user, :required => true
  property :id, Serial
  property :name, String
  property :created_at, DateTime
end

class Url
  include DataMapper::Resource
  belongs_to :user, :required => true
  property :id, Serial
  property :url, Text, :required => true,
    :messages => {
    :presence  => 'A URL is required!',
  }
  property :created_at, DateTime
end

DataMapper.finalize.auto_upgrade!
#}}}

# Helpers
# {{{
helpers do
  # Escape HTML
  def h(text)
    Rack::Utils.escape_html(text)
  end
  # Check if user is valid
  def checkUser(user_id)
    if user_id
      if !User.get(user_id)
        redirect '/error'
      else
        return true
      end
    else
      redirect '/error'
    end
  end
  # Check if user is organizer
  def checkOrganizer(user_id)
    user = User.get(user_id)
    if user['is_organizer'].nil?
      redirect "/error"
    else
      return true
    end
  end
  # Check if user is organizer from a view
  def checkOrganizerFromView(user_id)
    user = User.get(user_id)
    if user['is_organizer'].nil?
      return false
    else
      return true
    end
  end
  # Check if a campaign is valid and belogns to the user's mailchimpaccount accessing it
  def checkCampaign(share_url)
    user = User.get(session['user_id'])
    campaign = user.mailchimpaccount.campaigns.first(:share_url => share_url)
    if campaign.nil?
      redirect '/error'
    end
  end
  # Check if a revision is valid and belogns to the user's mailchimpaccount accessing it
  def checkRevision(share_url, revision_number)
    user = User.get(session['user_id'])
    campaign = user.mailchimpaccount.campaigns.first(:share_url => share_url)
    if campaign.nil?
      redirect '/error'
    end
    if campaign.revisions.first(:number => revision_number).nil?
      redirect '/error'
    end
  end
end
#}}}

#####################################################
# ROUTES

# /users/new
# {{{
get '/users/new/?' do
  # session!
  erubis :new
end
#}}}

# /dashboard
# {{{
get '/dashboard/?' do
  session!
  checkUser(session['user_id'])
  user = User.get(session['user_id'])
  checkOrganizer(session['user_id'])
  # Get all the campaigns, with the newest first!
  @campaigns = user.mailchimpaccount.campaigns.reverse
  # TODO: On an interval, check if new campaigns have been added
  if @campaigns.empty?
    redirect "/save_campaigns"
  end
  erubis :dashboard
end
#}}}

# /save_campaigns
# {{{
get '/save_campaigns' do
  session!
  checkUser(session['user_id'])
  user = User.get(session['user_id'])
  checkOrganizer(session['user_id'])
  mailchimpaccount = user.mailchimpaccount
  gb = Gibbon::API.new(mailchimpaccount['mc_api_key'])
  @campaigns = gb.campaigns({:start => 0, :limit => 20})
  @campaigns['data'].each do |campaign_data|
    if !Campaign.first(:cid => campaign_data['id'])
      campaign = Campaign.new
      campaign.name = campaign_data['title']
      campaign.cid = campaign_data['id']
      campaign.share_url = Digest::MD5.hexdigest(campaign_data['id'])
      campaign.current_revision = 0
      campaign.created_at = Time.now
      campaign.updated_at = Time.now
      mailchimpaccount.campaigns << campaign
      mailchimpaccount.save
    end
  end
  redirect "/dashboard"
end
#}}}

# /campaign/:share_url/display/:revision_number?
# {{{
# If a revision_id is specified, show that revision. If not, show the latest.
get '/campaign/:share_url/display/:revision_number?' do
  session!
  checkCampaign(params[:share_url])
  campaign = Campaign.first(:share_url => params[:share_url])
  checkUser(session['user_id'])
  user = User.get(session['user_id'])
  if params[:revision_number]
    checkRevision(params[:share_url], params[:revision_number])
    @revision_html = campaign.revisions.first(:number => params[:revision_number])['html']
  else
    @revision_html = Revision.get(campaign['current_revision'])['html']
  end
  erubis :campaign_display, :layout => :empty
end
#}}}

# /campaign/:share_url/:revision_number?
# {{{
get '/campaign/:share_url/:revision_number?' do
  # If a session exists, let them see the campaign
  if session?
    checkCampaign(params[:share_url])
    # Let's get the current user and all of their campaigns
    campaign = Campaign.first(:share_url => params[:share_url])
    checkUser(session['user_id'])
    user = User.get(session['user_id'])
    # If the revision is 0, it means that we have not yet fetched the email's content from the API
    if campaign['current_revision'] == 0
      # Grab both the campaign data and campaign email content from the API
      gb = Gibbon::API.new(user.mailchimpaccount['mc_api_key'])
      revision_data = gb.campaignContent({:cid => campaign['cid'], :for_archive => 'false'})
      @campaign_data = gb.campaigns({:filters => {:campaign_id => campaign['cid'], :exact => 'true'}})
      @campaign_data_array = @campaign_data['data'][0]
      # Create a new revision so that we can put all the data in it.
      revision = Revision.new
      revision.subject = @campaign_data_array['subject']
      revision.html = revision_data['html']
      revision.number = 1
      revision.from_name = @campaign_data_array['from_name']
      revision.from_email = @campaign_data_array['from_email']
      revision.created_at = Time.now
      # Push the revision into it's corresponding campaign.
      campaign.revisions << revision
      # Save the revision so that it gets assigned an ID.
      revision.save
      campaign.current_revision = revision.id
      # Now save the campaign
      campaign.save
    end
    # Let's build an array that contains hashes of comments and names of commenters to display on the page
    @comments = Array.new

    @campaign = campaign
    if params[:revision_number]
      @revision = campaign.revisions.first(:number => params[:revision_number])
      @revision_number = @revision['number']
    else
      @revision = campaign.revisions.first(:id => campaign['current_revision'])
    end
    @revisions = campaign.revisions
    @revision_number = @revision['number']

    @revision.comments.each do |comment|
      commenter_name = User.get(comment.user_id)['name']
      comment_container = Hash.new
      comment_container['name'] = commenter_name
      comment_container['content'] = comment['content']
      comment_container['at_revision'] = @revision_number
      comment_container['time'] = comment['created_at']
      @comments.push(comment_container)
    end
    # Let's keep track of who's viewed this campaign so far
    approval = user.approvals.first_or_create(:campaign_id => campaign['id'], :user_id => user['id'])
    if approval['visits'].nil?
      visits = 1
    else
      visits = approval['visits'] + 1
    end
    approval.visits = visits
    # Relate the visit to a specific user and campaign
    user.approvals << approval
    campaign.approvals << approval
    approval.save
    campaign_new_visitor_data = Hash.new
    campaign_new_visitor_data['name'] = user['name']
    campaign_new_visitor_data['user_id'] = user['id']
    campaign_new_visitor_data['status'] = approval['status']
    campaign_new_visitor_json = campaign_new_visitor_data.to_json
    # Let's announce that this user is now participating in the campaign
    Pusher["campaign_#{params[:share_url]}_approvals"].trigger('campaign_new_visitor', campaign_new_visitor_json)

    #Let's send the changelog data to display in the view
    @changelog = campaign.revisions.first(:id => campaign['current_revision']).changelog

    # Let's build an array that contains who's participating and their status so we can display it in the view
    @active_users = Array.new
    campaign.approvals.each do |active_user|
      current_user = Hash.new
      current_user_data = User.get(active_user['user_id'])
      current_user['name'] = current_user_data['name']
      current_user['user_id'] = current_user_data['id']
      if active_user['status']
        current_user['status'] = active_user['status']
      else
        current_user['status'] = 0
      end
      @active_users.push(current_user)
    end

    @current_status = Approval.first(:user_id => user['id'], :campaign_id => campaign['id'])['status']
    erubis :campaign
    # Else, let's go ahead and register them as a commenter
  else
    redirect "/campaign/#{params[:share_url]}/register"
  end

end
#}}}

# /:share_url/post_comment POST
# {{{
post '/:share_url/post_comment' do
  session!
  # Let's get the current user, campaign, and revision
  checkUser(session['user_id'])
  user = User.get(session['user_id'])
  checkCampaign(params[:share_url])
  campaign = Campaign.first(:share_url => params[:share_url])
  revision = campaign.revisions.first(:id => params[:revision_id])
  # Create a comment object and save it to the DB
  comment = Comment.new
  comment.content = params[:comment_content]
  comment.created_at = Time.now
  user.comments << comment
  revision.comments << comment
  comment.save
  comment_data = Hash.new
  comment_data['name'] = user['name']
  comment_data['content'] = comment['content']
  comment_data['at_revision'] = revision['number']
  comment_data['created_at'] = comment['created_at']
  comment_json = comment_data.to_json
  # Send them back to the previous page
  # flash[:success] = "Your comment has been posted!"
  # redirect back
  Pusher["revision_#{params[:share_url]}_#{revision['id']}_comments"].trigger('new_comment_added', comment_json, params[:socket_id])
	content_type :json
  comment_json
end
#}}}

# /:share_url/campaign_approval_change
# {{{
post '/:share_url/campaign_approval_change' do
  session!
  # Let's get the current user, campaign, and revision
  checkUser(session['user_id'])
  user = User.get(session['user_id'])
  checkCampaign(params[:share_url])
  campaign = Campaign.first(:share_url => params[:share_url])
  approval = user.approvals.first(:campaign_id => campaign['id'], :user_id => user['id'])
  if approval['status'] != 0
    approval['status'] = 0
  else
    approval['status'] = 1
  end
  user.approvals << approval
  campaign.approvals << approval
  approval.save
  approval_message = Hash.new
  approval_message['user_id'] = session['user_id']
  approval_message['approval_status'] = approval['status']
  approval_message_json = approval_message.to_json
  Pusher["campaign_#{params[:share_url]}_approvals"].trigger('campaign_approval_changed', approval_message_json, params[:socket_id])
  # Serve some JSON
	content_type :json
	approval_message_json	
end
#}}}

# /:share_url/new_revision
# {{{
get '/:share_url/new_revision' do
  session!
  checkUser(session['user_id'])
  user = User.get(session['user_id'])
  checkOrganizer(session['user_id'])
  erubis :new_revision
end
#}}}

# /:share_url/new_revision POST
# {{{
post '/:share_url/new_revision' do
  # Let's create a new revision
  session!
  checkUser(session['user_id'])
  user = User.get(session['user_id'])
  checkOrganizer(session['user_id'])
  gb = Gibbon::API.new(user.mailchimpaccount['mc_api_key'])
  checkCampaign(params[:share_url])
  campaign = Campaign.first(:share_url => params[:share_url])
  revision_data = gb.campaignContent({:cid => campaign['cid'], :for_archive => 'false'})
  @campaign_data = gb.campaigns({:filters => {:campaign_id => campaign['cid'], :exact => 'true'}})
  @campaign_data_array = @campaign_data['data'][0]
  # Create a new revision so that we can put all the data in it.
  revision = Revision.new
  revision.subject = @campaign_data_array['subject']
  revision.html = revision_data['html']
  revision.number = campaign.revisions.count + 1
  revision.from_name = @campaign_data_array['from_name']
  revision.from_email = @campaign_data_array['from_email']
  revision.created_at = Time.now
  # Create the changelog entry for this revision
  revision.changelog = Changelog.new(:title => params[:title], :content => params[:content].gsub(/\n/, '<br>'), :created_at => Time.now)
  # Push the revision into it's corresponding campaign.
  revision.save
  campaign.revisions << revision

  # Now save the campaign
  campaign.save
  campaign.current_revision = campaign.revisions.last['id']
  campaign.save
  redirect "/campaign/#{params[:share_url]}/"
end
#}}}

#####################################################
# AUTHENTICATION STUFF

# /signup
#{{{
get '/signup/?' do
  # No session needed for signup route
  erubis :signup
end
#}}}

# /signup POST
# {{{
post '/signup/?' do
  # Let's create a new user and add him to the MailChimp account that the API key belongs to
  # But before, make sure that the user doesn't already exist!
  if !User.first(:email => params[:email])
    user = User.new
    user.name = params[:name]
    user.email = params[:email]
    user.is_organizer = 1
    user.created_at = Time.now
    gb = nil
    @account = nil
    begin
      gb = Gibbon::API.new(params[:api_key])
      @account = gb.getAccountDetails()
    rescue => msg
      #do something in the exceptional case here
      flash[:error] = "Your API key is not valid!"
      redirect '/signup'
    end

    if (!@account['error'])
      mailchimpaccount = Mailchimpaccount.new(:mc_username => @account['username'], :mc_user_id => @account['user_id'], :mc_api_key => params[:api_key], :created_at => Time.now, :updated_at => Time.now)
      mailchimpaccount.users << user
      mailchimpaccount.save
      if user.valid?
        # Let's log them in after the account has been created
        session_start!
        session['user_id'] = user['id']
        session['mailchimpaccount_id'] = user.mailchimpaccount['id']
        flash[:success] = "Whoo hoo! You are ready to use On Stage!"
        redirect "/dashboard"
      else
        @errors = user.errors
        @errors[:mailchimpaccount_id] = '["Your MailChimp API Key is required!"]'
        flash[:error] = "Your MailChimp API key is required!"
        erubis :signup
      end
    else
      @errors = Array.new
      @errors.push('["Your MailChimp API Key is invalid!"]')
      flash[:error] = "Your MailChimp API Key is required!"
      erubis :signup
    end
  else
    if params[:email]
      flash[:error] = "This email is already taken, sorry!"
    else
      flash[:error] = "Your email is required!"
      erubis :signup
    end
  end
end

#}}}

# /login
# {{{
get '/login/?' do
  if session?
    redirect "/dashboard"
  else
    erubis :login
  end
end
#}}}

# /login POST
# {{{
post '/login/?' do
  if User.first(:email => params[:email])
    if user = User.first(:email => params[:email])
      if user.mailchimpaccount['mc_api_key'] == params[:api_key] and !user.is_organizer.nil?
        #save a cookie with an authorization string
        session_start!
        session['user_id'] = user['id']
        session['mailchimpaccount_id'] = user.mailchimpaccount['id']
        user.save
        flash[:success] = "Welcome to On Stage!"
        redirect "/save_campaigns"
      else
        #wrong password, gtfo
        flash[:error] = "Your credentials were not right."
        redirect "/login"
      end
    end
  else
    #no user by that email, gtfo
    flash[:error] = "Your credentials were not right."
    redirect "/login"
  end

end
#}}}

# /campaign/:share_url/register
# {{{
get "/campaign/:share_url/register" do 
  if session?
    redirect "/campaign/#{params[:share_url]}/"
  else
    erubis :register_commenter
  end
end
#}}}

# /campaign/:share_url/register POST
# {{{
post "/campaign/:share_url/register" do 
  if session?
    redirect "/campaign/#{params[:share_url]}/"
  else
    if User.first(:email => params[:email])
      checkUser(session['user_id'])
      user = User.first(:email => params[:email])
      session_start!
      session['user_id'] = user['id']
      session['mailchimpaccount_id'] = user.mailchimpaccount['id']
      flash[:success] = "Welcome #{user['name']}, you're ready to start commenting!"
      redirect "/campaign/#{params[:share_url]}/"
    else
      user = User.new
      user.name = params[:name]
      user.email = params[:email]
      user.is_organizer = nil
      user.created_at = Time.now
      user.updated_at = Time.now
      user.save
      campaign_id = Campaign.first(:share_url => params[:share_url])['mailchimpaccount_id']
      mailchimpaccount = Mailchimpaccount.first(:id => campaign_id)
      mailchimpaccount.users << user
      mailchimpaccount.save
      session_start!
      session['user_id'] = user['id']
      session['mailchimpaccount_id'] = user.mailchimpaccount['id']
      flash[:success] = "Welcome back #{user['name']}, you're ready to start commenting!"
      redirect "/campaign/#{params[:share_url]}/"
    end
  end
end
#}}}

# /logout
# {{{
get '/logout' do
  session_end!
  redirect "/login"
end
#}}}

#####################################################
# ERROR STUFF

# /error
# {{{
get '/error' do
  erubis :error
end
#}}}
