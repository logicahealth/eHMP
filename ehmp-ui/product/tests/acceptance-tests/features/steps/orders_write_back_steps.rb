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
    add_action(CucumberLabel.new("Order Add Button"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=orders] .applet-add-button"))
    add_action(CucumberLabel.new("Available Lab Test search input"), SendKeysAction.new, AccessHtmlElement.new(:css, "#availableLabTests"))
    add_action(CucumberLabel.new("Select Lab Test"), SendKeysAction.new, AccessHtmlElement.new(:css, ".tt-suggestions.tt-suggestion:nth-child(2)"))
    add_verify(CucumberLabel.new("Order Modal Title"), VerifyText.new, AccessHtmlElement.new(:css, '[id^="main-workflow-label-"]'))
    add_verify(CucumberLabel.new("Order Modal Loaded"), VerifyText.new, AccessHtmlElement.new(:css, ".modal-content"))
    add_verify(CucumberLabel.new("Growl Alert"), VerifyText.new, AccessHtmlElement.new(:css, ".growl-alert"))
    add_verify(CucumberLabel.new("Loading Msg"), VerifyText.new, AccessHtmlElement.new(:css, ".fa.fa-spinner.fa-spin"))
    add_action(CucumberLabel.new("Select Test"), ClickAction.new, AccessHtmlElement.new(:css, ".tt-suggestion"))
    add_action(CucumberLabel.new("Accept Duplicate Order"), ClickAction.new, AccessHtmlElement.new(:css, "#mainModalDialog .btn-primary"))
    add_action(CucumberLabel.new("Close Order"), ClickAction.new, AccessHtmlElement.new(:css, "#mainAlert .btn-primary"))
    add_action(CucumberLabel.new("Order GDF 24 Hours"), ClickAction.new, AccessHtmlElement.new(:id, "24hr-range-orders"))
    add_verify(CucumberLabel.new("spinner"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".fa.fa-spinner.fa-spin"))
    add_verify(CucumberLabel.new("Verify Order"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#data-grid-orders tr:nth-child(1) td:nth-child(3)"))
    add_action(CucumberLabel.new("First Order Created"), ClickAction.new, AccessHtmlElement.new(:css, "#data-grid-orders tr:nth-child(1) td:nth-child(3)"))
    add_action(CucumberLabel.new("Sign Order"), ClickAction.new, AccessHtmlElement.new(:css, "div[data-appletid='orders'] #ordersSignOrder"))
    add_action(CucumberLabel.new("Discontinue Order"), ClickAction.new, AccessHtmlElement.new(:css, "div[data-appletid='orders'] #ordersDiscontinueOrder"))
    add_action(CucumberLabel.new("signature input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#signature-code"))
    add_action(CucumberLabel.new("Accept Signature"), ClickAction.new, AccessHtmlElement.new(:css, "button.btn.btn-primary.alert-continue"))
    add_action(CucumberLabel.new("Accept Discontinue"), ClickAction.new, AccessHtmlElement.new(:css, "button.btn.btn-primary.alert-continue"))
    add_verify(CucumberLabel.new("Verify Status"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#data-grid-orders tr:nth-child(1) td:nth-child(2)"))
    add_verify(CucumberLabel.new("Sign Page Loaded"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@id='order-modal-content']/descendant::div[contains(string(),'Send patient to lab')]"))
    #buttons
    add_action(CucumberLabel.new("Accept"), ClickAction.new, AccessHtmlElement.new(:css, "#acceptDrpDwnContainer"))
    add_action(CucumberLabel.new("Cancel"), ClickAction.new, AccessHtmlElement.new(:css, "#cancelButton"))
    add_action(CucumberLabel.new("Delete"), ClickAction.new, AccessHtmlElement.new(:css, "#deleteButton"))
    #form fields
    add_action(CucumberLabel.new("available lab tests combo box"), ComboSelectAction.new, AccessHtmlElement.new(:id, "availableLabTests"))
    add_action(CucumberLabel.new("available lab tests input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "[x-is-labelledby='select2-availableLabTests-container']"))
    add_action(CucumberLabel.new("urgency drop down"), ComboSelectAction.new, AccessHtmlElement.new(:id, "urgency"))
    add_verify(CucumberLabel.new("urgency drop down verify"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#urgency"))
    add_action(CucumberLabel.new("collection date input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#collectionDate"))
    add_action(CucumberLabel.new("collection time input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#collectionTime"))
    add_action(CucumberLabel.new("how long input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#howLong"))
    add_action(CucumberLabel.new("how often drop down"), ComboSelectAction.new, AccessHtmlElement.new(:id, "howOften"))
    add_action(CucumberLabel.new("collection sample drop down"), ComboSelectAction.new, AccessHtmlElement.new(:id, "collectionSample"))
    add_action(CucumberLabel.new("collection type drop down"), ComboSelectAction.new, AccessHtmlElement.new(:id, "collectionType"))
    add_action(CucumberLabel.new("specimen drop down"), ComboSelectAction.new, AccessHtmlElement.new(:id, "specimen"))
    add_action(CucumberLabel.new("select an activity drop down"), ComboSelectAction.new, AccessHtmlElement.new(:id, "availableActivity"))
    add_action(CucumberLabel.new("problem relationship drop down"), ComboSelectAction.new, AccessHtmlElement.new(:id, "problemRelationship"))
    add_action(CucumberLabel.new("annotation input box"), SendKeysAction.new, AccessHtmlElement.new(:css, "#annotation"))
  end
end 

class LabOrderWriteBackLabels < AllApplets
  include Singleton
  def initialize
    super    
    #Labels
    add_verify(CucumberLabel.new("available lab tests"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='availableLabTests']"))
    add_verify(CucumberLabel.new("urgency"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='urgency']"))
    add_verify(CucumberLabel.new("collection date"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='collectionDate']"))
    add_verify(CucumberLabel.new("collection time"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='collectionTime']"))
    add_verify(CucumberLabel.new("how long"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='howLong']"))
    add_verify(CucumberLabel.new("how often"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='howOften']"))
    add_verify(CucumberLabel.new("collection sample"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='collectionSample']"))
    add_verify(CucumberLabel.new("collection type"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='collectionType']"))
    add_verify(CucumberLabel.new("specimen"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='specimen']"))
    add_verify(CucumberLabel.new("select an activity"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='availableActivity']"))
    add_verify(CucumberLabel.new("preview order"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".order-preview"))
    add_verify(CucumberLabel.new("note object preview"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".addToNote"))
    add_verify(CucumberLabel.new("problem relationship"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='problemRelationship']"))
    add_verify(CucumberLabel.new("annotation"), VerifyText.new, AccessHtmlElement.new(:css, "label[for='annotation']"))
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

Then(/^the add order detail modal displays labels$/) do |table|
  verify_order_modal_details(table, LabOrderWriteBackLabels.instance)
end

Then(/^add order detail modal displays fields$/) do |table|
  verify_order_modal_details(table, LabOrderWriteBack.instance)
end

def verify_order_modal_details(table, modal)
  expect(LabOrderWriteBack.instance.wait_until_action_element_visible("Order Modal Loaded", DefaultLogin.wait_time)).to be_true
  table.rows.each do | row |
    expect(modal.am_i_visible?(row[0])).to eq(true), "'#{row[0]}' is not visible"
  end
end

def verify_order_modal_disabled_fields(table, modal)
  expect(LabOrderWriteBack.instance.wait_until_action_element_visible("Order Modal Loaded", DefaultLogin.wait_time)).to be_true
  table.rows.each do | row |
    expect(modal.get_element(row[0]).displayed?).to eq(true), "#{row[0]} is not displayed"
    expect(modal.get_element(row[0]).enabled?).to eq(false), "#{row[0]} is enabled"
  end
end

Then(/^add order detail modal has disabled the fields$/) do |table|
  verify_order_modal_disabled_fields(table, LabOrderWriteBack.instance)
end

Then(/^the add order detail modal has the enabled buttons$/) do |table|
  sleep(5)
  verify_order_modal_details(table, LabOrderWriteBack.instance)
end

Then(/^the add order detail modal has the disabled buttons$/) do |table|
  verify_order_modal_disabled_fields(table, LabOrderWriteBack.instance)
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

Then(/^the user validates the order to be "([^"]*)"$/) do |test_name|
  aa = LabOrderWriteBack.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  aa.add_verify(CucumberLabel.new("validate order"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[contains(@class, 'order-preview') and contains(string(), '#{test_name.upcase}')]"))
#  wait.until { aa.static_dom_element_exists?("urgency drop down") }
#  wait.until { aa.am_i_visible?("urgency drop down") } 
  wait.until { aa.am_i_visible?("validate order") } 
  expect(aa.perform_verification("urgency drop down verify", "ROUTINE")).to eq(true)
  expect(aa.perform_verification("preview order", test_name)).to eq(true)
end

Then(/^user accepts the order$/) do
  aa = LabOrderWriteBack.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  wait.until { aa.am_i_visible?("Accept") } 
  expect(aa.perform_action("Accept")).to eq(true)
  sleep(10)
  if aa.am_i_visible?("Accept Duplicate Order")  
    expect(aa.perform_action("Accept Duplicate Order")).to eq(true)
  end
  wait_for_growl_notification
  wait.until { aa.static_dom_element_exists?("urgency drop down") }
  wait.until { aa.get_element("urgency drop down").enabled? == false }
  expect(aa.perform_action("Cancel")).to eq(true)
  expect(aa.perform_action("Close Order")).to eq(true)
end

Then(/^verifies the above "([^"]*)" order is added to patient record$/) do |order_name|
  aa = LabOrderWriteBack.instance
  orders_applet = OrdersContainer.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { orders_applet.applet_loaded }  
  expect(aa.perform_action("Order GDF 24 Hours")).to eq(true)
  expect(aa.perform_verification('Verify Order', order_name)).to eq(true)
end

Then(/^user opens the detail view of the order "([^"]*)"$/) do |order_name|
  aa = LabOrderWriteBack.instance
  expect(aa.perform_action('First Order Created', '')).to eq(true)
  expect(aa.wait_until_action_element_visible("Sign Order", DefaultLogin.wait_time)).to be_true
end

Then(/^user signs the order as "([^"]*)"$/) do |sig_code|
  aa = LabOrderWriteBack.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { aa.static_dom_element_exists?("Sign Page Loaded") }
  expect(aa.perform_action('Sign Order')).to eq(true)
  wait.until { aa.static_dom_element_exists?("signature input box") }
  expect(aa.perform_action('signature input box', sig_code)).to eq(true)
  expect(aa.perform_action('Accept Signature', '')).to eq(true)
  wait_for_growl_notification
end

Then(/^the user verifies order status changes to "([^"]*)"$/) do |order_status|
  aa = LabOrderWriteBack.instance
  expect(aa.perform_verification('Verify Status', order_status)).to eq(true)
end

Then(/^user discontinues the order$/) do
  aa = LabOrderWriteBack.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  wait.until { aa.static_dom_element_exists?("Sign Page Loaded") }
  expect(aa.perform_action('Discontinue Order')).to eq(true)
  wait.until { aa.am_i_visible?("Accept Discontinue") }
  expect(aa.perform_action('Accept Discontinue', '')).to eq(true)
  sleep(10)
  wait_for_growl_notification
end

def wait_for_growl_notification
  aa = LabOrderWriteBack.instance
  expect(aa.wait_until_action_element_visible("Growl Alert", 60)).to be_true
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { element_is_not_present?(:css, 'div.growl-alert') }
end

When(/^the user navigates to Orders Expanded$/) do
  navigate_in_ehmp '#orders-full'
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @oc.applet_loaded }
end

Then(/^the Collection Sample is set "([^"]*)"$/) do |arg1|
  # aa = LabOrderWriteBack.instance
  # aa.add_verify(CucumberLabel.new('Collection Sample Value'), VerifyContainsText.new, AccessHtmlElement.new(:css, '#collectionSample'))
  # expect(aa.perform_verification('Collection Sample Value', arg1)).to eq(true)
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
