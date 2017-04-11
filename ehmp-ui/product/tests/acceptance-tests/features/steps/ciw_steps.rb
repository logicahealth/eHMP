
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

  new_ws_id = workspace_manager.get_elements("ud workspace count")[-1].attribute('id')
  
  workspace_manager.add_action(CucumberLabel.new('workspace title input'), SelectAllSendKeysAndEnterActionNoClear.new, AccessHtmlElement.new(:css, "##{new_ws_id} input"))
  # workspace_manager.add_verify(CucumberLabel.new("#{workspace_name} workspace"), VerifyValue.new, AccessHtmlElement.new(:css, "##{workspace_name.downcase} .editor-title input"))
  # //div[@id='ciw']/descendant::form[contains(@class, 'editor-title')]/descendant::input
  workspace_manager.add_verify(CucumberLabel.new("#{workspace_name} workspace"), VerifyValue.new, AccessHtmlElement.new(:xpath, "//div[@id='#{workspace_name.downcase}']/descendant::input[contains(@id, 'tile')]"))
  
  expect(workspace_manager.perform_action('workspace title input', workspace_name)).to eq(true)
  expect(workspace_manager.perform_verification("#{workspace_name} workspace", workspace_name)).to eq(true)
  # take_screenshot("workspace created")
end

When(/^the user associates user defined workspace "([^"]*)" with "([^"]*)"$/) do |arg1, arg2|
  workspace_manager = WorkspaceManager.instance
  workspace_manager.add_action(CucumberLabel.new("#{arg1} associate button"), ClickAction.new, AccessHtmlElement.new(:css, "##{arg1.downcase} button.show-associations"))
  workspace_manager.add_action(CucumberLabel.new("#{arg1} search problems"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "##{arg1.downcase} #screen-problem-search"))
  all_problem_results = AccessHtmlElement.new(:css, '.problem-result')
  workspace_manager.add_verify(CucumberLabel.new("All Problem Results"), VerifyXpathCount.new(all_problem_results), all_problem_results)
  #workspace_manager.add_action(CucumberLabel.new("#{arg2} problem list"), ClickAction.new, AccessHtmlElement.new(:css, ".tt-suggestion [title='Essential hypertension']"))
  #workspace_manager.add_action(CucumberLabel.new("#{arg2} problem list"), ClickAction.new, AccessHtmlElement.new(:xpath, "//descendant::div[@title='Essential hypertension']/ancestor::div[contains(@class, 'tt-suggestion')]"))
  workspace_manager.add_action(CucumberLabel.new("#{arg2} problem list"), ClickAction.new, AccessHtmlElement.new(:css, "#problem-result-59621000"))
  workspace_manager.add_action(CucumberLabel.new("Clear Search Problem Btn"), ClickAction.new, AccessHtmlElement.new(:id, "clear-search-problem-btn"))
  workspace_manager.add_verify(CucumberLabel.new("#{arg2} associated problem"), VerifyText.new, AccessHtmlElement.new(:xpath, "//div[@id='problem-list-region']/descendant::div[contains(string(), '#{arg2}')]"))
  workspace_manager.add_action(CucumberLabel.new("Close Association Manager"), ClickAction.new, AccessHtmlElement.new(:id, 'association-manager-close-btn'))

  # click associate button
  expect(workspace_manager.perform_action("#{arg1} associate button")).to eq(true)
  sleep 2
  take_screenshot("associate button pushed_phantom")
  p "associate button pushed: #{TestSupport.print_logs}"

  # search associated problems
  expect(workspace_manager.perform_action("#{arg1} search problems", arg2)).to eq(true)
  take_screenshot("search problems")
  p "search problems: #{TestSupport.print_logs}"

  workspace_manager.wait_until_xpath_count_greater_than('All Problem Results', 0)
  take_screenshot("shoud have problem suggestions")
  p "should have problem suggestions: #{TestSupport.print_logs}"

  # choose the problem from the search result list

  p TestSupport.driver.find_elements(:xpath, "//descendant::div[@title='Essential hypertension']/ancestor::div[contains(@class, 'tt-suggestion')]").length
  expect(workspace_manager.perform_action("#{arg2} problem list")).to eq(true)
  take_screenshot("choose problem")
  p "choose problem: #{TestSupport.print_logs}"

  # make sure the problem has been associated
  workspace_manager.wait_until_action_element_visible("#{arg2} associated problem")
  take_screenshot("has problem been associated")
  p "has problem been associated: #{TestSupport.print_logs}"
  # clear the search input so close button is visible
  expect(workspace_manager.perform_action("Clear Search Problem Btn")).to eq(true)
  take_screenshot("clear button")
  p "logs through selenium: #{TestSupport.print_logs}"
  # close the Association Manager
  expect(workspace_manager.perform_action("Close Association Manager")).to eq(true)
end
