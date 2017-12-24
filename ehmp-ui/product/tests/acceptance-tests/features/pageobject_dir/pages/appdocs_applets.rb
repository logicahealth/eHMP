require_relative 'appdocs_homepage.rb'
class AppDocumentationApplets < SitePrism::Page 
  set_url 'documentation/#/ui/applets/README'
  set_url_matcher Regexp.new("documentation/#/ui/applets/README")

  section :frame, DocumentationFrame, ".ui"
  elements :nav_links, "#main-navbar .navbar-right > li > a"
end
