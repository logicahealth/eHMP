class MenuSection < SitePrism::Section
  element :fld_screen_name, '#screenName'
  element :fld_filter_workspaces, "#dropdownSearchElement"
  elements :fld_workspace_links, ".workspace-navigation-link"
  element :btn_workspace_select, ".workspace-dropdown-button"
  element :context_name, ".context-name"
  element :btn_cog_wheel, "[data-original-title='Workspace Options']"
  element :btn_workspace_manager_option, "[class^='workspace-manager-option']"
  element :btn_workspace_editor_option, "[class^='workspace-editor-option']"

  def workspace_links_by_name(input_text)
    upper = input_text.upcase
    lower = input_text.downcase

    path =  "//a[contains(@class, 'workspace-navigation-link') and contains(string(), '#{input_text}')]"
    p path
    self.class.elements :fld_named_workspace, :xpath, path 
    self.class.elements :fld_named_workspace_sr, :xpath, "#{path}/span[contains(@class, 'sr-only')]"
    return fld_named_workspace
  end
end
