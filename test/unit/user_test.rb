require 'test_helper'

class UserTest < ActiveSupport::TestCase
  setup do
    @user = users(:gob)
  end

  test "with no missions is invalid" do
    @user.missions = []

    assert !@user.valid?
  end

  test "url1 removes the @" do
    @user.url1 = '@gob'
    @user.save!

    assert @user.url1 == 'gob'
  end

  test "url1 removes the twitter url" do
    @user.url1 = 'https://twitter.com/#!/franklin'
    @user.save

    assert @user.url1 == 'franklin'
  end

  test "urls should have http:// unless specified" do
    @user.url2 = 'example.com'
    @user.url3 = 'http://somethingelse.com'
    @user.save

    assert @user.url2 == 'http://example.com'
    assert @user.url3 == 'http://somethingelse.com'
  end

  test "urls should not add http:// or mailto: if it's already specified" do
    @user.url2 = 'mailto:gob@example.com'
    @user.url3 = 'http://whatever.com'
    @user.save

    assert @user.url2 == 'mailto:gob@example.com'
    assert @user.url3 == 'http://whatever.com'
  end

  test "if a url is blank, do not add http://" do
    @user.url2 = ''
    @user.save

    assert @user.url2.blank?
    assert @user.url3.blank?
  end
end
