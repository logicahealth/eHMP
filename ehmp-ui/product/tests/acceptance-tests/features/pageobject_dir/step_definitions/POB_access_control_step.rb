Then(/^POB user can view the Access Control Applet$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_access_control_applet_visible
  expect(@ehmp).to have_fld_access_control_applet
end

When(/^POB user views the Access Control Applet$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_access_control_applet_visible
  expect(@ehmp).to have_fld_access_control_applet
  @ehmp.fld_access_control_applet.click
  @ehmp = PobOverView.new
  expect(@ehmp.fld_screen_name).to have_text("ACCESS CONTROL")
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
  expect(@ehmp.fld_modal_title).to have_text(modal_title)
end

When(/^POB Access Control applet modal displays labels$/) do |table|
  @ehmp = PobAccessControl.new
  begin
    table.rows.each do |heading|
      expect(object_exists_in_list(@ehmp.fld_access_control_modal_labels, "#{heading[0]}")).to eq(true), "Field '#{heading[0]}' was not found"
    end
  rescue
    table.rows.each do |heading|
      expect(object_exists_in_list(@ehmp.fld_access_control_modal_labels, "#{heading[0]}")).to eq(true), "Field '#{heading[0]}' was not found"
    end
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
  if name == "TRACY KEELEY"
    @ehmp.wait_until_tbl_row_keeley_visible
    expect(@ehmp).to have_tbl_row_keeley 
    @ehmp.tbl_row_keeley.click
  end
  if name == "VIHAAN KHAN"
    @ehmp.wait_until_tbl_row_khan_visible
    expect(@ehmp).to have_tbl_row_khan
    @ehmp.tbl_row_khan.click
  end
end

Then(/^POB user "(.*?)" has following roles$/) do |name, table|
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_modal_body_rows_visible
  begin
    table.rows.each do |roles|
      expect(object_exists_in_list(@ehmp.fld_modal_body_rows, "#{roles[0]}")).to eq(true)
    end
  rescue
    table.rows.each do |roles|
      expect(object_exists_in_list(@ehmp.fld_modal_body_rows, "#{roles[0]}")).to eq(true)
    end
  end
end

Then(/^POB authorized user edits the roles$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_btn_edit_role_visible
  expect(@ehmp).to have_btn_edit_role
  @ehmp.btn_edit_role.click
end

Then(/^POB user gives the following roles for user "(.*?)"$/) do |arg1, table|
  @ehmp = PobAccessControl.new
  table.rows.each do |roles|
    if roles[0] == 'Standard Doctor'
      @ehmp.wait_until_btn_add_std_doc_visible
      expect(@ehmp).to have_btn_add_std_doc
      @ehmp.btn_add_std_doc.click
    elsif roles[0] == 'Read Access'
      @ehmp.wait_until_btn_add_read_access_visible
      expect(@ehmp).to have_btn_add_read_access
      @ehmp.btn_add_read_access.click
    elsif roles[0] == 'Pharmacist'
      @ehmp.wait_until_btn_add_pharmacist_visible
      expect(@ehmp).to have_btn_add_pharmacist
      @ehmp.btn_add_pharmacist.click
    end
  end
  @ehmp.wait_until_btn_save_visible
  expect(@ehmp).to have_btn_save
  @ehmp.btn_save.click
end

Then(/^POB user has permission to access the Notes Applet$/) do
  @ehmp = PobNotes.new
  expect(@ehmp).to have_btn_notes
end

Then(/^POB authorized user cannot edit the roles$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_btn_edit_role_visible
  expect(@ehmp).to have_btn_edit_role
  expect(@ehmp.btn_edit_role['disabled']).to eq("true")
end

Then(/^POB user deletes the following roles for user "(.*?)"$/) do |arg1, table|
  @ehmp = PobAccessControl.new
  table.rows.each do |roles|
    if roles[0] == 'Read Access'
      @ehmp.wait_until_btn_remove_read_access_visible
      expect(@ehmp).to have_btn_remove_read_access
      @ehmp.btn_remove_read_access[1].click
    elsif roles[0] == 'Pharmacist'
      @ehmp.wait_until_btn_remove_pharmacist_visible
      expect(@ehmp).to have_btn_remove_pharmacist
      @ehmp.btn_remove_pharmacist[1].click
    elsif roles[0] == 'Standard Doctor'
      @ehmp.wait_until_btn_remove_std_doc_visible
      expect(@ehmp).to have_btn_remove_std_doc
      @ehmp.btn_remove_std_doc[1].click
    end
  end
  @ehmp.wait_until_btn_save_visible
  expect(@ehmp).to have_btn_save
  @ehmp.btn_save.click
end

Then(/^POB user sees the login error message "(.*?)"$/) do |error_message|
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_error_message_visible
  expect(@ehmp.fld_error_message.text.upcase).to have_text(error_message.upcase)
end

Then(/^POB user selects the check box include inactive ehmp users$/) do
  @ehmp = PobAccessControl.new
  @ehmp.wait_until_fld_ehmp_check_box_visible
  expect(@ehmp).to have_fld_ehmp_check_box
  @ehmp.fld_ehmp_check_box.click
end

