class CIW < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Add New Workspace"), ClickAction.new, AccessHtmlElement.new(:css, ".addScreen"))

    add_action(CucumberLabel.new("Workspace-Name Text Filter"), SendKeysAction.new, AccessHtmlElement.new(:css, ".workspaceTable .editor-title > input"))
    add_action(CucumberLabel.new("Workspace-Description Text Filter"), SendKeysAction.new, AccessHtmlElement.new(:css, ".workspaceTable .editor-description > input"))
    add_verify(CucumberLabel.new("User Defined Workspace 1"), VerifyContainsText.new, AccessHtmlElement.new(:id, "user-defined-workspace-1"))
    add_verify(CucumberLabel.new("User Defined Workspace 2"), VerifyContainsText.new, AccessHtmlElement.new(:id, "user-defined-workspace-2"))
    add_action(CucumberLabel.new("Associate Problems Button - User Defined Workspace 1"), ClickAction.new, AccessHtmlElement.new(:id, "association-trigger-user-defined-workspace-1"))
    add_action(CucumberLabel.new("Associate Problems Button - User Defined Workspace 2"), ClickAction.new, AccessHtmlElement.new(:id, "association-trigger-user-defined-workspace-2"))
    add_action(CucumberLabel.new("More Options Button - User Defined Workspace 1"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 .fa.fa-ellipsis-v"))
    add_action(CucumberLabel.new("More Options Button - User Defined Workspace 2"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-2 .fa.fa-ellipsis-v"))
    add_action(CucumberLabel.new("Delete Workspace Button - User Defined Workspace 1"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 .delete-worksheet"))
    add_action(CucumberLabel.new("Delete Workspace Button - User Defined Workspace 2"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-2 .delete-worksheet"))
    add_action(CucumberLabel.new("Delete Workspace Confirm"), ClickAction.new, AccessHtmlElement.new(:css, "#workspace-delete"))
    add_action(CucumberLabel.new("Search Problem Text field"), SendKeysAction.new, AccessHtmlElement.new(:id, "screen-problem-search"))
    add_verify(CucumberLabel.new("Problem Result"), VerifyContainsText.new, AccessHtmlElement.new(:class, "problem-result"))
    add_action(CucumberLabel.new("Manic bipolar I disorder - Problem Text"), ClickAction.new, AccessHtmlElement.new(:id, "problem-result-68569003"))
    add_action(CucumberLabel.new("Recurrent manic episodes - Problem Text"), ClickAction.new, AccessHtmlElement.new(:id, "problem-result-191590005"))
    add_action(CucumberLabel.new("Essential hypertension - Problem Text"), ClickAction.new, AccessHtmlElement.new(:id, "problem-result-59621000"))
    add_verify(CucumberLabel.new("Associated Problems List"), VerifyContainsText.new, AccessHtmlElement.new(:class, "popover-content"))
    add_verify(CucumberLabel.new("No Results"), VerifyContainsText.new, AccessHtmlElement.new(:id, "noResultsText"))
    add_action(CucumberLabel.new("Manic bipolar I disorder - Remove Text"), ClickAction.new, AccessHtmlElement.new(:id, "remove-problem-68569003"))
    
    essential_hypertension_xpath = "//*[@id='event_name_urn_va_problem_9E7A_236_650']"
    applet_toolbar_xpath = "preceding-sibling::div[@class='toolbar-container']"
    p "#{essential_hypertension_xpath}/#{applet_toolbar_xpath}/descendant::*[@button-type='submenu-button-toolbar']"
    active_toolbar_submenu = "//div[contains(@class, 'toolbarActive')]/descendant::*[@button-type='submenu-button-toolbar']"
    #add_action(CucumberLabel.new("Essential Hypertension CIW Icon"), ClickAction.new, AccessHtmlElement.new(:xpath, active_toolbar_submenu))
    add_action(CucumberLabel.new("Essential Hypertension CIW Icon"), ClickAction.new, AccessHtmlElement.new(:css, "[button-type=submenu-button-toolbar]"))
    add_action(CucumberLabel.new("Essential Hypertension CIW dropdown Icon"), ClickAction.new, AccessHtmlElement.new(:css, ".submenuButtonWrapper .applet-dropdown button"))

    add_verify(CucumberLabel.new("User Defined Workspace 1 - Link Text Verify"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=problems] .dropdown-menu>li:nth-child(2)"))   #.dropdown-menu>li>a
    add_verify(CucumberLabel.new("User Defined Workspace 2 - Link Text Verify"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=problems] .dropdown-menu>li:nth-child(3)"))
    add_action(CucumberLabel.new("User Defined Workspace 1 - Link Text"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=problems] .dropdown-menu>li:nth-child(2)"))
    add_action(CucumberLabel.new("User Defined Workspace 2 - Link Text"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=problems] .dropdown-menu>li:nth-child(3)"))
    add_verify(CucumberLabel.new("User Defined Workspace 1 - Screen Name"), VerifyText.new, AccessHtmlElement.new(:css, "#screenName"))

    add_action(CucumberLabel.new("My Workspace"), ClickAction.new, AccessHtmlElement.new(:id, 'provider-centric-view'))
    add_action(CucumberLabel.new("Copy My Workspace"), ClickAction.new, AccessHtmlElement.new(:css, '#provider-centric-view .duplicate-worksheet'))
  end
end #CIW

Given(/^user navigates to User Defined Workspace manager$/) do
  @ehmp = PobCommonElements.new
  expect(@ehmp.has_btn_workspace_manager?).to eq(true)
  @ehmp.btn_workspace_manager.click
end

# Given(/^user creates New User defined workspace "(.*?)"$/) do |workspace_name|
#   aa = CIW.instance
#   @ehmp = PobWorkspaceManager.new
#   @ehmp.wait_until_btn_add_workspace_visible

#   if !aa.am_i_visible?(workspace_name)    
#     expect(aa.perform_action("Add New Workspace")).to be_true, "Error when attempting to click on Add New Workspace"
#     expect(aa.wait_until_element_present(workspace_name, DefaultLogin.wait_time)).to be_true, "User Defined Workspace #{workspace_name} is not present"
#   else
#     expect(aa.am_i_visible?(workspace_name)).to be_true, "Workspace #{workspace_name} already exists"
#   end
# end

Given(/^user names the workspace "(.*?)" with description "(.*?)"$/) do |workspace_name, description|
  aa = CIW.instance
  aa.wait_until_action_element_visible("Workspace-Name Text Filter", DefaultLogin.wait_time)
  expect(aa.perform_action("Workspace-Name Text Filter", "")).to be_true, "Error when deleting the workspace name"
  expect(aa.perform_action("Workspace-Name Text Filter", workspace_name)).to be_true, "Error when changing the workspace name"
  aa.wait_until_action_element_visible("Workspace-Description Text Filter", DefaultLogin.wait_time)
  expect(aa.perform_action("Workspace-Description Text Filter", description)).to be_true, "Error when changing the workspace description"
end

Given(/^user closes the user defined work space manager$/) do
  @ehmp = PobWorkspaceManager.new unless @ehmp.is_a? PobWorkspaceManager
  @ehmp.btn_close_manager.click
  @ehmp.wait_until_fld_applet_invisible
  expect(@ehmp.has_no_fld_applet?).to eq(true)
end
     
When(/^user clicks on association button on "(.*?)"$/) do |workspace_name|
  aa = CIW.instance
  expect(aa.wait_until_element_present("Associate Problems Button" + " - " + workspace_name, DefaultLogin.wait_time)).to be_true, "Associate Problem button is not present"
  expect(aa.perform_action("Associate Problems Button"+ " - " + workspace_name, "")).to be_true, "Error when attempting to click on Search Problem button"  
end

Then(/^user sees the search problems text field$/) do
  aa = CIW.instance
  expect(aa.wait_until_element_present("Search Problem Text field", DefaultLogin.wait_time)).to be_true, "Search Problmes screen did not display"
end

When(/^user enters "(.*?)" in the search problems text field$/) do |problem_text|
  aa = CIW.instance
  expect(aa.wait_until_element_present("Search Problem Text field", DefaultLogin.wait_time)).to be_true, "Search Problmes screen did not display"
  expect(aa.perform_action("Search Problem Text field", problem_text)).to be_true, "Error when attempting to enter text on Search Problem button"
end

Then(/^a suggestion list is displayed to the user$/) do
  aa = CIW.instance
  expect(aa.wait_until_element_present("Problem Result", DefaultLogin.wait_time)).to be_true, "List of suggested problems didn't display"
end

Then(/^user chooses "(.*?)" from the suggestion list$/) do |problem_text|
  aa = CIW.instance
  expect(aa.wait_until_element_present(problem_text + " - Problem Text", DefaultLogin.wait_time)).to be_true, "User not able to choose this particular problem from suggestion list"
  expect(aa.perform_action(problem_text + " - Problem Text")).to be_true, "Unable to choose the selected problem"
end

Then(/^the selected problem "(.*?)" is added to associated problems list$/) do |problem_text|
  aa = CIW.instance
  expect(aa.wait_until_element_present("Associated Problems List", DefaultLogin.wait_time)).to be_true, "User not able to choose this particular problem from suggestion list"
  expect(aa.perform_verification("Associated Problems List", problem_text)).to be_true, "Problem not found in the Associated problems list"
end

When(/^user clicks on more options button on "(.*?)"$/) do |workspace_name|
  aa = CIW.instance
  expect(aa.wait_until_element_present("More Options Button" + " - " + workspace_name, DefaultLogin.wait_time)).to be_true, "Unable to locate more options for the workspace #{workspace_name}"
  expect(aa.perform_action("More Options Button" + " - " + workspace_name)).to be_true, "Unable to locate more options for the workspace #{workspace_name}"
end

Then(/^user sees the option to delete the workspace "(.*?)"$/) do |workspace_name|
  aa = CIW.instance
  expect(aa.wait_until_element_present("Delete Workspace Button" + " - " + workspace_name, DefaultLogin.wait_time)).to be_true, "User not able to see Delete Workspace option"
end

Then(/^user should confirm "(.*?)" can be deleted$/) do |workspace_name|
  aa = CIW.instance
  expect(aa.wait_until_element_present("Delete Workspace Confirm", DefaultLogin.wait_time)).to be_true, "User not able to see Delete Workspace option"
  expect(aa.perform_action("Delete Workspace Confirm")).to be_true, "Unable to delete workspace #{workspace_name}"
end

When(/^user chooses delete from workspace "(.*?)"$/) do |workspace_name|
  aa = CIW.instance
  expect(aa.perform_action("Delete Workspace Button" + " - " + workspace_name)).to be_true, "Unable to locate delete for the workspace #{workspace_name}"
end

Then(/^the workspace "(.*?)" is deleted$/) do |workspace_name|
  aa = CIW.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time) # seconds # wait until list opens
  wait.until { !aa.am_i_visible?(workspace_name) }
end

Then(/^the problem "(.*?)" from the suggestion list is disabled$/) do |problem_text|
  aa = CIW.instance
  driver = TestSupport.driver
  expect(aa.wait_until_element_present(problem_text + " - " + "Problem Text", DefaultLogin.wait_time)).to be_true, "User not able to see Delete Workspace option"
  case problem_text
  when 'Manic bipolar I disorder'
    element = driver.find_element(:xpath, "//*[@id='problem-result-68569003']")
  when 'Recurrent manic episodes'
    element = driver.find_element(:xpath, "//*[@id='problem-result-191590005']")
  else
    fail "**** No function found! Check your script ****"
  end
  class_name = element.attribute("class")
  p class_name
  expect(class_name).to include("disabled"), "The problem text is not disabled"
end

Then(/^the problem "(.*?)" from the suggestion list is enabled again$/) do |problem_text|
  aa = CIW.instance
  driver = TestSupport.driver
  expect(aa.wait_until_element_present(problem_text + " - " + "Problem Text", DefaultLogin.wait_time)).to be_true, "User not able to see Delete Workspace option"
  case problem_text
  when 'Manic bipolar I disorder'
    element = driver.find_element(:xpath, "//*[@id='problem-result-68569003']")
  when 'Recurrent manic episodes'
    element = driver.find_element(:xpath, "//*[@id='problem-result-191590005']")
  else
    fail "**** No function found! Check your script ****"
  end
  
  class_name = element.attribute("class")
  p class_name
  expect(class_name).should_not include("disabled"), "The problem text is not disabled"
end

When(/^user deletes the problem "(.*?)" from the associated problems list$/) do |problem_text|
  aa = CIW.instance
  expect(aa.perform_action(problem_text + " - " + "Remove Text")).to be_true, "Unable to locate delete icon for the problem #{problem_text}"
end

Then(/^a suggestion list says "(.*?)" on "(.*?)"$/) do |no_results_text, workspace_name|
  aa = CIW.instance
  expect(aa.perform_verification(no_results_text, no_results_text)).to be_true, "No Results found is not displayed" 
  #close the association search box
  expect(aa.perform_action("Associate Problems Button - " + workspace_name)).to be_true, "Unable to locate association icon for the workspace #{workspace_name}" 
end

When(/^user navigates back to overview screen$/) do
  navigate_in_ehmp '#overview'
end

Then(/^user selects the "(.*?)" CIW icon in Problems Gist$/) do |arg1|
  aa = CIW.instance
  label = "#{arg1} CIW Icon"
  expect(aa.perform_action(label)).to be_true
end

Then(/^user selects the "(.*?)" CIW dowpdown icon in Problems Gist$/) do |arg1|
  aa = CIW.instance
  label = "#{arg1} CIW dropdown Icon"
  expect(aa.perform_action(label)).to be_true
end

Then(/^user is presented with two associated workspace "(.*?)" and "(.*?)"$/) do |arg1, arg2|
  aa = CIW.instance
  expect(aa.wait_until_element_present(arg1 + " - Link Text Verify", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification(arg1 + " - Link Text Verify", arg1)).to be_true, "#{arg1} workspace not found under CIW icon"
  expect(aa.perform_verification(arg2 + " - Link Text Verify", arg2)).to be_true, "#{arg2} workspace not found under CIW icon"
end

When(/^user chooses the associated workspace "(.*?)"$/) do |workspace_name|
  aa = CIW.instance
  expect(aa.wait_until_element_present(workspace_name + " - Link Text", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action(workspace_name + " - Link Text")).to be_true, "#{workspace_name} workspace not found under CIW icon"
end

Then(/^user is navigated to the custom workspace "(.*?)"$/) do |workspace_name|
  aa = CIW.instance
  expect(aa.wait_until_element_present(workspace_name + " - Screen Name", DefaultLogin.wait_time)).to be_true  
  expect(aa.perform_verification(workspace_name + " - Screen Name", workspace_name)).to be_true
end

Then(/^the user navigated to the user defined workspace "([^"]*)"$/) do |arg1|
  url = TestSupport.driver.current_url
  expect(url).to include "/##{arg1}"
end

Then(/^the following workspace options are displayed$/) do |table|
  ciw = CIW.instance
  table.rows.each do | row |
    ciw.add_action(CucumberLabel.new("#{row[0]} associated workspace"), ClickAction.new, AccessHtmlElement.new(:css, ".applet-dropdown-menu [href='##{row[0].downcase}']"))
    expect(ciw.wait_until_action_element_visible("#{row[0]} associated workspace")).to eq(true)
  end
end

When(/^the user selects workspace option "([^"]*)"$/) do |arg1|
  ciw = CIW.instance
  expect(ciw.perform_action("#{arg1} associated workspace")).to eq(true)
end

def show_values
  elements = TestSupport.driver.find_elements(:css, "div.user-defined input")
  p "Length: #{elements.length}"
  elements.each do | ele |
    p "#{ele.attribute('id')}: #{ele.attribute('value')}: #{ele.attribute('origvalue')}"
  end
end

When(/^the user attempts to create a user defined workspace named "([^"]*)"$/) do |workspace_name|
  workspace_manager = WorkspaceManager.instance
  navigation = Navigation.instance
  screen_manager = ScreenManager.instance

  open_workspace_management_applet unless workspace_manager.am_i_visible? 'Workspace Manager applet'
  num_user_defined_workspace = workspace_manager.get_elements("ud workspace count").size

  take_screenshot("1before_plus")

  expect(screen_manager.perform_action("Plus Button")).to be_true, "Error when attempting to click Add Workspace"

  workspace_manager.wait_until_xpath_count_greater_than('ud workspace count', num_user_defined_workspace)
  new_num_user_defined_workspace = workspace_manager.get_elements("ud workspace count").size
  expect(num_user_defined_workspace + 1).to eq(new_num_user_defined_workspace), 'New workspace was not added'

  take_screenshot("2after_plus")

  new_ws_id = workspace_manager.get_elements("ud workspace count")[-1].attribute('id')

  element = TestSupport.driver.find_element(:css, "##{new_ws_id} input")
  p "------ new workspace -------"
  show_values

  # element.clear
  element.send_keys [:end]
  element.send_keys [:shift, :home], :backspace
  show_values
  take_screenshot("3after_clear")
  p "------ clear name -------"
  show_values
  # p "Workspace name: #{workspace_name}"
  element.send_keys(workspace_name)
  TestSupport.print_logs
  p "------ new name -------"
  show_values
  element.send_keys(:enter)
  take_screenshot("4after_name")

  p "------ select enter -------"
  show_values
  take_screenshot("5after_enter")

  
  workspace_manager.add_action(CucumberLabel.new('workspace title input'), ClickClearAndSendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "##{new_ws_id} input"))
  # workspace_manager.add_verify(CucumberLabel.new("#{workspace_name} workspace"), VerifyValue.new, AccessHtmlElement.new(:css, "##{workspace_name.downcase} .editor-title input"))
  # //div[@id='ciw']/descendant::form[contains(@class, 'editor-title')]/descendant::input
  workspace_manager.add_verify(CucumberLabel.new("#{workspace_name} workspace"), VerifyValue.new, AccessHtmlElement.new(:xpath, "//div[@id='#{workspace_name.downcase}']/descendant::input[contains(@id, 'tile')]"))
  
  #expect(workspace_manager.perform_action('workspace title input', workspace_name)).to eq(true)
  expect(workspace_manager.perform_verification("#{workspace_name} workspace", workspace_name)).to eq(true)
end
When(/^user clicks on summary row for "([^"]*)" in the Problems Applet$/) do |arg1|
  ciw = CIW.instance
  xpath = "//*[@data-appletid='problems']/descendant::td[contains(string(), '#{arg1}')]"
  ciw.add_action(CucumberLabel.new("Row - Problem Click"), ClickAction.new, AccessHtmlElement.new(:xpath, xpath))
  expect(ciw.perform_action('Row - Problem Click')).to eq(true)
end

When(/^the user clicks on the expanded row for "([^"]*)" in the Problems Applet$/) do |arg1|
  ciw = CIW.instance
  xpath = "//*[@data-appletid='problems']/descendant::td[contains(string(), '#{arg1}')]"
  ciw.add_action(CucumberLabel.new("Row - Problem Click"), ClickAction.new, AccessHtmlElement.new(:xpath, xpath))
  expect(ciw.perform_action('Row - Problem Click')).to eq(true)
end

When(/^the user clicks on the maximized row for "([^"]*)" in the Problems Applet$/) do |arg1|
  ciw = CIW.instance
  xpath = "//*[@data-appletid='problems']/descendant::td[contains(string(), '#{arg1}')]"
  ciw.add_action(CucumberLabel.new("Row - Problem Click"), ClickAction.new, AccessHtmlElement.new(:xpath, xpath))
  expect(ciw.perform_action('Row - Problem Click')).to eq(true)
end

Then(/^a popover toolbar displays the CIW button$/) do
  ciw = CIW.instance
  ciw.wait_until_action_element_visible('Essential Hypertension CIW Icon')
  expect(ciw.am_i_visible? 'Essential Hypertension CIW Icon').to eq(true)
end
