path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'AccessBrowserV2.rb'

class ActiveMedications < AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super
    @appletid = 'activeMeds'
    appletid_css = "[data-appletid=#{@appletid}]"
    add_action(CucumberLabel.new("Amoxapine Tablet Detail View Icon"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[data-appletid=activeMeds]/descendant::a[@id='info-button-sidekick-detailView']"))
    add_verify(CucumberLabel.new("Empty Record"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#{appletid_css} tr.empty"))
    rows = AccessHtmlElement.new(:css, '#data-grid-activeMeds tbody tr.selectable')
    add_verify(CucumberLabel.new('row count'), VerifyXpathCount.new(rows), rows)

    add_action(CucumberLabel.new('first row'), ClickAction.new, AccessHtmlElement.new(:css, '#data-grid-activeMeds tbody tr.selectable:nth-child(1)'))

    add_action(CucumberLabel.new('Applet Toolbar'), ClickAction.new, AccessHtmlElement.new(:id, 'info-button-template'))
    add_action(CucumberLabel.new('Applet Toolbar Info'), ClickAction.new, AccessHtmlElement.new(:css, '#info-button-template #info-button'))
    add_action(CucumberLabel.new('Applet Toolbar Detail'), ClickAction.new, AccessHtmlElement.new(:css, '#info-button-template #info-button-sidekick-detailView'))
    
    # Modal elements
    add_verify(CucumberLabel.new('Modal Title'), VerifyContainsText.new, AccessHtmlElement.new(:id, 'mainModalLabel'))
    add_verify(CucumberLabel.new('Order Hx'), VerifyText.new, AccessHtmlElement.new(:xpath, "//*[@class='order-historylist']/preceding-sibling::*"))
    add_verify(CucumberLabel.new('Order Detail Panel'), VerifyText.new, AccessHtmlElement.new(:css, 'div.medication-detail'))

    add_applet_buttons appletid_css  
    add_applet_title appletid_css
    add_toolbar_buttons

    add_verify(CucumberLabel.new("Header - Medication"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#data-grid-activeMeds [data-header-instanceid=activeMeds-name] a"))
    add_verify(CucumberLabel.new("Header - Status"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#data-grid-activeMeds [data-header-instanceid=activeMeds-vaStatus] a"))
    add_verify(CucumberLabel.new("Header - Facility"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#data-grid-activeMeds [data-header-instanceid=activeMeds-facilityMoniker] a"))
  end

  def rows
    TestSupport.driver.find_elements(:css, '#data-grid-activeMeds tbody tr.selectable')
  end

  def applet_loaded?
    return true if am_i_visible? 'Empty Record'
    return TestSupport.driver.find_elements(:css, '#data-grid-activeMeds tbody tr.selectable').length > 0
  rescue => e 
    # p e
    false
  end
end

Then(/^the Active & Recent Medications Applet table finishes loading$/) do
  active_medications = ActiveMedications.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { active_medications.applet_loaded? }
end

Given(/^the Active & Recent Medications Applet displays at least (\d+) row$/) do |num_result|
  active_medications = ActiveMedications.instance
  expect(active_medications.wait_until_xpath_count_greater_than('row count', num_result.to_i)).to eq(true), "Test requires at least one result to verify functionality"
end

When(/^the user views the details for the first Active & Recent Medications$/) do
  active_medications = ActiveMedications.instance
  expect(active_medications.perform_action('first row')).to eq(true)
  #expect(active_medications.perform_action('Applet Toolbar Detail')).to eq(true)
  expect(active_medications.perform_action('Detail View Button')).to eq(true)
end

Then(/^the modal title starts with "([^"]*)"$/) do |arg1|
  active_medications = ActiveMedications.instance
  expect(active_medications.perform_verification('Modal Title', arg1)).to eq(true)
end

Then(/^the modal displays Order Hx$/) do
  active_medications = ActiveMedications.instance
  expect(active_medications.perform_verification('Order Hx', 'Order History')).to eq(true)
end

Then(/^the modal displays Order Detail Panel$/) do
  active_medications = ActiveMedications.instance
  expect(active_medications.am_i_visible? 'Order Detail Panel').to eq(true)
end

When(/^the Active Medications Applet table contains data rows$/) do
  compare_item_counts("#data-grid-activeMeds tr")
end

When(/^the Active Medications Gist Applet table contains data rows$/) do
  compare_item_counts("[data-appletid=activeMeds] div.gist-item-list div.gist-item", 0)
end

When(/^user refreshes Active Medications Applet$/) do
  applet_refresh_action("activeMeds")
end

Then(/^the message on the Active Medications Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("activeMeds", message_text)
end

Then(/^the Active and Recent Medications applet is titled "([^"]*)"$/) do |title|
  active_medications = ActiveMedications.instance
  expect(active_medications.wait_until_action_element_visible("Title", DefaultLogin.wait_time)).to be_true
  expect(active_medications.perform_verification("Title", title)).to be_true
end

Then(/^the Active & Recent Medications Applet table contains headers$/) do |table|
  active_medications = ActiveMedications.instance
  table.headers.each do | row |
    header = row
    expect(active_medications.perform_verification("Header - #{header}", header)).to eq(true)
  end
end

When(/^the user navigates to the expanded Active Medications Applet$/) do
  navigate_in_ehmp "#medication-review"
end

When(/^the user expands the Active & Recent Medications applet$/) do
  active_medications = ActiveMedications.instance
  expect(active_medications.perform_action('Control - applet - Expand View')).to eq(true)
end

When(/^the user minimizes the Meds Review applet$/) do
  ehmp = PobMedsReview.new
  ehmp.wait_for_btn_applet_minimize
  expect(ehmp).to have_btn_applet_minimize
  ehmp.btn_applet_minimize.click
  ehmp.wait_until_btn_applet_minimize_invisible
end
