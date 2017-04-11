#Team Neptune
#F144_VitalsApplet.feature

class VitalsExpandedHeader < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Date Observed"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid='vitals-observed']"))
    add_verify(CucumberLabel.new("Type"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid='vitals-typeName']"))
    add_verify(CucumberLabel.new("Result"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid='vitals-resultUnitsMetricResultUnits']"))
    add_verify(CucumberLabel.new("Qualifiers"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid='vitals-qualifiers']"))
    add_verify(CucumberLabel.new("Date Entered"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid='vitals-resulted']"))
    add_verify(CucumberLabel.new("Facility"), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid='vitals-facilityMoniker']"))
  end
end #VitalsExpandedHeader

class Vitals < AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super
    @appletid = 'vitals'
    appletid_css = "[data-appletid=#{@appletid}]"
    add_verify(CucumberLabel.new('Empty Vital Row'), VerifyText.new, AccessHtmlElement.new(:css, '#data-grid-vitals tr.empty'))
    add_action(CucumberLabel.new('Search Filter'), ClickAction.new, AccessHtmlElement.new(:id, 'grid-filter-button-vitals'))
    # Vital Rows
    rows = AccessHtmlElement.new(:css, '#data-grid-vitals tbody tr.selectable')
    add_verify(CucumberLabel.new('Vital Rows'), VerifyXpathCount.new(rows), rows)
    # First Vital Row
    add_action(CucumberLabel.new('First Vital Row'), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='data-grid-vitals']/descendant::td[contains(string(),'BMI')]"))
    add_action(CucumberLabel.new('Applet Toolbar Detail'), ClickAction.new, AccessHtmlElement.new(:css, '#info-button-template #info-button-sidekick-detailView'))

    add_verify(CucumberLabel.new("Vital"), VerifyText.new, AccessHtmlElement.new(:id, "vitalsModalDisplayName"))
    add_verify(CucumberLabel.new("Result"), VerifyText.new, AccessHtmlElement.new(:id, "vitalsModalResult"))
    add_verify(CucumberLabel.new("Date Observed"), VerifyText.new, AccessHtmlElement.new(:id, "vitalsModalObservedFormatted"))
    add_verify(CucumberLabel.new("Facility"), VerifyText.new, AccessHtmlElement.new(:id, "vitalsModalFacility"))
    add_verify(CucumberLabel.new("Type"), VerifyText.new, AccessHtmlElement.new(:id, "vitalsModalType"))
    add_verify(CucumberLabel.new("Date Entered"), VerifyText.new, AccessHtmlElement.new(:id, "vitalsModalDateEntered"))

    add_applet_buttons appletid_css
    add_applet_title appletid_css
    add_applet_add_button appletid_css
  end

  def applet_loaded?
    return true if am_i_visible? 'Empty Vital Row'
    return TestSupport.driver.find_elements(:css, '#data-grid-vitals tr.selectable').length > 0
  rescue => e
    p e
    false
  end

  def clear_filter
    css_filter = '#grid-filter-button-vitals span.applet-filter-title'
    driver = TestSupport.driver
    element = driver.find_element(:css, css_filter)
    p "Class: #{element.attribute('class')}"
    unless element.attribute('class').include? 'hidden'
      p "need to clear the filter"
      add_action(CucumberLabel.new('Remove All'), ClickAction.new, AccessHtmlElement.new(:css, '#content-region .remove-all'))
      html_action_element = 'Search Filter'

      # Open Filter
      wait_until_action_element_visible(html_action_element, 40)
      perform_action(html_action_element) unless am_i_visible? 'Remove All'

      # Wait until the filter terms are displayed
      wait_until_action_element_visible('Remove All', 40)
      perform_action('Remove All')
    end
  end
end

Then(/^the Vitals expanded headers are$/) do |table|
  driver = TestSupport.driver
  elements = VitalsExpandedHeader.instance
  expect(elements.wait_until_action_element_visible("Date Observed", DefaultLogin.wait_time)).to be_true
  headers = driver.find_elements(:css, "#data-grid-vitals th") 
  expect(headers.length).to_not eq(0)
  expect(headers.length).to eq(table.rows.length)
  table.rows.each do |header_text|
    does_exist = elements.static_dom_element_exists? header_text[0]
    p "#{header_text[0]} was not found" unless does_exist
    expect(does_exist).to be_true
  end #table
end #Vitals Headers

#Validate the Problems rows in the coversheet view
Then(/^the Vitals table contains the rows$/) do |table|
  driver = TestSupport.driver
  num_of_rows = driver.find_elements(:css, "#data-grid-vitals tbody tr")
  #Loop through rows in cucumber   
  table.rows.each do |row_defined_in_cucumber|
    matched = false
    #Loop through UI rows
    for i in 1..num_of_rows.length
      row_data = driver.find_elements(:css, "#data-grid-vitals tbody tr:nth-child(#{i}) td")     
      if row_defined_in_cucumber.length != row_data.length
        matched = false
        p "The number of columns in the UI is #{row_data.length} but in cucumber it's #{row_defined_in_cucumber.length}"
      else 
        matched = avoid_block_nesting(row_defined_in_cucumber, row_data)            
      end         
      if matched
        break 
      end
    end # for loop  
    p "could not match data: #{row_defined_in_cucumber}" unless matched  
    driver.save_screenshot("incorrect_rows.png") unless matched
    expect(matched).to be_true
  end #do loop  
end #Problems Pills

Then(/^the user filters the Vitals Applet by text "([^"]*)"$/) do |input_text|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { infiniate_scroll('#data-grid-vitals tbody') }
  row_count = TableContainer.instance.get_elements("Rows - Vitals Applet").size
  p "row_count: #{row_count}"
  #expect(@active_problems.perform_action('Control - applet - Text Filter', input_text)).to eq(true)
  html_element = 'Vitals Filter Field'
  navigation = Navigation.instance
  navigation.wait_until_action_element_visible(html_element, DefaultLogin.wait_time)
  expect(navigation.perform_action(html_element, input_text)).to be_true, "Error when attempting to enter '#{input_text}' into #{html_element}"
  
  wait.until { row_count != TableContainer.instance.get_elements("Rows - Vitals Applet").size }
end

Then(/^the vitals table only diplays rows including text "([^"]*)"$/) do |input_text|
  upper = input_text.upcase
  lower = input_text.downcase

  path =  "//table[@id='data-grid-vitals']/descendant::td[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::tr"

  row_count = TableContainer.instance.get_elements("Rows - Vitals Applet").size 
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

When(/^the user clicks the all\-range\-vitals$/) do
  html_action_element = 'all-range-vitals'
  driver = TestSupport.driver
  navigation = Navigation.instance
  vitals_applet = Vitals.instance
  navigation.wait_until_action_element_visible(html_action_element, 40)
  expect(navigation.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { vitals_applet.applet_loaded? }
end

When(/^the user views all the vitals rows$/) do
  vitals_applet = Vitals.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { vitals_applet.applet_loaded? && infiniate_scroll('#data-grid-vitals tbody') }
end

When(/^the user expands the vitals applet$/) do
  
  aa = Vitals.instance
  expected_screen = 'Vitals'
  expect(aa.perform_action('Control - Applet - Expand View')).to be_true
  expect(aa.perform_verification('Screenname', "#{expected_screen}")).to eq(true), "Expected screenname to be #{expected_screen}"
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until {  aa.applet_loaded? }
end

Then(/^the expanded vitals applet is displayed$/) do
  aa = Vitals.instance
  expected_screen = 'Vitals'
  expect(aa.perform_verification('Screenname', "#{expected_screen}")).to eq(true), "Expected screenname to be #{expected_screen}"
  expect(aa.wait_until_action_element_visible("Title", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification("Title", 'VITALS')).to be_true
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until {  aa.applet_loaded? }
end

Then(/^the Vitals Applet contains data rows$/) do
  compare_item_counts("#grid-panel-vitals tr")
end

When(/^user refreshes Vitals Applet$/) do
  applet_refresh_action("vitals")
end

Then(/^the message on the Vitals Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("vitals", message_text)
end

Then(/^the Vitals applet is titled "([^"]*)"$/) do |title|
  expect(Vitals.instance.perform_verification("Title", title)).to be_true
end

Then(/^the Vitals applet contains buttons$/) do |table|
  vitals = Vitals.instance
  table.rows.each do | button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(vitals.am_i_visible? cucumber_label).to eq(true), "Could not find button #{button[0]}"
  end
end

Then(/^the Vitals Applet does not contain buttons$/) do |table|
  vitals = Vitals.instance
  table.rows.each do | button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(vitals.am_i_visible? cucumber_label).to eq(false), "Should not find button #{button[0]}"
  end
end

When(/^the user minimizes the vitals applet$/) do
  vitals = Vitals.instance
  expect(vitals.perform_action('Control - applet - Minimize View')).to eq(true)
end

When(/^the user views the first Vital detail view$/) do
  vital_applet = Vitals.instance
  expect(vital_applet.wait_until_xpath_count_greater_than('Vital Rows', 0)).to eq(true), "Test requires at least 1 row to be displayed"
  expect(vital_applet.perform_action('First Vital Row')).to eq(true)
  expect(vital_applet.perform_action('Applet Toolbar Detail')).to eq(true)
end

Then(/^the Vital Detail modal displays$/) do |table|
  modal = Vitals.instance
  table.rows.each do | row |
    expect(modal.am_i_visible? row[0]).to eq(true), "#{row[0]} was not visible"
  end
end

When(/^the user views the first Vitals detail view$/) do
  pending # Write code here that turns the phrase above into concrete actions
end

def count_rows_that_contain_qualifier_text_in_qualifier_column(qualifier_text)
  upper = qualifier_text.upcase
  lower = qualifier_text.downcase
  qualifier_column_index = 5

  td = "contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}') and contains(position(), #{qualifier_column_index})"  
  path =  "//table[@id='data-grid-vitals']/descendant::td[#{td}]/ancestor::tr"
  p path
  
  row_count = TestSupport.driver.find_elements(:xpath, path).length
  row_count
end

def check_for_any_qualifiers(qualifiers)
  qualifiers.each do | qualifier |
    count = count_rows_that_contain_qualifier_text_in_qualifier_column(qualifier)
    p "using #{qualifier} found #{count}"
    return true if count > 0
  end
  false
end

Then(/^some vitals display qualifiers$/) do
  qualifiers = %w(ORAL RADIAL SPONTANEOUS)

  driver = TestSupport.driver
  found_bottom = false
  number_of_attempts = 0
  table_id = '#data-grid-vitals tbody'
  found_qualifier = check_for_any_qualifiers(qualifiers)

  # loop until test finds 
  # a. qualifier text in the qualifier column or
  # b. test has scrolled the entire table without finding any qualifiers
  until (found_bottom && number_of_attempts >2) || found_qualifier

    count1 = driver.find_elements(:css, "#{table_id} tr").length
    p "scroll row #{count1} into view"
    element = driver.find_element(:css, "#{table_id} tr:nth-child(#{count1})")
    element.location_once_scrolled_into_view
    count2 = driver.find_elements(:css, "#{table_id} tr").length
    found_bottom = (count1 == count2)
    number_of_attempts = found_bottom ? number_of_attempts + 1 : 0
    found_qualifier = check_for_any_qualifiers(qualifiers)
    sleep 1 if found_bottom
  end
  expect(found_qualifier).to eq(true), "Could not find any of the folowing qualifiers in the table: #{qualifiers}"
end

def verify_rows_within_year(css_string, year, empty_row = 'tr.empty')
  return true if TestSupport.driver.find_elements(:css, 'tr.empty').length > 0
  date_columns = TestSupport.driver.find_elements(:css, css_string)
  p date_columns.length
  return false unless date_columns.length > 0 # if there were no records, then there should be a tr.empty which we already determined there isn't
  start_time = (Time.now - (24*60*60*(365*year))).to_datetime
  # p start_time
  date_format_template = "%m/%d/%Y - %H:%M"
  date_columns.each do | date_element |
    date_element.location_once_scrolled_into_view
    row_date = DateTime.strptime(date_element.text, date_format_template)
    date_in_range = row_date > start_time
    p "#{row_date} is not after #{start_time}" unless date_in_range
    return false unless date_in_range    
  end
  return true
rescue => e 
  p e
  return false
end

Then(/^the Expanded Vitals applet only displays rows from the last (\d+) year$/) do |year|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  wait.until { verify_rows_within_year('#data-grid-vitals tbody tr td:nth-child(1)', year.to_i) }
end

def verify_rows_last_hours(css_string, hours, empty_row = 'tr.empty')
  return true if TestSupport.driver.find_elements(:css, 'tr.empty').length > 0
  date_columns = TestSupport.driver.find_elements(:css, css_string)
  p date_columns.length
  return false unless date_columns.length > 0 # if there were no records, then there should be a tr.empty which we already determined there isn't
  start_time = (Time.now - (hours*60*60)).to_datetime

  # p start_time
  date_format_template = "%m/%d/%Y - %H:%M"
  date_columns.each do | date_element |
    date_element.location_once_scrolled_into_view
    row_date = DateTime.strptime(date_element.text, date_format_template)
    date_in_range = row_date > start_time
    p "#{row_date} is not after #{start_time}" unless date_in_range
    return false unless date_in_range    
  end
  return true
rescue => e 
  p e
  return false
end

Then(/^the Expanded Vitals applet only displays rows from the last (\d+) hours$/) do |hour|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  wait.until { verify_rows_last_hours('#data-grid-vitals tbody tr td:nth-child(1)', hour.to_i) }
end
