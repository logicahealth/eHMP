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

  @ehmp = PobOrdersApplet.new
  @ehmp.wait_until_fld_available_lab_test_drop_down_visible
  expect(@ehmp).to have_fld_available_lab_test_drop_down
  @ehmp.fld_available_lab_test_drop_down.click
  @ehmp.order_lab_tray.wait_until_fld_available_lab_test_input_box_visible
  @ehmp.order_lab_tray.fld_available_lab_test_input_box.set test_name
  @ehmp.order_lab_tray.fld_available_lab_test_input_box.native.send_keys(:enter)
end

When(/^the user navigates to Orders Expanded$/) do
  navigate_in_ehmp '#orders-full'
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @oc.applet_loaded }
end

Then(/^the Collection Sample is set "([^"]*)"$/) do |arg1|
  applet = PobOrdersApplet.new
  expect(applet).to have_order_lab_tray
  applet.order_lab_tray.wait_for_select_collection_sample
  
  
  start_time = Time.now
  begin
    expect(applet.order_lab_tray).to have_select_collection_sample
    selected_sample = applet.order_lab_tray.select_collection_sample.native.find_element(:css, '[selected]')
  rescue => e
    retry if Time.now < (start_time + 15)
    raise e
  end
  p selected_sample.text

  expect(selected_sample.text.upcase).to eq(arg1.upcase)
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
  applet = PobOrdersApplet.new
  expect(applet).to have_order_lab_tray
  applet.order_lab_tray.wait_for_select_specimen
  

  start_time = Time.now
  begin
    expect(applet.order_lab_tray).to have_select_specimen
    selected_specimen = applet.order_lab_tray.select_specimen.native.find_element(:css, '[selected]')
  rescue => e
    retry if Time.now < (start_time + 15)
    raise e
  end
  p selected_specimen.text

  expect(selected_specimen.text.upcase).to eq(arg1.upcase)
end

Then(/^the Collection Type is "([^"]*)"$/) do |arg1|
  applet = PobOrdersApplet.new
  expect(applet).to have_order_lab_tray
  applet.order_lab_tray.wait_for_select_collection_type

  start_time = Time.now
  begin
    expect(applet.order_lab_tray).to have_select_collection_type
    selected_type = applet.order_lab_tray.select_collection_type.native.find_element(:css, '[selected]')
  rescue => e
    retry if Time.now < (start_time + 15)
    raise e
  end
  p selected_type.text

  expect(selected_type.text.upcase).to eq(arg1.upcase)
end
