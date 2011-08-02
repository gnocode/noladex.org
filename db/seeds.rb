# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ :name => 'Chicago' }, { :name => 'Copenhagen' }])
#   Mayor.create(:name => 'Daley', :city => cities.first)

categories = []
  ["Create", "Build", "Organize", "Heal", "Teach"].each do | name |
	categories << Category.create(:name => name)
end

300.times do |idx|
  user = User.new(:password => 'secret', :name => "User #{idx + 1}", :email => "user#{idx}@noladex.org", :avatar => File.open(File.join(Rails.root, 'db', 'fixtures', 'kitten.jpeg')))
  3.times do |mdx|
    user.missions << Mission.new(:statement => 'mission statements ...', :category_id => rand(5) + 1)
  end
  user.url1 = "@user#{idx + 1}"
  user.url2 = "http://www.user#{idx + 1}.com"
  user.url3 = "http://wwww.facebook.com/user#{idx + 1}"
  user.save!
end