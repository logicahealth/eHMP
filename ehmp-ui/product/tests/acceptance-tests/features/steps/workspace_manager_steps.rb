Given(/^workspace "(.*?)" is listed$/) do |workspace_id|
  @ehmp = PobWorkspaceManager.new
  predefined_screen_ids = @ehmp.predefined_screens_ids
  p predefined_screen_ids
  expect(predefined_screen_ids).to include(workspace_id)
end

When(/^user clones the "(.*?)" workspace$/) do |workspace_id|
  @ehmp = PobWorkspaceManager.new
  expect(@ehmp.clone_workspace(workspace_id)).to eq(true)
end
