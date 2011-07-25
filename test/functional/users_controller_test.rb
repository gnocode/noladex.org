require 'test_helper'

class UsersControllerTest < ActionController::TestCase
  setup :activate_authlogic

  setup do
    @user = users(:gob)
    @other_user = users(:michael)
  end

  context "A user not logged in" do
    should "be able to access the index" do
      get :index
      assert_response :success
      assert_not_nil assigns(:users)
    end

    should "be able to signup" do
      get :new
      assert_response :success
    end

    should "be able to create a new user" do
      assert_difference('User.count') do
        post :create, :user => new_user
      end

      assert_redirected_to root_path
    end

    should "not be able to edit a user" do
      get :edit, :id => @user.to_param
      assert_response :redirect
    end
  end

  context "A logged in user" do
    setup do
      UserSession.create(@user)
    end
    
    should "be able to access the index" do
      get :index
      assert_response :success
      assert_not_nil assigns(:users)
    end

    should "be able to signup" do
      get :new
      assert_response :success
    end

    should "be able to create a new user" do
      assert_difference('User.count') do
        post :create, :user => new_user
      end

      assert_redirected_to root_path
    end

    should "be able to access his own information" do
      # TODO test that it cant edit another user
      get :edit, :id => @user.to_param
      assert_response :success
    end

    should "be able to update his own information" do
      put :update, :id => @user.to_param, :user => @user.attributes
      assert_redirected_to root_path
    end
    
    should "be not able to update another's information" do
      # UPDATE should only run for the current_user
      put :update, :id => @other_user.to_param, :user => {:email => "test@test.com"}
      assert @user.email = "test@test.com"
      assert @other_user.email == "michael@example.com"
      assert_redirected_to root_path
    end
  end

  def new_user
    {
      :name                => "Tobias Funke", 
      :email               => "tobias@funke.com", 
      :password            => "nevernude", 
      :avatar_file_name    => 'guy.png', 
      :url1                => 'guy',
      :missions_attributes => {"0" =>
        {
          :category_id   => 1, 
          :statement     => "stuff"
        }
      }
    }
  end
end
