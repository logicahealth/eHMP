Given(/^user hovers over the Consults summary view row$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_for_tbl_consult_rows
  expect(ehmp.tbl_consult_rows.length).to be > 0
  ehmp.tbl_consult_rows[0].hover
end

Given(/^user can view the Quick Menu Icon in Consults applet$/) do
  ehmp = PobConsultApplet.new
  QuickMenuActions.verify_quick_menu ehmp
end

Given(/^Quick Menu Icon is collapsed in Consults applet$/) do
  ehmp = PobConsultApplet.new
  QuickMenuActions.verify_quick_menu_collapsed ehmp
end

When(/^Quick Menu Icon is selected in Consults applet$/) do
  ehmp = PobConsultApplet.new
  QuickMenuActions.select_quick_menu(ehmp)
end

Then(/^user can see the options in the Consults applet$/) do |table|
  ehmp = PobConsultApplet.new
  QuickMenuActions.verify_menu_options ehmp, table
end

When(/^user hovers over the Consults expanded view row$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_for_tbl_consult_rows
  expect(ehmp.tbl_consult_rows.length).to be > 0
  ehmp.tbl_consult_rows[0].hover
end

Given(/^user selects the detail view from Quick Menu Icon of Consults applet$/) do
  ehmp = PobConsultApplet.new
  QuickMenuActions.open_menu_click_detail_button ehmp
end

Given(/^user selects the detail view from Quick Menu Icon of expanded Consults applet$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_until_fld_consult_created_on_visible
  expect(ehmp).to have_fld_consult_created_on
  ehmp.fld_consult_created_on.click
  ehmp.wait_until_tbl_consult_rows_visible
  rows = ehmp.tbl_consult_rows
  expect(rows.length > 0).to eq(true), "There needs to be at least one row present, found only '#{rows.length}'"
  rows[0].hover
  QuickMenuActions.open_menu_click_detail_button ehmp
end

Given(/^user navigates to staff expanded consult applet$/) do
  navigate_in_ehmp "#/staff/consults-staff-full"
end
