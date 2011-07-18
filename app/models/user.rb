class User < ActiveRecord::Base
  MINIMUM_MISSIONS = 1
  AVATAR_S3_BUCKET = 'noladex.org'
	has_many :missions
	
	accepts_nested_attributes_for :missions
  
  def self.avatar_options
    {:styles => { :medium => "400x400>" },
     :storage => Rails.env.production? ? :s3 : :filesystem,
     :bucket => AVATAR_S3_BUCKET,
     :s3_credentials => {
       :access_key_id => ENV['S3_KEY'],
       :secret_access_key => ENV['S3_SECRET']
     }}
  end
  
  has_attached_file :avatar, avatar_options
  
	validates_presence_of :name, :email
	validates :missions, :length => { :minimum => MINIMUM_MISSIONS }
end
