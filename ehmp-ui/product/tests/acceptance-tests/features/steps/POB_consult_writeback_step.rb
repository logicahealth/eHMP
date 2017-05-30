Then(/^user adds a new consult$/) do
  ehmp = PobCommonElements.new
  ehmp.wait_until_btn_action_tray_visible
  expect(ehmp).to have_btn_action_tray
  ehmp.btn_action_tray.click
  ehmp.wait_until_btn_add_new_action_visible
  expect(ehmp).to have_btn_add_new_action
  ehmp.btn_add_new_action.click
  ehmp = PobConsultApplet.new
  ehmp.wait_for_btn_add_consult_order
  rows = ehmp.btn_add_consult_order
  expect(rows.length >=2).to eq(true), "Expected to find 2 orders button, found only #{rows.length}"
  rows[0].click
  PobCommonElements.new.wait_until_fld_modal_body_visible
end

Then(/^user navigates to expanded consult applet$/) do
  ehmp = PobConsultApplet.new
  ehmp.load
  expect(ehmp).to be_displayed
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  #wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.tbl_consult_rows) }
  ehmp.menu.wait_until_fld_screen_name_visible
  expect(ehmp.menu.fld_screen_name.text.upcase).to have_text("Consults".upcase)
  
  # remove filters if any applied
  ehmp.wait_for_btn_applet_remove_filters(1)
  if ehmp.has_btn_applet_remove_filters?
    ehmp.btn_applet_remove_filters.click
    # once we remove filters, the applet needs to reload 
    wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.tbl_consult_rows) }
  end
end

Then(/^user unchecks the flagged checkbox from consult applet$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_until_chk_flag_visible
  expect(ehmp).to have_chk_flag
  ehmp.chk_flag.click
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.tbl_consult_rows) }
end

Then(/^the user takes note of number of existing consults$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  wait.until { infinite_scroll_other('#data-grid-consults tbody') }
  @number_existing_consults = PobConsultApplet.new.number_expanded_applet_rows
  p "number existing_consults: #{@number_existing_consults}"
end

When(/^user attempts to add a consult from consults applet header$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_until_btn_applet_add_visible
  expect(ehmp).to have_btn_applet_add
  ehmp.btn_applet_add.click
end

Then(/^a consult is added to the applet$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_for_tbl_consult_rows
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  wait.until { infinite_scroll_other("#data-grid-consults tbody") }
  wait.until { ehmp.number_expanded_applet_rows == @number_existing_consults + 1 }
end

Then(/^user selects "(.*?)" consult$/) do |consult_type|

  cmele = PobCommonElements.new
  ehmp = PobConsultApplet.new
  max_attempt = 2
  begin
    ehmp.wait_for_fld_consult_drop_down(30)
    expect(ehmp).to have_fld_consult_drop_down
    wait_until { ehmp.fld_consult_options.length > 0 }
    if ehmp.fld_consult_drop_down['x-is-expanded'].upcase.include? 'FALSE'    
      ehmp.fld_consult_drop_down.click
      expect(ehmp.wait_for_fld_consult_drop_down_open).to eq(true)
    end
    ehmp.wait_for_fld_consult_list_elements(30)
    cmele.wait_for_fld_pick_list_input
    expect(cmele).to have_fld_pick_list_input
    cmele.fld_pick_list_input.set consult_type
    ehmp.declare_consult_result_dropdown(consult_type)
    ehmp.wait_until_fld_consult_result_title_visible(20) #failing here
    cmele.fld_pick_list_input.native.send_keys(:enter)
    wait = Selenium::WebDriver::Wait.new(:timeout => 5)
    wait.until { ehmp.ddl_urgency.disabled? != true }  

    expect(ehmp.ddl_urgency.text.upcase).to have_text("Routine".upcase)
  rescue Exception => e
    p "Exception received: trying again #{e}"
    max_attempt-=1
    raise e if max_attempt <= 0
    retry if max_attempt > 0
  end
end

Then(/^user selects "(.*?)" for urgency$/) do |urgency|
  cmele = PobCommonElements.new  
  ehmp = PobConsultApplet.new
  ehmp.wait_until_ddl_urgency_visible
  expect(ehmp).to have_ddl_urgency
  ehmp.ddl_urgency.click
  ehmp.ddl_urgency.select urgency
end

Then(/^user enters a request reason text "(.*?)"$/) do |request_text|
  ehmp = PobConsultApplet.new
  ehmp.wait_until_fld_request_reason_visible
  expect(ehmp).to have_fld_request_reason
  ehmp.fld_request_reason.set request_text
end

Then(/^user accepts the consult$/) do
  ehmp = PobConsultApplet.new 
  ehmp.wait_for_btn_consult_accept
  expect(ehmp).to have_btn_consult_accept
  ehmp.btn_consult_accept.click
  common_element = PobCommonElements.new
  common_element.wait_for_fld_tray_loader_message(30)
  expect(common_element).to have_fld_tray_loader_message
  common_element.wait_until_fld_tray_loader_message_invisible(30)
end

Then(/^user answers all Neurosurgery questions with a "([^"]*)"$/) do |yes|
  ehmp = PobConsultApplet.new
  ehmp.wait_for_ddl_neuro_question1
  expect(ehmp).to have_ddl_neuro_question1
  ehmp.wait_until_ddl_neuro_question1_visible
  ehmp.ddl_neuro_question1.select yes
  ehmp.wait_for_ddl_neuro_question2
  expect(ehmp).to have_ddl_neuro_question2
  ehmp.wait_until_ddl_neuro_question2_visible
  ehmp.ddl_neuro_question2.select yes
  ehmp.wait_for_ddl_neuro_question3
  expect(ehmp).to have_ddl_neuro_question3
  ehmp.wait_until_ddl_neuro_question3_visible
  ehmp.ddl_neuro_question3.select yes
  ehmp.wait_for_ddl_neuro_question4
  expect(ehmp).to have_ddl_neuro_question4
  ehmp.wait_until_ddl_neuro_question4_visible
  ehmp.ddl_neuro_question4.select yes
end

Then(/^user overrides the BMI$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_for_ddl_BMI
  expect(ehmp).to have_ddl_BMI
  ehmp.wait_until_ddl_BMI_visible
  ehmp.ddl_BMI.select "Override"
end

Then(/^user provides a override reason "([^"]*)"$/) do |reason|
  ehmp = PobConsultApplet.new
  ehmp.wait_for_fld_override_reason
  expect(ehmp).to have_fld_override_reason
  ehmp.wait_until_fld_override_reason_visible
  ehmp.fld_override_reason.set reason
end

Then(/^user answers all Rheumatology questions with a "([^"]*)"$/) do |yes|
  ehmp = PobConsultApplet.new
  ehmp.wait_for_ddl_rhem_question1
  expect(ehmp).to have_ddl_rhem_question1
  ehmp.wait_until_ddl_rhem_question1_visible
  ehmp.ddl_rhem_question1.select yes
  ehmp.wait_for_ddl_rhem_question2
  expect(ehmp).to have_ddl_rhem_question2
  ehmp.wait_until_ddl_rhem_question2_visible
  ehmp.ddl_rhem_question2.select yes
  ehmp.wait_for_ddl_rhem_question3
  expect(ehmp).to have_ddl_rhem_question3
  ehmp.wait_until_ddl_rhem_question3_visible
  ehmp.ddl_rhem_question3.select yes
end

Then(/^user overrides orders and results$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_for_ddl_protein
  expect(ehmp).to have_ddl_protein
  ehmp.wait_until_ddl_protein_visible
  ehmp.ddl_protein.select "Override"
  ehmp.wait_for_ddl_factor
  expect(ehmp).to have_ddl_factor
  ehmp.wait_until_ddl_factor_visible
  ehmp.ddl_factor.select "Override"
end

Then(/^user makes sure there exists at least one consult$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_until_tbl_consult_rows_visible
  rows = ehmp.number_expanded_applet_rows
  expect(ehmp.number_expanded_applet_rows > 0).to eq(true), "There needs to be at least one row present, found only '#{rows}'"
end

Then(/^user views the details of the consult$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_until_fld_consult_created_on_visible
  expect(ehmp).to have_fld_consult_created_on
  ehmp.fld_consult_created_on.click
  ehmp.wait_until_tbl_consult_rows_visible
  rows = ehmp.tbl_consult_rows
  expect(rows.length > 0).to eq(true), "There needs to be at least one row present, found only '#{rows.length}'"
  rows[0].click
end

Then(/^the detail modal for consult displays$/) do
  ehmp = ModalElements.new
  ehmp.wait_until_modal_body_visible
  expect(ehmp).to have_modal_body  
end

Then(/^the user sorts the Consult applet by column Consult$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_until_fld_consult_header_visible
  expect(ehmp).to have_fld_consult_header
  ehmp.fld_consult_header.click  
end

Then(/^the Consult applet is sorted in alphabetic order based on column Consult$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_for_fld_consult_column_data
    
  column_values = ehmp.fld_consult_column_data
  expect(column_values.length).to be >= 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

Then(/^the Consult applet is sorted in reverse alphabetic order based on column Consult$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_for_fld_consult_column_data
    
  column_values = ehmp.fld_consult_column_data
  expect(column_values.length).to be >= 2
  is_descending = descending? column_values
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_descending == false}"
end

Then(/^user closes the consult detail modal$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_until_btn_close_consult_detail_modal_visible
  expect(ehmp).to have_btn_close_consult_detail_modal
  ehmp.btn_close_consult_detail_modal.click
  ehmp.wait_until_btn_close_consult_detail_modal_invisible
end

Then(/^user discontinues the consult$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_until_btn_discontinue_visible
  expect(ehmp).to have_btn_discontinue
  ehmp.btn_discontinue.click  
  ehmp.wait_until_ddl_discontinue_reason_visible
  ehmp.ddl_discontinue_reason.select "By Ordering Provider"
  ehmp.wait_until_fld_discontinue_comment_visible
  ehmp.fld_discontinue_comment.set "test discontinue"
  ehmp.fld_discontinue_comment.native.send_keys(:enter)  
  ehmp.wait_until_btn_discontinue_accept_visible
  expect(ehmp).to have_btn_discontinue_accept
  ehmp.btn_discontinue_accept.click 
  max_attempt = 4
  begin
    ehmp.wait_until_btn_consult_modal_close_visible
    expect(ehmp).to have_btn_consult_modal_close
    ehmp.btn_consult_modal_close.click   
    ehmp.wait_until_btn_consult_modal_close_invisible 
  rescue Exception => e
    p "Exception received: trying again"
    max_attempt-=1
    raise e if max_attempt <= 0
    retry if max_attempt > 0
  end
end

Then(/^Consult applet shows only consults that have are in "([^"]*)" mode$/) do |input_text|
  ehmp = PobConsultApplet.new
  ehmp.wait_until_fld_mode_column_data_visible
  expect(only_text_exists_in_list(ehmp.fld_mode_column_data, "#{input_text}")).to eq(true), "Not all returned results include #{input_text}"
end

Then(/^user selects to show only "([^"]*)" consults$/) do |input|
  ehmp = PobConsultApplet.new
  ehmp.wait_until_ddL_display_only_visible
  ehmp.ddL_display_only.select input
end

Then(/^Consult applet shows either Open or Closed consults$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_until_fld_mode_column_data_visible
  expect(compare_text_in_list(ehmp.fld_mode_column_data, "Open", "Closed")).to eq(true), "Returned rows doesn't include Open and Closed"
end

Then(/^user verifies the consults applet has following patients listed$/) do |table|
  ehmp = PobConsultApplet.new
  ehmp.wait_until_fld_patient_column_data_visible
  table.rows.each do |patients|
    expect(object_exists_in_list(ehmp.fld_patient_column_data, "#{patients[0]}")).to eq(true), "#{patients[0]} was not found"
  end
end

Then(/^user expands the assignment field of consults applet$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_until_ddl_consult_assignment_visible
  expect(ehmp).to have_ddl_consult_assignment
  ehmp.ddl_consult_assignment.click  
end

Then(/^consults applet in staff view page has headers$/) do |table|
  ehmp = PobConsultApplet.new
  ehmp.wait_until_fld_consult_steffview_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(ehmp.fld_consult_steffview_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on Consult Applet"
  end
end

Then(/^user verifies consult assignments field contains options$/) do |table|
  ehmp = PobConsultApplet.new
  ehmp.wait_until_fld_assignement_options_visible
  table.rows.each do |options|
    expect(object_exists_in_list(ehmp.fld_assignement_options, "#{options[0]}")).to eq(true), "#{options[0]} was not found"
  end
end

Then(/^user selects consult provider as "([^"]*)"$/) do |provider|
  ehmp = PobConsultApplet.new
  ehmp.wait_until_ddL_consult_provider_visible
  ehmp.ddL_consult_provider.click
  ehmp.wait_until_fld_provider_search_input_visible
  ehmp.fld_provider_search_input.set provider
  ehmp.fld_provider_search_input.native.send_keys(:enter)
end

Then(/^user verifies consult assignments field does not contain option$/) do |table|
  ehmp = PobConsultApplet.new
  ehmp.wait_until_fld_assignement_options_visible
  table.rows.each do |options|
    expect(object_exists_in_list(ehmp.fld_assignement_options, "#{options[0]}")).to eq(false), "#{options[0]} was found"
  end
end

Then(/^user filters the Consult applet by text "([^"]*)"$/) do |filter_text|
  ehmp = PobConsultApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { infinite_scroll_other("#data-grid-consults tbody") }
  row_count = ehmp.tbl_consult_rows.length
  ehmp.wait_until_fld_applet_text_filter_visible
  expect(ehmp).to have_fld_applet_text_filter
  ehmp.fld_applet_text_filter.set filter_text
  ehmp.fld_applet_text_filter.native.send_keys(:enter)
  wait.until { infinite_scroll_other("#data-grid-consults tbody") }
  wait.until { row_count != ehmp.tbl_consult_rows.length }
end

Then(/^Consult applet table only diplays rows including text "([^"]*)"$/) do |input_text|
  ehmp = PobConsultApplet.new
  ehmp.wait_until_fld_consult_column_data_visible
  expect(only_text_exists_in_list(ehmp.fld_consult_column_data, "#{input_text}")).to eq(true), "Not all returned results include #{input_text}"
end

Then(/^flagged checkbox is unchecked by default in Consult Applet$/) do
  ehmp = PobConsultApplet.new
  ehmp.wait_until_chk_flag_visible
  expect(ehmp.chk_flag.checked?).to eq(false), "Flagged checkbox is checked, it should be unchecked by default"
end



