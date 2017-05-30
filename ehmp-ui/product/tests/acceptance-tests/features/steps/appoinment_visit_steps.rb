path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

class AppointmentsCoverSheet < AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super
    @appletid = 'appointments'
    appletid_css = "[data-appletid=#{@appletid}]"
    add_verify(CucumberLabel.new("Date"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=appointments] [data-header-instanceid=appointments-dateTimeFormatted]"))
    add_verify(CucumberLabel.new("Description"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=appointments] [data-header-instanceid=appointments-formattedDescription]"))
    add_verify(CucumberLabel.new("Location"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=appointments] [data-header-instanceid=appointments-locationName]"))
    add_verify(CucumberLabel.new("Status"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=appointments] [data-header-instanceid=appointments-status]"))
    add_verify(CucumberLabel.new("Provider"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=appointments] [data-header-instanceid=appointments-providerDisplayName]"))
    add_verify(CucumberLabel.new("Facility"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=appointments] [data-header-instanceid=appointments-facilityMoniker]"))
    add_verify(CucumberLabel.new("Empty Row"), VerifyText.new, AccessHtmlElement.new(:css, '#data-grid-appointments tbody tr.empty'))

    add_applet_buttons(appletid_css)

    # Appointment Rows
    # First Row
    rows = AccessHtmlElement.new(:css, '#data-grid-appointments tbody tr.selectable')
    add_verify(CucumberLabel.new('Appointment Rows'), VerifyXpathCount.new(rows), rows)
    add_action(CucumberLabel.new('First Row'), ClickAction.new, AccessHtmlElement.new(:css, '#data-grid-appointments tbody tr.selectable:nth-child(1)'))
  end

  def applet_loaded?
    return true if am_i_visible? 'Empty Row'
    return TestSupport.driver.find_elements(:css, '#data-grid-appointments tbody tr.selectable').length > 0
  rescue => e 
    # p e
    false
  end
end #AppointmentCoverSheet

class AppointmentExpanded < AllApplets
  include Singleton
  def initialize
    super

    add_verify(CucumberLabel.new("Date"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid="appointments"] [data-header-instanceid="appointments-dateTimeFormatted"]'))
    add_verify(CucumberLabel.new("Description"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid="appointments"] [data-header-instanceid="appointments-formattedDescription"]'))
    add_verify(CucumberLabel.new("Location"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid="appointments"] [data-header-instanceid="appointments-locationName"]'))
    add_verify(CucumberLabel.new("Status"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid="appointments"] [data-header-instanceid="appointments-status"]'))
    add_verify(CucumberLabel.new('Type'), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid="appointments"] [data-header-instanceid="appointments-dateTimeFormatted"]'))
    add_verify(CucumberLabel.new("Provider"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid="appointments"] [data-header-instanceid="appointments-providerDisplayName"]'))
    add_verify(CucumberLabel.new('Reason'), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid="appointments"] [data-header-instanceid="appointments-reasonName"]'))
    add_verify(CucumberLabel.new("Facility"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid="appointments"] [data-header-instanceid="appointments-facilityMoniker"]'))

    # specific appointment rows
    add_verify(CucumberLabel.new("Empty Row"), VerifyText.new, AccessHtmlElement.new(:css, '#data-grid-appointments tbody tr.empty'))
  end
  
  def verify_rows_last_24_hours(css_string)
    return true if am_i_visible? "Empty Row"
    date_columns = TestSupport.driver.find_elements(:css, css_string)
    p date_columns.length
    # DE3318 - 
    p 'DE3318: use Time.now when defect fixed'
    start_time = (Date.today - 1).to_datetime
    # start_time = (Time.now - (24*60*60)).to_datetime
    # end DE3318
    p start_time
    date_format_template = "%m/%d/%Y - %H:%M"
    date_columns.each do | date_element |
      row_date = DateTime.strptime(date_element.text, date_format_template)
      date_in_range = row_date > start_time
      p "#{row_date} is not after #{start_time}" unless date_in_range
      return false unless date_in_range    
    end
    return true
  rescue => e 
    p e
    return false
  end
end

Then(/^Appointments applet loads without issue$/) do
  appointments = AppointmentsCoverSheet.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { appointments.applet_loaded? }
end

When(/^the user filters the Appointment Applet by text "([^"]*)"$/) do |input_text|
  appointments = AppointmentsCoverSheet.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { infiniate_scroll('#data-grid-appointments tbody') }
  row_count = TableContainer.instance.get_elements("Rows - Appointment Applet").size
  p row_count
  unless appointments.am_i_visible? 'Control - applet - Text Filter'
    expect(appointments.perform_action('Control - applet - Filter Toggle')).to eq(true)
    expect(appointments.wait_until_action_element_visible('Control - applet - Text Filter')).to eq(true)
  end
  expect(appointments.perform_action('Control - applet - Text Filter', input_text)).to eq(true)
  wait.until { row_count != TableContainer.instance.get_elements("Rows - Appointment Applet").size }
end

Then(/^the Appointments table only diplays rows including text "([^"]*)"$/) do |input_text|
  upper = input_text.upcase
  lower = input_text.downcase

  path =  "//table[@id='data-grid-appointments']/descendant::td[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::tr"

  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { infiniate_scroll('#data-grid-appointments tbody') }

  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size
  row_count = TableContainer.instance.get_elements("Rows - Appointment Applet").size 
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

When(/^the user refreshes the applet$/) do
  appointments = AppointmentsCoverSheet.instance
  expect(appointments.perform_action('Control - applet - Refresh')).to eq(true)
end

When(/^the user views the first appointment detail view$/) do
  appointments = AppointmentsCoverSheet.instance
  expect(appointments.wait_until_xpath_count_greater_than('Appointment Rows', 0)).to eq(true), "Test requires at least 1 row to be displayed"
  expect(appointments.perform_action('First Row')).to eq(true)
end

Then(/^the Appointment Detail modal displays$/) do |table|
  @ehmp = PobAppointmentsApplet.new
  @ehmp.wait_for_fld_appointment_modal_headers
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.fld_appointment_modal_headers, "#{headers[0]}")).to eq(true), "Field '#{headers[0]}' was not found"
  end
end

Then(/^the Appointments & Visits expanded applet is displayed$/) do
  appointments = AppointmentExpanded.instance
  expected_screen = "Appointments & Visits"
  expect(appointments.perform_verification('Screenname', "#{expected_screen}")).to eq(true), "Expected screenname to be #{expected_screen}"
end

Then(/^the Appointments expanded table contains headers$/) do |table|
  @ehmp = PobAppointmentsApplet.new
  @ehmp.wait_for_expanded_appointment_modal_headers
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.expanded_appointment_modal_headers, "#{headers[0]}")).to eq(true), "Field '#{headers[0]}' was not found"
  end
end

When(/^the user clicks the "([^"]*)" appointment row$/) do |arg1|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { infiniate_scroll('#data-grid-appointments tbody') }
  p 'done scrolling'
  app_elements = AppointmentExpanded.instance
  expect(app_elements.perform_action(arg1)).to eq(true)
end

Then(/^the Appointments and Visits Applet contains data rows$/) do
  compare_item_counts("#data-grid-appointments tr")
end

When(/^user refreshes Appointments and Visits Applet$/) do
  applet_refresh_action("appointments")
end

Then(/^the message on the Appointments and Visits Applet does not say "(.*?)"$/) do  |message_text|
  compare_applet_refresh_action_response("appointments", message_text)
end

Then(/^the user scrolls the Appointments applet$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { infiniate_scroll('#data-grid-appointments tbody') }
end

Then(/^the Appointments table only displays rows from the last (\d+) hours$/) do |arg1|
  app_expanded = AppointmentExpanded.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  wait.until { app_expanded.verify_rows_last_24_hours('#data-grid-appointments tbody tr td:nth-child(1)') }
end
