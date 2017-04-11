Then(/^the Community Health Summaries Applet contains buttons$/) do |table|
  comm_health = CommunityHealthSummariesCoverSheet.instance
  table.rows.each do | button|
    cucumber_label = "Control - Applet - #{button[0]}"
    expect(comm_health.am_i_visible? cucumber_label).to eq(true), "#{button[0]} was not visible"
  end
end

Then(/^the Community Health Summary finishes loading$/) do
  comm_health = CommunityHealthSummariesCoverSheet.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { comm_health.applet_loaded? }
end

When(/^the Community Health Summary displays at least (\d+) rows$/) do |num_result|
  comm_health = CommunityHealthSummariesCoverSheet.instance
  expect(comm_health.wait_until_xpath_count_greater_than('row count', num_result.to_i)).to eq(true), "Test requires at least one result to verify functionality"
end

When(/^user clicks on the column header "([^"]*)" in CHS Gist$/) do |name_column_header|
  comm_health = CommunityHealthSummariesCoverSheet.instance
  header = "Header #{name_column_header}"
  p header
  expect(comm_health.perform_action(header)).to be_true
end

Then(/^Authoring Institution column is sorted in "(.*?)" order in CHS Gist$/) do |_arg1|
  comm_health = CommunityHealthSummariesCoverSheet.instance
  driver = TestSupport.driver
  expect(comm_health.wait_until_action_element_visible("Grid", DefaultLogin.wait_time)).to be_true
  element_column_values = driver.find_elements(css: '#data-grid-ccd_grid tbody td:nth-child(2)')
  column_values_array = []
  element_column_values.each do |row|
    column_values_array << row.text.downcase
    # column_values_array << (/\d+/.match(row.text.downcase)).to_s
  end
  p column_values_array
  
  if _arg1.eql?('descending')
    p 'check ascending'
    higher_placement = column_values_array[0].to_i
    column_values_array.each do |year|
      lower_placement = year.to_i
      expect(higher_placement).to be >= lower_placement, "#{higher_placement} is not >= #{lower_placement}"
    end
  else
    p 'check descending'
    higher_placement = column_values_array[0].to_i
    column_values_array.each do |year|
      lower_placement = year.to_i
      expect(higher_placement).to be <= lower_placement, "#{higher_placement} is not <= #{lower_placement}"
    end
  end
end

When(/^the user clicks the Community Health Summary Expand Button$/) do
  comm_health = CommunityHealthSummariesCoverSheet.instance
  expect(comm_health.perform_action('Control - Applet - Expand View')).to eq(true)
end

Then(/^the Expanded Community Health Summary applet displays$/) do
  comm_health = CommunityHealthSummariesCoverSheet.instance
  expect(comm_health.perform_verification('Screen Name', 'Community Health Summaries')).to eq(true)
end

When(/^the user clicks the Community Health Summary Minimize Button$/) do
  comm_health = CommunityHealthSummariesCoverSheet.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  wait.until { comm_health.get_element('Control - Applet - Minimize View').displayed? }
  expect(comm_health.get_element('Control - Applet - Minimize View').displayed?).to eq(true)
  comm_health.get_element('Control - Applet - Minimize View').click
end

Then(/^the user returns to the coversheet$/) do
  browser_access = CoverSheet.instance  
  expect(browser_access.wait_until_element_present("Cover Sheet Pill", 60)).to be_true  
  expect(browser_access.perform_verification("Cover Sheet Pill", "Coversheet")).to be_true
  expect(browser_access.wait_until_xpath_count("Number of Applets", 9)).to be_true
end

When(/^the user views the details for the first Community Health Summary$/) do
  comm_health = CommunityHealthSummariesCoverSheet.instance
  rows = comm_health.community_health_rows
  rows[0].click
end

Then(/^the Community Health Summary View detail view displays$/) do
  @ehmp = PobCommunityHealthApplet.new
  @ehmp.wait_for_fld_patient_identifier
  expect(@ehmp).to have_btn_next
  expect(@ehmp).to have_btn_previous
  expect(@ehmp).to have_fld_patient_identifier
  expect(@ehmp).to have_fld_details
end

When(/^the Community Health Summary Applet contains data rows$/) do
  compare_item_counts("#data-grid-ccd_grid tr")
end

When(/^user refreshes Community Health Summary Applet$/) do
  applet_refresh_action("ccd_grid")
end

Then(/^the message on the Community Health Summary Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("ccd_grid", message_text)
end

When(/^the user views the first Community Health Summary detail view$/) do
  comm_health = CommunityHealthSummariesCoverSheet.instance
  expect(comm_health.wait_until_xpath_count_greater_than('row count', 0)).to eq(true), "Test requires at least 1 row to be displayed"
  expect(comm_health.perform_action('First ccd Row')).to eq(true)
end



