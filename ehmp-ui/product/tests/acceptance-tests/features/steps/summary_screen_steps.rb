path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'AccessBrowserV2.rb'
require 'clinical_reminders.rb'

class SummaryScreen < GlobalDateFilter
  include Singleton
  def initialize
    super
    @@applet_count = AccessHtmlElement.new(:css, "#summary [data-appletid]")
    add_verify(CucumberLabel.new("Number of Applets"), VerifyXpathCount.new(@@applet_count), @@applet_count)
  end
end

def verify_on_summaryview
  @ehmp = PobSummaryScreen.new
  @ehmp.menu.wait_until_fld_screen_name_visible
  expect(@ehmp.menu.fld_screen_name.text.upcase).to eq('SUMMARY')

  max_attempts = 1
  begin
    # using 'old framework' because page objects can't find one of the applets
    expect(SummaryScreen.instance.wait_until_xpath_count("Number of Applets", 10, 60)).to be_true
  rescue => e 
     max_attempts -= 1
     TestSupport.driver.navigate.refresh if max_attempts >= 0
     retry if max_attempts >= 0
     p @ehmp.appletids_on_screen
     raise e if max_attempts < 0
  end

  timeout = DefaultTiming.default_table_row_load_time * 2
  wait = Selenium::WebDriver::Wait.new(:timeout => timeout)
  begin
    wait.until { @ehmp.summary_applets_loaded? }
  rescue
    expect(@ehmp.summary_applets_loaded? true).to eq(true), "applets did not load after #{timeout} sec"
  end

  @ehmp = PobHeaderFooter.new
  @ehmp.wait_until_header_footer_elements_loaded
end

Then(/^the Summary View is active by default$/) do
  verify_on_summaryview
end

Then(/^Summary View is active$/) do
  navigate_in_ehmp '#/patient/summary'
  verify_on_summaryview
  @ehmp_for_reload = PobSummaryScreen.new
end

Then(/^the user is returned to the summary view$/) do
  verify_on_summaryview
end

Then(/^the "([^"]*)" \("([^"]*)"\) summary applet is displayed$/) do |descripter, appletid|
  verify_applet_exists(appletid)
  verify_applet_view_type('summary', appletid)
end

Then(/^the "([^"]*)" \("([^"]*)"\) trend applet is displayed$/) do |descripter, appletid|
  verify_applet_exists(appletid)
  verify_applet_view_type('gist', appletid)
end

Then(/^the "([^"]*)" \("([^"]*)"\) expanded applet is displayed$/) do |descripter, appletid|
  verify_applet_exists(appletid)
  verify_applet_view_type('expanded', appletid)
end
