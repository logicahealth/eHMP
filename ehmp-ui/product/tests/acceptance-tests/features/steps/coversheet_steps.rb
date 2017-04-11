path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'AccessBrowserV2.rb'

class VerifyTextFormat
  include HTMLVerification
  def initialize(regex)
    @error_message = 'no error message'
    @regex = regex
  end

  def verify(html_element, value)
    text = html_element.text
    @error_message = "Does element text match regex #{@regex}: #{text}"
    
    return !( @regex.match(text)).nil?
  end

  def pull_value(html_element, _value)
    text = html_element.text
  end

  def error_message
    return @error_message
  end
end

class CoverSheet < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("patient identifying traits"), VerifyText.new, AccessHtmlElement.new(:id, "patientDemographic-patientInfo"))
    add_verify(CucumberLabel.new("patient name"), VerifyContainsText.new, AccessHtmlElement.new(:id, "patientDemographic-patientInfo"))
    add_verify(CucumberLabel.new("SSN"), VerifyContainsText.new, AccessHtmlElement.new(:id, "patientDemographic-patientInfo"))
    dob_age_format = Regexp.new("\\d{2}\/\\d{2}\/\\d{4} \\(\\d+\\y\\)")
    add_verify(CucumberLabel.new("DOB"), VerifyTextFormat.new(dob_age_format), AccessHtmlElement.new(:id, "patientDemographic-patientInfo-dob"))
    add_verify(CucumberLabel.new("Gender"), VerifyContainsText.new, AccessHtmlElement.new(:id, "patientDemographic-patientInfo"))
    add_verify(CucumberLabel.new("Provider"), VerifyContainsText.new, AccessHtmlElement.new(:id, "UNKNOWN_ID"))
    add_verify(CucumberLabel.new("Ward"), VerifyContainsText.new, AccessHtmlElement.new(:id, "UNKNOWN_ID"))
    add_verify(CucumberLabel.new("Primary Care Team"), VerifyContainsText.new, AccessHtmlElement.new(:id, "UNKNOWN_ID"))
    add_verify(CucumberLabel.new("Attending Provider"), VerifyContainsText.new, AccessHtmlElement.new(:id, "UNKNOWN_ID"))
    add_verify(CucumberLabel.new("Inpatient Provider|"), VerifyContainsText.new, AccessHtmlElement.new(:id, "UNKNOWN_ID"))

    #coverscreen applet location
    add_verify(CucumberLabel.new("left Title"), VerifyText.new, AccessHtmlElement.new(:css, "#left span.panel-title"))
    add_verify(CucumberLabel.new("right Title"), VerifyText.new, AccessHtmlElement.new(:css, "#right span.panel-title"))
      
    add_verify(CucumberLabel.new("Cover Sheet Pill"), VerifyText.new, AccessHtmlElement.new(:css, "#screenName"))
      
    @@applet_count = AccessHtmlElement.new(:xpath, "//*[@data-appletid]")
    add_verify(CucumberLabel.new("Number of Applets"), VerifyXpathCount.new(@@applet_count), @@applet_count)
  end
end # 

Then(/^the "(.*?)" is displayed with information$/) do |arg1, table|
  browser_access = CoverSheet.instance

  browser_access.wait_until_element_present(arg1)
  expect(browser_access.static_dom_element_exists? arg1).to be_true

  table.rows.each do |field_name, value|
    browser_access.wait_until_element_present(field_name)
    expect(browser_access.perform_verification(field_name, value)).to be_true, "Verification failed on #{field_name}"
  end
end

Then(/^Cover Sheet is active$/) do
  browser_access = CoverSheet.instance  
  navigate_in_ehmp '#cover-sheet'
  # deliberate use of wait time other then the DefaultLogin.wait_time
  # This is for tests that don't use
  # Given(/^user searches for and selects "(.*?)"$/)
  expect(browser_access.wait_until_element_present("Cover Sheet Pill", 60)).to be_true  
  expect(browser_access.perform_verification("Cover Sheet Pill", "Coversheet")).to be_true
  #wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  # increased the timeout as coversheet applets are taking longer to load
  wait = Selenium::WebDriver::Wait.new(:timeout => 90)
  wait.until { CoverSheetApplets.instance.applets_loaded? }
  expect(browser_access.wait_until_xpath_count("Number of Applets", 9)).to be_true
end

class CoverSheetApplets < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("CONDITIONS"), VerifyContainsText.new, applet_panel_title("problems"))
    add_verify(CucumberLabel.new("NUMERIC LAB RESULTS"), VerifyContainsText.new, applet_panel_title("lab_results_grid"))
    add_verify(CucumberLabel.new("VITALS"), VerifyContainsText.new, applet_panel_title("vitals"))
    add_verify(CucumberLabel.new("Active & Recent MEDICATIONS"), VerifyContainsText.new, applet_panel_title("activeMeds"))
    add_verify(CucumberLabel.new("ALLERGIES"), VerifyContainsText.new, applet_panel_title("allergy_grid"))
    add_verify(CucumberLabel.new("IMMUNIZATIONS"), VerifyContainsText.new, applet_panel_title("immunizations"))
    add_verify(CucumberLabel.new("ORDERS"), VerifyContainsText.new, applet_panel_title("orders"))
    add_verify(CucumberLabel.new("APPOINTMENTS"), VerifyContainsText.new, applet_panel_title("appointments"))
    add_verify(CucumberLabel.new("CLINICAL REMINDERS"), VerifyContainsText.new, applet_panel_title("clinical_reminders"))
    add_verify(CucumberLabel.new("COMMUNITY HEALTH SUMMARIES"), VerifyContainsText.new, applet_panel_title("ccd_grid"))

    # count the number of applets on the screen
    @@applet_count = AccessHtmlElement.new(:xpath, "//*[@data-appletid]")
    add_verify(CucumberLabel.new("Number of Applets"), VerifyXpathCount.new(@@applet_count), @@applet_count)

    # count the number of rows in the allergy_grid table
    @@vitals_applet_data_grid_rows = AccessHtmlElement.new(:xpath, ".//*[@id='grid-panel-vitals']/div[3]/div/div[1]/div/table/tbody/tr")
    add_verify(CucumberLabel.new("Number of Vitals Applet Rows"), VerifyXpathCount.new(@@vitals_applet_data_grid_rows), @@vitals_applet_data_grid_rows)
  end
  
  def applet_panel_title(dataapplet_id)
    panel_title_accesser = AccessHtmlElement.new(:css, "div[data-appletid='#{dataapplet_id}'] .panel-title")
    return panel_title_accesser
  end

  def applets_loaded?
    # | Active & Recent MEDICATIONS   |
    # | COMMUNITY HEALTH SUMMARIES|
    allergy_gist_applet = AllergiesGist.instance
    order_applet = OrdersContainer.instance
    conditions = ActiveProblems.instance
    numeric_lab = NumericLabResults.instance
    vitals = VitalsCoversheet.instance
    immunizations = ImmunizationsCoverSheet.instance
    appointments = AppointmentsCoverSheet.instance
    return false unless allergy_gist_applet.applet_loaded?
    return false unless order_applet.applet_loaded
    return false unless conditions.applet_grid_loaded
    return false unless numeric_lab.applet_loaded?
    return false unless vitals.applet_loaded
    return false unless immunizations.applet_loaded?
    return false unless appointments.applet_loaded?
    return true
  end
end

Then(/^the applets are displayed on the coversheet$/) do |table|
  access_cover_sheet_applets = CoverSheetApplets.instance
  table.rows.each do |field_name|
    single_cell = field_name[0]
    access_cover_sheet_applets.wait_until_element_present(single_cell)
    expect(access_cover_sheet_applets.perform_verification(single_cell, single_cell)).to be_true, "Failed looking for #{field_name}"
  end
end

Then(/^the Vitals applet displays data grid rows$/) do 
  access_cover_sheet_applets = CoverSheetApplets.instance
  expect(access_cover_sheet_applets.wait_until_xpath_count_greater_than("Number of Vitals Applet Rows", 2)).to be_true
end

Then(/^the patient DOB is in correct format$/) do
  coversheet = CoverSheet.instance
  expect(coversheet.perform_verification('DOB', '')).to eq(true)
end
