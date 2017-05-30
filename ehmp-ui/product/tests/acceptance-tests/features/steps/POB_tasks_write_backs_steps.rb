Then(/^user navigates to expanded tasks applet$/) do
  ehmp = PobTasksApplet.new
  ehmp.load
  expect(ehmp).to be_displayed
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.tbl_task_rows) }
  ehmp.menu.wait_until_fld_screen_name_visible
  expect(ehmp.menu.fld_screen_name.text.upcase).to have_text("Tasks".upcase)
end

Then(/^user navigates to expanded tasks applet from summary view$/) do
  ehmp = PobTasksApplet.new
  ehmp.scroll_into_view

  ehmp.wait_until_btn_applet_expand_view_visible
  expect(ehmp).to have_btn_applet_expand_view
  max_attempt = 1
  begin
    ehmp.btn_applet_expand_view.click
    ehmp.wait_until_btn_applet_minimize_visible
  rescue Exception => e
    max_attempt -= 1
    retry if max_attempt >= 0
    raise e
  end
  
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.tbl_task_rows) }
  ehmp.menu.wait_until_fld_screen_name_visible
  expect(ehmp.menu.fld_screen_name.text.upcase).to have_text("Tasks".upcase)
end

Then(/^the user takes note of number of existing tasks$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  wait.until { infinite_scroll_other("#data-grid-todo_list tbody") }
  @number_existing_tasks = PobTasksApplet.new.number_expanded_applet_rows
  p "number existing_tasks: #{@number_existing_tasks}"
end

Then(/^a task is added to the applet$/) do
  ehmp = PobTasksApplet.new
  ehmp.wait_for_tbl_task_rows
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  wait.until { infinite_scroll_other("#data-grid-todo_list tbody") }
  wait.until { ehmp.number_expanded_applet_rows == @number_existing_tasks + 1 }
end

Given(/^user chooses "([^"]*)" from assigned to dropdown$/) do |choice|
  ehmp = PobTasksApplet.new
  ehmp.wait_until_ddl_assigned_to_visible
  ehmp.ddl_assigned_to.select choice
end

Given(/^user selects the task name "([^"]*)"$/) do |task_name|
  ehmp = PobTasksApplet.new
  ehmp.wait_until_tbl_task_rows_visible
  expect(ehmp).to have_tbl_task_rows
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  wait.until { infiniate_scroll("#data-grid-todo_list tbody") }
  click_an_object_from_list(ehmp.tbl_task_rows, task_name)
end

Then(/^task modal has buttons "([^"]*)", "([^"]*)" and "([^"]*)"$/) do |unlock, activity_detail, close|
  ehmp = PobTasksApplet.new
  ehmp.wait_for_btn_unlock
  expect(ehmp).to have_btn_unlock
  ehmp.wait_for_btn_activity_details
  expect(ehmp).to have_btn_activity_details
  ehmp.wait_for_btn_close
  expect(ehmp).to have_btn_close  
end

Then(/^user makes sure there exists at least one task$/) do
  ehmp = PobTasksApplet.new
  ehmp.wait_until_tbl_task_rows_visible
  rows = ehmp.number_expanded_applet_rows
  expect(ehmp.number_expanded_applet_rows > 0).to eq(true), "There needs to be at least one row present, found only '#{rows}'"
end

Then(/^user completes the task$/) do
  ehmp = PobTasksApplet.new
  ehmp.wait_until_ddl_action_visible
  ehmp.ddl_action.select "Mark as Complete"
  ehmp.wait_until_btn_accept_visible
  expect(ehmp).to have_btn_accept
  ehmp.btn_accept.click
  verify_and_close_growl_alert_pop_up("Successfully completed")
end

Then(/^Task applet shows only tasks that have are in "([^"]*)" state$/) do |input_text|
  ehmp = PobTasksApplet.new
  ehmp.wait_until_fld_col_status_data_visible
  expect(only_text_exists_in_list(ehmp.fld_col_status_data, "#{input_text}")).to eq(true), "Not all returned results include #{input_text}"
end

Then(/^user selects to show "([^"]*)" tasks$/) do |input|
  ehmp = PobTasksApplet.new
  ehmp.wait_until_ddl_display_options_visible
  ehmp.ddl_display_options.select input
end

Then(/^Task applet shows either active or inactive tasks$/) do
  ehmp = PobTasksApplet.new
  ehmp.wait_until_fld_col_status_data_visible
  expect(compare_text_in_list(ehmp.fld_col_status_data, "Active", "Inactive")).to eq(true), "Returned rows doesn't include Active and Inactive"
end

Then(/^user filters the Task applet by text "([^"]*)"$/) do |filter_text|
  ehmp = PobTasksApplet.new
  row_count = ehmp.tbl_task_rows.length
  ehmp.wait_until_fld_task_filter_button_visible
  expect(ehmp).to have_fld_task_filter_button
  ehmp.fld_task_filter_button.set filter_text
  ehmp.fld_task_filter_button.native.send_keys(:enter)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { row_count != ehmp.tbl_task_rows.length }
end

Then(/^task applet table only diplays rows including text "([^"]*)"$/) do |input_text|
  ehmp = PobTasksApplet.new
  ehmp.wait_until_fld_col_task_name_data_visible
  expect(only_text_exists_in_list(ehmp.fld_col_task_name_data, "#{input_text}")).to eq(true), "Not all returned results include #{input_text}"
end

Then(/^user verifies that the task applet display options are listed as$/) do |table|
  ehmp = PobTasksApplet.new
  ehmp.wait_until_fld_display_options_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(ehmp.fld_display_options, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on task Applet display options"
  end
end

Then(/^task applet selects active as the default display option$/) do 
  ehmp = PobTasksApplet.new
  ehmp.wait_until_ddl_display_options_visible
  expect(ehmp.ddl_display_options.text.upcase).to have_text("ACTIVE")
end

Then(/^user verifies that the task applet assigned to options are listed as$/) do |table|
  ehmp = PobTasksApplet.new
  ehmp.wait_until_fld_assigned_to_options_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(ehmp.fld_assigned_to_options, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on task Applet Assigned To options"
  end
end

Then(/^task applet selects Me as the default Assigned To option$/) do
  ehmp = PobTasksApplet.new
  ehmp.wait_until_ddl_assigned_to_visible
  expect(ehmp.ddl_assigned_to.text.upcase).to have_text("ME")
end

Then(/^task applet displays only tasks that are Assigned To "([^"]*)"$/) do |assigned_to|
  ehmp = PobTasksApplet.new
  ehmp.wait_until_fld_col_assigned_to_data_visible
  expect(only_text_exists_in_list(ehmp.fld_col_assigned_to_data, "#{assigned_to}")).to eq(true), "Not all returned results include #{assigned_to}"
end

Then(/^task applet displays the Tasks Date Filter$/) do
  ehmp = PobTasksApplet.new
  ehmp.wait_for_task_applet_gdf
  expect(ehmp).to have_task_applet_gdf
end

Then(/^task applet displays refresh button$/) do
  ehmp = PobTasksApplet.new
  ehmp.wait_for_btn_applet_refresh
  expect(ehmp).to have_btn_applet_refresh
end

Then(/^task applet displays filter button$/) do
  ehmp = PobTasksApplet.new
  ehmp.wait_for_btn_applet_filter_toggle
  expect(ehmp).to have_btn_applet_filter_toggle
end

Then(/^task applet displays help button$/) do
  ehmp = PobTasksApplet.new
  ehmp.wait_for_btn_applet_help
  expect(ehmp).to have_btn_applet_help
end

Then(/^task applet displays minimize button$/) do
  ehmp = PobTasksApplet.new
  ehmp.wait_for_btn_applet_minimize
  expect(ehmp).to have_btn_applet_minimize
end

Then(/^the user sorts the Task applet by column Task Name$/) do
  ehmp = PobTasksApplet.new
  ehmp.wait_until_fld_task_name_header_visible
  expect(ehmp).to have_fld_task_name_header
  ehmp.fld_task_name_header.click
end

Then(/^the Task applet is sorted in alphabetic order based on column Task Name$/) do
  ehmp = PobTasksApplet.new
  ehmp.wait_for_fld_col_task_name_data
    
  column_values = ehmp.fld_col_task_name_data
  expect(column_values.length).to be >= 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

Then(/^the Task applet is sorted in reverse alphabetic order based on column Task Name$/) do
  ehmp = PobTasksApplet.new
  ehmp.wait_for_fld_col_task_name_data
    
  column_values = ehmp.fld_col_task_name_data
  expect(column_values.length).to be >= 2
  is_descending = descending? column_values
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_descending == false}"
end

Then(/^task applet displays columns$/) do |table|
  ehmp = PobTasksApplet.new
  ehmp.wait_until_tbl_task_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(ehmp.tbl_task_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on task Applet"
  end
end

Then(/^patient view task applet displays Created On field in the correct format$/) do
  ehmp = PobTasksApplet.new
  ehmp.wait_until_fld_created_on_dates_patient_view_visible
  validate_date_format(ehmp.fld_created_on_dates_patient_view)
end

def validate_date_format(elements)
  ehmp = PobTasksApplet.new
  format = "%m/%d/%Y \n %H:%M"
  date_format = Regexp.new("\\d{2}\/\\d{2}\/\\d{4} \n \\d{2}:\\d{2}")
  elements.each do | temp_date |
    #p "verifying #{temp_date.text}"
    date_only = date_format.match(temp_date.text).to_s
    expect(date_only).to_not be_nil, "#{date_only} did not match expected format"
  end
end

Then(/^provider view task applet displays Created On field in the correct format$/) do
  ehmp = PobTasksApplet.new
  ehmp.wait_until_fld_created_on_dates_provider_view_visible
  validate_date_format(ehmp.fld_created_on_dates_provider_view)
end

Given(/^user navigates to expanded tasks applet from staff view$/) do
  ehmp = PobTasksApplet.new
  ehmp.wait_until_btn_applet_expand_view_visible
  expect(ehmp).to have_btn_applet_expand_view
  ehmp.btn_applet_expand_view.click
  ehmp.wait_until_btn_applet_minimize_visible
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.tbl_task_rows) }
end

