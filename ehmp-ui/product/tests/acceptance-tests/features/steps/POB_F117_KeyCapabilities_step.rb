And(/^POB user selects "(.*?)"$/) do |patient|
  @ehmp = PobPatientSearch.new
  @ehmp.wait_for_fld_patient_records
  click_an_object_from_list(@ehmp.fld_patient_records, patient)
  expect(object_exists_in_list(@ehmp.fld_patient_records, patient)).to be true
  begin
    @ehmp.wait_until_img_patient_visible
  rescue
    puts "Confirmation window got closed! Needed to click Again on the Patient list row....  :-("
    click_an_object_from_list(@ehmp.fld_patient_records, patient)
    @ehmp.wait_until_img_patient_visible
  end
end

Then(/^POB "(.*?)" information is displayed$/) do |patient, table|
  @ehmp = PobPatientSearch.new
  @ehmp.wait_for_fld_patient_name
  expect(@ehmp.fld_patient_name).to have_text(patient)
  table.rows.each do |field, value|
    @ehmp.tbl_patient_info.text.include? "#{field}" "#{value}"
  end
end

Then(/^POB "(.*?)" information is displayed in overview$/) do |patient, table|
  @ehmp = PobOverView.new
  @ehmp.wait_until_fld_demo_patientInfo_visible
  expect(@ehmp.fld_demo_patientInfo).to have_text(patient)
  table.rows.each do |field, value|
    @ehmp.fld_demo_patientInfo.text.include? "#{field}" "#{value}"
  end
end

And(/^POB Bottom Region contains "(.*?)"$/) do |version|
  @ehmp = PobOverView.new
  @ehmp.wait_until_fld_bottom_region_visible
  expect(@ehmp.fld_bottom_region).to have_text(version)
end

When(/^POB the user clicks the Patient Selection Button$/) do
  @ehmp = PobOverView.new
  @ehmp.wait_until_btn_patient_search_visible
  expect(@ehmp).to have_btn_patient_search
  @ehmp.btn_patient_search.click
end

When(/^POB user navigates to Patient Search Screen$/)do
  @ehmp = PobPatientSearch.new
  @ehmp.load
  expect(@ehmp).to be_displayed
end

Then(/^POB the patient search screen is displayed$/) do
  @ehmp = PobPatientSearch.new
  expect(@ehmp).to be_displayed
end

And(/^POB the user selects All within the global date picker$/)do
  @ehmp = PobOverView.new
  @ehmp.wait_until_btn_date_region_visible
  @ehmp.btn_date_region.click
  @ehmp.wait_until_btn_all_range_global_visible
  @ehmp.btn_all_range_global.click
  @ehmp.wait_for_fld_data_grid_table_newsfeed_row
  @ehmp.wait_until_btn_glodal_date_apply_visible
  expect(@ehmp).to have_btn_glodal_date_apply
  @ehmp.btn_glodal_date_apply.click
end

When(/^POB user searches for "(.*?)" and confirms selection$/) do |patient|
  @ehmp = PobPatientSearch.new
  @ehmp.wait_for_fld_patient_search do
    @ehmp.continue
  end
  @ehmp.fld_patient_search.click
  @ehmp.fld_patient_search.set patient
  @ehmp.fld_patient_search.native.send_keys(:return)
  @ehmp.wait_for_fld_patient_records
  expect(@ehmp.fld_patient_records.length).to be > 0
  click_an_object_from_list(@ehmp.fld_patient_records, patient)
  expect(object_exists_in_list(@ehmp.fld_patient_records, patient)).to be true
  begin
    @ehmp.wait_until_img_patient_visible
  rescue
  puts "Confirmation window got closed! Needed to click Again on the Patient list row....  :-("
  click_an_object_from_list(@ehmp.fld_patient_records, patient)
  @ehmp.wait_until_img_patient_visible
  end
  @ehmp.wait_for_btn_confirmation(30)
  @ehmp.wait_until_btn_confirmation_visible
  expect(@ehmp).to have_btn_confirmation
  @ehmp.btn_confirmation.click
end
