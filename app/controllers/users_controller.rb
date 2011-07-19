class UsersController < ApplicationController
  # GET /users
  # GET /users.xml
  def index
    if params[:category]
      @users = User.find_by_category(params[:category]).shuffle 
    else
      @users = User.includes(:missions => :category).all.shuffle  
    end

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @users }
    end
  end

  # GET /users/1
  # GET /users/1.xml
  def show
    @user = User.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @user }
    end
  end

  # GET /users/new
  # GET /users/new.xml
  def new
    @user = User.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @user }
    end
  end

  # GET /users/1/edit
  def edit
    @user = User.find(params[:id])
  end

  # POST /users
  # POST /users.xml
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
        format.html { redirect_to(@user, :notice => 'Thank you for registering at NOLADEX!') }
        format.xml  { render :xml => @user, :status => :created, :location => @user }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /users/1
  # PUT /users/1.xml
  def update
    @user = User.find(params[:id])

    respond_to do |format|
      if @user.update_attributes(params[:user])
        format.html { redirect_to(@user, :notice => 'User was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /users/1
  # DELETE /users/1.xml
  def destroy
    @user = User.find(params[:id])
    @user.destroy

    respond_to do |format|
      format.html { redirect_to(users_url) }
      format.xml  { head :ok }
    end
  end
end
