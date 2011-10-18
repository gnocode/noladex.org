class Mission < ActiveRecord::Base
	belongs_to :user 
	belongs_to :category

  validates :statement, :presence => true,
                        :length   => { :maximum => 50 }
end
