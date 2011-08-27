class ApplicationController < ActionController::Base

  protect_from_forgery
  include AuthenticationHelper

  helper_method :current_user_session, :current_user

  private
  
  def current_user_session  
    return @current_user_session if defined?(@current_user_session)  
    @current_user_session = UserSession.find  
  end  

  def current_user  
    @current_user = current_user_session && current_user_session.record  
  end  

  def require_user
    unless current_user
      store_location
      flash[:notice] = "You must be logged in to access this page"
      redirect_to new_user_session_url
      return false
    end
  end

  def store_location
    session[:return_to] = request.fullpath
  end

  def redirect_back_or_default(default)
    redirect_to(session[:return_to] || default)
    session[:return_to] = nil
  end  
end
