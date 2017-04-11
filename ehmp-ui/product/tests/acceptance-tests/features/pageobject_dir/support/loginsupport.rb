Given(/^POB user is logged into EHMP\-UI with facility as  "(.*?)" accesscode as  "(.*?)" verifycode as  "(.*?)"/) \
do |facility, user, pwd|
  @ehmp = PobLoginPage.new
  @ehmp.load
  @ehmp.wait_for_ddl_facility(120)
  expect(@ehmp).to have_ddl_facility
  @ehmp.wait_until_ddl_facility_visible
  @ehmp.login_with(facility, user, pwd)
end

Then(/^POB log me out$/) do
  begin
    @ehmp = PobPatientSearch.new
    @ehmp.load
    @ehmp.wait_until_ddl_ehmp_current_user_visible
    @ehmp.ddl_ehmp_current_user.click
    @ehmp.wait_for_btn_logout
    expect(@ehmp).to have_btn_logout
    @ehmp.btn_logout.click
    @ehmp = PobLoginPage.new
    @ehmp.wait_for_ddl_facility
    expect(@ehmp).to have_ddl_facility
    DefaultLogin.logged_in = false
    p 'Logging out ---'
  rescue
    page.execute_script('sessionStorage.clear()')
    Capybara.reset_session!
    p "Couldn't log out. So resetting Capybara Browser Session!"
    DefaultLogin.logged_in = false
  end
end

Given(/^Navigate to Patient Search Screen$/) \
do
  begin
    @ehmp = PobPatientSearch.new
    @ehmp.load
    patient_search = PatientSearch2.instance
    # if patient search button is found, click it to go to patient search
    patient_search.perform_action("patientSearch") if patient_search.static_dom_element_exists? "patientSearch"
    need_refresh_de2106(patient_search)
    DefaultLogin.logged_in = true
    p "Navigated to the Patient Search Screen"
  rescue
    page.execute_script('sessionStorage.clear()')
    Capybara.reset_session!
    p "Can't navigate & resetting Capybara Browser session"
    DefaultLogin.logged_in = false
  end
end
