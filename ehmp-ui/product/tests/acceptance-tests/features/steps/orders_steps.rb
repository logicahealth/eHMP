path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'AccessBrowserV2.rb'
require 'date'

class OrdersContainer < AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super
    @appletid = 'orders'
    appletid_css = "[data-appletid=#{@appletid}]"

    add_applet_buttons appletid_css
    add_applet_add_button appletid_css
    add_verify(CucumberLabel.new("Table - Orders Applet"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#data-grid-orders tbody tr"))

    add_verify(CucumberLabel.new("Complete Table"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=orders] table"))

    add_verify(CucumberLabel.new("Modal Section Headers"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#modal-body #order-modal-content .col-md-10 > h4"))
    add_verify(CucumberLabel.new("Modal Fields"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#modal-body #order-modal-content .orderAppletHeader"))
    add_verify(CucumberLabel.new("Modal Fields Rows"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#modal-body #order-modal-content .row"))
    add_action(CucumberLabel.new("Control - modal - Next Button"), ClickAction.new, AccessHtmlElement.new(:id, "ordersNext"))
    add_action(CucumberLabel.new("Control - modal - Previous Button"), ClickAction.new, AccessHtmlElement.new(:id, "ordersPrevious"))

    add_action(CucumberLabel.new("applet - Disabled Next Page Arrow"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=orders] .backgrid-paginator .disabled a[title=\"Next\"]"))
    add_action(CucumberLabel.new("applet - Order Type dropdowns"), ClickAction.new, AccessHtmlElement.new(:css,  "[data-appletid=orders] .dropdown-menu li"))
    add_action(CucumberLabel.new("Control - applet - Next Page Arrow"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=orders] .backgrid-paginator li a[title=\"Next\"]"))
    add_action(CucumberLabel.new("Control - Minimize"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=orders] .applet-minimize-button"))
    add_action(CucumberLabel.new("Control - applet - Previous Button"), ClickAction.new, AccessHtmlElement.new(:css, "#modal-body #orders-previous"))
    add_action(CucumberLabel.new("Control - applet - Apply"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=orders] #custom-range-apply-orders"))
    add_action(CucumberLabel.new("Control - applet - From Date"), SendKeysAction.new, AccessHtmlElement.new(:css, "[data-appletid=orders] #filter-from-date-orders"))
    add_action(CucumberLabel.new("Control - applet - To Date"), SendKeysAction.new, AccessHtmlElement.new(:css, "[data-appletid=orders] #filter-to-date-orders"))
    add_verify(CucumberLabel.new("applet - Date Filter"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=orders] .grid-filter-daterange"))

    add_verify(CucumberLabel.new("Selected Order Type"), VerifyContainsText.new, AccessHtmlElement.new(:id, 'orders-type-options'))
    add_verify(CucumberLabel.new("Tooltip"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, '//*[@data-row-instanceid="urn-va-order-9E7A-3-12978"]/td[3]/a'))
    order_table_rows = AccessHtmlElement.new(:xpath, "//*[@data-appletid='orders']/descendant::tbody/descendant::tr")
    add_verify(CucumberLabel.new("applet - Table - xpath"), VerifyXpathCount.new(order_table_rows), order_table_rows)
    add_action(CucumberLabel.new("Change AMPICILLIN INJ IV 2 GM in 50 over 20 min"), ClickAction.new, AccessHtmlElement.new(:css, "[data-row-instanceid='urn-va-order-9E7A-8-11976']"))
    add_action(CucumberLabel.new("01AUDIOLOGY OUTPATIENT Cons Consultant's Choice"), ClickAction.new, AccessHtmlElement.new(:css, "[data-row-instanceid='urn-va-order-9E7A-3-15479']"))
    add_action(CucumberLabel.new("METFORMIN TAB,SA 500MG TAKE ONE TABLET MOUTH TWICE A DAY Quantity: 180 Refills: 0"), ClickAction.new, AccessHtmlElement.new(:css, "[data-row-instanceid='urn-va-order-9E7A-3-27837']"))
    
    add_action(CucumberLabel.new("Discontinue UPPER GI WITH KUB <Requesting Physician Cancelled>"), ClickAction.new, AccessHtmlElement.new(:css, "[data-row-instanceid='urn-va-order-9E7A-3-12977']"))
    add_action(CucumberLabel.new('CULTURE & SUSCEPTIBILITY UNKNOWN WC LB #18424'), ClickAction.new, AccessHtmlElement.new(:css, "[data-row-instanceid='urn-va-order-9E7A-3-38312']"))
    add_action(CucumberLabel.new('ACETAMINOPHEN TAB 325MG PO Q4H'), ClickAction.new, AccessHtmlElement.new(:css, "[data-row-instanceid='urn-va-order-9E7A-100022-17692']"))
    add_action(CucumberLabel.new('Non-VA ASPIRIN TAB,EC 81MG TAKE ONE TABLET BY MOUTH EVERY MORNING Non-VA medication recommended by VA provider.'), ClickAction.new, AccessHtmlElement.new(:css, "[data-row-instanceid='urn-va-order-9E7A-3-18068']"))
    add_verify(CucumberLabel.new('Empty Row'), VerifyText.new, AccessHtmlElement.new(:css, '#data-grid-orders tr.empty'))
  end # initialize

  def applet_loaded
    return true if am_i_visible? 'Empty Row'
    return row_count > 0
  rescue => e 
    p e
    false
  end

  def row_count
    return TestSupport.driver.find_elements(:css, "#data-grid-orders tbody tr.selectable").length
  end
end # OrdersContainer

Before do
  @oc = OrdersContainer.instance
end

def check_field_format(field_name, correct_format_regex)
  modal_fields_key = "Modal Fields Rows"

  @oc.wait_until_element_present(modal_fields_key, 15)
  actual_modal_rows = @oc.get_elements(modal_fields_key)

  was_evaluated = false

  actual_modal_rows.each do |actual_modal_row|
    if (actual_modal_row.attribute("class") == "row") && (actual_modal_row.text.include?(field_name))
      was_evaluated = true

      row_text = actual_modal_row.text.strip

      actual_match = /#{field_name}\n(?<data>.*)/.match(row_text)
      actual_data = actual_match["data"]
      p "#{field_name} Value: #{actual_data}"

      correct_format_match = correct_format_regex.match(actual_data)

      if correct_format_match == nil
        fail "The #{field_name} was not in the correct format."
      end # if match isn't found
    end # if row is class and field name matches
  end # actual_modal_rows.each

  if was_evaluated == false
    fail "The #{field_name} was not evaluated because the field was not found."
  end
end

# ######################## When ########################

When(/^the user clicks the "(.*?)" button in the Orders applet$/) do |control_name|
  @oc.wait_until_element_present("Table - Orders Applet", 15)
  wait_and_perform(@oc, control_name)
end

When(/^the user selects "(.*?)" in the Orders applet "(.*?)" dropdown$/) do |selection, _control_name|
  @oc.wait_until_element_present("Table - Orders Applet", 15)

  wait = Selenium::WebDriver::Wait.new(:timeout => 15)

  wait.until {
    wait_and_perform(@oc, "applet - Order Type dropdown")
    @oc.get_elements("applet - Order Type dropdowns")[0].displayed?
  }

  wait.until {
    (@oc.get_elements("applet - Order Type dropdowns").size > 1) &&
      (@oc.get_elements("applet - Order Type dropdowns")[0].text.empty? == false)
  }

  dropdown_elements = @oc.get_elements("applet - Order Type dropdowns")

  desired_element = nil

  dropdown_elements.each do |element|
    if element.text.include?(selection)
      desired_element = element
      break
    end
  end

  if desired_element == nil
    fail "The desired element was not found in the dropdown."
  else
    desired_element.click
  end
end

# ######################## Then ########################

Then(/^the modal has the following section headers$/) do |expected_section_headers|
  TestSupport.driver.save_screenshot('features/heders.png')
  actual_section_headers = @oc.get_elements("Modal Section Headers")
  #  print "****actual section headers length : "
  #  p actual_section_headers.length
  expected_section_headers = expected_section_headers.rows

  #expect(actual_section_headers.size).to eq(expected_section_headers.size)

  for i in 0...expected_section_headers.size do
    actual_section_headers[i].location_once_scrolled_into_view
    p actual_section_headers[i].text.strip
    verify_elements_equal(expected_section_headers[i][0], actual_section_headers[i].text.strip)
  end
end

Then(/^under the "(.*?)" headers there are the following fields$/) do |_section_name, expected_fields|
  # removed the check for rows under specific headers
  # after a code change the test was throwing "Element is no longer attached to the DOM"
  # I could add ids to the modals or just check for presence.  Since Orders modal is made up of many html templates I went this route
  expected_fields.rows.each do |row|
    xpath = "//div[contains(@class, 'orderAppletHeader') and contains(string(), '#{row[0]}')]"
    p xpath
    @oc.add_verify(CucumberLabel.new('Order Row'), VerifyText.new, AccessHtmlElement.new(:xpath, xpath))
    expect(@oc.perform_verification('Order Row', row[0])).to eq(true), "Could not find header #{row[0]}"
  end
end

Then(/^under the Order Details headers there are the following fields$/) do |expected_fields|
  # the order details section of the modal has different css then the sections above so it needs its own
  # step
  expected_fields.rows.each do |row|
    xpath = "//div[@id='mainModalDialog']/descendant::div[contains(@class, 'col-md-4') and contains(string(), '#{row[0]}')]"
    p xpath
    @oc.add_verify(CucumberLabel.new('Order Row'), VerifyContainsText.new, AccessHtmlElement.new(:xpath, xpath))
    expect(@oc.perform_verification('Order Row', row[0])).to eq(true), "Could not find label #{row[0]}"
  end
end

Then(/^the "(.*?)" column contains "(.*?)"$/) do |column_name, expected_text|
  driver = TestSupport.driver

  wait = Selenium::WebDriver::Wait.new(:timeout => 15)

  # the only way I was able to avoid stale element references
  sleep 0.5
  wait.until {
    first_row_element = driver.find_element(:css, "[data-appletid=orders] table tbody tr")
    first_row_element.text.include? expected_text
  }

  p "First Row: #{driver.find_element(:css, '[data-appletid=orders] table tbody tr').text}"

  table_key = "Complete Table"
  @oc.wait_until_element_present(table_key, 15)
  actual_table = @oc.get_element(table_key)

  headers = actual_table.find_elements(:css, "thead tr th")
  desired_column_index = headers.index { |h| h.text == column_name }

  actual_data_rows = actual_table.find_elements(:css, "tbody tr")

  actual_data_rows.each do |actual_row|
    desired_actual_column = actual_row.find_elements(:css, "td")[desired_column_index].text
    is_text_included = desired_actual_column.include? expected_text
    expect(is_text_included).to be_true, "The column (#{desired_actual_column}) did not include the expected text (#{expected_text})."
  end # actual_data_rows.each
end

Then(/^the Orders should be sorted by "(.*?)" and then "(.*?)"$/) do |_first_sort_argument, _second_sort_argument|
  sleep 5
  # check type first
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { VerifyTableValue.verify_alphabetic_sort_caseinsensitive('data-grid-orders', 5, true) }

  types = Set.new
  format = "%m/%d/%Y"
  driver = TestSupport.driver
  all_row_types = driver.find_elements(:css, '#content-region #data-grid-orders tbody td:nth-child(5)')
  all_row_types.each do |column|
    types.add(column.text)
  end
  p types

  types.each do |order_type, _num|
    columns = driver.find_elements(:xpath, "//*[@id='data-grid-orders']/tbody/tr/td[.='#{order_type}']/ancestor::tr/descendant::td[1]")
    higher = Date.strptime(columns[0].text, format)
    (1..columns.length-1).each do |i|
      columns[i].location_once_scrolled_into_view
      lower = Date.strptime(columns[i].text, format)
      check_alpha =  ((higher >= lower))
      expect(check_alpha).to eq(true), "Failing order type #{order_type}, expected #{higher} to be earlier then #{lower}"
      #return false unless check_alpha
      higher = lower
    end
  end

  # table_key = "Complete Table"
  # @oc.wait_until_element_present(table_key, 15)
  # actual_table = @oc.get_element(table_key)

  # headers = actual_table.find_elements(:css, "thead tr th")
  # first_column_index = headers.index { |h| h.text == first_sort_argument }
  # second_column_index = headers.index { |h| h.text == second_sort_argument }

  # last_first_element = ""
  # last_second_element = ""

  # @oc.wait_until_element_present(table_key, 15)
  # actual_table = @oc.get_element(table_key)

  # #row_elements = actual_table.find_elements(:css, "tbody tr")
  # row_elements = TestSupport.driver.find_elements(:css, "[data-appletid=orders] table tbody tr")

  # row_elements.each do |row|
  #   row.location_once_scrolled_into_view
  #   # debugger
  #   cell_elements = row.find_elements(:css, "td")
  #   current_first_element = cell_elements[first_column_index].text
  #   current_second_element = cell_elements[second_column_index].text

  #   if current_first_element == last_first_element # only evaluate the 2nd argument if the 1st stays the same
  #     is_second_element_greater = convert_to_date(current_second_element) <= convert_to_date(last_second_element)
  #     expect(is_second_element_greater).to be_true
  #   else # only evaluate the 1st argument if it changes
  #     is_first_element_greater = current_first_element >= last_first_element
  #     expect(is_first_element_greater).to be_true
  #   end # if current == last

  #   last_first_element = current_first_element
  #   last_second_element = current_second_element
  # end # row_elements.each
end

Then(/^the "(.*?)" input should have the value "(.*?)" in the Orders applet$/) do |control_name, expected_value|
  begin
    wait = Selenium::WebDriver::Wait.new(:timeout => 15)
    wait.until { @oc.get_element("Control - applet - #{control_name}").attribute("value") == expected_value }
  rescue Exception => e
    p "Actual value found: #{@oc.get_element("Control - applet - #{control_name}").attribute('value')}"
    raise e
  end
end

Then(/^the selected Order type is "(.*?)"$/) do |expected_text|
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)

  wait.until { @oc.get_element("Selected Order Type") }

  # some of the button's text has some whitespace at the end - remove it with 'strip'
  expect(@oc.perform_verification("Selected Order Type", expected_text)).to be_true
end

Then(/^the "(.*?)" is in the correct format: all digits$/) do |field_name|
  correct_format_regex = /\d+/

  check_field_format(field_name, correct_format_regex)
end

Then(/^the "(.*?)" is in the correct format: mm\/dd\/yyyy hh:mm$/) do |field_name|
  correct_format_regex = /\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}/

  check_field_format(field_name, correct_format_regex)
end

Then(/^the Orders Applet table contains rows$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  wait.until { VerifyTableValue.check_data_rows_exist('orders') }
end

Then(/^user scrolls the order applet down$/) do
  driver = TestSupport.driver
  driver.execute_script("$('#grid-panel-orders').scrollTop(1000000)")
  # sleep 10
end

When(/^user hovers over on the first record's "(.*?)"$/) do |_arg1|
  @oc = OrdersContainer.instance
  driver = TestSupport.driver
  wait = Selenium::WebDriver::Wait.new(:timeout => 60)
  hover = wait.until { driver.find_element(:xpath, "//*[@data-row-instanceid='urn-va-order-9E7A-3-12978']/td[contains(string(),'...')]") }
  driver.action.move_to(hover).perform
end

Then(/^the tooltip contains text "(.*?)"$/) do |arg1|
  driver = TestSupport.driver
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time) 
  wait.until { @oc.get_element("Tooltip") }
  expect(driver.find_element(:xpath, "//*[@data-row-instanceid='urn-va-order-9E7A-3-12978']/td[3]/span").attribute("title")).to include(arg1)
end

When(/^the user scrolls to the bottom of the Orders Applet$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time * 2)
  wait.until { infiniate_scroll('#data-grid-orders tbody') }
end

def there_is_at_least_one_nonempty_order_row
  return false unless @oc.wait_until_xpath_count_greater_than("applet - Table - xpath", 0)
  return false if TestSupport.driver.find_elements(:css, "[data-appletid=orders] tbody .empty").length > 0 
  return true
end

When(/^the applet displays orders$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { there_is_at_least_one_nonempty_order_row }
end

When(/^the user selects order "(.*?)"$/) do |arg1|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)

  # make sure there is at least 1, non-empty row in the orders applet
  wait.until { there_is_at_least_one_nonempty_order_row }
  # scroll the applet until all the rows are loaded
  wait.until { infiniate_scroll('#data-grid-orders tbody') }

  expect(@oc.perform_action(arg1)).to be_true
end

def case_insensive_path(input_text)
  upper = input_text.upcase
  lower = input_text.downcase

  path =  "//table[@id='data-grid-orders']/descendant::td[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::tr"
end

When(/^the user filters the Orders Applet by text "([^"]*)"$/) do |input_text|
  path = case_insensive_path input_text
  p path
  row_count = TableContainer.instance.get_elements("Rows - Orders Applet").size 
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size

  p "row_count (#{row_count}) and rows_containing_filter_text (#{rows_containing_filter_text})"

  control_name = 'Text Filter'
  parent_name = 'Orders applet'
  container_key = get_container_key(control_name, parent_name)
  input_into_control(container_key.container, container_key.modal_or_applet, container_key.control_name, input_text)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { rows_containing_filter_text == TableContainer.instance.get_elements("Rows - Orders Applet").size }
  p "Row count is now: #{TableContainer.instance.get_elements('Rows - Orders Applet').size}"
end

Then(/^the Orders Applet is not filtered by text "([^"]*)"$/) do |input_text|
  path = case_insensive_path input_text
  
  p path
  row_count = TableContainer.instance.get_elements("Rows - Orders Applet").size 
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size
  expect(row_count).to_not eq rows_containing_filter_text
end

When(/^the user opens details for order "([^"]*)"$/) do |arg1|
  # it appears right now that order details can be opened by just clicking the row
  expect(@oc.perform_action(arg1)).to eq(true)
end

def order_date_between_dates(start_string, end_string)
  range = Date.strptime(start_string, "%m/%d/%Y")..Date.strptime(end_string, "%m/%d/%Y")
  order_dates_tds = TestSupport.driver.find_elements(:css, '#data-grid-orders tbody tr.selectable td:nth-child(1)')
  order_dates_tds.each do |td_element|
    td_element.location_once_scrolled_into_view
    td_date = td_element.text
    p td_date
    return false unless range.cover? Date.strptime(td_date, "%m/%d/%Y")
  end
  return true
rescue Exception => e
  p "order_date_between_dates: #{e}"
  return false
end

Then(/^the Orders applet table displays rows with an Order Date between "([^"]*)" and "([^"]*)"$/) do |arg1, arg2|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { order_date_between_dates(arg1, arg2) }
end

Then(/^the Orders should be sorted by Order Date$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => (DefaultTiming.default_table_row_load_time))
  expect(VerifyTableValue.verify_date_sort('data-grid-orders', 1, true)).to eq(true)
  wait.until { VerifyTableValue.verify_date_sort('data-grid-orders', 1, true) }
end

Then(/^the Orders Applet contains data rows$/) do
  compare_item_counts("#data-grid-orders tr")
end

When(/^user refreshes Orders Applet$/) do
  applet_refresh_action("orders")
end

Then(/^the message on the Orders Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("orders", message_text)
end

When(/^the user filters the Orders by text "([^"]*)"$/) do |input_text|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  row_count = TableContainer.instance.get_elements("Rows - Orders Applet").size
  expect(@oc.perform_action('Control - applet - Text Filter', input_text)).to eq(true)
  wait.until { row_count != TableContainer.instance.get_elements("Rows - Orders Applet").size }
end

Then(/^the Orders table only diplays rows including text "([^"]*)"$/) do |input_text|
  upper = input_text.upcase
  lower = input_text.downcase

  path =  "//table[@id='data-grid-orders']/descendant::td[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::tr"

  row_count = TableContainer.instance.get_elements("Rows - Orders Applet").size 
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

Then(/^the Orders Applet table only contains rows with the Type "(.*?)"$/) do |type|
  #"//table[@id='data-grid-orders']/descendant::td[contains(string(), 'Consult')]"
  infiniate_scroll('#data-grid-orders tbody')

  # headers = TestSupport.driver.find_elements(:css, "#data-grid-orders tr th")
  # desired_column_index = headers.index { |h| h.text == 'Type' }
  row_count = TableContainer.instance.get_elements("Rows - Orders Applet").length 
  type_row_count = AccessHtmlElement.new(:xpath, "//td[position() = 5 and contains(string(), '#{type}')]")
  OrdersApplet.instance.add_verify(CucumberLabel.new("Orders Type grid row count"), VerifyXpathCount.new(type_row_count), type_row_count)
  p "#{row_count} to #{type_row_count}"
  expect(OrdersApplet.instance.perform_verification("Orders Type grid row count", row_count)).to be_true
end

Given(/^the user notes the first (\d+) orders$/) do |num_rows|
  order_columns = TestSupport.driver.find_elements(:css, '#data-grid-orders tr.selectable td:nth-child(4)')
  p order_columns.size
  expect(order_columns.size).to be > num_rows.to_i
  @titles = []
  for i in 0..num_rows.to_i - 1
    order_columns[i].location_once_scrolled_into_view
    @titles.push(order_columns[i].text)
  end
  p @titles
end

Then(/^the user can step through the orders using the next button$/) do
  @titles.each do |modal_title|
    expect(@uc.perform_verification("Modal Title", modal_title)).to eq(true), "Expected title to be #{modal_title}"
    expect(@oc.perform_action('Control - modal - Next Button')).to eq(true)
  end
end

Then(/^the user can step through the orders using the previous button$/) do
  expect(@oc.perform_action('Control - modal - Previous Button')).to eq(true)
  @titles.reverse.each { |val| 
    p val
    expect(@uc.perform_verification("Modal Title", val)).to eq(true), "Expected title to be #{val}"
    expect(@oc.perform_action('Control - modal - Previous Button')).to eq(true)
  }
end

Then(/^the Orders Applet table contains less then (\d+) rows$/) do |arg1|
  row_count = @oc.row_count 
  expect(row_count).to be < arg1.to_i
end

Then(/^the Orders Applet table contains more then (\d+) rows$/) do |arg1|
  row_count = @oc.row_count 
  expect(row_count).to be > arg1.to_i
end

Given(/^the Orders Applet contains buttons$/) do |table|
  table.rows.each do |button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(@oc.am_i_visible? cucumber_label).to eq(true), "Could not find button #{button[0]}"
  end
end

