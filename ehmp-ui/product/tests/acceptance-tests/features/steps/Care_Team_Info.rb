path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'AccessBrowserV2.rb'
require 'HTMLVerification.rb'

class VerifyTextNotEmpty
  include HTMLVerification
  def initialize(starting_text)
    @error_message = 'no error message'
    @starting_text = starting_text
  end

  def pull_value(html_element, _value)
    return html_element.text
  end
  
  def verify(html_element, value)
    #p "#{html_element.text} should contain #{value}"
    reggie = Regexp.new("#{@starting_text}\\w+")
    p reggie
    text = html_element.text
    @error_message = "Does element text match regex #{reggie}: #{text}"
    
    return !(reggie.match(text)).nil?
  end

  def error_message
    return @error_message
  end
end

class VerifyPhoneFormat
  include HTMLVerification
  def initialize(starting_text = '')
    @error_message = 'no error message'
    @starting_text = starting_text
  end

  def pull_value(html_element, _value)
    return html_element.text
  end
  
  def verify(html_element, value)
    #p "#{html_element.text} should contain #{value}"
    reggie = Regexp.new("#{@starting_text}\\(\\d{3}\\) \\d{3}-\\d{4}")
    text = html_element.text
    @error_message = "Does element text match regex #{reggie}: #{text}"
    
    return !(reggie.match(text)).nil?
  end

  def error_message
    return @error_message
  end
end

When(/^"([^"]*)" is displayed as "([^"]*)"$/) do |current_patient_label, patient_name|
  ehmp = PobCoverSheet.new
  expect(ehmp.global_header.wait_for_current_patient_label).to eq(true)
  expect(ehmp.global_header.current_patient_label.text.upcase).to have_text(current_patient_label.upcase)
  expect(ehmp.global_header.wait_for_fld_patient_name).to eq(true)
  expect(ehmp.global_header.fld_patient_name.text.upcase).to have_text(patient_name.upcase)
end

And(/^the patientInformationProvider displays label "(.*?)"$/) do |text|
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_patient_info_provider_headers_visible
  max_attempt = 1
  begin
    expect(object_not_exists_in_list(@ehmp.fld_patient_info_provider_headers, text)).to eq(false)
  rescue Selenium::WebDriver::Error::StaleElementReferenceError => stale_element
    max_attempt -= 1
    raise stale_element if max_attempt < 0
    p "StaleElementReferenceError, retry"
    retry
  end
end

And(/^the Care Team "(.*?)" group displays data$/) do |title|
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_for_fld_patient_info_provider_groups
  @ehmp.wait_until_fld_patient_info_provider_groups_visible
  max_attempt = 1
  begin
    expect(return_boolean_if_contain_data(@ehmp.fld_patient_info_provider_groups, title)).to eq(true)
  rescue Selenium::WebDriver::Error::StaleElementReferenceError => stale_element
    max_attempt -= 1
    raise stale_element if max_attempt < 0
    p "StaleElementReferenceError, retry"
    retry
  end
end

And(/^the patientInformationProvider doesn't display label "(.*?)"$/) do |text|
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_patient_info_provider_headers_visible
  expect(object_not_exists_in_list(@ehmp.fld_patient_info_provider_headers, text)).to eq(true)
end

And(/^the Care Team "(.*?)" group doesn't displays data$/) do |title|
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_patient_info_provider_headers_visible
  expect(return_boolean_if_contain_data(@ehmp.fld_patient_info_provider_groups, title)).to eq(false)
end

Then(/^user selects Provider Information drop down$/) do
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_btn_provider_info_visible
  @ehmp.wait_for_fld_patient_information_provider
  expect(@ehmp).to have_fld_patient_information_provider
  @ehmp.fld_patient_information_provider.click
  @ehmp.wait_for_fld_demographic_group_headers
end

And(/^the "(.*?)" group contain headers$/) do |arg, table|
  @ehmp = PobDemographicsElements.new
  @ehmp.load_patient_care_provider_header_elements(arg)
  max_attempt = 1
  begin
    @ehmp.wait_until_fld_primary_care_provider_visible
    table.rows.each do |headers|
      expect(object_exists_in_list(@ehmp.fld_primary_care_provider, "#{headers[0]}")).to eq(true), "Field '#{headers[0]}' was not found"
    end
  rescue Exception => e
    max_attempt -= 1
    raise e if max_attempt < 0
    raise e if @ehmp.has_fld_provider_info_title?
    p "Tray was closed, reopen"
    DemographicsActions.open_provider_info_tray 
    retry
  end
end

And(/^the Provider Information Group contains headers$/) do |table|
  @ehmp = PobDemographicsElements.new
  max_attempt = 1
  begin
    @ehmp.wait_until_fld_provider_group_header_visible
    headers = @ehmp.fld_provider_group_header
    header_text = @ehmp.provider_group_header_text
    table.rows.each do |title|
      expect(object_exists_in_list(@ehmp.fld_provider_group_header, "#{title[0]}")).to eq(true), "Field '#{title[0]}' was not found, options are #{header_text}"
    end
  rescue Exception => e
    max_attempt -= 1
    raise e if max_attempt < 0
    raise e if @ehmp.has_fld_provider_info_title?
    p "Tray was closed, reopen"
    DemographicsActions.open_provider_info_tray 
    retry
  end
end

