def verify_numeric_lab_between(start_time, end_time)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @lr.applet_loaded? }
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time * 2)
  wait.until { infiniate_scroll('#data-grid-lab_results_grid tbody') }

  @ehmp = PobNumericLabApplet.new 
  unless @ehmp.has_fld_empty_row?
    format = "%m/%d/%Y"
    lab_date_format = Regexp.new("\\d{2}\/\\d{2}\/\\d{4}")
    date_column_elements = @ehmp.tbl_coversheet_date_column
    expect(date_column_elements.length).to be > 0
    date_column_elements.each do | date_element |
      lab_date_match = lab_date_format.match(date_element.text)
      date_string = lab_date_match.to_s

      is_after_start_time = Date.strptime(date_string, format) >= start_time
      is_before_now = Date.strptime(date_string, format) <= end_time
      expect(is_after_start_time).to eq(true), "#{date_element.text} is not after #{start_time}"
      expect(is_before_now).to eq(true), "#{date_element.text} is not before #{end_time}"
    end
  end
end

Then(/^the Numeric Lab Results applet displays results from the last (\d+) yrs$/) do |years|
  right_now = Date.today
  start_time = Date.today.prev_year(years.to_i)

  verify_numeric_lab_between start_time, right_now
end

Then(/^the Numeric Lab Results applet displays results from the last yr$/) do
  right_now = Date.today
  start_time = Date.today.prev_year(1)

  verify_numeric_lab_between start_time, right_now
end

Then(/^the Numeric Lab Results applet displays results from the last (\d+) months$/) do |month|
  right_now = Date.today
  start_time = Date.today.prev_month(month.to_i)
  verify_numeric_lab_between start_time, right_now
end

Then(/^the Numeric Lab Results applet displays results between "([^"]*)" and "([^"]*)"$/) do |arg1, arg2|
  format = "%m/%d/%Y"
  end_time = Date.strptime(arg2, format)
  start_time = Date.strptime(arg1, format)
  verify_numeric_lab_between start_time, end_time
end

Then(/^the Numeric Lab Results applets displays results from the last 24 hrs$/) do 
  right_now = Date.today
  start_time = Date.today.prev_day(1)

  verify_numeric_lab_between start_time, right_now
end

Then(/^numeric lab results gist is loaded successfully$/) do
  @ehmp = PobNumericLabApplet.new
  @ehmp.wait_until_applet_gist_loaded 
end

When(/^user opens the first numeric lab results gist item$/) do
  @ehmp = PobNumericLabApplet.new
  @ehmp.wait_until_fld_numeric_lab_results_gist_visible
  expect(@ehmp).to have_fld_numeric_lab_results_gist
  rows = @ehmp.fld_numeric_lab_results_gist
  rows[0].click
end

Then(/^numeric lab results info button is displayed$/) do
  @ehmp = PobNumericLabApplet.new
  @ehmp.wait_for_btn_info
  expect(@ehmp).to have_btn_info
end


