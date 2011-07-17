class Category < ActiveRecord::Base
	has_many :missions
	
	validates :name, :uniqueness => true
end
