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
get '/?' do
  # session!
  # erubis :new
  redirect "/users/new/"
end
#}}}

# /users/new
# {{{
get '/users/new/?' do
  # session!
  erubis :new
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
