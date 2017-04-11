class ImagingDocuments < AllApplets
  include Singleton
  def initialize
    super
  end 
end

class DocumentsColumnHeader < ADKContainer
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Modal Title"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".doc-detail-wrapper h4:first-child"))
    add_verify(CucumberLabel.new("Modal"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".doc-detail-wrapper"))
    #add_verify(CucumberLabel.new("Modal"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".documentDetail"))
    add_verify(CucumberLabel.new("Facility"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=facility]"))
    add_verify(CucumberLabel.new("Author"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=author]"))
    add_verify(CucumberLabel.new("Status"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=status]"))
    add_verify(CucumberLabel.new("Attending"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=attending]"))
    add_verify(CucumberLabel.new("Date/Time"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=date-time]"))
    add_verify(CucumberLabel.new("Expected Cosigner"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=cosigner]"))
    add_verify(CucumberLabel.new("Type"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=type]"))
    
    add_verify(CucumberLabel.new("Providers"), VerifyText.new, AccessHtmlElement.new(:css, "[data-detail-label=providers]"))
    add_verify(CucumberLabel.new("Documents Page Title"), VerifyText.new, AccessHtmlElement.new(:css, ".panel-title-label"))
    add_verify(CucumberLabel.new("Header1"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=documents-dateDisplay]"))
    add_verify(CucumberLabel.new("Header2"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=documents-localTitle]"))
    add_verify(CucumberLabel.new("Header3"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=documents-kind]"))
    add_verify(CucumberLabel.new("Header5"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=documents-facilityName]"))
    add_verify(CucumberLabel.new("Header4"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=documents-authorDisplayName]"))

    add_action(CucumberLabel.new("Date"), ClickAction.new, AccessHtmlElement.new(:link_text, "Date"))
    add_action(CucumberLabel.new("Type"), ClickAction.new, AccessHtmlElement.new(:css, "[data-header-instanceid='documents-kind'] a"))
    add_action(CucumberLabel.new("Facility"), ClickAction.new, AccessHtmlElement.new(:css, "[data-header-instanceid='documents-facilityName'] a")) 
    add_action(CucumberLabel.new("Entered By"), ClickAction.new, AccessHtmlElement.new(:link_text, "Entered By"))
    add_action(CucumberLabel.new("Author"), ClickAction.new, AccessHtmlElement.new(:css, "[data-header-instanceid='documents-authorDisplayName'] a"))
    add_action(CucumberLabel.new("Description"), ClickAction.new, AccessHtmlElement.new(:css, "[data-header-instanceid='documents-localTitle'] a"))
  end
end 

And(/^user views the first "(.*?)" detail view$/) do |event_type|
  documents_applet = DocumentsAppletModalDetail.instance
  expect(documents_applet.wait_until_xpath_count_greater_than('Documents Rows', 0)).to eq(true), "Test requires at least 1 row to be displayed"
  first_event_row = "First " + event_type + " Row"
  expect(documents_applet.perform_action(first_event_row)).to eq(true)
end
When(/^user clicks the first thumbnail$/) do
  documents_applet_modal = DocumentsAppletModalDetail.instance
  first_event = "First Thumbnail"
  execute_script("$('#modal-body').scrollTop(1000)")
  expect(documents_applet_modal.perform_action(first_event)).to eq(true)
end 

Then(/^User launches third party software and views image using the third party software.$/) do
  driver = TestSupport.driver
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  modal = driver.find_element(:css, "[id='mainModalDialog']")
  driver.manage.window.resize_to(1080, 3000)
  driver.switch_to.active_element
  thumbnail = wait.until {
    element = driver.find_element(:css, "[id='thumbnails-region'] img")
    element.location_once_scrolled_into_view
    element if element.displayed?
  }
  driver.execute_script("$('#modal-body').scrollTop(1000)")
  thumbnail.click
  driver.switch_to.window(driver.window_handles.last) {
    wait = Selenium::WebDriver::Wait.new(:timeout => 120)
    wait.until {
      expect(driver.title.include? "Viewer").to be_true
    }
  }
end 
