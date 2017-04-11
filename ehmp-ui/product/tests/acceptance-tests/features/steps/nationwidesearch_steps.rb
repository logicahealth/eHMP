
Then(/^the Add Allergy button is not displayed on overview$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @ag.applet_loaded? }
  expect(@ag.am_i_visible? 'Add').to eq(false)
end

Then(/^the Add Condition button is not displayed on overview$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @cg.applet_loaded? }
  expect(@cg.am_i_visible? 'Add').to eq(false)
end

Then(/^the Add Immunization button is not displayed on overview$/) do
  aa = ImmunizationGist.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { aa.applet_loaded? }
  expect(aa.am_i_visible? 'Add').to eq(false)
end

Then(/^the Add Vital button is not displayed on overview$/) do
  aa = VitalsGist.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { aa.applet_loaded? }
  expect(aa.am_i_visible? 'Add').to eq(false)
end

Then(/^the New Observation button button is not displayed$/) do
  wireframe = Wireframe.instance
  expect(wireframe.am_i_visible? 'observation').to eq(false)
end

Then(/^the Add Allergy button is not displayed on cover sheet$/) do
  aa = AllergiesApplet.instance
  # wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  # wait.until { aa.applet_grid_loaded } applet_grid_loaded is for grid view not coversheet pill view
  expect(aa.am_i_visible? 'Add').to eq(false)
end

Then(/^the Add Condition button is not displayed on cover sheet$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @active_problems.applet_grid_loaded }
  expect(@active_problems.am_i_visible? 'Add').to eq(false)
end

Then(/^the Add Immunization button is not displayed on cover sheet$/) do
  aa = ImmunizationsCoverSheet.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { aa.applet_loaded? }
  expect(aa.am_i_visible? 'Add').to eq(false)
end

Then(/^the Add Vital button is not displayed on cover sheet$/) do
  aa = VitalsCoversheet.instance
  expect(aa.am_i_visible? 'Add').to eq(false)
end
