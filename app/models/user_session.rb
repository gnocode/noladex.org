class UserSession < Authlogic::Session::Base

  logout_on_timeout true
  
  def to_key
    id ? id : nil
  end
  
end