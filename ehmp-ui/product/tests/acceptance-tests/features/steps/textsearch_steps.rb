#require 'singleton'
#path = File.expand_path '..', __FILE__
#$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
#path = File.expand_path '../../../../shared-test-ruby', __FILE__
#$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

# All the HTML Elements the tests need to access in order to conduct text search
class TextSearchContainer < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Text Search Field"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "searchText"))
    add_action(CucumberLabel.new("Text Search"), SendKeysAction.new, AccessHtmlElement.new(:id, "searchText"))
    add_action(CucumberLabel.new("submit"), ClickAction.new, AccessHtmlElement.new(:id, "submit")) 
    add_action(CucumberLabel.new("Text Search Suggestion"), SendKeysAction.new, AccessHtmlElement.new(:id, "searchText")) 
    add_action(CucumberLabel.new("Suggestion List"), VerifyText.new, AccessHtmlElement.new(:id, "suggestList"))
    add_verify(CucumberLabel.new("Search Results"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:class, "search-results"))
    add_verify(CucumberLabel.new("Search Results Groups"), VerifyText.new, AccessHtmlElement.new(:css, ".btn.btn-accordion.all-padding-xs"))
    add_verify(CucumberLabel.new("No Results"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "noResults"))
    @@search_result_rows = AccessHtmlElement.new(:class, "search-results")
    add_verify(CucumberLabel.new("Number of Search Result Rows"), VerifyXpathCount.new(@@search_result_rows), @@search_result_rows)         
    add_verify(CucumberLabel.new("SearchResultMsg"), VerifyText.new, AccessHtmlElement.new(:id, "search-results-message"))
    add_verify(CucumberLabel.new("Search Result Count"), VerifyText.new, AccessHtmlElement.new(:class, "number-of-results"))
    add_verify(CucumberLabel.new("Result Count"), VerifyText.new, AccessHtmlElement.new(:xpath, "//*[starts-with(@class,'ResultCount')]"))
    @@count_action = AccessHtmlElement.new(:xpath, ".//*[@id='suggestList']/li")
    add_verify(CucumberLabel.new("suggestion count"), VerifyXpathCount.new(@@count_action), @@count_action)
    add_verify(CucumberLabel.new("Group Search Result"), VerifyText.new, AccessHtmlElement.new(:css, ".searchGroupTitle.panel-heading"))
    add_action(CucumberLabel.new("Control - Text Search - From Date"), SendKeysAction.new, AccessHtmlElement.new(:id, "fromDateText"))
    add_action(CucumberLabel.new("Control - Text Search - To Date"), SendKeysAction.new, AccessHtmlElement.new(:id, "toDateText"))
    add_action(CucumberLabel.new("Control - Text Search - Apply"), ClickAction.new, AccessHtmlElement.new(:id, "custom-range-apply"))
    ###### End of Date Control ## 
    
    add_action(CucumberLabel.new("Search Spinner"), ClickAction.new, AccessHtmlElement.new(:class, "search-spinner"))
      
    ## Search result deatail ####
    add_verify(CucumberLabel.new("Medication - ascorbic acid tab"), VerifyText.new, AccessHtmlElement.new(:id, "mainModalLabel"))
    add_verify(CucumberLabel.new("Vaccine - CHOLERA, ORAL (HISTORICAL)"), VerifyText.new, AccessHtmlElement.new(:id, "mainModalLabel"))
    add_verify(CucumberLabel.new("Allergen - PENICILLIN"), VerifyText.new, AccessHtmlElement.new(:id, "mainModalLabel"))
    add_verify(CucumberLabel.new("EYE DISORDERS"), VerifyText.new, AccessHtmlElement.new(:id, "mainModalLabel"))
    add_verify(CucumberLabel.new("HDL"), VerifyText.new, AccessHtmlElement.new(:id, "mainModalLabel"))
    add_verify(CucumberLabel.new("Headache"), VerifyText.new, AccessHtmlElement.new(:id, "mainModalLabel"))
    add_verify(CucumberLabel.new("Snippest"), VerifyContainsText.new, AccessHtmlElement.new(:id, "ResultHighlightssubgroupItem0"))
    add_verify(CucumberLabel.new("Rad Order Status"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-detail='status']"))
    add_verify(CucumberLabel.new("Lab Order Status"), VerifyText.new, AccessHtmlElement.new(:xpath, "//*[@id='modal-body']/descendant::div/div[9]/div[2]"))
      
    add_verify(CucumberLabel.new("Modal Detail Content"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".detail-modal-content"))         
  end
end

class TextSearchContainerDrillDown < AccessBrowserV2
  include Singleton
  def initialize
    super
    
    ## search result drill down ###
    add_action(CucumberLabel.new("Medication, Outpatient"), ClickAction.new, AccessHtmlElement.new(:id, "result-group-title-MedicationOutpatient"))
    add_action(CucumberLabel.new("Immunization"), ClickAction.new, AccessHtmlElement.new(:id, "result-group-title-Immunization"))
    add_action(CucumberLabel.new("Allergy/Adverse Reaction"), ClickAction.new, AccessHtmlElement.new(:id, "result-group-title-AllergyAdverseReaction"))
    add_action(CucumberLabel.new("Laboratory"), ClickAction.new, AccessHtmlElement.new(:id, "result-group-title-Laboratory"))
    add_action(CucumberLabel.new("Problem"), ClickAction.new, AccessHtmlElement.new(:id, "result-group-title-Problem"))
    add_action(CucumberLabel.new("Radiology Report"), ClickAction.new, AccessHtmlElement.new(:id, "result-group-title-RadiologyReport"))
    add_action(CucumberLabel.new("Progress Note"), ClickAction.new, AccessHtmlElement.new(:id, "result-group-title-ProgressNote"))
    add_action(CucumberLabel.new("Administrative Note"), ClickAction.new, AccessHtmlElement.new(:id, "result-group-title-AdministrativeNote"))
    add_action(CucumberLabel.new("Advance Directive"), ClickAction.new, AccessHtmlElement.new(:id, "result-group-title-AdvanceDirective"))
    add_action(CucumberLabel.new("Clinical Procedure"), ClickAction.new, AccessHtmlElement.new(:id, "result-group-title-ClinicalProcedure"))
    add_action(CucumberLabel.new("Consult Report"), ClickAction.new, AccessHtmlElement.new(:id, "result-group-title-ConsultReport"))
    add_action(CucumberLabel.new("Consultation Note"), ClickAction.new, AccessHtmlElement.new(:id, "result-group-title-ConsultationNoteProviderDocument"))
    add_action(CucumberLabel.new("Crisis Note"), ClickAction.new, AccessHtmlElement.new(:id, "result-group-title-CrisisNote"))
    add_action(CucumberLabel.new("Discharge Summary"), ClickAction.new, AccessHtmlElement.new(:id, "result-group-title-DischargeSummary"))
    add_action(CucumberLabel.new("Laboratory Report"), ClickAction.new, AccessHtmlElement.new(:id, "result-group-title-LaboratoryReport"))
    add_action(CucumberLabel.new("Radiology Report"), ClickAction.new, AccessHtmlElement.new(:id, "result-group-title-RadiologyReport"))
    add_action(CucumberLabel.new("Surgery Report"), ClickAction.new, AccessHtmlElement.new(:id, "result-group-title-SurgeryReport"))
    add_action(CucumberLabel.new("General Medicine Note"), ClickAction.new, AccessHtmlElement.new(:id, "result-subGroup-title-GENERALMEDICINENOTE-1"))
    add_action(CucumberLabel.new("Diabetes"), ClickAction.new, AccessHtmlElement.new(:id, "result-subGroup-title-DIABETES-1"))
    add_action(CucumberLabel.new("Administrative Note2"), ClickAction.new, AccessHtmlElement.new(:id, "result-subGroup-title-AdministrativeNote-1"))
    add_action(CucumberLabel.new("Advance Directive2"), ClickAction.new, AccessHtmlElement.new(:id, "result-subGroup-title-ADVANCEDIRECTIVE-1"))
    add_action(CucumberLabel.new("Col"), ClickAction.new, AccessHtmlElement.new(:id, "result-subGroup-title-COL-1"))
    add_action(CucumberLabel.new("Audiology Hearing Loss Consult"), ClickAction.new, AccessHtmlElement.new(:id, "result-subGroup-title-AUDIOLOGYHEARINGLOSSCONSULT-1"))
    add_action(CucumberLabel.new("Consultation Note Document"), ClickAction.new, AccessHtmlElement.new(:id, "result-subGroup-title-ConsultationNoteProviderDocument-1"))
    add_action(CucumberLabel.new("Crisis Note subgroup"), ClickAction.new, AccessHtmlElement.new(:id, "result-subGroup-title-CRISISNOTE-1"))
    add_action(CucumberLabel.new("Discharge Summary subgroup"), ClickAction.new, AccessHtmlElement.new(:id, "result-subGroup-title-DischargeSummary-1"))
    add_action(CucumberLabel.new("LR ELECTRON MICROSCOPY REPORT"), ClickAction.new, AccessHtmlElement.new(:id, "result-subGroup-title-LRELECTRONMICROSCOPYREPORT-1"))
    add_action(CucumberLabel.new("ANKLE 2 VIEWS"), ClickAction.new, AccessHtmlElement.new(:id, "result-subGroup-title-ANKLE2VIEWS-1"))
    add_action(CucumberLabel.new("ANESTHESIA REPORT"), ClickAction.new, AccessHtmlElement.new(:id, "result-subGroup-title-ANESTHESIAREPORT-1"))
    add_action(CucumberLabel.new("Sub Group List"), ClickAction.new, AccessHtmlElement.new(:css, ".search-results .subgroupItem .row .col-xs-4")) 
    add_action(CucumberLabel.new("Penicillin"), ClickAction.new, AccessHtmlElement.new(:css, "#result-group-AllergyAdverseReaction .topLevelItem:nth-child(4) .row .col-xs-4:nth-child(1)"))
    add_action(CucumberLabel.new("Headache"), ClickAction.new, AccessHtmlElement.new(:xpath, "//div[contains(@class,'searchResultItem')]/descendant::div[contains(string(),'Headache')]"))
    add_action(CucumberLabel.new("Cholera"), ClickAction.new, AccessHtmlElement.new(:xpath, "//strong[contains(text(),'CHOLERA')]"))
    #add_action(CucumberLabel.new("Urinalysis"), ClickAction.new, AccessHtmlElement.new(:xpath, "//div[contains(@class,'searchResultItem')]/descendant::div[contains(string(),'URINALYSIS')]"))
    add_action(CucumberLabel.new("Urinalysis"), ClickAction.new, AccessHtmlElement.new(:xpath, "//div[@data-uid='urn:va:order:9E7A:229:8856'] "))
    add_action(CucumberLabel.new("Knee"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='result-group-RadiologyReport']/div/div[6]"))    
    add_action(CucumberLabel.new("HDL"), ClickAction.new, AccessHtmlElement.new(:xpath, "//div[contains(@class,'searchResultItem')]/descendant::div[contains(string(),'HDL')]"))
    add_action(CucumberLabel.new("Ascorbic Acid"), ClickAction.new, AccessHtmlElement.new(:xpath, "//div[contains(@class,'searchResultItem')]/descendant::div[contains(string(),'ASCORBIC')]"))
    add_action(CucumberLabel.new("Allergies"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='result-subGroup-DIABETES-1']/div/div[2]"))
    add_action(CucumberLabel.new("bundle branch block"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='result-subGroup-DIABETES-1']/div/div[2]"))
    add_action(CucumberLabel.new("Chocolate"), ClickAction.new, AccessHtmlElement.new(:xpath, "//mark[contains(text(),'CHOCOLATE')]"))

    add_action(CucumberLabel.new("HIP 2 OR MORE VIEWS"), ClickAction.new, AccessHtmlElement.new(:css, "[data-uid='urn:va:document:9E7A:229:7059168.8441-1']"))
    add_action(CucumberLabel.new("Imaging"), ClickAction.new, AccessHtmlElement.new(:id, 'result-group-title-Imaging'))
    add_action(CucumberLabel.new("RADIOLOGIC EXAMINATION, KNEE; 1 OR 2 VIEWS"), ClickAction.new, AccessHtmlElement.new(:css, "[data-uid='urn:va:image:9E7A:229:7059382.8389-1']"))
  end
end

class TextSearchSpecificSubgroups < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new('GENERAL MEDICINE NOTE'), VerifyText.new, AccessHtmlElement.new(:id, 'result-subGroup-title-GENERALMEDICINENOTE-1'))
    add_verify(CucumberLabel.new('DIABETES'), VerifyText.new, AccessHtmlElement.new(:id, 'result-subGroup-title-DIABETES-1'))
    add_verify(CucumberLabel.new('CAMPER84'), VerifyText.new, AccessHtmlElement.new(:id, 'result-subGroup-title-CAMPER84-1'))
    add_verify(CucumberLabel.new('CAMPER02'), VerifyText.new, AccessHtmlElement.new(:id, 'result-subGroup-title-CAMPER02-1'))

    add_verify(CucumberLabel.new('ANKLE 2 VIEWS'), VerifyText.new, AccessHtmlElement.new(:id, 'result-subGroup-title-ANKLE2VIEWS-1'))
    add_verify(CucumberLabel.new('ARTHROGRAM ANKLE S&I'), VerifyText.new, AccessHtmlElement.new(:id, 'result-subGroup-title-ARTHROGRAMANKLESI-1'))
    add_verify(CucumberLabel.new('CHEST 2 VIEWS PA&LAT'), VerifyText.new, AccessHtmlElement.new(:id, 'result-subGroup-title-CHEST2VIEWSPALAT-1'))
    add_verify(CucumberLabel.new('CHEST INCLUDE FLUORO'), VerifyText.new, AccessHtmlElement.new(:id, 'result-subGroup-title-CHESTINCLUDEFLUORO-1'))
    add_verify(CucumberLabel.new('CORDOTOMY'), VerifyText.new, AccessHtmlElement.new(:id, 'result-subGroup-title-CORDOTOMY-1'))
    add_verify(CucumberLabel.new('KNEE 2 VIEWS'), VerifyText.new, AccessHtmlElement.new(:id, 'result-subGroup-title-KNEE2VIEWS-1'))
    add_verify(CucumberLabel.new('SPINE ENTIRE AP&LAT'), VerifyText.new, AccessHtmlElement.new(:id, 'result-subGroup-title-SPINEENTIREAPLAT-1'))
    add_verify(CucumberLabel.new('VAS-CAROTID DUPLEX SCAN'), VerifyText.new, AccessHtmlElement.new(:id, 'result-subGroup-title-VASCAROTIDDUPLEXSCAN-1'))
    
  end
end

Then(/^text search result contains subgroups$/) do |table|
  expected_subgroups = TextSearchSpecificSubgroups.instance
  table.rows.each do | row|
    expect(expected_subgroups.perform_verification(row[0], row[0])).to eq(true)
  end
end

def group_search_results(grouped_list, table)
  matched = false
  table.rows.each do |item, _k|
    grouped_list.each do |grouped_item| 
      # p "item is + #{grouped_item.text}, #{item}"
     
      if grouped_item.text == item.upcase
        matched = true
        break
      else 
        matched = false
      end #end of if
    end #end of grouped
    p "could not match cucumber_row: #{item}" unless matched
    #expect(matched).to be_true
  end #end of table
  return matched
end #end of def

def search_text_and_clicking(search_value)
  con = TextSearchContainer.instance
  driver = TestSupport.driver
  #con.add_action(CucumberLabel.new("Search Spinner"), ClickAction.new, AccessHtmlElement.new(:id, "searchSpinner"))

  
  expect(con.wait_until_element_present("Text Search Field", DefaultLogin.wait_time)).to be_true, "text search field did not display"
  expect(con.perform_action("Text Search Field", search_value)).to be_true, "text search field did not display"

  con.wait_until_element_present("Search Spinner")
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time * 2) # seconds # wait until list opens
  wait.until { driver.find_element(:class, "search-spinner").attribute("style").strip =="display: none;" } # wait until specific list element is NOT 
  con.wait_until_action_element_visible("Search Results", 70)
end

def search_result_message(_search_value, count)
  con = TextSearchContainer.instance
  driver = TestSupport.driver
  expected_msg = "#{count} results"
  expect(con.perform_verification("SearchResultMsg", expected_msg)).to be_true
end

def search_text(search_value)
  con = TextSearchContainer.instance
  con.perform_action("Text Search Suggestion", search_value)
end

def search_text_click_submit(search_value)
  con = TextSearchContainer.instance
  expect(con.perform_action("Text Search Suggestion", search_value)).to be_true, "Not able to enter text in the search field"
  expect(con.perform_action("submit", "")).to be_true, "was not able to click on the submit button"
end

def search_suggetions_count(_search_value, expected_num)
  con = TextSearchContainer.instance
  driver = TestSupport.driver
  num_seconds = 30
  #p expected_num 

  p "suggestion count expected #{expected_num}"
  con.wait_until_xpath_count("suggestion count", expected_num, num_seconds)
  p "wait completed"
  expect(con.perform_verification("suggestion count", expected_num, 10)).to be_true, ""
end

Given(/^user type text term and the page contains total items and search results$/) do |table|
  table.rows.each do |text, total_items|
    search_text_and_clicking(text)
    search_result_message(text, total_items)
  end
end

Given(/^user searches for "(.*?)"$/) do |text_term|
  search_text_and_clicking(text_term)
end

def check_group_results(table)
  driver = TestSupport.driver
#  browser_elements = driver.find_elements(:xpath, "//*[@id='searchResults']/descendant::h4/descendant::div")
#  matched = group_search_results(browser_elements, table)

  found_bottom = false
  number_of_attempts = 0

  # loop until test finds 
  # a. qualifier text in the qualifier column or
  # b. test has scrolled the entire table without finding any qualifiers
  xpath = "//*[@id='center']/div/div/div/div/div/div/div[2]/div[3]/descendant::button/descendant::span"
  until found_bottom && number_of_attempts >3

    count1 = driver.find_elements(:xpath, xpath).length
    p "scroll row #{count1} into view"
    element = driver.find_elements(:xpath, xpath)[-1]
    element.location_once_scrolled_into_view
    count2 = driver.find_elements(:xpath, xpath).length
    p "Now have #{count2} rows"
    found_bottom = (count1 == count2)
    number_of_attempts = found_bottom ? number_of_attempts + 1 : 0
    sleep 1 if found_bottom
  end
  browser_elements = driver.find_elements(:xpath, xpath)
  matched = group_search_results(browser_elements, table)
end

Then(/^text search result contains$/) do |table|
  driver = TestSupport.driver
  con = TextSearchContainer.instance
  
  matched =false
  con.wait_until_action_element_visible("Search Results Groups", 70)

  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { check_group_results table }
end

Then(/^text search results are grouped$/) do
  @ehmp = PobRecordSearch.new

  begin
    @ehmp.wait_until_fld_first_main_group_visible
  rescue => wait_exception
    p "#{wait_exception}"
  end
  expect(@ehmp.fld_main_group.length).to be > 0, "Expected at least one search result group, got #{@ehmp.fld_main_group.length}"
end

Then(/^the user expands all result groups$/) do
  @ehmp = PobRecordSearch.new
  @ehmp.expand_all_results
end

Then(/^sub grouped search result for "(.*?)" contains$/) do |sub_group_category, table|
  con = TextSearchContainerDrillDown.instance
  driver = TestSupport.driver
  
  matched =false
  case sub_group_category
  when 'Headache'
    expect(con.wait_until_element_present("Sub Group List", 60)).to be_true
    browser_elements_list = driver.find_elements(:xpath, "//*[@id='result-subGroup-HeadacheICD9CM7840-1']/descendant::div")
  when 'General Medicine Note'
    expect(con.wait_until_element_present("Sub Group List", 60)).to be_true
    browser_elements_list = driver.find_elements(:xpath, "//*[@id='result-subGroup-GENERALMEDICINENOTE-1']/descendant::div")
  when 'Diabetes'
    expect(con.wait_until_element_present("Sub Group List", 60)).to be_true
    browser_elements_list = driver.find_elements(:xpath, "//*[@id='result-subGroup-DIABETES-1']/descendant::div")
  when 'Administrative Note2'
    expect(con.wait_until_element_present("Sub Group List", 60)).to be_true
    browser_elements_list = driver.find_elements(:xpath, "//*[@id='result-subGroup-AdministrativeNote-1']/descendant::div")
  when 'Advance Directive2'
    expect(con.wait_until_element_present("Sub Group List", 60)).to be_true
    browser_elements_list = driver.find_elements(:xpath, "//*[@id='result-subGroup-ADVANCEDIRECTIVE-1']/descendant::div")
  when 'Col'
    expect(con.wait_until_element_present("Sub Group List", 60)).to be_true
    browser_elements_list = driver.find_elements(:xpath, "//*[@id='result-subGroup-COL-1']/descendant::div")
  when 'Audiology Hearing Loss Consult'
    expect(con.wait_until_element_present("Sub Group List", 60)).to be_true
    browser_elements_list = driver.find_elements(:xpath, "//*[@id='result-subGroup-AUDIOLOGYHEARINGLOSSCONSULT-1']/descendant::div")
  when 'Consultation Note Document'
    expect(con.wait_until_element_present("Sub Group List", 60)).to be_true
    browser_elements_list = driver.find_elements(:xpath, "//*[@id='result-subGroup-ConsultationNoteProviderDocument-1']/descendant::div")
  when 'Crisis Note subgroup'
    expect(con.wait_until_element_present("Sub Group List", 60)).to be_true
    browser_elements_list = driver.find_elements(:xpath, "//*[@id='result-subGroup-CRISISNOTE-1']/descendant::div")
  when 'Discharge Summary subgroup'
    expect(con.wait_until_element_present("Sub Group List", 60)).to be_true
    browser_elements_list = driver.find_elements(:xpath, "//*[@id='result-subGroup-DischargeSummary-1']/descendant::div")
  when 'LR ELECTRON MICROSCOPY REPORT'
    expect(con.wait_until_element_present("Sub Group List", 60)).to be_true
    browser_elements_list = driver.find_elements(:xpath, "//*[@id='result-subGroup-LRELECTRONMICROSCOPYREPORT-1']/descendant::div")
  when 'ANKLE 2 VIEWS'
    expect(con.wait_until_element_present("Sub Group List", 60)).to be_true
    browser_elements_list = driver.find_elements(:xpath, "//*[@id='result-subGroup-ANKLE2VIEWS-1']/descendant::div")
  when 'ANESTHESIA REPORT'
    expect(con.wait_until_element_present("Sub Group List", 60)).to be_true, "Sub Group List did not display"
    browser_elements_list = driver.find_elements(:xpath, "//*[@id='result-subGroup-ANESTHESIAREPORT-1']/descendant::div")
  else
    fail "**** No function found! Check your script ****"
  end #end for case
  
  con = VerifyTableValue.new
  matched = con.verify_name_value(browser_elements_list, table)
  expect(matched).to be_true, "could not match"
end
  
When(/^from the coversheet the user clicks on "([^"]*)"$/) do |element|
  aa = TextSearchContainer.instance
  driver = TestSupport.driver
  aa.wait_until_action_element_visible(element, 60)
  expect(aa.static_dom_element_exists?(element)).to be_true, "Record Search Button did not display"
  expect(aa.perform_action(element, "")).to be_true, "was not able to click on the button"
end 

Given(/^user type text term "(.*?)" in the search text box$/) do |search_value|
  con = TextSearchContainer.instance
  con.perform_action("Text Search Field", search_value)
end

Then(/^search result displays "(.*?)" search results$/) do |total_no_search_results|
  con = TextSearchContainer.instance
  expect(con.static_dom_element_exists?("Search Result Count")).to be_true
  expect(con.perform_verification("Search Result Count", total_no_search_results)).to be_true  
end

Then(/^the user clicks one of the search result "([^"]*)"$/) do |element|
  driver = TestSupport.driver  
  aa = TextSearchContainerDrillDown.instance
  aa.wait_until_action_element_visible(element, 60)
  expect(aa.static_dom_element_exists?(element)).to be_true
  expect(aa.perform_action(element, "")).to be_true, "element did not display"
end

When(/^the user enters "(.*?)" in the "(.*?)" control$/) do |input_text, control_name|
  aa = TextSearchContainer.instance
  control = "Control - #{control_name}"
  p "control is #{control}"
  expect(aa.perform_action(control, input_text)).to be_true, "element did not display"
end

Then(/^user type <text> term and the page displays total no of suggestions "(.*?)"$/) do |_arg1, table|
  table.rows.each do |text, total_items|
    p "search #{text}"
    search_text(text)
    search_suggetions_count(text, total_items)
  end
end

Then(/^the following date time filter option should be displayed$/) do |table|
  driver = TestSupport.driver
  matched =false
  browser_elements = driver.find_elements(:xpath, "//*[@id='globalDate-region']/descendant::button")
  p browser_elements.length
  #p browser_elements.text.strip
  matched =  group_search_results(browser_elements, table)
  expect(matched).to be_true   
end
   
Then(/^the "(.*?)" contains$/) do |_name, table|
  driver = TestSupport.driver
  con = Documents.instance
  browser_elements_list = driver.find_elements(:xpath, "//*[@id='modal-body']/descendant::div")
  p browser_elements_list.length
  browser_elements_list.each do |label_in_browser| 
    p label_in_browser.text.strip  
  end
  matched = false
  con = VerifyTableValue.new
  matched = con.verify_name_value(browser_elements_list, table)
  expect(matched).to be_true 
end

def wait_until_numberofresults(number_of_results)
  web_driver = TestSupport.driver
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  p "numberOfResults #{web_driver.execute_script("return window.document.getElementById('numberOfResults').innerHTML")}"
  wait.until { web_driver.execute_script("return window.document.getElementById('numberOfResults').innerHTML") == number_of_results }
  p "not hanging here"
end

Then(/^search result header displays (\d+) number of results$/) do |arg1|
  wait_until_numberofresults arg1
end

Then(/^the user sees the search text "(.*?)" in yellow$/) do |_search_text|
  driver = TestSupport.driver
  matched = false
  text_color = ""
  browser_elements_list = driver.find_elements(:css, ".cpe-search-term-match")
  p browser_elements_list.length
  browser_elements_list.each do |element|
    text_color = element.css_value("background-color")

    #check only rgb value in string since alpha value is inconsistent across build environments
    if text_color[0, 20] == "rgba(255, 255, 0, 0."
      matched = true
    else
      matched = false
    end
  end
  expect(matched).to be_true, "color in browser: #{text_color} found in feature file yellow" 
end

Then(/^Current Status for "(.*?)" is "(.*?)"$/) do |order_type, order_status|
  aa = TextSearchContainer.instance
  
  order_type_status = order_type + " " + "Order Status"
  aa.wait_until_element_present(order_type_status, 60)
  expect(aa.static_dom_element_exists?(order_type_status)).to be_true, "element did not exists"
  expect(aa.perform_verification(order_type_status, order_status)).to be_true, "Order status is #{order_type_status}"
end

Then(/^the following subgroups data are not loaded$/) do |table|
  driver = TestSupport.driver
  
  table.rows.each do |rows_value|
    element_id = "result-subGroup-" + rows_value[0] + "-1"
    #element_id = "result-subGroup"
    matched = driver.find_element(:id, element_id).displayed?
    expect(!matched).to be_true, "#{element_id} is loaded"
  end
end

Then(/^user searches for "(.*?)" with no suggestion$/) do |text|
  aa = TextSearchContainer.instance
  search_text(text)
  aa.add_verify(CucumberLabel.new("Text Search Suggestion No Results"), VerifyText.new, AccessHtmlElement.new(:css, '#suggestListDiv #noResults'))
  expect(aa.perform_verification('Text Search Suggestion No Results', 'No results')).to eq(true), "There should be no text search suggestions"
end

Then(/^user searches for "(.*?)" with no duplicates in the results dropdown$/) do |text|
  driver = TestSupport.driver
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  suggest = Array.new(16)
  search_text(text)
  wait.until { driver.find_element(:id, "suggestList") }
  #Problems with <span> elements (ex: <span id>, <span id=""">). NOT FINNISHED!
  for i in 0..15
    #p "#{i}"
    word = ""
    driver.find_elements(:xpath, "//li[@id='SuggestItem#{i}']/a").each { |td| word += td.text }
    #p word
    suggest[i] = word
  end
  #p "#{suggest}"
  expect(suggest.uniq! == nil).to be_true
end

Then(/^the modal contains highlighted "(.*?)"$/) do |searchterm|
  driver = TestSupport.driver
  no_elem = []
  expect(driver.find_element(:xpath, "//*[@id='modal-body']//mark[@class='cpe-search-term-match']").text == searchterm)
end

Then(/^user searches for "([^"]*)" and verifies spelling suggestions are displayed$/) do |text|
  search_text(text)

  @ehmp = PobRecordSearch.new
  @ehmp.wait_until_fld_suggestion_list_visible
  expect(@ehmp.fld_spelling_suggestions.length).to be > 0
end

Then(/^user searches for "(.*?)" and verifies suggestions$/) do |text, table|
  driver = TestSupport.driver
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  suggest = []

  search_text(text)

  wait.until { driver.find_element(:id, "suggestList") }
  suggestions = driver.find_elements(:xpath, "//ul[@id='suggestList']/li")

  for i in 0..suggestions.length-1
    word = ""
    driver.find_elements(:xpath, "//li[@id='SuggestItem#{i}']/a/span[1]").each { |td| word += td.text }
    suggest[i] = word
  end
  j = 1
  table.rows.each do |rows_value|
    p rows_value[0]
    p suggest[j]
    expect(rows_value[0].upcase == suggest[j].upcase).to be_true, "looking for #{rows_value[0]} but found #{suggest[j]}"
    j += 1
  end
end

def number_reported_results
  driver = TestSupport.driver
  element = driver.find_element(:css, '.number-of-results')
  element.text.to_i
rescue
  -1
end

def number_grouped_results
  driver = TestSupport.driver
  elements = driver.find_elements(:css, '.search-results div.search-group')
  elements.length
rescue
  -1
end
Then(/^Text Search results are displayed$/) do
  text_search = TextSearchContainer.instance
  # Number of Search Result Rows
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { number_reported_results > 0 }
  wait.until { number_grouped_results > 0 }
end

class TextSearchLazy < AccessBrowserV2
  include Singleton
  def initialize
    super
    date_format = Regexp.new("\\d{2}\/\\d{2}\/\\d{4} - \\d{2}:\\d{2}")
    date_only_format =  Regexp.new("\\d{2}\/\\d{2}\/\\d{4}")
    add_action(CucumberLabel.new('Problem subgroup'), ClickAction.new, AccessHtmlElement.new(:xpath, "//div[@id='result-group-Problem' and contains(@class, 'in')]"))
    add_action(CucumberLabel.new('Problem - Headache'), ClickAction.new, AccessHtmlElement.new(:css, "#result-group-Problem [data-uid='urn:va:problem:9E7A:229:10']"))
    add_action(CucumberLabel.new('Problem - Headache - subgroup'), ClickAction.new, AccessHtmlElement.new(:css, "[data-target='#result-subGroup-HeadacheICD9CM7840-1']"))
    add_verify(CucumberLabel.new('Problem - Headache - date'), VerifyTextFormat.new(date_only_format), AccessHtmlElement.new(:css, "#result-subGroup-HeadacheICD9CM7840-1 .subgroupItem .row .col-xs-4"))
    add_verify(CucumberLabel.new('Problem - Headache - status'), VerifyContainsText.new, AccessHtmlElement.new(:css, "#result-subGroup-HeadacheICD9CM7840-1 .subgroupItem:nth-child(2) .row .col-xs-4:nth-child(2)"))
    problem_headache_facility = AccessHtmlElement.new(:css, "#result-subGroup-HeadacheICD9CM7840-1 .subgroupItem:nth-child(2) .row .col-xs-4:nth-child(3)")
    add_verify(CucumberLabel.new('Problem - Headache - facility'), VerifyFacility.new(problem_headache_facility), problem_headache_facility)
  
    add_action(CucumberLabel.new('Progress Note subgroup'), ClickAction.new, AccessHtmlElement.new(:xpath, "//div[@id='result-group-ProgressNote' and contains(@class, 'in')]"))
    add_action(CucumberLabel.new('Progress Note - Diabetes'), ClickAction.new, AccessHtmlElement.new(:css, "#result-group-ProgressNote [data-uid='urn:va:document:9E7A:229:2763']"))
    add_action(CucumberLabel.new('Progress Note - Diabetes - subgroup'), ClickAction.new, AccessHtmlElement.new(:css, "[data-target='#result-subGroup-DIABETES-1']"))
    
    add_verify(CucumberLabel.new('Progress Note - Diabetes - date'), VerifyTextFormat.new(date_format), AccessHtmlElement.new(:css, "#result-subGroup-DIABETES-1 .subgroupItem .row .col-xs-4"))
    progressnote_diabetes_facility = AccessHtmlElement.new(:css, "#result-subGroup-DIABETES-1 .subgroupItem:nth-child(3) .row > .col-xs-4:nth-child(3)")
    add_verify(CucumberLabel.new('Progress Note - Diabetes - facility'), VerifyFacility.new(progressnote_diabetes_facility), progressnote_diabetes_facility)
    add_verify(CucumberLabel.new('Progress Note - Diabetes - snippet'), VerifyContainsText.new, AccessHtmlElement.new(:css, "#result-subGroup-DIABETES-1 .subgroupItem:nth-child(3) .row > .col-xs-4:nth-child(2)"))
    pn_diabetes_snippet_hl = AccessHtmlElement.new(:xpath, "//div[@data-uid='urn:va:document:9E7A:229:2763']/descendant::span[@class='cpe-search-term-match']")
    add_verify(CucumberLabel.new('Progress Note - Diabetes - snippet hl'), VerifyXpathCount.new(pn_diabetes_snippet_hl), pn_diabetes_snippet_hl)
  
    # urn:va:document:9E7A:8:3855
    #data_uid = "urn:va:document:9E7A:8:1781"
   
    add_action(CucumberLabel.new('Advance Directive - Advance Directive Completed'), ClickAction.new, AccessHtmlElement.new(:css, "#result-subGroup-ADVANCEDIRECTIVE-1 .subgroupItem .row .col-xs-4"))
    add_verify(CucumberLabel.new('Advance Directive - Advance Directive Completed - date'), VerifyTextFormat.new(date_format), AccessHtmlElement.new(:css, "#result-subGroup-ADVANCEDIRECTIVE-1 .subgroupItem .row .col-xs-4"))
    advance_directive_facility = AccessHtmlElement.new(:css, "#result-subGroup-ADVANCEDIRECTIVE-1 .subgroupItem:nth-child(3) .row .col-xs-4:nth-child(3)")
    add_verify(CucumberLabel.new('Advance Directive - Advance Directive Completed - facility'), VerifyFacility.new(advance_directive_facility), advance_directive_facility)
  

    add_action(CucumberLabel.new('Radiology - Hip - subgroup'), ClickAction.new, AccessHtmlElement.new(:css, "[data-target='#result-subGroup-HIP2ORMOREVIEWS-1']"))
  end
end

When(/^the user expands the Problem headache subgroup$/) do 
  expect(TextSearchLazy.instance.perform_action('Problem - Headache - subgroup')).to eq(true)
end

When(/^the user expands the Radiology Hip (\d+) or more views headache subgroup$/) do |arg1|
  expect(TextSearchLazy.instance.perform_action('Radiology - Hip - subgroup')).to eq(true)
end

When(/^the user expands the Progress Note subgroup$/) do
  expect(TextSearchLazy.instance.perform_action('Progress Note - Diabetes - subgroup')).to eq(true)
end

Then(/^the sub group for "(.*?)" displays$/) do |arg1|
  expect(TextSearchLazy.instance.wait_until_action_element_visible("#{arg1} subgroup")).to eq(true) 
end

Then(/^the sub group for "(.*?)" contains a row for "(.*?)"$/) do |arg1, arg2, table|
  text_search = TextSearchLazy.instance
  expect(text_search.wait_until_action_element_visible("#{arg1} - #{arg2}")).to eq(true)
  p "printing out:  #{arg1} - #{arg2}"
  table.rows.each do | row |
    p "#{arg1} - #{arg2} - #{row[0]}"
    expect(text_search.perform_verification("#{arg1} - #{arg2} - #{row[0]}", row[1])).to eq(true)
  end
end

When(/^the user displays the details for search result "(.*?)" subgroup "(.*?)"$/) do |arg1, arg2|
  expect(TextSearchLazy.instance.perform_action("#{arg1} - #{arg2}"))
end

Then(/^the text search snippet "(.*?)" is highlighted$/) do |arg1|
  expect(TextSearchLazy.instance.wait_until_xpath_count_greater_than('Progress Note - Diabetes - snippet hl', 0)).to eq(true)
end

Then(/^the "([^"]*)" modal dialog contains data$/) do |arg1|  
  aa = TextSearchContainer.instance
  expect(aa.wait_until_action_element_visible("Modal Detail Content", DefaultLogin.wait_time)).to be_true
end

When(/^user filters the text search results by predefined time frame 2yr$/) do 
  @ehmp = PobRecordSearch.new
  expect(@ehmp).to have_btn_2yr
  @ehmp.btn_2yr.click
  @ehmp.wait_until_btn_active_2yr_visible

  begin
    @ehmp.wait_for_fld_first_main_group
  rescue => wait_exception
    p "#{wait_exception}"
  end
  expect(@ehmp).to have_fld_number_results
  step 'text search results are grouped' if @ehmp.fld_number_results.text.to_i > 0
end

Then(/^the the text search results only display results from the last 2yrs \( or Unknown \)$/) do
  @ehmp = PobRecordSearch.new 
  end_date = Date.today.to_datetime
  start_date = Date.today.prev_year(2).to_datetime
  p "#{start_date} to #{end_date}"
  expect(@ehmp.verify_results_in_range(start_date, end_date)).to eq(true)
end

When(/^user filters the text search results by predefined time frame 1yr$/) do 
  @ehmp = PobRecordSearch.new
  expect(@ehmp).to have_btn_1yr
  @ehmp.btn_1yr.click
  @ehmp.wait_until_btn_active_1yr_visible

  begin
    @ehmp.wait_for_fld_first_main_group
  rescue => wait_exception
    p "#{wait_exception}"
  end
  expect(@ehmp).to have_fld_number_results
  step 'text search results are grouped' if @ehmp.fld_number_results.text.to_i > 0
end

Then(/^the the text search results only display results from the last 1yr \( or Unknown \)$/) do
  @ehmp = PobRecordSearch.new 
  end_date = Date.today.to_datetime
  start_date = Date.today.prev_year(1).to_datetime
  p "#{start_date} to #{end_date}"
  expect(@ehmp.verify_results_in_range(start_date, end_date)).to eq(true)
end

When(/^user filters the text search results by predefined time frame 3mo$/) do 
  @ehmp = PobRecordSearch.new
  expect(@ehmp).to have_btn_3m
  @ehmp.btn_3m.click
  @ehmp.wait_until_btn_active_3m_visible

  begin
    @ehmp.wait_for_fld_first_main_group
  rescue => wait_exception
    p "#{wait_exception}"
  end
  expect(@ehmp).to have_fld_number_results
  step 'text search results are grouped' if @ehmp.fld_number_results.text.to_i > 0
end

Then(/^the the text search results only display results from the last 3mos \( or Unknown \)$/) do 
  @ehmp = PobRecordSearch.new 
  end_date = Date.today.to_datetime
  start_date = Date.today.prev_month(3).to_datetime
  p "#{start_date} to #{end_date}"
  expect(@ehmp.verify_results_in_range(start_date, end_date)).to eq(true)
end

Then(/^the text search results contain document sub groups$/) do
  @ehmp = PobRecordSearch.new 
  @ehmp.wait_until_fld_first_document_subgroup_visible
  expect(@ehmp.fld_document_sub_groups.length).to be > 0
  expect(@ehmp.fld_document_sub_group_badges.length).to be > 0
  expect(@ehmp.fld_document_sub_group_badges.length).to eq(@ehmp.fld_document_sub_groups.length)
end

# Then(/^the text search results contain sub groups$/) do
#   @ehmp = PobRecordSearch.new 
#   @ehmp.wait_until_fld_first_subgroup_visible
#   expect(@ehmp.fld_sub_groups.length).to be > 0
#   expect(@ehmp.fld_sub_group_badges.length).to be > 0
#   expect(@ehmp.fld_sub_group_badges.length).to eq(@ehmp.fld_sub_groups.length)
# end

Then(/^the text search subgroup "([^"]*)" results display$/) do |groupontext, table|
  @ehmp = PobRecordSearch.new
  helper = HelperMethods.new
  @ehmp.group_results(groupontext)
  wait = Selenium::WebDriver::Wait.new(:timeout => 5) 
  wait.until { @ehmp.fld_subgroup_dates.length > 0 }

  facility_elements = @ehmp.fld_subgroup_facilities
  expect(facility_elements.length).to be > 0
  facility_elements.each do | facility |
    expect(helper.known_facilities).to include facility.text.upcase
  end

  date_elements = @ehmp.fld_subgroup_dates
  date_elements.each do | date_element |
    # p date_element.text
    next if date_element.text.upcase.eql?('UNKNOWN')
    expect(helper.date_only? date_element.text).to eq(true), "Date not in correct format: #{date_element.text}"
  end
end

When(/^the user selects a result from "([^"]*)" subgroup$/) do |groupontext|
  @ehmp = PobRecordSearch.new
  helper = HelperMethods.new
  @ehmp.group_results(groupontext)
  wait = Selenium::WebDriver::Wait.new(:timeout => 5) 
  wait.until { @ehmp.fld_subgroup_dates.length > 0 }

  @ehmp.fld_subgroup_dates[0].click
end

Then(/^a the Radiology Report modal displays$/) do
  @ehmp = DocumentDetail.new
  helper = HelperMethods.new
  @ehmp.wait_until_fld_detail_label_visible
  @ehmp.wait_until_fld_results_links_visible
  @ehmp.wait_for_fld_results_region

  expect(@ehmp).to have_fld_detail_label
  expect(@ehmp).to have_fld_facility_label
  expect(@ehmp).to have_fld_facility
  expect(@ehmp).to have_fld_type_label
  expect(@ehmp).to have_fld_type
  expect(@ehmp).to have_fld_status_label
  expect(@ehmp).to have_fld_status
  expect(@ehmp).to have_fld_date_label
  expect(@ehmp).to have_fld_date
  expect(@ehmp).to have_fld_providers_label
  expect(@ehmp).to have_fld_providers
  
  expect(@ehmp.fld_modal_title.text.upcase).to_not start_with("LOADING")
  expect(helper.known_facilities).to include @ehmp.fld_facility.text.upcase
  expect(helper.date_only? @ehmp.fld_date.text).to eq(true), "#{@ehmp.fld_date.text} did not match expected format"
  
  expect(@ehmp).to have_fld_results_region
  expect(@ehmp.fld_results_links.length).to be > 0
  @ehmp.wait_for_fld_result_doc
  expect(@ehmp).to have_fld_result_doc
end
