Given(/^the staff view screen has Workspace Selection dropdown button and named Homepage$/) do
  ehmp = PobStaffView.new
  expect(ehmp.workspace_nav.wait_for_context_name).to eq(true)
  expect(ehmp.workspace_nav.context_name.text.upcase).to eq('STAFF WORKSPACE:')
  expect(ehmp.workspace_nav.fld_screen_name.text.upcase).to eq('HOMEPAGE')
end

Then(/^dropdown list has HOMEPAGE option$/) do
  ehmp = PobStaffView.new
  ehmp.workspace_nav.workspace_links_by_name "Homepage"
  expect(ehmp.workspace_nav.fld_named_workspace.length).to eq(1)

  actual_title = ehmp.workspace_nav.fld_named_workspace[0].text.upcase
  if ehmp.workspace_nav.fld_named_workspace_sr.length > 0
    p actual_title
    actual_title.sub! ehmp.workspace_nav.fld_named_workspace_sr[0].text.upcase, ''
    p actual_title
  end
  expect(actual_title.strip).to eq('HOMEPAGE')
end

Then(/^dropdown list has Discharge Care Coordination option$/) do
  ehmp = PobStaffView.new
  ehmp.workspace_nav.workspace_links_by_name "Discharge Care Coordination"
  expect(ehmp.workspace_nav.fld_named_workspace.length).to eq(1)

  actual_title = ehmp.workspace_nav.fld_named_workspace[0].text.upcase
  if ehmp.workspace_nav.fld_named_workspace_sr.length > 0
    p actual_title
    actual_title.sub! ehmp.workspace_nav.fld_named_workspace_sr[0].text.upcase, ''
    p actual_title
  end
  expect(actual_title.strip).to eq('Discharge Care Coordination'.upcase)
end

When(/^user selects Workspace Selector dropdown button menu option for the HOMEPAGE$/) do
  ehmp = PobStaffView.new
  expect(ehmp.workspace_nav.wait_for_context_name).to eq(true)
  ehmp.workspace_nav.context_name.click
end

Given(/^user selects HOMEPAGE option$/) do
  ehmp = PobStaffView.new
  ehmp.workspace_nav.workspace_links_by_name "Homepage"
  expect(ehmp.workspace_nav.fld_named_workspace.length).to eq(1)
  ehmp.workspace_nav.fld_named_workspace[0].click
end

Then(/^the Worspace Editor is displaying the "([^"]*)" workspace$/) do |title|
  page = WorkspaceEditor.new
  expect(page.wait_for_fld_screen_title).to eq(true)
  expect(page.fld_screen_title.text.upcase).to eq(title.upcase)
end
