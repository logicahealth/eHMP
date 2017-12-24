require_relative 'appdocs_homepage.rb'
class AppDocumentationRDK < SitePrism::Page 
  set_url 'documentation/#/rdk/index'
  set_url_matcher Regexp.new("documentation/#/rdk/index")

  section :frame, DocumentationFrame, ".rdk"
end
