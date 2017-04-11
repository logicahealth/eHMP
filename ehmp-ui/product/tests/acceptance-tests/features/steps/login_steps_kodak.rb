#Given(/^user is logged into eHMP\-UI as kodak user$/) do
#  TestSupport.navigate_to_url(DefaultLoginKodak.ehmpui_url + "/#patient-search-screen")
#  driver = TestSupport.driver
#  #TestSupport.driver.manage.window.maximize
#  TestSupport.driver.manage.window.resize_to(1400, 1300)
#  TestSupport.wait_for_page_loaded
#  wait_until_dom_has_signin_or_signout
#
#  login_elements = LoginHTMLElements.instance
#  if login_elements.static_dom_element_exists?("Signout")
#    perform_signout_steps login_elements
#  end
#  
#  #expect(login_elements.static_dom_element_exists?"Facility").to be_true
#  #login_elements.wait_until_action_element_visible("Facility", 30)
#  expect(login_elements.static_dom_element_exists?("Facility")).to be_true
#  expect(login_elements.perform_action("Facility", DefaultLoginKodak.default_facility_name)).to be_true
#
#  expect(login_elements.perform_action("AccessCode", DefaultLoginKodak.accesscode)).to be_true
#  expect(login_elements.perform_action("VerifyCode", DefaultLoginKodak.verifycode)).to be_true
#
#  expect(login_elements.perform_action("SignIn", "")).to be_true
#  login_elements.wait_until_element_present('Signout')
#  TestSupport.driver.execute_script("$.fx.off = true;")
#end

Given(/^user is logged into eHMP\-UI as kodak user$/) do
  # p "running test #{TestSupport.test_counter} #{TestSupport.test_counter % 20}"
  # if ENV.keys.include?('LOCAL') || TestSupport.test_counter % 20 == 0
  #   p 'refresh the app'
  #   TestSupport.navigate_to_url(DefaultLoginKodak.ehmpui_url)
  # else
  #   TestSupport.navigate_to_url(DefaultLoginKodak.ehmpui_url + "/#patient-search-screen")
  # end
  #
  # begin
  #   TestSupport.driver.manage.window.maximize
  #   #TestSupport.driver.manage.window.resize_to(1300, 900)
  # rescue
  #   p "Unable to maximize window - continuing anyway"
  # end
  #
  # wait_until_dom_has_signin_or_signout
  #
  # login_elements = LoginHTMLElements.instance
  # if login_elements.static_dom_element_exists?("Signout")
  #   perform_signout_steps login_elements
  # end
  #
  # #expect(login_elements.static_dom_element_exists?"Facility").to be_true
  # #login_elements.wait_until_action_element_visible("Facility", 30)
  # expect(login_elements.static_dom_element_exists?("Facility")).to be_true
  # expect(login_elements.perform_action("Facility", DefaultLoginKodak.default_facility_name)).to be_true
  #
  # expect(login_elements.perform_action("AccessCode", DefaultLoginKodak.accesscode)).to be_true
  # expect(login_elements.perform_action("VerifyCode", DefaultLoginKodak.verifycode)).to be_true
  #
  # expect(login_elements.perform_action("SignIn", "")).to be_true
  # login_elements.wait_until_element_present('Signout')
  # TestSupport.driver.execute_script("$.fx.off = true;")
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
