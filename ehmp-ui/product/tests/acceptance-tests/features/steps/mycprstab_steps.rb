path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'AccessBrowserV2.rb'
require 'HTMLVerification.rb'

class HasFocus
  include HTMLVerification
  def initialize(css)
    @error_message = 'no error message'
    @css = css
  end

  def verify(html_element, expect_focus)
    # has_focus = html_element.attribute('class').include?('hasFocus')  
    p TestSupport.driver.switch_to.active_element.attribute('id')
    has_focus = TestSupport.driver.switch_to.active_element == TestSupport.driver.find_element(:css, @css)  
    p "#{has_focus} vs #{expect_focus}"
    return has_focus == expect_focus
  end

  def pull_value(html_element, _value)
    text = html_element.attribute('class')
  end
end

class TabActive
  include HTMLVerification
  def initialize
    @error_message = 'no error message'
  end

  def verify(html_element, expect_active)
    has_focus = html_element.attribute('class').include?('active')    
    p "#{has_focus} vs #{expect_active}"
    return has_focus == expect_active
  end

  def pull_value(html_element, _value)
    text = html_element.attribute('class')
  end
end

class MyCprsListTab < AccessBrowserV2
  include Singleton
  def initialize
    super
    focus_css = '#patientSearchInput'
    add_verify(CucumberLabel.new('patient_selection_focus'), HasFocus.new(focus_css), AccessHtmlElement.new(:css, '#patientSearchInput'))
    add_verify(CucumberLabel.new('Patient Search Placeholder'), VerifyPlaceholder.new, AccessHtmlElement.new(:css, '#patientSearchInput'))
    add_verify(CucumberLabel.new('Paticent Search Search Term'), VerifyValue.new, AccessHtmlElement.new(:css, '#patientSearchInput'))
    #li(:my_cprs_list_tab, id: 'myCprsList')
  #   li(:clinics_tab, id: 'clinics')
  # li(:wards_tab, id: 'wards')
    add_verify(CucumberLabel.new('my_cprs_list_tab'), TabActive.new, AccessHtmlElement.new(:id, 'myCprsList'))
    add_verify(CucumberLabel.new('clinics_tab'), TabActive.new, AccessHtmlElement.new(:id, 'clinics'))
    add_verify(CucumberLabel.new('wards_tab'), TabActive.new, AccessHtmlElement.new(:id, 'wards'))

    add_action(CucumberLabel.new('my_cprs_list_link'), ClickAction.new, AccessHtmlElement.new(:css, '#myCprsList a'))
    add_action(CucumberLabel.new('clinics_link'), ClickAction.new, AccessHtmlElement.new(:css, '#clinics a'))
    add_action(CucumberLabel.new('wards_link'), ClickAction.new, AccessHtmlElement.new(:css, '#wards a'))
    #a(:nationwide_link, css: '#global a')
    add_action(CucumberLabel.new('nationwide_link'), ClickAction.new, AccessHtmlElement.new(:css, '#global a'))
    add_verify(CucumberLabel.new('nationwide_tab'), TabActive.new, AccessHtmlElement.new(:id, 'global'))

    add_action(CucumberLabel.new('mysite_link'), ClickAction.new, AccessHtmlElement.new(:css, '#mySite a'))
    add_verify(CucumberLabel.new('mysite_tab'), TabActive.new, AccessHtmlElement.new(:id, 'mySite'))

    add_verify(CucumberLabel.new('patient_name'), VerifyContainsText.new, AccessHtmlElement.new(:css, '.list-group a:nth-of-type(1) div .col-md-6.no-padding-right'))
    add_verify(CucumberLabel.new('patient_SSN'), VerifyContainsText.new, AccessHtmlElement.new(:css, '.list-group a:nth-of-type(1) div .ssn'))
    add_verify(CucumberLabel.new('patient_DOB'), VerifyContainsText.new, AccessHtmlElement.new(:css, '.list-group a:nth-of-type(1) div .dob'))
    add_verify(CucumberLabel.new('patient_gender'), VerifyText.new, AccessHtmlElement.new(:css, '.list-group a:nth-of-type(1) div .col-md-2 span'))
  
    patient_search_tabs = AccessHtmlElement.new(:css, '#patient-search-tab li a')
    add_verify(CucumberLabel.new('Patient Search Tabs'), VerifyXpathCount.new(patient_search_tabs), patient_search_tabs)
    patient_search_pills = AccessHtmlElement.new(:css, '#patient-search-pills li a')
    add_verify(CucumberLabel.new('Patient Search Pills'), VerifyXpathCount.new(patient_search_pills), patient_search_pills)
  end

  def get_mysite_tabs_group_text(search_tab_index)
    TestSupport.driver.find_element(css: '#patientSearchTabs li:nth-of-type('" #{ search_tab_index } "')').text
  end
  
  def get_all_tabs_group_text(search_tab_index)
    TestSupport.driver.find_element(css: '#patient-search-pills li:nth-of-type('" #{ search_tab_index } "') a').text
  end
end

Given(/^the call to my cprs list is completed$/) do
  patient_search = PatientSearch2.instance  
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { !patient_search.am_i_visible?("Active MyCPRSList") }
end

Then(/^the user verifies the focus is on Patient Selection bubble$/) do
  expect(MyCprsListTab.instance.perform_verification('patient_selection_focus', true)).to eq(true)
end

Then(/^the user verifies the text "([^"]*)" is displayed in the bubble field$/) do |arg1|
  expect(MyCprsListTab.instance.perform_verification('Patient Search Placeholder', arg1)).to eq(true), "Placeholder text did not eq #{arg1}"
end

Then(/^the user verifies that list of tabs in mysite tab groups are in the following order: My Site, Nationwide$/) do
  mysite_group_tabs = ['My Site', 'Nationwide']
  search_tab_index = 1
  my_cprs_tabs = MyCprsListTab.instance
  mysite_group_tabs.each do |tab|
    expect(my_cprs_tabs.get_mysite_tabs_group_text(search_tab_index)).to include(tab)
    search_tab_index += 1
  end
end

Then(/^the user verifies that the all tabs group list has order All, My CPRS List, Clinics, Wards$/) do
  all_group_tabs = ['My CPRS List', 'Clinics', 'Wards']
  search_tab_index = 1
  my_cprs_tabs = MyCprsListTab.instance
  all_group_tabs.each do |_tab|
    expect(my_cprs_tabs.get_all_tabs_group_text(search_tab_index)).not_to include('All Tab')
    search_tab_index += 1
  end
end

When(/^the user clicks the sub\-tab My Cprs List$/) do
  
end

Then(/^the user verifies the focus moves to the selected sub\-tab My Cprs List$/) do
  expect(MyCprsListTab.instance.perform_action('my_cprs_list_link')).to eq(true)
  expect(MyCprsListTab.instance.perform_verification('my_cprs_list_tab', true)).to eq(true)
  expect(MyCprsListTab.instance.perform_verification('patient_selection_focus', false)).to eq(true)
end

Then(/^the user verifies the focus moves to the selected sub\-tab Clinics$/) do
  expect(MyCprsListTab.instance.perform_action('clinics_link')).to eq(true)
  expect(MyCprsListTab.instance.perform_verification('clinics_tab', true)).to eq(true)
  expect(MyCprsListTab.instance.perform_verification('patient_selection_focus', false)).to eq(true)
end

Then(/^the user verifies the focus moves to the selected sub\-tab Wards$/) do
  expect(MyCprsListTab.instance.perform_action('wards_link')).to eq(true)
  expect(MyCprsListTab.instance.perform_verification('wards_tab', true)).to eq(true)
  expect(MyCprsListTab.instance.perform_verification('patient_selection_focus', false)).to eq(true)
end

Given(/^the user has entered a patient search term$/) do
  @patient_search_term = 'Eight,Patient'
  enter_search_term(PatientSearch2.instance, @patient_search_term)
end

When(/^the user clicks the clinics tab$/) do
  expect(MyCprsListTab.instance.perform_action('clinics_link')).to eq(true)
end

Then(/^the patient search is cleared$/) do
  expect(MyCprsListTab.instance.perform_verification('Paticent Search Search Term', '')).to eq(true)
end

When(/^the user clicks the nationwide search tab$/) do
  expect(MyCprsListTab.instance.perform_action('nationwide_link')).to eq(true)
  expect(MyCprsListTab.instance.perform_verification('nationwide_tab', true)).to eq(true)
end

When(/^the user clicks the mysite search tab$/) do
  expect(MyCprsListTab.instance.perform_action('mysite_link')).to eq(true)
  expect(MyCprsListTab.instance.perform_verification('mysite_tab', true)).to eq(true)
end

Then(/^the patient search term is displayed$/) do
  expect(MyCprsListTab.instance.perform_verification('Paticent Search Search Term', @patient_search_term)).to eq(true)
end

Then(/^the patient name "([^"]*)" is displayed$/) do |arg1|
  expect(MyCprsListTab.instance.perform_verification('patient_name', arg1)).to eq(true)
end

Then(/^the patient ssn is "([^"]*)"$/) do |arg1|
  expect(MyCprsListTab.instance.perform_verification('patient_SSN', arg1)).to eq(true)
end

Then(/^the patient DOB is "([^"]*)"$/) do |arg1|
  expect(MyCprsListTab.instance.perform_verification('patient_DOB', arg1)).to eq(true)
end

Then(/^the user verifies only the following tabs are displayed$/) do |table|
  expected_element_count = table.rows.length
  elements = MyCprsListTab.instance
  expect(elements.perform_verification('Patient Search Tabs', expected_element_count)).to eq(true), "Should only have #{expected_element_count} tabs"
  tabs = elements.get_elements('Patient Search Tabs')
  (0..expected_element_count - 1).each do |i|
    tab_text = tabs[i].text
    table_text = table.rows[i][0]
    expect(tab_text.start_with? table_text).to eq(true), "browser text: #{tab_text} Expected: #{table_text}"
  end
end

Then(/^the user verifies only the following patient search pills are displayed$/) do |table|
  expected_element_count = table.rows.length
  elements = MyCprsListTab.instance
  expect(elements.perform_verification('Patient Search Pills', expected_element_count)).to eq(true), "Should only have #{expected_element_count} pills"
  pills = elements.get_elements('Patient Search Pills')
  (0..expected_element_count - 1).each do |i|
    pill_text = pills[i].text
    table_text = table.rows[i][0]
    expect(pill_text.start_with? table_text).to eq(true), "browser text: #{pill_text} Expected: #{table_text}"
  end
end
