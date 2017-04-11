class VerifyActiveRange
  include HTMLVerification
  def initialize
    @error_message = 'no error message'
  end

  def verify(html_element, expect_active)
    has_focus = html_element.attribute('class').include?('active-range')
    p "#{has_focus} vs #{expect_active}"
    return has_focus == expect_active
  end

  def pull_value(html_element, _value)
    text = html_element.attribute('class')
  end
end

class ClinicSearch < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new('Clinic Placeholder'), VerifyPlaceholder.new, AccessHtmlElement.new(:css, '#clinicFilter'))
    add_action(CucumberLabel.new('Clinic Filter'), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, '#clinicFilter'))

    clinics_list = AccessHtmlElement.new(:css, '#clinics-location-list-results .list-group .locationDisplayName')
    add_verify(CucumberLabel.new('Clinic list'), VerifyXpathCount.new(clinics_list), clinics_list)
    clinic_search_results = AccessHtmlElement.new(:css, '.patient-search-results .list-group > div')
    add_verify(CucumberLabel.new('Clinic Search List'), VerifyXpathCount.new(clinic_search_results), clinic_search_results)

    add_action(CucumberLabel.new('Today'), ClickAction.new, AccessHtmlElement.new(:id, 'today-clinicDate'))
    add_verify(CucumberLabel.new('Today Active'), VerifyActiveRange.new, AccessHtmlElement.new(:id, 'today-clinicDate'))
    add_action(CucumberLabel.new('Tomorrow'), ClickAction.new, AccessHtmlElement.new(:id, 'tomorrow-clinicDate'))
    add_verify(CucumberLabel.new('Tomorrow Active'), VerifyActiveRange.new, AccessHtmlElement.new(:id, 'tomorrow-clinicDate'))

    add_action(CucumberLabel.new('From Date'), SendKeysAction.new, AccessHtmlElement.new(:id, 'filter-from-date-clinic'))
    add_action(CucumberLabel.new('Control - ClinicSearch - From Date'), SendKeysAction.new, AccessHtmlElement.new(:id, 'filter-from-date-clinic'))
    add_action(CucumberLabel.new('To Date'), SendKeysAction.new, AccessHtmlElement.new(:id, 'filter-to-date-clinic'))
    add_action(CucumberLabel.new('Control - ClinicSearch - To Date'), SendKeysAction.new, AccessHtmlElement.new(:id, 'filter-to-date-clinic'))
    
    add_verify(CucumberLabel.new('From Date value'), VerifyValue.new, AccessHtmlElement.new(:id, 'filter-from-date-clinic'))
    add_verify(CucumberLabel.new('To Date value'), VerifyValue.new, AccessHtmlElement.new(:id, 'filter-to-date-clinic'))

    add_action(CucumberLabel.new('Apply'), ClickAction.new, AccessHtmlElement.new(:id, 'custom-range-apply'))
    add_verify(CucumberLabel.new('No Results'), VerifyContainsText.new, AccessHtmlElement.new(:css, '.patient-search-results .error-message'))

    add_action(CucumberLabel.new('Last 30d'), ClickAction.new, AccessHtmlElement.new(:id, 'past-30days-clinicDate'))
    add_action(CucumberLabel.new('Last 7d'), ClickAction.new, AccessHtmlElement.new(:id, 'past-week-clinicDate'))
    add_action(CucumberLabel.new('Yesterday'), ClickAction.new, AccessHtmlElement.new(:id, 'yesterday-clinicDate'))
    add_action(CucumberLabel.new('Next 7d'), ClickAction.new, AccessHtmlElement.new(:id, 'next-week-clinicDate'))

    add_verify(CucumberLabel.new('Last 30d Active'), VerifyActiveRange.new, AccessHtmlElement.new(:id, 'past-30days-clinicDate'))
    add_verify(CucumberLabel.new('Last 7d Active'), VerifyActiveRange.new, AccessHtmlElement.new(:id, 'past-week-clinicDate'))
    add_verify(CucumberLabel.new('Yesterday Active'), VerifyActiveRange.new, AccessHtmlElement.new(:id, 'yesterday-clinicDate'))
    add_verify(CucumberLabel.new('Next 7d Active'), VerifyActiveRange.new, AccessHtmlElement.new(:id, 'next-week-clinicDate'))
  end

  def appt_date_time_correct_format
    appointments = TestSupport.driver.find_elements(:css, "div.user_info-ps-td-datetime")
    return false unless appointments.length > 0
    appointments.each do | appt |
      p appt.text
      regex = Regexp.new("\\d{2}\/\\d{2}\/\\d{4} \\d{2}:\\d{2}")

      p appt.text.split('\n')
    end
    true
  rescue
    false
  end
end

Before do
  @clinic_search = ClinicSearch.instance
end

When(/^the user clicks the Clinics pill$/) do
  expect(MyCprsListTab.instance.perform_action('clinics_link')).to eq(true)
  expect(MyCprsListTab.instance.perform_verification('clinics_tab', true)).to eq(true)
end

Then(/^the Clinics search input displays "([^"]*)"$/) do |arg1|
  expect(@clinic_search.perform_verification('Clinic Placeholder', arg1)).to eq(true)
end

Then(/^a list of Clinics is displayed$/) do
  expect(@clinic_search.wait_until_xpath_count_greater_than('Clinic list', 0)).to eq(true)
end

When(/^the user filters the Clinics by text "([^"]*)"$/) do |arg1|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  row_count = @clinic_search.get_elements("Clinic list").size
  expect(@clinic_search.perform_action('Clinic Filter', arg1)).to eq(true)
  wait.until { row_count != @clinic_search.get_elements("Clinic list").size }
end

Then(/^the Clinics table only diplays rows including text "([^"]*)"$/) do |input_text|
  upper = input_text.upcase
  lower = input_text.downcase

  path =  "//*[@id='clinics-location-list-results']/div/a/div/p/span[1][contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]"

  row_count = @clinic_search.get_elements("Clinic list").size
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

Then(/^the Today button is selected$/) do
  expect(@clinic_search.perform_verification('Today Active', true)).to eq(true)
end

When(/^the user enters Clinic start date "([^"]*)"$/) do |arg1|
  @ehmp = PobPatientSearch.new
  @ehmp.wait_until_fld_clinic_start_date_visible
  size = @ehmp.fld_clinic_start_date.value.length
  for i in 0...size
    # input_element.send_keys(:backspace)
    @ehmp.fld_clinic_start_date.native.send_keys(:backspace)
  end
  @ehmp.fld_clinic_start_date.native.send_keys arg1
end

When(/^the user enters Clinic end date "([^"]*)"$/) do |arg1|
  @ehmp = PobPatientSearch.new
  @ehmp.wait_until_fld_clinic_to_date_visible
  size = @ehmp.fld_clinic_to_date.value.length
  for i in 0...size
    @ehmp.fld_clinic_to_date.native.send_keys(:backspace)
  end
  @ehmp.fld_clinic_to_date.native.send_keys arg1
end

When(/^the user applies date filter$/) do
  expect(@clinic_search.perform_action('Apply')).to eq(true)
end

Then(/^none of the Predefined date filters are selected$/) do
  elements = TestSupport.driver.find_elements(:css, '.grid-filter-daterange button.active-range')
  expect(elements.length).to eq(0)
end

When(/^the user selects Clinic "([^"]*)"$/) do |arg1|
  @ehmp = PobPatientSearch.new
  max_attempt = 4
  begin  
    @ehmp.wait_until_fld_clinics_list_items_visible
    click_an_object_from_list(@ehmp.fld_clinics_list_items, arg1) 
  rescue Exception => e
    p "*** entered rescue block ***"
    sleep(1)
    max_attempt-=1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
end

Then(/^the order of the Clinic headers is$/) do |expected_table|
  elements = TestSupport.driver.find_elements(:css, '.patient-search-results .columnHeader .columnName')
  expected_headers = expected_table.headers
  for i in 0...expected_headers.size do
    verify_elements_equal(expected_headers[i], elements[i].text)
  end
end

Then(/^the clinic results displays appointments in correct format$/) do
  regex = Regexp.new("\\d{2}\/\\d{2}\/\\d{4} \\d{2}:\\d{2}")
  elements = TestSupport.driver.find_elements(:css, 'div.user_info-ps-td-datetime')
  elements.each do | element |
    text = element.text
    expect(( regex.match(text)).nil?).to eq(false)
  end
end

Then(/^the clinic results displays appointments between "([^"]*)" and "([^"]*)"$/) do |arg1, arg2|
  date_format_template = "%m/%d/%Y %H:%M"

  expected_from_date = Date.strptime(arg1, date_format_template)
  expected_to_date = Date.strptime(arg2, date_format_template)
  p expected_from_date
  p expected_to_date
  regex = Regexp.new("\\d{2}\/\\d{2}\/\\d{4} \\d{2}:\\d{2}")
  @ehmp = PobPatientSearch.new
  @ehmp.wait_until_fld_clinic_datetime_visible(30)
  elements = @ehmp.fld_clinic_datetime
  # elements = TestSupport.driver.find_elements(:css, 'div.user_info-ps-td-datetime')  
  p "length: #{elements.length}"
  elements.each do | element |
    text = element.text
    appointment_date =  Date.strptime(regex.match(text)[0], date_format_template)
    expect(expected_from_date).to be < appointment_date
    expect(expected_to_date).to be > appointment_date
  end
end

Then(/^the clinic results displays appointments for clinic "([^"]*)"$/) do |arg1|
  elements = TestSupport.driver.find_elements(:css, '.patient-search-results .list-group a div:nth-child(2)')
  elements.each do | element |
    expect(element.text.upcase).to include(arg1.upcase)
  end
end

When(/^the user clicks Today$/) do
  expect(@clinic_search.perform_action('Today')).to eq(true)
end

Then(/^the clinic results displays No results found\.$/) do
  expect(@clinic_search.perform_verification("No Results", 'No results were found.')).to eq(true)
end

When(/^a list of clinic results is displayed$/) do
  @ehmp = PobPatientSearch.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  @ehmp.wait_for_fld_clinic_list_group
  wait.until { @ehmp.fld_clinic_list_group.length > 0 }
end

Then(/^the Clinic patient name "([^"]*)" is displayed$/) do |arg1|
  @clinic_patient_name = arg1
  xpath = "//div[contains(string(), '#{arg1}')]/ancestor::div[contains(@class, 'list-group-item-text')]"

  name_xpath = "#{xpath}//descendant::div[contains(@class, 'patientDisplayName')]"
  @clinic_search.add_verify(CucumberLabel.new('Sensitive Patient Name'), VerifyContainsText.new, AccessHtmlElement.new(:xpath, name_xpath))
  ssn_xpath = "#{xpath}/descendant::div[contains(@class, 'ssn')]"
  @clinic_search.add_verify(CucumberLabel.new('Sensitive Patient SSN'), VerifyContainsText.new, AccessHtmlElement.new(:xpath, ssn_xpath))
  dob_xpath = "#{xpath}/descendant::div[contains(@class, 'dob')]"
  @clinic_search.add_verify(CucumberLabel.new('Sensitive Patient DOB'), VerifyContainsText.new, AccessHtmlElement.new(:xpath, dob_xpath))
  expect(@clinic_search.perform_verification('Sensitive Patient Name', arg1)).to eq(true)
end

Then(/^the Clinic patient ssn is "([^"]*)"$/) do |arg1|
  # expect(@clinic_search.perform_verification('Sensitive Patient SSN', arg1)).to eq(true)
  @ehmp = PobPatientSearch.new
  expect(@ehmp.fld_sensitive_patient_ssn).to have_text(arg1)
end

Then(/^the Clinic patient DOB is "([^"]*)"$/) do |arg1|
  # expect(@clinic_search.perform_verification('Sensitive Patient DOB', arg1)).to eq(true)
  @ehmp = PobPatientSearch.new
  expect(@ehmp.fld_sensitive_patient_dob).to have_text(arg1)
end

Then(/^the Apply button is enabled$/) do
  element = TestSupport.driver.find_element(:id, 'custom-range-apply')
  expect(element.enabled?).to eq(true)
end

When(/^the user clicks Tomorrow$/) do
  expect(@clinic_search.perform_action('Tomorrow')).to eq(true)
end

Then(/^the Clinic start date is ''$/) do
  expect(@clinic_search.perform_verification('From Date value', '')).to eq(true)
end

Then(/^the Clinic end date is ''$/) do
  expect(@clinic_search.perform_verification('To Date value', '')).to eq(true)
end

Then(/^the Preset Date Range buttons are$/) do |table|
  table.rows.each do |row|
    @clinic_search.wait_until_action_element_visible(row[0])
    expect(@clinic_search.am_i_visible?(row[0])).to eq(true), "#{row[0]} was not visible"
  end
end

When(/^user selects Preset Date Range 'Yesterday'$/) do
  expect(@clinic_search.perform_action('Yesterday')).to eq(true)
end

Then(/^the following Preset Date Range buttons are not selected$/) do |table|
  table.rows.each do |row|
    expect(@clinic_search.perform_verification("#{row[0]} Active", false)).to eq(true), "#{row[0]}"
  end
end

Then(/^the Clinic start date is set to Today's date$/) do
  patient_search_page = PobPatientSearch.new
  patient_search_page.wait_for_fld_clinic_start_date
  expect(patient_search_page).to have_fld_clinic_start_date
  expect(patient_search_page.fld_clinic_start_date.value).to eq(Date.today.strftime("%m/%d/%Y"))
end

Then(/^the Clinic end date is set to Tomorrow's date$/) do
  patient_search_page = PobPatientSearch.new
  patient_search_page.wait_for_fld_clinic_to_date
  expect(patient_search_page).to have_fld_clinic_to_date
  
  expect(patient_search_page.fld_clinic_to_date.value).to eq(Date.today.next_day(1).strftime("%m/%d/%Y"))
end
