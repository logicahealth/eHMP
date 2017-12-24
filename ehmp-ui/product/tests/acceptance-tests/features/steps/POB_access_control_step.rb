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
    expect(@ehmp.fld_panel_title_label).to have_text("FOR PANORAMA (SITE)")
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

When(/^POB Access Control applet detail modal has Search button$/) do 
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

Then(/^POB user searches for the user permission sets$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_btn_search_visible(20)
  expect(@ehmp).to have_btn_search
  @ehmp.btn_search.click
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
  p @ehmp.tbl_1st_row_data.text.upcase
  p "#{name}"
  expect(@ehmp.tbl_1st_row_data.text.upcase).to include(name.upcase)
  @ehmp.tbl_1st_row_data.click
end

Then(/^POB user "(.*?)" has following permission sets$/) do |name, table|
  user_detail = UserInformationDetailWindow.new
  user_detail.build_info_groups "Permission Sets"
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_tbl_1st_row_data_visible
  expect(user_detail.wait_for_btn_edit_permission_set).to eq(true), "Expected an edit permission sets button"

  user_permission_sets = user_detail.values.map { |element|element.text.upcase }
  table.rows.each do | permission_set |
    expect(user_permission_sets).to include permission_set[0].upcase
  end
end

Then(/^POB authorized user edits the permission sets$/) do
  user_detail_window = UserInformationDetailWindow.new
  expect(user_detail_window.wait_for_btn_edit_permission_set).to eq(true), "Expected an edit permission sets button"
  user_detail_window.btn_edit_permission_set.click

  step 'the Select Permissions Window displays'
end

Then(/^POB user has permission to access the Notes Applet$/) do
  @ehmp = PobNotes.new
  @ehmp.wait_until_btn_notes_visible
  expect(@ehmp).to have_btn_notes
end

Then(/^POB authorized user cannot edit the permission sets$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_btn_edit_permission_set_visible
  expect(@ehmp).to have_btn_edit_permission_set
  expect(@ehmp.btn_edit_permission_set['disabled']).to eq("true"), "Edit button is not disabled!"
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
