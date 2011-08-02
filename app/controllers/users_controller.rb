class UsersController < ApplicationController

  before_filter :require_user, :only => [:edit, :update, :destroy]

  def index
    displayed_user_ids = params[:selected].blank? ? [] : params[:selected].split(',')
    @number_of_users, @users = User.get_page(displayed_user_ids, params[:category])
    if request.xhr?
      render :partial => @users and return
    else
      respond_to do |format|
        format.html
        format.js
        format.xml  { render :xml => @users }
      end        
    end
  end

  def new
    @user = User.new
    3.times { @user.missions.build }

    respond_to do |format|
      format.html
      format.xml  { render :xml => @user }
    end
  end

  def edit
    @user = current_user
    (3-@user.missions.size).times { @user.missions.build }
  end

  def create
    @user = User.new(params[:user])

    respond_to do |format|
      if @user.save
        format.html { redirect_to(root_url, :notice => 'Thank you for registering at NOLADEX!') }
        format.xml  { render :xml => @user, :status => :created, :location => @user }
      else
        (3-@user.missions.size).times { @user.missions.build }

        format.html { render :action => "new" }
        format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
      end
    end
  end

  def update
    respond_to do |format|
      @user = current_user
      if @user.update_attributes(params[:user])
        format.html { redirect_to(root_url, :notice => 'User was successfully updated.') }
        format.xml  { head :ok }
      else
        p @user.errors
        format.html { render :action => "edit" }
        format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
      end
    end
  end

end
