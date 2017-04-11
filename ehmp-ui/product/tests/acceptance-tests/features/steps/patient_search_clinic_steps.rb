Given(/^user has option to search for patients via Clinics$/) do
  @ehmp = PobPatientSearch.new
  @ehmp.wait_for_btn_clinics
  expect(@ehmp).to have_btn_clinics
end

When(/^user chooses to search for patients via Clinics$/) do
  @ehmp = PobPatientSearch.new
  @ehmp.wait_for_btn_clinics
  @ehmp.wait_until_btn_clinics_active_invisible
  expect(@ehmp).to have_btn_clinics
  @ehmp.btn_clinics.click
  @ehmp.wait_until_btn_clinics_active_visible
end

When(/^a Clinic filter is displayed$/) do
  @ehmp = PobPatientSearch.new
  @ehmp.wait_for_fld_clinic_filter
  expect(@ehmp).to have_fld_clinic_filter
  expect(@ehmp.fld_clinic_filter[:placeholder]).to eq('Filter clinics')
end

Then(/^the Clinic filter has a filter icon$/) do
  ehmp = PobPatientSearch.new
  ehmp.wait_for_fld_clinic_filter_icon
  expect(ehmp).to have_fld_clinic_filter_icon
end

When(/^user filters the Clinics by term "([^"]*)"$/) do |term|
  @ehmp = PobPatientSearch.new
  clinic_count = @ehmp.fld_clinic_list.length
  expect(@ehmp).to have_fld_clinic_filter
  @ehmp.fld_clinic_filter.set term
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  wait.until { @ehmp.fld_clinic_list.length != clinic_count }
end

Then(/^a clear clinic filter icon \( X \) is displayed$/) do
  ehmp = PobPatientSearch.new
  ehmp.wait_for_btn_clear_clinic_filter
  expect(ehmp).to have_btn_clear_clinic_filter
end

Then(/^the clear clinic filter icon clears the filter when selected$/) do
  ehmp = PobPatientSearch.new
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)

  pre_clear_clinic_list_count = ehmp.fld_clinic_list.length
  ehmp.wait_until_btn_clear_clinic_filter_visible
  ehmp.btn_clear_clinic_filter.click
  ehmp.wait_until_btn_clear_clinic_filter_invisible
  wait.until { ehmp.fld_clinic_list.length != pre_clear_clinic_list_count }

  expect(ehmp.fld_clinic_list.length).to_not eql(pre_clear_clinic_list_count)
  expect(ehmp).to_not have_btn_clear_clinic_filter
end
