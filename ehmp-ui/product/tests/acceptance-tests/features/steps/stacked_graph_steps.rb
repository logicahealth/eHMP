class StackedGraph < AccessBrowserV2
  include Singleton
  def initialize
    super
    rows = AccessHtmlElement.new(:css, '[data-appletid=stackedGraph] div.gist-item')
    add_verify(CucumberLabel.new("Rows"), VerifyXpathCount.new(rows), rows)
    first_clickable_row = "//*[@data-appletid='stackedGraph']/descendant::div[contains(@class, 'gist-item')][1]/descendant::div[contains(@class, 'selectable')][1]"
    add_action(CucumberLabel.new("First Row"), ClickAction.new, AccessHtmlElement.new(:xpath, first_clickable_row))
    add_action(CucumberLabel.new("Quick View Icon"), ClickAction.new, AccessHtmlElement.new(:css, "[data-appletid=stackedGraph] div.toolbarActive [button-type=quick-look-button-toolbar]"))
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
  arg1 = 0
  arg2 = 10

  thumbnails = driver.find_elements(:xpath,  "//div[@class='item active']/div").size
  workspaces = driver.find_elements(:xpath, "//ol[@class='carousel-indicators pagination']/li").size
  j = 1
  # SG = arg1
  while j <= workspaces 
    i = 1
    while i <= thumbnails 
      sleep(3)
      if driver.find_elements(:css, "div.carousel-inner div.active [data-appletid=#{appletid}]").length > 0
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

  applet_preview = driver.find_element(:css, "div.carousel-inner [data-appletid=#{appletid}] p")
  perform_drag(applet_preview, arg1, arg2)
end

When(/^the user adds an expanded "(.*?)" applet to the user defined workspace$/) do |appletid|
  drag_applet_onto_screen appletid

  screen = ScreenEditor.instance
  html_action_element = 'Expanded View'
  screen.wait_until_action_element_visible(html_action_element, 40)
  expect(screen.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
end

When(/^the user adds an trend "(.*?)" applet to the user defined workspace$/) do |appletid|
  drag_applet_onto_screen appletid

  screen = ScreenEditor.instance
  html_action_element = 'Trend View'
  screen.wait_until_action_element_visible(html_action_element, 40)
  expect(screen.perform_action(html_action_element)).to be_true, "Error when attempting to excercise #{html_action_element}"
end

When(/^the user adds an summary "(.*?)" applet to the user defined workspace$/) do |appletid|
  drag_applet_onto_screen appletid

  screen = ScreenEditor.instance
  html_action_element = 'Summary View'
  screen.wait_until_action_element_visible(html_action_element, 40)
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

