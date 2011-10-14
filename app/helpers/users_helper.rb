module UsersHelper
  def display_photo(avatar)
    #default for images that havent been converted over.
    width = height = 250
    style = ""

    unless avatar.width.blank? || avatar.height.blank?
      if avatar.width > avatar.height
        width = (avatar.width * 250) / avatar.height
        height = 250
        style = 'left: -' + ((width-250)/2).to_s  + 'px;'
      else
        height = (avatar.height * 250) / avatar.width
        width = 250
        style = 'top: -' + ((height-250)/2).to_s  + 'px;'
      end
    end
    return image_tag avatar.url, {:width => width, :height => height, :style => style}
  end
end
