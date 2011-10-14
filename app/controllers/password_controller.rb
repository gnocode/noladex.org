class PasswordController < ApplicationController

  def create
    user = User.find_by_email(params[:password][:email])
    if user
      PasswordMailer.password_reset(params[:password][:email], user.perishable_token).deliver
      redirect_to root_url, :notice => 'Check your email for password instructions.'
    else
      # Don't alert the requesting user to the fact that an email does or does not exist ...
      redirect_to root_url
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
      redirect_to root_url, :notice => 'Your password has been changed ...'
    else
      redirect_to root_url, :error => 'Your password has been changed ...'
    end    
  end

end