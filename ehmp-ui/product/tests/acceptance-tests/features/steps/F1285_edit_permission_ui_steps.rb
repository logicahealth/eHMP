class AccessControlActions  
  extend ::RSpec::Matchers
  def self.verify_title(ehmp, applet_title)
    ehmp.wait_until_fld_applet_title_visible
    expect(ehmp).to have_fld_applet_title
    expect(ehmp.fld_applet_title).to have_text(applet_title.upcase)
  end
  
  def self.step_to_next
    ehmp = PobPermissionSetApplet.new
    ehmp.wait_until_btn_next_visible
    expect(ehmp).to have_btn_next
    ehmp.btn_next.click   
  end
end

Then(/^user can view the Individual Permission Applet$/) do 
  ehmp = PobIndividualPermissionApplet.new
  AccessControlActions.verify_title(ehmp, "Individual Permission")
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.tbl_individual_permission_rows) }
end

Then(/^Individual Permission Applet contains headers$/) do |table|
  ehmp = PobIndividualPermissionApplet.new
  ehmp.wait_for_tbl_individual_permission_headers
  table.rows.each do |fields|
    expect(object_exists_in_list(ehmp.tbl_individual_permission_headers, "#{fields[0]}")).to eq(true), "#{fields[0]} is not found"
  end
end

Then(/^user can view the Permission Set Applet$/) do
  ehmp = PobPermissionSetApplet.new

  AccessControlActions.verify_title(ehmp, "Permission Set")
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.tbl_permission_sets_rows) }

  ehmp.scroll_right_side_into_view
end

Then(/^Permission Set Applet contains headers$/) do |table|
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_for_tbl_permission_sets_headers
  table.rows.each do |fields|
    expect(object_exists_in_list(ehmp.tbl_permission_sets_headers, "#{fields[0]}")).to eq(true), "#{fields[0]} is not found"
  end
end

Then(/^user navigates to expanded permission sets applet$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.load
  expect(ehmp).to be_displayed
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.tbl_permission_sets_rows) }
  AccessControlActions.verify_title(ehmp, "Permission Set")
end

Given(/^the user takes note of number of existing permission sets$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  wait.until { infinite_scroll_other('[data-appletid=permission_sets] tbody') }
  @number_existing_permission_sets = PobPermissionSetApplet.new.number_expanded_applet_rows
  p "number existing_permission_sets: #{@number_existing_permission_sets}"
end

Given(/^user adds a new permission set$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_btn_applet_add_visible
  expect(ehmp).to have_btn_applet_add
  ehmp.btn_applet_add.click
end

Given(/^user selects the permission set name as "([^"]*)"$/) do |name|
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_fld_permission_set_name_visible
  expect(ehmp).to have_fld_permission_set_name
  @set_name_timestamp = Time.now.strftime("%m/%d/%Y %H:%M")
  set_name = name + ' ' + @set_name_timestamp
  ehmp.fld_permission_set_name.set set_name
end

Given(/^user selects the permission set categories as "([^"]*)"$/) do |categories|
  ehmp = PobCommonElements.new
  ehmp.wait_until_fld_pick_list_input_visible
  expect(ehmp).to have_fld_pick_list_input
  ehmp.fld_pick_list_input.click
  ehmp = PobPermissionSetApplet.new
  ehmp.declare_permission_category categories
  ehmp.wait_until_fld_permission_categories_visible
  expect(ehmp).to have_fld_permission_categories
  ehmp.fld_permission_categories.click 
end

Given(/^permission set status defaults to "([^"]*)"$/) do |status|
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_ddl_status_visible
  expect(ehmp).to have_ddl_status
  expect(ehmp.ddl_status).to have_text(status)
end

Given(/^user selects the description as "([^"]*)"$/) do |description|
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_fld_description_visible
  expect(ehmp).to have_fld_description
  ehmp.fld_description.set description
end

Given(/^user selects the notes as "([^"]*)"$/) do |notes|
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_fld_notes_visible
  expect(ehmp).to have_fld_notes
  ehmp.fld_notes.set notes
end

Given(/^user selects the examples as "([^"]*)"$/) do |examples|
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_fld_examples_visible
  expect(ehmp).to have_fld_examples
  ehmp.fld_examples.set examples
end

Given(/^user goes to the next screen$/) do
  AccessControlActions.step_to_next
end

Given(/^user selects a permission set and feature category$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_fld_available_perm_set_visible
  expect(ehmp).to have_fld_available_perm_set
  ehmp.fld_available_perm_set.click 
  ehmp.wait_until_fld_feature_category_visible
  expect(ehmp).to have_fld_feature_category
  ehmp.fld_feature_category.click 
  AccessControlActions.step_to_next
end

Given(/^user selects individual permission Add Consult Order$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_btn_add_consult_visible
  expect(ehmp).to have_btn_add_consult
  ehmp.btn_add_consult.click 
end

Given(/^user submits the permission set$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_btn_submit_visible
  expect(ehmp).to have_btn_submit
  ehmp.btn_submit.click   
  verify_and_close_growl_alert_pop_up("SUCCESS")
end

Then(/^a permission set is added to the applet$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_for_tbl_permission_sets_rows
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  wait.until { infinite_scroll_other("[data-appletid=permission_sets] tbody") }
  wait.until { ehmp.number_expanded_applet_rows == @number_existing_permission_sets + 1 }
end

Then(/^user navigates to expanded individual permissions applet$/) do
  ehmp = PobIndividualPermissionApplet.new
  ehmp.load
  expect(ehmp).to be_displayed
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.tbl_individual_permission_rows) }
  AccessControlActions.verify_title(ehmp, "Individual Permissions")
end

Given(/^user filters the individual permissions applet with text "([^"]*)"$/) do |filter_text|
  ehmp = PobIndividualPermissionApplet.new
  ehmp.wait_until_btn_applet_filter_toggle_visible
  expect(ehmp).to have_btn_applet_filter_toggle
  ehmp.btn_applet_filter_toggle.click
  ehmp.wait_until_fld_applet_text_filter_visible
  expect(ehmp).to have_fld_applet_text_filter
  ehmp.fld_applet_text_filter.set filter_text
end

Then(/^the table contains individual permissions$/) do |table|
  ehmp = PobIndividualPermissionApplet.new
  ehmp.wait_for_fld_individual_permission_names
  expect(ehmp).to have_fld_individual_permission_names
  matched = false
  table.rows.each do |permission, nat_access|    
    ehmp.tbl_individual_permission_rows.each do |item|
      if [permission, nat_access].all? { |text| item.text.include? text }
        matched = true
        break
      else
        matched = false
      end
    end
    expect(matched).to eq(true), "#{permission} and #{nat_access} combination was not found on Individual Permissions Applet"
  end
end

Then(/^user views the details of the permission set "([^"]*)" with a status "([^"]*)"$/) do |set_name, status|
  ehmp = PobPermissionSetApplet.new
  rows = ehmp.tbl_permission_sets_rows
  attempt_to_open_detail_view = false
  rows.each do |row|
    set = set_name + ' ' + @set_name_timestamp
    if [set.upcase, status.upcase].all? { |text| row.text.upcase.include? text }
      attempt_to_open_detail_view = true
      row.click
      break
    end
  end
  expect(attempt_to_open_detail_view).to eq(true), "Did not find permission set #{set_name + ' ' + @set_name_timestamp}, #{status}"
end

Given(/^user edits the permission set$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_btn_permission_set_edit_visible
  expect(ehmp).to have_btn_permission_set_edit
  ehmp.btn_permission_set_edit.click   
end

Then(/^the permission set "([^"]*)" is updated with categories "([^"]*)"$/) do |set_name, category|
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_fld_category_visible
  expect(ehmp).to have_fld_category
  expect(ehmp.fld_category).to have_text(category) 
end

Then(/^when user deprecates the permission set$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_btn_permission_set_deprecate_visible
  expect(ehmp).to have_btn_permission_set_deprecate
  ehmp.btn_permission_set_deprecate.click   
  ehmp.wait_until_btn_deprecate_accept_visible
  expect(ehmp).to have_btn_deprecate_accept
  ehmp.btn_deprecate_accept.click
  verify_and_close_growl_alert_pop_up("SUCCESS")
end

Then(/^the permission set is updated as deprecated$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_fld_status_message_visible
  expect(ehmp).to have_fld_status_message
  expect(ehmp.fld_status_message).to have_text("Deprecated".upcase) 
end

Given(/^user hovers over the individual permission applet row$/) do
  ehmp = PobIndividualPermissionApplet.new
  ehmp.wait_until_tbl_individual_permission_rows_visible
  expect(ehmp).to have_tbl_individual_permission_rows
  expect(ehmp.tbl_individual_permission_rows.length > 0).to eq(true)
  ehmp.tbl_individual_permission_rows[0].hover
end

Given(/^user selects the detail view from Quick Menu Icon of individual permission applet$/) do
  ehmp = PobIndividualPermissionApplet.new
  QuickMenuActions.open_menu_click_detail_button ehmp
end

Given(/^individual permission detail view contain fields$/) do |table|
  ehmp = ModalElements.new
  ehmp.wait_until_fld_modal_detail_labels_visible
  table.rows.each do |fields|
    expect(object_exists_in_list(ehmp.fld_modal_detail_labels, "#{fields[0]}")).to eq(true)
  end
end

Given(/^user hovers over the permission sets applet row$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_tbl_permission_sets_rows_visible
  expect(ehmp).to have_tbl_permission_sets_rows
  expect(ehmp.tbl_permission_sets_rows.length > 0).to eq(true)
  ehmp.tbl_permission_sets_rows[0].hover
end

Given(/^user selects the detail view from Quick Menu Icon of permission sets applet$/) do
  ehmp = PobPermissionSetApplet.new
  QuickMenuActions.open_menu_click_detail_button ehmp
end

Given(/^permission sets detail view contain fields$/) do |table|
  ehmp = ModalElements.new
  ehmp.wait_until_fld_modal_detail_labels_visible
  table.rows.each do |fields|
    expect(object_exists_in_list(ehmp.fld_modal_detail_labels, "#{fields[0]}")).to eq(true)
  end
end

Then(/^user updates status to be inactive$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_ddl_status_visible
  expect(ehmp).to have_ddl_status
  ehmp.ddl_status.select "Inactive" 
end

Then(/^the permission set is updated as inactive$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_fld_status_message_visible
  expect(ehmp).to have_fld_status_message
  expect(ehmp.fld_status_message).to have_text("Inactive".upcase) 
end

Given(/^Individual Permissions applet displays Refresh button$/) do
  ehmp = PobIndividualPermissionApplet.new
  ehmp.wait_for_btn_applet_refresh
  expect(ehmp).to have_btn_applet_refresh
end

Given(/^Individual Permissions applet displays Expand View button$/) do
  ehmp = PobIndividualPermissionApplet.new
  ehmp.wait_for_btn_applet_expand_view
  expect(ehmp).to have_btn_applet_expand_view
end

Given(/^Individual Permissions applet displays Help button$/) do
  ehmp = PobIndividualPermissionApplet.new
  ehmp.wait_for_btn_applet_help
  expect(ehmp).to have_btn_applet_help
end

Given(/^Individual Permissions applet displays Filter Toggle button$/) do
  ehmp = PobIndividualPermissionApplet.new
  ehmp.wait_for_btn_applet_filter_toggle
  expect(ehmp).to have_btn_applet_filter_toggle
end

Then(/^Individual Permissions applet displays Minimize View button$/) do
  ehmp = PobIndividualPermissionApplet.new
  ehmp.wait_for_btn_applet_minimize
  expect(ehmp).to have_btn_applet_minimize
end

When(/^user refreshes Individual Permissions applet$/) do
  ehmp = PobIndividualPermissionApplet.new
  ehmp.wait_until_btn_applet_refresh_visible
  expect(ehmp).to have_btn_applet_refresh
  ehmp.btn_applet_refresh.click
end

Then(/^the message on the Individual Permissions applet does not say an error has occurred$/) do
  ehmp = PobIndividualPermissionApplet.new
  ehmp.wait_for_fld_error_msg
  expect(ehmp).to have_no_fld_error_msg, "Individual Permissions did not refresh"
end

When(/^user expands the Individual Permissions applet$/) do
  ehmp = PobIndividualPermissionApplet.new
  ehmp.wait_for_btn_applet_expand_view
  expect(ehmp).to have_btn_applet_expand_view
  ehmp.btn_applet_expand_view.click
end

Then(/^Individual Permissions applet expand view applet is displayed$/) do
  ehmp = PobIndividualPermissionApplet.new
  expect(ehmp).to be_displayed
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.tbl_individual_permission_rows) }
  AccessControlActions.verify_title(ehmp, "Individual Permissions")
end

When(/^user closes the Individual Permissions applet expand view$/) do
  ehmp = PobIndividualPermissionApplet.new
  ehmp.wait_for_btn_applet_minimize
  expect(ehmp).to have_btn_applet_minimize
  ehmp.btn_applet_minimize.click
end

Then(/^user is navigated back to Access Control workspace$/) do
  ehmp = PobAccessControl.new
  ehmp.wait_for_fld_access_control_applet
  expect(ehmp).to have_fld_access_control_applet
  expect(ehmp.fld_access_control_applet['class'].upcase.include? 'ACTIVE').to be_true
end

When(/^the user sorts the Individual Permissions applet by column Name$/) do
  ehmp = PobIndividualPermissionApplet.new
  ehmp.wait_until_fld_name_visible
  expect(ehmp).to have_fld_name
  ehmp.fld_name.click
end

Then(/^the Individual Permissions applet sorts the Name field in alphabetical order$/) do
  ehmp = PobIndividualPermissionApplet.new
  names = ehmp.tbl_name_data
  expect(ehmp.td_text_in_alpha_order(names)).to eq(true), "Name column is not in alpha order"
end

Given(/^Permission Sets applet displays Refresh button$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_for_btn_applet_refresh
  expect(ehmp).to have_btn_applet_refresh
end

Given(/^Permission Sets applet displays Expand View button$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_for_btn_applet_expand_view
  expect(ehmp).to have_btn_applet_expand_view
end

Given(/^Permission Sets applet displays Help button$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_for_btn_applet_help
  expect(ehmp).to have_btn_applet_help
end

Given(/^Permission Sets applet displays Filter Toggle button$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_for_btn_applet_filter_toggle
  expect(ehmp).to have_btn_applet_filter_toggle
end

Then(/^Permission Sets applet displays Minimize View button$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_for_btn_applet_minimize
  expect(ehmp).to have_btn_applet_minimize
end

When(/^user refreshes Permission Sets applet$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_btn_applet_refresh_visible
  expect(ehmp).to have_btn_applet_refresh
  ehmp.btn_applet_refresh.click
end

Then(/^the message on the Permission Sets applet does not say an error has occurred$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_for_fld_error_msg
  expect(ehmp).to have_no_fld_error_msg, "Individual Permissions did not refresh"
end

When(/^user expands the Permission Sets applet$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_for_btn_applet_expand_view
  expect(ehmp).to have_btn_applet_expand_view
  ehmp.btn_applet_expand_view.click
end

Then(/^Permission Sets applet expand view applet is displayed$/) do
  ehmp = PobPermissionSetApplet.new
  expect(ehmp).to be_displayed
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(ehmp.has_fld_empty_row?, ehmp.tbl_permission_sets_rows) }
  AccessControlActions.verify_title(ehmp, "Permission Set")
end

When(/^user closes the Permission Sets applet expand view$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_for_btn_applet_minimize
  expect(ehmp).to have_btn_applet_minimize
  ehmp.btn_applet_minimize.click
end

When(/^the user sorts the Permission Sets applet by column Set Name$/) do
  ehmp = PobPermissionSetApplet.new
  ehmp.wait_until_fld_set_name_visible
  expect(ehmp).to have_fld_set_name
  ehmp.fld_set_name.click
end

Then(/^the Permission Sets applet sorts the Set Name field in alphabetical order$/) do
  ehmp = PobPermissionSetApplet.new
  column_values = ehmp.set_name_column_data
  expect(column_values.length).to be >= 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end



