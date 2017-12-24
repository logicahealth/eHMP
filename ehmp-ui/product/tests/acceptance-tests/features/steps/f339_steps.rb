class WorkspaceActions
  extend ::RSpec::Matchers

  def self.workspace_manager_displayed
    wait = Selenium::WebDriver::Wait.new(:timeout => 15)
    @ehmp = PobWorkspaceManager.new
    @ehmp.wait_for_fld_workspace_manager_title
    expect(@ehmp.has_fld_workspace_manager_title?).to eq(true)
    wait_for_jquery_to_return
    wait.until { @ehmp.fld_all_screens.length > 0 }
    wait_for_screen_clear
  end

  def self.workspace_editor_displayed
    page = WorkspaceEditor.new
    page.wait_for_editor_window
    page.wait_for_window_title
    page.wait_for_btn_accept
    page.wait_for_fld_applet_carousel
    page.wait_for_fld_visual_boundary

    expect(page).to have_editor_window
    expect(page).to have_window_title
    expect(page).to have_btn_accept
    expect(page).to have_fld_applet_carousel
    expect(page).to have_fld_visual_boundary
  end

  def self.perform_udw_delete(screenid)
    p "deleting udw #{screenid}"
    manager = PobWorkspaceManager.new
    manager.add_user_defined_workspace_elements screenid
    expect(manager).to have_btn_delete
    manager.btn_delete.click

    alert = PobAlert.new
    expect(alert.wait_for_btn_delete).to eq(true)
    alert.btn_delete.click
    begin
      alert.wait_until_btn_delete_invisible
      true
    rescue Exception => e
      p "Error deleting UDW: #{e}"
      false
    end
  end

  def self.delete_first_udw
    manager = PobWorkspaceManager.new
    first_uwd = manager.fld_userdefined_screens.first
    return perform_udw_delete first_uwd['data-screen-id']
  end

  def open_workspace_management_applet
    p "open_workspace_management_applet"
    manager = PobWorkspaceManager.new
    @ehmp = PobCommonElements.new
    expect(@ehmp.has_btn_workspace_manager?).to eq(true)
    @ehmp.btn_workspace_manager.click

    manager.wait_for_fld_applet
    expect(manager).to have_fld_applet
  end
end

When(/^the Workspace Manager is displayed$/) do
  WorkspaceActions.workspace_manager_displayed
end

When(/^the predefined screens have a visual indicator indicating they are locked$/) do |table|
  page = PobWorkspaceManager.new
  page.wait_for_fld_predefined_screens
  table.rows.each do | label, value |
    page.add_predefined_workspace(value)
    expect(page).to have_predefined_row, "Did not find a row for #{label}"
    expect(page).to have_predefined_delete_lock, "Did not find lock for #{label}"
  end
end

When(/^the user creates a user defined workspace$/) do
  manager = PobWorkspaceManager.new
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)

  num_user_defined_workspace = manager.fld_userdefined_screens.length
  manager.wait_for_btn_add_workspace
  expect(manager).to have_btn_add_workspace
  manager.btn_add_workspace.click
  wait.until { manager.fld_userdefined_screens.length > num_user_defined_workspace }
  new_num_user_defined_workspace = manager.fld_userdefined_screens.length
  expect(num_user_defined_workspace + 1).to eq(new_num_user_defined_workspace), 'New workspace was not added'
end

Then(/^the new user defined workspace title edit box has focus$/) do
  page = PobWorkspaceManager.new
  driver = TestSupport.driver

  page.add_user_defined_workspace_elements(PobWorkspaceManager.default_new_uwd)
  page.wait_for_input_title
  expect(page).to have_input_title
  expect(driver.switch_to.active_element).to eq(page.input_title.native)
end

When(/^the user removes the content in the title field$/) do
  page = PobWorkspaceManager.new

  page.add_user_defined_workspace_elements(PobWorkspaceManager.default_new_uwd)
  page.wait_for_input_title
  expect(page).to have_input_title

  page.input_title.native.send_keys [:end]
  page.input_title.native.send_keys [:shift, :home], :backspace
end

Then(/^an icon displays indicating a required field$/) do
  page = PobWorkspaceManager.new
  page.add_user_defined_workspace_elements(PobWorkspaceManager.default_new_uwd)
  page.wait_for_required_astrik
  expect(page).to have_required_astrik
end

When(/^the user attempts to delete the user defined workspace named "(.*?)"$/) do |element_id|
  p "delete workspace #{element_id}"
  page = PobWorkspaceManager.new
  page.add_user_defined_workspace_elements element_id
  expect(page).to have_btn_delete
  page.btn_delete.click
end

When(/^the user chooses to cancel the Delete Workspace action$/) do
  alert = PobAlert.new
  alert.wait_for_btn_cancel
  expect(alert).to have_btn_cancel
  alert.btn_cancel.click
end

Then(/^the alert closes$/) do
  alert = PobAlert.new
  alert.wait_until_mdl_alert_title_invisible
end

When(/^the user chooses to complete the Delete Workspace action$/) do
  alert = PobAlert.new
  expect(alert).to have_btn_delete
  alert.btn_delete.click
  wait_for_screen_clear
end

Then(/^the user defined workspace named "(.*?)" is not listed$/) do |arg1|
  page = PobWorkspaceManager.new
  all_screens = page.fld_all_screens
  all_data_screen_ids = all_screens.map { |element| element['data-screen-id'] }
  expect(all_data_screen_ids).to_not include arg1
  expect(page.all_titles).to_not include arg1
end

When(/^the user creates a user defined workspace and sets the title to a string of length 30$/) do
  title = "aaaaabbbbbaaaaabbbbbaaaaabbbbb"
  expect(title.length).to eq(30)
  @title = title

  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  page = PobWorkspaceManager.new

  num_user_defined_workspace = page.fld_userdefined_screens.length
  expect(page.wait_for_btn_add_workspace).to eq(true)
  page.btn_add_workspace.click
  wait.until { page.fld_userdefined_screens.length > num_user_defined_workspace }
  new_num_user_defined_workspace = page.fld_userdefined_screens.length
  expect(num_user_defined_workspace + 1).to eq(new_num_user_defined_workspace), 'New workspace was not added'

  new_ws_id = page.fld_userdefined_screens.last['data-screen-id']
  page.add_user_defined_workspace_elements new_ws_id
  expect(page).to have_input_title
  page.input_title.native.send_keys [:shift, :home], :backspace
  page.input_title.native.send_keys @title
  page.input_title.native.send_keys :enter
  wait_for_screen_clear
end

Then(/^the user defined workspace name is listed$/) do
  expect(@title).to_not be_nil

  page = PobWorkspaceManager.new
  expect(page.screens_with_editable_titles).to include @title
end

Then(/^the user defined workspace data screen id "(.*?)" is listed$/) do |arg1|
  page = PobWorkspaceManager.new
  start_time = Time.now
  wait_for = 5
  all_data_screen_ids = []
  begin
    all_screens = page.fld_all_screens
    all_data_screen_ids = all_screens.map { |element| element['data-screen-id'] }
    expect(all_data_screen_ids).to include arg1
    p all_data_screen_ids.to_s
    wait_for_jquery_to_return
  rescue Exception => e
    retry if Time.now < start_time + wait_for
    p "failed: #{all_data_screen_ids}"
    raise e
  end
end

When(/^the user sets the "(.*?)" as the active workspace$/) do |arg1|
  page = PobWorkspaceManager.new
  expect(page.click_workspace_default(arg1)).to eq(true)
  p page.default_workspace['data-screen-id']
  expect(page.default_workspace['data-screen-id']).to eq(arg1)
end

Then(/^the workspace named "(.*?)" is the active workspace$/) do |arg1|
  page = PobWorkspaceManager.new

  p page.default_workspace['data-screen-id']
  expect(page.default_workspace['data-screen-id']).to eq(arg1)
end

Then(/^the title cannot be changed for predefined screens$/) do |table|
  @ehmp = PobWorkspaceManager.new
  screenids_with_editable_title = @ehmp.screens_with_editable_titles
  p screenids_with_editable_title
  table.rows.each do | row |
    expect(screenids_with_editable_title).not_to include(row[0])
  end
end

Then(/^the description cannot be changed for predefined screens$/) do |table|
  @ehmp = PobWorkspaceManager.new
  screens_with_editable_descriptions = @ehmp.screens_with_editable_descriptions
  p screens_with_editable_descriptions
  table.rows.each do | row |
    expect(screens_with_editable_descriptions).not_to include(row[0])
  end
end

Then(/^the delete icon is disabled for predefined screens$/) do |table|
  @ehmp = PobWorkspaceManager.new
  disabled_delete_icon_ids = @ehmp.predefined_screen_delete_icons_ids
  p disabled_delete_icon_ids
  table.rows.each do | row |
    expect(disabled_delete_icon_ids).to include(row[0])
  end
end

Then(/^an alert with the title "(.*?)" displays$/) do |title|
  @ehmp = PobAlert.new
  @ehmp.wait_until_mdl_alert_region_visible
  @ehmp.wait_until_mdl_alert_title_visible
  expect(@ehmp.mdl_alert_title.text.upcase).to have_text(title.upcase)
end

Then(/^the Workspace Manager displays a Close button$/) do
  @ehmp = PobWorkspaceManager.new unless @ehmp.is_a? PobWorkspaceManager
  expect(@ehmp.has_btn_close_manager?).to eq(true)
end

Then(/^the Workspace Manager displays an Add New button$/) do
  @ehmp = PobWorkspaceManager.new unless @ehmp.is_a? PobWorkspaceManager
  expect(@ehmp.has_btn_add_workspace?).to eq(true)
end

Then(/^the Workspace Manager displays a filter$/) do
  @ehmp = PobWorkspaceManager.new unless @ehmp.is_a? PobWorkspaceManager
  expect(@ehmp.has_btn_toggle_filter?).to eq(true)
end

When(/^the user chooses the option button for applet "([^"]*)" Allergies applet$/) do |id|
  @ehmp = UserDefinedWorkspace.new
  @ehmp.applet_built_from(id, 'allergy_grid')
  expect(@ehmp).to have_btn_options
  @ehmp.btn_options.click
  @ehmp.wait_until_fld_options_panel_visible
  expect(@ehmp).to have_fld_options_panel
end

When(/^the user opens the workspace select drop down menu$/) do
  @ehmp = PobOverView.new
  @ehmp.menu.wait_until_btn_workspace_select_visible
  @ehmp.menu.btn_workspace_select.click
  @ehmp.menu.wait_until_fld_filter_workspaces_visible
  expect(@ehmp.menu).to have_fld_filter_workspaces
end

When(/^filters the workspace select list on "([^"]*)"$/) do |workspace_name|
  @ehmp = PobOverView.new unless @ehmp.is_a? PobOverView
  expect(@ehmp.menu).to have_fld_filter_workspaces
  num_workspace_links = @ehmp.menu.fld_workspace_links.length
  expect(num_workspace_links).to be > 0
  @ehmp.menu.fld_filter_workspaces.set workspace_name
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  wait.until { @ehmp.menu.fld_workspace_links.length != num_workspace_links }
end

Then(/^the workspace select list is filtered on "([^"]*)"$/) do |input_text|
  @ehmp = PobOverView.new unless @ehmp.is_a? PobOverView
  expect(@ehmp.menu.fld_workspace_links.length).to eq(@ehmp.menu.workspace_links_by_name(input_text).length)
end

When(/^the user launches "([^"]*)" from the workspace manager$/) do |workspace_id|
  @ehmp = PobWorkspaceManager.new
  @ehmp.launch_workspace(workspace_id)
  @ehmp.wait_until_fld_workspace_manager_title_invisible
  expect(@ehmp).to_not have_fld_workspace_manager_title
end

Then(/^the urls contains "([^"]*)"$/) do |udw|
  @ehmp = UserDefinedWorkspace.new
  expect(@ehmp.current_url).to end_with "/#{udw}"
end

Then(/^the user closes the workspace manager to save workspace updates$/) do
  ehmp = PobWorkspaceManager.new
  ehmp.wait_for_btn_close_manager
  expect(ehmp).to have_btn_close_manager
  ehmp.btn_close_manager.click
  ehmp.wait_until_btn_close_manager_invisible
  expect(ehmp).to_not have_btn_close_manager
end

