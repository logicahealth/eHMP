Then(/^the staff view screen displays Recent Patients in the sidebar tray$/) do
  staff_view = PobStaffView.new
  expect(staff_view.wait_for_closed_recentpatients).to eq(true), "Unselected Recent Patients button is not visible"
  expect(staff_view.wait_for_btn_open_recentpatients).to eq(true)
  expect(staff_view.btn_open_recentpatients.text.upcase).to eq("RECENT PATIENTS")
end

When(/^the user opens the Recent Patients tray$/) do
  staff_view = PobStaffView.new
  expect(staff_view.wait_for_closed_recentpatients).to eq(true), "Unselected recent patients button is not visible"
  expect(staff_view.wait_for_btn_open_recentpatients).to eq(true), "Button to open recent patients tray is not visible"
  staff_view.btn_open_recentpatients.click
  expect(staff_view.wait_for_open_recentpatients).to eq(true), "recent patients tray did not open"
end

When(/^the Recent Patients tray displays a close x button$/) do
  rp_try = PobStaffView.new
  expect(rp_try.wait_for_btn_search_tray_close).to eq(true), "X (close) button in tray header did not display"
end

When(/^the Recent Patients tray displays a help button$/) do
  rp_tray = PobStaffView.new
  expect(rp_tray.wait_for_btn_search_tray_help).to eq(true), "Help button in tray header did not display"
end

When(/^the Recent Patients Tray table headers are$/) do |table|
  rp_tray = PobStaffView.new
  wait_until { rp_tray.fld_rp_result_headers.length > 0 }
  max_attempt = 2
  begin
    table.rows.each do | expected_header |
      expect(rp_tray.fld_rp_result_headers_text).to include expected_header[0].upcase
    end
  rescue Exception => e
    p e
    max_attempt -= 1
    retry if max_attempt >= 0
    raise e if max_attempt < 0
  end
end

Then(/^the Recent Patients Tray no results message displays$/) do
  rp_tray = PobStaffView.new
  expect(rp_tray.wait_for_fld_search_no_results).to eq(true)
  expect(rp_tray).to have_fld_search_no_results
  expect(rp_tray.fld_search_no_results.text.upcase).to eq('NO RESULTS FOUND.')
end

When(/^the Recent Patients Tray patient name search results are in format Last Name, First Name \+ \(First Letter in Last Name \+ Last (\d+) SSN \)$/) do |arg1|
  rp_tray = PobStaffView.new
  names = rp_tray.fld_rp_result_name_text
  expect(names.length).to be > 0

  names.each do | name |
    result = name.match(/\w+, \w+ \(\w\d{4}\)/)
    if result.nil?
      result_sensitive = name.match(/\w+, \w+ \(\*SENSITIVE\*\)/)
      expect(result_sensitive).to_not be_nil, "#{name} did not match expected format"
    end
  end
end

When(/^the Recent Patients Tray date of birth search results are in format Date \(Agey\) \- Gender \(first letter\)$/) do
  rp_tray = PobStaffView.new
  dobs = rp_tray.fld_rp_result_dob_text
  expect(dobs.length).to be > 0

  dobs.each do | dob |
    result = dob.match(/\d{2}\/\d{2}\/\d{4}  \(\d+y\)  - [MFU]/)
    if result.nil?
      result_sensitive = dob.match(/\*SENSITIVE\*  - [MFU]/)
      expect(result_sensitive).to_not be_nil, "#{dob} did not match expected format"
    end
  end
end

Given(/^the Recent Patients Tray contains search results$/) do
  rp_tray = PobStaffView.new
  wait_until { rp_tray.recentpatient_search_results_loaded? }
  expect(rp_tray.fld_rp_dob_results.length).to be > 0
end

When(/^user chooses to load a patient from the Recent Patients results list$/) do
  patient_search = PatientSearch2.instance
  rp_tray = PobStaffView.new
  wait_until { rp_tray.recentpatient_search_results_loaded? }
  expect(rp_tray.fld_rp_dob_results.length).to be > 0
  @selected_user_name_ssn = rp_tray.fld_rp_result_name_text[0]
  rp_tray.fld_rp_dob_results[0].click
  expect(patient_search.perform_action("Confirm")).to be_true
  expect(wait_until_dom_has_confirmflag_or_patientsearch(120)).to be_true, "Patient selection did not complete successfully"
end

Then(/^the Global Header displays the selected user name$/) do
  expect(@selected_user_name_ssn).to_not be_nil, "expected variable @selected_user_name_ssn to be set in previous step"
  name = @selected_user_name_ssn
  ehmp = PobCoverSheet.new
  expect(ehmp.global_header.wait_for_fld_patient_name).to eq(true)
  # remove spaces so they don't have to be exact and take case out of the equation
  expect(ehmp.global_header.fld_patient_name.text.gsub(' ', '').upcase).to eq(name.gsub(' ', '').upcase)
end
