When(/^user adds a new request titled "([^"]*)"$/) do |request_title|
  ehmp = PobCommonElements.new
  ehmp.wait_until_btn_action_tray_visible
  expect(ehmp).to have_btn_action_tray
  ehmp.btn_action_tray.click
  ehmp.wait_until_btn_add_new_action_visible
  expect(ehmp).to have_btn_add_new_action
  ehmp.btn_add_new_action.click
  ehmp = PobRequestApplet.new
  ehmp.wait_until_btn_add_request_visible
  expect(ehmp).to have_btn_add_request
  rows = ehmp.btn_add_request
  expect(rows.length >=1).to eq(true), "Expected to find 2 orders button, found only #{rows.length}"
  rows[0].click
  PobCommonElements.new.wait_until_fld_modal_body_visible
  ehmp.wait_until_fld_request_title_visible
  ehmp.fld_request_title.set request_title
  ehmp.fld_request_title.native.send_keys(:enter)
end

Then(/^user navigates to expanded request applet$/) do
  ehmp = PobRequestApplet.new
  ehmp.load
  expect(ehmp).to be_displayed
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.tbl_request_rows) }
  ehmp.menu.wait_until_fld_screen_name_visible
  expect(ehmp.menu.fld_screen_name.text.upcase).to have_text("Requests".upcase)
end

Then(/^user unchecks the flagged checkbox from request applet$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_chk_flag_visible
  expect(ehmp).to have_chk_flag
  ehmp.chk_flag.click
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.tbl_request_rows) }
end

When(/^the user takes note of number of existing requests$/) do
  @number_existing_requests = PobRequestApplet.new.number_expanded_applet_rows
  p "number existing_requests: #{@number_existing_requests}"
end

When(/^user enters a request details text "([^"]*)"$/) do |request_details|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_request_details_visible
  ehmp.fld_request_details.set request_details
  ehmp.fld_request_details.native.send_keys(:enter)
end

Then(/^a request is added to the applet$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_for_tbl_request_rows
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  wait.until { ehmp.number_expanded_applet_rows == @number_existing_requests + 1 }
end

Then(/^user accepts the request$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_btn_request_accept_visible
  expect(ehmp).to have_btn_request_accept
  ehmp.btn_request_accept.click
  
  common_element = PobCommonElements.new
  common_element.wait_until_fld_tray_loader_message_visible
  expect(common_element).to have_fld_tray_loader_message
  common_element.wait_until_fld_tray_loader_message_invisible(30)
end

Then(/^user makes sure there exists at least one request$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_tbl_request_rows_visible
  rows = ehmp.number_expanded_applet_rows
  expect(ehmp.number_expanded_applet_rows > 0).to eq(true), "There needs to be at least one row present, found only '#{rows}'"
end

Then(/^user views the details of the request$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_tbl_request_rows_visible
  rows = ehmp.tbl_request_rows
  expect(rows.length > 0).to eq(true), "There needs to be at least one row present, found only '#{rows.length}'"
  rows[0].click
end

Then(/^the detail modal for request displays$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_modal_detail_fields_visible
  expect(ehmp.fld_modal_detail_fields.length > 0).to eq(true), "Modal Details doesn't display"
end

Then(/^the user sorts the Request applet by column Request$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_request_header_visible
  expect(ehmp).to have_fld_request_header
  ehmp.fld_request_header.click  
end

Then(/^the Request applet is sorted in alphabetic order based on column Request$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_for_fld_request_column_data
    
  column_values = ehmp.fld_request_column_data
  expect(column_values.length).to be >= 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

Then(/^the Request applet is sorted in reverse alphabetic order based on column Request$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_for_fld_request_column_data
    
  column_values = ehmp.fld_request_column_data
  expect(column_values.length).to be >= 2
  is_descending = descending? column_values
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_descending == false}"
end

Then(/^user discontinues the request$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_btn_discontinue_visible
  expect(ehmp).to have_btn_discontinue
  ehmp.btn_discontinue.click  
  ehmp.wait_until_fld_request_discontinue_comment_visible
  ehmp.fld_request_discontinue_comment.set "test discontinue"
  ehmp.fld_request_discontinue_comment.native.send_keys(:enter)
  ehmp.wait_until_btn_submit_accept_visible
  expect(ehmp).to have_btn_submit_accept
  ehmp.btn_submit_accept.click 
  ehmp.wait_until_btn_reqeust_modal_close_visible
  expect(ehmp).to have_btn_reqeust_modal_close
  ehmp.btn_reqeust_modal_close.click 
  ehmp.wait_until_btn_reqeust_modal_close_invisible    
end

Then(/^Reqeust applet shows only requests that have are in "([^"]*)" state$/) do |input_text|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_state_column_data_visible
  expect(only_text_exists_in_list(ehmp.fld_state_column_data, "#{input_text}")).to eq(true), "Not all returned results include #{input_text}"
end

Then(/^user selects to show only "([^"]*)" requests$/) do |input|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_ddL_display_only_visible
  ehmp.ddL_display_only.select input
end

Then(/^Request applet shows both active and completed requests$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_state_column_data_visible
  expect(compare_text_in_list(ehmp.fld_state_column_data, "Active", "Completed")).to eq(true), "Returned rows doesn't include Active and Closed"
end

Then(/^request applet in staff view page has headers$/) do |table|
  @ehmp = PobRequestApplet.new
  @ehmp.wait_until_fld_request_steffview_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.fld_request_steffview_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on Requests Applet"
  end
end

Then(/^user vrifies the requests applet has following patients listed$/) do |table|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_request_patient_column_data_visible
  table.rows.each do |patients|
    expect(object_exists_in_list(ehmp.fld_request_patient_column_data, "#{patients[0]}")).to eq(true), "#{patients[0]} was not found"
  end
end

Then(/^user expands the assingment field of requests applet$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_ddl_request_assignment_visible
  expect(ehmp).to have_ddl_request_assignment
  ehmp.ddl_request_assignment.click  
end

Then(/^user verifies request assignments field contains options$/) do |table|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_request_assignement_options_visible
  table.rows.each do |options|
    expect(object_exists_in_list(ehmp.fld_request_assignement_options, "#{options[0]}")).to eq(true), "#{options[0]} was not found"
  end
end

Then(/^user verifies request assignments field does not contain option$/) do |table|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_request_assignement_options_visible
  table.rows.each do |options|
    expect(object_exists_in_list(ehmp.fld_request_assignement_options, "#{options[0]}")).to eq(false), "#{options[0]} was found"
  end
end

