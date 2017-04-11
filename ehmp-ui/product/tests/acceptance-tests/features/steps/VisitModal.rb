#require 'AccessBrowserV2.rb'
path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

class Visit < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Clinic Appointments"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#visitModal ul.nav-tabs a[href='#appts']"))
    add_verify(CucumberLabel.new("Hospital Admissions"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#visitModal ul.nav-tabs a[href='#admits']"))
    add_verify(CucumberLabel.new("New Visit"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#visitModal ul.nav-tabs a[href='#new-visit']"))
    add_verify(CucumberLabel.new("Top Region"), VerifyContainsText.new, AccessHtmlElement.new(:id, "top-region"))
    add_action(CucumberLabel.new("Select Visit"), ClickAction.new, AccessHtmlElement.new(:id, "visitSelectBtn"))
    add_verify(CucumberLabel.new("Cancel_Visit"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@id='visitCancelBtn']"))
    #add_verify(CucumberLabel.new("Modal Title"), VerifyContainsText.new, AccessHtmlElement.new(:id, "mainModalLabel"))

    add_verify(CucumberLabel.new("Confirm"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@id='setVisitBtn']"))
    add_verify(CucumberLabel.new("Encounter Location"), VerifyContainsText.new, AccessHtmlElement.new(:id, "selectedInfo"))
    add_action(CucumberLabel.new("Hospital Admissions"), ClickAction.new, AccessHtmlElement.new(:id, "visit-tab-admits"))
    add_action(CucumberLabel.new("New Visit"), ClickAction.new, AccessHtmlElement.new(:id, "visit-tab-new"))
    #add_action(CucumberLabel.new("DIABETIC"), ClickAction.new, AccessHtmlElement.new(:id, ""))
    add_action(CucumberLabel.new("DIABETIC"), ClickAction.new, AccessHtmlElement.new(:css, '#location-typeahead-list li[data-name="DIABETIC"]')) #from the drop down list
    #add_action(CucumberLabel.new("Hypertension (ICD-9-CM 401.9)"), ClickAction.new, AccessHtmlElement.new(:css, '#problem-typeahead-list li[data-name="Hypertension (ICD-9-CM 401.9)"]'))
    #add_verify(CucumberLabel.new("DIABETIC"), VerifyContainsText.new, AccessHtmlElement.new(:id, "location"))
    add_verify(CucumberLabel.new("HistoricalVisitText"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".col-sm-10>p"))
    add_verify(CucumberLabel.new("DateText"), VerifyContainsText.new, AccessHtmlElement.new(:id, "dp-visit"))
    add_action(CucumberLabel.new("Visit Location"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "location"))
    #add_action(CucumberLabel.new("Visit Location"), ClickAction.new, AccessHtmlElement.new(:id, "location"))
    #VisitInformation tab
    add_action(CucumberLabel.new("Visit Information"), ClickAction.new, AccessHtmlElement.new(:id, "setVisitContextBtn"))
    add_action(CucumberLabel.new("Care Team Information"), ClickAction.new, AccessHtmlElement.new(:xpath, "/html/body/div[2]/div/div[2]/div/div/div/div[4]/div[1]/div/div[1]"))
    add_verify(CucumberLabel.new("Change Visit"), VerifyContainsText.new, AccessHtmlElement.new(:id, "setVisitContextBtn"))
    #add_action(CucumberLabel.new("VisitInformation"), ClickAction.new, AccessHtmlElement.new(:css, ".col-md-6>h6"))
    add_action(CucumberLabel.new("Change Visit"), ClickAction.new, AccessHtmlElement.new(:id, "setVisitContextBtn"))
    add_action(CucumberLabel.new("Confirm"), ClickAction.new, AccessHtmlElement.new(:id, "setVisitBtn"))
    add_action(CucumberLabel.new("Clinic Appointments"), ClickAction.new, AccessHtmlElement.new(:css, "#visitModal ul.nav-tabs a[href='#appts']"))
    # Date and time
    add_verify(CucumberLabel.new("Datevalue"), VerifyContainsText.new, AccessHtmlElement.new(:id, "dp-visit"))
    add_verify(CucumberLabel.new("Timevalue"), VerifyContainsText.new, AccessHtmlElement.new(:id, "tp-visit"))
    #add_action(CucumberLabel.new("DatevalueClick"), ClickAction.new, AccessHtmlElement.new(:id, "dp-visit"))
    #add_action(CucumberLabel.new("Datevalue"), SendKeysAction.new, AccessHtmlElement.new(:id, "dp-visit"))
    add_action(CucumberLabel.new("DatevalueWrite"), ClickAndSendKeysAction.new, AccessHtmlElement.new(:id, "dp-visit"))  
    add_verify(CucumberLabel.new("ErrorText"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#date-error")) 
    #RemoveProblem
    #Remove Problem
    add_action(CucumberLabel.new("Remove"), ClickAction.new, AccessHtmlElement.new(:id, "deleteBtn"))
    add_action(CucumberLabel.new("Cancel"), ClickAction.new, AccessHtmlElement.new(:id, "cancelBtn")) 
  end 
end

When(/^the user clicks button "(.*?)"$/) do |element|
  con = Visit.instance
  #con.wait_until_action_element_visible(element, 60)
  #expect(con.static_dom_element_exists?(element)).to be_true
  expect(con.perform_action(element)).to be_true
end

Then(/^the modal contains buttons "(.*?)" and "(.*?)"$/) do |btn1, _btn2|
  con = Visit.instance
  expect(con.perform_verification("Cancel_Visit", btn1)).to be_true
  #con.perform_verification("Confirm", btn2)
end

When(/^the user Clicks on "(.*?)"$/) do |arg1|
  Visit.instance.perform_action(arg1)
end

#@US2215_NewVisitTab
When(/^the user clicks on "(.*?)" tab$/) do |arg1|
  con = Visit.instance
  expect(con.static_dom_element_exists?(arg1)).to be_true
  expect(con.perform_action(arg1)).to be_true
end

Then(/^"(.*?)" should be populated in Encounter Location field$/) do |selected_item|
  con = Visit.instance
  expect(con.perform_verification("Encounter Location", selected_item)).to be_true
end

Then(/^if user is provider then it displays in Encounter Provider field$/) do
  user = "USER,PANORAMA"
  con = Visit.instance
  driver = TestSupport.driver
  value = driver.find_element(:xpath, "//*[@id='provider']").attribute('value')
  puts "value is: #{value}"
  expect(value).to eq(user)
end
