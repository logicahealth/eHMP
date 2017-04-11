def wait_for_facility_or_noresponse(login_page)
  return true if login_page.has_ddl_facility?
  return true if login_page.has_fld_rdk_no_response?
  return false
end

Given(/^user is logged into eHMP\-UI$/) do
  @ehmp = PobLoginPage.new

  @ehmp.load
  
  p 'waiting for facility dropdown'
  wait = Selenium::WebDriver::Wait.new(:timeout => 120)
  wait.until { wait_for_facility_or_noresponse @ehmp }

  error_message = @ehmp.check_rdk_response unless @ehmp.has_ddl_facility?
  expect(@ehmp).to have_ddl_facility, "Facility Dropdown is not visible #{error_message}"

  @ehmp.wait_until_ddl_facility_visible
  @ehmp.login_with(DefaultLogin.default_facility_name, DefaultLogin.accesscode, DefaultLogin.verifycode)
  @ehmp = PobPatientSearch.new
  max_attempt = 2
  begin
    @ehmp.wait_for_fld_nav_bar(30)
    # @ehmp.wait_until_btn_patient_selection_visible
    expect(@ehmp).to have_fld_nav_bar
    p "User Successfully has Logged in!"
    DefaultLogin.logged_in = true
  rescue => e
    p "Still in login step: #{e}"
    max_attempt -= 1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end

  wait_for_staff_view_loaded
  step 'Navigate to Patient Search Screen'
end

def wait_for_staff_view_loaded
  @ehmp = PobStaffView.new
  max_attempt = 2
  begin
    @ehmp.wait_until_fld_active_staff_view_visible
    @ehmp.wait_until_fld_recent_patient_list_visible

    expect(@ehmp).to have_fld_active_staff_view
    p "Recent Patients are not displayed! continue anyway" unless @ehmp.has_fld_recent_patient_list?
  rescue => e
    p "Exception waiting for staff view to load: #{e}"
    @ehmp.load
    max_attempt -= 1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
end
