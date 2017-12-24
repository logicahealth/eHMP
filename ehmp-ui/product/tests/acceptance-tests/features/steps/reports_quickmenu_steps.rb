When(/^user hovers over the reports applet row$/) do
  ehmp = PobReportsApplet.new
  ehmp.wait_for_tbl_reports
  expect(ehmp).to have_tbl_reports
  rows = ehmp.tbl_reports
  expect(rows.length).to be > 0
  rows[0].hover
end

Given(/^user can view the Quick Menu Icon in reports applet$/) do
  ehmp = PobReportsApplet.new
  QuickMenuActions.verify_quick_menu ehmp
end

Given(/^Quick Menu Icon is collapsed in reports applet$/) do
  ehmp = PobReportsApplet.new
  QuickMenuActions.verify_quick_menu_collapsed ehmp
end

When(/^Quick Menu Icon is selected in reports applet$/) do
  ehmp = PobReportsApplet.new
  QuickMenuActions.select_quick_menu(ehmp)
end

Then(/^user can see the options in the reports applet$/) do |table|
  ehmp = PobReportsApplet.new
  QuickMenuActions.verify_menu_options ehmp, table
end

When(/^user selects the detail view from Quick Menu Icon of reports applet$/) do
  ehmp = PobReportsApplet.new
  QuickMenuActions.open_menu_click_detail_button ehmp
end
