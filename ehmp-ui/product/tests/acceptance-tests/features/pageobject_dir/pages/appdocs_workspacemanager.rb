class AppDocMainContent < SitePrism::Page
  div_id = '#mainContent'
  p "#{div_id} h2"
  elements :h2, "#{div_id} h2"
  elements :h3, "#{div_id} h3"
  elements :h4, "#{div_id} h4"
end

class AppDocContext < AppDocMainContent
  set_url 'documentation/#/ui/contexts/'
  set_url_matcher Regexp.new('documentation/#/ui/contexts/')
end

class AppDocWorkspaceManager < AppDocMainContent
  set_url 'documentation/#/ui/applets/workspaceManager/'
  set_url_matcher Regexp.new("documentation/#/ui/applets/workspaceManager/")
end

class AppDocContextsAdmin < AppDocMainContent
  set_url 'documentation/#/ui/contexts/workspace/admin/'
  set_url_matcher 'documentation/#/ui/contexts/workspace/admin/'
end

class AppDocContextsStaff < AppDocMainContent
  set_url 'documentation/#/ui/contexts/workspace/staff/'
  set_url_matcher 'documentation/#/ui/contexts/workspace/staff/'
end
