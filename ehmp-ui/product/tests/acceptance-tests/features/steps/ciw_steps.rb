
After('@workspace_test') do 
  p 'trying something'
end

def open_workspace_management_applet
  navigation = Navigation.instance
  workspace_manager = WorkspaceManager.instance
  expect(navigation.perform_action("Workspace Manager")).to be_true, "Error when attempting to click Workspace Manager"
  workspace_manager.wait_until_action_element_visible('Workspace Manager applet')
  expect(workspace_manager.am_i_visible? 'Workspace Manager applet').to eq(true)
end

When(/^the user opens the workspace management applet$/) do
  open_workspace_management_applet
end

When(/^the user creates a user defined workspace named "([^"]*)"$/) do |workspace_name|
  workspace_manager = WorkspaceManager.instance
  navigation = Navigation.instance
  screen_manager = ScreenManager.instance

  open_workspace_management_applet unless workspace_manager.am_i_visible? 'Workspace Manager applet'
  num_user_defined_workspace = workspace_manager.get_elements("ud workspace count").size

  expect(screen_manager.perform_action("Plus Button")).to be_true, "Error when attempting to click Add Workspace"

  workspace_manager.wait_until_xpath_count_greater_than('ud workspace count', num_user_defined_workspace)
  new_num_user_defined_workspace = workspace_manager.get_elements("ud workspace count").size
  expect(num_user_defined_workspace + 1).to eq(new_num_user_defined_workspace), 'New workspace was not added'

  new_ws_id = workspace_manager.get_elements("ud workspace count")[-1].attribute('data-screen-id')
  
  workspace_manager.add_action(CucumberLabel.new('workspace title input'), SelectAllSendKeysAndEnterActionNoClear.new, AccessHtmlElement.new(:css, "[data-screen-id='#{new_ws_id}'] input"))

  workspace_manager.add_verify(CucumberLabel.new("#{workspace_name} workspace"), VerifyValue.new, AccessHtmlElement.new(:css, "[data-screen-id='#{workspace_name.downcase}'] .editor-title input"))
  
  expect(workspace_manager.perform_action('workspace title input', workspace_name)).to eq(true)
  expect(workspace_manager.perform_verification("#{workspace_name} workspace", workspace_name)).to eq(true)
  
  # take_screenshot("workspace created")
end

When(/^the user associates user defined workspace "([^"]*)" with "([^"]*)"$/) do |arg1, arg2|
  workspace_manager = WorkspaceManager.instance
  workspace_manager.add_action(CucumberLabel.new("#{arg1} associate button"), ClickAction.new, AccessHtmlElement.new(:css, "[data-screen-id=#{arg1.downcase}] button.show-associations"))
  workspace_manager.add_action(CucumberLabel.new("#{arg1} search problems"), SendKeysAndTabAction.new, AccessHtmlElement.new(:css, "[data-screen-id=#{arg1.downcase}] #screenProblemSearch"))
  all_problem_results = AccessHtmlElement.new(:css, '.problem-result')
  workspace_manager.add_verify(CucumberLabel.new("All Problem Results"), VerifyXpathCount.new(all_problem_results), all_problem_results)
  workspace_manager.add_action(CucumberLabel.new("#{arg2} problem list"), ClickAction.new, AccessHtmlElement.new(:css, "#problem-result-59621000"))
  workspace_manager.add_action(CucumberLabel.new("Clear Search Problem Btn"), ClickAction.new, AccessHtmlElement.new(:css, ".clear-search-problem-btn"))
  workspace_manager.add_verify(CucumberLabel.new("#{arg2} associated problem"), VerifyText.new, AccessHtmlElement.new(:xpath, "//div[contains(@class, 'problem-list-region')]/descendant::div[contains(string(), '#{arg2}')]"))
  workspace_manager.add_action(CucumberLabel.new("Close Association Manager"), ClickAction.new, AccessHtmlElement.new(:id, 'associationManagerCloseBtn'))

  # click associate button
  expect(workspace_manager.perform_action("#{arg1} associate button")).to eq(true)

  # search associated problems
  expect(workspace_manager.perform_action("#{arg1} search problems", arg2)).to eq(true)

  workspace_manager.wait_until_xpath_count_greater_than('All Problem Results', 0)

  # choose the problem from the search result list
  expect(workspace_manager.perform_action("#{arg2} problem list")).to eq(true)

  # make sure the problem has been associated
  workspace_manager.wait_until_action_element_visible("#{arg2} associated problem")
  p '5'
  # clear the search input so close button is visible
  expect(workspace_manager.perform_action("Clear Search Problem Btn")).to eq(true)

  # close the Association Manager
  expect(workspace_manager.perform_action("Close Association Manager")).to eq(true)
end

