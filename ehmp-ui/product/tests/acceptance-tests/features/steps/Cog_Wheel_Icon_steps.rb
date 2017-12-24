Given(/^user views and selects cog wheel icon$/) do
  ehmp = PobOverView.new
  expect(ehmp.menu.wait_for_btn_cog_wheel).to eq(true)
  ehmp.menu.btn_cog_wheel.click
end

Given(/^user has link to edit the current workspace$/) do
  ehmp = PobOverView.new
  expect(ehmp.menu.wait_for_btn_workspace_manager_option).to eq(true)
  expect(ehmp.menu.btn_workspace_manager_option.text.upcase).to eq('MANAGE PATIENT WORKSPACES')
end

Given(/^user views message This workspace is locked and cannot be customized$/) do
  ehmp = PobOverView.new
  expect(ehmp.menu.wait_for_btn_workspace_editor_option).to eq(true)
  expect(ehmp.menu.btn_workspace_editor_option.text.upcase).to eq('THIS WORKSPACE IS LOCKED AND CANNOT BE CUSTOMIZED')
end

Given(/^user selects link to Manage patient workspaces$/) do
  ehmp = PobOverView.new
  expect(ehmp.menu.wait_for_btn_workspace_manager_option).to eq(true)
  ehmp.menu.btn_workspace_manager_option.click
end

When(/^user has link to edit the Customize this workspace$/) do
  ehmp = PobOverView.new
  expect(ehmp.menu.wait_for_btn_workspace_editor_option).to eq(true)
  expect(ehmp.menu.btn_workspace_editor_option.text.upcase).to eq('CUSTOMIZE THIS WORKSPACE')
end

When(/^user selects link Customize this workspace$/) do
  ehmp = PobOverView.new
  expect(ehmp.menu.wait_for_btn_workspace_editor_option).to eq(true)
  ehmp.menu.btn_workspace_editor_option.click
end
