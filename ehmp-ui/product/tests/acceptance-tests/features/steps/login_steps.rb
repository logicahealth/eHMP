Given(/^user is logged into eHMP\-UI$/) do
  # login_elements = LoginHTMLElements.instance
  # TestSupport.navigate_to_url(DefaultLogin.ehmpui_url) unless login_elements.am_i_visible? 'SignIn'
  # begin
  #   # TestSupport.driver.manage.window.maximize
  #   # target_size = Selenium::WebDriver::Dimension.new(1280, 800)
  #   # TestSupport.driver.manage.window.size = target_size
  #   TestSupport.driver.manage.window.resize_to(1280, 800)
  #   p "Browser window size: #{TestSupport.driver.manage.window.size}"
  # rescue Exception => e
  #   p "Exception #{e}"
  #   p "Unable to maximize window - continuing anyway"
  # end
  # driver = TestSupport.driver
  #
  # # start DE3158
  # # app cache could take up to 2 minutes to load the first time
  # wait = Selenium::WebDriver::Wait.new(:timeout => 120)
  # wait.until { login_elements.am_i_visible?("SignIn") }
  # # end DE3158
  #
  # expect(select_default_facility).to be_true
  #
  # expect(login_elements.perform_action("AccessCode", DefaultLogin.accesscode)).to be_true
  # expect(login_elements.perform_action("VerifyCode", DefaultLogin.verifycode)).to be_true
  #
  # expect(login_elements.perform_action("SignIn", "")).to be_true
  #
  # expect(login_elements.wait_until_element_present('Signout', 60)).to eq(true), 'Signout button was not displayed.  Still on login page?'
  # TestSupport.driver.execute_script("$.fx.off = true;")

  begin
    @ehmp = PobLoginPage.new
    p 'about to load'
    @ehmp.load
    p 'about to resize'
    page.driver.browser.manage.window.resize_to(1280, 1080)
    p 'waiting'
    @ehmp.wait_for_ddl_facility(240)
    p '@ehmp.wait_for_ddl_facility(240): Successful'
    expect(@ehmp).to have_ddl_facility
    p 'expect(@ehmp).to have_ddl_facility: Successful'
    @ehmp.wait_until_ddl_facility_visible
    p 'ddl facility is visible'
    @ehmp.login_with(DefaultLogin.default_facility_name, DefaultLogin.accesscode, DefaultLogin.verifycode)
    p 'performed login'
    @ehmp = PobPatientSearch.new
    p 'new Patient Search'
    @ehmp.wait_until_fld_patient_search_visible
    p 'patient search fld was visible'
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
