path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'AccessBrowserV2.rb'
require 'HTMLVerification.rb'

class HasFocus
  include HTMLVerification
  def initialize(css)
    @error_message = 'no error message'
    @css = css
  end

  def verify(html_element, expect_focus)
    # has_focus = html_element.attribute('class').include?('hasFocus')  
    p TestSupport.driver.switch_to.active_element.attribute('id')
    has_focus = TestSupport.driver.switch_to.active_element == TestSupport.driver.find_element(:css, @css)  
    p "#{has_focus} vs #{expect_focus}"
    return has_focus == expect_focus
  end

  def pull_value(html_element, _value)
    text = html_element.attribute('class')
  end
end

class TabActive
  include HTMLVerification
  def initialize
    @error_message = 'no error message'
  end

  def verify(html_element, expect_active)
    has_focus = html_element.attribute('class').include?('active')
    p "#{has_focus} vs #{expect_active}"
    return has_focus == expect_active
  end

  def pull_value(html_element, _value)
    text = html_element.attribute('class')
  end
end

Then(/^the staff view screen displays My CPRS list in the sidebar tray$/) do
  staff_view = PobStaffView.new
  expect(staff_view.wait_for_closed_cprslist).to eq(true), "Unselected My CPRS list button is not visible"
  expect(staff_view.wait_for_btn_open_cprslist).to eq(true)
  expect(staff_view.btn_open_cprslist.text.upcase).to eq("MY CPRS LIST")
end

When(/^the user opens the My CPRS list tray$/) do
  staff_view = PobStaffView.new
  expect(staff_view.wait_for_closed_cprslist).to eq(true), "Unselected My CPRS list button is not visible"
  expect(staff_view.wait_for_btn_open_cprslist).to eq(true), "Button to open My CPRS list tray is not visible"
  staff_view.btn_open_cprslist.click
  expect(staff_view.wait_for_open_cprslist).to eq(true), "My CPRS list tray did not open"
end

When(/^the My CPRS list tray displays a close x button$/) do
  cprs_tray = PobStaffView.new
  expect(cprs_tray.wait_for_btn_search_tray_close).to eq(true), "X (close) button in tray header did not display"
end

When(/^the My CPRS list tray displays a help button$/) do
  cprs_tray = PobStaffView.new
  expect(cprs_tray.wait_for_btn_search_tray_help).to eq(true), "Help button in tray header did not display"
end

When(/^the My CPRS list Tray table headers are$/) do |table|
  cprs_tray = PobStaffView.new
  wait_until { cprs_tray.fld_cprs_result_headers.length > 0 }
  displayed_headers = cprs_tray.fld_cprs_result_headers_text

  table.rows.each do | expected_header |
    expect(displayed_headers).to include expected_header[0].upcase
  end
end
