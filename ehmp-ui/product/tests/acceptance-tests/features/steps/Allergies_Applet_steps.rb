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
    add_toolbar_buttons

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
    #add_action(CucumberLabel.new('First Allergies Row'), ClickAction.new, AccessHtmlElement.new(:css, "#data-grid-allergy_grid tbody tr.selectable:nth-child(1) td:nth-child(1)"))
    add_action(CucumberLabel.new('First Allergies Row'), ClickAction.new, AccessHtmlElement.new(:css, "#data-grid-allergy_grid tbody [data-infobutton='CHOCOLATE']"))
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
    #add_action(CucumberLabel.new('Detail View Button'), ClickAction.new, AccessHtmlElement.new(:css, '[button-type=detailView-button-toolbar]'))
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

And(/^The applet "(.*?)" on the coversheet page has been displayed$/) do |title|
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_fld_applet_title
  expect(@ehmp.fld_applet_title.text.upcase).to include(title)
end

And(/^Applet ALLERGIES expanded view have the below table header$/) do |table|
  @ehmp = PobAllergiesApplet.new
  @ehmp.btn_applet_expand_view.click
  @ehmp.wait_for_fld_expanded_applet_thead
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.fld_expanded_applet_thead, "#{headers[0]}")).to eq(true), "The value: <#{headers[0]}> is not present in the table header"
  end

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

When(/^user sorts the Expanded Allergies Applet by the Standardized Allergen$/) do
  ehmp = PobAllergiesApplet.new
  ehmp.wait_for_expanded_header_standardized_allergen
  expect(ehmp).to have_expanded_header_standardized_allergen
  ehmp.expanded_header_standardized_allergen.click
end

Then(/^the Allergies Applet is sorted in alphabetic order based on Standardized Allergen$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_expanded_allergy_column_s_allergen
  column_values = @ehmp.expanded_allergy_column_s_allergen
  expect(column_values.length).to be > 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

When(/^user sorts the Expanded Allergies Applet by the Allergen Name$/) do
  ehmp = PobAllergiesApplet.new
  ehmp.wait_for_expanded_header_allergen_name
  expect(ehmp).to have_expanded_header_allergen_name
  ehmp.expanded_header_allergen_name.click
end

Then(/^the Allergies Applet is sorted in alphabetic order based on Allergen Name$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_expanded_allergy_column_allergen_names
  column_values = @ehmp.expanded_allergy_column_allergen_names
  expect(column_values.length).to be > 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order, #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

When(/^the user expands the Allergies Applet$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  aa = AllergiesApplet.instance
  expect(aa.perform_action('Control - applet - Expand View')).to be_true
  expect(aa.wait_until_action_element_visible("Title", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification("Title", 'ALLERGIES')).to be_true
  wait.until {  aa.applet_grid_loaded }
end

Then(/^the Allergy Detail modal displays$/) do |table|
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_btn_close_modal
  expect(@ehmp).to have_btn_close_modal
  table.rows.each do | row |
    expect(@ehmp.fld_modal_body.text.downcase.include? "#{row[0]}").to eq(true), "the field <#{row[0]}> is not present"
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
  expect(aa.perform_action('Detail View Button')).to eq(true), "Could not select toolbar detail icon"
end

Then(/^the Allergies expand Applet contains buttons Refresh, Help and Minimize$/) do
  ehmp = PobAllergiesApplet.new
  ehmp.wait_for_btn_applet_refresh
  ehmp.wait_for_btn_applet_help
  ehmp.wait_for_btn_applet_minimize

  expect(ehmp).to have_btn_applet_refresh
  expect(ehmp).to have_btn_applet_help
  expect(ehmp).to have_btn_applet_minimize
end

Then(/^the Allergies expand Applet does not contain buttons Filter Toggle or Expand$/) do
  ehmp = PobAllergiesApplet.new
  ehmp.wait_for_btn_applet_filter_toggle
  expect(ehmp).to_not have_btn_applet_filter_toggle
  expect(ehmp).to_not have_btn_applet_expand_view
end
