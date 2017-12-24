path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

class AppointmentActions
  def self.verify_rows_last_24_hours
    applet = PobAppointmentsApplet.new
    return true if applet.has_fld_empty_row?
    date_columns = applet.tbl_date_columns
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
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  applet = PobAppointmentsApplet.new
  wait.until { applet.applet_loaded? }
end

When(/^the user filters the Appointment Applet by text "([^"]*)"$/) do |input_text|
  applet = PobAppointmentsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { infiniate_scroll('[data-appletid=appointments] .data-grid table tbody', 3) }

  row_count = applet.fld_appointment_table_row.length
  expect(applet).to have_btn_applet_filter_toggle
  applet.btn_applet_filter_toggle.click unless applet.has_fld_applet_text_filter?
  expect(applet.wait_for_fld_applet_text_filter).to eq(true), "Expected filter input to be visible"
  applet.fld_applet_text_filter.set input_text
  applet.fld_applet_text_filter.native.send_keys :enter
  wait.until { row_count != TableContainer.instance.get_elements("Rows - Appointment Applet").size }
end

Then(/^the Appointments table only diplays rows including text "([^"]*)"$/) do |input_text|
  applet = PobAppointmentsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { infiniate_scroll('[data-appletid=appointments] .data-grid table tbody', 2) }
  p 'try second scroll'
  # scrolling stops working (in automated tests only) after a filter
  wait.until { infinite_scroll_other('[data-appletid=appointments] .data-grid table tbody') }

  row_count = applet.fld_appointment_table_row.length
  rows_containing_filter_text = applet.rows_with_text(input_text).length
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

When(/^the user views the first appointment detail view$/) do
  applet = PobAppointmentsApplet.new
  expect(applet.fld_appointment_table_row.length).to be > 0
  applet.fld_appointment_table_row[0].click
end

Then(/^the Appointment Detail modal displays$/) do |table|
  modal = AppointmentModal.new
  expect(modal.wait_for_fld_modal_title).to eq(true), "Expected modal to have a title"
  expect(modal.fld_modal_title.text.length).to be > 0, "Expected modal to have text in its title"

  expect(modal).to have_btn_next
  expect(modal).to have_btn_previous

  expect(modal.fld_appointment_modal_headers.length).to be > 0
  table.rows.each do |headers|
    expect(object_exists_in_list(modal.fld_appointment_modal_headers, "#{headers[0]}")).to eq(true), "Field '#{headers[0]}' was not found"
  end
end

Then(/^the Appointments & Visits expanded applet is displayed$/) do
  expected_screen = "Appointments & Visits"

  applet = PobAppointmentsApplet.new
  expect(applet).to have_menu
  expect(applet.menu).to have_fld_screen_name
  expect(applet.menu.fld_screen_name.text.upcase).to eq(expected_screen.upcase)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet.applet_loaded? }
end

Then(/^the Appointments expanded table contains headers$/) do |table|
  @ehmp = PobAppointmentsApplet.new
  expect(@ehmp.tbl_headers.length).to be > 0
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.tbl_headers, "#{headers[0]}")).to eq(true), "Field '#{headers[0]}' was not found"
  end
end

Then(/^the Appointments and Visits Applet contains data rows$/) do
  applet = PobAppointmentsApplet.new
  expect(applet.fld_appointment_table_row.length).to be > 0
  expect(applet).to_not have_fld_empty_row
end

When(/^user refreshes Appointments and Visits Applet$/) do
  applet_refresh_action("appointments")
end

Then(/^the message on the Appointments and Visits Applet does not say "(.*?)"$/) do  |message_text|
  compare_applet_refresh_action_response("appointments", message_text)
end

Then(/^the user scrolls the Appointments applet$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  unless PobAppointmentsApplet.new.has_fld_empty_row?
    wait.until { infiniate_scroll('[data-appletid=appointments] .data-grid table tbody') }
  end
end

Then(/^the Appointments table only displays rows from the last (\d+) hours$/) do |arg1|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  wait.until { AppointmentActions.verify_rows_last_24_hours }
end

Then(/^the Appointments coversheet table contains headers$/) do |table|
  applet = PobAppointmentsApplet.new
  expect(applet.wait_for_tbl_headers).to eq(true)  
  table.rows.each do |heading|
    expect(object_exists_in_list(applet.tbl_headers, "#{heading[0]}")).to eq(true)
  end 
end

Then(/^the Appointments & Visits title is "([^"]*)"$/) do |title|
  applet = PobAppointmentsApplet.new
  expect(applet).to have_fld_applet_title
  expect(applet.fld_applet_title.text.upcase).to eq(title.upcase)
end

When(/^the user sorts the Appointments and Visits applet by column Description$/) do
  applet = PobAppointmentsApplet.new
  expect(applet).to have_header_description
  applet.header_description.click
end

Then(/^the Appointments and Visits applet is sorted in alphabetic order based on column Description$/) do
  ehmp = PobAppointmentsApplet.new
  wait_until { ehmp.fld_description_column_values.length > 0 }
  column_values = ehmp.fld_description_column_values
  expect(column_values.length).to be >= 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

Given(/^the user has selected All within the filter daterange on Appointments and Visits$/) do
  applet = PobAppointmentsApplet.new
  expect(applet).to have_date_range_filter
  expect(applet.date_range_filter).to have_btn_all
  applet.date_range_filter.btn_all.click

  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { infiniate_scroll('[data-appletid=appointments] .data-grid table tbody', 3) }
end

Given(/^user navigates to expanded Appointments and Visits applet$/) do
  applet = PobAppointmentsApplet.new
  expected_screen = "Appointments & Visits"
  applet.load
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet.applet_loaded? }
  expect(applet).to have_menu
  expect(applet.menu).to have_fld_screen_name
  expect(applet.menu.fld_screen_name.text.upcase).to eq(expected_screen.upcase)
end

Given(/^the user has selected 24hr within the filter daterange on Appointments and Visits$/) do 
  applet = PobAppointmentsApplet.new
  expect(applet).to have_date_range_filter
  expect(applet.date_range_filter).to have_btn_24hr
  applet.date_range_filter.btn_24hr.click

  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet.applet_loaded? }
end

Given(/^the user has noted the number of Appointments and Visit rows$/) do
  applet = PobAppointmentsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { infiniate_scroll('[data-appletid=appointments] .data-grid table tbody', 3) }
  @num_appvisit_rows = applet.fld_appointment_table_row.length
end

Then(/^the Appointments and Visits Applet displays the expected number of rows$/) do
  applet = PobAppointmentsApplet.new
  expect(@num_appvisit_rows).to_not be_nil
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { infiniate_scroll('[data-appletid=appointments] .data-grid table tbody', 3) }
  expect(applet.fld_appointment_table_row.length).to eq(@num_appvisit_rows)
end

When(/^the user changes Source to Local VA$/) do
  applet = PobAppointmentsApplet.new
  expect(applet.wait_for_fld_source_dropdown).to eq(true), "Expected a source dropdown"
  applet.fld_source_dropdown.select 'Local VA'

  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet.applet_loaded? }
end

Then(/^the Appointments and Visits does not display DOD facility rows$/) do
  applet = PobAppointmentsApplet.new
  expect(applet.expanded_facility_column.length).to be > 0
  facilities = applet.expanded_facility_column.map { |element| element.text.upcase }
  facility_set = Set.new(facilities)
  expect(facility_set).to_not include 'DOD'
end

When(/^the user changes Source to All VA \+ DOD$/) do
  applet = PobAppointmentsApplet.new
  expect(applet.wait_for_fld_source_dropdown).to eq(true), "Expected a source dropdown"
  applet.fld_source_dropdown.select 'All VA + DOD'

  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet.applet_loaded? }
end

Then(/^the Appointments and Visits does display DOD facility rows$/) do
  applet = PobAppointmentsApplet.new
  expect(applet.expanded_facility_column.length).to be > 0
  facilities = applet.expanded_facility_column.map { |element| element.text.upcase }
  facility_set = Set.new(facilities)
  expect(facility_set).to include 'DOD'
end

Given(/^user can view the Quick Menu Icon in appointments applet$/) do
  ehmp = PobAppointmentsApplet.new
  QuickMenuActions.verify_quick_menu ehmp
end

Given(/^Quick Menu Icon is collapsed in appointments applet$/) do
  ehmp = PobAppointmentsApplet.new
  QuickMenuActions.verify_quick_menu_collapsed ehmp
end

When(/^Quick Menu Icon is selected in appointments applet$/) do
  ehmp = PobAppointmentsApplet.new
  QuickMenuActions.select_quick_menu(ehmp)
end

Then(/^user can see the options in the appointments applet$/) do |table|
  ehmp = PobAppointmentsApplet.new
  QuickMenuActions.verify_menu_options ehmp, table
end

When(/^the selects the detail view button from Quick Menu Icon of the first appointments row$/) do
  ehmp = PobAppointmentsApplet.new
  QuickMenuActions.open_menu_click_detail_button ehmp
end

When(/^user hovers over the appointments applet row$/) do
  ehmp = PobAppointmentsApplet.new
  ehmp.wait_for_fld_appointment_table_row
  expect(ehmp).to have_fld_appointment_table_row
  rows = ehmp.fld_appointment_table_row
  expect(rows.length).to be > 0
  rows[0].hover
end

Then(/^user scrolls the appointments applet into view$/) do 
  ehmp = PobAppointmentsApplet.new
  ehmp.scroll_into_view
end


