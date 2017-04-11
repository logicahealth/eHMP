class StackedGraph < AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super
    @appletid = 'stackedGraph'
    appletid_css = "[data-appletid=stackedGraph]"
    add_applet_title appletid_css
    add_toolbar_buttons
    rows = AccessHtmlElement.new(:css, "#{appletid_css} div.gist-item")
    add_verify(CucumberLabel.new("Rows"), VerifyXpathCount.new(rows), rows)
    first_clickable_row = "//*[@data-appletid='stackedGraph']/descendant::div[contains(@class, 'gist-item')][1]/descendant::div[contains(@class, 'selectable')][1]"
    add_action(CucumberLabel.new("First Row"), ClickAction.new, AccessHtmlElement.new(:xpath, first_clickable_row))
    # add_action(CucumberLabel.new("Quick View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=stackedGraph] div.toolbarActive [button-type=quick-look-button-toolbar]"))
    add_verify(CucumberLabel.new('Quick View Popover'), VerifyText.new, AccessHtmlElement.new(:css, 'div.gist-popover'))
    add_action(CucumberLabel.new("Done"), ClickAction.new, AccessHtmlElement.new(:id, 'exitEditing'))
  end

  def applet_loaded
    driver = TestSupport.driver
    found_bottom = false
    number_of_attempts = 0
    until found_bottom && number_of_attempts >2
      count1 = driver.find_elements(:css, "[data-appletid=stackedGraph] div.gist-item").length
      p "scroll row #{count1} into view"
      #element = driver.find_element(:css, "#{table_id} tr:nth-child(#{count1})")
      #element.location_once_scrolled_into_view
      sleep 1
      count2 = driver.find_elements(:css, "[data-appletid=stackedGraph] div.gist-item").length
      found_bottom = (count1 == count2)
      number_of_attempts = found_bottom ? number_of_attempts + 1 : 0
      sleep 1 if found_bottom
    end
    return found_bottom
  rescue Exception => e
    p "error thrown #{e}"
    return false
  end
end

Before do
  @stacked_graph_elements = StackedGraph.instance
end

Then(/^the Stacked Graphs applet displays at least (\d+) row$/) do |arg1|
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @stacked_graph_elements.applet_loaded }
  expect(@stacked_graph_elements.wait_until_xpath_count_greater_than('Rows', arg1.to_i - 1)).to eq(true)
end

When(/^the user selects the first row in the Stacked Graph applet$/) do
  expect(@stacked_graph_elements.perform_action('First Row')).to eq(true)
end

Then(/^a toolbar displays with a quick view icon$/) do
  expect(@stacked_graph_elements.wait_until_element_present('Quick View Icon')).to eq(true)
end

When(/^the user selects the Stacked Graphs quick view icon$/) do
  expect(@stacked_graph_elements.perform_action('Quick View Icon')).to eq(true)
end

Then(/^a Stacked Graph quick view table is displayed$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @stacked_graph_elements.am_i_visible? 'Quick View Popover' }
end

def drag_applet_onto_screen(appletid)
  driver = TestSupport.driver
  customize_workspace = CustomizeWorkspace.new
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  arg1 = 0
  arg2 = 10

  all_applets = customize_workspace.fld_applets_in_carousel
  first_applet = all_applets[0]
  first_applet_id = first_applet['data-appletid']
  current_first_applet_id = first_applet['data-appletid']
  
  keep_searching = true

  while keep_searching
    found_applet = customize_workspace.applets_with_id(appletid).length > 0 
    keep_searching = false if found_applet
    if keep_searching

      customize_workspace.fld_applet_carousel_next.click
      # function didn't work when I used paged objects function, not sure why
      wait.until { driver.find_elements(:css, "div.carousel-inner div.active [data-appletid=#{current_first_applet_id}]").length == 0 }

      new_applet_carousel_applets = customize_workspace.fld_applets_in_carousel
      current_first_applet_id = new_applet_carousel_applets[0]['data-appletid']
      keep_searching = current_first_applet_id != first_applet_id
    end
  end

  if found_applet
    # can't change this to page objects, the drag function is expecting a Selenium::WebDriver::Element, not a :Capybara::Node::Element
    applet_preview = driver.find_element(:css, "div.carousel-inner [data-appletid=#{appletid}] span.applet-thumbnail-title")
    perform_drag(applet_preview, arg1, arg2)
    return true
  end
  p "could not find #{appletid} in the applet carousel"
  false
end

When(/^the user adds a "(.*?)" applet to the user defined workspace$/) do |appletid|
  applet_dragged_sucessfully = drag_applet_onto_screen appletid
  expect(applet_dragged_sucessfully).to eq(true)
  screen = ScreenEditor.instance
  screen.wait_until_action_element_visible("Applet Swtchboard", 40)
end

Then(/^the user is presented with an option for "(.*?)"$/) do |view_type|
  screen = ScreenEditor.instance
  expect(screen.am_i_visible? view_type).to eq(true), "Expected to be presented with an option for #{view_type}"
  @ehmp = CustomizeWorkspace.new
  expect(@ehmp.view_options_text).to include view_type
end

Then(/^the user is presented with an option to edit view to "([^"]*)"$/) do |view_type|
  @ehmp = CustomizeWorkspace.new
  @ehmp.wait_for_fld_view_options
  expect(@ehmp.view_options_text).to include view_type
end

Then(/^the user is not presented with an option for "(.*?)"$/) do |view_type|
  screen = ScreenEditor.instance
  expect(screen.am_i_visible? view_type).to eq(false), "Expected to NOT be presented with an option for #{view_type}"
end

When(/^the user adds an expanded "(.*?)" applet to the user defined workspace$/) do |appletid|
  drag_applet_onto_screen appletid

  screen = ScreenEditor.instance
  html_action_element = 'Expanded View'
  screen.wait_until_action_element_visible(html_action_element, 40)
  expect(screen.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
end

When(/^the user adds an trend "(.*?)" applet to the user defined workspace$/) do |appletid|
  expect(drag_applet_onto_screen appletid).to eq(true)

  screen = ScreenEditor.instance
  html_action_element = 'Trend View'
  screen.wait_until_action_element_visible(html_action_element, 40)
  expect(screen.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
end

When(/^the user adds an summary "(.*?)" applet to the user defined workspace$/) do |appletid|
  drag_applet_onto_screen appletid

  screen = ScreenEditor.instance
  html_action_element = 'Summary View'
  screen.wait_until_action_element_visible(html_action_element, 60)
  expect(screen.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
end

When(/^the user adds an expanded Stacked Graphs applet to the user defined workspace$/) do
  driver = TestSupport.driver
  arg1 = 0
  arg2 = 10

  thumbnails = driver.find_elements(:xpath,  "//div[@class='item active']/div").size
  workspaces = driver.find_elements(:xpath, "//ol[@class='carousel-indicators pagination']/li").size
  j = 1
  SG = "Stacked Graphs"
  while j <= workspaces 
    i = 1
    while i <= thumbnails 
      sleep(3)
      if driver.find_elements(:css, 'div.carousel-inner div.active [data-appletid=stackedGraph]').length > 0
        flag = true
        break
      else
        i += 1
      end
    end  
    break if flag
    driver.find_element(:css, "[data-slide=next]").click
    j += 1
  end

  applet_preview = driver.find_element(:css, "div.carousel-inner [data-appletid=stackedGraph] p")
  perform_drag(applet_preview, arg1, arg2)

  screen = ScreenEditor.instance
  html_action_element = 'Stacked Graph expanded view'
  screen.wait_until_action_element_visible(html_action_element, 40)
  expect(screen.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
end

When(/^the user selects done to complete customizing the user defined workspace$/) do
  expect(StackedGraph.instance.perform_action('Done')).to eq(true)
end

Then(/^the User Defined Workspace (\d+) is active$/) do |arg1|
  browser_access = Overview.instance
  expect(browser_access.wait_until_element_present("Overview Screen", DefaultLogin.wait_time)).to be_true
  expect(browser_access.perform_verification("Overview Screen", "User Defined Workspace 1")).to be_true
  # p "DE3055, DE3063: Default screenname is incorrect"
  expect(browser_access.wait_until_xpath_count("Number of Applets", 1, 60)).to be_true
end

Then(/^the applets are displayed are$/) do |table|
  diabetes = DiabetesMellitusCBW.instance
  table.rows.each do |field_name|
    single_cell = field_name[0]
    diabetes.wait_until_element_present(single_cell)
    expect(diabetes.perform_verification(single_cell, single_cell, DefaultTiming.default_table_row_load_time)).to be_true, "Failed looking for #{field_name}"
  end
end

Then(/^the "(.*?)" screen is active$/) do |arg1|
  browser_access = Overview.instance
  expect(browser_access.perform_verification("Overview Screen", arg1)).to be_true
end

Then(/^the active screen displays (\d+) applets$/) do |arg1|
  browser_access = Overview.instance
  expect(browser_access.wait_until_xpath_count("Number of Applets", arg1.to_i, 60)).to be_true
end

When(/^the user attempts to rename the "(.*?)" applet to "(.*?)"$/) do |appletid, new_name|
  stack_graph_applet = StackedGraph.instance
  expect(stack_graph_applet.rename_applet("[data-appletid=#{appletid}]", new_name)).to eq(true)
end

Then(/^the "(.*?)" applet is titled "(.*?)"$/) do |arg1, arg2|
  stack_graph_applet = StackedGraph.instance
  expect(stack_graph_applet.perform_verification('Title', arg2)).to eq(true)
end

def search_for(search_term)
  @ehmp = PobStackedGraph.new
  max_attempt = 3
  begin
    expect(@ehmp).to have_btn_stacked_filter
    @ehmp.btn_stacked_filter.click
    @ehmp.wait_until_fld_search_stacked_graph_visible(5)
    expect(@ehmp).to have_fld_search_stacked_graph
  rescue => e
    p 'searching failed, try again'
    max_attempt -= 1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
  @ehmp.search_for_graph search_term
end

Then(/^the Stacked Graphs applet is empty$/) do
  @ehmp = PobStackedGraph.new
  @ehmp.wait_until_no_graph_placeholder_visible
  expect(@ehmp).to have_no_graph_placeholder
end

When(/^the user adds BMI Vitals to the graph$/) do
  search_term = "BMI"
  search_for search_term
  @ehmp.suggestion_element search_term

  @ehmp.wait_until_fld_vital_result_visible

  @ehmp.wait_until_fld_search_suggestion_visible
  @ehmp.fld_search_suggestion.click
  @ehmp.wait_until_fld_search_suggestion_invisible
end

Then(/^the Stacked Graphs applet does not display a row for BMI$/) do
  @ehmp = PobStackedGraph.new unless @ehmp.is_a? PobStackedGraph
  expect(@ehmp.first_column_text_downcase).to_not include 'bmi'.downcase
end

When(/^the user clicks the row for BMI$/) do
  @ehmp = PobStackedGraph.new unless @ehmp.is_a? PobStackedGraph
  index_of_bmi = @ehmp.first_column_text_downcase.index('bmi')
  p index_of_bmi
  @ehmp.fld_row_label[index_of_bmi].click

end

When(/^the user clicks the BMI Quick View Button$/) do
  stackgraph = StackedGraph.instance
  expect(stackgraph.perform_action('Quick View Button')).to eq(true)
end

When(/^the user clicks the BMI Detail View button$/) do
  stackgraph = StackedGraph.instance
  expect(stackgraph.perform_action('Detail View Button')).to eq(true)
end

When(/^the user adds lab troponin to the graph$/) do
  search_term = "Troponin"
  search_for search_term
  @ehmp.suggestion_element search_term

  @ehmp.wait_until_fld_labtest_result_visible

  @ehmp.wait_until_fld_search_suggestion_visible
  @ehmp.fld_search_suggestion.click
  @ehmp.wait_until_fld_search_suggestion_invisible
end

Then(/^a popover toolbar displays with a delete button$/) do
  @ehmp = PobStackedGraph.new unless @ehmp.is_a? PobStackedGraph
  stackgraph = StackedGraph.instance
  stackgraph.wait_until_action_element_visible('Popover Toolbar')
  expect(@ehmp).to have_btn_delete_graph
end

When(/^the user chooses to remove the graph$/) do
  @ehmp = PobStackedGraph.new unless @ehmp.is_a? PobStackedGraph
  num_graphs = @ehmp.fld_stacked_graphs.length
  @ehmp.btn_delete_graph.click
  @ehmp = PobAlert.new
  @ehmp.wait_until_mdl_alert_region_visible
  expect(@ehmp).to have_btn_delete
  @ehmp.btn_delete.click
  @ehmp.wait_until_mdl_alert_region_invisible
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  @ehmp = PobStackedGraph.new
  wait.until { @ehmp.fld_stacked_graphs.length != num_graphs }
end

When(/^the user adds medication Aspirin to the graph$/) do
  @ehmp = PobStackedGraph.new unless @ehmp.is_a? PobStackedGraph
  search_term = "Aspirin"
  search_for search_term
  @ehmp.suggestion_element search_term

  @ehmp.wait_until_fld_med_result_visible
  @ehmp.wait_until_fld_search_suggestion_visible
  @ehmp.fld_search_suggestion.click
  @ehmp.wait_until_fld_search_suggestion_invisible
end

Then(/^the Stacked Graphs applet displays a row for "([^"]*)"$/) do |row|

  @ehmp = PobStackedGraph.new unless @ehmp.is_a? PobStackedGraph
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @ehmp.fld_stacked_graphs.length > 0 }
  wait.until { @ehmp.first_column_text_downcase.include? row.downcase }

  expect(@ehmp.fld_stacked_graphs.length).to be > 0
  expect(@ehmp.first_column_text_downcase).to include row.downcase
end

