class AddOpendIdUrlToUser < ActiveRecord::Migration
  def self.up
    add_column :users, :openid_url, :string
  end

  def self.down
    remove_column :users, :openid_url
  end
end
