class AddMetaToAvatars < ActiveRecord::Migration
  def self.up
    add_column :users, :avatar_meta,    :text
  end

  def self.down
    remove_column :users, :avatar_meta
  end
end
