path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'AccessBrowserV2.rb'

class ModalTest < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Close Button"), ClickAction.new, AccessHtmlElement.new(:css, "#modal-close-button")) 
    add_action(CucumberLabel.new("Cancel Button"), ClickAction.new, AccessHtmlElement.new(:css, "#modal-footer div div.pull-right #cancelBtn"))
    add_verify(CucumberLabel.new("ModalTitle"), VerifyContainsText.new, AccessHtmlElement.new(:id, "mainModalLabel"))
  end
end

Then(/^a modal with the title "(.*?)" is displayed$/) do |title|
  expect(ModalTest.instance.perform_verification("ModalTitle", title)).to be_true
end

When(/^the user clicks the modal "(.*?)"$/) do |button|
  con = ModalTest.instance
  expect(con.perform_action(button)).to be_true
end

Then(/^the user clicks the modal Close Button$/) do
  modal = ModalElements.new
  modal.wait_until_btn_modal_close_visible
  expect(modal).to have_btn_modal_close
  modal.btn_modal_close.click
end

def element_is_not_present?(how, what)
  driver = TestSupport.driver
  driver.find_element(how, what)
  return false
rescue
  return true
end

def wait_until_modal_is_not_displayed
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time) # seconds # wait until list opens
  # wait.until { !driver.find_element(:id, 'mainModal').displayed? }
  wait.until { element_is_not_present?(:id, 'mainModal') }
  wait.until { element_is_not_present?(:css, 'div.modal-backdrop.fade.in') }
end

Then(/^the modal is closed$/) do
  wait_until_modal_is_not_displayed
end

