Given(/^user is logged into eHMP\-UI as kodak user$/) do
  begin
    @ehmp = PobLoginPage.new
    @ehmp.load
    TestSupport.driver.manage.window.resize_to(1280, 800)
    @ehmp.wait_for_ddl_facility(120)
    expect(@ehmp).to have_ddl_facility
    @ehmp.wait_until_ddl_facility_visible
    @ehmp.login_with(DefaultLoginKodak.default_facility_name, DefaultLoginKodak.accesscode, DefaultLoginKodak.verifycode)
    @ehmp = PobPatientSearch.new
    @ehmp.wait_until_fld_patient_search_visible
    expect(@ehmp).to have_fld_patient_search
    p "User Successfully has Logged in!"
  rescue
    @ehmp = PobPatientSearch.new
    @ehmp.load
    @ehmp.wait_until_fld_patient_search_visible
    if expect(@ehmp).to have_fld_patient_search
      p "Needed to Refresh the Patient Search Page"
    end
  end
end
