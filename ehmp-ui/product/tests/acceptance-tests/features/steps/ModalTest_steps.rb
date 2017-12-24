path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'AccessBrowserV2.rb'

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
  modal = ModalElements.new
  begin
    modal.wait_until_fld_main_modal_invisible(20)
    modal.wait_until_fld_main_modal_fade_in_invisible(20)
  rescue Exception => e
    p "Exception received: #{e}"
    take_screenshot("wait_until_modal_is_not_displayed")
    raise e 
  end
end

Then(/^the modal is closed$/) do
  wait_until_modal_is_not_displayed
end

