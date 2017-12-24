def remove_single_udaf_tag(term)
  @ehmp = PobUDAF.new unless @ehmp.is_a? PobUDAF
  num_tags = @ehmp.fld_udaf_tags.length
  @ehmp.remove_udaf_tag(term)
  expect(@ehmp.has_btn_remove_udaf_tag?).to eq(true), "UDAF tag for #{term} is not visible"
  @ehmp.btn_remove_udaf_tag.click

  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  wait.until { @ehmp.fld_udaf_tags.length < num_tags }
  true
end

When(/^the user opens applet "([^"]*)" Filter section$/) do |applet_num|
  ehmp = PobUDAF.new
  ehmp.to_filter_applet_grid(applet_num)

  unless ehmp.wait_for_fld_filter
    p "filter was not displayed, open filter section"
    ehmp.btn_open_filter_section.click 
  end
  expect(ehmp.wait_for_fld_filter).to eq(true)
end

When(/^the user removes all udaf tags$/) do
  @ehmp = PobUDAF.new unless @ehmp.is_a? PobUDAF
  @ehmp.to_filter_applet_grid('1')
  expect(@ehmp.has_btn_remove_all?).to eq(true), "'Remove All' button is not displayed"
  num_tags = @ehmp.fld_udaf_tags.length
  @ehmp.btn_remove_all.click
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  wait.until { @ehmp.fld_udaf_tags.length == 0 }
end

When(/^the user removes the udaf tag for term "(.*?)"$/) do |term|
  expect(remove_single_udaf_tag(term)).to eq(true)
end

Then(/^a udaf tag is not displayed for term "(.*?)"$/) do |term|
  @ehmp = PobUDAF.new unless @ehmp.is_a? PobUDAF
  udaf_tags = @ehmp.udaf_tag_text
  expect(udaf_tags).to_not include(term), "#{udaf_tags} incorrectly includes include #{term}"
end

Then(/^a udaf tag is displayed for term "(.*?)"$/) do |term|
  @ehmp = PobUDAF.new unless @ehmp.is_a? PobUDAF
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  wait.until { @ehmp.fld_udaf_tags.length > 0 }
  
  udaf_tags = @ehmp.udaf_tag_text

  expect(udaf_tags).to include(term), "#{udaf_tags} does not include #{term}"
end

When(/^the user filters applet "(.*?)" grid by text "(.*?)"$/) do |applet_id, input_text|
  @ehmp = PobUDAF.new unless @ehmp.is_a? PobUDAF
  @ehmp.to_filter_applet_grid(applet_id)
  expect(@ehmp.btn_add_filter.disabled?).to eq(true)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { infinite_scroll_other('[data-appletid=lab_results_grid] table tbody') }
  # wait.until { infiniate_scroll('[data-appletid=lab_results_grid] table tbody') }
  row_count = @ehmp.fld_grid_rows.length
  @ehmp.fld_filter.set input_text
  wait.until { @ehmp.btn_add_filter.disabled? == false }
  @ehmp.fld_filter.native.send_keys(:enter)  
  begin
    wait.until { row_count != @ehmp.fld_grid_rows.length }
  rescue Selenium::WebDriver::Error::TimeOutError
    expect(row_count).to_not eq(@ehmp.fld_grid_rows.length), "Expected rows to have been filtered but all #{row_count} original rows are displayed"
  end
end

Then(/^a udaf remove all button is displayed$/) do
  @ehmp = PobUDAF.new unless @ehmp.is_a? PobUDAF
  expect(@ehmp.has_btn_remove_all?).to eq(true)
end

Then(/^a udaf filter name input box is displayed$/) do
  @ehmp = PobUDAF.new unless @ehmp.is_a? PobUDAF
  begin
    @ehmp.wait_until_fld_edit_filter_title_visible
  rescue => wait_e
    # p "Timed out waiting for #{@ehmp.fld_edit_filter_title}"
    p @ehmp.fld_edit_filter_title
  end
  expect(@ehmp.has_fld_edit_filter_title?).to eq(true)
end

Then(/^the Numeric Lab Results Filter Title is "(.*?)"$/) do |title|
  @ehmp = PobUDAF.new unless @ehmp.is_a? PobUDAF
  expect(@ehmp.has_fld_filter_title?).to eq(true)
  expect(@ehmp.fld_filter_title.text.upcase).to eq(title.upcase)
end

When(/^the user renames the filter to "(.*?)"$/) do |filter_title|
  @ehmp = PobUDAF.new unless @ehmp.is_a? PobUDAF
  @ehmp.fld_edit_filter_title.native.send_keys [:end]
  @ehmp.fld_edit_filter_title.native.send_keys [:shift, :home], :backspace
  @ehmp.fld_edit_filter_title.set filter_title
  @ehmp.fld_edit_filter_title.native.send_keys(:enter)
end

Given(/^the user creates and views a udw with a summary numeric lab results applet$/) do
  name = "udaffilter#{Time.now.strftime('%Y%m%d%H%M%S%L')}a"
  p name
  steps %{
    Given the user creates a user defined workspace named "#{name}"
    When the user customizes the "#{name}" workspace
    And the user adds an summary "lab_results_grid" applet to the user defined workspace
    And the user selects done to complete customizing the user defined workspace
    Then the "#{name.upcase}" screen is active
    And the active screen displays 1 applets
    Then the applet "1" grid loads without issue
  }
end

Given(/^the user creates a unique user defined workspace$/) do
  @unique_udw_name = "unique#{Time.now.strftime('%Y%m%d%H%M%S%L')}a"
  p @unique_udw_name
  steps %{
    Given the user creates a user defined workspace named "#{@unique_udw_name}"
  }
end

When(/^the user customizes the unique workspace$/) do
  expect(@unique_udw_name).to_not be_nil
  steps %{
    When the user customizes the "#{@unique_udw_name}" workspace
  }
end

Then(/^the unique screen is active$/) do
  expect(@unique_udw_name).to_not be_nil
  steps %{
    Then the "#{@unique_udw_name.upcase}" screen is active
  }
end

When(/^the user navigates to the unique workspace$/) do
  expect(@unique_udw_name).to_not be_nil
  steps %{
    And the user navigates to "#/patient/#{@unique_udw_name}" 
  }
end

