class PasswordController < ApplicationController

  def new
  end
  
  def index
  end

  def create
    user = User.find_by_email(params[:email])
    if user
      PasswordMailer.password_reset(params[:email], user.perishable_token).deliver
      redirect_to root_url, :notice => 'Check your email for password instructions ...'
    else
      # TODO :: Deal with this sensibly ...
    end
  end
  
  def show
  end

  def edit
    @user = User.find_by_perishable_token(params[:id])    
    redirect_to root_url unless @user
  end
  
  def update
    @user = User.find_by_perishable_token(params[:id])    
    redirect_to root_url unless @user
    @user.password = params[:user][:password]
    if @user.save!
      logger.debug "==============================="
      logger.debug @user.errors.inspect
      logger.debug "==============================="
      redirect_to root_url, :notice => 'Your password has been changed ...'
    else
      logger.debug "==============================="
      logger.debug @user.errors.inspect
      logger.debug "==============================="
      redirect_to root_url, :error => 'Your password has been changed ...'
    end    
  end

end