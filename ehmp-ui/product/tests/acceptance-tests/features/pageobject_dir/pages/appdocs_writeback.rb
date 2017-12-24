class AppDocumentationWriteback < SitePrism::Page 
  set_url 'resource/write-health-data/docs/vx-api'
  set_url_matcher Regexp.new("resource/write-health-data/docs/vx-api")

  element :title, ".content header h1"
  elements :navigation, ".resource-group"
end
