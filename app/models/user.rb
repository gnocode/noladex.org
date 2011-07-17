class User < ActiveRecord::Base
  MINIMUM_MISSIONS = 1
	has_many :missions
	accepts_nested_attributes_for :missions
	
	has_attached_file :avatar, :styles => { :medium => "300x300>", :thumb => "100x100>" }
	
	validates_presence_of :name, :email
	validates :missions, :length => { :minimum => MINIMUM_MISSIONS }
end
