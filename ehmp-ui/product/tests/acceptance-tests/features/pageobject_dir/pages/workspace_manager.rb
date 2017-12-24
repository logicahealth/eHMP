class PobWorkspaceManager < SitePrism::Page
  DELETE_COL = 8
  PREIVEW_COL = 9
  CUSTOMIZE_COL = 10
  LAUNCH_COL = 11
  element :fld_applet, ".workspaceManager-applet"

  # ******************** header elements ******************** #
  element :fld_workspace_manager_title, "#workspaceManagerHeading"
  element :btn_toggle_filter, '#gridFilterButtonWorkspaceManager'
  element :btn_add_workspace, '.addScreen'
  element :fld_obstruction,  '#obstructed-region .modal-backdrop'
  element :btn_close_manager, '.panel-heading .done-editing'
  element :fld_filter_screens, '#searchScreens'

  elements :fld_all_screens, ".workspace-table .tableRow"
  element :default_workspace, :xpath, "//i[contains(@class, 'madeDefault')]/ancestor::div[@data-screen-id]"
  element :error_message, "#workspace-growler-region .alert-danger"
  element :close_error_message, "#workspace-growler-region .close"

   # ******************** header elements ******************** #

  # ******************** predefined screens ******************** #
  elements :fld_predefined_screens, '.predefined-screen-row'
  predefined_css = '.workspace-table .predefined-screen-row' 
  elements :fld_predefined_titles, "#{predefined_css} .editor-title span"
  elements :fld_predefined_desc, "#{predefined_css} div:nth-child(5)"
  elements :fld_predefined_screens_delete_icons, :xpath, "//*[contains(@class, 'fa-lock')]/ancestor::*[contains(@class, 'predefined-screen-row')]"
  elements :fld_predefined_previews, "#{predefined_css} .previewWorkspace"
  elements :fld_predefined_launchs, "#{predefined_css} .launch-screen"
  # ******************** USER DEFINED SCREENS ******************** #
  udw_css = '.workspace-table .user-defined'
  elements :fld_userdefined_screens, udw_css
  elements :fld_editable_titles, :xpath, "//form[contains(@class, 'editor-title')]/ancestor::div[contains(@class, 'tableRow')]"
  elements :fld_editable_descriptions, :xpath, "//form[contains(@class, 'editor-description')]/ancestor::div[contains(@class, 'tableRow')]"
  elements :fld_udw_titles, "#{udw_css} .editor-title input"
  elements :fld_udw_desc, "#{udw_css} .editor-description input"

  # ******************** ASSOCIATE PROBLEMS ******************** #
  elements :fld_all_problem_results, ".problem-result"
  element :btn_close_associations, '#associationManagerCloseBtn'

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
    self.class.element(:btn_launch_disabled, "[data-screen-id='#{workspace_id}'] .launch-screen[disabled]")
  end

  def add_ciw_elements(user_defined_workspace_id)
    self.class.element :btn_associate, "[data-screen-id='#{user_defined_workspace_id}'] button.show-associations"
    self.class.element :fld_search_problems, "[data-screen-id='#{user_defined_workspace_id}'] #screenProblemSearch"
  end

  def add_user_defined_workspace_elements(user_defined_workspace_id)
    self.class.element :input_title, "[data-screen-id='#{user_defined_workspace_id}'] .editor-title-element"
    self.class.element :input_desc, "[data-screen-id='#{user_defined_workspace_id}'] .editor-description input"
    self.class.element :required_astrik, "[data-screen-id='#{user_defined_workspace_id}'] .fa-asterisk"
    self.class.element :btn_udw_preview, "[data-screen-id='#{user_defined_workspace_id}'] div:nth-child(9) button"
    self.class.element(:btn_clone, "[data-screen-id='#{user_defined_workspace_id}'] .duplicate-worksheet")
    self.class.element(:btn_customize, "[data-screen-id='#{user_defined_workspace_id}'] .customize-screen")
    self.class.element(:btn_delete, "[data-screen-id='#{user_defined_workspace_id}'] button.delete-worksheet")
    add_launch_btn user_defined_workspace_id
    add_ciw_elements user_defined_workspace_id
  end

  def add_predefined_workspace(predefined_workspace_id)
    self.class.element :predefined_row, "[data-screen-id=#{predefined_workspace_id}]"
    self.class.element :predefined_delete_lock, "[data-screen-id=#{predefined_workspace_id}] div.table-cell:nth-child(#{DELETE_COL}) i.fa-lock"
    self.class.element :predefined_customize_lock, "[data-screen-id=#{predefined_workspace_id}] div.table-cell:nth-child(#{CUSTOMIZE_COL}) i.fa-lock"
  end

  def click_workspace_default(workspace_id)
    self.class.element :set_default, "[data-screen-id=#{workspace_id}] .default-workspace-btn"
    wait_until_set_default_visible
    set_default.click
    true
  rescue => e
    p "#{e}: '#{workspace_id}'"
    false 
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

  def self.default_new_uwd(index = 1)
    "untitled-patient-workspace-#{index}"
  end

  def add_association_suggestion(title)
    self.class.element :fld_suggestion, ".tt-dropdown-menu [title='#{title}']"
    self.class.element :fld_associated_problem, :xpath, "//div[contains(@class, 'problem-list-region')]/descendant::div[contains(string(), '#{title}')]"
  end

  def acknowledge_error_message
    wait = Selenium::WebDriver::Wait.new(:timeout => 5)
    wait_for_close_error_message
    close_error_message.click
    wait.until { !has_close_error_message? }
  end
end
