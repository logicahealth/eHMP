Then(/^the first record in the list is "(.*?)"$/) do |most_recent_patient|
  rp_tray = PobStaffView.new
  names = rp_tray.fld_rp_result_name_text

  expect(names.length).to be > 0
  expect(names[0].upcase).to have_text(most_recent_patient.upcase), "Expected #{names[0]} to have #{most_recent_patient}"
end

Then(/^the patient names in the Recent Patients list are in format Last Name, First Name \+ \(First Letter in Last Name \+ Last (\d+) SSN \)$/) do |arg1|
  rp_list = PobHeaderFooter.new
  names = rp_list.check_pat_name_format
  expect(names.length).to be > 0

  names.each do | name |
    result = name.match(/\w+, \w+ \(\w\d{4}\)/)
    if result.nil?
      result_sensitive = name.match(/\w+, \w+ \(\*SENSITIVE\*\)/)
      expect(result_sensitive).to_not be_nil, "#{name} did not match expected format"
    end
  end
end

Then(/^user navigates to the staff view screen$/) do
  @ehmp = PobStaffView.new
  @ehmp.wait_until_fld_staff_view_visible
  expect(@ehmp).to have_fld_staff_view
  @ehmp.fld_staff_view.click
  @ehmp.wait_until_fld_active_staff_view_visible
  expect(@ehmp).to have_fld_active_staff_view
end

When(/^the user selects Patients header button and views the Recent Patients tray$/) do
  page = PobHeaderFooter.new
  expect(page.wait_for_btn_patients).to eq(true), "Expected a Patients button"
  page.btn_patients.click
  rp_try = PobStaffView.new
  expect(rp_try.wait_for_btn_search_tray_close).to eq(true), "X (close) button in tray header did not display"
  wait = Selenium::WebDriver::Wait.new(:timeout => 15)
  wait.until { rp_try.recentpatient_search_results_loaded? }
  step 'the Patients header button is highlighted'
end
