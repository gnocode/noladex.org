class PasswordMailer < ActionMailer::Base
  default :from => "reply@noladex.com"
  
  def password_reset(email, token)
    @password_token = token
    @host = Noladex::Application.config.mailer_host
    mail(:to => email, :subject => "You forgot your noladex password...")
  end
end
