Noladex::Application.routes.draw do

  resource :user_session
  
  resources :missions

  resources :neighborhoods

  resources :tags

  resources :categories

  resources :users

  resources :password

  match 'logout', :controller => 'user_sessions', :action => 'destroy', :as => 'logout'
  match 'login', :controller => 'user_sessions', :action => 'new', :as => 'login'

  root :to => "users#index"
end
