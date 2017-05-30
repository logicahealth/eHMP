path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'singleton'

class Documents < AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super
    @appletid = 'documents'
    appletid_css = "[data-appletid=#{@appletid}]"
    add_action(CucumberLabel.new("Coversheet Dropdown"), ClickAction.new, AccessHtmlElement.new(:id, "screenName"))
    add_verify(CucumberLabel.new("Drop Down Menu"), VerifyText.new, AccessHtmlElement.new(:class, "dropdown-menu"))
    add_action(CucumberLabel.new("Documents"), ClickAction.new, AccessHtmlElement.new(:link_text, "Documents"))
    add_verify(CucumberLabel.new("Is Table Visible"), VerifyText.new, AccessHtmlElement.new(:id, "data-grid-documents"))
    add_action(CucumberLabel.new("Discharge Summary"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@data-instanceid='documents']/descendant::*[@id='urn-va-document-9E7A-65-300']/td[1]"))
    add_action(CucumberLabel.new("Progress Note"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@data-instanceid='documents']/descendant::*[@id='urn-va-document-9E7A-65-747']/td[1]"))
    add_action(CucumberLabel.new("Progress Note DoD*"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@data-instanceid='documents']/descendant::*[@id='urn-va-document-DOD-0000000011-1000003813']/td[1]"))
    add_action(CucumberLabel.new("Procedure"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@data-instanceid='documents']/descendant::*[@id='urn-va-procedure-9E7A-65-5-MCAR(699,']/td[1]"))
    add_action(CucumberLabel.new("Surgery"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@data-instanceid='documents']/descendant::*[@id='urn-va-surgery-9E7A-65-28']/td[1]"))
    add_action(CucumberLabel.new("Consult Report"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@data-instanceid='documents']/descendant::*[@id='urn-va-consult-9E7A-100012-563']/td[1]"))
    add_action(CucumberLabel.new("Advance Directive"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@data-instanceid='documents']/descendant::*[@id='urn-va-document-9E7A-100012-3944']/td[1]"))
    add_action(CucumberLabel.new("Crisis Note"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@data-instanceid='documents']/descendant::*[@id='urn-va-document-9E7A-231-1693']/td[1]"))
    add_action(CucumberLabel.new("Lab Report"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@data-instanceid='documents']/descendant::*[@id='urn-va-document-9E7A-17-CY-7049593']/td[1]"))
    add_action(CucumberLabel.new("Administrative Note"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@data-instanceid='documents']/descendant::*[@id='urn-va-document-DOD-0000000014-1000004202']/td[1]"))
    add_action(CucumberLabel.new("Imaging"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@data-instanceid='documents']/descendant::*[@id='urn-va-image-9E7A-17-7028886-8889-1']/td[1]"))
    add_verify(CucumberLabel.new("Details Title"), VerifyText.new, AccessHtmlElement.new(:css, ".doc-detail-wrapper h4:first-child"))
    add_verify(CucumberLabel.new("Is Detail Panel Text visible"), VerifyText.new, AccessHtmlElement.new(:class, "doc-detail-region"))
    add_action(CucumberLabel.new("Close"), ClickAction.new, AccessHtmlElement.new(:css, ".doc-detail-wrapper button.pull-right"))
    add_verify(CucumberLabel.new("Surgery Count"), VerifyText.new, AccessHtmlElement.new(:css, "[data-group-instanceid='Surgery_groupCount']"))
    add_action(CucumberLabel.new("Surgery Row"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@data-instanceid='documents']/descendant::*//td[contains(string(),'Surgery')]"))
    add_action(CucumberLabel.new("Documents Filter input"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "input[name='q-documents']"))
    add_action(CucumberLabel.new("Search Filter"), ClickAction.new, AccessHtmlElement.new(:id, "grid-filter-button-documents"))
    add_verify(CucumberLabel.new("No Records Found"), VerifyText.new, AccessHtmlElement.new(:css, "#data-grid-documents tr.empty"))
    add_action(CucumberLabel.new("August 1992"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@data-instanceid='documents']/descendant::*//td[contains(string(),'August 1992')]"))
    add_verify(CucumberLabel.new("August 1992 Count"), VerifyText.new, AccessHtmlElement.new(:xpath, ".//*[@data-instanceid='documents']/descendant::*[@data-group-instanceid='199208_groupCount']"))
    add_verify(CucumberLabel.new("Document Modal Details"), VerifyContainsText.new, AccessHtmlElement.new(:class, "doc-detail-region"))
    add_verify(CucumberLabel.new("DoD* Content Details"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//body"))

    @@documents_applet_data_grid_rows = AccessHtmlElement.new(:xpath, ".//*[@data-instanceid='documents']/descendant::*//table[@id='data-grid-documents']/descendant::tr")
    add_verify(CucumberLabel.new("Number of Documents Applet Rows"), VerifyXpathCount.new(@@documents_applet_data_grid_rows), @@documents_applet_data_grid_rows)         
  
    add_action(CucumberLabel.new("Documents Filter Button"), ClickAction.new, AccessHtmlElement.new(:id, 'grid-filter-button-documents'))

    add_applet_add_button appletid_css
    add_applet_buttons appletid_css
    add_text_filter_with_appletid @appletid
  end
  
  def verify_alphabetic_sort_caseinsensitive(table_id, column_index, a_z)
    for_error_message = a_z ? "is not greater then" : "is not less then"
    driver = TestSupport.driver
    css_string = "[data-appletid=documents] tbody td:nth-child(#{column_index})"
    p css_string
    columns = driver.find_elements(:css, css_string)
    higher = columns[0].text #.downcase
    (1..columns.length-1).each do |i|
      columns[i].location_once_scrolled_into_view
      lower = columns[i].text #.downcase
      check_alpha = a_z ? ((higher <=> lower) <= 0) : ((higher <=> lower) >= 0)
      p "#{higher} #{for_error_message} #{lower}" unless check_alpha
      return false unless check_alpha
      higher = lower
    end
    return true
  rescue Exception => e
    p "verify_alphabetic_sort: #{e}"
    return false
  end

  def applet_grid_loaded
    return true if am_i_visible? 'No Records Found'
    return TestSupport.driver.find_elements(:css, "[data-appletid='documents'] tbody tr:not([class='row-header'])").length > 0
  rescue => e 
    # p e
    false
  end  
end

When(/^the user sees date groups in the Documents Applet$/) do
  @ehmp = PobDocumentsList.new

  timeout = DefaultTiming.default_table_row_load_time
  @ehmp.wait_until(timeout) { @ehmp.applet_loaded? }

  expect(@ehmp).to have_fld_date_headers
  date_headers = @ehmp.fld_date_headers
  expect(date_headers.length).to be > 0, "minimum requirement is not met, need at least 1 date header to be displayed"
  date_format = Regexp.new("\\w+ \\d{4}")
  date_headers.each do | date_header |
    expect(( date_format.match(date_header.text)).nil?).to eq(false)
  end
end

When(/^user selects Documents from Coversheet dropdown$/) do
  aa = Documents.instance
  expect(aa.wait_until_action_element_visible("Coversheet Dropdown", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action("Coversheet Dropdown", "")).to be_true, "Could not click on drop down menu"
  expect(aa.wait_until_element_present("Drop Down Menu")).to be_true, "Could not see the drop down menu"
  script = "a[href$='documents-list']"
  TestSupport.driver.execute_script("$(\"#{script}\").focus()")
  expect(aa.perform_action("Documents", "")).to be_true, "could not click on Documents link from drop down menu"
end

When(/^user navigates to Documents Screen$/) do
  navigate_in_ehmp '#documents-list'

  documents = PobDocumentsList.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  max_retry_attempt = 1
  begin
    wait.until { documents.applet_loaded? }
    expect(documents.wait_for_fld_documents_heading).to eq(true)
    expect(documents.wait_for_fld_applet_title).to eq(true)
  rescue Exception => e
    p "documents applet did not load: #{e}"
    max_retry_attempt -= 1
    TestSupport.driver.navigate.refresh
    retry if max_retry_attempt >= 0
    raise e if max_retry_attempt < 0
  end

end

Then(/^title of the Documents Applet says "(.*?)"$/) do |page_title|
  documents = PobDocumentsList.new
  documents.wait_for_fld_applet_title
  expect(documents).to have_fld_applet_title
  expect(documents.fld_applet_title.text.upcase).to eq(page_title.upcase)
end

Then(/^the Documents Applet table contains headers$/) do |table|
  documents = PobDocumentsList.new
  documents.wait_for_fld_table_head
  expect(documents).to have_fld_table_head
  table.rows.each do | header_text |
    expect(object_exists_in_list(documents.fld_table_head, header_text[0])).to eq(true), "Header #{header_text[0]} not in Documents applet (#{return_for_printing(documents.fld_table_head)})"
  end
end

Then(/^the default sorting by Date\/Time is in descending in Documents Applet$/) do
  # #wait = Selenium::WebDriver::Wait.new(:timeout => (DefaultTiming.default_table_row_load_time))
  # wait = Selenium::WebDriver::Wait.new(:timeout => (10))
  # wait.until { VerifyTableValue.verify_date_only_sort_selectable('data-grid-documents', 1, true) }
  # expect(VerifyTableValue.verify_date_only_sort_selectable('data-grid-documents', 1, true)).to eq(true)

  ehmp = PobDocumentsList.new
  expect(ehmp.column_date_dateformat.length).to be >= 2, "Precondition not met: require at least 2 rows containing a date column"
  begin
    ehmp.wait_until(30) { ehmp.sorted?(false) == true }
  rescue Exception => e
    p e
    expect(ehmp.sorted?(false, true)).to eq(true), "Rows are not sorted in descending order"
  end
end

Then(/^the sorting by Date\/Time is in ascending in Documents Applet$/) do
  ehmp = PobDocumentsList.new
  expect(ehmp.column_date_dateformat.length).to be >= 2, "Precondition not met: require at least 2 rows containing a date column"
  begin
    ehmp.wait_until(30) { ehmp.sorted?(true) == true }
  rescue => e
    p e
    expect(ehmp.sorted?(true, true)).to eq(true), "Rows are not sorted in ascending order"
  end
end

def applet_loaded_after_sort(page)
  documents = page
  message_shown = documents.wait_for_sorting_message
  begin
    documents.wait_until_sorting_message_invisible if message_shown
  rescue Exception => e
    p "#{e}: continue anyway"
  end
  documents.wait_until(45) { documents.applet_loaded? }
  expect(documents.applet_loaded?).to eq(true)
end

When(/^the user sorts the Documents grid by Date$/) do
  documents = PobDocumentsList.new
  documents.wait_for_fld_header_date
  expect(documents).to have_fld_header_date
  documents.fld_header_date.click
  applet_loaded_after_sort(documents)
end

Then(/^the first row is as below when grouped by "(.*?)" in Documents Applet$/) do |_groupBy, table|
  aa = Documents.instance
  expect(aa.wait_until_xpath_count_greater_than("Number of Documents Applet Rows", 6)).to be_true
  verify_table_rows_documents(table)
end

def verify_table_rows_documents(table)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { VerifyTableValue.compare_specific_row(table, '[data-appletid=documents] #data-grid-documents') }
end

Then(/^take screenshot for comparison purposes with name "(.*?)"$/) do |screenshot_name|
  screenshot_name = "#{ENV['SCREENSHOTS_FOLDER']}/#{screenshot_name}" if ENV.keys.include?('SCREENSHOTS_FOLDER')
  screenshot_name_png = "#{screenshot_name}.png"
  p "saving screenshot with name #{screenshot_name_png}"
  TestSupport.driver.save_screenshot(screenshot_name_png)
end

def scroll_single_row_for_type(type_text)
  driver = TestSupport.driver
  documents = PobDocumentsList.new
  columns = documents.fld_document_rows_type
  columns[0].native.location_once_scrolled_into_view
  (1..columns.length-1).each do |i|
    columns[i].native.location_once_scrolled_into_view
    return true if columns[i].text == type_text
  end
  return false
rescue Exception => e
  p e
  return false
end

Then(/^the Docuemnts table diplays Type "([^"]*)" rows$/) do |input_text|   
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { scroll_single_row_for_type(input_text) } 
end

When(/^the user sorts the Documents grid by Type$/) do
  documents = PobDocumentsList.new
  max_attempt = 2
  begin
    documents.wait_for_fld_type_header
    expect(documents).to have_fld_type_header
    documents.fld_type_header.click
  rescue Exception => e
    max_attempt-=1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
  applet_loaded_after_sort(documents)
end

When(/^the user sorts the Documents grid by Description$/) do
  documents = PobDocumentsList.new
  max_attempt = 2
  begin
    documents.wait_for_fld_description_header
    expect(documents).to have_fld_description_header
    documents.fld_description_header.click
  rescue Exception => e
    max_attempt-=1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
  applet_loaded_after_sort(documents)
end

Then(/^the user sorts the Documents grid by Author$/) do
  documents = PobDocumentsList.new
  max_attempt = 2
  begin
    documents.wait_for_fld_author_header
    expect(documents).to have_fld_author_header
    documents.fld_author_header.click
  rescue Exception => e
    max_attempt-=1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
  applet_loaded_after_sort(documents)
end

When(/^the user sorts the Documents grid by Facility$/) do
  documents = PobDocumentsList.new
  max_attempt = 2
  begin
    documents.wait_for_fld_facility_header
    expect(documents).to have_fld_facility_header
    documents.fld_facility_header.click
  rescue Exception => e
    max_attempt-=1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
  applet_loaded_after_sort(documents)
end
  
Then(/^the Documents grid is sorted in "([^"]*)" order based on "([^"]*)"$/) do |order, column|
  order_options = {}
  order_options['alphabetic'] = true
  order_options['reverse alphabetic order'] = false
  
  column_options = {}
  column_options['Description'] = 2
  column_options['Type'] = 3
  column_options['Facility'] = 5
  column_options['Author'] = 4
    
  documents_applet = Documents.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  begin
    wait.until { documents_applet.verify_alphabetic_sort_caseinsensitive('data-grid-documents', column_options[column], order_options[order]) }
  rescue Exception => e
    p "sort failed #{e}"
    @ehmp = PobDocumentsList.new
    p @ehmp.document_types
    raise e
  end
end

When(/^the Documents Applet table contains data rows$/) do
  documents = PobDocumentsList.new
  wait_until { documents.applet_loaded? }
  expect(documents.fld_document_data_rows.length).to be > 0
end

When(/^user refreshes Documents Applet$/) do    
  applet_refresh_action("documents")
end

Then(/^the message on the Documents Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("documents", message_text)
end

Then(/^the Documents Applet contains buttons$/) do |table|
  documents = Documents.instance
  table.rows.each do | button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(documents.am_i_visible? cucumber_label).to eq(true), "Could not find button #{button[0]}"
  end
end

When(/^the user chooses to Add Item to Documents$/) do
  documents = Documents.instance
  expect(documents.perform_action('Control - applet - Add')).to eq(true)
end

Then(/^the Documents Applet grid is loaded$/) do
  documents = PobDocumentsList.new
  documents.scroll_into_view
  # documents.wait_until(60) { documents.applet_loaded? }
  # expect(documents.applet_loaded?).to eq(true)

  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  max_retry_attempt = 1
  begin
    wait.until { documents.applet_loaded? }
    expect(documents.wait_for_fld_documents_heading).to eq(true)
    expect(documents.wait_for_fld_applet_title).to eq(true)
  rescue Exception => e
    p "documents applet did not load: #{e}"
    max_retry_attempt -= 1
    TestSupport.driver.navigate.refresh
    retry if max_retry_attempt >= 0
    raise e if max_retry_attempt < 0
  end

end

When(/^the user clicks on the first date group in the Documents Applet$/) do
  documents = PobDocumentsList.new
  all_date_headers = documents.fld_date_headers
  expect(all_date_headers.length).to be > 0, "test precondition not met: require at least 1 date group"
  group_text = all_date_headers[0].text.match(/\w+ \d{4}/).to_s
  start_of_month = Date.strptime(group_text, "%B %Y")
  next_month = start_of_month.next_month(1)
  date_count = 0
  documents.column_date_dateformat.each do | date_text |
    date_count += 1 if date_text >= start_of_month && date_text < next_month
  end
  @expected_group_count = date_count
  p "Expected group count: #{@expected_group_count}"

  visible_badges = documents.fld_date_headers_visible_badges.length
  all_date_headers[0].click
  wait_until { documents.fld_date_headers_visible_badges.length > visible_badges }
end

Then(/^the date group collapses and displays a row count$/) do
  documents = PobDocumentsList.new
  visible_badges = documents.fld_date_headers_visible_badges
  expect(visible_badges.length).to eq(1)
  expect(visible_badges[0].text).to eq("#{@expected_group_count}")
end

def within_time_frame(start_date, end_date)
  documents = PobDocumentsList.new

  date_count = 0
  within_timeframe = false
  documents.column_date_dateformat.each do | date_text |
    within_timeframe = date_text >= start_date && date_text <= end_date
    expect(within_timeframe).to eq(true), "#{date_text} not with in time frame #{start_date} to #{end_date}"
  end
end

Then(/^the Documents Applet displays records within (\d+)YR \( or none \)$/) do |year|
  start_date = Date.today.prev_year(year.to_i)
  end_date = Date.today
  within_time_frame(start_date, end_date)
end

Then(/^the Documents Applet displays records within (\d+)M \( or none \)$/) do |month|
  start_date = Date.today.prev_month(month.to_i)
  end_date = Date.today
  within_time_frame(start_date, end_date)
end

Then(/^the Documents Applet displays records within (\d+)D \( or none \)$/) do |day|
  start_date = Date.today.prev_day(day.to_i)
  end_date = Date.today
  within_time_frame(start_date, end_date)
end

Then(/^the number of rows reported are the number of rows displayed$/) do
  documents = PobDocumentsList.new
  expect(documents.wait_for_fld_infinite_scroll_message).to eq(true)
  message_row_number = documents.retrieve_report_all_records_loaded
  p "Expecting #{documents.fld_document_data_rows.length}, found #{message_row_number.to_i}"
  expect(message_row_number.to_i).to eq(documents.fld_document_data_rows.length)
  # expect(documents.wait_for_fld_total_record_report_row).to eq(true), "A row reporting number of records is not displayed"
  text = documents.fld_infinite_scroll_message.text.upcase
  result = text.match(/ALL \d+ RECORDS ARE DISPLAYED/)
  expect(result).to_not be_nil, "Expected infinite scroll message to be in format ALL \d+ RECORDS ARE DISPLAYED, is '#{text}'"
end

Given(/^the user expands the Documents applet$/) do
  documents = PobDocumentsList.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  # expand documents applet
  expect(documents).to have_btn_applet_expand_view
  max_attempt = 2
  begin
    documents.btn_applet_expand_view.click
    expect(documents.wait_for_btn_applet_minimize).to eq(true)
  rescue Exception => e
    max_attempt -= 1
    retry if max_attempt > 0
    raise e
  end
  
  wait.until { documents.applet_loaded? }
end

