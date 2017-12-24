def verify_applet_title(applet_class, expected_title)
  applet_class.wait_for_fld_applet_title
  expect(applet_class).to have_fld_applet_title
  expect(applet_class.fld_applet_title.text.upcase).to eq(expected_title.upcase)
end

Then(/^user sees Reports Gist$/) do  
  applet = PobReportsApplet.new
  verify_applet_title applet, 'REPORTS'

  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet.applet_loaded? }
end

When(/^the Reports Gist Applet table contains headers$/) do |table|
  applet = PobReportsApplet.new
  applet.wait_for_summary_tbl_headers
  expect(applet.summary_tbl_headers.length).to be > 0
  header_text = applet.summary_tbl_headers.map { |element| element.text.upcase.sub('SORTABLE COLUMN', '').strip }
  table.headers.each do | expected_header |
    expect(header_text).to include expected_header.upcase
  end
end

Then(/^title of the Reports Applet says "(.*?)"$/) do |_arg1|
  applet = PobReportsApplet.new
  verify_applet_title applet, _arg1
end

Then(/^the Reports Gist table contains "([^"]*)" Type\(s\)$/) do |arg1|
  applet = PobReportsApplet.new
  applet.type_elements arg1
  expect(applet.report_summary_type_rows.length).to be > 0, "Expected Reports applet to display reports of type #{arg1}, but it did not"
end

Then(/^the expanded Reports Applet is displayed$/) do
  expected_screen = 'Reports'

  applet = PobReportsApplet.new

  applet.wait_for_menu
  expect(applet).to have_menu
  applet.menu.wait_for_fld_screen_name
  expect(applet.menu).to have_fld_screen_name
  expect(applet.menu.fld_screen_name.text.upcase).to eq(expected_screen.upcase)

  verify_applet_title applet, 'reports'
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { applet.applet_loaded? }
end

Then(/^the Reports Gist Applet contains data rows$/) do
  compare_item_counts("[data-appletid=reports] .data-grid table tr.selectable", 1)
end

When(/^user refreshes Reports Gist Applet$/) do
  applet_refresh_action("reports")
end

Then(/^the message on the Reports Gist Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("reports", message_text)
end

When(/^the Reports Gist Applet expand view contains data rows$/) do
  compare_item_counts("[data-appletid=reports] .data-grid table  tr")
end

When(/^user refreshes Reports Gist Applet expand view$/) do
  applet_refresh_action("reports")
end

Then(/^the message on the Reports Gist Applet expand view does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("reports", message_text)
end

When(/^the user filters the Reports Gist Applet by text "([^"]*)"$/) do |search_field|
  applet = PobReportsApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  row_count = applet.tbl_reports.length

  applet.btn_applet_filter_toggle.click unless applet.fld_applet_text_filter.visible?
  applet.wait_until_fld_applet_text_filter_visible
  applet.fld_applet_text_filter.set search_field
  applet.fld_applet_text_filter.native.send_keys :enter

  wait.until { row_count != applet.tbl_reports.length }
end

Then(/^the Reports Gist table only diplays rows including text "([^"]*)"$/) do |input_text|
  applet = PobReportsApplet.new
  upper = input_text.upcase
  lower = input_text.downcase
  path =  "//div[@data-appletid='reports']//table/descendant::td[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::tr"

  p path
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).length
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  begin
    wait.until { rows_containing_filter_text == applet.tbl_reports.length }
  rescue => e
    p e
  end
  row_count = applet.tbl_reports.length 
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

When(/^the user views the details for the first "([^"]*)" Report$/) do |arg1|
  applet = PobReportsApplet.new
  applet.type_elements arg1
  expect(applet.report_summary_type_rows.length).to be > 0, "Expected Reports applet to display reports of type #{arg1}, but it did not"
  applet.report_summary_type_rows.first.click
end

Then(/^the Report Detail modal displays$/) do |table|
  @ehmp = PobReportsApplet.new
  @ehmp.wait_for_fld_reports_row_details_header
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.fld_reports_row_details_header, "#{headers[0]}")).to eq(true), "Field '#{headers[0]}' was not found"
  end
end

When(/^the user views the first Report detail view$/) do
  applet = PobReportsApplet.new
  applet.wait_for_tbl_reports
  expect(applet.tbl_reports.length).to be > 0, "Test requires at least 1 row to be displayed"
  applet.tbl_reports.first.click
end

When(/^the user clicks the control Expand View in the Reports Gist applet$/) do
  applet = PobReportsApplet.new
  applet.wait_for_btn_applet_expand_view
  expect(applet).to have_btn_applet_expand_view
  applet.btn_applet_expand_view.click
  applet.wait_for_btn_applet_minimize
end

When(/^the user opens the Report Gist Applet filter$/) do
  applet = PobReportsApplet.new
  expect(applet).to have_btn_applet_filter_toggle
  applet.btn_applet_filter_toggle.click

  applet.wait_until_fld_applet_text_filter_visible
end

Then(/^the Reports applet will initially be sorted and group by date$/) do
  applet = PobReportsApplet.new
  applet.wait_for_tbl_group_headers
  expect(applet.tbl_group_headers.length).to be > 0
  group_headers = applet.tbl_group_visible_headers
  group_headers.each do | header |
    expect(header).to match(/[a-zA-Z]+ \d{4}/)
  end
  group_dates = group_headers.map { |element|Date.strptime(element, "%B %Y") }
  expect(group_dates).to eq(group_dates.sort.reverse)
end

When(/^the user sorts the Reports applet on column (\d+)$/) do |arg1|
  applet = PobReportsApplet.new
  header_index = arg1.to_i - 1 # convert from how humans count to how arrays count
  expect(applet.wait_for_summary_tbl_headers).to eq(true)
  expect(applet.summary_tbl_headers.length).to be > 0, "No headers were displayed"
  expect(applet.summary_tbl_headers.length).to be > header_index, "number of headers (#{applet.summary_tbl_headers.length}) is less then sort variable (#{header_index})"

  p "sorting on header #{applet.summary_tbl_headers[header_index].text}"
  applet.summary_tbl_headers[header_index].click
end

Then(/^the Reports applet is sorted by column (\d+) asc$/) do |arg1|
  applet = PobReportsApplet.new
  col_index = arg1.to_i + 1 # account for hidden, quick menu icon col
  text = applet.column_text col_index
  expect(text).to eq(text.sort)
end

Then(/^the Reports applet is sorted by column (\d+) desc$/) do |arg1|
  applet = PobReportsApplet.new
  col_index = arg1.to_i + 1 # account for hidden, quick menu icon col
  text = applet.column_text col_index
  expect(text).to eq(text.sort.reverse)
end

Then(/^the Reports applet is grouped by column (\d+) data$/) do |arg1|
  applet = PobReportsApplet.new
  col_index = arg1.to_i + 1 # account for hidden, quick menu icon col
  text = applet.column_text col_index
  text_set = Set.new(text)
  expect(applet.tbl_group_headers.length).to be > 0
  group_headers = applet.tbl_group_visible_headers
  text_set.each do | expected_header |
    expect(group_headers).to include expected_header
  end
end
