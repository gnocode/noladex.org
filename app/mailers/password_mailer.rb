class PasswordMailer < ActionMailer::Base
  default :from => "reply@noladex.com"
  
  def password_reset(email, token)
    @password_token = token
    @host = (Rails.env.development? || Rails.env.test?) ? Noladex::Application.config.mailer_host : "http://www.noladex.org"
    mail(:to => email, :subject => "You forgot your noladex password...")
  end
end