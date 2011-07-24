class UsersController < ApplicationController

  before_filter :require_user, :only => [:edit, :update, :destroy]

  def index
    if params[:category]
      @users = User.find_by_category(params[:category]).shuffle
    else
      @users = User.includes(:missions => :category).all.shuffle
    end

    respond_to do |format|
      format.html
      format.js
      format.xml  { render :xml => @users }
    end
  end

  # def show
  #   @user = current_user
  # 
  #   respond_to do |format|
  #     format.html
  #     format.xml  { render :xml => @user }
  #   end
  # end

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

    #@user.missions.build :category => Category.find(params[:categories_1]), :statement => params[:mission_statement_1]

    if (!params[:mission_statement_1].blank?) then
      @user.missions.build :category => Category.find(params[:categories_1]), :statement => params[:mission_statement_1]  
    end    
    if (!params[:mission_statement_2].blank?) then
      @user.missions.build :category => Category.find(params[:categories_2]), :statement => params[:mission_statement_2]  
    end
    if (!params[:mission_statement_3].blank?) then
      @user.missions.build :category => Category.find(params[:categories_3]), :statement => params[:mission_statement_3]  
    end

    if @user.url1.include? '@'
      @user.url1.sub!('@', '')
    end

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
