Given(/^user has option to search for patients via Wards$/) do
  @ehmp = PobPatientSearch.new
  @ehmp.wait_for_btn_wards
  expect(@ehmp).to have_btn_wards
end

When(/^user chooses to search for patients via Wards$/) do
  @ehmp = PobPatientSearch.new
  @ehmp.wait_for_btn_wards
  @ehmp.wait_until_btn_wards_active_invisible
  @ehmp.btn_wards.click
  @ehmp.wait_until_btn_wards_active_visible
end

Then(/^a Ward filter is displayed$/) do
  @ehmp = PobPatientSearch.new
  expect(@ehmp).to have_fld_ward_filter
  expect(@ehmp.fld_ward_filter[:placeholder]).to eq('Filter wards')
end

Then(/^a Ward list is displayed$/) do
  @ehmp = PobPatientSearch.new
  @ehmp.wait_for_fld_ward_list
  expect(@ehmp.fld_ward_list.length).to be > 0
end

Then(/^Ward headers are displayed$/) do |table|
  @ehmp = PobPatientSearch.new
  headers = @ehmp.ward_headers
  table.rows.each do | header_array |
    expect(headers).to include header_array[0]
  end
end

Then(/^Ward search results asks user to "([^"]*)"$/) do |message|
  @ehmp = PobPatientSearch.new
  expect(@ehmp.fld_ward_search_instructions.text.upcase).to eq('USE FILTER TO DISPLAY RESULTS')
end

When(/^user selects a ward with patients$/) do
  @ehmp = PobPatientSearch.new
  @ehmp.wait_for_fld_ward_list
  expect(@ehmp.fld_ward_list.length).to be > 0
  found_patients = false
  wait = Selenium::WebDriver::Wait.new(:timeout => 15)
  @ehmp.fld_ward_list.each_with_index do | ward, index |
    ward.click
    wait.until { @ehmp.ward_search_results_loaded? }
    found_patients = true if @ehmp.ward_search_results.length > 0
    @choosen_ward = @ehmp.fld_ward_list_displayname[index].text if found_patients
    break if found_patients
  end
  expect(found_patients).to eq(true), "none of the wards provided have patients"
end

Then(/^ward patients are displayed$/) do
  @ehmp = PobPatientSearch.new
  @ehmp.wait_for_ward_patient_results_patient_names
  expect(@ehmp.ward_patient_names.length).to be > 0
  name_format = Regexp.new("\\w+, \\w+")
  @ehmp.ward_patient_names.each do | name |
    expect(name_format.match(name).nil?).to eq(false), "#{name} did not match expected format"
  end
end

When(/^user filters the Wards by term "([^"]*)"$/) do |term|
  @ehmp = PobPatientSearch.new
  ward_count = @ehmp.fld_ward_list.length
  expect(@ehmp).to have_fld_ward_filter
  @ehmp.fld_ward_filter.set term
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  wait.until { @ehmp.fld_ward_list.length != ward_count }
end

Then(/^the Ward list only includes wards with letters "([^"]*)"$/) do |term|
  @ehmp = PobPatientSearch.new
  ward_list_names = @ehmp.fld_ward_list_displayname
  ward_list_names.each do | ward |
    expect(ward.text).to include term
  end
end

Then(/^Current Encounter displays the expected ward$/) do
  @ehmp = PobEncountersApplet.new
  expect(@ehmp).to have_btn_set_encounter
  expect(@choosen_ward).to_not be_nil, "Expected variable choosen_ward to be set in a previous step"
  expect(@ehmp.current_encounter_text.text).to include @choosen_ward
end

Then(/^the Ward filter has a filter icon$/) do
  ehmp = PobPatientSearch.new
  ehmp.wait_for_fld_ward_filter_icon
  expect(ehmp).to have_fld_ward_filter_icon
end

Then(/^a clear ward filter icon \( X \) is displayed$/) do
  ehmp = PobPatientSearch.new
  ehmp.wait_for_btn_clear_ward_filter
  expect(ehmp).to have_btn_clear_ward_filter
end

Then(/^the clear ward filter icon clears the filter when selected$/) do
  ehmp = PobPatientSearch.new
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)

  pre_clear_ward_list_count = ehmp.fld_ward_list.length
  ehmp.wait_until_btn_clear_ward_filter_visible
  ehmp.btn_clear_ward_filter.click
  ehmp.wait_until_btn_clear_ward_filter_invisible
  wait.until { ehmp.fld_ward_list.length != pre_clear_ward_list_count }

  expect(ehmp.fld_ward_list.length).to_not eql(pre_clear_ward_list_count)
  expect(ehmp).to_not have_btn_clear_ward_filter
end

