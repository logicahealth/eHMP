path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'all_applets.rb'

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

#Perform any selection or button click
When(/^the user clicks "(.*?)"$ for "(.*?)"$/) do |html_action_element|
  navigation = ScreenManager.instance
  driver = TestSupport.driver
  TestSupport.driver.manage.window.resize_to(1600, 900)
  navigation.wait_until_action_element_visible(html_action_element, 20)
  expect(navigation.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
end

#Enter Search Term
When(/^the user enters "(.*?)" in the "(.*?)"$/) do |text, html_element|
  navigation = ScreenManager.instance
  navigation.wait_until_action_element_visible(html_element, DefaultLogin.wait_time)
  expect(navigation.perform_action(html_element, text)).to be_true, "Error when attempting to enter '#{text}' into #{html_element}"
end

#Perform any selection or button click
When(/^the user clicks "(.*?)"$/) do |html_action_element|
  navigation = ScreenManager.instance
  driver = TestSupport.driver
  TestSupport.driver.manage.window.resize_to(1300, 900)
  navigation.wait_until_action_element_visible(html_action_element, 60)
  expect(navigation.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
end
  
Then(/^the "(.*?)" is not listed in the workspace manager page$/) do |arg1|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  wait.until { !ScreenManager.instance.static_dom_element_exists? arg1  }
end

def drag_and_drop(_access_browser_instance)    
  con = ScreenManager.instance      
  expect(con.static_dom_element_exists?("sourceElement")).to be_true
  action = Actions.new("driver")
  WebElement draggable = driver.find_element(:xpath, ".//*[@id='applets-carousel']/div[1]/div[2]/div[1]/div[2]")

  driver = TestSupport.driver
  p driver
  driver.get("http://IP        /#Workspace1")
  
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

#Wait until the rows of the table are visible
When(/^the "(.*?)" contains (\d+) rows$/) do |arg1, arg2|
  aa = Navigation.instance
  TestSupport.wait_for_page_loaded
  expect(aa.wait_until_xpath_count(arg1, arg2, 20)).to be_true
end

Then(/^the CoversheetDropdown table contains headers$/) do |table|
  ehmp = PobCoverSheet.new
  table.rows.each do | expected_link |
    ehmp.workspace_nav.workspace_links_by_name expected_link[0]
    expect(ehmp.workspace_nav.fld_named_workspace.length).to eq(1)

    actual_title = ehmp.workspace_nav.fld_named_workspace[0].text.upcase
    if ehmp.workspace_nav.fld_named_workspace_sr.length > 0
      actual_title.sub! ehmp.workspace_nav.fld_named_workspace_sr[0].text.upcase, ''
    end
    expect(actual_title.strip).to eq(expected_link[0].upcase)
  end
end

