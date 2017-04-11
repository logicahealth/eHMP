Given(/^POB user is logged into EHMP\-UI successfully$/) \
do
  begin
    @ehmp = PobLoginPage.new
    @ehmp.load
    TestSupport.driver.manage.window.resize_to(1280, 800)
    @ehmp.wait_for_ddl_facility(120)
    expect(@ehmp).to have_ddl_facility
    @ehmp.wait_until_ddl_facility_visible
    @ehmp.login_with(DefaultLogin.default_facility_name, DefaultLogin.accesscode, DefaultLogin.verifycode)
    @ehmp = PobPatientSearch.new
    @ehmp.wait_until_fld_patient_search_visible
    expect(@ehmp).to have_fld_patient_search
    p "User Successfully has Logged in!"
  rescue => e
    p e
    p "Need to Refresh Patient Search Screen ?"
    @ehmp = PobPatientSearch.new
    @ehmp.load
    @ehmp.wait_for_fld_patient_search(30)
    @ehmp.wait_until_fld_patient_search_visible
    if expect(@ehmp).to have_fld_patient_search
      p "Refreshing Patient Search Screen is Successful !"
    end
  end
end

Given(/^POB user is logged into EHMP\-UI with facility as  "(.*?)" accesscode as  "(.*?)" verifycode as  "(.*?)"/) \
do |facility, user, pwd|
  @ehmp = PobLoginPage.new
  @ehmp.load
  TestSupport.driver.manage.window.resize_to(1280, 800)
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
  rescue
    page.execute_script('sessionStorage.clear()')
    Capybara.reset!
    p "Resetting Capybara Browser session"
  end
end
