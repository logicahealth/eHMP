path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'all_applets.rb'

class AllergiesApplet < AllApplets
  include Singleton
  def initialize
    super 
    appletid_css = "[data-appletid=allergy_grid]"
    add_applet_buttons appletid_css
    add_applet_title appletid_css
    add_verify(CucumberLabel.new("AllergiesGridVisible"), VerifyText.new, AccessHtmlElement.new(:id, "allergy_grid-pill-gist-items"))
    add_verify(CucumberLabel.new("Allergy Details"), VerifyContainsText.new, AccessHtmlElement.new(:id, 'grid-panel-allergy_grid'))
    add_action(CucumberLabel.new("ERYTHROMYCIN"), ClickAction.new, AccessHtmlElement.new(:xpath, "//span[contains(string(),'ERYTHROMYCIN')]/parent::div"))
    add_action(CucumberLabel.new("Tetracyclines"), ClickAction.new, AccessHtmlElement.new(:xpath, "//span[contains(string(),'Tetracyclines')]/parent::div"))
    @@allergies_applet_data_grid_rows = AccessHtmlElement.new(:xpath, "//table[@id='data-grid-allergy_grid']/descendant::tr")
    add_verify(CucumberLabel.new("Number of Allergies Applet Rows"), VerifyXpathCount.new(@@allergies_applet_data_grid_rows), @@allergies_applet_data_grid_rows)
    add_action(CucumberLabel.new("Standardized Allergen"), ClickAction.new, AccessHtmlElement.new(:css, "[data-header-instanceid='allergy_grid-standardizedName'] a"))
    add_action(CucumberLabel.new("Allergen Name"), ClickAction.new, AccessHtmlElement.new(:css, "[data-header-instanceid='allergy_grid-summary'] a"))
   
    add_verify(CucumberLabel.new("Allergy Modal Details"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#modal-body > div"))

    add_action(CucumberLabel.new('Empty Allergy Row'), ClickAction.new, AccessHtmlElement.new(:css, '#data-grid-allergy_grid tr.empty'))
    add_action(CucumberLabel.new('Add'), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-add-button"))
    
    # First Allergies Row
    add_action(CucumberLabel.new('First Allergies Row'), ClickAction.new, AccessHtmlElement.new(:css, "#data-grid-allergy_grid tbody tr.selectable:nth-child(1)"))
    add_action(CucumberLabel.new('Allergy detail icon'), ClickAction.new, AccessHtmlElement.new(:css, "div.appletToolbar #info-button-sidekick-detailView"))
  
    #| Allergen Name | Standardized Allergen | Reaction | Severity | Drug Class | Entered By | Facility | |
    add_verify(CucumberLabel.new('Header - Allergen Name'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-header-instanceid='allergy_grid-summary'] a"))
    add_verify(CucumberLabel.new('Header - Standardized Allergen'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-header-instanceid='allergy_grid-standardizedName'] a"))
    add_verify(CucumberLabel.new('Header - Reaction'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-header-instanceid='allergy_grid-reaction'] a"))
    add_verify(CucumberLabel.new('Header - Severity'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-header-instanceid='allergy_grid-acuityName'] a"))
    add_verify(CucumberLabel.new('Header - Drug Class'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-header-instanceid='allergy_grid-drugClassesNames'] a"))
    add_verify(CucumberLabel.new('Header - Entered By'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-header-instanceid='allergy_grid-originatorName'] a"))
    add_verify(CucumberLabel.new('Header - Facility'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-header-instanceid='allergy_grid-facilityName'] a"))
    add_verify(CucumberLabel.new('Header - Comment'), VerifyTextNotEmpty.new(''), AccessHtmlElement.new(:css, "[data-header-instanceid='allergy_grid-comments']"))
  end

  def applet_grid_loaded
    p "empty?"
    return true if am_i_visible? 'Empty Allergy Row'
    p 'rows?'
    return TestSupport.driver.find_elements(:css, '#data-grid-allergy_grid tr.selectable').length > 0
  rescue => e 
    p e
    false
  end
end 

Then(/^user sees the allergy applet on the coversheet page$/) do
  aa = AllergiesApplet.instance
  expect(aa.wait_until_action_element_visible("Title", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification("Title", "ALLERGIES")).to be_true
end

Then(/^the Allergies Applet view contains$/) do |table|
  aa = AllergiesApplet.instance 
  # expect(aa.wait_until_action_element_visible("AllergiesGridVisible", DefaultLogin.wait_time)).to be_true    
  table.rows.each do |row|
    expect(aa.perform_verification('Allergy Details', row[0])).to be_true, "The value #{row[0]} is not present in the allergy details"
  end
end

When(/^the user clicks on the allergy pill "(.*?)"$/) do |vaccine_name|
  driver = TestSupport.driver
  aa = AllergiesApplet.instance
  expect(aa.perform_action(vaccine_name, "")).to be_true
  driver.find_element(:id, "info-button-sidekick-detailView").click
  expect(aa.wait_until_action_element_visible("Allergy Modal Details", DefaultLogin.wait_time)).to be_true
  TestSupport.wait_for_page_loaded
end

class AllergiesDetails < AccessBrowserV2
  include Singleton
  def initialize
    super   
    add_verify(CucumberLabel.new('title'), VerifyTextFormat.new(/Allergen - \w+/), AccessHtmlElement.new(:css, 'h4.modal-title'))
    add_verify(CucumberLabel.new('Severity'), VerifyText.new, AccessHtmlElement.new(:css, '[data-detail=allergySeverity]'))
    add_verify(CucumberLabel.new("Symptoms"), VerifyContainsText.new, AccessHtmlElement.new(:id, "modal-body"))
    add_verify(CucumberLabel.new("Entered By"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail=originatorName]"))
    add_verify(CucumberLabel.new("Nature of Reaction"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail=natureOfReaction]"))
    add_verify(CucumberLabel.new("Drug Classes"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail=drugClasses]"))
    add_verify(CucumberLabel.new("Originated"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail=originatedFormatted]"))
    add_verify(CucumberLabel.new("Observed/Historical"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail=observedOrHistorical]"))
    add_verify(CucumberLabel.new("Observed Date"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-detail=observedDate]"))
    add_verify(CucumberLabel.new("Verified"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail=verifierName]"))
    add_verify(CucumberLabel.new("Obs dates/severity"), VerifyText.new, AccessHtmlElement.new(:css, "#modal-body span.label-warning"))
    add_verify(CucumberLabel.new("Site"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-detail=facilityName]"))
    add_verify(CucumberLabel.new("Allergy Modal Details"), VerifyContainsText.new, AccessHtmlElement.new(:id, "modal-body"))
    add_verify(CucumberLabel.new("Comments"), VerifyContainsText.new, AccessHtmlElement.new(:id, "modal-body"))

    add_action(CucumberLabel.new('previous button'), ClickAction.new, AccessHtmlElement.new(:id, 'allergyGridPrevious'))
    add_action(CucumberLabel.new('next button'), ClickAction.new, AccessHtmlElement.new(:id, 'allergyGridNext'))
    add_action(CucumberLabel.new('close button'), ClickAction.new, AccessHtmlElement.new(:css, '.close'))
    add_action(CucumberLabel.new('Entered in Error'), ClickAction.new, AccessHtmlElement.new(:css, '.modal-footer #error'))
    add_verify(CucumberLabel.new('Edit Error'), VerifyText.new, AccessHtmlElement.new(:css, '.modal-footer label'))
  end
end 

Then(/^the allergy applet modal detail contains$/) do |table|
  aa = AllergiesDetails.instance
  
  table.rows.each do |row|
    expect(aa.perform_verification(row[0], row[1])).to be_true, "The value #{row[1]} for field #{row[0]} is not present in the allergy modal details"
  end
end

When(/^user sorts by the Standardized Allergen$/) do
  aa = AllergiesApplet.instance
  expect(aa.perform_action("Standardized Allergen", "")).to be_true
end

Then(/^the Allergies Applet is sorted in alphabetic order based on Standardized Allergen$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { VerifyTableValue.verify_alphabetic_sort_caseinsensitive('data-grid-allergy_grid', 2, true) }
end

When(/^user sorts by the Allergen Name$/) do
  aa = AllergiesApplet.instance
  expect(aa.perform_action("Allergen Name", "")).to be_true
end

Then(/^the Allergies Applet is sorted in alphabetic order based on Allergen Name$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { VerifyTableValue.verify_alphabetic_sort_caseinsensitive('data-grid-allergy_grid', 1, true) }
end

When(/^the user expands the Allergies Applet$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  aa = AllergiesApplet.instance
  expect(aa.perform_action('Control - applet - Expand View')).to be_true
  expect(aa.wait_until_action_element_visible("Title", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification("Title", 'ALLERGIES')).to be_true

  wait.until {  aa.applet_grid_loaded }
end

When(/^the user clicks the first allergy pill$/) do
  aa = AllergiesGist.instance
  expect(aa.wait_until_xpath_count_greater_than('Allergy Pills', 0)).to eq(true), "This test needs a least one visible allergy to verify"
  expect(aa.perform_action('First Pill')).to eq(true)
end

Then(/^the Allergy Detail modal displays$/) do |table|
  allergies_modal = AllergiesDetails.instance
  table.rows.each do | row |
    expect(allergies_modal.am_i_visible? row[0]).to eq(true), "#{row} is not visible on the modal"
  end
end

Then(/^the Allergy Detail modal displays either "([^"]*)" or "([^"]*)"$/) do |arg1, arg2|
  allergies_modal = AllergiesDetails.instance
  first = allergies_modal.am_i_visible? arg1
  second = (allergies_modal.am_i_visible? arg2) ? allergies_modal.perform_verification(arg2, 'Only data originating in your facility may be edited.') : false
  second = allergies_modal.perform_verification(arg2, 'Only data originating in your facility may be edited.')
  expect(first || second).to eq(true)
end

Then(/^the Allergy Applet table contains rows$/) do 
  aa = AllergiesApplet.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until {  aa.applet_grid_loaded }
end

When(/^the Allergies Applet expand view contains data rows$/) do
  compare_item_counts("#data-grid-allergy_grid tr")
end

When(/^the Allergies Applet contains data rows$/) do
  compare_item_counts("#allergy_grid-pill-gist-items .gist-item")
end

When(/^user refreshes Allergies Applet$/) do
  applet_refresh_action("allergy_grid")
end

Then(/^the message on the Allergies Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("allergy_grid", message_text)
end

Then(/^the expanded Allergies Applet is displayed$/) do
  aa = AllergiesApplet.instance
  expected_screen = 'Allergies'
  expect(aa.perform_verification('Screenname', "#{expected_screen}")).to eq(true), "Expected screenname to be #{expected_screen}"
  expect(aa.wait_until_action_element_visible("Title", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification("Title", 'ALLERGIES')).to be_true
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until {  aa.applet_grid_loaded }
end

Then(/^the Allergies Applet contains buttons$/) do |table|
  table.rows.each do | button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(@ag.am_i_visible? cucumber_label).to eq(true), "Could not find button #{button[0]}"
  end
end

Then(/^the Allergies Applet does not contain buttons$/) do |table|
  table.rows.each do | button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(@ag.am_i_visible? cucumber_label).to eq(false), "Applet should not have button #{button[0]}"
  end
end

Then(/^the Allergies expand Applet contains buttons$/) do |table|
  table.rows.each do | button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(@ag.am_i_visible? cucumber_label).to eq(true), "Could not find button #{button[0]}"
  end
end

Then(/^the Allergies expand Applet does not contain buttons$/) do |table|
  table.rows.each do | button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(@ag.am_i_visible? cucumber_label).to eq(false), "Applet should not have button #{button[0]}"
  end
end

Then(/^user notes number of reported allergies$/) do
  @num_allergy_pills = AllergiesGist.instance.pills.length
end

Then(/^the number of reported allergies is unchanged$/) do
  expect(AllergiesGist.instance.pills.length).to eq(@num_allergy_pills)
end

When(/^the user views the first Allergies detail view$/) do 
  aa = AllergiesApplet.instance
  expect(aa.wait_until_xpath_count_greater_than('Number of Allergies Applet Rows', 0)).to eq(true), "Test requires at least 1 row to be displayed"
  expect(aa.perform_action('First Allergies Row')).to eq(true), "Could not select first allery row"
  expect(aa.perform_action('Allergy detail icon')).to eq(true), "Could not select toolbar detail icon"
end

Then(/^the Allergy Applet table contains headers$/) do |table|
  aa = AllergiesApplet.instance
  table.headers.each do | row |
    header = row
    expect(aa.perform_verification("Header - #{header}", header)).to eq(true)
  end
end

