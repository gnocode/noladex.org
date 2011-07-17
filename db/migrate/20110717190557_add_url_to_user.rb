class AddUrlToUser < ActiveRecord::Migration
  def self.up
  	add_column    :users, :url1, :string	
  	add_column    :users, :url2, :string	
  	add_column    :users, :url3, :string	  	  	  	
  end

  def self.down
  	remove_column :users, :url1
  	remove_column :users, :url2
  	remove_column :users, :url3
  end
end
