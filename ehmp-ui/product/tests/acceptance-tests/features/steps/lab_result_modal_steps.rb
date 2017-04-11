class NumericPanelLabResults < AllApplets
  include Singleton
  def initialize
    super
    add_toolbar_buttons
    add_action(CucumberLabel.new('First Panel Row'), ClickAction.new, AccessHtmlElement.new(:xpath, "//table[@id='data-grid-lab_results_grid']/descendant::*[contains(@class, 'js-has-panel')]/ancestor::tr[1]"))
    add_verify(CucumberLabel.new('Expanded Panel Rows'), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid=lab_results_grid] .lab-results-table-container table tbody'))
    add_action(CucumberLabel.new('First Expanded Panel Row'), ClickAction.new, AccessHtmlElement.new(:css, '[data-appletid=lab_results_grid] .lab-results-table-container table tbody tr:nth-child(1)'))
  end

  def panel_count
    return TestSupport.driver.find_elements(:css, '#data-grid-lab_results_grid tr.selectable td .js-has-panel').length
  end
end

class LabHistory < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new('Date'), VerifyText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=lab_results_grid-modalView-observed]"))
    add_verify(CucumberLabel.new('Flag'), VerifyText.new, AccessHtmlElement.new(:css, '[data-header-instanceid=lab_results_grid-modalView-flag]'))
    add_verify(CucumberLabel.new('Result'), VerifyText.new, AccessHtmlElement.new(:css, '[data-header-instanceid=lab_results_grid-modalView-result]'))
    add_verify(CucumberLabel.new('Facility'), VerifyText.new, AccessHtmlElement.new(:css, '[data-header-instanceid=lab_results_grid-modalView-facilityMoniker]'))
  end
end

Given(/^the Numeric Lab Results applet displays at least (\d+) panel$/) do |arg1|
  numeric_lr = NumericPanelLabResults.instance
  p "number of panels: #{numeric_lr.panel_count}"
  expect(numeric_lr.panel_count >= arg1.to_i).to eq(true)
end

When(/^the user clicks the first numeric lab result panel row$/) do
  numeric_lr = NumericPanelLabResults.instance
  expect(numeric_lr.perform_action('First Panel Row')).to eq(true)
end

Then(/^a popover menu is displayed on the first numeric lab result panel row$/) do
  numeric_lr = NumericPanelLabResults.instance
  numeric_lr.wait_until_action_element_visible('Detail View Button')
end

When(/^the user clicks the details icon in the popover menu$/) do
  numeric_lr = NumericPanelLabResults.instance
  expect(numeric_lr.perform_action('Detail View Button')).to eq(true)
end

Then(/^the numeric lab result applet displays panel rows$/) do
  numeric_lr = NumericPanelLabResults.instance
  numeric_lr.wait_until_action_element_visible('Expanded Panel Rows')
  numeric_lr.wait_until_action_element_visible('First Expanded Panel Row')
  # expect(numeric_lr.am_i_visible?('Detail View Button')).to eq(false)
end

When(/^the user clicks a panel row$/) do
  numeric_lr = NumericPanelLabResults.instance
  expect(numeric_lr.perform_action('First Expanded Panel Row')).to eq(true)
end

Then(/^the From Date input NOT should have the value "([^"]*)" in the Numeric Lab Results modal$/) do |date_value|
  ehmp = NumericLabResultsModal.new
  ehmp.wait_for_fld_from_date
  expect(ehmp).to have_fld_from_date
  expect(ehmp.fld_from_date.value).to_not eq(date_value)
end

Then(/^the To Date input NOT should have the value "([^"]*)" in the Numeric Lab Results modal$/) do |date_value|
  ehmp = NumericLabResultsModal.new
  ehmp.wait_for_fld_to_date
  expect(ehmp).to have_fld_to_date
  expect(ehmp.fld_to_date.value).to_not eq(date_value)
end
