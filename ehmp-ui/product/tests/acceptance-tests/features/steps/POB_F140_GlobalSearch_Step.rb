Given(/^POB the user is on all patient tab Nationwide$/) do
  @ehmp = PobPatientSearch.new
  @ehmp.load
  @ehmp.wait_for_fld_patient_search do
    @ehmp.continue
  end
  @ehmp.wait_for_btn_nationwide
  @ehmp.btn_nationwide.click
  @ehmp.wait_for_fld_global_Search_Last_N
  expect(@ehmp).to have_fld_global_Search_Last_N
end

When(/^POB user enters last name in all patient search as "(.*?)"$/) do |lastname|
  @ehmp = PobPatientSearch.new
  expect(@ehmp).to have_fld_global_Search_Last_N
  @ehmp.fld_global_Search_Last_N.set lastname
end

When(/^POB user enters ssn in all patient search as "(.*?)"$/) do |ssn|
  @ehmp = PobPatientSearch.new
  @ehmp.wait_for_fld_global_Search_Ssn
  expect(@ehmp).to have_fld_global_Search_Ssn
  @ehmp.fld_global_Search_Ssn.click
  @ehmp.fld_global_Search_Ssn.set ssn
end

When(/^POB user enters date of birth in all patient search as "(.*?)"$/) do |dob|
  @ehmp = PobPatientSearch.new
  @ehmp.wait_for_fld_global_Search_dob
  expect(@ehmp).to have_fld_global_Search_dob
  @ehmp.fld_global_Search_dob.click
  @ehmp.fld_global_Search_dob.set dob
end

When(/^POB the user click on All Patient Search$/) do
  @ehmp = PobPatientSearch.new
  @ehmp.wait_for_btn_global_Search
  expect(@ehmp).to have_btn_global_Search
  @ehmp.btn_global_Search.click
end

When(/^POB "(.*?)" confirmation section header displays below information$/) do |patient, table|
  @ehmp = PobPatientSearch.new
  @ehmp.wait_for_fld_confirm_header(30)
  expect(@ehmp.fld_confirm_header).to have_text(patient)
  table.rows.each do |field, value|
    @ehmp.fld_patient_search_confirmation_info.text.include? "#{field}" "#{value}"
  end
  @ehmp.wait_until_btn_confirmation_visible
  @ehmp.btn_confirmation.click
end

When(/^POB user clicks on confirm Flagged Patient Button$/) do
  @ehmp = PobPatientSearch.new
  @ehmp.wait_for_btn_confirmFlagged
  expect(@ehmp).to have_btn_confirmFlagged
  @ehmp.btn_confirmFlagged.click
end
