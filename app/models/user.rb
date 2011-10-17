class User < ActiveRecord::Base

  acts_as_authentic do |c|
    c.login_field :email 
    c.require_password_confirmation = false
  end
  
  has_many :missions
  has_attached_file :avatar, {
    :styles => { :medium => "250x250#" },
    :storage => Rails.env.production? ? :s3 : :filesystem,
    :bucket => 'noladex.org', 
    :s3_credentials => {
      :access_key_id => ENV['S3_KEY'],
      :secret_access_key => ENV['S3_SECRET']
    }
  }

  email_regex = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i

  validates :name,  :presence => true,
            :length   => { :maximum => 50 }

  validates :email, :presence => true,
            :format   => { :with => email_regex },
            :uniqueness => { :case_sensitive => false }
    
  validates :password,  :presence   => true,
              :confirmation   => true,
              :length     => { :within => 6..20 }

  validates :avatar_file_name, :presence => true
  
  validates :missions, :length => { :minimum => Constants::MinimumMissions, :message => "You must have at least one mission to be listed."}

  validates_attachment_size :avatar, :less_than=>700.kilobytes, 
                    :if => Proc.new { |imports| !imports.avatar_file_name.blank? }

  before_save :format_urls

  accepts_nested_attributes_for :missions, :reject_if => proc {|attributes| attributes['statement'].blank? }

  searchable do
    text :name 
    text :missions do
      missions.map { |mission| mission.statement }
    end
  end

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
    self.url2 = "http://#{url2}" if !url2.blank? && !url2.match(%r{^(https?://|mailto:)})
    self.url3 = "http://#{url3}" if !url3.blank? && !url3.match(%r{^(https?://|mailto:)})
  end
end
