Then(/^the Inpatient Dischange Follow Up Expanded applet is displayed$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  ehmp = DischargeFollowup.new
  wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.fld_discharge_followup_table_row) }
  ehmp.wait_for_discharge_followup_applet
  expect(ehmp).to have_discharge_followup_applet
  expect(ehmp).to have_discharge_followup_expanded
end

Then(/^the title of the Dischange Follow Up applet is "(.*?)"$/) do |applet_title|
  ehmp = DischargeFollowup.new
  ehmp.wait_for_fld_applet_title
  expect(ehmp.fld_applet_title.text.upcase).to eq(applet_title.upcase)
end

Then(/^Discharge Follow Up applet has headers$/) do |table|
  ehmp = DischargeFollowup.new
  ehmp.wait_until_fld_discharge_followup_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(ehmp.fld_discharge_followup_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on Consult Applet"
  end
end

When(/^the user selects the Discharge Care Coordination option from the dropdown list$/) do
  steps %{
    When user selects Workspace Selector dropdown button menu option for the HOMEPAGE
    Then dropdown list has Discharge Care Coordination option 
  }
  ehmp = PobStaffView.new
  ehmp.workspace_nav.workspace_links_by_name "Discharge Care Coordination"
  ehmp.workspace_nav.fld_named_workspace[0].click
end

Then(/^the Discharge Care Coordination screen is active$/) do
  screen = DischargeFollowup.new
  expect(screen.current_url).to end_with "discharge-care-coordination"
  expect(screen).to be_displayed
end
