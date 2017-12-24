Given(/^discharge follow up workspace exists in the workspace drop down$/) do
  ehmp = PobDischargeFollowUpScreen.new
  ehmp.menu.wait_until_btn_workspace_select_visible
  expect(ehmp.menu).to have_btn_workspace_select
  ehmp.menu.btn_workspace_select.click
  expect(object_exists_in_list(ehmp.menu.fld_workspace_links, "Discharge Follow Up")).to eq(true), "Discharge Follow Up was not found"
end

When(/^user selects the workspace discharge follow up from workspace drop down$/) do
  ehmp = PobDischargeFollowUpScreen.new
  ehmp.menu.workspace_links_by_name("Discharge Follow Up")
  ehmp.menu.wait_for_fld_named_workspace
  expect(click_an_object_from_list(ehmp.menu.fld_named_workspace, "Discharge Follow Up")).to eq(true), "Workspace Discharge Follow Up cannot be selected"
end

Then(/^user can see the following applets and corresponding view types$/) do |table|
  ehmp = PobDischargeFollowUpScreen.new
  table.rows.each do |title, data_appletid, view_type|
    ehmp.applet_titles(data_appletid)
    expect(ehmp.wait_for_fld_applet_title).to eq(true)
    expect(ehmp.fld_applet_title.text.upcase).to have_text(title.upcase), "Failed looking for #{title}"
    expect(ehmp.fld_applet_view_type['data-view-type'].upcase).to have_text(view_type.upcase)
  end
end

Then(/^all the applets on discharge follow up screen are loaded successfully$/) do
  ehmp = PobDischargeFollowUpScreen.new
  ehmp.discharge_follow_up_applets_loaded?
end

Then(/^Documents applet filters are automatically collapsed when applet first loads$/) do
  ehmp = PobDischargeFollowUpScreen.new
  ehmp.wait_for_fld_documents_filter
  expect(ehmp).to have_no_fld_documents_filter
end

Then(/^Documents applet has following filters applied already when filter is opened$/) do |table|
  ehmp = PobDocumentsList.new
  ehmp.wait_for_btn_applet_filter_toggle
  expect(ehmp).to have_btn_applet_filter_toggle
  ehmp.btn_applet_filter_toggle.click
  ehmp = PobDischargeFollowUpScreen.new
  ehmp.wait_for_fld_pre_defined_filters
  table.rows.each do | item |
    expect(object_exists_in_list(ehmp.fld_pre_defined_filters, "#{item[0]}")).to eq(true), "Filter '#{item[0]}' was not found"
  end
end

Then(/^Documents applet has a group filter title called "([^"]*)"$/) do |filter_title|
  ehmp = PobDischargeFollowUpScreen.new
  ehmp.wait_for_fld_filter_title
  expect(ehmp).to have_fld_filter_title
  expect(ehmp.fld_filter_title.text.upcase).to have_text(filter_title.upcase)
end
