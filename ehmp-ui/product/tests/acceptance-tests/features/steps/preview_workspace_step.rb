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
