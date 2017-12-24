Then(/^user navigates to expanded activities applet$/) do
  ehmp = PobActivitesApplet.new
  ehmp.load
  expect(ehmp).to be_displayed
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time * 2)
  wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.tbl_activity_rows) }
  ehmp.menu.wait_until_fld_screen_name_visible
  expect(ehmp.menu.fld_screen_name.text.upcase).to have_text("Activities".upcase)
end

Then(/^the user takes note of number of existing activities$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  wait.until { infinite_scroll_other('[data-appletid=activities] tbody') }
  @number_existing_activities = PobActivitesApplet.new.number_expanded_applet_rows
  p "number number_existing_activities: #{@number_existing_activities}"
end

When(/^user refreshes activities applet$/) do
  applet_refresh_action("activities")
end

Then(/^an activity is added to the applet$/) do
  ehmp = PobActivitesApplet.new

  ehmp.wait_for_tbl_activity_rows
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  wait.until { infinite_scroll_other('[data-appletid=activities] tbody') }
  @number_existing_activities_now = PobActivitesApplet.new.number_expanded_applet_rows
  p "number_existing_activities_now: #{@number_existing_activities_now}"
  wait.until { ehmp.number_expanded_applet_rows == @number_existing_activities_now }
  expect(@number_existing_activities_now == @number_existing_activities +1).to be(true)
end

Then(/^user makes sure there is at least one activity$/) do
  ehmp = PobActivitesApplet.new
  ehmp.wait_for_tbl_activity_rows
  expect(ehmp.tbl_activity_rows.length).to be > 0, "Data was not found in Activities applet"
end

Then(/^user makes sure there is at least one "(.*?)" activity$/) do |type|
  ehmp = PobActivitesApplet.new
  ehmp.wait_for_tbl_activity_rows
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  wait.until { infinite_scroll_other('[data-appletid=activities] tbody') }
  expect(ehmp.activity_types).to include(type)
end

Then(/^the user sorts the Activity applet by column Domain$/) do
  ehmp = PobActivitesApplet.new
  ehmp.wait_for_fld_domain_header
  expect(ehmp).to have_fld_domain_header
  ehmp.fld_domain_header.click  
end

Then(/^the user sorts the Activity applet by column Created On$/) do
  ehmp = PobActivitesApplet.new
  ehmp.wait_for_fld_activity_created_on
  expect(ehmp).to have_fld_activity_created_on
  ehmp.fld_activity_created_on.click  
end

Then(/^the Activity applet is sorted in alphabetic order based on column Domain$/) do
  ehmp = PobActivitesApplet.new
  ehmp.wait_for_fld_domain_column_data 
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  wait.until { infinite_scroll_other('[data-appletid=activities] tbody') }  
  column_values = ehmp.fld_domain_column_data
  expect(column_values.length).to be >= 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

Then(/^activities applet has headers$/) do |table|
  ehmp = PobActivitesApplet.new
  ehmp.wait_until_fld_activity_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(ehmp.fld_activity_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on Activities Applet"
  end
end

Then(/^the Activities applet is sorted in reverse alphabetic order based on column Domain$/) do
  ehmp = PobActivitesApplet.new
  ehmp.wait_for_fld_domain_column_data 
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  wait.until { infinite_scroll_other('[data-appletid=activities] tbody') }   
  column_values = ehmp.fld_domain_column_data
  expect(column_values.length).to be >= 2
  is_descending = descending? column_values
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_descending == false}"
end

When(/^user filters the activity applet with text "([^"]*)"$/) do |filter_text|    
  ehmp = PobActivitesApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { infinite_scroll_other("[data-appletid=activities] tbody") }
  row_count = ehmp.tbl_activity_rows.length
  ehmp.wait_until_fld_applet_text_filter_visible
  expect(ehmp).to have_fld_applet_text_filter
  ehmp.fld_applet_text_filter.set filter_text
  ehmp.fld_applet_text_filter.native.send_keys(:enter)
  wait.until { infinite_scroll_other("[data-appletid=activities] tbody") }
  wait.until { row_count != ehmp.tbl_activity_rows.length }
end

Then(/^the activity table only diplays rows including text "([^"]*)"$/) do |input_text|    
  ehmp = PobActivitesApplet.new
  ehmp.wait_until_fld_activity_column_data_visible
  expect(only_text_exists_in_list(ehmp.fld_activity_column_data, "#{input_text}")).to eq(true), "Not all returned results include #{input_text}"
end

Then(/^user views the details of the consult activity$/) do
  ehmp = PobActivitesApplet.new
  ehmp.wait_until_fld_activity_created_on_visible
  expect(ehmp).to have_fld_activity_created_on
  ehmp.fld_activity_created_on.click  
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  wait.until { infinite_scroll_other('[data-appletid=activities] tbody') }
  is_descending = descending? ehmp.fld_activity_created_on_column_data
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_descending == false}"
  ehmp.wait_until_tbl_activity_rows_visible(DefaultTiming.default_table_row_load_time * 2)
  rows = ehmp.tbl_activity_rows
  expect(rows.length > 0).to eq(true), "There needs to be at least one row present, found only '#{rows.length}'"
  rows[0].click
end

Then(/^activities applet shows only activities that have are in "([^"]*)" mode$/) do |input_text|
  ehmp = PobActivitesApplet.new
  ehmp.wait_until_fld_activity_mode_column_data_visible
  expect(only_text_exists_in_list(ehmp.fld_activity_mode_column_data, "#{input_text}")).to eq(true), "Not all returned results include #{input_text}"
end

Then(/^user selects to show only "([^"]*)" activities$/) do |input|
  ehmp = PobActivitesApplet.new
  ehmp.wait_until_ddL_activity_display_only_visible
  ehmp.ddL_activity_display_only.select input
end

Then(/^activities applet shows both Open and Closed activities$/) do
  ehmp = PobActivitesApplet.new
  ehmp.wait_until_fld_activity_mode_column_data_visible
  mode_array = Array.new
  mode_array.push("Open")
  mode_array.push("Closed")
  expect(compare_text_in_list(ehmp.fld_activity_mode_column_data, "#{mode_array}")).to eq(true), "Returned rows doesn't include Open and Closed"
end

Then(/^user verifies activities applet primary filter contains options$/) do |table|
  ehmp = PobActivitesApplet.new
  ehmp.wait_for_ddL_activity_primary_filter
  ehmp.wait_until_fld_activity_primary_filter_options_visible
  table.rows.each do |options|
    expect(object_exists_in_list(ehmp.fld_activity_primary_filter_options, "#{options[0]}")).to eq(true), "#{options[0]} was not found on activities Applet display options"
  end
end

Then(/^user selects primary filter "([^"]*)"$/) do |filter|
  ehmp = PobActivitesApplet.new
  ehmp.wait_until_ddL_activity_primary_filter_visible
  ehmp.ddL_activity_primary_filter.select filter
end

Then(/^activities applet only shows activities that are created by "([^"]*)"$/) do |input_text|
  ehmp = PobActivitesApplet.new
  ehmp.wait_until_fld_activity_created_by_column_data_visible
  expect(only_text_exists_in_list(ehmp.fld_activity_created_by_column_data, "#{input_text}")).to eq(true), "Not all returned results include #{input_text}"
end

When(/^user hovers over the Activities applet row$/) do
  ehmp = PobActivitesApplet.new
  ehmp.wait_for_tbl_activity_rows
  expect(ehmp).to have_tbl_activity_rows
  rows = ehmp.tbl_activity_rows
  expect(rows.length).to be > 0
  rows[0].hover
end

Given(/^user can view the Quick Menu Icon in Activities applet$/) do
  ehmp = PobActivitesApplet.new
  QuickMenuActions.verify_quick_menu ehmp
end

Given(/^Quick Menu Icon is collapsed in Activities applet$/) do
  ehmp = PobActivitesApplet.new
  QuickMenuActions.verify_quick_menu_collapsed ehmp
end

When(/^Quick Menu Icon is selected in Activities applet$/) do
  ehmp = PobActivitesApplet.new
  QuickMenuActions.select_quick_menu ehmp
end

Then(/^user can see the options in the Activities applet$/) do |table|
  ehmp = PobActivitesApplet.new
  QuickMenuActions.verify_menu_options ehmp, table
end

When(/^user selects the detail view from Quick Menu Icon of Activities applet$/) do
  ehmp = PobActivitesApplet.new
  QuickMenuActions.open_menu_click_detail_button ehmp
end

