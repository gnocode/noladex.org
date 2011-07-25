module AuthenticationHelper
  def signed_in?
    !session[:user_id].nil?
  end

  def current_user
    @current_user ||= User.find(session[:user_id])
  end

  def ensure_signed_in
    unless signed_in?
      session[:redirect_to] = request.fullpath
      redirect_to(new_session_path)
    end
  end
end
