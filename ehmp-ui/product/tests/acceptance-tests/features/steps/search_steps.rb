class PatientSearch < AccessBrowserV2
  include Singleton
  def initialize
    super
    initialize_action
    initialize_verify
  end

  def initialize_action
    add_action(CucumberLabel.new("patient demographic"), ClickAction.new, AccessHtmlElement.new(:css, ".patient-demographic-content"))
    add_action(CucumberLabel.new("patientSearch"), ClickAction.new, AccessHtmlElement.new(:id, "patientSearchButton"))
    add_action(CucumberLabel.new("patient context tab"), ClickAction.new, AccessHtmlElement.new(:id, "current-patient-nav-header-tab"))
    add_action(CucumberLabel.new("active patient context tab"), ClickAction.new, AccessHtmlElement.new(:css, "[id=current-patient-nav-header-tab].active"))
    add_action(CucumberLabel.new("myCPRSList"), ClickAction.new, AccessHtmlElement.new(:id, "myCprsList"))
    add_action(CucumberLabel.new("defaultSearchInput"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "patientFilterInput"))
    add_action(CucumberLabel.new("patientSearchInput"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "patientSearchInput"))
    add_action(CucumberLabel.new("mySite"), ClickAction.new, AccessHtmlElement.new(:css, "#mySite"))

    add_action(CucumberLabel.new("mySiteSearch"), ClickAction.new, AccessHtmlElement.new(:css, "div#patient-search-input"))
    add_action(CucumberLabel.new("global"), ClickAction.new, AccessHtmlElement.new(:id, "global"))
    add_action(CucumberLabel.new("mySiteClinics"), ClickAction.new, AccessHtmlElement.new(:id, "clinics"))
    add_action(CucumberLabel.new("mySiteWards"), ClickAction.new, AccessHtmlElement.new(:id, "wards"))

    add_action(CucumberLabel.new("center"), ClickAction.new, AccessHtmlElement.new(:id, "patient-search-main"))
    add_action(CucumberLabel.new("Search Tab"), ClickAction.new,  AccessHtmlElement.new(:class, "patientDisplayName"))
    add_action(CucumberLabel.new("Confirm"), ClickAction.new, AccessHtmlElement.new(:id, "confirmationButton"))

    add_action(CucumberLabel.new("globalSearchLastName"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "globalSearchLastName"))
    add_action(CucumberLabel.new("globalSearchFirstName"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "globalSearchFirstName"))
    add_action(CucumberLabel.new("globalSearchDob"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "globalSearchDob"))
    add_action(CucumberLabel.new("globalSearchSsn"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "globalSearchSsn"))
    add_action(CucumberLabel.new("globalSearch"), ClickAction.new, AccessHtmlElement.new(:id, "globalSearchButton"))
 
    add_action(CucumberLabel.new("Patient Result"), ClickAction.new,  AccessHtmlElement.new(:css, "#patient-search-main patient-search-results .list-group-item"))
    add_action(CucumberLabel.new("ackButton"), ClickAction.new, AccessHtmlElement.new(:id, "ackButton"))

    add_action(CucumberLabel.new("clinics"), ClickAction.new, AccessHtmlElement.new(:id, "clinics"))
    add_action(CucumberLabel.new("patientSearchKeyword"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "#patient-search-main .smallColumn input.form-control")) #this doesn't exist anymore
    add_action(CucumberLabel.new("wardKeyword"), SendKeysAction.new, AccessHtmlElement.new(:css, "#wardFilter"))
    add_action(CucumberLabel.new("locationDisplayName"), ClickAction.new, AccessHtmlElement.new(:css, ".locationDisplayName"))
    add_action(CucumberLabel.new("patientFilterInput"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "patientFilterInput")) #this soesn't exist anymore
    add_action(CucumberLabel.new("Ward"), ClickAction.new, AccessHtmlElement.new(:id, "wards"))
  end

  def initialize_verify
    add_verify(CucumberLabel.new("panel-heading"), VerifyContainsText.new, AccessHtmlElement.new(:class, "panel-title"))
    @@patient_search_count = AccessHtmlElement.new(:xpath, "//*[@class='patient-search-results']/descendant::div[contains(@class, 'list-group-item')]")
    add_verify(CucumberLabel.new("Patient Search Results"), VerifyXpathCount.new(@@patient_search_count), @@patient_search_count)
    @@global_search_count = AccessHtmlElement.new(:xpath, "//*[@id='globalSearchResults']/descendant::a")
    add_verify(CucumberLabel.new("Global Search Results"), VerifyXpathCount.new(@@global_search_count), @@global_search_count)

    add_verify(CucumberLabel.new("acknowledgement message"), VerifyContainsText.new, AccessHtmlElement.new(:id, "ackMessagePanel"))

    add_verify(CucumberLabel.new("Error Message"), VerifyContainsText.new, AccessHtmlElement.new(:id, "error-message"))
    add_verify(CucumberLabel.new("Error Message patient"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".patient-search-results div.list-group"))
    add_verify(CucumberLabel.new("Global Error Message"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#globalSearchResults div.list-group"))

    @@applet_count = AccessHtmlElement.new(:xpath, "//*[@data-appletid]")
    add_verify(CucumberLabel.new("Number of Applets"), VerifyXpathCount.new(@@applet_count), @@applet_count)
    # add_verify(CucumberLabel.new("error message padding"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#patient-search-main .list-group > div"))
    add_verify(CucumberLabel.new("error message padding"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//div[@id='wards-location-list-results']/descendant::div[contains(@class, 'list-group')]/descendant::p[contains(@class, 'error-message padding')]"))
    add_verify(CucumberLabel.new("unAuthorized"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".unAuthorized"))

    location_list_result_count = AccessHtmlElement.new(:css, "#patient-search-main .list-result-container a")
    add_verify(CucumberLabel.new("Number of Location List Results"), VerifyXpathCount.new(location_list_result_count), location_list_result_count)
    #CONFIRM SECTION
    add_verify(CucumberLabel.new("patient identifying name"), VerifyText.new, AccessHtmlElement.new(:css, "#confirmSection div.patientName"))
    add_verify(CucumberLabel.new("no patient error message"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//div[@id='confirmSection']/p"))

    confirm_section = AccessHtmlElement.new(:css, "#confirmSection div.patientInfo")
    add_verify(CucumberLabel.new("patient identifying traits"), VerifyText.new, confirm_section)
    add_verify(CucumberLabel.new("dob"), VerifyContainsText.new, confirm_section)
    age_format = Regexp.new("\\d+\\y")
    ssn_format = Regexp.new("[\\d, *]{3}-[\\d, *]{2}-\\d{4}")
    add_verify(CucumberLabel.new("age"), VerifyTextFormat.new(age_format), AccessHtmlElement.new(:id, 'confirm_age'))
    add_verify(CucumberLabel.new("gender"), VerifyContainsText.new, confirm_section)
    add_verify(CucumberLabel.new("ssn"), VerifyTextFormat.new(ssn_format), AccessHtmlElement.new(:id, 'confirm_ssn'))
    add_verify(CucumberLabel.new("alert"), VerifyContainsText.new, confirm_section)
  end

  def patient_search_count
    return @@patient_search_count
  end

  def select_patient_in_list(index)
    driver = TestSupport.driver

    how = patient_search_count.how
    location = patient_search_count.locator
    patientlist = driver.find_elements(how, location)
    patientlist[index.to_i].click
    TestSupport.wait_for_page_loaded
  end

  def select_default_patient_name_in_list(name)
    full_xpath = "//div[@id='my-cprs-search-results']/descendant::div[contains(@class, 'list-group-item-text')]/descendant::div[contains(string(), '#{name}')]"
    p full_xpath
    add_action(CucumberLabel.new("My Patient Name"), ClickAction.new, AccessHtmlElement.new(:xpath, full_xpath))

    # deliberate use of wait time other then the DefaultLogin.wait_time
    return false unless wait_until_element_present("My Patient Name", 60)
    return perform_action("My Patient Name")
  end

  def select_global_patient_name_in_list(name)
    full_xpath = "//div[@id='globalSearchResults']/descendant::div[contains(@class, 'list-group-item-text')]/descendant::div[contains(string(), '#{name}')]"
    p full_xpath
    add_action(CucumberLabel.new("My Patient Name"), ClickAction.new, AccessHtmlElement.new(:xpath, full_xpath))

    # deliberate use of wait time other then the DefaultLogin.wait_time
    return false unless wait_until_element_present("My Patient Name", 60)
    return perform_action("My Patient Name")
  end

  def select_patient_name_in_list(name)
    aa = 'ancestor::a'
    #full_xpath = "//div[@class='patient-search-results']/descendant::div[contains(@class, 'list-group-item-text')]/descendant::div[contains(string(), '#{name}')]/#{aa}"
    full_xpath = "//*[@class='patient-search-results']/descendant::div[contains(@class, 'patientDisplayName') and contains(string(), '#{name}')]"
    p full_xpath
    add_action(CucumberLabel.new("My Patient Name"), ClickAction.new, AccessHtmlElement.new(:xpath, full_xpath))

    # deliberate use of wait time other then the DefaultLogin.wait_time
    return false unless wait_until_element_present("My Patient Name", 60)
    return perform_action("My Patient Name")
  end
end

class PatientSearch2 < PatientSearch
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Confirm Flag"), ClickAction.new, AccessHtmlElement.new(:id, "confirmFlaggedPatinetButton"))
    add_action(CucumberLabel.new("Active MyCPRSList"), ClickAction.new, AccessHtmlElement.new(:css, "#myCprsList.active"))
    #add_action(CucumberLabel.new('searchClose'), ClickAction.new, AccessHtmlElement.new(:id, 'searchCloseBtn'))
    add_action(CucumberLabel.new('Patient Search Overview Navigation'), ClickAction.new, AccessHtmlElement.new(:id, 'current-patient-nav-header-tab'))
    add_verify(CucumberLabel.new('Patient Image'), VerifyText.new, AccessHtmlElement.new(:id, 'patient-image-container'))
  end
end

Then(/^the user select patient name "(.*?)"$/) do  |search_value|
  step 'the My Site Tray displays'
  step 'the My Site Tray contains search results'
  my_site_tray = PobStaffView.new

  name_only = []
  index_of = -1
  my_site_tray.patient_name_visible_text.each_with_index do | name_ssn, index |
    result_name = Regexp.new("\\w+, \\w+-*\\w*").match(name_ssn).to_s

    updated_result_name = result_name.upcase.gsub(' ', '')
    updated_search_value = search_value.upcase.gsub(' ', '')
    index_of = index if updated_result_name.start_with?(updated_search_value)
    break if index_of > -1
  end
  expect(index_of).to_not eq(-1), "Patient #{search_value} was not found in result list"
  expect(index_of).to be < my_site_tray.my_site_search_results_name.length
  my_site_tray.my_site_search_results_name[index_of].click
end

Then(/^the all patient "(.*?)" is displayed on confirm section header$/) do |arg1, table|
  con = PatientSearch.instance
  con.wait_until_element_present(arg1)
  expect(con.static_dom_element_exists? arg1).to be_true
  table.rows.each do |field_name, value|
    con.wait_until_element_present(field_name)
    expect(con.perform_verification(field_name, value)).to be_true, "Verification failed on #{field_name}"
  end
end

Then(/^the all patient "(.*?)" is displayed on confirm section$/) do |arg1, table|
  con = PatientSearch.instance
  con.wait_until_element_present(arg1)
  expect(con.static_dom_element_exists? arg1).to be_true

  table.rows.each do |field_name, value|
    con.wait_until_element_present(field_name)
    expect(con.perform_verification(field_name, value)).to be_true, "Verification failed on #{field_name}"
  end
end

Then(/^the all patient "(.*?)" is displayed on acknowledgement confirm section$/) do |arg1, table|
  con = PatientSearch.instance
  con.wait_until_element_present(arg1)
  expect(con.static_dom_element_exists? arg1).to be_true
  
  table.rows.each do |field_name, value|
    con.wait_until_element_present(field_name)
    expect(con.perform_verification(field_name, value)).to be_true, "Verification failed on #{field_name}"
  end
end

Then(/^the user click on Confirm Selection$/) do
  patient_search = PobPatientSearch.new
  expect(patient_search.wait_for_btn_confirmation).to eq(true)
  patient_search.btn_confirmation.click

  begin
    patient_search.wait_until_btn_confirmation_invisible(30)
  rescue Exception => e
    p "Error waiting for invisibility: #{e}"
  end
  expect(patient_search).to_not have_btn_confirmation
end

Then(/^the user looks for "(.*?)"$/) do  |name|
  con= PatientSearch.instance
  TestSupport.wait_for_page_loaded
  expect(con.static_dom_element_exists? name).to be_true
end

Given(/^user attempt to click on Patient search$/) do
  con= PatientSearch.instance
  if con.static_dom_element_exists?("patientSearch")
    TestSupport.wait_for_page_loaded
    con.perform_action('patientSearch')
  else
    login_screen = Login.instance
  end
end

Given(/^the confirmation box displays info for "(.*?)"$/) do |patient, table|
  error_messages=[]
  patient_details = TransPatientBarHTMLElements.instance
  ps = PatientSearch.instance
  #  TestSupport.wait_for_jquery_completed
  header_xpath = patient_details.build_header_xpath(patient)
  p header_xpath
  expect(ps.wait_until_action_element_visible("patient identifying name", DefaultLogin.wait_time)).to be_true
  element_found = (patient_details.dynamic_dom_element_exists?("xpath", header_xpath))
  expect(element_found).to eq(true)
  table.rows.each do | label, value |
    expect(patient_details.perform_verification(label, value)).to eq(true)
  end
end

# this feature does not work the same anymore

Given(/^user enters patient "(.*?)" in the patient filter$/) do |patient|
  patient_search = PatientSearch.instance
  wait_until_present_and_perform_action(patient_search, "patientFilterInput", patient)
end

Then(/^the user verifies patient "(.*?)"$/) do  |error|
  con = PatientSearch.instance
  expect(con.perform_verification("Error Message patient", error)).to be_true
end

def wait_until_present_and_perform_action(access_browser_instance, cucumber_label, action_extra = nil)
  #expect(access_browser_instance.wait_until_element_present(cucumber_label)).to be_true, "#{cucumber_label} did not display"
  expect(access_browser_instance.perform_action(cucumber_label, action_extra)).to be_true, "Error performing action on #{cucumber_label}"
end

Then(/^the user click on acknowledge restricted record$/) do
  patient_search = PobPatientSearch.new
  expect(patient_search.wait_for_btn_ack).to eq(true)
  patient_search.btn_ack.click

  begin
    patient_search.wait_until_btn_ack_invisible(30)
  rescue Exception => e
    p "Error waiting for invisibility: #{e}"
  end
  expect(patient_search).to_not have_btn_ack
end

def verify_table_headers_parient(access_browser_instance, table)
  driver = TestSupport.driver
  headers = driver.find_elements(:css, '.patient-search-results .columnHeader .columnName')
  expect(headers.length).to_not eq(0)
  expect(headers.length).to eq(table.rows.length)
  elements = access_browser_instance
  table.rows.each do |header_text|
    does_exist = elements.dynamic_dom_element_exists?("xpath", "//div[@class='columnHeader']/descendant::div[contains(string(), '#{header_text[0]}')]")
    p "#{header_text[0]} was not found" unless does_exist
    expect(does_exist).to be_true
  end #table
end #verify_table_headers

class ColumnHeader < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("columnName"), VerifyText.new, AccessHtmlElement.new(:css, ".columnName.no-padding-right.col-md-2"))
  end
end 

When(/^the user clears though the Confirm Flag$/) do
  patient_search = PatientSearch2.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { patient_search.static_dom_element_exists?("Confirm Flag") == true }
  expect(patient_search.perform_action("Confirm Flag")).to be_true

  wait.until { patient_search.static_dom_element_exists?("patient demographic") == true }
end

Then(/^the user confirms nationwide search patient selection$/) do
  patient_search= PatientSearch.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  expect(patient_search.wait_until_action_element_visible("Confirm", DefaultLogin.wait_time)).to be_true
  expect(patient_search.perform_action("Confirm")).to be_true
  wait.until { patient_search.static_dom_element_exists?("patient demographic") == true }
end

Then(/^the user confirms patient "(.*?)"$/) do |arg1|
  patient_search = PatientSearch2.instance
  
  patient_search.wait_until_element_present("Confirm", DefaultLogin.wait_time)
  expect(patient_search.static_dom_element_exists? "Confirm").to be_true
  results = TestSupport.driver.find_element(:css, "#patient-search-confirmation div.patientName")
  @ehmp = PobPatientSearch.new
  begin
    @ehmp.wait_until_img_patient_visible
    p "patient image was visible"
  rescue
    p "DE3576: img doesn't appear, try to continue anyway"
  end
  expect(patient_search.perform_action("Confirm")).to be_true
  expect(wait_until_dom_has_confirmflag_or_patientsearch).to be_true, "Patient selection did not complete successfully"
end

Then(/^a patient image is displayed$/) do
  patient_search = PatientSearch2.instance
  expect(patient_search.wait_until_element_present('Patient Image')).to eq(true)
end

Then(/^the patient ssn is masked$/) do
  search_screen = PatientSearch.instance
  expect(search_screen.wait_until_element_present('ssn')).to eq(true), "SSN element was not displayed"
  ssn_element = search_screen.get_element('ssn')
  ssn_text = ssn_element.text
  masked_format = Regexp.new("[*]{3}-[*]{2}-\\d{4}")
  expect(masked_format.match(ssn_text)).to_not be_nil, "Expected ssn (#{ssn_text}) to be in format #{masked_format}"
end

Then(/^the patient ssn is unmasked$/) do
  search_screen = PatientSearch.instance
  expect(search_screen.wait_until_element_present('ssn')).to eq(true), "SSN element was not displayed"
  ssn_element = search_screen.get_element('ssn')
  ssn_text = ssn_element.text
  unmasked_format = Regexp.new("\\d{3}-\\d{2}-\\d{4}")
  expect(unmasked_format.match(ssn_text)).to_not be_nil, "Expected ssn (#{ssn_text}) to be in format #{unmasked_format}"
end
