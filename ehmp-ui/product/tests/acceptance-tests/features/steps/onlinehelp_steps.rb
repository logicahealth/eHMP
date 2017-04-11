Given(/^the On-line Help icon on login page of eHMP\-UI$/) do
  step 'POB log me out'
  @ehmp = PobLoginPage.new
  @ehmp.load
  TestSupport.driver.manage.window.resize_to(1280, 800)
  p @ehmp.url
  @ehmp.wait_for_ddl_facility(240)
  driver = TestSupport.driver
  expect(driver.find_element(:id, "linkHelp-logon")).to be_true
end

Then(/^the On-line Help icon is present on Patient Search page$/) do
  driver = TestSupport.driver
  expect(driver.find_element(:id, "linkHelp-patient_search")).to be_true
end

Given(/^user searches for patient "(.*?)"$/) do |search_value|
  patient_search = PatientSearch.instance
  driver = TestSupport.driver

  # if patient search button is found, click it to go to patient search
  patient_search.perform_action("patientSearch") if patient_search.static_dom_element_exists? "patientSearch"

  #verify icon help on My CPRS List
  patient_search.wait_until_element_present("myCPRSList", DefaultLogin.wait_time)
  expect(patient_search.perform_action("myCPRSList")).to be_true
  expect(driver.find_element(:id, "linkHelp-myCPRSList")).to be_true

  patient_search.wait_until_element_present("mySite", DefaultLogin.wait_time)
  expect(patient_search.perform_action("mySite")).to be_true

  element = nil
  Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time).until {
    element = driver.find_element(:id, "patientSearchInput")
    element.displayed?
    element.click
  }

  expect(patient_search.perform_action("patientSearchInput", search_value)).to be_true
  expect(patient_search.wait_until_xpath_count_greater_than("Patient Search Results", 0)).to be_true

  results = TestSupport.driver.find_elements(:xpath, "//span[contains(@class, 'patientDisplayName')]")
  patient_search.select_patient_in_list(0)

  driver = TestSupport.driver
  
  patient_search.wait_until_element_present("Confirm", DefaultLogin.wait_time)

  expect(driver.find_element(:id, "linkHelp-patient_search_confirm")).to be_true
  expect(driver.find_element(:id, "linkHelp-mySite")).to be_true
end

def verify_common_help_buttons
  PobProblemsApplet.new.wait_for_btn_applet_help
  expect(PobProblemsApplet.new).to have_btn_applet_help, "help icon not present on Problmes Applet"
  PobActiveRecentMedApplet.new.wait_for_btn_applet_help
  expect(PobActiveRecentMedApplet.new).to have_btn_applet_help, "help icon not present on ActiveMeds Applet"
  PobVitalsApplet.new.wait_for_btn_applet_help
  expect(PobVitalsApplet.new).to have_btn_applet_help, "help icon not present on Vitals Applet"
  PobImmunizationsApplet.new.wait_for_btn_applet_help
  expect(PobImmunizationsApplet.new).to have_btn_applet_help, "help icon not present on Immunization Applet"
  PobAllergiesApplet.new.wait_for_btn_applet_help
  expect(PobAllergiesApplet.new).to have_btn_applet_help, "help icon not present on Allergies Applet"
  PobNumericLabApplet.new.wait_for_btn_applet_help
  expect(PobNumericLabApplet.new).to have_btn_applet_help, "help icon not present on Numeric Labs Applet"

  @ehmp = PobCommonElements.new
  @ehmp.wait_for_fld_online_help_status_bar(30)
  expect(@ehmp.has_fld_online_help_status_bar?).to eq(true)
  
  @ehmp = PobOverView.new
  @ehmp.wait_for_fld_link_help_ehmp_header
  expect(@ehmp.has_fld_link_help_ehmp_header?).to eq(true)
end

Then(/^the On\-line Help icon is present on Overview page$/) do
  PobEncountersApplet.new.wait_for_btn_applet_help
  expect(PobEncountersApplet.new).to have_btn_applet_help, "help icon not present on Encounters Applet"
  PobClinicalRemindersApplet.new.wait_for_btn_applet_help
  expect(PobClinicalRemindersApplet.new).to have_btn_applet_help, "help icon not present on Clincal Reminders Applet"
  PobReportsApplet.new.wait_for_btn_applet_help
  expect(PobReportsApplet.new).to have_btn_applet_help, "help icon not present on Reports Applet"

  verify_common_help_buttons
end

Then(/^the On\-line Help icon is present on Coversheet page$/) do
  PobCommunityHealthApplet.new.wait_for_btn_applet_help
  expect(PobCommunityHealthApplet.new).to have_btn_applet_help, "help icon not present on Health Summary Applet"
  PobAppointmentsApplet.new.wait_for_btn_applet_help
  expect(PobAppointmentsApplet.new).to have_btn_applet_help, "help icon not present on Appointments Applet"
  PobOrdersApplet.new.wait_for_btn_applet_help
  expect(PobOrdersApplet.new).to have_btn_applet_help, "help icon not present on Orders Applet"

  verify_common_help_buttons
end

Then(/^the On-line Help icon is present on Documents page$/) do
  @ehmp = PobDocumentsList.new
  @ehmp.wait_for_btn_applet_help
  expect(@ehmp).to have_btn_applet_help, "help icon not present on Documents Applet"
end

Then(/^the On-line Help icon is present on Timeline page$/) do
  @ehmp = PobTimeline.new
  @ehmp.wait_for_btn_applet_help
  expect(@ehmp).to have_btn_applet_help, "help icon not present on timline Applet"
end

Then(/^the On-line Help icon is present on Meds Review page$/) do
  @ehmp = PobMedsReview.new
  @ehmp.wait_for_btn_applet_help
  expect(@ehmp).to have_btn_applet_help, "help icon not present on MedsReview Applet"
end

Then(/^the On-line Help page is opened by clicking on the On-line Help icon$/) do
  driver = TestSupport.driver

  pagehelp = driver.find_element(:id, "linkHelp-patient_search")
  pagehelp.click

  driver.switch_to.window(driver.window_handles.last) {
    begin
      wait = Selenium::WebDriver::Wait.new(:timeout => 15)
      wait.until {
        expect(driver.find_element(:class, "WordSection3")).to be_true
      }
    rescue Exception => e
      p "Error: #{e}"
    end
  }
end
