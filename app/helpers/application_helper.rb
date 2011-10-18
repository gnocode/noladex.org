module ApplicationHelper
  def pageless(total_pages, url=nil, category=nil, container=nil)
    if category
      url = url+"?category="+category
    end
    
    opts = {
      :totalPages => total_pages,
      :url        => url,
      :distance   => 300,
      :loaderMsg  => ''
    }
    
    container && opts[:container] ||= container
    
    javascript_tag("$('#people').pageless(#{opts.to_json});")
  end
end