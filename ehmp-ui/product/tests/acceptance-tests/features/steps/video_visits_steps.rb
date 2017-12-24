When(/^the Workspace Manager lists a user defined workspace "([^"]*)"$/) do |arg1|
  workspace_name = 'automatedvideovisit'
  begin
    @title = workspace_name
    step 'the user defined workspace name is listed'
  rescue => e
    p e
    steps %{
      And the user deletes all user defined workspaces
      And the user creates a user defined workspace named "#{workspace_name}"   
      When the user customizes the "#{workspace_name}" workspace
      And the user adds an summary "video_visits" applet to the user defined workspace 
      And the user selects Go To Workspace Manager
      And the Workspace Manager is displayed
      And the user defined workspace name is listed
    }
  end
end

Given(/^the Video Visit Applet displays$/) do
  applet = VideoVisitsApplet.new
  applet.wait_for_fld_applet_title
  expect(applet).to have_fld_applet_title
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  wait.until { applet_grid_loaded(applet.has_fld_empty_row?, applet.tbl_rows) }
end

Then(/^the Video Visit Applet title is "([^"]*)"$/) do |arg1|
  applet = VideoVisitsApplet.new
  applet.wait_for_fld_applet_title
  expect(applet.fld_applet_title.text.upcase).to eq(arg1.upcase)
end

Then(/^the Video Visit Applet header displays refresh, help, add, and filter buttons$/) do
  applet = VideoVisitsApplet.new
  expect(applet).to have_btn_applet_refresh
  expect(applet).to have_btn_applet_help
  expect(applet).to have_btn_applet_add
  expect(applet).to have_btn_applet_filter_toggle
end

Then(/^the Video Visit Applet header does not display a min or max button$/) do
  applet = VideoVisitsApplet.new
  expect(applet).to_not have_btn_applet_expand_view
  expect(applet).to_not have_btn_applet_minimize
end

Then(/^the Video Visit Applet table displays headers$/) do |table|
  applet = VideoVisitsApplet.new
  headers = applet.tbl_headers.map { |header| header.text.sub(/ \(.*\).*/, '').sub('Sortable Column', '').strip.upcase }
  p headers
  table.rows.each do | expected_header |
    expect(headers).to include expected_header[0].upcase
  end
end

Given(/^the Video Visit Applet displays at least (\d+) rows$/) do |arg1|
  applet = VideoVisitsApplet.new
  expect(applet.tbl_rows.length).to be >= arg1.to_i
end

When(/^the user sorts the Video Visit Applet on Column Date$/) do
  applet = VideoVisitsApplet.new
  expect(applet.wait_for_tbl_header_datetime).to eq(true)
  applet.tbl_header_datetime.click
end

Then(/^the Video Visit Applet is sorted by Date\/Time ascending$/) do
  ehmp = VideoVisitsApplet.new
  allowable_sort_time = Time.now
  begin
    # \d{2}\/\d{2}\/\d{4} - \d{2}:\d{2} \w{3}
    dateformat = ehmp.date_column_regex
    dates = ehmp.tbl_rows_date_column.map { |element| dateformat.match(element.text).to_s }
 
    expected_row_dates = dates.clone.sort
    expect(expected_row_dates).to eq(dates)
  rescue Exception => e
    #p 'retry?'
    retry if Time.now < allowable_sort_time + 15
    raise e
  end
end

Then(/^the Video Visit Applet is sorted by Date\/Time descending$/) do
  ehmp = VideoVisitsApplet.new
  allowable_sort_time = Time.now
  begin
    dateformat = ehmp.date_column_regex
    dates = ehmp.tbl_rows_date_column.map { |element| dateformat.match(element.text).to_s }
    
    expected_row_dates = dates.clone.sort.reverse
    expect(expected_row_dates).to eq(dates)
  rescue Exception => e
    retry if Time.now < allowable_sort_time + 15
    raise e
  end
end

Given(/^user hovers over the Video Visit row$/) do
  ehmp = VideoVisitsApplet.new
  ehmp.wait_for_tbl_rows
  expect(ehmp).to have_tbl_rows
  rows = ehmp.tbl_rows
  expect(rows.length).to be > 0
  rows[0].hover
end

Given(/^user can view the Quick Menu Icon in Video Visit applet$/) do
  ehmp = VideoVisitsApplet.new
  QuickMenuActions.verify_quick_menu ehmp
end

Given(/^Quick Menu Icon is collapsed in Video Visit applet$/) do
  ehmp = VideoVisitsApplet.new
  QuickMenuActions.verify_quick_menu_collapsed ehmp
end

When(/^Quick Menu Icon is selected in Video Visit applet$/) do
  ehmp = VideoVisitsApplet.new
  QuickMenuActions.select_quick_menu(ehmp)
end

Then(/^user can see the options in the Video Visit applet$/) do |table|
  ehmp = VideoVisitsApplet.new
  QuickMenuActions.verify_menu_options ehmp, table
end

When(/^the selects the detail view button from Quick Menu Icon of the first Video Visit row$/) do
  ehmp = VideoVisitsApplet.new
  QuickMenuActions.open_menu_click_detail_button ehmp
end

When(/^the user filters the Video Visit applet$/) do
  applet = VideoVisitsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  unless applet.wait_for_fld_applet_text_filter(3)
    expect(applet).to have_btn_applet_filter_toggle
    applet.btn_applet_filter_toggle.click
    expect(applet.wait_for_fld_applet_text_filter).to eq(true)
  end
  timeonly = Regexp.new("\\d{2}:\\d{2}")
  row_count = applet.tbl_rows_date_column.length
  expect(row_count).to be > 0

  first_date_text = applet.tbl_rows_date_column[0].text
  @video_filter_time_only = timeonly.match(first_date_text).to_s
  p "Attempting to filter on text #{@video_filter_time_only}"
  applet.fld_applet_text_filter.set @video_filter_time_only
  applet.fld_applet_text_filter.native.send_keys :enter
  wait.until { row_count != applet.tbl_rows_date_column.length }
end

Then(/^the Video Visit applet is filtered$/) do
  ehmp = VideoVisitsApplet.new
  expect(@video_filter_time_only).to_not be_nil
  dateformat = ehmp.date_column_regex
  dates = ehmp.tbl_rows_date_column.map { |element| dateformat.match(element.text).to_s }
  dates.each do | single_date |
    expect(single_date.upcase).to include @video_filter_time_only.upcase
  end
end

When(/^the user selects the first Video Vist applet row$/) do
  applet = VideoVisitsApplet.new
  expect(applet.tbl_rows.length).to be > 0
  applet.tbl_rows[0].click
end

def required_field_populated(element, name = 'unknown')
  expect(element.text.length).to be > 0, "Expected #{name} to display text"
end

def required_field_value_populated(element, name = 'unknown')
  expect(element.value.length).to be > 0, "Expected #{name} to display text"
end

Then(/^the Video Visit detail modal displays$/) do
  modal = VideoVisitsDetails.new
  step 'the detail modal is displayed'

  begin
    expect(modal).to be_all_there
  rescue Selenium::WebDriver::Error::StaleElementReferenceError
    retry
  end
  required_field_populated(modal.appointment_date_time_fld, 'Date/Time')
  required_field_populated(modal.appointment_facility_fld, 'Facility/Location')
  required_field_populated(modal.appointment_provider_fld, 'Provider')
  required_field_populated(modal.contact_email_fld, 'Patient Email')
  required_field_populated(modal.contact_emergency_fld, 'Emergency Contact')
end

When(/^the user selects the Add Video Visit button$/) do
  applet = VideoVisitsApplet.new
  expect(applet).to have_btn_applet_add
  applet.btn_applet_add.click
end

Then(/^the Create Video Visit Appointment tray displays$/) do
  tray = CreateVideoDisplay.new
  tray_loader = Tray.new
  expect(tray.wait_for_tray_title).to eq(true)
  expect(tray.tray_title.text.upcase).to eq('Create video Visit appointment'.upcase)

  start_time = Time.now
  begin
    expect(tray_loader).to_not have_loading_screen
  rescue => e
    retry if Time.now < start_time + 30
    raise e
  end
    
  begin
    expect(tray).to have_tray_title
    expect(tray).to have_help_icon
    expect(tray).to have_headers
    expect(tray).to have_fld_date
    expect(tray).to have_fld_time

    expect(tray).to have_btn_open_time
    expect(tray).to have_duration
    expect(tray).to have_fld_patient_email
    expect(tray).to have_fld_patient_phone
    expect(tray).to have_fld_phone_type

    expect(tray).to have_fld_provider_name
    expect(tray).to have_fld_provider_email
    expect(tray).to have_fld_provider_phone
    expect(tray).to have_fld_comment
    expect(tray).to have_label_add_instructions

    expect(tray).to have_rb_add_instructions_yes
    expect(tray).to have_rb_add_instrucitons_no
    expect(tray).to have_btn_cancel
    expect(tray).to have_btn_create
  rescue Selenium::WebDriver::Error::StaleElementReferenceError
    retry
  end

  required_field_value_populated(tray.fld_patient_email, "Patient Email")
  required_field_value_populated(tray.fld_provider_email, "Provider Email")
  required_field_value_populated(tray.fld_provider_phone, "Provider Phone")
  expect(tray.btn_create['disabled']).to_not be_nil
  expect(tray.btn_cancel['disabled']).to be_nil
end

Then(/^the Create Video Visit Appointment tray has labels for$/) do |table|
  tray = CreateVideoDisplay.new
  tray.wait_for_headers
  expect(tray.headers.length).to be > 0
  header_text = tray.headers.map { |element| element.text.upcase }
  table.rows.each do | expected_header |
    expect(header_text).to include expected_header[0].upcase
  end
end

When(/^the user fills in the fields$/) do
  tray = CreateVideoDisplay.new
  date_month_from_now = Date.today.next_month.strftime('%m/%d/%Y')

  tray.fld_date.native.send_keys date_month_from_now
  expect(tray.fld_date.value).to eq(date_month_from_now)

  set_time = tray.fld_time.value
  tray.btn_open_time.click
  
  tray.wait_for_btn_increment_time
  expect(tray).to have_btn_increment_time
  tray.btn_increment_time.click

  start_time = Time.now
  seconds_to_wait = 2
  begin
    expect(tray.fld_time.value).to_not eq('set_time'), tray.fld_time.value
  rescue Exception => e
    p "Attempt fld_time #{max_attempt}: #{e}"
    raise e if Time.now > (start_time + seconds_to_wait)
    retry
  end
end

Then(/^the Create Video Visit Appointment tray create button enables$/) do
  tray = CreateVideoDisplay.new
  expect(tray.wait_for_btn_create).to eq(true)
  expect(tray.btn_create['disabled']).to be_nil
end

Then(/^the Video Visit Applet displays appointments scheduled for the next (\d+) days$/) do |arg1|
  ehmp = VideoVisitsApplet.new
  start_date = Date.today
  end_date = Date.today.next_month(3)

  p "#{start_date} #{end_date}"
  allowable_sort_time = Time.now
  begin
    # \d{2}\/\d{2}\/\d{4} - \d{2}:\d{2} \w{3}
    dateformat = ehmp.date_column_regex
    dates = ehmp.tbl_rows_date_column.map { |element| dateformat.match(element.text).to_s }
 
    expected_row_dates = dates.clone.sort
    expect(expected_row_dates).to eq(dates)
  rescue Exception => e
    #p 'retry?'
    retry if Time.now < allowable_sort_time + 15
    raise e
  end
end

When(/^the user selects to include Additional Instructions$/) do
  ehmp = CreateVideoDisplay.new
  expect(ehmp.wait_for_rb_add_instructions_yes).to eq(true)
  ehmp.rb_add_instructions_yes.click
end

Then(/^the Create Video Visit Appointment tray displays Additional Instructions elements$/) do
  ehmp = CreateVideoDisplay.new
  ehmp.wait_for_fld_add_instructions
  expect(ehmp).to have_fld_add_instructions

  ehmp.fld_add_instructions.select 'Medication Review'
  ehmp.wait_for_fld_instructions_to_patients
  expect(ehmp).to have_fld_instructions_to_patients
end

