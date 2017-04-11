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

Then(/^user can view the Access Control Applet$/) do
  aa = UserProvisioningRoles.instance
  expect(aa.am_i_visible?("Administration Applet")).to eq(true), "User not able to view the Administration Button"
end

When(/^user views the Access Control Applet$/) do
  aa = UserProvisioningRoles.instance
  expect(aa.perform_action("Administration Applet")).to eq(true)
  take_screenshot("access_control_view")
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  wait.until { aa.am_i_visible?("show inactive ehmp users") }
  take_screenshot("access_control_view_after_wait")
end

Then(/^the Access Control applet modal title says "([^"]*)"$/) do |modal_title|
  aa = UserProvisioningRoles.instance
  expect(aa.perform_verification("admin applet panel title", modal_title)).to eq(true)
end

Then(/^the Access Control applet modal displays labels$/) do |table|
  verify_admin_modal_details(table)
end

def verify_admin_modal_details(table)
  modal = UserProvisioningRoles.instance
  expect(modal.wait_until_action_element_visible("admin applet loaded", DefaultLogin.wait_time)).to be_true
  table.rows.each do | row |
    expect(modal.am_i_visible?(row[0])).to eq(true), "'#{row[0]}' is not visible"
  end
end

Then(/^the Access Control applet detail modal has inactive "([^"]*)" button$/) do |search_btn|
  aa = UserProvisioningRoles.instance
  expect(aa.wait_until_action_element_visible("admin applet loaded", DefaultLogin.wait_time)).to be_true
  take_screenshot("search_button")
  expect(aa.get_element(search_btn).displayed?).to eq(true)
  expect(aa.get_element(search_btn).enabled?).to eq(false)
end

Then(/^the Access Control applet detail modal displays fields$/) do |table|
  verify_admin_modal_details(table)
end

Then(/^user doesn't have permission to access the "([^"]*)"$/) do |applet_name|
  aa = UserProvisioningRoles.instance
  expect(aa.am_i_visible?("Notes Applet")).to eq(false), "Notes applet is accessible"
end

Then(/^user enters "([^"]*)" in the first name field$/) do |input|
  aa = UserProvisioningRoles.instance
  expect(aa.perform_action("first name input box", input)).to eq(true)
end

Then(/^user enters "([^"]*)" in the last name field$/) do |input|
  aa = UserProvisioningRoles.instance
  expect(aa.perform_action("last name input box", input)).to eq(true)
end

Then(/^user searches for the user roles$/) do
  aa = UserProvisioningRoles.instance
  expect(aa.perform_action("Click on form")).to eq(true)
  take_screenshot("before clicking search")
  expect(aa.wait_until_action_element_visible("Search", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action("Search")).to eq(true)
end

Then(/^user is presented with user management table$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { user_management_grid_loaded? }  
end

def user_management_grid_loaded?
  return TestSupport.driver.find_elements(:css, '#data-grid-user_management tr.selectable').length > 0
rescue => e 
  p e
  false
end

Then(/^the "([^"]*)" has "([^"]*)" and "([^"]*)" roles$/) do |user, role_1, role_2|
  aa = UserProvisioningRoles.instance
  expect(aa.perform_action(user)).to eq(true)
  expect(aa.perform_verification(role_1 + " role", role_1)).to eq(true)
  expect(aa.perform_verification(role_2 + " role", role_2)).to eq(true) 
end

Then(/^the authorized user edits the roles$/) do
  aa = UserProvisioningRoles.instance
  expect(aa.perform_action("Edit Roles")).to eq(true)
end

#Then(/^gives "([^"]*)" a "([^"]*)" role$/) do |user, role|
#  aa = UserProvisioningRoles.instance
#  expect(aa.perform_action("Add Standard Doctor Role")).to eq(true) if aa.am_i_visible?("Add Standard Doctor Role")
#  save_and_exit_modal
#end

def save_and_exit_modal
  aa = UserProvisioningRoles.instance
  expect(aa.perform_action("Save Role")).to eq(true)
  expect(aa.wait_until_action_element_visible("Growl Alert", DefaultLogin.wait_time)).to be_true
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { element_is_not_present?(:css, 'div.growl-alert') }
  expect(aa.perform_action("Close Role")).to eq(true)
end

Then(/^user has permission to access the "([^"]*)"$/) do |arg1|
  aa = UserProvisioningRoles.instance
  expect(aa.am_i_visible?("Notes Applet")).to eq(true), "Notes applet is not accessible"
end

Then(/^the "([^"]*)" has "([^"]*)", "([^"]*)" and "([^"]*)" roles$/) do |user, role_1, role_2, role_3|
  aa = UserProvisioningRoles.instance
  expect(aa.perform_action(user)).to eq(true)
  expect(aa.perform_verification(role_1 + " role", role_1)).to eq(true)
  expect(aa.perform_verification(role_2 + " role", role_2)).to eq(true) 
  expect(aa.perform_verification(role_3 + " role", role_3)).to eq(true)  
end

Then(/^user chooses "([^"]*)" row$/) do |user|
  aa = UserProvisioningRoles.instance
  expect(aa.perform_action(user)).to eq(true)
end

Then(/^a message says "([^"]*)"$/) do |message|
  aa = UserProvisioningRoles.instance
  expect(aa.wait_until_action_element_visible("Growl Alert", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification("Growl Alert", message)).to be_true
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { element_is_not_present?(:css, 'div.growl-alert') }
  expect(aa.perform_action("Close Role")).to eq(true)
end

Then(/^deletes the following roles for user "([^"]*)"$/) do |user, table|
  aa = UserProvisioningRoles.instance
  table.rows.each do | row |
    delete_role = "Delete " + row[0] + " Role"
    expect(aa.perform_action(delete_role)).to eq(true) if aa.am_i_visible?(delete_role)
  end
  save_and_exit_modal
end

Then(/^user sees the login error message "([^"]*)"$/) do |error_message|
  aa = UserProvisioningRoles.instance
  expect(aa.wait_until_action_element_visible("login error message", 30)).to be_true
  expect(aa.perform_verification("login error message", error_message)).to eq(true) 
end

Then(/^gives the following roles for user "([^"]*)"$/) do |user, table|
  aa = UserProvisioningRoles.instance
  table.rows.each do | row |
    add_role = "Add " + row[0] + " Role"
    expect(aa.perform_action(add_role)).to eq(true) if aa.am_i_visible?(add_role)
  end
  save_and_exit_modal
end

Then(/^user selects the "([^"]*)" "([^"]*)"$/) do |check_box, user_type|
  aa = UserProvisioningRoles.instance
  expect(aa.perform_action(user_type + " " + check_box)).to eq(true)
end
