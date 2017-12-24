class VerifyArrayContainsText
  include HTMLVerification
  def initialize(accessor)
    @error_message = 'no error message'
    @how = accessor.how
    @locator = accessor.locator
  end

  def pull_value(html_element, _value)
    driver = TestSupport.driver
    return driver.find_elements(@how, @locator)
  end
  
  def verify(html_element, value)
    type_column_values = pull_value(nil, nil)
    found = false
    type_column_values.each do |element|
      #p element.text
      found = element.text.casecmp(value) == 0
      break if found
    end
    found
  end

  def error_message
    return @error_message
  end
end

class NewsFeedApplet < ADKContainer
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Coversheet Dropdown"), ClickAction.new, AccessHtmlElement.new(:id, "screenName"))
    add_verify(CucumberLabel.new("Drop Down Menu"), VerifyText.new, AccessHtmlElement.new(:class, "dropdown-menu"))
    add_action(CucumberLabel.new("Timeline"), ClickAction.new, AccessHtmlElement.new(:css, "a[href$='news-feed']"))
    add_verify(CucumberLabel.new("TIMELINE"), VerifyText.new, AccessHtmlElement.new(:css, "span.center-block.text-center.panel-title"))    
    add_verify(CucumberLabel.new("Providers"), VerifyText.new, AccessHtmlElement.new(:id, "providerSection"))
    add_verify(CucumberLabel.new("Movements"), VerifyText.new, AccessHtmlElement.new(:id, "movementSection"))
    add_verify(CucumberLabel.new("modalPopUpTitle"), VerifyText.new, AccessHtmlElement.new(:id, "mainModalLabel"))      
    add_action(CucumberLabel.new("NewsFeed Filter input"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "#content-region [data-appletid='newsfeed'] .grid-applet-panel input[type=search]"))
    
    add_action(CucumberLabel.new("Search Filter"), ClickAction.new, AccessHtmlElement.new(:css, "#content-region [data-appletid=newsfeed] .applet-filter-button"))

    add_action(CucumberLabel.new("Admitted 1995"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='newsfeed'] [id^=data-grid-applet-] [data-row-instanceid='urn-va-visit-SITE-164-H2303'] td:nth-child(2)"))
    add_action(CucumberLabel.new("Immunization 2000"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='newsfeed'] [id^=data-grid-applet-] [data-row-instanceid='urn-va-immunization-SITE-287-45'] td:nth-child(2)"))
    add_action(CucumberLabel.new("Surgery 1994"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='newsfeed'] [id^=data-grid-applet-] [data-row-instanceid='urn-va-surgery-SITE-65-28'] td:nth-child(2)"))
    add_action(CucumberLabel.new("Consult 1995"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='newsfeed'] [id^=data-grid-applet-] [data-row-instanceid='urn-va-consult-SITE-164-70'] td:nth-child(2)"))

    # had to use xpath instead of css, suspect the css didn't like the comma in the id

    add_verify(CucumberLabel.new("CloseButton"), VerifyText.new, AccessHtmlElement.new(:id, "modal-close-button"))
    add_action(CucumberLabel.new("Close"), ClickAction.new, AccessHtmlElement.new(:id, "modal-close-button"))  
    add_action(CucumberLabel.new("December 1995"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@data-appletid='newsfeed']//table[starts-with(@id, 'data-grid-applet-')]/descendant::td[contains(string(),'December 1995')]")) 

    add_verify(CucumberLabel.new("December 1995 Count"), VerifyText.new, AccessHtmlElement.new(:xpath, "//*[@data-appletid='newsfeed']//table[starts-with(@id, 'data-grid-applet-')]/descendant::*[@data-group-instanceid='199512_groupCount']"))
    add_verify(CucumberLabel.new("title1"), VerifyText.new, AccessHtmlElement.new(:id, "tl_time_title"))
    add_verify(CucumberLabel.new("title2"), VerifyText.new, AccessHtmlElement.new(:id, "tl_time_range"))
    add_verify(CucumberLabel.new("No Records Found"), VerifyText.new, AccessHtmlElement.new(:xpath, "//*[@data-appletid='newsfeed']//table[starts-with(@id, 'data-grid-applet-')]/descendant::td[contains(string(),'No Records Found')]"))
    add_action(CucumberLabel.new("DoD Appointment"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@data-appletid='newsfeed']//table[starts-with(@id, 'data-grid-applet-')]/descendant::*[@data-row-instanceid='urn-va-appointment-DOD-0000000011-1000000717']/td[2]"))
    add_action(CucumberLabel.new("Lab 1998"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@data-appletid='newsfeed']//table[starts-with(@id, 'data-grid-applet-')]/descendant::*[@data-row-instanceid='urn-va-lab-SITE-17-CH-7018878-8366-7']/td[2]"))
    add_action(CucumberLabel.new("DoD Encounter 2012"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@data-appletid='newsfeed']//table[starts-with(@id, 'data-grid-applet-')]/descendant::*[@data-row-instanceid='urn-va-visit-DOD-0000000011-1000000721']/td[2]"))
    add_verify(CucumberLabel.new("Newsfeed Modal Details"), VerifyContainsText.new, AccessHtmlElement.new(:id, "modal-body"))
      
    @@newsfeed_applet_data_grid_rows = AccessHtmlElement.new(:css, "[data-appletid=newsfeed] [id^=data-grid-applet-] > tbody > tr")
    add_verify(CucumberLabel.new("Number of Newsfeed Applet Rows"), VerifyXpathCount.new(@@newsfeed_applet_data_grid_rows), @@newsfeed_applet_data_grid_rows)
    add_verify(CucumberLabel.new('Empty Row'), VerifyText.new, AccessHtmlElement.new(:css, '#content-region [data-appletid=newsfeed] [id^=data-grid-applet-] tr.empty'))
  end

  def applet_loaded?
    return true if am_i_visible? 'Empty Row'
    return TestSupport.driver.find_elements(:css, '#content-region [data-appletid=newsfeed] tbody tr.selectable').length > 0
  rescue => e 
    # p e
    false
  end

  def clear_filter
    driver = TestSupport.driver

    # p "need to clear the filter"
    add_action(CucumberLabel.new('Filter Item'), ClickAction.new, AccessHtmlElement.new(:css, '.clear-udaf-tag'))
    add_verify(CucumberLabel.new('UDAF'), VerifyText.new, AccessHtmlElement.new(:css, 'div.udaf'))
    add_action(CucumberLabel.new('Remove All'), ClickAction.new, AccessHtmlElement.new(:css, '#content-region .remove-all'))
    html_action_element = 'Search Filter'
 
    # Open Filter
    wait_until_action_element_visible(html_action_element, 40)
    perform_action(html_action_element)
    wait_until_action_element_visible('NewsFeed Filter input')

    wait_until_element_present('UDAF', 40)
      
    # remove each filter displayed
    perform_action('Filter Item') while am_i_visible? 'Filter Item'

    
    #Close the filter
    max_attempt = 2
    begin
      perform_action(html_action_element)

      wait = Selenium::WebDriver::Wait.new(:timeout => 5)
      wait.until { !am_i_visible?('NewsFeed Filter input') }
    rescue => e
      p "#{e}"
      max_attempt -= 1
      retry if max_attempt > 0
      raise e if max_attempt <= 0
    end
    # wait_until_action_element_invisible('NewsFeed Filter input')
    p "clear filter should be false: #{am_i_visible?('NewsFeed Filter input')}"
  end

  # can't use the function all other applets use since timeline can be on the page twice
  def verify_alphabetic_sort_caseinsensitive(table_id, column_index, a_z)
    for_error_message = a_z ? "is not greater then" : "is not less then"
    driver = TestSupport.driver
    css_string = "#content-region #{table_id} tbody td:nth-child(#{column_index})"
    columns = driver.find_elements(:css, css_string)
    higher = columns[0].text.downcase
    (1..columns.length-1).each do |i|
      columns[i].location_once_scrolled_into_view
      lower = columns[i].text.downcase
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
end

class NewsFeedDateFilter < ADKContainer
  include Singleton
  def initialize
    super 
    add_action(CucumberLabel.new("Control - Applet - Date Filter"), ClickAction.new, AccessHtmlElement.new(:css, ".global-date-picker #date-region-minimized"))
    add_action(CucumberLabel.new("Control - Applet - From Date"), SendKeysAction.new, AccessHtmlElement.new(:css, "#globalDate-region #filterFromDateGlobal"))
    add_action(CucumberLabel.new("Control - Applet - To Date"), SendKeysAction.new, AccessHtmlElement.new(:id, "filterToDateGlobal"))
    add_action(CucumberLabel.new("Control - Applet - Apply"), ClickAction.new, AccessHtmlElement.new(:id, "customRangeApplyGlobal"))
  end
end

class NewsFeedColumnHeader < ADKContainer
  include Singleton
  def initialize
    super 
    add_verify(CucumberLabel.new("Header1"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='newsfeed'] [id^=data-grid-applet-] [data-header-instanceid='newsfeed-activityDateTime']"))
    add_verify(CucumberLabel.new("Header2"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='newsfeed'] [id^=data-grid-applet-] [data-header-instanceid='newsfeed-activity']"))
    add_verify(CucumberLabel.new("Header3"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='newsfeed'] [id^=data-grid-applet-] [data-header-instanceid='newsfeed-displayType']"))
    add_verify(CucumberLabel.new("Header4"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='newsfeed'] [id^=data-grid-applet-] [data-header-instanceid='newsfeed-primaryProviderDisplay']"))
    add_verify(CucumberLabel.new("Header5"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid='newsfeed'] [id^=data-grid-applet-] [data-header-instanceid='newsfeed-facilityName']"))
    add_action(CucumberLabel.new("Date/Time"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='newsfeed'] [id^=data-grid-applet-] [data-header-instanceid='newsfeed-activityDateTime'] a"))
    add_action(CucumberLabel.new("Type"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='newsfeed'] [id^=data-grid-applet-] [data-header-instanceid='newsfeed-displayType'] a"))
    add_action(CucumberLabel.new("Facility"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid='newsfeed'] [id^=data-grid-applet-] [data-header-instanceid='newsfeed-facilityName'] a"))
  end
end

When(/^user selects Timeline from Coversheet dropdown$/) do
  aa = NewsFeedApplet.instance
  expect(aa.wait_until_action_element_visible("Coversheet Dropdown", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action("Coversheet Dropdown", "")).to be_true, "Could not click on Dropdown menu"
  expect(aa.wait_until_element_present("Drop Down Menu", 60)).to be_true, "Could not see the drop down menu"

  script = "a[href$='news-feed']"
  TestSupport.driver.execute_script("$(\"#{script}\").focus()")
  expect(aa.perform_action("Timeline", "")).to be_true, "Could not click on Timeline link form drop down menu"
end

When(/^user navigates to Timeline Applet$/) do
  navigate_in_ehmp '#/patient/news-feed'
  newsfeed = NewsFeedApplet.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { newsfeed.applet_loaded? }
  newsfeed.clear_filter
end

Then(/^the Timeline applet is loaded$/) do
  newsfeed = NewsFeedApplet.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { newsfeed.applet_loaded? }
end

def debug_on_jenkins
  driver = TestSupport.driver
  headers = driver.find_elements(:xpath, "//*[@data-appletid='newsfeed']/descendant::th")
  p "number of headers #{headers.length}"
  headers.each do |th|
    p "header: #{th.attribute('id')} with value #{th.attribute('value')} #{th.text}"
  end
end

Then(/^the newsfeed table contains headers$/) do |table|
  aa = NewsFeedColumnHeader.instance
  table.rows.each do |key, value|
    result_of_verification = aa.perform_verification(key, value)
    debug_on_jenkins unless result_of_verification
    expect(result_of_verification).to be_true
  end #table
end

Then(/^the user opens newsfeed search filter$/) do
  aa = NewsFeedApplet.instance
  unless aa.am_i_visible? 'NewsFeed Filter input'
    p 'Filter not visible, open it'
    expect(aa.wait_until_action_element_visible("Search Filter", DefaultLogin.wait_time)).to be_true
    expect(aa.perform_action("Search Filter", "")).to be_true
  end
end

Then(/^the default sorting by Date\/Time is in descending in Newsfeed Applet$/) do
  timeline = PobTimeline.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  wait.until { timeline.verify_date_time_sort_selectable(true) == true }
end

Then(/^the sorting by Date\/Time is in ascending in Newsfeed Applet$/) do
  timeline = PobTimeline.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  wait.until { timeline.verify_date_time_sort_selectable(false) == true }
end

Then(/^the NewsFeed Applet table contains rows$/) do |table|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time * 2)
  table_verifier = VerifyTableValue.new
  driver = TestSupport.driver

  wait.until {  
    browser_elements_list = driver.find_elements(:css, "[data-appletid=newsfeed] [id^=data-grid-applet-] tbody tr")
    table_verifier.perform_table_verification(browser_elements_list, "[data-appletid=newsfeed] [id^=data-grid-applet-]", table)
  }
end

When(/^the user filters the Newsfeed Applet by text "([^"]*)"$/) do |search_field|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  row_count = TableContainer.instance.get_elements('Rows - Newsfeed Applet data').size
  aa = NewsFeedApplet.instance
  expect(aa.wait_until_action_element_visible("NewsFeed Filter input", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action("NewsFeed Filter input", search_field)).to be_true
  wait.until { row_count != TableContainer.instance.get_elements('Rows - Newsfeed Applet data').size }
end

Then(/^the Newsfeed table only diplays rows including text "([^"]*)"$/) do |input_text|
  upper = input_text.upcase
  lower = input_text.downcase
  newsfeed_grid_xpath = "//*[@id='content-region']/descendant::div[@data-appletid='newsfeed']//table[starts-with(@id, 'data-grid-applet-')]"
  path =  "#{newsfeed_grid_xpath}/descendant::td[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::tr"
  p path
  row_count = TableContainer.instance.get_elements('Rows - Newsfeed Applet data').size 
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

Then(/^the Timeline table diplays Type "([^"]*)" rows$/) do |input_text|  
  ehmp = PobTimeline.new
  ehmp.wait_for_td_type_column
  expect(object_exists_in_list(ehmp.td_type_column, input_text)).to eq(true), "'#{input_text}' was not found"
end

Then(/^the NewsFeed Applet table contains rows of type "([^"]*)"$/) do |arg1|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { infiniate_scroll("[data-appletid=newsfeed] [id^=data-grid-applet-] tbody") }
  xpath = "//div[@data-appletid='newsfeed']//table[starts-with(@id, 'data-grid-applet-')]/descendant::td[contains(string(), '#{arg1}')]"
  p xpath
  applet = NewsFeedApplet.instance

  label = CucumberLabel.new('Row Type')
  accessor = AccessHtmlElement.new(:xpath, xpath)
  applet.add_verify(label, VerifyXpathCount.new(accessor), accessor)
  expect(applet.wait_until_xpath_count_greater_than('Row Type', 0)).to eq(true), "Expected display to contain at least 1 #{arg1}"
end

When(/^the NewsFeed Applet table contains data rows$/) do
  newsfeed = PobTimeline.new

  expect(newsfeed).to_not have_fld_empty_row
  compare_item_counts("[data-appletid='newsfeed'] [id^=data-grid-applet-] tbody tr")
end

When(/^user refreshes Timeline Applet$/) do
  newsfeed = PobTimeline.new
  newsfeed.wait_for_btn_applet_refresh
  expect(newsfeed).to have_btn_applet_refresh
  newsfeed.btn_applet_refresh.click
end

Then(/^the message on the Timline Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("newsfeed", message_text)
end

Then(/^the Timeline Applet has grouped headers in format MonthName YEAR$/) do
  timeline = PobTimeline.new
  expect(timeline.group_header_rows.length).to be > 0
  expect(timeline.group_header_btns.length).to be > 0
  header_text = timeline.group_header_btns.map { |element| element.text }
  
  months = Date::MONTHNAMES.slice(1, Date::MONTHNAMES.length).join('|')
  month_matcher = Regexp.new("\\d+ Results In (#{months}) \\d{3}")
  header_text.each do | temp_header |
    expect(month_matcher.match(temp_header)).to_not be_nil, "Header #{temp_header} did not match expected format"
  end
end

Then(/^the headers are named for row dates$/) do
  timeline = PobTimeline.new
  months = Date::MONTHNAMES.slice(1, Date::MONTHNAMES.length).join('|')
  month_matcher = Regexp.new("(#{months}) \\d{4}")
  header_texts = timeline.group_header_btns.map { |element| month_matcher.match(element.text).to_s }

  # don't check every row, just unique rows
  date_only = Set.new(timeline.date_column_text_only.map { |full_text| /\d{2}\/\d{2}\/\d{4}/.match(full_text).to_s })
  date_objects = date_only.map { |row_date| Date.strptime(row_date, '%m/%d/%Y') }
  
  date_objects.each do | date_obj |
    temp = date_obj.strftime("%B %Y")
    expect(header_texts).to include temp
  end
end

Given(/^the Timeline Applet displays grouped headers and rows$/) do
  timeline = PobTimeline.new
  expect(timeline.group_header_rows.length).to be > 0, "Expected at least 1 group header"
  expect(timeline.tbl_timeline_table_data.length).to be > 0, "Expected at least 1 data row"
end

Given(/^the user counts the rows displayed for a specific grouped header in the timeline applet$/) do
  timeline = PobTimeline.new
  specific_dates = timeline.date_column_text_only
  months = Date::MONTHNAMES.slice(1, Date::MONTHNAMES.length).join('|')
  month_matcher = Regexp.new("(#{months}) \\d{4}")
  
  header_texts = timeline.group_header_btns.map { |element| month_matcher.match(element.text).to_s }

  group_date = Date.strptime(header_texts[0], '%B %Y')
  row_count = 0
  specific_dates.each do | temp_row_date |
    temp_date = Date.strptime(temp_row_date, '%m/%d/%Y')
    row_count += 1 if temp_date >= group_date && temp_date < group_date.next_month
  end

  @total_rows_before_collapse = timeline.tbl_timeline_table_data.length
  @expected_badge_count = row_count
end

When(/^the user clicks on a group header in the timeline applet$/) do
  timeline = PobTimeline.new
  before_click = timeline.tbl_timeline_table_data.length
  timeline.group_header_btns[0].click
  wait_until { timeline.tbl_timeline_table_data.length != before_click }
end

Then(/^the group header collapses and a badge displays number of hidden rows in the timeline applet$/) do
  timeline = PobTimeline.new
  expect(timeline.groupd_header_badges_nothidden.length).to eq(1)

  expect(timeline.groupd_header_badges_nothidden[0].text).to eq("#{@expected_badge_count}")
  expect(timeline.tbl_timeline_table_data.length).to eq(@total_rows_before_collapse - @expected_badge_count)
end

When(/^the user sorts the Timeline grid by Type$/) do
  timeline = PobTimeline.new
  timeline.wait_for_fld_type_column_header
  expect(timeline).to have_fld_type_column_header
  timeline.fld_type_column_header.click
end

Then(/^the Timeline grid is sorted in alphabetic order based on Type$/) do
  ehmp = PobTimeline.new
  ehmp.wait_for_td_type_column   
  column_values = ehmp.td_type_column
  expect(column_values.length).to be > 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

Then(/^the Timeline grid is sorted in reverse alphabetic order based on Type$/) do
  ehmp = PobTimeline.new
  ehmp.wait_for_td_type_column    
  column_values = ehmp.td_type_column
  expect(column_values.length).to be >= 2
  is_descending = descending? column_values
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_descending == false}"
end

When(/^the user sorts the Timeline grid by Facility$/) do
  timeline = PobTimeline.new
  timeline.wait_for_fld_facility_column_header
  expect(timeline).to have_fld_facility_column_header
  timeline.fld_facility_column_header.click
end

Then(/^the Timeline grid is sorted in alphabetic order based on Facility$/) do
  ehmp = PobTimeline.new
  ehmp.wait_for_td_facility_column   
  column_values = ehmp.td_facility_column
  expect(column_values.length).to be > 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

Then(/^the Timeline grid is sorted in reverse alphabetic order based on Facility$/) do
  ehmp = PobTimeline.new
  ehmp.wait_for_td_facility_column    
  column_values = ehmp.td_facility_column
  expect(column_values.length).to be >= 2
  is_descending = descending? column_values
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_descending == false}"
end

When(/^user sorts on Date\/Time column header in Newsfeed Applet$/) do
  timeline = PobTimeline.new
  timeline.wait_for_fld_date_column_header
  expect(timeline).to have_fld_date_column_header
  timeline.fld_date_column_header.click
end

Given(/^user can view the Quick Menu Icon in timeline applet$/) do
  ehmp = PobTimeline.new
  QuickMenuActions.verify_quick_menu ehmp
end

Given(/^Quick Menu Icon is collapsed in timeline applet$/) do
  ehmp = PobTimeline.new
  QuickMenuActions.verify_quick_menu_collapsed ehmp
end

When(/^Quick Menu Icon is selected in timeline applet$/) do
  ehmp = PobTimeline.new
  QuickMenuActions.select_quick_menu ehmp
end

Then(/^user can see the options in the timeline applet$/) do |table|
  ehmp = PobTimeline.new
  QuickMenuActions.verify_menu_options ehmp, table
end

When(/^user hovers over the timeline applet row$/) do
  ehmp = PobTimeline.new
  ehmp.wait_for_tbl_timeline_table_data
  expect(ehmp).to have_tbl_timeline_table_data
  rows = ehmp.tbl_timeline_table_data
  expect(rows.length).to be > 0
  rows[0].hover
end


