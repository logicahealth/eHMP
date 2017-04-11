path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'all_applets.rb'

class ImmunizationWriteBack < AllApplets
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Immunization Add Button"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=immunizations] .applet-add-button"))
    add_action(CucumberLabel.new("Available Lab Test search input"), SendKeysAction.new, AccessHtmlElement.new(:css, "#availableLabTests"))
    add_action(CucumberLabel.new("Select Lab Test"), SendKeysAction.new, AccessHtmlElement.new(:css, ".tt-suggestions.tt-suggestion:nth-child(2)"))
    add_verify(CucumberLabel.new("Add Immunization Modal Title"), VerifyText.new, AccessHtmlElement.new(:css, '#main-workflow-label-Enter-Immunization'))
    add_verify(CucumberLabel.new("Modal Loaded"), VerifyText.new, AccessHtmlElement.new(:css, ".modal-content"))
    add_verify(CucumberLabel.new("Growl Alert"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".notify-message"))
    add_verify(CucumberLabel.new("Verify add immunization"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-infobutton='MUMPS']"))
    
    #Labels
    add_verify(CucumberLabel.new("choose an option"), VerifyText.new, AccessHtmlElement.new(:xpath, "//div[contains(@class, 'administeredHistorical')]/descendant::p[contains(string(), 'Choose an option')]"))
    add_verify(CucumberLabel.new("administered"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='administeredHistorical-administered']"))
    add_verify(CucumberLabel.new("historical"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='administeredHistorical-historical']"))
    add_verify(CucumberLabel.new("select an immunization type"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='immunizationType']"))
    add_verify(CucumberLabel.new("information source"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='informationSource']"))
    add_verify(CucumberLabel.new("lot number"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='lotNumberHistorical']"))
    add_verify(CucumberLabel.new("expiration date"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='expirationDateHistorical']"))
    add_verify(CucumberLabel.new("manufacturer"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='manufacturerHistorical']"))
    add_verify(CucumberLabel.new("administration date"), VerifyText.new, AccessHtmlElement.new(:css, ".administrationDate"))
    add_verify(CucumberLabel.new("administered by"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='administeredBy']"))
    add_verify(CucumberLabel.new("administered location"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='administeredLocation']"))
    add_verify(CucumberLabel.new("ordering provider"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='orderedByAdministered']"))
    add_verify(CucumberLabel.new("route of administration"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='routeOfAdministration']"))
    add_verify(CucumberLabel.new("anatomic location"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='anatomicLocation']"))
    add_verify(CucumberLabel.new("dosage/unit"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='dosage']"))
    add_verify(CucumberLabel.new("series"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='series']"))
    add_verify(CucumberLabel.new("comments"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='comments']"))
       
    #buttons
    add_action(CucumberLabel.new("Add"), ClickAction.new, AccessHtmlElement.new(:css, ".modal-footer .addBtn"))
    add_action(CucumberLabel.new("Disabled Add"), ClickAction.new, AccessHtmlElement.new(:css, ".modal-footer .addBtn [disabled]"))
    add_action(CucumberLabel.new("Cancel"), ClickAction.new, AccessHtmlElement.new(:css, ".immunizationsConfirmCancel button[data-original-title='Warning']"))
      
    #form fields
    add_action(CucumberLabel.new("administered radio button"), ClickAction.new, AccessHtmlElement.new(:css, "#administeredHistorical-administered"))
    add_action(CucumberLabel.new("historical radio button"), ClickAction.new, AccessHtmlElement.new(:css, "#administeredHistorical-historical"))
    add_action(CucumberLabel.new("select an immunization type drop down"), ClickAction.new, AccessHtmlElement.new(:css, "#immunizationType"))
    add_action(CucumberLabel.new("select an immunization type drop down2"), ClickAction.new, AccessHtmlElement.new(:css, "[aria-labelledby='select2-immunizationType-container']"))
    add_action(CucumberLabel.new("select an immunization type input box"), SendKeysAction.new, AccessHtmlElement.new(:css, ".select2-search__field"))
    add_action(CucumberLabel.new("information source drop down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "#informationSource"))
    add_action(CucumberLabel.new("lot number drop down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "#lotNumberAdministered"))
    add_action(CucumberLabel.new("route drop down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "#routeOfAdministration"))
    add_action(CucumberLabel.new("anatomic location drop down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "#anatomicLocation"))
    add_action(CucumberLabel.new("lot number input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#lotNumberHistorical"))
    add_action(CucumberLabel.new("expiration date input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#expirationDateHistorical"))
    add_action(CucumberLabel.new("manufacturer input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#manufacturerHistorical"))
    add_action(CucumberLabel.new("administration date input box"), SendKeysAction.new, AccessHtmlElement.new(:css, ".administrationDate p:nth-of-type(2)"))
    add_action(CucumberLabel.new("historical admin date input"), SendKeysAndTabAction.new, AccessHtmlElement.new(:css, "#administrationDateHistorical"))
    add_action(CucumberLabel.new("administered by input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#administeredBy"))
    add_action(CucumberLabel.new("administered location input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#administeredLocation"))
    add_action(CucumberLabel.new("ordering provider input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#orderedByAdministered"))
    add_action(CucumberLabel.new("route of administration drop down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "#routeOfAdministration"))
    add_action(CucumberLabel.new("anatomic location drop down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "#anatomicLocation"))
    add_action(CucumberLabel.new("dosage/unit input box"), SendKeysAndTabAction.new, AccessHtmlElement.new(:css, "#dosage"))
    add_action(CucumberLabel.new("series drop down"), ComboSelectAction.new, AccessHtmlElement.new(:css, "#series"))
    add_action(CucumberLabel.new("comment input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#comments"))
  end
end 

class AdministeredImmunizationWriteBack < ImmunizationWriteBack
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("VIS"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='informationStatement']"))
    add_verify(CucumberLabel.new("VIS Date Offered"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='visDateOffered']"))

    add_action(CucumberLabel.new("VIS input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#informationStatement"))
    add_action(CucumberLabel.new("VIS Date Offered input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#visDateOffered"))
  end
end

def verify_immunization_modal_details(table, modal = ImmunizationWriteBack.instance)
  table.rows.each do | row |
    modal.wait_until_action_element_visible(row[0])
    expect(modal.am_i_visible?(row[0])).to eq(true), "Immunization label '#{row[0]}' is not visible"
  end
end

Then(/^user adds a new immunization$/) do
  aa = ImmunizationWriteBack.instance
  refresh_page = true
  begin
    expect(aa.perform_action("Immunization Add Button")).to eq(true)
    # expect(aa.wait_until_action_element_visible("Modal Loaded", DefaultLogin.wait_time)).to be_true
    @ehmp = PobCommonElements.new
    @ehmp.wait_until_fld_modal_body_visible
  rescue
    if refresh_page
      p 'refreshing the page'
      refresh_page = false
      PobCoverSheet.new.load
      step "Cover Sheet is active"
      retry
    else
      raise
    end
  end
end

Then(/^add immunization modal detail title says "([^"]*)"$/) do |modal_title|
  aa = ImmunizationWriteBack.instance
  expect(aa.perform_verification("Add Immunization Modal Title", modal_title)).to eq(true)
end

Then(/^the add immunization detail modal displays labels$/) do |table|
  verify_immunization_modal_details(table)
end

Then(/^the add immunization detail modal has "([^"]*)" and "([^"]*)" buttons$/) do |accept_btn, cancel_btn|
  aa = ImmunizationWriteBack.instance
  expect(aa.get_element(accept_btn).displayed?).to eq(true)
  expect(aa.get_element('Disabled Add').displayed?).to eq(true)
  expect(aa.am_i_visible?(cancel_btn)).to eq(true)
end

Then(/^add immunization detail modal displays enabled fields$/) do |table|
  verify_immunization_modal_details(table)
end

Then(/^add immunization detail modal displays disabled fields$/) do |table|
  aa = ImmunizationWriteBack.instance
  # expect(aa.wait_until_action_element_visible("Modal Loaded", DefaultLogin.wait_time)).to be_true
  table.rows.each do | row |
    p row[0]
    expect(aa.get_element(row[0]).displayed?).to eq(true), "Immunization form field '#{row[0]}' is not displayed"
    expect(aa.get_element(row[0]).enabled?).to eq(false), "Immunization form field '#{row[0]}' is enabled"
  end
end

When(/^the add immunization administered detail modal displays labels$/) do |table|
  verify_immunization_modal_details(table, AdministeredImmunizationWriteBack.instance)
end

When(/^add immunization administered detail modal displays disabled fields$/) do |table|
  aa = AdministeredImmunizationWriteBack.instance
  expect(aa.wait_until_action_element_visible("Modal Loaded", DefaultLogin.wait_time)).to be_true
  table.rows.each do | row |
    #p row[0]
    expect(aa.get_element(row[0]).displayed?).to eq(true), "Immunization form field '#{row[0]}' is not displayed"
    expect(aa.get_element(row[0]).enabled?).to eq(false), "Immunization form field '#{row[0]}' is enabled"
  end
end

Then(/^the user adds the immunization "([^"]*)"$/) do |immunization_type|
  aa = ImmunizationWriteBack.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  wait.until { aa.am_i_visible?("historical radio button") }
  expect(aa.perform_action("historical radio button")).to eq(true)
  wait = Selenium::WebDriver::Wait.new(:timeout => 30) 

  TestSupport.driver.execute_script("$('select#immunizationType').select2('open');")
  expect(aa.perform_action("select an immunization type input box", immunization_type)).to eq(true)
  aa.add_action(CucumberLabel.new("select an immunization"), ClickAction.new, AccessHtmlElement.new(:xpath, "//li[contains(@class, 'select2-results__option') and contains(string(), '#{immunization_type}')]"))
  expect(aa.perform_action("select an immunization")).to eq(true)

  expect(aa.perform_action("information source drop down", "From Birth Certificate")).to eq(true)
  expect(aa.perform_action("historical admin date input", "01/01/2010")).to eq(true)
  expect(aa.perform_action("Add")).to eq(true)
  expect(aa.wait_until_action_element_visible("Growl Alert", 60)).to be_true
  expect(aa.perform_verification("Growl Alert", "Immunization Added")).to be_true
  wait.until { element_is_not_present?(:css, 'div.growl-alert') }
end

Then(/^the user adds the administered immunization "([^"]*)"$/) do |immunization_type|
  aa = ImmunizationWriteBack.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  wait.until { aa.am_i_visible?("administered radio button") }
  expect(aa.perform_action("administered radio button")).to eq(true)
  wait = Selenium::WebDriver::Wait.new(:timeout => 30) 

  TestSupport.driver.execute_script("$('select#immunizationType').select2('open');")
  expect(aa.perform_action("select an immunization type input box", immunization_type)).to eq(true)
  aa.add_action(CucumberLabel.new("select an immunization"), ClickAction.new, AccessHtmlElement.new(:xpath, "//li[contains(@class, 'select2-results__option') and contains(string(), '#{immunization_type}')]"))
  expect(aa.perform_action("select an immunization")).to eq(true)

  expect(aa.perform_action("lot number drop down", "I90FV")).to eq(true)
  expect(aa.perform_action("route drop down", "INTRAMUSCULAR")).to eq(true)
  expect(aa.perform_action("anatomic location drop down", "LEFT ARM")).to eq(true)
  expect(aa.perform_action("dosage/unit input box", "150")).to eq(true)
  
  expect(aa.perform_action("Add")).to eq(true)
  expect(aa.wait_until_action_element_visible("Growl Alert", 60)).to be_true
  expect(aa.perform_verification("Growl Alert", "Immunization Added")).to be_true
  wait.until { element_is_not_present?(:css, 'div.growl-alert') }
end

When(/^verifies the above "([^"]*)" immunization is added to patient record$/) do |immunization_type|
  aa = ImmunizationWriteBack.instance
  expect(aa.perform_verification("Verify add immunization", immunization_type)).to be_true
end

When(/^the user chooses an Administered Immunization$/) do
  aa = AdministeredImmunizationWriteBack.instance
  expect(aa.perform_action('administered radio button')).to eq(true)
end

When(/^the user chooses an Historical Immunization$/) do
  aa = AdministeredImmunizationWriteBack.instance
  expect(aa.perform_action('historical radio button')).to eq(true)
end

When(/^the user searches for immunization "([^"]*)"$/) do |arg1|
  aa = ImmunizationWriteBack.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  #wait.until { aa.am_i_visible?("select an immunization type drop down2") }
  #expect(aa.perform_action("select an immunization type drop down2")).to eq(true) unless aa.am_i_visible? "select an immunization type input box"
  #TestSupport.driver.execute_script("$.fx.off = true;")
  TestSupport.driver.execute_script("$('select#immunizationType').select2('open');")
  expect(aa.perform_action("select an immunization type input box", arg1)).to eq(true)
end

Then(/^the immunization suggestion list displays "([^"]*)"$/) do |arg1|
  aa = ImmunizationWriteBack.instance
  aa.add_verify(CucumberLabel.new("select an immunization"), VerifyText.new, AccessHtmlElement.new(:xpath, "//li[contains(@class, 'select2-results__option') and contains(string(), '#{arg1}')]"))
  expect(aa.perform_verification("select an immunization", arg1)).to eq(true)
end

Then(/^the Immunization applet contains (\d+) row with vaccine name "([^"]*)"$/) do |arg1, arg2|
  aa = ImmunizationWriteBack.instance
  driver = TestSupport.driver
  rows = driver.find_elements(:xpath, "//table[@id='data-grid-immunizations']/descendant::td[contains(string(), '#{arg2}')]")
  expect(rows.length).to eq(arg1.to_i)
end
