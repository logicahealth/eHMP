path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'all_applets.rb'

class LabOrderWriteBack < AllApplets
  include Singleton
  def initialize
    super
    # keep
    add_action(CucumberLabel.new("Order Add Button"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=orders] .applet-add-button"))
    add_verify(CucumberLabel.new("Order Modal Title"), VerifyText.new, AccessHtmlElement.new(:css, '[id^="main-workflow-label-"]'))
    add_verify(CucumberLabel.new("Order Modal Loaded"), VerifyText.new, AccessHtmlElement.new(:css, ".modal-content"))
  end
end

Then(/^user adds a new order$/) do
  aa = LabOrderWriteBack.instance
  expect(aa.perform_action("Order Add Button")).to eq(true)
end

Then(/^add order modal detail title says "([^"]*)"$/) do |modal_title|
  aa = LabOrderWriteBack.instance
  expect(aa.perform_verification("Order Modal Title", modal_title)).to eq(true)
end

Then(/^the user orders "([^"]*)" lab test$/) do |test_name|
  aa = LabOrderWriteBack.instance
  
  #  expect(aa.perform_action("available lab tests input box", test_name)).to eq(true)
  #  inputting one character at a time, whole string doesn't work for certain test names.
  #  p "**************"
  aa.add_action(CucumberLabel.new('a1'), ClickAction.new, AccessHtmlElement.new(:css, 'div.availableLabTests [aria-labelledby=select2-availableLabTests-container]'))
  expect(aa.perform_action('a1')).to eq(true)

  aa.add_action(CucumberLabel.new('a2'), SendKeysAction.new, AccessHtmlElement.new(:css, 'input.select2-search__field'))
  expect(aa.perform_action('a2', test_name)).to eq(true)
  aa.add_action(CucumberLabel.new("select a lab test"), ClickAction.new, AccessHtmlElement.new(:xpath, "//li[contains(@class, 'select2-results__option') and contains(string(), '#{test_name}')]"))
  expect(aa.perform_action("select a lab test")).to eq(true)
end

When(/^the user navigates to Orders Expanded$/) do
  navigate_in_ehmp '#orders-full'
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @oc.applet_loaded }
end

Then(/^the Collection Sample is set "([^"]*)"$/) do |arg1|
  driver = TestSupport.driver
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  wait.until { displayed_but_not_enabled?(:css, '#collectionSample', arg1) }
end

def displayed_but_not_enabled?(how, path, text)
  driver = TestSupport.driver
  html_element = driver.find_element(how, path)
  html_element.location_once_scrolled_into_view
  return false unless html_element.displayed?
  p driver.find_element(how, path).text
  return driver.find_element(how, path).text.include?(text)
rescue Exception => e 
  p e
  return false
end #method

Then(/^the Specimen is set "([^"]*)"$/) do |arg1|
  aa = LabOrderWriteBack.instance
  driver = TestSupport.driver
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  wait.until { displayed_but_not_enabled?(:css, '#specimen', arg1) }
end

Then(/^the Collection Type is "([^"]*)"$/) do |arg1|
  aa = LabOrderWriteBack.instance
  aa.add_verify(CucumberLabel.new('Collection Type Value'), VerifyContainsText.new, AccessHtmlElement.new(:css, '#collectionType'))
  expect(aa.perform_verification('Collection Type Value', arg1)).to eq(true)
end

Then(/^the Preview Order is "([^"]*)"$/) do |arg1|
  aa = LabOrderWriteBack.instance
  aa.add_verify(CucumberLabel.new('Preview Order Value'), VerifyContainsText.new, AccessHtmlElement.new(:css, 'div.order-preview div'))
  expect(aa.perform_verification('Preview Order Value', arg1)).to eq(true)
end
