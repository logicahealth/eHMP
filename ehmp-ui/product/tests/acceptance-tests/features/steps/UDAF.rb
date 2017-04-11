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
  row_count = @ehmp.fld_grid_rows.length
  @ehmp.fld_filter.set input_text
  @ehmp.fld_filter.native.send_keys(:enter)
  #expect(@ehmp.btn_add_filter.disabled?).to eq(false)
  wait.until { @ehmp.btn_add_filter.disabled? == false }
  @ehmp.btn_add_filter.click
  
  wait.until { row_count != @ehmp.fld_grid_rows.length }
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
  @ehmp.fld_filter.native.send_keys(:enter)
end

# class UDAF < AccessBrowserV2
#   include Singleton
#   def initialize
#     super
#     add_action(CucumberLabel.new("Lab Result - Text Filter"), ClickAction.new, AccessHtmlElement.new(:id, "grid-filter-button-applet-1"))
#     add_action(CucumberLabel.new("Condition - Text Filter"), ClickAction.new, AccessHtmlElement.new(:id, "grid-filter-button-applet-3"))
#     add_verify(CucumberLabel.new("hematocrit"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#grid-filter-applet-1 > div.grid-filter > form > fieldset > div > div.udaf > span > span"))
#     add_verify(CucumberLabel.new("anion"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#grid-filter-applet-1 > div.grid-filter > form > fieldset > div > div.udaf > span:nth-child(2) > span"))
#     add_verify(CucumberLabel.new("Granulocytes"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#grid-filter-applet-1 > div.grid-filter > form > fieldset > div > div.udaf > span:nth-child(2) > span"))
#     add_verify(CucumberLabel.new("carbon"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#grid-filter-applet-1 > div.grid-filter > form > fieldset > div > div.udaf > span:nth-child(1) > span"))
#     # add_verify(CucumberLabel.new("platelet+12077"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#grid-filter-applet-2 > div.grid-filter > form > span.udaf > span:nth-child(2) > span"))
#     add_action(CucumberLabel.new("Delete - UDAF - hematocrit"), ClickAction.new, AccessHtmlElement.new(:css, "#grid-filter-applet-1 > div.grid-filter > form > fieldset > div > div.udaf > span > span > a > i"))
#     # add_action(CucumberLabel.new("Delete - UDAF - hematology"), ClickAction.new, AccessHtmlElement.new(:css, "#grid-filter-applet-2 > div.grid-filter > form > div > span.udaf > span:nth-child(2) > span > a > i"))
#     add_action(CucumberLabel.new("Header"), ClickAction.new, AccessHtmlElement.new(:css, "#applet-1 > div > div > div.panel-heading.grid-applet-heading > span.panel-title.center-block.text-center > span"))
#     add_action(CucumberLabel.new("New Workspce"), ClickAction.new, AccessHtmlElement.new(:css, "#nav-workspaceSelect > div > ul > li.user-defined-workspace-1-button > a"))
#     # add_action(CucumberLabel.new("Condition - Remove All link"), ClickAction.new, AccessHtmlElement.new(:css, "#grid-filter-applet-3 > div.grid-filter > form > div > a"))
#     add_action(CucumberLabel.new("Lab Result - Remove All link"), ClickAction.new, AccessHtmlElement.new(:css, "#grid-filter-applet-1 > div.grid-filter > form > fieldset > div > div.filter-wrapper > div.remove-all-div > a"))
#     # add_action(CucumberLabel.new("Orders - Remove All link"), ClickAction.new, AccessHtmlElement.new(:css, "#grid-filter-applet-2 > div.grid-filter > form > div > a"))
#     add_verify(CucumberLabel.new("UDAF - anion"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#grid-filter-applet-1 > div.grid-filter > form > fieldset > div > div.udaf > span:nth-child(1) > span"))
#     add_verify(CucumberLabel.new("UDAF - Granulocytes"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#grid-filter-applet-1 > div.grid-filter > form > fieldset > div > div.udaf > span:nth-child(2) > span"))
#     add_verify(CucumberLabel.new("Newly created UDS"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1"))
#     add_action(CucumberLabel.new("Carousel Next Page Button"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='applets-carousel']/div[1]/div[3]/a/span[1]"))
#     add_verify(CucumberLabel.new("Header Filter Title"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#grid-filter-button-applet-1 > span > span.applet-filter-title"))
#     add_action(CucumberLabel.new("Filter Name"), ClickAction.new, AccessHtmlElement.new(:css, "#grid-filter-applet-1 > div.grid-filter > form > fieldset > div > div.filter-wrapper > div.filter-name > span"))
#     add_verify(CucumberLabel.new("Filter Name Text"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@id='grid-filter-applet-1']/div[2]/form/fieldset/div/div[1]/div[1]/span"))
#     add_action(CucumberLabel.new("Filter Rename"), SendKeysAction.new, AccessHtmlElement.new(:css, "#grid-filter-applet-1 > div.grid-filter > form > fieldset > div > div.filter-wrapper > div.filter-name > input"))
#     add_verify(CucumberLabel.new("Filter Title"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#grid-filter-button-applet-1 > span > span.applet-filter-title.text.include? 'Filtered'"))
#     add_action(CucumberLabel.new("Lauch duplicated UDS"), ClickAction.new, AccessHtmlElement.new(:css, "#user-defined-workspace-1-copy > div > div.col-xs-3 > div.col-xs-4.launch-screen"))
#     add_verify(CucumberLabel.new("Filter Tooltip Message"), VerifyContainsText.new, AccessHtmlElement.new(:css, ".tooltip-inner"))
#     add_action(CucumberLabel.new("Med Review expanded view"), ClickAction.new, AccessHtmlElement.new(:css, "#applet-1 > div > div.options-list > ul > li.viewType-optionsBox.col-xs-3.col-xs-offset-3 > div.options-box.expanded"))
#     add_action(CucumberLabel.new("Med Review - Search"), ClickAction.new, AccessHtmlElement.new(:css, "#grid-filter-button-applet-1 > span"))
#     # add_action(CucumberLabel.new("Meds Review Filter"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:id, "input-filter-search"))
#     add_action(CucumberLabel.new("Meds Review Filter"), SendKeysAndEnterAction.new, AccessHtmlElement.new(:css, "input[name='q-applet-1']"))
#     add_verify(CucumberLabel.new("ANALGESICS"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#grid-filter-applet-1 > div.grid-filter > form > fieldset > div > div.udaf > span > span"))
#   end
# end #ScreenEditor

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

# Then(/^user clicks next page button on the carousel$/) do
#   con = UDAF.instance
#   expect(con.wait_until_action_element_visible("Carousel Next Page Button", DefaultLogin.wait_time)).to be_true
#   expect(con.perform_action("Carousel Next Page Button", "")).to be_true
# end

# Then(/^user clicks on the control "(.*?)"$/) do |html_action_element|
#   con = UDAF.instance
#   con.wait_until_action_element_visible(html_action_element, 40)
#   expect(con.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
# end

When(/^the user enters text "(.*?)" in the "(.*?)" control (?:on|in) the "(.*?)"$/) do |input_text, control_name, parent_name|
  container_key = get_container_key(control_name, parent_name)
  input_and_enter_into_control(container_key.container, container_key.modal_or_applet, container_key.control_name, input_text)
end

# Then(/^user defined filter "(.*?)" is created$/) do |filter_element|
#   con = UDAF.instance
#   driver = TestSupport.driver
#   wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time) 
#   if filter_element == "Granulocytes"
#     expect(con.wait_until_action_element_visible("Granulocytes", DefaultLogin.wait_time)).to be_true   
#     expect(con.perform_verification("Granulocytes", filter_element)).to be_true
#   elsif filter_element == "anion"
#     expect(con.wait_until_action_element_visible("anion", DefaultLogin.wait_time)).to be_true   
#     expect(con.perform_verification("anion", filter_element)).to be_true 
#   elsif filter_element == "carbon"
#     expect(con.wait_until_action_element_visible("carbon", DefaultLogin.wait_time)).to be_true   
#     expect(con.perform_verification("carbon", filter_element)).to be_true                                        
#   elsif filter_element == "hematocrit"
#     expect(con.wait_until_action_element_visible("hematocrit", DefaultLogin.wait_time)).to be_true   
#     expect(con.perform_verification("hematocrit", filter_element)).to be_true
#   elsif filter_element == "ANALGESICS"
#     expect(con.wait_until_action_element_visible("ANALGESICS", DefaultLogin.wait_time)).to be_true   
#     expect(con.perform_verification("ANALGESICS", filter_element)).to be_true
#   end
# end

# Then(/^the user enteres "(.*?)" in search box of the Meds Review Applet$/) do |search_text|
#   aa = UDAF.instance
#   expect(aa.wait_until_action_element_visible("Meds Review Filter", DefaultLogin.wait_time)).to be_true
#   expect(aa.perform_action("Meds Review Filter", search_text)).to be_true
# end
