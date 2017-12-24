When(/^the user creates a user defined workspace named "([^"]*)"$/) do |workspace_name|
  manager = PobWorkspaceManager.new
  expect(manager).to have_btn_add_workspace
  wait = Selenium::WebDriver::Wait.new(:timeout => 15)

  WorkspaceActions.open_workspace_management_applet unless manager.has_fld_applet?
  num_user_defined_workspace = manager.fld_userdefined_screens.length
  
  manager.btn_add_workspace.click
  wait.until { manager.fld_userdefined_screens.length > num_user_defined_workspace }
  wait_for_screen_clear
  

  new_num_user_defined_workspace = manager.fld_userdefined_screens.length
  expect(num_user_defined_workspace + 1).to eq(new_num_user_defined_workspace), 'New workspace was not added'

  new_ws_id = manager.fld_userdefined_screens.last['data-screen-id']

  manager.add_user_defined_workspace_elements new_ws_id
  expect(manager).to have_input_title
  #for phantomJS use this
  manager.input_title.native.send_keys [:shift, :home], :backspace
  #for chrome use this 
  #manager.input_title.native.clear
  manager.input_title.native.send_keys workspace_name
  manager.input_title.native.send_keys :enter
  manager.wait_for_fld_obstruction(2)
  lowercase_id = workspace_name.downcase

  manager.add_user_defined_workspace_elements lowercase_id
  wait_for_screen_clear
  expect(manager.wait_for_input_title(10)).to eq(true)
  expect(manager).to have_input_title, "did not have input title for #{lowercase_id}, available names: #{manager.screens_with_editable_titles}"
  screenids = manager.fld_userdefined_screens.map { |element| element['data-screen-id'] }
  expect(screenids).to include lowercase_id

end

When(/^the user associates user defined workspace "([^"]*)" with "([^"]*)"$/) do |arg1, arg2|
  manager = PobWorkspaceManager.new
  manager.add_user_defined_workspace_elements arg1.downcase
  # click associate button
  manager.wait_for_btn_associate
  expect(manager).to have_btn_associate
  manager.btn_associate.click

  # search associated problems
  manager.wait_for_fld_search_problems
  expect(manager).to have_fld_search_problems
  manager.fld_search_problems.native.send_keys arg2, :tab

  manager.wait_for_fld_all_problem_results
  expect(manager.fld_all_problem_results.length).to be > 0

  manager.add_association_suggestion arg2
  manager.wait_for_fld_suggestion
  expect(manager).to have_fld_suggestion

  # choose the problem from the search result list
  manager.fld_suggestion.click

  # make sure the problem has been associated
  manager.wait_for_fld_associated_problem
  manager.wait_until_fld_associated_problem_visible
 
  # close the Association Manager
  # DE8186: CIW association modal is hiding its close button
  # expect(manager).to have_btn_close_associations
  # manager.btn_close_associations.click
  # manager.wait_until_btn_close_associations_invisible
  # DE8186: CIW association modal is hiding its close button

  expect(manager).to have_btn_associate
  manager.btn_associate.click
  manager.wait_until_fld_search_problems_invisible  
end
