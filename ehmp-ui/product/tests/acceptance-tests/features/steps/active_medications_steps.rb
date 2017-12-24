path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'AccessBrowserV2.rb'

Then(/^the Active & Recent Medications Applet table finishes loading$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  applet = PobActiveRecentMedApplet.new
  wait.until { applet.summary_applet_loaded? }
end

Then(/^the modal title starts with "([^"]*)"$/) do |arg1|
  modal = ModalElements.new
  expect(modal.wait_for_fld_modal_title).to eq(true)
  expect(modal.fld_modal_title.text.upcase).to start_with arg1.upcase
end

Then(/^the modal displays Order Hx$/) do
  modal = ActiveRecentMedModal.new
  expect(modal.wait_for_fld_order_history_label).to eq(true), "Expected a label for Order History"
  expect(modal.fld_order_history_label.text.upcase).to eq('Order History'.upcase)
  expect(modal.order_history_dates.length).to be > 0
end

Then(/^the modal displays Order Detail Panel$/) do
  modal = ActiveRecentMedModal.new
  expect(modal.wait_for_fld_med_detail).to eq(true), "Expected modal to display a detail panel"
end

When(/^the Active Medications Applet table contains data rows$/) do
  applet = PobActiveRecentMedApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet.summary_applet_loaded? }
  expect(applet.tbl_active_meds_grid.length).to be > 0
end

When(/^the Active Medications Gist Applet table contains data rows$/) do
  applet = PobActiveRecentMedApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet.applet_gist_loaded? }
  expect(applet.fld_active_meds_gist.length).to be > 0
end

When(/^user refreshes Active Medications Applet$/) do
  applet_refresh_action("activeMeds")
end

Then(/^the message on the Active Medications Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("activeMeds", message_text)
end

Then(/^the Active and Recent Medications applet is titled "([^"]*)"$/) do |title|
  applet = PobActiveRecentMedApplet.new
  expect(applet.wait_for_fld_applet_title).to eq(true), "Expected applet to display title"
  expect(applet.fld_applet_title.text.upcase).to eq(title.upcase)
end

Then(/^the Active & Recent Medications Applet table contains headers$/) do |table|
  applet = PobActiveRecentMedApplet.new
  applet_headers = applet.summary_headers_text
  table.headers.each do | header |
    expect(applet_headers).to include header
  end
end

When(/^the user navigates to the expanded Active Medications Applet$/) do
  navigate_in_ehmp "#/patient/medication-review"
end

When(/^the user expands the Active & Recent Medications applet$/) do
  ehmp = PobActiveRecentMedApplet.new
  ehmp.wait_for_btn_applet_expand_view
  expect(ehmp).to have_btn_applet_expand_view
  ehmp.btn_applet_expand_view.click
  ehmp.wait_until_btn_applet_expand_view_invisible
end

When(/^the user minimizes the Meds Review applet$/) do
  ehmp = PobMedsReview.new
  ehmp.wait_for_btn_applet_minimize
  expect(ehmp).to have_btn_applet_minimize
  ehmp.btn_applet_minimize.click
  ehmp.wait_until_btn_applet_minimize_invisible
end
