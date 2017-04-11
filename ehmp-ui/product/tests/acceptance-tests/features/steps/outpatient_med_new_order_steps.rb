path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'AccessBrowserV2.rb'

class NewOutpatientMedOrder < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("OkWarning"), ClickAction.new, AccessHtmlElement.new(:id, "ok"))
    add_action(CucumberLabel.new("ConfirmVisit"), ClickAction.new, AccessHtmlElement.new(:id, "setVisitBtn"))
    add_verify(CucumberLabel.new("Cancel"), VerifyContainsText.new, AccessHtmlElement.new(:id, "visitCancelBtn"))
    add_verify(CucumberLabel.new("warningWindow"), VerifyText.new, AccessHtmlElement.new(:id, "warning-container"))
    add_action(CucumberLabel.new("Visit Information"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='accordion']/div/div[1]/h4/a"))
    add_action(CucumberLabel.new("Outpatient Medication"), ClickAction.new, AccessHtmlElement.new(:id, "outpatientMeds"))
    add_verify(CucumberLabel.new("Change Visit"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@id='change-visit-btn']"))
    add_verify(CucumberLabel.new("Visit Information Location"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@id='collapseOne']/div/span[2]"))
    add_verify(CucumberLabel.new("orderTypeSearchInput"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@id='orderType']"))
    add_action(CucumberLabel.new("orderTypeSearchResults"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='orderType']/option[2]"))
    add_action(CucumberLabel.new("MedsSearchInput"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "medsSearchInput"))
    add_verify(CucumberLabel.new("MedsSearchInput"), VerifyPlaceholder.new, AccessHtmlElement.new(:id, "medsSearchInput"))
    add_verify(CucumberLabel.new("HospitalMedSearchList"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@id='meds-ul']/li[3]/a"))
    add_action(CucumberLabel.new("HospitalMedSearchList"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='meds-ul']/li[3]/a"))
    add_verify(CucumberLabel.new("ClinicMedSearchList"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@id='meds-ul']/li[1]/a"))
    add_action(CucumberLabel.new("ClinicMedSearchList"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='meds-ul']/li[1]/a"))
    add_action(CucumberLabel.new("NonFormularyMedSearchList"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='meds-ul']/li[1]/a"))
    add_verify(CucumberLabel.new("NonFormularyMedSearchList"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@id='meds-ul']/li[1]/a"))
    add_verify(CucumberLabel.new("Panel Title"), VerifyText.new, AccessHtmlElement.new(:id, "medicationName"))
    add_action(CucumberLabel.new("daysSupply"), ClickClearAndSendKeysAction.new, AccessHtmlElement.new(:xpath, "//*[@id='supply']"))
    add_action(CucumberLabel.new("numTablet"), ClickClearAndSendKeysAction.new, AccessHtmlElement.new(:xpath, "//*[@id='quantity']"))
    add_action(CucumberLabel.new("numRefill"), ClickClearAndSendKeysAction.new, AccessHtmlElement.new(:xpath, "//*[@id='refills']"))
    add_action(CucumberLabel.new("pickupwindow"), ClickClearAndSendKeysAction.new, AccessHtmlElement.new(:xpath, "//*[@id='pickupWindow']"))
    add_verify(CucumberLabel.new("Preview"), VerifyContainsText.new, AccessHtmlElement.new(:id, "previewOrder"))
    add_action(CucumberLabel.new("acceptOrder"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='btn-add-order-accept']"))
    add_verify(CucumberLabel.new("Success"), VerifyPlaceholder.new, AccessHtmlElement.new(:xpath, "//*[@id='modal-body']/div"))
    add_action(CucumberLabel.new("7A Gen Med"), ClickAction.new, AccessHtmlElement.new(:id, "urn:va:visit:9E7A:100013:H4178"))
    add_action(CucumberLabel.new("General Medicine"), ClickAction.new, AccessHtmlElement.new(:id, "urn:va:appointment:9E7A:100013:A;3010525.1215;23"))
    add_action(CucumberLabel.new("AddMedicatonOrder"), ClickAction.new, AccessHtmlElement.new(:id, "add-med-order-btn"))
  end
end

When(/^the user clicks the "([^"]*)" button$/) do |element|
  con = NewOutpatientMedOrder.instance
  if element == "OK"
    button_label = "OkWarning"
  elsif element == "Confirm"
    button_label = "ConfirmVisit"
  elsif element == "Change"
    button_label = "ChangeVisit"
  elsif element == "Add Medication Order"
    button_label = "AddMedicatonOrder"
  end
  wait_until_present_and_perform_action(con, button_label)
end

Then(/^the user clicks on "([^"]*)" link$/) do |element|
  aa = NewOutpatientMedOrder.instance
  expect(aa.wait_until_action_element_visible(element, 60)).to be_true
  expect(aa.perform_action(element, "")).to be_true
end
