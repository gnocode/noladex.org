require 'test_helper'

class UserTest < ActiveSupport::TestCase
  test "with no missions is invalid" do
  	u = valid_user
  	u.missions = []
  	debugger
    
    assert !u.valid?
  end
  
  def valid_user
    u = User.new(:name => 'asdf', :email => 'lkjl', :url_photo => 'sadf')
    
    c = Category.create!(:name => 'Heal')
    
    User::MINIMUM_MISSIONS.times do
      u.missions.build(:statement => 'derp derp derp', :category => c)
    end
    
    raise "User setup in tests is invalid: #{u.errors}" if !u.valid?
    u
  end
end
