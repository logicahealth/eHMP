path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'all_applets.rb'

class UserProvisioningRoles < AllApplets
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Administration Applet"), ClickAction.new, AccessHtmlElement.new(:css, "#ehmp-administration-nav-header-tab"))
    add_action(CucumberLabel.new("Notes Applet"), ClickAction.new, AccessHtmlElement.new(:css, "#patientDemographic-noteSummary > button"))
    add_verify(CucumberLabel.new("admin applet panel title"), VerifyText.new, AccessHtmlElement.new(:css, "h5.panel-title-label"))
    add_verify(CucumberLabel.new("admin applet loaded"), VerifyText.new, AccessHtmlElement.new(:css, ".mainSearchForm"))
    add_verify(CucumberLabel.new("login error message"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#errorMessage"))
    # form labels
    add_verify(CucumberLabel.new("first name"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='firstNameValue']"))
    add_verify(CucumberLabel.new("last name"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='lastNameValue']"))
    add_verify(CucumberLabel.new("select role"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='roleValue']"))
    add_verify(CucumberLabel.new("DUZ"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='duzValue']"))
    add_verify(CucumberLabel.new("show inactive vista users"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='vistaCheckboxValue']"))
    add_verify(CucumberLabel.new("show inactive ehmp users"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='ehmpCheckboxValue']"))
    # form fields
    add_action(CucumberLabel.new("first name input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#firstNameValue"))
    add_action(CucumberLabel.new("last name input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#lastNameValue"))
    add_action(CucumberLabel.new("select role drop down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "#roleValue"))
    add_action(CucumberLabel.new("DUZ input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#duzValue"))
    add_action(CucumberLabel.new("show inactive vista users check box"), ClickAction.new, AccessHtmlElement.new(:css, "#vistaCheckboxValue"))
    add_action(CucumberLabel.new("show inactive ehmp users check box"), ClickAction.new, AccessHtmlElement.new(:css, "#ehmpCheckboxValue"))
    add_action(CucumberLabel.new("Search"), ClickAction.new, AccessHtmlElement.new(:css, "#search-btn"))
    # roles
    add_action(CucumberLabel.new("Click on form"), ClickAction.new, AccessHtmlElement.new(:css, "div.mainSearchForm"))
    add_action(CucumberLabel.new("TRACY KEELEY"), ClickAction.new, AccessHtmlElement.new(:css, "#urn-va-user-9E7A-10000000273"))
    add_action(CucumberLabel.new("VIHAAN KHAN"), ClickAction.new, AccessHtmlElement.new(:css, "#urn-va-user-9E7A-10000000272"))
    add_verify(CucumberLabel.new("Read Access role"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//div[contains(@class, 'row') and contains(string(), 'Read Access')]"))
    add_verify(CucumberLabel.new("Pharmacist role"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//div[contains(@class, 'row') and contains(string(), 'Pharmacist')]"))
    add_verify(CucumberLabel.new("Standard Doctor role"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//div[contains(@class, 'row') and contains(string(), 'Standard Doctor')]"))
    add_action(CucumberLabel.new("Edit Roles"), ClickAction.new, AccessHtmlElement.new(:css, ".edit-roles-btn"))
    add_action(CucumberLabel.new("Add Standard Doctor Role"), ClickAction.new, AccessHtmlElement.new(:css, "[title='Press enter to add Standard Doctor.']"))
    add_action(CucumberLabel.new("Add Read Access Role"), ClickAction.new, AccessHtmlElement.new(:css, "[title='Press enter to add Read Access.']"))
    add_action(CucumberLabel.new("Add Pharmacist Role"), ClickAction.new, AccessHtmlElement.new(:css, "[title='Press enter to add Pharmacist.']"))
    add_action(CucumberLabel.new("Delete Standard Doctor Role"), ClickAction.new, AccessHtmlElement.new(:css, "[title='Press enter to remove Standard Doctor.']"))
    add_action(CucumberLabel.new("Delete Pharmacist Role"), ClickAction.new, AccessHtmlElement.new(:css, "[title='Press enter to remove Pharmacist.']"))
    add_action(CucumberLabel.new("Delete Read Access Role"), ClickAction.new, AccessHtmlElement.new(:css, "[title='Press enter to remove Read Access.']"))
    add_action(CucumberLabel.new("Save Role"), ClickAction.new, AccessHtmlElement.new(:css, "[title='Save']"))
    add_action(CucumberLabel.new("Close Role"), ClickAction.new, AccessHtmlElement.new(:css, "button.close"))
    add_verify(CucumberLabel.new("Growl Alert"), VerifyContainsText.new, AccessHtmlElement.new(:css, "div.growl-alert"))
  end
end

Then(/^user chooses "([^"]*)" row$/) do |user|
  aa = UserProvisioningRoles.instance
  expect(aa.perform_action(user)).to eq(true)
end

Then(/^user selects the "([^"]*)" "([^"]*)"$/) do |check_box, user_type|
  aa = UserProvisioningRoles.instance
  expect(aa.perform_action(user_type + " " + check_box)).to eq(true)
end
