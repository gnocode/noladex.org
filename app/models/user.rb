class User < ActiveRecord::Base
  MINIMUM_MISSIONS = 1
	has_many :missions
	
	validates_presence_of :name, :email, :url_photo
	validates :missions, :length => { :minimum => MINIMUM_MISSIONS }
end
