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
  
  # remove filters if any applied
  ehmp.wait_for_btn_applet_remove_filters(1)
  if ehmp.has_btn_applet_remove_filters?
    ehmp.btn_applet_remove_filters.click
    # once we remove filters, the applet will need to reload
    wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.tbl_request_rows) }
  end
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
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  wait.until { infinite_scroll_other("[data-appletid=requests] tbody") }
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
  wait.until { infinite_scroll_other("[data-appletid=requests] tbody") }
  wait.until { ehmp.number_expanded_applet_rows == @number_existing_requests + 1 }
end

Then(/^user accepts the request$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_btn_request_accept_visible
  expect(ehmp).to have_btn_request_accept
  ehmp.btn_request_accept.click
  verify_and_close_growl_alert_pop_up("SUCCESSFULLY")
end

Then(/^user makes sure there exists at least one request$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_tbl_request_rows_visible
  rows = ehmp.number_expanded_applet_rows
  expect(ehmp.number_expanded_applet_rows > 0).to eq(true), "There needs to be at least one row present, found only '#{rows}'"
end

Then(/^user views the details of the request$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_request_created_on_visible
  expect(ehmp).to have_fld_request_created_on
  ehmp.fld_request_created_on.click
  ehmp.wait_until_tbl_request_rows_visible
  rows = ehmp.tbl_request_rows
  expect(rows.length > 0).to eq(true), "There needs to be at least one row present, found only '#{rows.length}'"
  rows[0].click
end

Then(/^user hovers over the first request row$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_request_created_on_visible
  expect(ehmp).to have_fld_request_created_on
  ehmp.fld_request_created_on.click
  ehmp.wait_until_tbl_request_rows_visible
  rows = ehmp.tbl_request_rows
  expect(rows.length > 0).to eq(true), "There needs to be at least one row present, found only '#{rows.length}'"
  rows[0].hover
end

Then(/^the detail modal for request displays$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_modal_detail_fields_visible
  expect(ehmp.fld_modal_detail_fields.length > 0).to eq(true), "Modal Details doesn't display"
end

Then(/^user clicks on the Edit Request Button from Actions dropdown$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_btn_modal_detail_actions_visible
  expect(ehmp).to have_btn_modal_detail_actions, "Actions button doesn't display on Activity Details form"
  ehmp.btn_modal_detail_actions.click
  ehmp.wait_until_btn_modal_detail_edit_request_visible
  expect(ehmp).to have_btn_modal_detail_edit_request, "Edit Request button doesn't display"
  ehmp.btn_modal_detail_edit_request.click
end

Then(/^the request edit form should be displayed$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_btn_activity_details_visible
  expect(ehmp).to have_btn_activity_details, "Request Edit form doesn't display"
end

Then(/^the response task form for request displays$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_response_header_visible(20)
  expect(ehmp).to have_fld_response_header, "Response task form doesn't display"
  expect(ehmp.wait_for_fld_list_action_options).to eq(true), "Response form didn't load completely"
  #user has to cancel out of this form so we can proceed with logout
  ehmp.wait_until_btn_cancel_visible
  expect(ehmp).to have_btn_cancel
  ehmp.btn_cancel.click
  ehmp.wait_until_btn_confirm_cancel_visible
  expect(ehmp).to have_btn_confirm_cancel
   
  max_attempt = 3
  begin
    ehmp.btn_confirm_cancel.click
    ehmp.wait_until_btn_confirm_cancel_invisible
  rescue => e
    max_attempt-=1
    raise e if max_attempt <= 0
    p "#{e} reattempt"
    sleep 0.5
    retry if max_attempt > 0
  end
  
  ehmp = PobCommonElements.new  
  expect(ehmp.action_tray.wait_for_fld_my_task_header(20)).to eq(true)
end

Then(/^the user sorts the Request applet by column Request$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_request_header_visible
  expect(ehmp).to have_fld_request_header
  ehmp.fld_request_header.click  
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { infinite_scroll_other("[data-appletid=requests] tbody") }
end

Then(/^the Request applet is sorted in alphabetic order based on column Request$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_for_fld_request_column_data
    
  column_values = ehmp.fld_request_column_data
  expect(column_values.length).to be >= 2
  is_ascending = backgrid_ascend? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

Then(/^the Request applet is sorted in reverse alphabetic order based on column Request$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_for_fld_request_column_data
    
  column_values = ehmp.fld_request_column_data
  expect(column_values.length).to be >= 2
  is_descending = backgrid_descend? column_values
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_descending == false}"
end

Then(/^user discontinues the request$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_btn_discontinue_visible
  expect(ehmp).to have_btn_discontinue
  ehmp.btn_discontinue.click  
  ehmp.wait_until_fld_request_comment_visible
  ehmp.fld_request_comment.set "test discontinue"
  ehmp.fld_request_comment.native.send_keys(:enter)
  ehmp.wait_until_btn_submit_accept_visible
  expect(ehmp).to have_btn_submit_accept
  ehmp.btn_submit_accept.click 
  verify_and_close_growl_alert_pop_up("Request discontinued with no errors")
  max_attempt = 4
  begin
    ehmp.wait_until_btn_request_modal_close_visible
    expect(ehmp).to have_btn_request_modal_close
    ehmp.btn_request_modal_close.click 
    ehmp.wait_until_btn_request_modal_close_invisible 
    ModalElements.new.wait_until_fld_main_modal_invisible
  rescue Exception => e
    p "Exception received: trying again"
    max_attempt-=1
    raise e if max_attempt <= 0
    retry if max_attempt > 0
  end   
end

Then(/^Request applet shows only requests that have are in "([^"]*)" state$/) do |input_text|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_state_column_data_visible
  expect(only_text_exists_in_list(ehmp.fld_state_column_data, "#{input_text}")).to eq(true), "Not all returned results include #{input_text}"
end

Then(/^Request applet shows only requests that are in "([^"]*)" or "([^"]*)" state$/) do |input1, input2|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_state_column_data_visible
  text_array = Array.new
  text_array.push("#{input1}")
  text_array.push("#{input2}")
  expect(compare_text_in_list(ehmp.fld_state_column_data, "#{text_array}")).to eq(true), "Not all returned results include #{input1} or #{input2}"
end

Then(/^user selects to show only "([^"]*)" requests$/) do |input|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_ddL_display_only_visible
  ehmp.ddL_display_only.select input
end

Then(/^Request applet shows all requests that are in "([^"]*)", "([^"]*)" or "([^"]*)" state$/) do |input1, input2, input3|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_state_column_data_visible
  text_array = Array.new
  text_array.push("#{input1}")
  text_array.push("#{input2}")
  text_array.push("#{input3}")
  expect(compare_text_in_list(ehmp.fld_state_column_data, "#{text_array}")).to eq(true), "Not all returned results include #{input1} or #{input2} or #{input3}"
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
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { infinite_scroll_other("[data-appletid=requests] tbody") }
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

Then(/^user filters the Request applet by text "([^"]*)"$/) do |filter_text|
  ehmp = PobRequestApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { infinite_scroll_other("[data-appletid=requests] tbody") }
  row_count = ehmp.tbl_request_rows.length
  ehmp.wait_until_fld_applet_text_filter_visible
  expect(ehmp).to have_fld_applet_text_filter
  ehmp.fld_applet_text_filter.set filter_text
  ehmp.fld_applet_text_filter.native.send_keys(:enter)
  wait.until { infinite_scroll_other("[data-appletid=requests] tbody") }
  wait.until { row_count != ehmp.tbl_request_rows.length }
end

Then(/^Request applet table only diplays rows including text "([^"]*)"$/) do |input_text|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_request_column_data_visible
  expect(only_text_exists_in_list(ehmp.fld_request_column_data, "#{input_text}")).to eq(true), "Not all returned results include #{input_text}"
end

Then(/^flagged checkbox is unchecked by default in Request Applet$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_chk_flag_visible
  expect(ehmp.chk_flag.checked?).to eq(false), "Flagged checkbox is checked, it should be unchecked by default"
end

Then(/^user enters a request details text with timestamp "([^"]*)"$/) do |request_details|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_request_details_visible
  expect(ehmp).to have_fld_request_details
  @text_search_term = Time.now.strftime("%m/%d/%Y %H%M")
  detail = request_details + ' ' + @text_search_term
  # p detail
  ehmp.fld_request_details.set detail
  ehmp.fld_request_details.native.send_keys(:enter)
end

Then(/^user creates a new Request "([^"]*)" with details "([^"]*)"$/) do |title, detail|  
  steps %{
    And user navigates to expanded request applet
    And the user takes note of number of existing requests
    And user adds a new request titled "#{title}"
    And user enters a request details text with timestamp "#{detail}"
    And user accepts the request
    Then a request is added to the applet
  }
end

Then(/^user sets the earliest date to be a future date$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_btn_calendar_earliest_visible
  future_date = Date.today + 2
  ehmp.btn_calendar_earliest.set future_date.strftime('%m/%d/%Y')
  ehmp.btn_calendar_earliest.native.send_keys(:enter)
end

Then(/^user selects the option "([^"]*)" from the Action drop down$/) do |action_type|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_action_visible
  ehmp.fld_action.click
  ehmp.wait_until_fld_list_action_options_visible
  expect(ehmp.fld_list_action_options.length > 0).to eq(true)
  ehmp.fld_action.select action_type 
end

Then(/^user enters a comment in the request field "([^"]*)"$/) do |request_comment|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_request_required_visible
  expect(ehmp).to have_fld_request_required
  comment = request_comment 
  # p comment
  max_attempt = 2
  begin
    ehmp.fld_request_required.native.send_keys [:end]
    ehmp.fld_request_required.native.send_keys [:shift, :home], :backspace
    ehmp.fld_request_required.set comment
    ehmp.fld_request_required.native.send_keys(:tab)
    expect(ehmp.fld_request_required.value.upcase).to eq(comment.upcase)
  rescue => e
    max_attempt -=1
    retry if max_attempt > 0
    raise e
  end
end

Then(/^user accepts the request response$/) do
  ehmp = PobRequestApplet.new
  ehmp.wait_until_btn_response_accept_visible
  expect(ehmp).to have_btn_response_accept
  ehmp.btn_response_accept.click
end

Then(/^user updates the request title "([^"]*)" with timestamp$/) do |request_title|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_request_title_visible
  expect(ehmp).to have_fld_request_title
  @text_update = Time.now.strftime("%d/%m/%Y %H%M")
  updated_title = request_title + ' ' + @text_update
  # p updated_title
  ehmp.fld_request_title.set updated_title
  ehmp.fld_request_title.native.send_keys(:enter)
end

Then(/^user sees the alert message "([^"]*)"$/) do |message|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_alert_message_visible
  expect(ehmp.fld_alert_message.text.upcase).to have_text(message.upcase)
end

Then(/^user can't select Mark as Complete from Action drop down$/) do 
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_action_visible
  ehmp.fld_action.click
  ehmp.wait_until_fld_list_action_options_visible
  expect(ehmp.fld_list_action_options.length > 0).to eq(true)
  expect(ehmp.fld_mark_as_complete['disabled']).to eq('true')
end

Then(/^the following actions are actionable$/) do |table|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_action_visible
  ehmp.fld_action.click
  ehmp.wait_until_fld_list_action_options_visible
  expect(ehmp.fld_list_action_options.length > 0).to eq(true)
  table.rows.each do |option|
    ehmp.action_options(option[0])
    ehmp.wait_until_fld_action_option_array_visible
    expect(ehmp.fld_action_option_array['disabled']).to be_nil
  end
end

Then(/^user enters a comment in the comment field "([^"]*)"$/) do |comment|
  ehmp = PobRequestApplet.new
  ehmp.wait_until_fld_request_comment_visible
  expect(ehmp).to have_fld_request_comment
  ehmp.fld_request_comment.set comment
  ehmp.fld_request_comment.native.send_keys(:enter)
end
