require 'test_helper'

class CategoryTest < ActiveSupport::TestCase
  should validate_uniqueness_of :name
end
