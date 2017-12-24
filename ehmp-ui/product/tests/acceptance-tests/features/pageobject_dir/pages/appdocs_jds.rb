class AppDocumentationJds < SitePrism::Page 
  set_url 'resource/docs/vx-api/jds'
  set_url_matcher Regexp.new("resource/docs/vx-api/jds")

  element :title, ".content header h1"
  elements :navigation, ".resource-group"
end
