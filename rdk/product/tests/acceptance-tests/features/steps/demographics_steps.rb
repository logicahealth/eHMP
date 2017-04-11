path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'AccessBrowserV2.rb'

# All the HTML Elements the tests need to access in order to view the Patient's Demographics
class DemographicsHTMLElements < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Home Phone"), VerifyValue.new, AccessHtmlElement.new(:name, "homePhone"))
    add_verify(CucumberLabel.new("Cell Phone"), VerifyValue.new, AccessHtmlElement.new(:name, "cellPhone"))
    add_verify(CucumberLabel.new("Emergency Phone"), VerifyValue.new, AccessHtmlElement.new(:name, "emergencyPhone"))
    add_verify(CucumberLabel.new("Next of Kin Phone"), VerifyValue.new, AccessHtmlElement.new(:name, "nokPhone"))

    add_verify(CucumberLabel.new("Work Phone"), VerifyText.new, AccessHtmlElement.new(:xpath, "//label[contains(string(), 'Work Phone')]/parent::td/following-sibling::td/div"))
    add_verify(CucumberLabel.new("Marital Status"), VerifyText.new, AccessHtmlElement.new(:xpath, "//label[contains(string(), 'Marital Status')]/parent::td/following-sibling::td/div"))
    add_verify(CucumberLabel.new("Veteran"), VerifyText.new, AccessHtmlElement.new(:xpath, "//label[contains(string(), 'Veteran')]/parent::td/following-sibling::td/div"))
    add_verify(CucumberLabel.new("Service Connected"), VerifyText.new, AccessHtmlElement.new(:xpath, "//label[contains(string(), 'Service Connected')]/parent::td/following-sibling::td/div"))

    add_verify(CucumberLabel.new("Service Connected Conditions"), VerifyText.new, AccessHtmlElement.new(:xpath, "//label[contains(string(), 'Service Connected Conditions')]/parent::td/following-sibling::td/div"))
    add_verify(CucumberLabel.new("Emergency Contact"), VerifyText.new, AccessHtmlElement.new(:xpath, "//label[contains(string(), 'Emergency Contact')]/parent::td/following-sibling::td/div"))
    add_verify(CucumberLabel.new("Next of Kin"), VerifyText.new, AccessHtmlElement.new(:xpath, "//label[contains(string(), 'Next of Kin')]/parent::td/following-sibling::td/div"))
    add_verify(CucumberLabel.new("Date of death"), VerifyText.new, AccessHtmlElement.new(:xpath, "//label[contains(string(), 'Date of Death')]/parent::td/following-sibling::td/div"))

    add_action(CucumberLabel.new("Close Button"), ClickAction.new,  AccessHtmlElement.new(:xpath, "//div[@id='patientdemographicspanel']/parent::div/parent::div/descendant::span[contains(string(), 'Close')]"))
  end

  def build_header_xpath(text)
    return "//h4[contains(string(), '#{text}')]/ancestor::a"
  end

  def add_dynamic_xpath_to_actions(key, function, xpath)
    add_action(CucumberLabel.new(key), function, AccessHtmlElement.new(:xpath, xpath))
  end
end

When(/^the client requests demographics for that patient "(.*?)"$/) do |uid|
  temp = QueryRDKDemographics.new("patient", uid)
  # temp.add_parameter("urn:va:patient:", pid)
  #temp.add_format("json")
  #p temp.path
  @response = HTTPartyRDK.get(temp.path)
end

When(/^a user "(.*?)" with password "(.*?)" requests demographics for that patient "(.*?)"$/) do |user, pass, pid|
  temp = QueryRDK.new("patient")
  temp.add_parameter("_id", pid)
  #p temp.path
  @response = HTTPartyRDK.get_as_user(temp.path, user, pass)
end

When(/^the client breaks glass and repeats a request for demographics for that patient "(.*?)"$/) do |pid|
  temp = QueryRDKDemographics.new("patient", pid)
  #temp.add_parameter("_id", pid)
  #temp.add_format("json")
  #p temp.path
  @response = HTTPartyRDK.get(temp.path)
end

When(/^the client requests demographics for that sensitive patient "(.*?)"$/) do |pid|
  temp = QueryRDKDemographics.new("patient", pid)
  #temp.add_parameter("_id", pid)
  #temp.add_format("json")
  #p temp.path
  @response = HTTPartyRDK.get(temp.path)
end

When(/^the client requests demographics for the patient "(.*?)" in VPR format$/) do |pid|
  p path = QueryVPR.new("patient", pid).path
  @response = HTTPartyRDK.get(path)
end

