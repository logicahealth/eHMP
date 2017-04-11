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

# class CareTeamHeaders < AccessBrowserV2
#   include Singleton
#   attr_accessor :care_details
#   attr_accessor :other_site_providers
#   def initialize
#     super
#     add_action(CucumberLabel.new("Care Team Information"), ClickAction.new, AccessHtmlElement.new(:css, "#patientDemographic-providerInfoSummary"))
#     add_action(CucumberLabel.new("Care Team Inpatient Attending Provider Quicklook"), ClickAction.new, AccessHtmlElement.new(:class, "inpatient-attending-provider"))
#     add_action(CucumberLabel.new("Care Team Primary Provider Quicklook"), ClickAction.new, AccessHtmlElement.new(:class, "primary-provider"))
#     # heading
#     add_verify(CucumberLabel.new("Primary Care Team"), VerifyTextNotEmpty.new('Primary Care: '), AccessHtmlElement.new(:css, "#primaryCareTeam"))
#     add_verify(CucumberLabel.new("Primary Care Team Label"), VerifyContainsText.new, AccessHtmlElement.new(:css, '#primaryCareTeam'))
#     add_verify(CucumberLabel.new("Primary Care Providers"), VerifyTextNotEmpty.new(''), AccessHtmlElement.new(:css, "#pimaryCareProviders"))
#     add_verify(CucumberLabel.new("Primary Care Phone"), VerifyPhoneFormat.new, AccessHtmlElement.new(:css, "#primaryCarePhone"))
#
#     add_verify(CucumberLabel.new("Inpatient Attending/Provider Label"), VerifyText.new, AccessHtmlElement.new(:css, ".inpatientAttending-summary span"))
#     add_verify(CucumberLabel.new("Inpatient Attending/Provider Data"), VerifyTextNotEmpty.new(''), AccessHtmlElement.new(:css, "#inpatientProviders div:nth-child(2)"))
#
#     add_verify(CucumberLabel.new("Mental Health"), VerifyTextNotEmpty.new('Mental Health: '), AccessHtmlElement.new(:css, "#mhTeam"))
#     add_verify(CucumberLabel.new("Mental Health Label"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#mhTeam"))
#     add_verify(CucumberLabel.new("MH Provider"), VerifyTextNotEmpty.new(''), AccessHtmlElement.new(:css, "#mhProvider"))
#
#     @care_details = AccessHtmlElement.new(:css, "div.patient-info-dropdown table tbody td.renderable:nth-child(1)")
#     add_verify(CucumberLabel.new("Care Details Popup rows"), VerifyXpathCount.new(@care_details), @care_details)
#
#     add_verify(CucumberLabel.new('Other Site Care Providers table'), VerifyContainsText.new, AccessHtmlElement.new(:css, 'div.popover-content div.other-site-heading'))
#     @other_site_providers = AccessHtmlElement.new(:css, "div.popover-content tbody td:nth-child(1)")
#     add_verify(CucumberLabel.new("Other Care Provider Facilities"), VerifyXpathCount.new(@other_site_providers), @other_site_providers)
#   end
# end

# And(/^the Care Team "(.*?)" data displays: "(.*?)"$/) do |element, text|
#   con = CareTeamHeaders.instance
#   driver = TestSupport.driver
#   con.wait_until_action_element_visible(element, DefaultLogin.wait_time)
#   expect(con.static_dom_element_exists?(element)).to be_true
#   expect(con.perform_verification(element, text)).to be_true
# end

And(/^the patientInformationProvider displays label "(.*?)"$/) do |text|
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_patient_info_provider_headers_visible
  expect(object_not_exists_in_list(@ehmp.fld_patient_info_provider_headers, text)).to eq(false)
end

And(/^the Care Team "(.*?)" group displays data$/) do |title|
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_for_fld_patient_info_provider_groups
  @ehmp.wait_until_fld_patient_info_provider_groups_visible
  expect(return_boolean_if_contain_data(@ehmp.fld_patient_info_provider_groups, title)).to eq(true)
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
  page.execute_script "$('#patient-header-provider-details .fa-circle').trigger('click')"
  # sleep(0.50)
  @ehmp.wait_until_fld_patient_provider_info_visible
  @ehmp.wait_until_btn_provider_info_visible
  if @ehmp.btn_provider_info['aria-expanded'] == 'false'
    page.execute_script "$('#patient-header-provider-details .fa-circle').trigger('click')"
  end
end

And(/^the "(.*?)" group contain headers$/) do |arg, table|
  @ehmp = PobDemographicsElements.new
  @ehmp.load_patient_care_provider_header_elements(arg)
  @ehmp.wait_until_fld_primary_care_provider_visible

  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.fld_primary_care_provider, "#{headers[0]}")).to eq(true), "Field '#{headers[0]}' was not found"
  end

end

And(/^the Provider Information Group contains headers$/) do |table|
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_provider_group_header_visible
  table.rows.each do |title|
    expect(object_exists_in_list(@ehmp.fld_provider_group_header, "#{title[0]}")).to eq(true), "Field '#{title[0]}' was not found"
  end
end

And(/^Resize browser$/) do
  driver = TestSupport.driver
  driver.manage.window.resize_to(2000, 700)
end

# Then(/^a Care Team Quicklook table displays$/) do
#   care_team_headers = CareTeamHeaders.instance
#   expect(care_team_headers.wait_until_action_element_visible('Other Site Care Providers table')).to eq(true)
#   expect(care_team_headers.wait_until_xpath_count_greater_than('Other Care Provider Facilities', 0)).to eq(true)
#   @tc = TableHeadersContainer.instance
#   expect(@tc.wait_until_action_element_visible('Headers - Care Team Quicklook')).to eq(true)
# end
#
# Then(/^the Care Team Quicklook table contains rows$/) do |table|
#   driver = TestSupport.driver
#   care_team_headers = CareTeamHeaders.instance
#   elements = driver.find_elements(care_team_headers.other_site_providers.how, care_team_headers.other_site_providers.locator)
#   text = []
#   elements.each do |ele|
#     text.push(ele.text)
#   end
#   p text
#   table.rows.each do |row|
#     expect(text.include?(row[0])).to eq(true), "Expected Facility #{row[0]} to be displayed, but only #{text}"
#   end
# end
#
# Then(/^all applets are loaded$/) do
#   pending # Write code here that turns the phrase above into concrete actions
# end

