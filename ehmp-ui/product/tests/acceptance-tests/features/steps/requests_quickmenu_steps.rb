Given(/^user hovers over the Requests summary view row$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_for_tbl_request_rows
  expect(ehmp.tbl_request_rows.length).to be > 0
  ehmp.tbl_request_rows[0].hover
end

Given(/^user can view the Quick Menu Icon in Requests applet$/) do
  ehmp = PobRequestApplet.new
  QuickMenuActions.verify_quick_menu ehmp
end

Given(/^Quick Menu Icon is collapsed in Requests applet$/) do
  ehmp = PobRequestApplet.new
  QuickMenuActions.verify_quick_menu_collapsed ehmp
end

When(/^Quick Menu Icon is selected in Requests applet$/) do
  ehmp = PobRequestApplet.new
  QuickMenuActions.select_quick_menu(ehmp)
end

Then(/^user can see the options in the Requests applet$/) do |table|
  ehmp = PobRequestApplet.new
  QuickMenuActions.verify_menu_options ehmp, table
end

Given(/^user navigates to staff expanded Requests applet$/) do
  navigate_in_ehmp "#/staff/requests-staff-full"
end

When(/^user hovers over the Requests expanded view row$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_for_tbl_request_rows
  expect(ehmp.tbl_request_rows.length).to be > 0
  ehmp.tbl_request_rows[0].hover
end

Given(/^user hovers over the Request summary view row$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_for_tbl_request_rows
  expect(ehmp.tbl_request_rows.length).to be > 0
  ehmp.tbl_request_rows[0].hover
end

Given(/^user navigates to expanded Requests applet$/) do
  ehmp = PobRequestApplet.new
  ehmp.load
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { ehmp.applet_loaded? }
end

Given(/^user selects the detail view from Quick Menu Icon of Request applet$/) do  
  ehmp = PobRequestApplet.new 
  QuickMenuActions.open_menu_click_detail_button ehmp
end
