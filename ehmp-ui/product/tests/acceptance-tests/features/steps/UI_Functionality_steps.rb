path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'all_applets.rb'

class CommunityHealthSummariesCoverSheet < AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super
    @appletid = 'ccd_grid'
    appletid_css = "[data-appletid=#{@appletid}]"

    #add_verify(CucumberLabel.new("Date"), VerifyText.new, AccessHtmlElement.new(:id, "ccd_grid-referenceDateTime"))
    add_verify(CucumberLabel.new("Date"), VerifyText.new, AccessHtmlElement.new(:id, "ccd_grid-referenceDateDisplay"))
    add_verify(CucumberLabel.new("Authoring Institution"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='ccd_grid'] [data-header-instanceid='ccd_grid-authorDisplayName']"))

    add_action(CucumberLabel.new("Header Date"), ClickAction.new, AccessHtmlElement.new(:css, "#ccd_grid-referenceDateDisplay a"))
    add_action(CucumberLabel.new("Header Authoring Institution"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='ccd_grid'] [data-header-instanceid='ccd_grid-authorDisplayName'] a"))
    
    add_applet_buttons appletid_css

    add_verify(CucumberLabel.new("Empty Record"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#{appletid_css} tr.empty"))

    add_verify(CucumberLabel.new("Grid"), VerifyText.new, AccessHtmlElement.new(:id, "data-grid-ccd_grid"))
    rows = AccessHtmlElement.new(:css, '#data-grid-ccd_grid tbody tr')
    add_verify(CucumberLabel.new('row count'), VerifyXpathCount.new(rows), rows)
    add_verify(CucumberLabel.new('Screen Name'), VerifyText.new, AccessHtmlElement.new(:id, 'screenName'))
    add_verify(CucumberLabel.new('ccdContent'), VerifyText.new, AccessHtmlElement.new(:css, '.ccdContent'))
    # First Community Health Summary Row
    add_action(CucumberLabel.new('First ccd Row'), ClickAction.new, AccessHtmlElement.new(:css, "#data-grid-ccd_grid tbody tr.selectable:nth-child(1)"))
  end

  def applet_loaded?
    return true if am_i_visible? 'Empty Record'
    return TestSupport.driver.find_elements(:css, '#data-grid-ccd_grid tbody tr.selectable').length > 0
  rescue => e 
    # p e
    false
  end

  def community_health_rows
    TestSupport.driver.find_elements(:css, '#data-grid-ccd_grid tbody tr')
  end
end #CommunityHealthSummariesCoverSheet

Then(/^the CommunityHealthSummaries coversheet table contains headers$/) do |table|
  verify_communityhealthsummary_table_headers(CommunityHealthSummariesCoverSheet.instance, table)
end

class CommunityHealthSummariesSinglePage < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Date"), VerifyText.new, AccessHtmlElement.new(:id, "ccd_grid-referenceDateTimeDisplay"))
    add_verify(CucumberLabel.new("Description"), VerifyText.new, AccessHtmlElement.new(:id, "ccd_grid-summary"))
    add_verify(CucumberLabel.new("Authoring Institution"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='ccd_grid'] [data-header-instanceid='ccd_grid-authorDisplayName']")) 
    add_verify(CucumberLabel.new("communityhealthsummariesTable"), VerifyText.new, AccessHtmlElement.new(:id, "data-grid-ccd_grid")) 
    data_grid_row_count = AccessHtmlElement.new(:xpath, "//table[@id='data-grid-ccd_grid']/descendant::tr")
    add_verify(CucumberLabel.new("Number of rows"), VerifyXpathCount.new(data_grid_row_count), data_grid_row_count) 
  end
end #CommunityHealthSummariesSecondary

Then(/^the CommunityHealthSummaries Single Page table contains headers$/) do |table|
  verify_communityhealthsummaries_table_headers(CommunityHealthSummariesSinglePage.instance, table)
end

def verify_communityhealthsummary_table_headers(access_browser_instance, table)  
  driver = TestSupport.driver
  con = CommunityHealthSummariesCoverSheet.instance
  con.wait_until_action_element_visible("Date", 40)
  expect(con.static_dom_element_exists?("Date")).to be_true
  #con.perform_verification("Description", "Outpatient Visit")
  headers = driver.find_elements(:css, "#data-grid-ccd_grid th")
  expect(headers.length).to_not eq(0)
  expect(headers.length).to eq(table.rows.length)
  elements = access_browser_instance
  table.rows.each do |header_text|
    does_exist = elements.static_dom_element_exists? header_text[0]
    p "#{header_text[0]} was not found" unless does_exist
    expect(does_exist).to be_true
  end #table
end #verify_table_headers

Then(/^the Appointments coversheet table contains headers$/) do |table|
  verify_appointment_table_headers(AppointmentsCoverSheet.instance, table)
end

class AppointmentsSinglePage < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Date"), VerifyText.new, AccessHtmlElement.new(:id, "appointments-dateTimeFormatted"))
    add_verify(CucumberLabel.new("Description"), VerifyText.new, AccessHtmlElement.new(:id, "appointments-categoryName"))
    add_verify(CucumberLabel.new("Location"), VerifyText.new, AccessHtmlElement.new(:id, "appointments-locationName"))
    add_verify(CucumberLabel.new("Type"), VerifyText.new, AccessHtmlElement.new(:id, "appointments-typeDisplayName"))
    add_verify(CucumberLabel.new("Provider"), VerifyText.new, AccessHtmlElement.new(:id, "appointments-providerDisplayName"))
    add_verify(CucumberLabel.new("Reason"), VerifyText.new, AccessHtmlElement.new(:id, "appointments-reasonName"))
    add_verify(CucumberLabel.new("Facility"), VerifyText.new, AccessHtmlElement.new(:id, "appointments-facilityCode"))
    add_verify(CucumberLabel.new("appointmentsTable"), VerifyText.new, AccessHtmlElement.new(:id, "data-grid-appointments"))
    add_action(CucumberLabel.new("applet - Appointments Type dropdowns"), ClickAction.new, AccessHtmlElement.new(:css,  "[data-appletid=appointments] .dropdown-menu li"))
    add_action(CucumberLabel.new("Control - applet - Appointments Type dropdown"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=appointments] .appts-filter-bar button[data-toggle]"))
    add_action(CucumberLabel.new("ScrollDown Button"), ClickAction.new, AccessHtmlElement.new(:id, "appts-dropdown-menu-site")) 
    add_verify(CucumberLabel.new("Table - Appointments Applet"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#data-grid-appointments tbody tr"))
    #add_action(CucumberLabel.new("ALL VA+DOD Link"), ClickAction.new, AccessHtmlElement.new(:link, "link=All VA + DOD"))
    add_action(CucumberLabel.new("All VA+DOD Link"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='ALL']/a"))
    add_action(CucumberLabel.new("All VA+DOD Link"), VerifyText.new, AccessHtmlElement.new(:xpath, "//*[@id='ALL']/a"))
    add_verify(CucumberLabel.new("ALL VA+DOD Link"), VerifyText.new, AccessHtmlElement.new(:xpath, "//a[contains(@href, '#')])[11"))
    add_action(CucumberLabel.new("ALL VA+DOD Link"), ClickAction.new, AccessHtmlElement.new(:xpath, "//a[contains(@href, '#')])[11")) 
    #add_action(CucumberLabel.new("ScrollDown Button"), VerifyText.new, AccessHtmlElement.new(:xpath, "//*[@id='appts-dropdown-menu-site']"))
    data_grid_row_count = AccessHtmlElement.new(:xpath, "//table[@id='data-grid-appointments']/descendant::tr")
    add_verify(CucumberLabel.new("Number of rows"), VerifyXpathCount.new(data_grid_row_count), data_grid_row_count)
  end
end #AppointmentCoverSheet

Before do
  @apc = AppointmentsSinglePage.instance
end

Then(/^the Appointments Single Page table contains headers$/) do |table|
  verify_appointments_table_headers(AppointmentsSinglePage.instance, table)
end

class AppointmentsModalPage < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Close"), VerifyText.new, AccessHtmlElement.new(:id, "modal-close-button"))
    add_action(CucumberLabel.new("Close"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "modal-close-button"))
    add_action(CucumberLabel.new("Close"), ClickAction.new, AccessHtmlElement.new(:id, "modal-close-button"))
    add_action(CucumberLabel.new("ModalBody"), ClickAction.new, AccessHtmlElement.new(:id, "modal-body")) 
    add_verify(CucumberLabel.new("Category:"), VerifyText.new, AccessHtmlElement.new(:xpath, ".//*[@id='modal-body']/div/div[3]/div[1]"))
  end
end # Appointments modal View

Then(/^user selects "(.*?)"$/) do |_search_value|
  close_button = AppointmentsModalPage.instance
  close_button = AppointmentsModalPage.instance

  # if patient search button is found, click it to go to patient search
  close_button.perform_action("Close") if close_button.static_dom_element_exists? "Close"

  close_button.wait_until_element_present("Close", DefaultLogin.wait_time)
  
  expect(close_button.perform_action("Close")).to be_true
  close_button.wait_until_element_present("Close", DefaultLogin.wait_time)
  expect(close_button.static_dom_element_exists? "Close").to be_true
end

def verify_appointment_table_headers(access_browser_instance, table)  
  driver = TestSupport.driver
  con = AppointmentsCoverSheet.instance
  con.wait_until_action_element_visible("Description", 50)
  expect(con.static_dom_element_exists?("Description")).to be_true
  #con.perform_verification("Description", "Outpatient Visit")
  # headers = driver.find_elements(:css, "#grid-panel-appointments th")
  headers = driver.find_elements(:css, "#data-grid-appointments th") 
  expect(headers.length).to_not eq(0)
  expect(headers.length).to eq(table.rows.length)
  elements = access_browser_instance
  table.rows.each do |header_text|
    does_exist = elements.static_dom_element_exists? header_text[0]
    p "#{header_text[0]} was not found" unless does_exist
    expect(does_exist).to be_true
  end #table
end #verify_table_headers

def verify_appointments_table_headers(access_browser_instance, table)
  con = AppointmentsSinglePage.instance
  driver = TestSupport.driver
  con.wait_until_action_element_visible("Description", 60)
  expect(con.static_dom_element_exists?("Description")).to be_true
  con.perform_verification("Description", "Outpatient Visit") 
  #driver = TestSupport.driver
  #TestSupport.wait_for_page_loaded
  #TestSupport.wait_for_jquery_completed
  headers = driver.find_elements(:css, "#grid-panel-appointments th") 
  expect(headers.length).to_not eq(0)
  expect(headers.length).to eq(table.rows.length)
  elements = access_browser_instance
  table.rows.each do |header_text|
    does_exist = elements.static_dom_element_exists? header_text[0]
    p "#{header_text[0]} was not found" unless does_exist
    expect(does_exist).to be_true
  end #table
end #verify_table_headers2

class ScreenManager < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Allergies Applet"), VerifyText.new, AccessHtmlElement.new(:xpath, ".//*[@id='applets-carousel']/div[1]/div[2]/div[1]/div[1]/p"))
    add_verify(CucumberLabel.new("message"), VerifyText.new, AccessHtmlElement.new(:css, "#mainOverlayRegion > div > div > div.addEditFormRegion > div > div > div:nth-child(2) > form.col-md-12 > div"))
    add_verify(CucumberLabel.new("carousel"), VerifyText.new, AccessHtmlElement.new(:xpath, ".//*[@id='applets-carousel']/div[1]/div[2]/div[1]"))
    add_action(CucumberLabel.new("Workspace Manager Button"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@id='workspace-manager-button']"))
    add_action(CucumberLabel.new("Add New WorkSheet"), ClickAction.new, AccessHtmlElement.new(:id, "addScreen"))
    add_action(CucumberLabel.new("Title"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "screen-title"))
    add_action(CucumberLabel.new("Description"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "screen-description"))
    add_action(CucumberLabel.new("User Defined Screen"), ClickAction.new, AccessHtmlElement.new(:id, ".//*[@id='screens-carousel']/div[1]/div[2]/div/div[6]"))
    add_action(CucumberLabel.new("Delete Button"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@id='workspace-delete']"))
    add_action(CucumberLabel.new("Confirm Delete Button"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@id='workspace-delete']"))  
    add_action(CucumberLabel.new("Workspace Manager Delete Button"), ClickAction.new, AccessHtmlElement.new(:css, "#mainOverlayRegion > div > div > div.addEditFormRegion > div > div > div:nth-child(4) > div.col-md-2 > button")) 
    add_action(CucumberLabel.new("Confirm Delete"), ClickAction.new, AccessHtmlElement.new(:id, "workspace-delete")) 
    add_action(CucumberLabel.new("Cancel Button"), ClickAction.new, AccessHtmlElement.new(:xpath, " .//*[@id='mainOverlayRegion']/div/div/div[3]/div/div/div[3]/div/button[1]"))
    add_action(CucumberLabel.new("Close Button"), ClickAction.new, AccessHtmlElement.new(:css, ".panel-heading .done-editing"))      
    add_verify(CucumberLabel.new("Workspace Manager Filter Field"), VerifyText.new, AccessHtmlElement.new(:xpath, ".//*[@id='searchScreens']"))
    add_action(CucumberLabel.new("Workspace Manager Filter Field"), SendKeysAndEnterAction, AccessHtmlElement.new(:xpath, ".//*[@id='searchScreens']"))  
    add_verify(CucumberLabel.new("test"), VerifyText.new, AccessHtmlElement.new(:xpath, ".//*[@id='screens-carousel']/div[1]/div[2]/div/div"))
    add_verify(CucumberLabel.new("Coversheet"), VerifyText.new, AccessHtmlElement.new(:xpath, ".//*[@id='cover-sheet']/div/div[1]/div[2]"))
    add_action(CucumberLabel.new("Filter Button"), ClickAction.new, AccessHtmlElement.new(:css, "#grid-filter-button-workspace-manager > span"))
    add_verify(CucumberLabel.new("Filter Field"), VerifyText.new, AccessHtmlElement.new(:css, "#mainOverlayRegion > div > div > div.col-sm-10.grid-filter.hiddenRow > div.col-xs-offset-6.col-xs-4.filterRegion"))
    add_action(CucumberLabel.new("Filter Value"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "searchScreens"))

    add_action(CucumberLabel.new("Plus Button"), ClickAction.new, AccessHtmlElement.new(:css, '#mainOverlayRegion .addScreen'))   

    add_action(CucumberLabel.new("UDS Preview Button"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.col-xs-5 > div.col-xs-2"))   
    add_action(CucumberLabel.new("Menu Button UDS"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.col-xs-5 > div.col-xs-1 > i.fa-ellipsis-v"))
    add_action(CucumberLabel.new("Menu Button UDS2"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-2 > div > div.col-xs-5 > div.col-xs-1 > i"))
    add_action(CucumberLabel.new("Make Default"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.col-xs-7.no-padding > div.col-xs-6.no-padding > div.col-xs-1.default-row.border-right.no-padding > i"))    
    add_action(CucumberLabel.new("Duplicate"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.col-xs-3 > div.col-xs-4.border-left.no-padding > div:nth-child(1) > div > i"))    
    add_action(CucumberLabel.new("Rearrange"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.col-xs-3 > div.col-xs-4.border-left.no-padding > div:nth-child(2) > div > i"))
    add_action(CucumberLabel.new("Delete"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.col-xs-3 > div.col-xs-4.border-left.no-padding > div:nth-child(3) > div > i"))
    add_action(CucumberLabel.new("UDS Preview Link"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.col-xs-3 > div.col-xs-4.border-right.previewWorkspace.preview"))   
    add_action(CucumberLabel.new("Close Link"), ClickAction.new, AccessHtmlElement.new(:css, "#mainOverlayRegion > div > div > div.previewRegion > div > div > div > div.closePreview > i")) 
    add_action(CucumberLabel.new("Customize"), ClickAction.new, AccessHtmlElement.new(:css, ".customize-screen"))      
    add_action(CucumberLabel.new("Delete2"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-2 > div > div.col-xs-3 > div.col-xs-4.border-left.no-padding > div:nth-child(3) > div > i"))
    add_action(CucumberLabel.new("Delete3"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-3 > div > div.col-xs-3 > div.col-xs-4.border-left.no-padding > div:nth-child(3) > div > i"))
    add_action(CucumberLabel.new("Delete4"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-4 > div > div.col-xs-3 > div.col-xs-4.border-left.no-padding > div:nth-child(3) > div > i"))
    add_action(CucumberLabel.new("Delete5"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-5 > div > div.col-xs-3 > div.col-xs-4.border-left.no-padding > div:nth-child(3) > div > i"))
    add_action(CucumberLabel.new("Launch"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1 > div > div.col-xs-3 > div.col-xs-4.launch-screen"))
    add_action(CucumberLabel.new("User Defined Workspace 1"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1")) 
    add_action(CucumberLabel.new("Menu Button UDS Copy"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1-copy > div > div.col-xs-5 > div.col-xs-1 > i.fa-ellipsis-v"))
    add_action(CucumberLabel.new("User Defined Workspace 1 Copy"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1-copy")) 
    add_action(CucumberLabel.new("Delete User Defined Workspace 1 Copy Link"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1-copy > div > div.col-xs-3 > div.col-xs-4.border-left.no-padding > div:nth-child(3) > div > i"))   
  end
end # Screen Manager View

class Applets < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Allergies Applet"), VerifyText.new, AccessHtmlElement.new(:css, "#gridsterPreview >ul >li >div")) 
    #add_action(CucumberLabel.new("Close Link"), ClickAction.new, AccessHtmlElement.new(:css, "#mainOverlayRegion > div > div > div.previewRegion > div > div > div > div.closePreview > i"))          
  end
end # Applets

Then(/^the user sees User Defined Workspace 1 flyout menu contains$/) do |table|
  driver = TestSupport.driver
  menu = driver.find_elements(:css, "#user-defined-workspace-1 > div > div.manageOptions.manager-open > ul > li")
  items = menu.length 
  expect(items).to_not eq(0)
  expect(items).to eq(table.rows.length)
  elements = ScreenManager.instance
  table.rows.each do |header_text|
    does_exist = elements.static_dom_element_exists? header_text[0]
    p "#{header_text[0]} was not found" unless does_exist
    expect(does_exist).to be_true
  end 
end 

#Perform any selection or button click
When(/^the user clicks "(.*?)"$ for "(.*?)"$/) do |html_action_element|
  navigation = ScreenManager.instance
  driver = TestSupport.driver
  TestSupport.driver.manage.window.resize_to(1600, 900)
  navigation.wait_until_action_element_visible(html_action_element, 20)
  expect(navigation.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
end

#Perform any selection or button click
When(/^the user clicks "(.*?)"$ for User Defined Workspace 1 Copy$/) do |html_action_element|
  navigation = ScreenManager.instance
  driver = TestSupport.driver
  TestSupport.driver.manage.window.resize_to(1300, 900)
  navigation.wait_until_action_element_visible(html_action_element, 10)
  expect(navigation.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
end

#Enter Search Term
When(/^the user enters "(.*?)" in the "(.*?)"$/) do |text, html_element|
  navigation = ScreenManager.instance
  navigation.wait_until_action_element_visible(html_element, DefaultLogin.wait_time)
  expect(navigation.perform_action(html_element, text)).to be_true, "Error when attempting to enter '#{text}' into #{html_element}"
end

When(/^update the test screen$/) do
  screen = ScreenManager.instance
  screen.wait_until_action_element_visible("Workspace Manager Button", 40)
  expect(screen.perform_action("Workspace Manager Button")).to be_true, "Error when attempting to open Workspace Manager"
  #TestSupport.driver.manage.window.maximize
  screen.wait_until_action_element_visible("workspace1", 40)
  expect(screen.perform_action("workspace1")).to be_true, "Error when attempting to click on workspace 1"
  #screen.wait_until_action_element_visible("Workspace Manager Delete Button", 40)
end

#Perform any selection or button click
When(/^the user clicks "(.*?)"$/) do |html_action_element|
  navigation = ScreenManager.instance
  driver = TestSupport.driver
  TestSupport.driver.manage.window.resize_to(1300, 900)
  navigation.wait_until_action_element_visible(html_action_element, 60)
  expect(navigation.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
end

#Perform any selection or button click
When(/^the user clicks "(.*?)" Link$/) do |html_action_element|
  navigation = Applets.instance
  driver = TestSupport.driver
  TestSupport.driver.manage.window.resize_to(1300, 900)
  navigation.wait_until_action_element_visible(html_action_element, 60)
  expect(navigation.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
end

Then(/^the user enters "([^"]*)" on workspace page filter field$/) do |element|
  con = ScreenManager.instance
  driver = TestSupport.driver
  TestSupport.wait_for_page_loaded
  con.wait_until_action_element_visible("Filter Value", 20)
  con.perform_action("Filter Value", element)   
end
  
Then(/^the "(.*?)" is not listed in the workspace manager page$/) do |arg1|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  wait.until { !ScreenManager.instance.static_dom_element_exists? arg1  }
end
    
def xpath_to_modal(_column1)
  #xpath = "//div[@id='modal-body']/descendant::div[contains(string(), '#{column1}')]/following-sibling::div[contains(string(), '#{column2}')]"
  xpath = "//*[@id='applets-carousel']/div[1]/div[2]/div[1]/div[1]"
  return xpath
end  

def drag_and_drop(_access_browser_instance)    
  con = ScreenManager.instance      
  expect(con.static_dom_element_exists?("sourceElement")).to be_true
  action = Actions.new("driver")
  WebElement draggable = driver.find_element(:xpath, ".//*[@id='applets-carousel']/div[1]/div[2]/div[1]/div[2]")

  driver = TestSupport.driver
  p driver
  driver.get("http://10.1.1.150/#Workspace1")
  
  p source_element = driver.find_element(:css, ".panel-heading .done-editing")
  sourceElement.click
  p '----------------'
        
  actions=Actions.new("driver")
  actions.clickAndHold(sourceElement).perform
  dispatchMouseEvent(sourceElement, "dragstart")
  # Target element exists only after 'dragstart' event so we locate it here.
  #WebElement targetElement = getElement(targetElementLocator);
  WebElement target_element = source_element[120, 30]
  actions.moveToElement(targetElement).perform
  dispatchMouseEvent(targetElement, "drop")
  dispatchMouseEvent(sourceElement, "dragend")
  actions.release.perform
  #sleep(10)
end

Given(/^user enter "(.*?)" in the search box$/) do |_search_value|
  driver = TestSupport.driver
  con = Ehmpui.instance
  TestSupport.wait_for_page_loaded
  login_elements = Search.instance
  login_elements.perform_action("search") if login_elements.static_dom_element_exists? "search"
  con.perform_action('Search')
  #expect(login_elements.static_dom_element_exists? "search").to be_true
end

Then(/^the user selects "(.*?)"$/) do |html_element|
  navigation = AppointmentsSinglePage.instance
  navigation.wait_until_element_visible(html_element, 10)
  expect(navigation.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
end

#Enter Search Term
When(/^the user enter "(.*?)" into the "(.*?)"$/) do |arg1, arg2|
  aa = Navigation.instance
  driver = TestSupport.driver
  TestSupport.wait_for_page_loaded 
  aa.wait_until_action_element_visible(arg2, 10)
  aa.perform_action(arg2, arg1)
  #TestSupport.wait_for_jquery_completed  
  #TestSupport.driver.save_screenshot("after_filter.png")
end

#Wait until the rows of the table are visible
When(/^the "(.*?)" contains (\d+) rows$/) do |arg1, arg2|
  aa = Navigation.instance
  TestSupport.wait_for_page_loaded
  expect(aa.wait_until_xpath_count(arg1, arg2, 20)).to be_true
end

class CoversheetDropdown < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Coversheet"), VerifyText.new, AccessHtmlElement.new(:css, "a[href='#cover-sheet']")) 
    add_verify(CucumberLabel.new("Timeline"), VerifyText.new, AccessHtmlElement.new(:css, "a[href='#news-feed']"))
    add_verify(CucumberLabel.new("Meds Review"), VerifyText.new, AccessHtmlElement.new(:css, "a[href='#medication-review']"))
    add_verify(CucumberLabel.new("Documents"), VerifyText.new, AccessHtmlElement.new(:css, "a[href='#documents-list']"))  
    add_verify(CucumberLabel.new("Overview"), VerifyText.new, AccessHtmlElement.new(:css, "a[href='#overview']"))
    add_verify(CucumberLabel.new("Summary"), VerifyText.new, AccessHtmlElement.new(:css, "a[href='#summary']"))
  end
end

Then(/^the CoversheetDropdown table contains headers$/) do |table|
  dropdown = CoversheetDropdown.instance
  table.rows.each do | expected_link |
    expect(dropdown.perform_verification(expected_link[0], expected_link[0])).to eq(true), "Dropdown did not contain #{expected_link[0]}"
  end
end

def verify_coversheet_dropdown_headers(_access_browser_instance, _table)
  driver = TestSupport.driver
  con = CoversheetDropdown.instance
  con.wait_until_action_element_visible("Coversheet", 60)
  expect(con.static_dom_element_exists?("Coversheet")).to be_true
end

class ActiveProblemsCoverSheet < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Description"), VerifyText.new, AccessHtmlElement.new(:id, "problems-problemText"))
    add_verify(CucumberLabel.new("Acuity"), VerifyContainsText.new, AccessHtmlElement.new(:id, "problems-acuityName"))
    add_verify(CucumberLabel.new("Status"), VerifyContainsText.new, AccessHtmlElement.new(:id, "problems-statusName"))
    add_action(CucumberLabel.new("Problems Filter Button"), ClickAction.new, AccessHtmlElement.new(:id, "grid-filter-button-problems"))
    add_action(CucumberLabel.new("Problems Filter Field"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, ".grid-filter input"))  
    add_action(CucumberLabel.new("problemsFilterSearch"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "#grid-filter-problems input"))
    add_action(CucumberLabel.new("problemsFilterSearch"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:xpath, "//div[@data-appletid='problems']/descendant::a[@id='grid-filter-problems']"))
    add_verify(CucumberLabel.new("filterSearch"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@id='grid-filter']/form/input"))
    add_action(CucumberLabel.new("filterSearch"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:xpath, "//*[@id='grid-filter']/form/input"))
    add_action(CucumberLabel.new("Problems Expand View"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=problems] .applet-maximize-button"))
  end
end # ProblemsCoverSheet

Then(/^the Active Problems coversheet table contains headers$/) do |table|
  verify_problem_table_headers(ActiveProblemsCoverSheet.instance, table)
end

class ActiveProblemsSinglePage < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Description"), VerifyText.new, AccessHtmlElement.new(:id, "problems-problemText"))
    add_verify(CucumberLabel.new("Standardized Description"), VerifyText.new, AccessHtmlElement.new(:id, "problems-standardizedDescription"))
    add_verify(CucumberLabel.new("Acuity"), VerifyContainsText.new, AccessHtmlElement.new(:id, "problems-acuityName")) 
    add_verify(CucumberLabel.new("Status"), VerifyContainsText.new, AccessHtmlElement.new(:id, "problems-statusName"))
    add_verify(CucumberLabel.new("Onset Date"), VerifyText.new, AccessHtmlElement.new(:id, "problems-onsetFormatted"))
    add_verify(CucumberLabel.new("Last Updated"), VerifyText.new, AccessHtmlElement.new(:id, "problems-updatedFormatted"))
    add_verify(CucumberLabel.new("Provider"), VerifyText.new, AccessHtmlElement.new(:id, "problems-providerDisplayName"))
    add_verify(CucumberLabel.new("Facility"), VerifyContainsText.new, AccessHtmlElement.new(:id, "problems-facilityMoniker"))
    add_verify(CucumberLabel.new("Comments"), VerifyText.new, AccessHtmlElement.new(:id, "problems-"))  
    add_action(CucumberLabel.new("Pagination"), SendKeysAction.new, AccessHtmlElement.new(:css, ".grid-footer"))
    add_verify(CucumberLabel.new("problemsTable"), VerifyText.new, AccessHtmlElement.new(:id, "data-grid-problems"))
    add_verify(CucumberLabel.new("Comments"), VerifyText.new, AccessHtmlElement.new(:id, "problems-"))
    data_grid_row_count = AccessHtmlElement.new(:xpath, "//table[@id='data-grid-problems']/descendant::tr")
    add_verify(CucumberLabel.new("Number of rows"), VerifyXpathCount.new(data_grid_row_count), data_grid_row_count)
    #add_action(CucumberLabel.new("Diabetes Mellitus Type II or unspecified"), ClickAction.new, AccessHtmlElement.new(:css, "#urn-va-problem-9E7A-3-183"))
    
    
  end
end # Active Problems Maximize/Expanded View

Then(/^the Active Problems Single Page contains headers$/) do |table|
  verify_problems_table_headers(ActiveProblemsSinglePage.instance, table)
end

class ActiveProblemsModalPage < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Close"), VerifyText.new, AccessHtmlElement.new(:id, "modal-close-button"))
    add_action(CucumberLabel.new("Close"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "modal-close-button"))
    add_action(CucumberLabel.new("Close"), ClickAction.new, AccessHtmlElement.new(:id, "modal-close-button"))
    add_action(CucumberLabel.new("Occasional, uncontrolled chest pain (ICD-9-CM 411.1)"), ClickAction.new, AccessHtmlElement.new(:id, "mainModalLabel"))
    add_action(CucumberLabel.new("ModalBody"), ClickAction.new, AccessHtmlElement.new(:id, "modal-body")) 
    add_verify(CucumberLabel.new("Primary ICD-9-CM:"), VerifyText.new, AccessHtmlElement.new(:xpath, "//*[@id='modal-body']/div/div[1]/div[1]"))
  end
end # Active Problems Modal View

def xpath_to_modal_row(column1, column2)
  #xpath = "//div[@id='modal-body']/descendant::div[contains(string(), '#{column1}')]/following-sibling::div[contains(string(), '#{column2}')]"
  xpath = "//div[@id='modal-body']/descendant::div[contains(@class, 'row')]/descendant::div[contains(string(), '#{column1}')]/following-sibling::div[contains(string(), '#{column2}')]"
  return xpath
end

def verify_problem_table_headers(access_browser_instance, table)
  driver = TestSupport.driver
  con = ActiveProblemsCoverSheet.instance
  con.wait_until_action_element_visible("Description", 60)
  expect(con.static_dom_element_exists?("Description")).to be_true
  headers = driver.find_elements(:css, "#data-grid-problems th") 
  expect(headers.length).to_not eq(0)
  expect(headers.length).to eq(table.rows.length)
  elements = access_browser_instance
  table.rows.each do |header_text|
    does_exist = elements.static_dom_element_exists? header_text[0]
    p "#{header_text[0]} was not found" unless does_exist
    expect(does_exist).to be_true
  end #table
end #verify_table_headers

def verify_problems_table_headers(access_browser_instance, table)
  con = ActiveProblemsSinglePage.instance
  driver = TestSupport.driver
  con.wait_until_action_element_visible("Description", 60)
  expect(con.static_dom_element_exists?("Description")).to be_true
  con.perform_verification("Description", "Hyperlipidemia")
  # headers = driver.find_elements(:xpath, "//*[@id='data-grid-problems']")
  #headers = driver.find_elements(:css, "#grid-panel-problems th") 
  headers = driver.find_elements(:css, "#data-grid-problems th") 
  expect(headers.length).to_not eq(0)
  expect(headers.length).to eq(table.rows.length)
  elements = access_browser_instance
  table.rows.each do |header_text|
    does_exist = elements.static_dom_element_exists? header_text[0]
    p "#{header_text[0]} was not found" unless does_exist
    expect(does_exist).to be_true
  end #table
end #verify_table_headers

