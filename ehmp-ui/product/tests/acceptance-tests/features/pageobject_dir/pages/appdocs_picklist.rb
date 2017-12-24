class AppDocumentationPicklist < SitePrism::Page 
  set_url 'resource/write-pick-list/docs/vx-api'
  set_url_matcher Regexp.new("resource/write-pick-list/docs/vx-api")

  element :title, ".content header h1"
  elements :navigation, ".resource-group"
end
