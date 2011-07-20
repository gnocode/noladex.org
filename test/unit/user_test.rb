require 'test_helper'

class UserTest < ActiveSupport::TestCase
  setup do
    @user = users(:gob)
  end

  test "with no missions is invalid" do
    @user.missions = []

    assert !@user.valid?
  end
end
