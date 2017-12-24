When(/^the user previews the workspace for "([^"]*)"$/) do |workspace_id|
  
  @ehmp = PobWorkspaceManager.new
  @ehmp.add_user_defined_workspace_elements(workspace_id)
  expect(@ehmp.has_btn_udw_preview?).to eq(true)
  @ehmp.btn_udw_preview.click

  @ehmp = PobPreviewWorkspace.new
  @ehmp.wait_until_fld_workspace_preview_visible
  expect(@ehmp.fld_workspace_preview.visible?).to eq(true)
end

Then(/^the preview displays applet "([^"]*)" of type "([^"]*)"$/) do |applet_title, type|
  @ehmp = PobPreviewWorkspace.new unless @ehmp.is_a? PobPreviewWorkspace
  applets_in_preview = @ehmp.array_of_applets

  preview = PreviewApplet.new(applet_title, type)
  expect(applets_in_preview).to include(preview), "#{type} #{applet_title} was not displayed in the preview.  "
end

Then(/^the preview title is "([^"]*)"$/) do |title|
  @ehmp = PobAlert.new
  expect(@ehmp.mdl_alert_title.visible?).to eq(true)
  expect(@ehmp.mdl_alert_title.text.upcase).to eq(title.upcase)
end

Then(/^the Preview window displays$/) do
  ehmp = PobPreviewWorkspace.new
  expect(ehmp.wait_for_fld_workspace_preview).to eq(true)
  ehmp.wait_for_fld_preview_applets
  expect(ehmp).to have_btn_close_preview
end

Then(/^the Preview window has a Customize button$/) do
  ehmp = PobPreviewWorkspace.new
  ehmp.wait_for_btn_customize
  expect(ehmp).to have_btn_customize
end

When(/^the user selects the Preview window Customize button$/) do
  ehmp = PobPreviewWorkspace.new
  expect(ehmp.wait_for_btn_customize).to eq(true)
  ehmp.btn_customize.click
end

When(/^the user selects the Preview link for a pre\-defined screen$/) do
  ehmp = PobWorkspaceManager.new
  ehmp.wait_for_fld_predefined_previews
  expect(ehmp.fld_predefined_previews.length).to be > 0
  ehmp.fld_predefined_previews[0].click
end

Then(/^the Preview window does not have a Customize button$/) do
  ehmp = PobPreviewWorkspace.new
  ehmp.wait_for_btn_customize(3)
  expect(ehmp).to_not have_btn_customize
end
