class PobWorkspaceManager < SitePrism::Page
  element :fld_applet, ".workspaceManager-applet"
  element :fld_workspace_manager_title, "#workspaceManagerHeading"
  elements :fld_all_screens, ".workspace-table .tableRow"
  elements :fld_predefined_screens, '.predefined-screen-row'
  elements :fld_predefined_screens_delete_icons, :xpath, "//*[contains(@class, 'fa-lock')]/ancestor::*[contains(@class, 'predefined-screen-row')]"
  elements :fld_editable_titles, :xpath, "//form[contains(@class, 'editor-title')]/ancestor::div[contains(@class, 'tableRow')]"
  elements :fld_editable_descriptions, :xpath, "//form[contains(@class, 'editor-description')]/ancestor::div[contains(@class, 'tableRow')]"
  elements :fld_predefined_titles, ".workspaceTable .predefined-screen-row .editor-title span"
  elements :fld_udw_titles, ".workspaceTable .user-defined .editor-title input"
  elements :fld_predefined_desc, ".workspaceTable .predefined-screen-row div:nth-child(5)"
  elements :fld_udw_desc, ".workspaceTable .user-defined .editor-description input"
  elements :fld_all_problem_results, ".problem-result"

  element :btn_toggle_filter, '#gridFilterButtonWorkspaceManager'
  element :btn_add_workspace, '.addScreen'
  element :btn_close_manager, '.panel-heading .done-editing'
  element :fld_filter_screens, '#searchScreens'

  def predefined_screens_ids
    fld_predefined_screens.map { |screen| screen['data-screen-id'] }
  end

  def predefined_screen_delete_icons_ids
    fld_predefined_screens_delete_icons.map { |screen| screen['data-screen-id'] }
  end

  def screens_with_editable_titles
    fld_editable_titles.map { |screen| screen['data-screen-id'] }
  end

  def screens_with_editable_descriptions
    fld_editable_descriptions.map { |screen| screen['data-screen-id'] }
  end

  def all_titles
    predefined_map = fld_predefined_titles.map { | screen | screen.text }
    udw_map = fld_udw_titles.map { | screen | screen['value'] }
    all_map = predefined_map + udw_map
    all_map
  end

  def all_descriptions
    predefined_desc_map = fld_predefined_desc.map { | screen | screen.text }
    user_defined_workspace_desc_map = fld_udw_desc.map { | screen | screen['value'] }
    all_map = predefined_desc_map + user_defined_workspace_desc_map
    all_map
  end

  def add_launch_btn(workspace_id)
    self.class.element(:btn_launch, "[data-screen-id='#{workspace_id}'] .launch-screen")
  end

  def add_user_defined_workspace_elements(user_defined_workspace_id)
    self.class.element :btn_udw_preview, "[data-screen-id='#{user_defined_workspace_id}'] div:nth-child(9) button"
    self.class.element(:btn_clone, "[data-screen-id='#{user_defined_workspace_id}'] .duplicate-worksheet")
    self.class.element(:btn_customize, "[data-screen-id='#{user_defined_workspace_id}'] .customize-screen")
    add_launch_btn user_defined_workspace_id
  end

  def clone_workspace(workspace_id)
    add_user_defined_workspace_elements workspace_id
    wait_until_btn_clone_visible
    btn_clone.click
    true
  rescue => e
    p "#{e}: '#{workspace_id}'"
    false 
  end

  def customize_workspace(workspace_id)
    add_user_defined_workspace_elements workspace_id
    wait_until_btn_customize_visible
    btn_customize.click
    true
  rescue => e
    p "#{e}: '#{workspace_id}'"
    false 
  end

  def launch_workspace(workspace_id)
    add_launch_btn workspace_id
    wait_until_btn_launch_visible
    btn_launch.click
    true
  rescue => e
    p "#{e}: '#{workspace_id}'"
    false 
  end

  def toggle_filter_open
    unless has_fld_filter_screens? && fld_filter_screens.visible?
      btn_toggle_filter.click
      wait_for_fld_filter_screens
      wait_until_fld_filter_screens_visible
    end
  end
end
