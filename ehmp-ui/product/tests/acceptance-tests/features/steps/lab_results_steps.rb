path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'AccessBrowserV2.rb'
require 'date'

class LabResultsSpecificRows < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("HEMOGLOBIN A1C - BLOOD"), ClickAction.new, AccessHtmlElement.new(:id, 'urn-va-lab-SITE-253-CH-6899693-9-462'))
    add_action(CucumberLabel.new("03/05/2010 - 10:00 HEMOGLOBIN A1C - BLOOD (TST1)"), ClickAction.new, AccessHtmlElement.new(:css, "#center [data-row-instanceid='urn-va-lab-SITE-253-CH-6899693-9-462']"))
    
    add_action(CucumberLabel.new('COAG PROFILE BLOOD PLASMA WC LB #2988'), ClickAction.new, AccessHtmlElement.new(:id, 'COAGPROFILEBLOODPLASMAWCLB2988_urn-va-accession-SITE-3-CH-6939397-7644'))
    add_action(CucumberLabel.new('PROTIME - PLASMA'), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='details-COAGPROFILEBLOODPLASMAWCLB2988_urnvaaccessionSITE3CH69393977644']/descendant::td[contains(string(), 'PROTIME - PLASMA')]"))
    add_verify(CucumberLabel.new('No Records Found'), VerifyText.new, AccessHtmlElement.new(:css, '#data-grid-lab_results_grid td'))
    add_action(CucumberLabel.new("TRIGLYCERIDE - SERUM"), ClickAction.new, AccessHtmlElement.new(:id, 'urn-va-lab-SITE-253-CH-6899693-88-47'))
    add_action(CucumberLabel.new("03/05/2010 - 12:00 TRIGLYCERIDE - SERUM (TST1)"), ClickAction.new, AccessHtmlElement.new(:css, "#center [data-row-instanceid='urn-va-lab-SITE-253-CH-6899693-88-47']"))
    add_action(CucumberLabel.new('First Numeric Lab Result Row'), ClickAction.new, AccessHtmlElement.new(:css, "#data-grid-lab_results_grid tbody tr.selectable:nth-child(1)"))
    
    add_action(CucumberLabel.new("Sodium, Blood Quantitative - PLASMA"), ClickAction.new, AccessHtmlElement.new(:id, 'urn-va-lab-DOD-0000000003-20130507104300_130507-BCH-1662-CH_6951'))
    add_action(CucumberLabel.new('Toolbar Detail View Icon'), ClickAction.new, AccessHtmlElement.new(:css, '[button-type=detailView-button-toolbar]'))
  
    add_action(CucumberLabel.new("05/23/2008 - 16:00 - Pathology - BONE MARROW (DOD)"), ClickAction.new, AccessHtmlElement.new(:id, 'urn-va-lab-DOD-0000000010-20080523160000_080523-BM-15-'))
  end
end

class LabResultsModal < AllApplets
  include Singleton

  def initialize
    super
    ########################### Modal ###########################
    add_action(CucumberLabel.new("Control - modal - From Date"), SendKeysAction.new, AccessHtmlElement.new(:css, "#modal-body #filterFromDate"))
    add_action(CucumberLabel.new("Control - modal - To Date"), SendKeysAction.new, AccessHtmlElement.new(:css, "#modal-body #filterToDate"))
    
    add_action(CucumberLabel.new("Control - modal - Apply"), ClickAction.new, AccessHtmlElement.new(:css, "#modal-body button[id='customRangeApply']"))
    

    add_action(CucumberLabel.new("Control - modal - History - Next Page Arrow"), ClickAction.new, AccessHtmlElement.new(:css, "#modal-body .backgrid-paginator li [title=\"Next\"]"))
    add_action(CucumberLabel.new("Control - modal - History - Previous Page Arrow"), ClickAction.new, AccessHtmlElement.new(:css, "#modal-body .backgrid-paginator li [title=\"Previous\"]"))
    add_action(CucumberLabel.new("Control - modal - Next Button"), ClickAction.new, AccessHtmlElement.new(:css, "#modal-header #labssNext"))
    add_action(CucumberLabel.new("Control - modal - Previous Button"), ClickAction.new, AccessHtmlElement.new(:css, "#modal-header #labssPrevious"))

    add_verify(CucumberLabel.new("modal - Date Range Text"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#modal-body #dateRangeFilter label"))
    add_verify(CucumberLabel.new("modal - Title - Lab History table"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#mainModal .panel-primary .panel-title"))
    add_verify(CucumberLabel.new("modal - Title - Lab Graph"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#mainModal [id='lrGraph'] h5"))
    add_verify(CucumberLabel.new("modal - Lab Graph"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#modal-body #chartContainer"))
    add_verify(CucumberLabel.new("modal - Y-axis Label"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#modal-body #chartContainer .highcharts-axis text"))
    add_verify(CucumberLabel.new("modal - Chart Labels"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#modal-body #chartContainer .highcharts-data-labels g"))
    add_verify(CucumberLabel.new("modal - Header - Lab Test"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=lab-results-summary-typeName]"))
    add_verify(CucumberLabel.new("modal - Header - Result"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=lab-results-summary-result]"))
    add_verify(CucumberLabel.new("modal - Header - Flag"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=lab-results-summary-result]"))
    add_verify(CucumberLabel.new("modal - Header - Unit"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=lab-results-summary-facilityCode]"))
    add_verify(CucumberLabel.new("modal - Header - Ref Range"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-header-instanceid=lab-results-summary-result]"))
    add_verify(CucumberLabel.new("modal - Number Of Total Tests"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#modal-body #totalTests"))
    
    test_format = Regexp.new("\\d+")
    add_verify(CucumberLabel.new("modal - Total Tests"), VerifyTextFormat.new(test_format), AccessHtmlElement.new(:id, 'totalTests'))
    lab_history_rows = AccessHtmlElement.new(:css, '#data-grid-lab_results_grid-modalView tbody tr')
    add_verify(CucumberLabel.new("modal - Lab History Rows"), VerifyXpathCount.new(lab_history_rows), lab_history_rows)
    add_verify(CucumberLabel.new("modal - Numeric Lab Results History Table Loading Indicator"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#modal-body .panel-primary h5"))
    add_verify(CucumberLabel.new("modal - Numeric Lab Results Graph Loading Indicator"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#modal-body .panel-info h5"))
    add_verify(CucumberLabel.new("modal - Graph Points"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#modal-body .highcharts-markers path"))
    add_verify(CucumberLabel.new("modal - Date Range labels"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#modal-body #chartContainer .highcharts-axis-labels text[text-anchor=middle]"))
    add_modal_date_filter_ids
  end
end

class LabResultsContainer < LabResultsModal
  include Singleton

  def initialize
    super

    add_toolbar_buttons
    add_verify(CucumberLabel.new("Numeric Lab Results single page"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".lab-results-grid-full"))

    ########################### Applet ###########################
    add_action(CucumberLabel.new("Control - applet - Expand View"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .applet-maximize-button"))
    add_action(CucumberLabel.new("Control - applet - Minimize View"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .applet-minimize-button"))
    add_action(CucumberLabel.new("Control - applet - Date Sort"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] [data-header-instanceid=lab_results_grid-observed] a"))
    add_action(CucumberLabel.new("Control - applet - Apply"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] #custom-range-apply-lab_results_grid"))
    add_action(CucumberLabel.new("Control - applet - From Date"), SendKeysAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] #filter-from-date-lab_results_grid"))
    add_action(CucumberLabel.new("Control - applet - To Date"), SendKeysAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] #filter-to-date-lab_results_grid"))
    add_action(CucumberLabel.new("Control - applet - Text Filter"), SendKeysAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .form-search input"))
    add_action(CucumberLabel.new("Control - applet - Flag column"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] [data-header-instanceid=lab_results_grid-flag] a"))
    add_action(CucumberLabel.new("Control - applet - Filter Toggle"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .applet-filter-button"))
    add_action(CucumberLabel.new("Control - applet - Next Page Arrow"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .backgrid-paginator [title=Next]"))
    add_action(CucumberLabel.new("Control - applet - First Lab In Panel Detail"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .lab-results-table-contents > tr"))
    add_action(CucumberLabel.new("Control - applet - Next Page Arrow"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .backgrid-paginator li a[title=\"Next\"]"))

    add_verify(CucumberLabel.new("applet - Table"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] tbody tr"))
    lab_rows = AccessHtmlElement.new(:xpath, "//*[@data-appletid='lab_results_grid']/descendant::tbody/descendant::tr")
    add_verify(CucumberLabel.new("applet - Table - xpath"), VerifyXpathCount.new(lab_rows), lab_rows)
    add_verify(CucumberLabel.new("applet - Date Filter"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .grid-filter-daterange"))
    add_verify(CucumberLabel.new("applet - Text Filter"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .grid-filter"))
    add_verify(CucumberLabel.new("applet - Date Time Pickers"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] #date-range-pickers-lab_results_grid"))
    add_verify(CucumberLabel.new("applet - Panel Result Detail Row"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .data-grid table .renderable.expanded-row"))
    add_verify(CucumberLabel.new("applet - Panel Result Detail Hidden Row"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .data-grid table .renderable.expanded-row.hide"))
    add_verify(CucumberLabel.new("applet - Complete Table"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .data-grid table"))
    add_action(CucumberLabel.new("applet - Disabled Next Page Arrow"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=lab_results_grid] .backgrid-paginator .disabled a[title=\"Next\"]"))
  end # initialize

  def applet_loaded?
    # wait until at least one row is displayed 
    return true if TestSupport.driver.find_elements(:css, "[data-appletid=lab_results_grid] .data-grid table tbody .empty").length > 0
    return true if wait_until_xpath_count_greater_than("applet - Table - xpath", 0)
    return false
  rescue Exception => myerror
    p myerror
    return false
  end
end # LabResultsDateFilterContainer

Before do
  @lr = LabResultsContainer.instance
end

Given(/^the user has filtered the numeric lab results on the term "(.*?)" down to (\d+) rows$/) do |term, num_expected_rows|
  #And the user clicks the control "Filter Toggle" in the "Numeric Lab Results applet"
  #And the user inputs "panel" in the "Text Filter" control in the "Numeric Lab Results applet"
  #Then the "Numeric Lab Results Applet" table contains 10 rows
  total_expected_rows = num_expected_rows.to_i + 1 # for header

  expect(LabResultsContainer.instance.perform_action('Control - applet - Filter Toggle')).to be_true, "Could not complete action for Control - applet - Filter Toggle"
  expect(LabResultsContainer.instance.perform_action('Control - applet - Text Filter', term)).to be_true, "Could not complete action for Control - applet - Text Filter"
  expect(LabResultsCoverSheet.instance.perform_verification('Num Numeric Lab Results', total_expected_rows)).to be_true
end

When(/^the user clicks the first non\-Panel result in the Numeric Lab Results applet$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_for_summary_nonpanel_rows
  expect(ehmp.summary_nonpanel_rows.length).to be > 0
  ehmp.summary_nonpanel_rows.first.click
end

# ######################## Then ########################

# currently only supports Numeric Lab Results Container and the modal, but can easily be used later for further parents
Then(/^the "(.*?)" input should be set to "(\d+)" months in the "(.*?)" (?:on|in) the "(.*?)"$/) do |control_name, month_value, time_direction, _parent_name|
  actual_date = @lr.get_element("Control - applet - #{control_name}").attribute("value")

  expected_date = nil

  date_format_template = "%m/%d/%Y"

  if time_direction.downcase == "past"
    expected_date = DateTime.now.prev_month(month_value.to_i).strftime(date_format_template)
  elsif time_direction.downcase == "future"
    expected_date = DateTime.now.next_month(month_value.to_i).strftime(date_format_template)
  else
    fail "You 'past' or 'future' or the direction of time wished to verify."
  end

  verify_elements_equal(expected_date, actual_date)
end

Then(/^the "(.*?)" title is "(.*?)"$/) do |element_name, expected_title|
  actual_title_element = @lr.get_element("modal - Title - #{element_name}")
  expect(actual_title_element.text).to eq(expected_title)
end

Then(/^the "(.*?)" row is$/) do |table_name, expected_table|
  verify_single_row(table_name, expected_table)
end

Then(/^the "(.*?)" is "(.*?)"$/) do |element_name, expected_value|
  # get rid of "number of " from the Gherkin if it exists
  element_name.sub!(/number of /, "")
  element_key = "modal - #{element_name}"
  @lr.wait_until_element_present(element_key, 30)
  element = @lr.get_element(element_key)

  actual_value = element.attribute("textContent").sub(/#{element_name}: /, "")

  verify_elements_equal(expected_value, actual_value)
end

Then(/the Numeric Lab Results should be sorted by "(.*?)"/) do |column_name|
  table_key = "applet - Complete Table"
  @lr.wait_until_element_present(table_key, 15)
  actual_table = @lr.get_element(table_key)

  headers = actual_table.find_elements(:css, "thead tr th[role='columnheader'] a")
  column_index = headers.index { |h| h.text.start_with? column_name }
  p "number of headers: #{headers.length}"
  p "column_index: #{column_index}"

  last_element_num = 0

  flag_hash = {
    "H*" => 1,
    "L*" => 2,
    "H" => 3,
    "L" => 4,
    "" => 5
  }

  @lr.wait_until_element_present(table_key, 15)
  actual_table = @lr.get_element(table_key)
  row_elements = actual_table.find_elements(:css, "tbody tr")

  row_elements.each do |row|
    row.location_once_scrolled_into_view
    cell_elements = row.find_elements(:css, "td:not(.quickmenu-container)")
    #p "#{column_index}: #{cell_elements[column_index].text}"
    current_element_num = flag_hash[cell_elements[column_index].text]
    #p "current element num: #{current_element_num}"
    is_element_greater = current_element_num >= last_element_num
    expect(is_element_greater).to be_true

    last_element_num = current_element_num
  end # row_elements.each
end

Given(/^the user is viewing the expanded view of the Numeric Lab Results Applet$/) do
  expect(@lr.wait_until_element_present('Control - applet - Minimize View')).to be_true
  expect(@lr.wait_until_element_present('Numeric Lab Results single page')).to be_true
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @lr.applet_loaded? }
end

When(/^the user views the "(.*?)" lab result in a modal$/) do |arg1|
  driver = TestSupport.driver
  counter = 0
  button_pushed = false
  modal_open = false
  loop do
    counter += 1
    button_pushed =LabResultsSpecificRows.instance.perform_action(arg1)
    #expect(@lr.perform_action('Detail View Button')).to eq(true)
    modal_open = @uc.wait_until_element_present("Modal", 15)
    break if counter > 3
    break if button_pushed && modal_open
    p 'Modal didnot open, try again'
  end # loop
  expect(modal_open).to be_true, "Modal did not open after #{counter-1} attempts"
end

def there_is_at_least_one_nonempty_labresult_row
  # wait until at least one row is displayed 
  # fail if that row is the empty row display
  return false unless @lr.wait_until_xpath_count_greater_than("applet - Table - xpath", 0)
  return false if TestSupport.driver.find_elements(:css, "[data-appletid=lab_results_grid] tbody .empty").length > 0 
  return true
rescue
  # Congratulations! if you are here, you found at least 1 row and it was not the empty row
  p 'found it!'
  return true
end

When(/^the applet displays numeric lab results$/) do
  #[data-appletid=lab_results_grid] tbody tr
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { there_is_at_least_one_nonempty_labresult_row }
end

def infiniate_scroll(table_id, total_attempts = 7)
  driver = TestSupport.driver
  found_bottom = false
  number_of_attempts = 0
  until found_bottom && number_of_attempts > total_attempts
    count1 = driver.find_elements(:css, "#{table_id} tr").length 
    p "scroll row #{count1} into view"
    element = driver.find_element(:css, "#{table_id} tr:nth-child(#{count1})")

    TestSupport.driver.execute_script("$('#{table_id} tr:nth-child(#{count1})').focusin()")
    element.send_keys(:arrow_down)
    sleep 1
    count2 = driver.find_elements(:css, "#{table_id} tr").length
    found_bottom = (count1 == count2)
    number_of_attempts = found_bottom ? number_of_attempts + 1 : 0
    sleep 1 if found_bottom
  end
  return found_bottom
rescue Exception => e
  p "error thrown #{e}"
  return false
end

def infinite_scroll_other(table_id)
  driver = TestSupport.driver
  found_bottom = false
  number_of_attempts = 0
  until found_bottom && number_of_attempts >2
    count1 = driver.find_elements(:css, "#{table_id} tr").length
    p "scroll row #{count1} into view"
    element = driver.find_element(:css, "#{table_id} tr:nth-child(#{count1})")
    element.location_once_scrolled_into_view
    TestSupport.driver.execute_script("$('#{table_id}').scroll();")
    count2 = driver.find_elements(:css, "#{table_id} tr").length
    found_bottom = (count1 == count2)
    number_of_attempts = found_bottom ? number_of_attempts + 1 : 0
    sleep 1 if found_bottom
  end
  return found_bottom
rescue Exception => e
  # p "error thrown #{e}"
  return false
end

When(/^the user scrolls to the bottom of the expanded Numeric Lab Results Applet$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { infinite_scroll_other('#data-grid-lab_results_grid tbody') }
end

When(/^the user scrolls to the bottom of the Numeric Lab Results Applet$/) do 
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { infiniate_scroll('[data-appletid=lab_results_grid] .data-grid table tbody', 3) }
end

def verify_lab_test_column(expected_text, column = '3')
  #  lab_tests = driver.find_elements(:css, '#data-grid-lab_results_grid tbody td:nth-child(2)')
  driver = TestSupport.driver
  lab_tests = driver.find_elements(:css, "[data-appletid=lab_results_grid] .data-grid table tbody td:nth-child(#{column})")
  lab_tests.each do |lab|
    #expect(lab.text.downcase.include? arg2.downcase).to be_true, "#{lab.text} did not contain #{arg2}"
    lab.location_once_scrolled_into_view
    return false unless lab.text.downcase.include? expected_text.downcase
  end
  return true
rescue
  return false
end

Then(/^the Lab Test column in the Numeric Lab Results Applet contains "(.*?)"$/) do |arg2|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { verify_lab_test_column arg2 }
end

Then(/^the Result column in the Numeric Lab Results Applet contains "(.*?)"$/) do |arg2|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { verify_lab_test_column(arg2, '5') }
end

Then(/^the Lab History table contains rows with data in correct format$/) do
  @ehmp = NumericLabResultsModal.new
  common_modal_elements = ModalElements.new
  
  #expect(@ehmp.wait_for_btn_previous_lab).to eq(true)
  #expect(@ehmp.wait_for_btn_next_lab).to eq(true)
  expect(common_modal_elements.wait_for_btn_x_close).to eq(true)
  expect(common_modal_elements.wait_for_btn_modal_close).to eq(true)

  expect(@ehmp.wait_for_fld_data_table).to eq(true)
  expect(@ehmp.wait_for_fld_data_table_title).to eq(true)
  expect(@ehmp.wait_for_tbl_date_columns).to eq(true)

  expect(@ehmp.tbl_date_columns.length).to be > 0
  expect(@ehmp.date_column_correct_format?).to eq(true), "All of the values in the date column do not match the acceptable format"

  expect(@ehmp.facility_column_allowed_names?).to eq(true), "All the facilities do not match allowable values"
end

Then(/^the Lab History table contains headers$/) do |table|
  lab_history_table = NumericLabResultsModal.new
  max_attempt = 2
  begin
    wait_until { lab_history_table.tbl_headers.length > 0 }
    history_header_text = lab_history_table.tbl_headers.map { |element| element.text.upcase }
    table.headers.each do  | header |
      expect(history_header_text).to include header.upcase
    end
  rescue Selenium::WebDriver::Error::StaleElementReferenceError => state_element
    max_attempt -= 1
    raise stale_element if max_attempt < 0
    p "StaleElementReferenceError, retry"
    retry
  end
end

Then(/^the Lab History table contains at least (\d+) row$/) do |arg1|
  modal = NumericLabResultsModal.new
  modal.wait_for_tbl_data_rows
  expect(modal.tbl_data_rows.length).to be > arg1.to_i
end

Then(/^the Total Tests label displays a number$/) do
  modal = NumericLabResultsModal.new
  modal.wait_for_fld_total_tests_label
  modal.wait_for_fld_total_tests
  expect(modal).to have_fld_total_tests
  expect(modal.fld_total_tests.text).to match(/\d+/)
end

Then(/^the graph has graph points$/) do
  @ehmp = NumericLabResultsModal.new
  # more then 0
  @ehmp.wait_for_graph_points
  expect(@ehmp.graph_points.length).to be > 0
end

Then(/^the graph has date range labels$/) do
  @ehmp = NumericLabResultsModal.new
  @ehmp.wait_for_graph_date_labels
  expect(@ehmp.graph_date_labels.length).to be > 0
  label_format = Regexp.new("\\w{3} \\d{2} \\d{4}")
  @ehmp.graph_date_labels.each do | graph_label |
    no_match = label_format.match(graph_label.text).nil?
    expect(no_match).to eq(false), "#{graph_label.text} does not match expected data format #{label_format}"
  end
end

Then(/^the active date control in the Numeric Lab Results applet is the 2yr button$/) do
  @ehmp = PobNumericLabApplet.new
  expect(@ehmp).to have_date_range_filter
  expect(@ehmp.date_range_filter).to have_btn_2yr_range
  expect(@ehmp.range_is_active? @ehmp.date_range_filter.btn_2yr_range).to eq(true), 'Expected 2yr button to be active'
end

Then(/^the user clicks the date control All in the Numeric Lab Results modal$/) do
  modal = LabResultsModal.instance
  expect(modal.perform_action('Modal Date Filter All')).to eq(true)
end

Then(/^the Lab History table contains rows with data$/) do
  @ehmp = NumericLabResultsModal.new
  common_modal_elements = ModalElements.new
  
  # expect(@ehmp.wait_for_btn_previous_lab).to eq true
  # expect(@ehmp.wait_for_btn_next_lab).to eq true
  expect(common_modal_elements.wait_for_btn_x_close).to eq true
  expect(common_modal_elements.wait_for_btn_modal_close).to eq(true)
  expect(@ehmp.wait_for_fld_data_table).to eq true
  expect(@ehmp.wait_for_fld_data_table_title).to eq true

  expect(@ehmp.wait_for_tbl_data_rows).to eq true
  expect(@ehmp.wait_for_tbl_facility_columns).to eq true
  expect(@ehmp.tbl_facility_columns.length).to be > 0
end

Then(/^the Numeric Lab Results Modal displays Next, Previous Buttons$/) do
  @ehmp = NumericLabResultsModal.new
  common_modal_elements = ModalElements.new
  
  expect(@ehmp.wait_for_btn_previous_lab).to eq true
  expect(@ehmp.wait_for_btn_next_lab).to eq true
end

Then(/^the Total Tests label matches number of rows$/) do
  @ehmp = NumericLabResultsModal.new
  @ehmp.wait_for_tbl_data_rows minimum: 1
  @ehmp.wait_for_tbl_facility_columns minimum: 1

  number_of_tests = @ehmp.tbl_data_rows.length
  expect(@ehmp).to have_fld_total_tests_label
  expect(@ehmp).to have_fld_total_tests
  expect(@ehmp.fld_total_tests.text).to eq(number_of_tests.to_s)
end

When(/^the Numeric Lab Results Applet table has headers$/) do |table|
  applet = PobNumericLabApplet.new
  applet.wait_for_expanded_tbl_headers
  expect(applet.expanded_tbl_headers.length).to be > 0
  #  \(.*\).*
  header_text = applet.expanded_tbl_headers.map { |header| header.text.sub(/ \(.*\).*/, '').sub('Sortable Column', '').strip.upcase }
  table.headers.each do | expected_header |
    expect(header_text).to include expected_header.upcase
  end
end

Then(/^the Lab Graph should be displayed in the Numeric Lab Results modal$/) do
  modal = NumericLabResultsModal.new
  begin
    modal.wait_for_graph_container
    expect(modal).to have_graph_container
  rescue Selenium::WebDriver::Error::StaleElementReferenceError
    retry
  end
end
