class WorkspaceManager2 < AccessBrowserV2
  include Singleton
  def initialize
    super
    workspace_list = AccessHtmlElement.new(:css, 'div.workspace-table div.table-row')
    add_verify(CucumberLabel.new('Workspace List'), VerifyXpathCount.new(workspace_list), workspace_list)

    # Predefined workspaces
    add_predefinded_workspace('Coversheet', 'cover-sheet')
    add_predefinded_workspace('Timeline', 'news-feed')
    add_predefinded_workspace('Overview', 'overview')
    add_predefinded_workspace('Meds Review', 'medication-review')
    add_predefinded_workspace('Documents', 'documents-list')
    add_predefinded_workspace('Summary', 'summary')

    # user defined workspace
    add_verify(CucumberLabel.new('User Defined Workspace 1'), HasFocus.new('#title-user-defined-workspace-1'), AccessHtmlElement.new(:css, '[data-screen-id=user-defined-workspace-1]'))
    add_action(CucumberLabel.new('User Defined Workspace 1 title'), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, '#title-user-defined-workspace-1'))
    add_verify(CucumberLabel.new('User Defined Workspace astrik'), VerifyText.new, AccessHtmlElement.new(:css, '[data-screen-id=user-defined-workspace-1] .fa-asterisk'))
  end

  def add_predefinded_workspace(label, id)
    add_verify(CucumberLabel.new(label), VerifyText.new, AccessHtmlElement.new(:css, "[data-screen-id=#{id}]"))
    add_verify(CucumberLabel.new("#{label} lock"), VerifyText.new, AccessHtmlElement.new(:css, "[data-screen-id=#{id}] div.table-cell:nth-child(8) i.fa-lock"))
  end
end

When(/^the Workspace Manager is displayed$/) do
  elements = WorkspaceManager2.instance
  @ehmp = PobWorkspaceManager.new
  expect(@ehmp.has_fld_workspace_manager_title?).to eq(true)
  expect(elements.wait_until_xpath_count_greater_than('Workspace List'))
end

When(/^the predefined screens have a visual indicator indicating they are locked$/) do |table|
  elements = WorkspaceManager2.instance
  table.rows.each do | row |
    expect(elements.static_dom_element_exists? row[0]).to eq(true), "#{row[0]} screen does not exist"
    expect(elements.static_dom_element_exists? "#{row[0]} lock").to eq(true), "#{row[0]} screen does not display lock icon"
  end
  # #cover-sheet div.table-cell:nth-child(9) i.fa-lock
end

When(/^the user creates a user defined workspace$/) do
  screen_manager = ScreenManager.instance
  workspace_manager = WorkspaceManager.instance

  num_user_defined_workspace = workspace_manager.get_elements("ud workspace count").size
  expect(screen_manager.perform_action("Plus Button")).to be_true, "Error when attempting to click Add Workspace"
  workspace_manager.wait_until_xpath_count_greater_than('ud workspace count', num_user_defined_workspace)
  new_num_user_defined_workspace = workspace_manager.get_elements("ud workspace count").size
  expect(num_user_defined_workspace + 1).to eq(new_num_user_defined_workspace), 'New workspace was not added'
end

Then(/^the new user defined workspace title edit box has focus$/) do
  driver = TestSupport.driver
  # p driver.switch_to().active_element()
  # p driver.find_element(:id, 'tile-user-defined-workspace-1')
  expect(driver.switch_to.active_element).to eq(driver.find_element(:id, 'title-user-defined-workspace-1'))
end

When(/^the user removes the content in the title field$/) do
  elements = WorkspaceManager2.instance
  expect(elements.perform_action('User Defined Workspace 1 title', '')).to eq(true)
end

Then(/^an icon displays indicating a required field$/) do
  elements = WorkspaceManager2.instance
  expect(elements.wait_until_element_present('User Defined Workspace astrik')).to eq(true)
end

When(/^the user attempts to delete the user defined workspace named "(.*?)"$/) do |element_id|
  elements = WorkspaceManager.instance
  p "delete workspace #{element_id}"
  elements.add_action(CucumberLabel.new('Delete workspace'), ClickAction.new, AccessHtmlElement.new(:css, "[data-screen-id=#{element_id}] button.delete-worksheet"))
  expect(elements.perform_action('Delete workspace')).to eq(true)
end

Then(/^an alert saying "(.*?)" contains$/) do |arg1, table|
  elements = WorkspaceManager.instance
  expect(elements.perform_verification('Alert title', arg1)).to eq(true)
  table.rows.each do | row |
    expect(elements.wait_until_element_present("Alert Confirm #{row[0]}")).to eq(true)
  end
end

When(/^the user chooses to cancel the Delete Workspace action$/) do
  elements = WorkspaceManager.instance
  expect(elements.perform_action('Alert Confirm Cancel')).to eq(true)
end

Then(/^the alert closes$/) do
  elements = WorkspaceManager.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 10) # seconds # wait until list opens
  wait.until { (elements.am_i_visible? 'Alert title') == false } # wait until specific list element is shown
  sleep 10
end

When(/^the user chooses to complete the Delete Workspace action$/) do
  elements = WorkspaceManager.instance
  expect(elements.perform_action('Alert Confirm Delete')).to eq(true)
end

Then(/^the user defined workspace named "(.*?)" is not listed$/) do |arg1|
  elements = WorkspaceManager.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 10) # seconds # wait until list opens
  elements.add_action(CucumberLabel.new("#{arg1} workspace"), ClickAction.new, AccessHtmlElement.new(:css, "##{arg1}"))
  wait.until { (elements.am_i_visible? "#{arg1} workspace") == false } # wait until specific list element is shown
end

When(/^the user creates a user defined workspace and sets the title to a string of length 30$/) do
  title = "aaaaabbbbbaaaaabbbbbaaaaabbbbb"
  expect(title.length).to eq(30)
  @title = title
  workspace_manager = WorkspaceManager.instance
  navigation = Navigation.instance
  screen_manager = ScreenManager.instance
  workspace_name = title

  open_workspace_management_applet unless workspace_manager.am_i_visible? 'Workspace Manager applet'
  num_user_defined_workspace = workspace_manager.get_elements("ud workspace count").size

  expect(screen_manager.perform_action("Plus Button")).to be_true, "Error when attempting to click Add Workspace"

  workspace_manager.wait_until_xpath_count_greater_than('ud workspace count', num_user_defined_workspace)
  new_num_user_defined_workspace = workspace_manager.get_elements("ud workspace count").size
  expect(num_user_defined_workspace + 1).to eq(new_num_user_defined_workspace), 'New workspace was not added'

  new_ws_id = workspace_manager.get_elements("ud workspace count")[-1].attribute('data-screen-id')
  
  workspace_manager.add_action(CucumberLabel.new('workspace title input'), SelectAllSendKeysAndEnterActionNoClear.new, AccessHtmlElement.new(:css, "[data-screen-id=#{new_ws_id}] input"))

  workspace_manager.add_verify(CucumberLabel.new("#{workspace_name} workspace"), VerifyValue.new, AccessHtmlElement.new(:css, "[data-screen-id=#{workspace_name.downcase}] .editor-title input"))
  
  expect(workspace_manager.perform_action('workspace title input', workspace_name)).to eq(true)
end

Then(/^the user defined workspace name is listed$/) do
  expect(@title).to_not be_nil

  elements = WorkspaceManager.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 10) # seconds # wait until list opens
  elements.add_action(CucumberLabel.new("#{@title} workspace"), ClickAction.new, AccessHtmlElement.new(:css, "[data-screen-id=#{@title}]"))
  wait.until { method_and_print @title }
end

def method_and_print(arg1)
  elements = WorkspaceManager.instance
  driver = TestSupport.driver
  what = driver.find_elements(:css, 'div.user-defined')
  what.each do | ele |
    p ele.attribute('id')
  end
  (elements.am_i_visible? "#{arg1} workspace")
end

Then(/^the user defined workspace name "(.*?)" is listed$/) do |arg1|
  elements = WorkspaceManager.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 10) # seconds # wait until list opens
  elements.add_action(CucumberLabel.new("#{arg1} workspace"), ClickAction.new, AccessHtmlElement.new(:css, "[data-screen-id=#{arg1}]"))
  # wait.until { (elements.am_i_visible? "#{arg1} workspace") } # wait until specific list element is shown
  wait.until { method_and_print arg1 }
end

def workspace_is_active(workspace_id)
  elements = WorkspaceManager.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  elements.add_verify(CucumberLabel.new("#{workspace_id} default workspace"), VerifyText.new, AccessHtmlElement.new(:css, "[data-screen-id=#{workspace_id}] .default-workspace-btn i.madeDefault"))
  wait.until { elements.am_i_visible? "#{workspace_id} default workspace" }
  true
rescue
  false
end

When(/^the user sets the "(.*?)" as the active workspace$/) do |arg1|
  elements = WorkspaceManager.instance
  elements.add_action(CucumberLabel.new("set #{arg1} default workspace"), ClickAction.new, AccessHtmlElement.new(:css, "[data-screen-id=#{arg1}] .default-workspace-btn"))
  expect(elements.perform_action("set #{arg1} default workspace")).to eq(true)
  expect(workspace_is_active(arg1)).to eq(true)
end

Then(/^the workspace named "(.*?)" is the active workspace$/) do |arg1|
  expect(workspace_is_active(arg1)).to eq(true)
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

Then(/^the Workspace Manager title is "([^"]*)"$/) do |title|
  @ehmp = PobWorkspaceManager.new unless @ehmp.is_a? PobWorkspaceManager
  expect(@ehmp.has_fld_workspace_manager_title?).to eq(true)
  expect(@ehmp.fld_workspace_manager_title.text.downcase).to eq(title.downcase)
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
