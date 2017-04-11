Then(/^the staff view screen displays Nationwide in the sidebar tray$/) do
  staff_view = PobStaffView.new
  expect(staff_view.wait_for_closed_nationwide).to eq(true), "Unselected nationwide button is not visible"
  expect(staff_view.wait_for_btn_open_nationwide).to eq(true)
  expect(staff_view.btn_open_nationwide.text.upcase).to eq("NATIONWIDE")
end

When(/^the user opens the Nationwide tray$/) do
  staff_view = PobStaffView.new
  expect(staff_view.wait_for_closed_nationwide).to eq(true), "Unselected Nationwide button is not visible"
  expect(staff_view.wait_for_btn_open_nationwide).to eq(true), "Button to open Nationwide tray is not visible"
  staff_view.btn_open_nationwide.click
  expect(staff_view.wait_for_open_nationwide).to eq(true), "Nationwide tray did not open"
end

When(/^the Nationwide tray displays a close x button$/) do
  nationwide_tray = PobStaffView.new
  expect(nationwide_tray.wait_for_btn_search_tray_close).to eq(true), "X (close) button in tray header did not display"
end

When(/^the Nationwide tray displays a help button$/) do
  nationwide_tray = PobStaffView.new
  expect(nationwide_tray.wait_for_btn_search_tray_help).to eq(true), "Help button in tray header did not display"
end

When(/^the Nationwide tray displays a Last name selection box$/) do
  nationwide_tray = PobStaffView.new
  nationwide_tray.wait_for_fld_nationwide_lastname
  expect(nationwide_tray).to have_fld_nationwide_lastname
end

When(/^the Nationwide tray displays a First name selection box$/) do
  nationwide_tray = PobStaffView.new
  nationwide_tray.wait_for_fld_nationwide_firstname
  expect(nationwide_tray).to have_fld_nationwide_firstname
end

When(/^the Nationwide tray displays a DOB selection box$/) do
  nationwide_tray = PobStaffView.new
  nationwide_tray.wait_for_fld_nationwide_dob
  expect(nationwide_tray).to have_fld_nationwide_dob
end

When(/^the Nationwide tray displays a SSN selection box$/) do
  nationwide_tray = PobStaffView.new
  nationwide_tray.wait_for_fld_nationwide_ssn
  expect(nationwide_tray).to have_fld_nationwide_ssn
end

When(/^the user enters last name "([^"]*)" in nationwide tray$/) do |lastname|
  nationwide_tray = PobStaffView.new
  expect(nationwide_tray.wait_for_fld_nationwide_lastname).to eq(true)
  max_attempt = 3
  begin
    nationwide_tray.fld_nationwide_lastname.click
    nationwide_tray.fld_nationwide_lastname.native.send_keys [:end]
    nationwide_tray.fld_nationwide_lastname.native.send_keys [:shift, :home], :backspace
    
    nationwide_tray.fld_nationwide_lastname.native.send_keys lastname, :tab
    expect(nationwide_tray.fld_nationwide_lastname.value).to eq(lastname)
  rescue Exception => e
    p "Attempt last name #{max_attempt}: #{e}"
    max_attempt -= 1
    raise e if max_attempt < 0
    retry
  end
end

When(/^the user enters first name "([^"]*)" in nationwide tray$/) do |firstname|
  nationwide_tray = PobStaffView.new
  expect(nationwide_tray.wait_for_fld_nationwide_firstname).to eq(true)
  nationwide_tray.fld_nationwide_firstname.click

  nationwide_tray.fld_nationwide_firstname.native.send_keys firstname, :tab
end

When(/^the user enter dob "([^"]*)" in nationwide tray$/) do |dob|
  nationwide_tray = PobStaffView.new
  expect(nationwide_tray.wait_for_fld_nationwide_dob).to eq(true)
  nationwide_tray.fld_nationwide_dob.click
  nationwide_tray.fld_nationwide_dob.native.send_keys dob, :tab
end

When(/^the user enters ssn "([^"]*)" in nationwide tray$/) do |ssn|
  nationwide_tray = PobStaffView.new
  expect(nationwide_tray.wait_for_fld_nationwide_ssn).to eq(true)
  max_attempt = 3
  begin
    nationwide_tray.fld_nationwide_ssn.click
    nationwide_tray.fld_nationwide_ssn.set ssn
    nationwide_tray.fld_nationwide_ssn.native.send_keys :tab
  rescue Exception => e
    p "Error setting ssn (attempt #{max_attempt}): #{e}"
    max_attempt -= 1
    raise e if max_attempt <= 0

    retry if max_attempt > 0
  end
end

When(/^the Nationwide Tray contains search results$/) do
  nationwide_tray = PobStaffView.new
  wait_until { nationwide_tray.nationwide_search_results_loaded? }
  expect(nationwide_tray.fld_nw_dob_results.length).to be > 0
end

When(/^the Nationwide Tray table headers are$/) do |table|
  nationwide_tray = PobStaffView.new
  wait_until { nationwide_tray.fld_nw_result_headers.length > 0 }
  table.rows.each do | expected_header |
    expect(nationwide_tray.fld_nw_result_headers_text).to include expected_header[0].upcase
  end
end

When(/^the Nationwide Tray patient name search results are in format Last Name, First Name \+ \(First Letter in Last Name \+ Last (\d+) SSN \)$/) do |arg1|
  nationwide_tray = PobStaffView.new
  names = nationwide_tray.fld_ward_result_name_text
  expect(names.length).to be > 0

  names.each do | name |
    result = name.match(/\w+, \w+ \(\w\d{4}\)/)
    expect(result).to_not be_nil, "#{name} did not match expected format"
  end
end

When(/^the Nationwide Tray date of birth search results are in format Date \(Agey\) \- Gender \(first letter\)$/) do
  nationwide_tray = PobStaffView.new
  dobs = nationwide_tray.fld_nw_result_dob_text
  expect(dobs.length).to be > 0

  dobs.each do | dob |
    result = dob.match(/\d{2}\/\d{2}\/\d{4}  \(\d+y\)  - [MFU]/)
    expect(result).to_not be_nil, "#{dob} did not match expected format"
  end
end

When(/^the user selects Nationwide search button$/) do
  nationwide_tray = PobStaffView.new
  expect(nationwide_tray.wait_for_btn_nationwide_search).to eq(true)
  nationwide_tray.btn_nationwide_search.click
end

Then(/^the Nationwide Tray error message "([^"]*)" displays$/) do |message|
  nationwide_tray = PobStaffView.new
  expect(nationwide_tray.wait_for_fld_nw_no_patients).to eq(true)
  expect(nationwide_tray.fld_nw_no_patients.text.upcase).to eq(message.upcase)
end

Then(/^the Nationwide Tray displays no results message displays$/) do
  message = "No results found. Verify search criteria."
  nationwide_tray = PobStaffView.new
  expect(nationwide_tray.wait_for_fld_nw_no_patients).to eq(true)
  expect(nationwide_tray.fld_nw_no_patients.text.upcase).to eq(message.upcase)
end

Then(/^the Nationwide search results contain "([^"]*)"$/) do |patient_name|
  nationwide_tray = PobStaffView.new
  wait_until { nationwide_tray.fld_nw_dob_results.length > 0 }
  column1_visible_text = nationwide_tray.fld_nw_result_name_text
  found_patient_index = -1
  column1_visible_text.each_with_index do | name, index |
    p name.upcase.gsub(' ', '')
    p patient_name.upcase.gsub(' ', '')

    found_patient_index = index if name.upcase.gsub(' ', '').start_with? patient_name.upcase.gsub(' ', '')
    break if found_patient_index > -1
  end
  expect(found_patient_index).to be > -1, "Did not find #{patient_name} in the search results"
end

Then(/^the user selects nationwide search patient "([^"]*)"$/) do |search_value|
  nationwide_tray = PobStaffView.new

  name_only = []
  index_of = -1
  search_value2 = search_value.gsub(' ', '').upcase
  nationwide_tray.fld_nw_result_name_text.each_with_index do | name_ssn, index |
    result_name = Regexp.new("\\w+, \\w+\\w+-*\\w*").match(name_ssn).to_s
    result_name = result_name.gsub(' ', '')
    p "#{result_name.upcase} #{search_value2}"
    index_of = index if result_name.upcase.start_with?(search_value2)
    break if index_of > -1
  end
  expect(index_of).to_not eq(-1), "Patient #{search_value} was not found in result list"
  expect(index_of).to be < nationwide_tray.my_site_search_results_name.length
  nationwide_tray.my_site_search_results_name[index_of].click

  patient_search = PatientSearch2.instance
  expect(patient_search.perform_action("Confirm")).to be_true
  expect(wait_until_dom_has_confirmflag_or_patientsearch).to be_true, "Patient selection did not complete successfully"
end
