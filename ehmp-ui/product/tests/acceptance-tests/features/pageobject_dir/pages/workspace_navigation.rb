class MenuSection < SitePrism::Section
  element :fld_screen_name, '#screenName'
  element :fld_filter_workspaces, "#dropdownSearchElement"
  elements :fld_workspace_links, ".workspace-navigation-link"
  element :btn_workspace_select, ".workspace-dropdown-button"

  def workspace_links_by_name(input_text)
    upper = input_text.upcase
    lower = input_text.downcase

    path =  "//a[contains(@class, 'workspace-navigation-link') and contains(string(), '#{input_text}')]"
    self.class.elements :fld_named_workspace, :xpath, path 
    return fld_named_workspace
  end
end
