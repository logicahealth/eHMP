class ReportsGistContainer <  AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super
    @appletid = 'reports'
    appletid_css = '[data-appletid=reports]'
    add_verify(CucumberLabel.new("Reports Title"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=reports] .panel-title"))
    add_action(CucumberLabel.new("Procedure"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@id='center-region']/descendant::*[@data-row-instanceid='urn-va-procedure-9E7A-65-5-MCAR(699,']/td[1]"))
    add_verify(CucumberLabel.new("ReportsGridVisible"), VerifyText.new, AccessHtmlElement.new(:id, "data-grid-reports"))
    add_verify(CucumberLabel.new("Date"), VerifyText.new, AccessHtmlElement.new(:link_text, "Date"))
    add_verify(CucumberLabel.new("Type"), VerifyText.new, AccessHtmlElement.new(:link_text, "Type")) 
    add_verify(CucumberLabel.new("Entered By"), VerifyText.new, AccessHtmlElement.new(:link_text, "Entered By"))
    @@reports_applet_data_grid_rows = AccessHtmlElement.new(:xpath, "//table[@id='data-grid-reports']/descendant::tr")
    add_verify(CucumberLabel.new("Number of Report Applet Rows"), VerifyXpathCount.new(@@reports_applet_data_grid_rows), @@reports_applet_data_grid_rows)                 
    add_action(CucumberLabel.new('Empty Report Gist Row'), ClickAction.new, AccessHtmlElement.new(:css, '#data-grid-reports tr.empty'))

    @@group_row = AccessHtmlElement.new(:css, "#data-grid-reports tr.groupByHeader")
    add_verify(CucumberLabel.new("Rows - Group"), VerifyXpathCount.new(@@group_row), @@group_row)                 
    @@selectable_row = AccessHtmlElement.new(:css, "#data-grid-reports tr.selectable")
    add_verify(CucumberLabel.new("Rows - Selectable"), VerifyXpathCount.new(@@selectable_row), @@selectable_row)   
    add_action(CucumberLabel.new("Filter input"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "#grid-filter-reports input"))              
   
    # first reports row
    add_action(CucumberLabel.new('First Reports Row'), ClickAction.new, AccessHtmlElement.new(:css, "[data-instanceid='reports'] [data-row-instanceid='urn-va-surgery-9E7A-65-28']"))
    add_applet_buttons appletid_css
    add_text_filter appletid_css
  end

  def applet_grid_loaded
    return true if am_i_visible? 'Empty Report Gist Row'
    return TestSupport.driver.find_elements(:css, '#data-grid-reports tr.selectable').length > 0
  rescue => e 
    p e
    false
  end
end

class ReportModal < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new('Type Label'), VerifyTextNotEmpty.new(''), AccessHtmlElement.new(:xpath, "//div[@id='modal-body']/descendant::span[string()='Type']"))
    add_verify(CucumberLabel.new('Type'), VerifyTextNotEmpty.new(''), AccessHtmlElement.new(:css, "[data-detail='type']"))
  end
end

Then(/^user sees Reports Gist$/) do  
  aa = ReportsGistContainer.instance  
  expect(aa.wait_until_action_element_visible("Reports Title", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification("Reports Title", "REPORTS")).to be_true
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { aa.applet_grid_loaded }
end

Then(/^the user selects the "(.*?)" row in Reports Gist$/) do |kind|
  aa = ReportsGistContainer.instance 
  expect(aa.wait_until_action_element_visible("Procedure", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action(kind, "")).to be_true
end

When(/^the Reports Gist Applet table contains headers$/) do |table|
  aa = ReportsGistContainer.instance 
  expect(aa.wait_until_action_element_visible("ReportsGridVisible", DefaultLogin.wait_time)).to be_true
    
  table.rows.each do |row|
    expect(aa.perform_verification('Date', row[0])).to be_true, "The header #{row[0]} is not present in the reports gist"
    expect(aa.perform_verification('Type', row[1])).to be_true, "The header #{row[1]} is not present in the reports gist"
    expect(aa.perform_verification('Entered By', row[2])).to be_true, "The header #{row[2]} is not present in the reports gist"
  end
end

Then(/^the Reports Gist table contains specific rows$/) do |table|
  verify_table_rows_reports(table)
end

Then(/^title of the Reports Applet says "(.*?)"$/) do |_arg1|
  aa = ReportsGistContainer.instance  
  expect(aa.wait_until_action_element_visible("Reports Title", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification("Reports Title", "REPORTS")).to be_true
end

Then(/^the reports gist view is filtered to (\d+) items$/) do |num_items|
  aa = ReportsGistContainer.instance 
  expect(aa.wait_until_xpath_count_greater_than("Number of Reports Applet Rows", num_items)).to be_true, "Expected #{num_items} but didn't find that in the application"
end

def verify_table_rows_reports(table)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { VerifyTableValue.compare_specific_row(table, '#data-grid-reports') }
end

Then(/^the Reports Gist table contains "([^"]*)" Type\(s\)$/) do |arg1|
  # //*[@id='data-grid-reports']/descendant::tr[contains(@class, 'selectable')]/descendant::td[2 and contains(string(), 'Procedure')]
  report_gist = ReportsGistContainer.instance 
  element = AccessHtmlElement.new(:xpath, "//*[@id='data-grid-reports']/descendant::tr[contains(@class, 'selectable')]/descendant::td[2 and contains(string(), '#{arg1}')]")
  report_gist.add_verify(CucumberLabel.new('Report Type'), VerifyXpathCount.new(element), element)
  expect(report_gist.wait_until_xpath_count_greater_than('Report Type', 0, 60)).to eq(true), "Type Column did not contain a #{arg1}"
end

Then(/^the expanded Reports Applet is displayed$/) do
  aa = ReportsGistContainer.instance
  expected_screen = 'Reports'
  expect(aa.perform_verification('Screenname', "#{expected_screen}")).to eq(true), "Expected screenname to be #{expected_screen}"
  expect(aa.wait_until_action_element_visible("Reports Title", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification("Reports Title", 'REPORTS')).to be_true
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until {  aa.applet_grid_loaded }
end

Then(/^the Reports Gist Applet contains data rows$/) do
  compare_item_counts("#data-grid-reports tr.selectable", 1)
end

When(/^user refreshes Reports Gist Applet$/) do
  applet_refresh_action("reports")
end

Then(/^the message on the Reports Gist Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("reports", message_text)
end

When(/^the Reports Gist Applet expand view contains data rows$/) do
  compare_item_counts("#data-grid-reports tr")
end

When(/^user refreshes Reports Gist Applet expand view$/) do
  applet_refresh_action("reports")
end

Then(/^the message on the Reports Gist Applet expand view does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("reports", message_text)
end

When(/^the user filters the Reports Gist Applet by text "([^"]*)"$/) do |search_field|
  report_gist = ReportsGistContainer.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  row_count = report_gist.get_elements('Rows - Selectable').length
  expect(report_gist.wait_until_action_element_visible("Filter input", DefaultLogin.wait_time)).to be_true
  expect(report_gist.perform_action("Filter input", search_field)).to be_true
  wait.until { row_count != report_gist.get_elements('Rows - Selectable').length }
end

Then(/^the Reports Gist table only diplays rows including text "([^"]*)"$/) do |input_text|
  report_gist = ReportsGistContainer.instance
  upper = input_text.upcase
  lower = input_text.downcase
  path =  "//table[@id='data-grid-reports']/descendant::td[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::tr"

  p path
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).length
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  wait.until { rows_containing_filter_text == report_gist.get_elements('Rows - Selectable').length }
  row_count = report_gist.get_elements('Rows - Selectable').length 
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

When(/^the user views the details for the first "([^"]*)" Report$/) do |arg1|
  xpath = "//table[@id='data-grid-reports']/descendant::td[contains(string(), '#{arg1}')]"
  report_gist = ReportsGistContainer.instance
  report_gist.add_action(CucumberLabel.new('open modal'), ClickAction.new, AccessHtmlElement.new(:xpath, xpath))
  expect(report_gist.perform_action('open modal')).to eq(true)
end

Then(/^the Report Detail modal displays$/) do |table|
  @ehmp = PobReportsApplet.new
  @ehmp.wait_for_fld_reports_row_details_header
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.fld_reports_row_details_header, "#{headers[0]}")).to eq(true), "Field '#{headers[0]}' was not found"
  end
end

When(/^the user views the first Report detail view$/) do
  report_modal = ReportsGistContainer.instance
  expect(report_modal.wait_until_xpath_count_greater_than('Number of Report Applet Rows', 0)).to eq(true), "Test requires at least 1 row to be displayed"
  expect(report_modal.perform_action('First Reports Row')).to eq(true)
end

When(/^the user clicks the control Expand View in the Reports Gist applet$/) do
  report_modal = ReportsGistContainer.instance
  expect(report_modal.perform_action('Control - applet - Expand View')).to eq(true)
end

When(/^the user opens the Report Gist Applet filter$/) do
  report_gist_applet = ReportsGistContainer.instance
  expect(report_gist_applet.perform_action('Control - applet - Filter Toggle')).to eq(true)
  report_gist_applet.wait_until_action_element_visible('Filter Field')
end
