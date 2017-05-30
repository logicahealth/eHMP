def open_gdf
  @ehmp = PobGlobalDateFilter.new unless @ehmp.is_a? PobGlobalDateFilter
  expect(@ehmp).to have_btn_date_region_minimized
  @ehmp.btn_date_region_minimized.click unless @ehmp.has_btn_2yr_range?
  @ehmp.wait_until_btn_2yr_range_visible
  expect(@ehmp.btn_2yr_range.visible?).to eq(true)
end

def apply_gdf_and_close
  @ehmp = PobGlobalDateFilter.new unless @ehmp.is_a? PobGlobalDateFilter
  @ehmp.wait_until_gdt_newsfeed_applet_loaded

  # Page Objects cannot find the apply button in phantomjs
  expect(@cc.perform_action('Control - Coversheet - Apply')).to be_true, "was not able to select Global Date Filter: Apply button"
  # end Page Objects cannot find the apply button in phantomjs
  @ehmp.wait_until_btn_2yr_range_invisible
end

Then(/^the user changes the global date filter to All$/) do
  @ehmp = PobGlobalDateFilter.new unless @ehmp.is_a? PobGlobalDateFilter
  open_gdf

  @ehmp.btn_all_range.click

  apply_gdf_and_close
end

When(/^the user changes the global date filter to 2YR$/) do 
  @ehmp = PobGlobalDateFilter.new unless @ehmp.is_a? PobGlobalDateFilter
  open_gdf

  @ehmp.btn_2yr_range.click

  apply_gdf_and_close
end

When(/^the user changes the global date filter to 1YR$/) do 
  @ehmp = PobGlobalDateFilter.new unless @ehmp.is_a? PobGlobalDateFilter
  open_gdf

  @ehmp.btn_1yr_range.click

  apply_gdf_and_close
end

When(/^the user changes the global date filter to 3M$/) do 
  @ehmp = PobGlobalDateFilter.new unless @ehmp.is_a? PobGlobalDateFilter
  open_gdf

  @ehmp.btn_3mo_range.click

  apply_gdf_and_close
end

When(/^the user changes the global date filter to 1M$/) do 
  @ehmp = PobGlobalDateFilter.new unless @ehmp.is_a? PobGlobalDateFilter
  open_gdf

  @ehmp.btn_1mo_range.click

  apply_gdf_and_close
end

When(/^the user changes the global date filter to 7D$/) do 
  @ehmp = PobGlobalDateFilter.new unless @ehmp.is_a? PobGlobalDateFilter
  open_gdf

  @ehmp.btn_7d_range.click

  apply_gdf_and_close
end

When(/^the user changes the global date filter to 72HR$/) do 
  @ehmp = PobGlobalDateFilter.new unless @ehmp.is_a? PobGlobalDateFilter
  open_gdf

  @ehmp.btn_72hr_range.click

  apply_gdf_and_close
end

When(/^the user changes the global date filter to 24HR$/) do 
  @ehmp = PobGlobalDateFilter.new unless @ehmp.is_a? PobGlobalDateFilter
  open_gdf

  @ehmp.btn_24hr_range.click

  apply_gdf_and_close
end

When(/^the user changes the global date filter to custom dates From "([^"]*)" and to "([^"]*)"$/) do |arg1, arg2|
  @ehmp = PobGlobalDateFilter.new unless @ehmp.is_a? PobGlobalDateFilter
  open_gdf

  input_into_control(CoversheetContainer.instance, 'Coversheet', 'From Date', arg1)
  input_into_control(CoversheetContainer.instance, 'Coversheet', 'To Date', arg2)

  apply_gdf_and_close
end

Then(/^the To Field resets to blank$/) do
  @ehmp = PobGlobalDateFilter.new unless @ehmp.is_a? PobGlobalDateFilter
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  begin
    wait.until { @ehmp.fld_to_date['value'] == '' }
  rescue => e
    p "#{e}: To date value is '#{@ehmp.fld_to_date['value']}'"
    raise
  end
end

Given(/^the user notes the patient's birth date$/) do
  @ehmp = PobDemographicsElements.new unless @ehmp.is_a? PobDemographicsElements
  expect(@ehmp).to have_fld_patient_dob
  @patient_dob = @ehmp.fld_patient_dob.text
  p @patient_dob
end

Then(/^the global date filter displays (\d+) hour range$/) do |arg1|
  ehmp = PobGlobalDateFilter.new
  ehmp.wait_for_fld_date_range_chosen
  expect(ehmp).to have_fld_date_range_chosen
  p ehmp.fld_date_range_chosen.text
  expected_range = "#{Date.today.prev_day.strftime("%m/%d/%Y")} - #{Date.today.next_month(6).strftime("%m/%d/%Y")}"
  expect(ehmp.fld_date_range_chosen.text).to eq(expected_range)
end
