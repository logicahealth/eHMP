class WorkspaceManager2 < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new('Workspace Manager Title'), VerifyText.new, AccessHtmlElement.new(:id, 'workspaceManagerHeading'))
    workspace_list = AccessHtmlElement.new(:css, 'div.workspaceTable div.table-row')
    add_verify(CucumberLabel.new('Workspace List'), VerifyXpathCount.new(workspace_list), workspace_list)

    # Predefined workspaces
    add_predefinded_workspace('Coversheet', 'cover-sheet')
    add_predefinded_workspace('Timeline', 'news-feed')
    add_predefinded_workspace('Overview', 'overview')
    add_predefinded_workspace('Meds Review', 'medication-review')
    add_predefinded_workspace('Documents', 'documents-list')

    # user defined workspace
    add_verify(CucumberLabel.new('User Defined Workspace 1'), HasFocus.new('#tile-user-defined-workspace-1'), AccessHtmlElement.new(:id, 'tile-user-defined-workspace-1'))
    add_action(CucumberLabel.new('User Defined Workspace 1 title'), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, 'tile-user-defined-workspace-1'))
    add_verify(CucumberLabel.new('User Defined Workspace astrik'), VerifyText.new, AccessHtmlElement.new(:css, '#user-defined-workspace-1 span.glyphicon-asterisk'))
  end

  def add_predefinded_workspace(label, id)
    add_verify(CucumberLabel.new(label), VerifyText.new, AccessHtmlElement.new(:id, id))
    add_verify(CucumberLabel.new("#{label} lock"), VerifyText.new, AccessHtmlElement.new(:css, "##{id} div.table-cell:nth-child(9) i.fa-lock"))
  end
end

When(/^the Workspace Manager is displayed$/) do
  elements = WorkspaceManager2.instance
  expect(elements.perform_verification('Workspace Manager Title', 'WORKSPACE MANAGER')).to eq(true)
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
  expect(driver.switch_to.active_element).to eq(driver.find_element(:id, 'tile-user-defined-workspace-1'))
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
  elements.add_action(CucumberLabel.new('Delete workspace'), ClickAction.new, AccessHtmlElement.new(:css, "##{element_id} button.delete-worksheet"))
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

When(/^the user sets the title of the new user defined workspace to "(.*?)"$/) do |title|
  workspace_manager = WorkspaceManager.instance
  workspace_manager2 = WorkspaceManager2.instance

  driver = TestSupport.driver
  has_focus = driver.switch_to.active_element == driver.find_element(:id, 'tile-user-defined-workspace-1')
  p "does title have focus: #{has_focus}"
  unless has_focus
    workspace_manager.add_action(CucumberLabel.new('workspace title input'), SelectAllSendKeysAndEnterActionNoClear.new, AccessHtmlElement.new(:css, "##{new_ws_id} input"))
    expect(workspace_manager.perform_action('workspace title input')).to eq(true)
    expect(driver.switch_to.active_element).to eq(driver.find_element(:id, 'tile-user-defined-workspace-1'))
  end
  expect(workspace_manager2.perform_action('User Defined Workspace 1 title', title)).to eq(true)
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
  elements.add_action(CucumberLabel.new("#{arg1} workspace"), ClickAction.new, AccessHtmlElement.new(:id, arg1))
  # wait.until { (elements.am_i_visible? "#{arg1} workspace") } # wait until specific list element is shown
  wait.until { method_and_print arg1 }
end

def workspace_is_active(workspace_id)
  elements = WorkspaceManager.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  elements.add_verify(CucumberLabel.new("#{workspace_id} default workspace"), VerifyText.new, AccessHtmlElement.new(:css, "##{workspace_id} .default-workspace-btn i.madeDefault"))
  wait.until { elements.am_i_visible? "#{workspace_id} default workspace" }
  true
rescue
  false
end

When(/^the user sets the "(.*?)" as the active workspace$/) do |arg1|
  elements = WorkspaceManager.instance
  elements.add_action(CucumberLabel.new("set #{arg1} default workspace"), ClickAction.new, AccessHtmlElement.new(:css, "##{arg1} .default-workspace-btn"))
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
  @ehmp = Alert.new

  @ehmp.wait_until_mdl_alert_region_visible
  @ehmp.wait_until_mdl_alert_title_visible
  expect(@ehmp.mdl_alert_title).to have_text(title)

end
