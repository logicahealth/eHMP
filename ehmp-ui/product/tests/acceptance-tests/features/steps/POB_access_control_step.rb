Then(/^POB user can view the Access Control Applet$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_access_control_applet_visible
  expect(@ehmp).to have_fld_access_control_applet
end

When(/^POB user views the Access Control Applet$/) do
  @ehmp = PobAccessControl.new
  max_attempt = 1
  begin
    @ehmp.wait_until_fld_access_control_applet_visible
    expect(@ehmp).to have_fld_access_control_applet
    @ehmp.fld_access_control_applet.click

    @ehmp.wait_until_fld_panel_title_label_visible
    expect(@ehmp.fld_panel_title_label).to have_text("FOR PANORAMA (9E7A)")
  rescue Exception => e
    p "*** entered rescue block #{e}***"
    max_attempt-=1
    raise e if max_attempt < 0
    @ehmp.load
    retry if max_attempt >= 0
  end
end

When(/^POB user expands Access Control Applet$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_btn_access_control_maximize_visible
  expect(@ehmp).to have_btn_access_control_maximize
  @ehmp.btn_access_control_maximize.click
end

When(/^POB Access Control applet modal title says "(.*?)"$/) do |modal_title|
  @ehmp = PobCommonElements.new
  @ehmp.wait_until_fld_modal_title_visible
  expect(@ehmp.fld_modal_title).to have_text(modal_title), "Currently Modal title is displayed as: #{@ehmp.fld_modal_title.text}"
end

And(/^POB user permission modal window contains title "(.*?)"$/) do |title|
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_all_permission_headers_visible
  headers = @ehmp.fld_all_permission_headers
  expect(object_exists_in_list(headers, title)).to eq(true)
end

And(/^POB title "(.*?)" is displayed down below Available Additional Permissions$/) do |title|
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_all_permission_headers_visible
  @ehmp.wait_until_fld_additional_individual_permissions_visible
  expect(@ehmp).to have_fld_additional_individual_permissions
  headers = @ehmp.fld_all_permission_headers
  expect(object_exists_in_list(headers, title)).to eq(true)
end

And(/^POB user clicks on a details button from Available Additional permission sets$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_btn_detail_available_additional_permission_sets
  expect(@ehmp).to have_btn_detail_available_additional_permission_sets
  @ehmp.btn_detail_available_additional_permission_sets.first.click
end

And(/^POB a pop-up window displays a table with two below columns and details$/) do |table|
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_all_permission_headers_visible
  table.rows.each do |heading|
    expect(object_exists_in_list(@ehmp.fld_detail_popup_thead, "#{heading[0]}")).to eq(true), "Field '#{heading[0]}' was not found"
  end
  @ehmp.wait_until_fld_detail_popup_tbody_visible
  expect(@ehmp).to have_fld_detail_popup_tbody count: 2
end

And(/^POB pop up window is hidden again$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_detail_popover_window_invisible
  expect(@ehmp).to have_no_fld_detail_popover_window
end

When(/^POB Access Control applet modal displays labels$/) do |table|
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_fld_access_control_modal_labels
  @ehmp.wait_until_fld_access_control_modal_labels_visible

  max_attempt = 6  
  begin
    table.rows.each do |heading|
      expect(object_exists_in_list(@ehmp.fld_access_control_modal_labels, "#{heading[0]}")).to eq(true), "Field '#{heading[0]}' was not found"
    end
  rescue Exception => e
    p "*** entered rescue block ***"
    sleep(2)
    max_attempt-=1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
end

When(/^POB Access Control applet detail modal has "(.*?)" button$/) do |search_btn|
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_btn_search_visible
  expect(@ehmp).to have_btn_search
end

Then(/^POB user doesn't have permission to access the Notes Applet$/) do
  @ehmp = PobNotes.new
  expect(@ehmp).to have_no_btn_notes
end

Then(/^POB user enters "(.*?)" in the first name field$/) do |first_name|
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_fld_first_name
  @ehmp.wait_until_fld_first_name_visible
  expect(@ehmp.has_fld_first_name?).to eq(true)
  @ehmp.fld_first_name.set first_name
end

Then(/^POB user enters "(.*?)" in the last name field$/) do |last_name|
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_fld_last_name
  @ehmp.wait_until_fld_last_name_visible
  expect(@ehmp.has_fld_last_name?).to eq(true)
  @ehmp.fld_last_name.set last_name
end

Then(/^POB user searches for the user roles$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_btn_search_visible(20)
  expect(@ehmp).to have_btn_search
  @ehmp.btn_search.click
end

Then(/^POB user is directed to the User Information screen after click on save$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_btn_save
  @ehmp.wait_until_btn_save_visible
  expect(@ehmp).to have_btn_save
  @ehmp.btn_save.click
  @ehmp.wait_until_fld_user_information_modal_window_visible
  expect(@ehmp).to have_fld_user_information_modal_window
end

And(/^POB user is navigated to the Summery View after closes the User Info Screen$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_btn_user_info_modal_close
  @ehmp.btn_user_info_modal_close.click
  @ehmp.wait_for_tbl_access_control
  @ehmp.wait_until_tbl_access_control_visible
  expect(@ehmp).to have_tbl_access_control
end

And(/^POB user is navigated to the Summery View after closes the edit permission Screen$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_btn_edit_perm_modal_close
  @ehmp.btn_edit_perm_modal_close.click
  @ehmp.wait_until_btn_edit_perm_modal_close_invisible
  @ehmp.wait_until_tbl_access_control_visible
  expect(@ehmp).to have_tbl_access_control
end

Then(/^POB user is presented with user management table$/) do
  @ehmp = PobAccessControl.new
  begin
    @ehmp.wait_until_tbl_access_control_visible
    expect(@ehmp).to have_tbl_access_control
  rescue
    @ehmp.wait_until_tbl_access_control_visible
    expect(@ehmp).to have_tbl_access_control 
  end   
end

Then(/^POB user selects the row "(.*?)" from the table$/) do |name|
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_tbl_1st_row_data_visible
  expect(@ehmp.tbl_1st_row_data.text.upcase).to include(name.upcase)
  @ehmp.tbl_1st_row_data.click
end

And(/^POB available permission sets displays Filter option$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_available_permission_filter_visible
  expect(@ehmp).to have_fld_available_permission_filter
end

And(/^POB Available Permission Sets column displays correct count of "(.*?)", "(.*?)" and detail button$/) do |arg1, arg2|
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_fld_available_permission_sets_data_rows
  row_count = @ehmp.fld_available_permission_sets_data_rows.length
  detail_count = @ehmp.btn_detail_available_permission_sets.length
  objects = @ehmp.btn_available_permission_sets_add_remove
  expect(count_item_from_a_list(objects, arg1, arg2)).to eq(row_count-1 && detail_count)
end

And(/^POB Selected Permission Sets column displays correct count of "(.*?)", "(.*?)" and detail button$/) do |arg1, arg2|
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_fld_selected_permission_sets_data_rows
  row_count = @ehmp.fld_selected_permission_sets_data_rows.length
  detail_count = @ehmp.btn_detail_selected_permission_sets.length
  objects = @ehmp.btn_selected_permission_sets_add_remove
  @initial_count = count_item_from_a_list(objects, arg1, arg2)
  expect(count_item_from_a_list(objects, arg1, arg2)).to eq(row_count-1 && detail_count), ""
end

And(/^POB Selected Permission Sets column displays correct count of "(.*?)", "(.*?)" and detail button after modification$/) do |arg1, arg2|
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_fld_selected_permission_sets_data_rows
  row_count = @ehmp.fld_selected_permission_sets_data_rows.length
  detail_count = @ehmp.btn_detail_selected_permission_sets.length
  objects = @ehmp.btn_selected_permission_sets_add_remove
  @updated_count = count_item_from_a_list(objects, arg1, arg2)
  expect(count_item_from_a_list(objects, arg1, arg2)).to eq(row_count-1 && detail_count)
end

And(/^POB Available Additional Permission Sets column displays correct count of "(.*?)", "(.*?)" and detail button$/) do |arg1, arg2|
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_fld_available_additional_permissions_data_rows
  row_count = @ehmp.fld_available_additional_permissions_data_rows.length
  detail_count = @ehmp.btn_detail_available_additional_permission_sets.length
  objects = @ehmp.btn_available_additional_permission_add_remove
  @initial_count = count_item_from_a_list(objects, arg1, arg2)
  expect(count_item_from_a_list(objects, arg1, arg2)).to eq(row_count-1 && detail_count)
end

And(/^POB "(.*?)" a permission Set to the user from Available Permission set$/) do |arg1|
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_fld_available_permission_sets_data_rows
  expect(@ehmp).to have_fld_available_permission_sets_data_rows minimum: 1
  click_an_object_from_list(@ehmp.btn_available_permission_sets_add_remove, arg1)
  @ehmp.wait_until_fld_available_permission_sets_data_rows_visible
end

And(/^POB "(.*?)" a permission Set to the user from Available Additional Ind Permission set and verify the total count$/) do |arg1|
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_fld_available_additional_permissions_data_rows
  expect(@ehmp).to have_fld_available_additional_permissions_data_rows minimum: 1
  @initial_cnt_aaip = @ehmp.fld_total_selected_additional_ind_permissions.text.split(":").last.to_i
  click_an_object_from_list(@ehmp.btn_available_additional_permission_add_remove, arg1)
  @ehmp.wait_until_btn_available_additional_permission_add_remove_visible
  @updated_cnt_aaip = @ehmp.fld_total_selected_additional_ind_permissions.text.split(":").last.to_i

  expect(@ehmp).to have_fld_total_selected_additional_ind_permissions
  expect(@ehmp.fld_total_selected_additional_ind_permissions.text.split(":").last.to_i).to be > 0
  expect(@ehmp.fld_total_selected_additional_ind_permissions.text.split(":").last.to_i).to equal(@updated_cnt_aaip)
end

And(/^POB "(.*?)" a permission Set to the user from Selected Additional Ind Permissions and verify the total count$/) do |arg1|
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_fld_selected_permission_sets_data_rows
  expect(@ehmp).to have_fld_selected_permission_sets_data_rows minimum: 1
  @initial_cnt_aaip = @ehmp.fld_total_selected_additional_ind_permissions.text.split(":").last.to_i
  click_an_object_from_list(@ehmp.btn_selected_additional_permission_add_remove, arg1)
  @ehmp.wait_for_btn_available_additional_permission_add_remove
  @updated_cnt_aaip = @ehmp.fld_total_selected_additional_ind_permissions.text.split(":").last.to_i

  expect(@ehmp).to have_fld_total_selected_additional_ind_permissions
  expect(@ehmp.fld_total_selected_additional_ind_permissions.text.split(":").last.to_i).to equal(@updated_cnt_aaip)
end

And(/^POB "(.*?)" a permission Set to the user from Selected Permission Sets$/) do |arg1|
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_fld_selected_permission_sets_data_rows
  expect(@ehmp).to have_fld_selected_permission_sets_data_rows minimum: 1
  click_an_object_from_list(@ehmp.btn_selected_permission_sets_add_remove, arg1)
  @ehmp.wait_for_fld_total_selected_region
end

And(/^POB the window displays available permission sets data$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_fld_available_permission_sets_data_rows
  expect(@ehmp.fld_available_permission_sets_data_rows.length > 0).to eq(true)
end

And(/^POB user clicks on a details button from Available permission sets$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_btn_detail_available_permission_sets
  @ehmp.btn_detail_available_permission_sets.first.click
  @ehmp.wait_until_fld_popup_detail_visible
  expect(@ehmp).to have_fld_popup_detail
end

And(/^POB pop up window displays the header contains "(.*?)"$/) do |header|
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_popup_detail_visible
  expect(@ehmp.fld_popup_detail.text.upcase).to include(header.upcase)
end

And(/^POB total count of the selected permission sets are displayed$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_total_selected_region_visible
  expect(@ehmp).to have_fld_total_selected_region
end

And(/^POB add permission corresponding to "(.*?)" from Available Additional Ind Permissions/) do |text|
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_fld_available_additional_permissions_data_rows
  expect(@ehmp.fld_available_additional_permissions_data_rows.length > 0).to eq(true)
  click_an_element_from_elements_list_by_providing_text(@ehmp.fld_available_additional_permissions_data_rows, @ehmp.btn_available_additional_permission_add_remove, text)
  @ehmp.wait_for_fld_total_selected_additional_ind_permissions
  expect(@ehmp.fld_total_selected_additional_ind_permissions.text.split(":").last.to_i).to equal(1)
end

And(/^POB remove permission corresponding to "(.*?)" from Available Additional Ind Permissions/) do |text|
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_fld_available_additional_permissions_data_rows
  expect(@ehmp.fld_available_additional_permissions_data_rows.length > 0).to eq(true)
  click_an_element_from_elements_list_by_providing_text(@ehmp.fld_available_additional_permissions_data_rows, @ehmp.btn_available_additional_permission_add_remove, text)
  @ehmp.wait_for_fld_total_selected_additional_ind_permissions
end

And(/^POB verify the error message shown "(.*?)" in Additional Ind column$/) do |text|
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_fld_error_message_additional_ind
  @ehmp.fld_error_message_additional_ind.text
  expect(@ehmp.fld_error_message_additional_ind.text).to include(text)
end

And(/^POB verify the error message shown "(.*?)" in Available Permission Sets column$/) do |text|
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_fld_error_message_available_perm
  @ehmp.fld_error_message_available_perm.text
  expect(@ehmp.fld_error_message_available_perm.text).to include(text)
end

And(/^POB "(.*?)" all permissions from Available Permission sets and verify the total count in Selected Permission sets$/) do |type|
  @ehmp = PobAccessControl.new
  @ehmp.wait_for_btn_available_additional_permission_add_remove
  expect(@ehmp).to have_btn_available_additional_permission_add_remove
  click_all_objects_from_list(@ehmp.btn_available_additional_permission_add_remove, type)
  @ehmp.wait_for_btn_available_permission_sets_add_remove
  click_all_objects_from_list(@ehmp.btn_available_permission_sets_add_remove, type)
  @ehmp.wait_for_fld_total_selected_additional_ind_permissions
  expect(@ehmp.fld_total_selected_additional_ind_permissions.text.split(":").last.to_i).to equal(0)
  expect(@ehmp.fld_total_selected_region.text.split(":").last.to_i).to equal(0)

  click_an_element_from_elements_list_by_providing_text(@ehmp.fld_available_permission_sets_data_rows, @ehmp.btn_available_permission_sets_add_remove, "Standard Doctor")
  @ehmp.wait_for_fld_total_selected_additional_ind_permissions
  expect(@ehmp.fld_total_selected_region.text.split(":").last.to_i).to equal(1)
end

And(/^POB Remove a permission from selected permission sets$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_btn_selected_permission_sets_add_remove_visible
  expect(@ehmp).to have_btn_selected_permission_sets_add_remove
  click_an_object_from_list(@ehmp.btn_selected_permission_sets_add_remove, 'Remove')
  @ehmp.wait_for_btn_save
end

And(/^POB verify the total count of selected permission after modification$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_total_selected_region_visible
  row_count = @ehmp.fld_selected_permission_sets_data_rows.length - 1
  value = @ehmp.fld_total_selected_region.text.split(":").last.to_i
  expect(value).to eq(row_count), "Field 'Total Selected' shows value=#{value}, and Row count=#{row_count} "
end

Then(/^POB user "(.*?)" has following roles$/) do |name, table|
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_permission_set_row_visible
  max_attempt = 4
  begin
    p "roles? #{@ehmp.modal_displayed_roles}"
    table.rows.each do |roles|
      expect(@ehmp.modal_displayed_roles).to include "#{roles[0]}"
    end

  rescue Exception => e
    sleep(0.5)
    max_attempt-=1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
end

And(/^POB Access Control applet modal displays user info$/) do |table|
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_btn_edit_role_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.fld_user_information_header, "#{headers[0]}")).to eq(true), "Field '#{headers[0]}' was not found"
  end
end

And(/^POB new modal window displayed with title "(.*?)"$/) do |title|
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_edit_permission_modal_title_visible
  expect(@ehmp.fld_edit_permission_modal_title.text.upcase).to include(title.upcase), "Actual title: #{@ehmp.fld_edit_permission_modal_title.text}"
end

Then(/^POB authorized user edits the roles$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_btn_edit_role_visible
  expect(@ehmp).to have_btn_edit_role
  @ehmp.btn_edit_role.click
  @ehmp.wait_until_fld_available_region_visible
  @ehmp.wait_until_fld_selected_region_visible
end

Then(/^POB user gives the following roles for user "(.*?)"$/) do |name, table|
  @ehmp = PobAccessControl.new
  table.rows.each do |roles|
    @ehmp.define_add_remove_role_buttons roles[0]
    @ehmp.wait_until_btn_add_role_visible
    expect(@ehmp).to have_btn_add_role
    @ehmp.btn_add_role.click
    @ehmp.wait_until_btn_remove_role_visible
  end
  @ehmp.wait_until_btn_save_visible
  expect(@ehmp).to have_btn_save
  @ehmp.btn_save.click
  @ehmp.wait_until_btn_save_invisible
end

Then(/^POB user has permission to access the Notes Applet$/) do
  @ehmp = PobNotes.new
  @ehmp.wait_until_btn_notes_visible
  expect(@ehmp).to have_btn_notes
end

Then(/^POB authorized user cannot edit the roles$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_btn_edit_role_visible
  expect(@ehmp).to have_btn_edit_role
  expect(@ehmp.btn_edit_role['disabled']).to eq("true"), "Edit button is not disabled!"
end

Then(/^POB user deletes the following roles for user "(.*?)"$/) do |arg1, table|
  @ehmp = PobAccessControl.new
  table.rows.each do |roles|
    @ehmp.define_add_remove_role_buttons roles[0]
    @ehmp.wait_until_btn_remove_role_visible
    expect(@ehmp).to have_btn_remove_role
    @ehmp.btn_remove_role.click
    @ehmp.wait_until_btn_remove_role_invisible
  end
  @ehmp.wait_until_btn_save_visible
  expect(@ehmp).to have_btn_save
  @ehmp.btn_save.click
end

Then(/^POB user sees the login error message "(.*?)"$/) do |error_message|
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_error_message_visible
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  wait.until { @ehmp.fld_error_message.text.upcase != "" }
  expect(@ehmp.fld_error_message.text.upcase).to have_text(error_message.upcase)
end

Then(/^POB user selects the check box include inactive ehmp users$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_ehmp_check_box_visible
  expect(@ehmp).to have_fld_ehmp_check_box
  @ehmp.fld_ehmp_check_box.click
end

Then(/^POB user "([^"]*)" does not have the following roles$/) do |arg1, table|
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_permission_set_row_visible
  max_attempt = 4
  begin
    p "roles? #{@ehmp.modal_displayed_roles}"
    table.rows.each do |roles|
      expect(@ehmp.modal_displayed_roles).to_not include "#{roles[0]}"
    end
  rescue Exception => e
    sleep(0.5)
    max_attempt-=1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
end

Then(/^POB user deletes all roles for user "([^"]*)"$/) do |arg1|
  @ehmp = PobAccessControl.new
  # sleep 2
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  remove_btns = @ehmp.btn_remove_selected_set
  p "#{remove_btns.length} sets to remove"
  remove_btns.each do | remove_role |
    remove_role.click
    wait.until { 
      begin
        !remove_role.native.displayed? 
      rescue Selenium::WebDriver::Error::StaleElementReferenceError
        p "Selenium::WebDriver::Error::StaleElementReferenceError:"
        true 
      end
    }
  end
  @ehmp.wait_until_btn_save_visible
  expect(@ehmp).to have_btn_save
  @ehmp.btn_save.click
end
