class User < ActiveRecord::Base

  acts_as_authentic do |c|
    c.login_field :email 
    c.require_password_confirmation = false
  end

  has_many :missions
  has_attached_file :avatar, {
    :styles => { :medium => "300x300#" },
    :storage => Rails.env.production? ? :s3 : :filesystem,
    :bucket => 'noladex.org', 
    :s3_credentials => {
      :access_key_id => ENV['S3_KEY'],
      :secret_access_key => ENV['S3_SECRET']
    }
  }

  validates_presence_of :name, :email, :avatar_file_name
  validates_format_of :email, :with => /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i
  
  validates :missions, :length => { :minimum => Constants::MinimumMissions, :message => "You must have at least one mission to be listed."}
  validate :avatar_size

  before_save :format_urls

  accepts_nested_attributes_for :missions, :reject_if => proc {|attributes| attributes['statement'].blank? }

  def self.find_by_category(category_id)
    includes(:missions => :category).where(["categories.id = ?", category_id])
  end

  private

  def avatar_size
    temp_file = avatar.queued_for_write[:original] #get the file that is being uploaded
    if (temp_file) 
      dimensions = Paperclip::Geometry.from_file(temp_file)
      if (dimensions.width < Constants::ImageWidth) || (dimensions.height < Constants::ImageHeight)
        errors.add("photo_size", "must be image size #{Constants::ImageWidth}x#{Constants::ImageHeight}.")
      end
    end
  end

  def format_urls
    self.url1 = url1.gsub(%r{(^https?://twitter.com/(#!/)?|@)}, '') unless url1.blank?
    self.url2 = "http://#{url2}" if !url2.blank? && !url2.match(%r{^https?://})
    self.url3 = "http://#{url3}" if !url3.blank? && !url3.match(%r{^https?://})
  end
end
