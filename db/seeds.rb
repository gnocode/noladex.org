# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ :name => 'Chicago' }, { :name => 'Copenhagen' }])
#   Mayor.create(:name => 'Daley', :city => cities.first)


# categories: create build, organize, heal, teach

categories = []
  ["Create", "Build", "Organize", "Heal", "Teach"].each do | name |
	categories << Category.create(:name => name)
end

# missions
# 12 users

#dog_names = %W(Rover Fido WunderMut Scooby Lassie Spot Lucky Clifford Cujo Milo Blue K-9)

#dog_names.each do |name|
#  u = User.new(:name => name, :email => "#{name}@dog.com", :url_photo => 'http://placedog.com/300/300')
#  u.missions.build(:statement => "To be awesome", :category => categories.sample)
#  u.save!
#end