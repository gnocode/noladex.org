class UserSessionsController < ApplicationController

  before_filter :require_user, :only => :destroy

  def new
    @user_session = UserSession.new
  end

  def create
    @user_session = UserSession.new(params[:user_session])
    if @user_session.save
      redirect_to root_url
    else
      render :action => :new
    end
  end

  def destroy  
    @user_session = UserSession.find
    @user_session.destroy
    flash[:notice] = "Come back soon!"
    redirect_to root_url
  end

end