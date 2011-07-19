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
  
	validates_presence_of :name, :email, :avatar_file_name
	validates :missions, :length => { :minimum => MINIMUM_MISSIONS, :message => "You must have at least one mission to be listed."}
	validates_format_of :email, :with => /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i
	
	def self.find_by_category(category_id)
	  includes(:missions => :category).where(["categories.id = ?", category_id])
	end
end
