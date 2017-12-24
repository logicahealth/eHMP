When(/^the user selects Go To Workspace Manager$/) do
  page = WorkspaceEditor.new
  page.wait_for_btn_goto_workspace_manager
  expect(page).to have_btn_goto_workspace_manager
  page.btn_goto_workspace_manager.click
end

Then(/^the Workspace Editor is displayed$/) do
  WorkspaceActions.workspace_editor_displayed
end
