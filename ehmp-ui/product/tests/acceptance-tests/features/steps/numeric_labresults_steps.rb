class NumericLabResults < AllApplets
  include Singleton
  attr_reader :appletid_css
  attr_reader :table_id
  attr_reader :appletid
  def initialize
    super
    @appletid = 'lab_results_grid'
    @appletid_css = "[data-appletid=#{@appletid}]"
    @table_id = 'data-grid-lab_results_grid'

    add_applet_buttons @appletid_css

    add_applet_title @appletid_css

    add_date_filter_ids 'lab_results_grid'

    # add_text_filter @appletid_css
    add_text_filter_with_appletid @appletid

    add_date_input 'lab_results_grid'

    add_applet_add_button @appletid_css
    
    add_verify(CucumberLabel.new('Empty Row'), VerifyText.new, AccessHtmlElement.new(:css, "##{@table_id} tbody tr.empty"))

    # specific data for Eight,Patient
    add_verify(CucumberLabel.new('PANEL_FROM_TST1'), VerifyText.new, AccessHtmlElement.new(:xpath, "//td[contains(string(), 'CHEM 7 BLOOD   SERUM SP LB #18415')]/ancestor::tr/descendant::td[contains(string(), 'TST1')]"))
    add_verify(CucumberLabel.new('PANEL_FROM_TST2'), VerifyText.new, AccessHtmlElement.new(:xpath, "//td[contains(string(), 'CHEM 7 BLOOD   SERUM SP LB #18415')]/ancestor::tr/descendant::td[contains(string(), 'TST2')]"))
    # end specific data for Eight,Patient
  end

  def applet_loaded?
    # wait until at least one row is displayed 
    return true if am_i_visible? 'Empty Row'
    return TestSupport.driver.find_elements(:css, "##{@table_id} tbody tr.selectable").length > 0
  rescue Exception => myerror
    p myerror
    return false
  end

  def row_count
    count = TestSupport.driver.find_elements(:css, "##{@table_id} tbody tr.selectable").length
    p "count: #{count}"
    return count
  end
end

Before do
  @numeric_lab_results = NumericLabResults.instance
end

Then(/^user navigates to expanded Numeric Lab Results Applet$/) do
  navigate_in_ehmp '#lab-results-grid-full'
end

Then(/^Numeric Lab Results applet loads without issue$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @numeric_lab_results.applet_loaded? }
end

When(/^the user is viewing the expanded Numeric Lab Results Applet$/) do
  expect(@numeric_lab_results.perform_verification('Screenname', 'Numeric Lab Results')).to eq(true)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @numeric_lab_results.applet_loaded? }
end

Then(/^the Numeric Lab Results applet contains buttons$/) do |table|
  table.rows.each do | button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(@numeric_lab_results.am_i_visible? cucumber_label).to eq(true)
  end
end

When(/^the user minimizes the expanded Numeric Lab Results Applet$/) do
  expect(@numeric_lab_results.perform_action('Control - applet - Minimize View')).to eq(true)
end

Given(/^the the Numeric Lab Results applet is displaying a subset of rows$/) do
  @numeric_lab_row_count = @numeric_lab_results.row_count
  expect(@numeric_lab_row_count).to be > 1
  expect(@numeric_lab_row_count).to be < 300
end

Then(/^the Numeric Lab Results applet adds more rows$/) do
  expect(@numeric_lab_results.row_count).to be > @numeric_lab_row_count
end

Then(/^the user verifies panels are seperated by facilities$/) do
  expect(@numeric_lab_results.am_i_visible? 'PANEL_FROM_TST1').to eq(true)
  expect(@numeric_lab_results.am_i_visible? 'PANEL_FROM_TST2').to eq(true)
end

When(/^the user filters the Expanded Numeric Lab results by text "([^"]*)"$/) do |input_text|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  row_count = @numeric_lab_results.row_count
  expect(@numeric_lab_results.perform_action('Control - applet - Text Filter', input_text)).to eq(true)
  wait.until { row_count != @numeric_lab_results.row_count }
end

Then(/^the Expanded Numeric Lab results table only diplays rows including text "([^"]*)"$/) do |input_text|
  upper = input_text.upcase
  lower = input_text.downcase
  table = @numeric_lab_results.table_id
  path =  "//table[@id='#{table}']/descendant::td[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::tr"

  row_count = @numeric_lab_results.row_count 
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

Then(/^the Numeric Lab Results Applet Text Filter is displayed$/) do
  expect(@numeric_lab_results.am_i_visible? 'Filter Field').to eq(true)
end

Then(/^the Numeric Lab Results Applet Date Filter is displayed$/) do
  expect(@numeric_lab_results.am_i_visible? 'Date Filter All').to eq(true), "Date Filter All is not visible"
  expect(@numeric_lab_results.am_i_visible? 'Date Filter 2yr').to eq(true), "Date Filter 2yr is not visible"
  expect(@numeric_lab_results.am_i_visible? 'Date Filter 1yr').to eq(true), "Date Filter 1yr is not visible"
  expect(@numeric_lab_results.am_i_visible? 'Date Filter 3mo').to eq(true), "Date Filter 3mo is not visible"
  expect(@numeric_lab_results.am_i_visible? 'Date Filter 1mo').to eq(true), "Date Filter 1mo is not visible"
  expect(@numeric_lab_results.am_i_visible? 'Date Filter 7d').to eq(true), "Date Filter 7d is not visible"
  expect(@numeric_lab_results.am_i_visible? 'Date Filter 72hr').to eq(true), "Date Filter 72hr is not visible"
  expect(@numeric_lab_results.am_i_visible? 'Date Filter 24hr').to eq(true), "Date Filter 24hr is not visible"

  sleep 5
end

When(/^the user clicks the Numeric Lab Results Applet Filter button$/) do
  expect(@numeric_lab_results.perform_action('Control - applet - Filter Toggle')).to eq(true)
end

Then(/^the Numeric Lab Results Applet Text Filter is not displayed$/) do
  # expect(@numeric_lab_results.am_i_visible? 'Filter Field').to eq(false)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { !@numeric_lab_results.am_i_visible? 'Filter Field' }
end

Then(/^the Numeric Lab Results Applet Date Filter is not displayed$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { !@numeric_lab_results.am_i_visible? 'Date Filter All' }
  expect(@numeric_lab_results.am_i_visible? 'Date Filter All').to eq(false)
  expect(@numeric_lab_results.am_i_visible? 'Date Filter 2yr').to eq(false)
  expect(@numeric_lab_results.am_i_visible? 'Date Filter 1yr').to eq(false)
  expect(@numeric_lab_results.am_i_visible? 'Date Filter 3mo').to eq(false)
  expect(@numeric_lab_results.am_i_visible? 'Date Filter 1mo').to eq(false)
  expect(@numeric_lab_results.am_i_visible? 'Date Filter 7d').to eq(false)
  expect(@numeric_lab_results.am_i_visible? 'Date Filter 72hr').to eq(false)
  expect(@numeric_lab_results.am_i_visible? 'Date Filter 24hr').to eq(false)
end

Then(/^the Numeric Lab Results applet displays empty record message$/) do
  expect(@numeric_lab_results.am_i_visible? 'Empty Row').to eq(true)
end

Then(/^the Numeric Lab Results Date Filter displays "(.*?)" months in the past and "(.*?)" months in the future$/) do |months_past, months_future|
  con = @numeric_lab_results
  date_format_template = "%m/%d/%Y"

  expected_to_date = DateTime.now.next_month(months_future.to_i).strftime(date_format_template)
  expected_from_date = DateTime.now.prev_month(months_past.to_i).strftime(date_format_template)
  
  expect(con.perform_verification("To Date", expected_to_date)).to be_true
  expect(con.perform_verification("From Date", expected_from_date)).to be_true
end

Then(/^the Numeric Lab Results Applet table contains less then (\d+) rows$/) do |arg1|
  row_count = @numeric_lab_results.row_count 
  expect(row_count).to be < arg1.to_i
end

Then(/^the Numeric Lab Results Applet table contains more then (\d+) rows$/) do |arg1|
  row_count = @numeric_lab_results.row_count 
  expect(row_count).to be > arg1.to_i
end

When(/^the user navigates to Numeric Lab Results Expanded$/) do
  # lab-results-grid-full
  navigate_in_ehmp '#lab-results-grid-full'
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @numeric_lab_results.applet_loaded? }
end

Then(/^the Numeric Lab Results Expanded applet is displayed$/) do
  verify_applet_exists(@numeric_lab_results.appletid)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @numeric_lab_results.applet_loaded? }
end

When(/^the user clicks the Add button on the Numeric Lab Results Applet$/) do
  expect(@numeric_lab_results.perform_action('Control - applet - Add')).to eq(true)
end
