Then(/^user selects Patient Demographic drop down$/) do
  @ehmp = PobDemographicsElements.new
  max_attempt = 2
  begin
    @ehmp.wait_until_btn_demographic_visible(10)
  rescue => e
    p "attempt refresh"
    TestSupport.driver.navigate.refresh
    max_attempt -= 1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end

  @ehmp.wait_until_btn_demographic_visible(30)
  expect(@ehmp).to have_btn_demographic
  @ehmp.btn_demographic.click
  @ehmp.wait_until_btn_demographic_visible(30)

  if @ehmp.btn_demographic['aria-expanded'] == 'false'
    @ehmp.btn_demographic.click
  end
end

Then(/^the Patient's Home Address value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_home_address_value_visible
  expect(@ehmp).to have_fld_home_address_value
end

Then(/^the Patient's Email value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_email_value_visible
  expect(@ehmp).to have_fld_email_value
end

Then(/^the Patient's EM Contact Relationship value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_em_con_relationship_value_visible
  expect(@ehmp).to have_fld_em_con_relationship_value
end

Then(/^the Patient's EM Contact Name value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_em_con_name_value_visible
  expect(@ehmp).to have_fld_em_con_name_value
end

Then(/^the Patient's EM Home Phone value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_em_home_ph_value_visible
  expect(@ehmp).to have_fld_em_home_ph_value
end

Then(/^the Patient's EM Work Phone value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_em_work_ph_value_visible
  expect(@ehmp).to have_fld_em_work_ph_value
end

Then(/^the Patient's EM Home Address value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_em_home_add_value_visible
  expect(@ehmp).to have_fld_em_home_add_value
end

Then(/^the Patient's NOK Relationship value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_nok_relationship_value_visible
  expect(@ehmp).to have_fld_nok_relationship_value
end

Then(/^the Patient's NOK Name value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_nok_name_value_visible
  expect(@ehmp).to have_fld_nok_name_value
end

Then(/^the Patient's NOK Home Phone value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_nok_home_ph_value_visible
  expect(@ehmp).to have_fld_nok_home_ph_value
end

Then(/^the Patient's NOK Work Phone value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_nok_work_ph_value_visible
  expect(@ehmp).to have_fld_nok_work_ph_value
end

Then(/^the Patient's NOK Home Address value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_nok_home_add_value_visible
  expect(@ehmp).to have_fld_nok_home_add_value
end

Then(/^the Patient's Ins Service Connected value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_ins_service_connected_value_visible
  expect(@ehmp).to have_fld_ins_service_connected_value
end

Then(/^the Patient's Ins Service Condition value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_ins_service_cond_value_visible
  expect(@ehmp).to have_fld_ins_service_cond_value
end

Then(/^the Patient's Ins Service Insurance value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_ins_service_insurance_value_visible
  expect(@ehmp).to have_fld_ins_service_insurance_value
end

Then(/^the Patient's Veteran status value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_veteran_status_value_visible
  expect(@ehmp).to have_fld_veteran_status_value
end

Then(/^the Patient's Marital status value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  Capybara.page.driver.browser.manage.window.resize_to(1280, 2400)
  @ehmp.wait_until_fld_marital_status_value_visible(30)
  expect(@ehmp).to have_fld_marital_status_value
end

Then(/^the Patient's Religion value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  Capybara.page.driver.browser.manage.window.resize_to(1280, 2400)
  @ehmp.wait_until_fld_religion_value_visible(30)
  expect(@ehmp).to have_fld_religion_value
end

Then(/^the Patient's Temporary Home Address value is displayed$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_home_temp_add_value_visible
  expect(@ehmp).to have_fld_home_temp_add_value
end

Then(/^the Patient's Home Phone is in acceptable format$/) do
  @ehmp = PobDemographicsElements.new unless @ehmp.is_a? PobDemographicsElements
  @ehmp.wait_until_fld_home_phone_label_visible
  @ehmp.wait_until_fld_home_phone_value_visible
  expect(@ehmp.phone_in_correct_format? @ehmp.fld_home_phone_value.text).to eq(true), "Home Phone was not in correct format"
end

Then(/^the Patient's Cell Phone is in acceptable format$/) do
  @ehmp = PobDemographicsElements.new unless @ehmp.is_a? PobDemographicsElements
  @ehmp.wait_until_fld_cell_phone_label_visible
  @ehmp.wait_until_fld_cell_phone_value_visible
  expect(@ehmp.phone_in_correct_format? @ehmp.fld_cell_phone_value.text).to eq(true), "Cell Phone was not in correct format"
end

Then(/^the Patient's Work Phone is in acceptable format$/) do
  @ehmp = PobDemographicsElements.new unless @ehmp.is_a? PobDemographicsElements
  @ehmp.wait_until_fld_work_phone_label_visible
  @ehmp.wait_until_fld_work_phone_value_visible
  expect(@ehmp.phone_in_correct_format? @ehmp.fld_work_phone_value.text).to eq(true), "Work Phone was not in correct format"
end

Then(/^the Patient's "([^"]*)" indicates discrepant data$/) do |partial_id|
  @ehmp = PobDemographicsElements.new unless @ehmp.is_a? PobDemographicsElements
  @ehmp.load_decrepant_elements(partial_id)
  @ehmp.wait_until_btn_decrepant_visible
  expect(@ehmp.has_btn_decrepant?).to eq(true)
end

Then(/^the Patient's "([^"]*)" does not indicate discrepant data$/) do |partial_id|
  @ehmp = PobDemographicsElements.new unless @ehmp.is_a? PobDemographicsElements
  @ehmp.load_decrepant_elements(partial_id)
  @ehmp.wait_until_fld_patient_info_title_visible
  expect(@ehmp.has_btn_decrepant?).to eq(false)
end

Then(/^the Patient's Name is "([^"]*)"$/) do |name|
  @ehmp = PobDemographicsElements.new unless @ehmp.is_a? PobDemographicsElements
  @ehmp.wait_until_fld_patient_name_status_visible
  expect(@ehmp.fld_patient_name_status.text.downcase).to include(name.downcase)
end

Then(/^the Patient's Status is "([^"]*)"$/) do |status|
  @ehmp = PobDemographicsElements.new unless @ehmp.is_a? PobDemographicsElements
  @ehmp.wait_until_fld_patient_name_status_visible
  expect(@ehmp.fld_patient_name_status.text.downcase).to include(status.downcase)
end

Then(/^the Patient's DOB is in format MM\/DD\/YYYY \(AGEy\)$/) do
  @ehmp = PobDemographicsElements.new unless @ehmp.is_a? PobDemographicsElements
  @ehmp.wait_until_fld_patient_name_status_visible
  years = Regexp.new("\\d{2}\\/\\d{2}\\/\\d{4}\s\\(\\d{2}y.*\\)")
  expect((@ehmp.fld_patient_info.text).should =~ (years)).to eq(true), "Actual: #{@ehmp.fld_patient_dob.text}, Expected Format: MM/DD/YYYY (AGEy)"
end

Then(/^the Patient's Home Phone is "([^"]*)"$/) do |phone|
  @ehmp = PobDemographicsElements.new unless @ehmp.is_a? PobDemographicsElements
  @ehmp.wait_until_fld_home_phone_label_visible
  @ehmp.wait_until_fld_home_phone_value_visible
  expect(@ehmp.fld_home_phone_value.text).to eq(phone)
end

Then(/^the Patient's Home Address line is "([^"]*)"$/) do |address|
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_home_address_value_visible
  expect(@ehmp).to have_fld_home_address_value
  expect(@ehmp.fld_home_address_value.text.upcase).to eq(address.upcase)
end

And(/^the Patient Information expanded area contains headers$/) do |table|
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_for_fld_demographic_group_headers minimum: 5
  @ehmp.wait_until_fld_demographic_group_headers_visible

  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.fld_demographic_group_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} >> was not found."
  end
end

And(/^the Patient Information expanded area contains fields/) do |table|
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_for_fld_demographic_group_fields
  @ehmp.wait_until_fld_demographic_group_fields_visible

  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.fld_demographic_group_fields, "#{headers[0]}")).to eq(true), "#{headers[0]} >> was not found."
  end
end
