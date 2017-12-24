require_relative 'appdocs_homepage.rb'
class AppDocumentationADK < SitePrism::Page 
  set_url 'documentation/#/adk/index'
  set_url_matcher Regexp.new("documentation/#/adk/index")

  section :frame, DocumentationFrame, ".adk"
end
