path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'all_applets.rb'

class EncounterFormData < AllApplets
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Set Encounter Section"), ClickAction.new, AccessHtmlElement.new(:css, "#patientDemographic-visitInfo [type=button]"))
    add_verify(CucumberLabel.new("Encounter Title"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@id='setVisitContextBtn']/descendant::span[contains(string(),'No visit set')]"))
    add_action(CucumberLabel.new("New Visit"), ClickAction.new, AccessHtmlElement.new(:css, "[aria-controls^='New-Visit-tab-panel']"))
    add_action(CucumberLabel.new("Clinic Appointments"), ClickAction.new, AccessHtmlElement.new(:css, "[aria-controls^='Clinic-Appointments-tab-panel']"))
    add_action(CucumberLabel.new("Hospital Admissions"), ClickAction.new, AccessHtmlElement.new(:css, "[aria-controls^='Hospital-Admissions-tab-panel']"))
    add_action(CucumberLabel.new("New Encounter Location Drop Box"), ClickAction.new, AccessHtmlElement.new(:css, "span[x-is-labelledby='select2-selectNewEncounterLocation-container']"))
    add_action(CucumberLabel.new("search field input"), SendKeysAction.new, AccessHtmlElement.new(:css, "input[class='select2-search__field']"))
    add_action(CucumberLabel.new("select cardiology"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[contains(@class, 'select2-results__options--nested')]/descendant::li[contains(string(),'CARDIOLOGY')]"))
    add_action(CucumberLabel.new("set visit"), ClickAction.new, AccessHtmlElement.new(:css, "#viewEncounters-btn"))
    add_action(CucumberLabel.new("First Clinic Appointment"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='selectableTableAppointments']/descendant::span[contains(string(),'CARDIOLOGY')]"))
    add_action(CucumberLabel.new("First Hospital Admission"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='selectableTableAdmissions']/descendant::span[contains(string(), 'HEART ATTACK') and contains(string(), '7A Gen Med')]"))
    add_verify(CucumberLabel.new("Encounter Location"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#patientDemographic-visitInfo [type=button] span"))
    add_verify(CucumberLabel.new("Select Encounter Location title"), VerifyContainsText.new, AccessHtmlElement.new(:css, 'div.modal-body h5.encounters-sub-heading'))
    add_verify(CucumberLabel.new("Growl Alert"), VerifyContainsText.new, AccessHtmlElement.new(:css, "div.growl-alert"))
  end
end

def choose_encounter_location
  aa = EncounterFormData.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  #take_screenshot("choose_encounter_location")
  wait.until { aa.static_dom_element_exists?("New Encounter Location Drop Box") }
  wait.until { aa.get_element("New Encounter Location Drop Box").enabled? == true }
  wait.until { aa.get_element("New Encounter Location Drop Box").displayed? == true }
  expect(aa.perform_action("New Encounter Location Drop Box", '')).to be_true
  expect(aa.perform_action("search field input", 'cardiology')).to be_true
  expect(aa.perform_action("select cardiology", '')).to be_true
end

Then(/^user chooses to set a new visit$/) do
  aa = EncounterFormData.instance
  expect(aa.perform_action("New Visit", '')).to be_true
end

Then(/^user chooses new encounter location$/) do
  choose_encounter_location
end

Then(/^user selects set to apply changes$/) do
  aa = EncounterFormData.instance
  expect(aa.perform_action("set visit", '')).to be_true
end

Then(/^user chooses to set a clinic appointments$/) do
  aa = EncounterFormData.instance
  expect(aa.perform_action("Clinic Appointments", '')).to be_true
end

Then(/^user chooses the first clinic appointment$/) do
  aa = EncounterFormData.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { clinic_appointments_grid_loaded }
  expect(aa.perform_action("First Clinic Appointment", '')).to be_true
end

def clinic_appointments_grid_loaded
  return TestSupport.driver.find_elements(:css, '#selectableTableAppointments .table-row').length > 0
rescue => e
  p e
  false
end

Then(/^user chooses to set a hospital admissions$/) do
  aa = EncounterFormData.instance
  expect(aa.perform_action("Hospital Admissions", '')).to be_true
end

Then(/^user chooses the first hospital admission$/) do
  aa = EncounterFormData.instance
  expect(aa.perform_action("First Hospital Admission", '')).to be_true
end

Then(/^new hospital admission encounter is set$/) do
  aa = EncounterFormData.instance
  expect(aa.perform_verification("Encounter Location", "7A Gen Med")).to be_true
end

Then(/^user selects and sets new encounter$/) do
  aa = EncounterFormData.instance
  expect(aa.wait_until_action_element_visible("Set Encounter Section", DefaultLogin.wait_time)).to be_true
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  expect(aa.perform_action("Set Encounter Section", '')).to be_true
  wait.until { aa.get_element("New Visit").displayed? }
  wait.until { aa.get_element("New Visit").enabled? }
  expect(aa.perform_action("New Visit", '')).to be_true
  choose_encounter_location
  expect(aa.perform_action("set visit", '')).to be_true
  expect(aa.wait_until_action_element_visible("Growl Alert", DefaultLogin.wait_time)).to be_true
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { element_is_not_present?(:css, 'div.growl-alert') }
  expect(aa.perform_verification("Encounter Location", "Cardiology")).to be_true
end

Then(/^Change Current Encounter Modal is displayed$/) do
  aa = EncounterFormData.instance
  expect(aa.perform_verification('Select Encounter Location title', 'SELECT ENCOUNTER LOCATION')).to eq(true)
end
