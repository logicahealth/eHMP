When(/^the user removes all udaf tags$/) do
  @ehmp = PobUDAF.new unless @ehmp.is_a? PobUDAF
  @ehmp.to_filter_applet_grid('1')
  expect(@ehmp.has_btn_remove_all?).to eq(true)
  num_tags = @ehmp.fld_udaf_tags.length
  @ehmp.btn_remove_all.click
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  wait.until { @ehmp.fld_udaf_tags.length == 0 }
end

When(/^the user removes the udaf tag for term "(.*?)"$/) do |term|
  @ehmp = PobUDAF.new unless @ehmp.is_a? PobUDAF
  num_tags = @ehmp.fld_udaf_tags.length
  @ehmp.remove_udaf_tag(term)
  expect(@ehmp.has_btn_remove_udaf_tag?).to eq(true), "UDAF tag for #{term} is not visible"
  @ehmp.btn_remove_udaf_tag.click

  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  wait.until { @ehmp.fld_udaf_tags.length < num_tags }
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
  @ehmp.fld_edit_filter_title.set filter_title
  @ehmp.fld_edit_filter_title.native.send_keys(:enter)
end

def input_and_enter_into_control(container, modal_or_applet, control_name, input_text)
  attempts ||= 0

  control_key = "Control - #{modal_or_applet} - #{control_name}"
  #p "control_key is #{control_key}"
  wait = Selenium::WebDriver::Wait.new(:timeout => 15)
  wait.until { container.get_element(control_key) }

  input_element = container.get_element(control_key)

  # need to clear what is currently in the input
  # clear() seems to not work correctly with placeholders
  for i in 0...input_element.attribute("value").size
    input_element.send_keys(:backspace)
  end

  # if you just want to clear the input (empty input text)
  unless input_text.strip.empty?
    input_element.send_keys(input_text)
    input_element.submit

    # because of race conditions, sometimes the value doesn't get input correctly
    if input_element.attribute("value") != input_text
      fail
    end
  end # unless
rescue => e
  attempts += 1

  if attempts < 3
    p "Attemping retry of input."
    sleep 2
    retry
  else
    p "!! Error attempting input on - #{control_name} !!"
    raise e
  end # if/else
  #else # succesful begin
  #  p "Input - #{control_name}"
end

When(/^the user enters text "(.*?)" in the "(.*?)" control (?:on|in) the "(.*?)"$/) do |input_text, control_name, parent_name|
  container_key = get_container_key(control_name, parent_name)
  input_and_enter_into_control(container_key.container, container_key.modal_or_applet, container_key.control_name, input_text)
end
