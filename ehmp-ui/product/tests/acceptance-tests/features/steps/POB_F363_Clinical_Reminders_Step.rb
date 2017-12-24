Then(/^the Clinical Reminders applet is displayed$/) do
  @ehmp = PobClinicalRemindersApplet.new
  @ehmp.wait_until_fld_applet_title_visible
  expect(@ehmp.fld_applet_title.text.upcase).to have_text("Clinical Reminders".upcase), "Applet Clinical Reminders not displayed"
end

Then(/^Clinical Reminders applet loaded successfully$/) do
  @ehmp = PobClinicalRemindersApplet.new
  @ehmp.wait_until_applet_loaded
  #we are assuming here that the applet has rows and not empty. 
  expect(@ehmp).to have_fld_title
end

Given(/^Clinical Reminders applet contians headers$/) do |table|
  @ehmp = PobClinicalRemindersApplet.new
  @ehmp.wait_until_tbl_cds_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(@ehmp.tbl_cds_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found on Clinical Reminders Applet display"
  end
end

When(/^user expands the Clinical Reminders Applet$/) do
  @ehmp = PobClinicalRemindersApplet.new
  @ehmp.wait_until_btn_applet_expand_view_visible
  expect(@ehmp).to have_btn_applet_expand_view
  @ehmp.btn_applet_expand_view.click
end

Then(/^Clinical Reminders expand view applet is displayed$/) do
  @ehmp = PobClinicalRemindersApplet.new
  @ehmp.menu.wait_until_fld_screen_name_visible
  expect(@ehmp.menu.fld_screen_name.text.upcase).to have_text("Clinical Reminders".upcase)
end

When(/^user closes the Clinical Reminders Applet expand view$/) do
  @ehmp = PobClinicalRemindersApplet.new
  @ehmp.wait_until_btn_applet_minimize_visible
  expect(@ehmp).to have_btn_applet_minimize
  @ehmp.btn_applet_minimize.click
end

Then(/^user is navigated back to overview page$/) do
  @ehmp = PobClinicalRemindersApplet.new
  PobOverView.new.wait_for_all_applets_to_load_in_overview
  @ehmp.menu.wait_until_fld_screen_name_visible
  expect(@ehmp.menu.fld_screen_name.text.upcase).to have_text("Overview".upcase)
end

Given(/^Clinical Reminders applet displays Refresh button$/) do
  @ehmp = PobClinicalRemindersApplet.new
  expect(@ehmp).to have_btn_applet_refresh
end

Given(/^Clinical Reminders applet displays Expand View button$/) do
  @ehmp = PobClinicalRemindersApplet.new
  expect(@ehmp).to have_btn_applet_expand_view
end

Then(/^Clinical Reminders applet displays Minimize View button$/) do
  @ehmp = PobClinicalRemindersApplet.new
  expect(@ehmp).to have_btn_applet_minimize
end

Given(/^Clinical Reminders applet displays Help button$/) do
  @ehmp = PobClinicalRemindersApplet.new
  expect(@ehmp).to have_btn_applet_help
end

When(/^user opens the Clinical Reminders applet help$/) do
  @ehmp = PobClinicalRemindersApplet.new
  @ehmp.wait_until_btn_applet_help_visible
  expect(@ehmp).to have_btn_applet_help
  @ehmp.btn_applet_help.click  
end

Given(/^Clinical Reminders applet displays Filter Toggle button$/) do
  @ehmp = PobClinicalRemindersApplet.new
  expect(@ehmp).to have_btn_applet_filter_toggle
end

When(/^user refreshes Clinical Reminders applet$/) do
  @ehmp = PobClinicalRemindersApplet.new
  @ehmp.wait_until_btn_applet_refresh_visible
  expect(@ehmp).to have_btn_applet_refresh
  @ehmp.btn_applet_refresh.click
end

Then(/^the message on the Clinical Reminders applet does not say an error has occurred$/) do
  @ehmp = PobClinicalRemindersApplet.new
  expect(@ehmp).to have_no_fld_error_msg, "Clinical Reminders did not refresh"
end

When(/^user opens the first Clincial Reminders detail view$/) do
  @ehmp = PobClinicalRemindersApplet.new
  @ehmp.wait_until_tbl_cds_rows_visible
  expect(@ehmp).to have_tbl_cds_rows
  @ehmp.tbl_cds_rows.first.click
end

Then(/^the Clinical Reminders applet Detail modal displays details$/) do
  @ehmp = PobClinicalRemindersApplet.new
  @ehmp.wait_until_fld_cds_modal_content_visible(30)
  expect(@ehmp).to have_fld_cds_modal_content
end

When(/^the user opens Clinical Reminders search filter$/) do
  @ehmp = PobClinicalRemindersApplet.new
  @ehmp.wait_until_btn_applet_filter_toggle_visible
  expect(@ehmp).to have_btn_applet_filter_toggle
  @ehmp.btn_applet_filter_toggle.click
  @ehmp.wait_until_fld_applet_text_filter_visible
end

When(/^the user filters the Clinical Reminders Applet by text "([^"]*)"$/) do |filter_text|
  @ehmp = PobClinicalRemindersApplet.new
  row_count = @ehmp.tbl_cds_rows.length
  @ehmp.wait_until_fld_applet_text_filter_visible
  expect(@ehmp).to have_fld_applet_text_filter
  @ehmp.fld_applet_text_filter.set filter_text
  @ehmp.fld_applet_text_filter.native.send_keys(:enter)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { row_count != @ehmp.tbl_cds_rows.length }
end

Then(/^the Clinical Reminders table only displays rows including text "([^"]*)"$/) do |input_text|
  @ehmp = PobClinicalRemindersApplet.new
  upper = input_text.upcase
  lower = input_text.downcase
  row_count = @ehmp.tbl_cds_rows.length
  cds_grid_xpath = "//div[@data-appletid='cds_advice']//table"
  path =  "#{cds_grid_xpath}/descendant::td[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::tr"
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

When(/^the user sorts the Clinical Reminders applet by column Title$/) do
  @ehmp = PobClinicalRemindersApplet.new
  @ehmp.wait_until_fld_title_visible
  expect(@ehmp).to have_fld_title
  @ehmp.fld_title.click
end

Then(/^the Clinical Reminders applet sorts the title in alphabetical order$/) do
  @ehmp = PobClinicalRemindersApplet.new
  titles = @ehmp.tbl_cds_rows_title
  expect(@ehmp.td_text_in_alpha_order(titles)).to eq(true), "Title column is not in alpha order"
end

When(/^user navigates to Clinical Reminders Applet expanded view$/) do
  @ehmp = PobClinicalRemindersApplet.new
  @ehmp.load
  expect(@ehmp).to be_displayed
  @ehmp.wait_until_applet_loaded
  @ehmp.menu.wait_until_fld_screen_name_visible
  expect(@ehmp.menu.fld_screen_name.text.upcase).to have_text("Clinical Reminders".upcase)
end

When(/^user hovers over the clinical reminders applet row$/) do
  ehmp = PobClinicalRemindersApplet.new
  ehmp.wait_for_tbl_cds_rows
  expect(ehmp).to have_tbl_cds_rows
  rows = ehmp.tbl_cds_rows
  expect(rows.length).to be > 0
  rows[0].hover
end

Given(/^user can view the Quick Menu Icon in clinical reminders applet$/) do
  ehmp = PobClinicalRemindersApplet.new
  QuickMenuActions.verify_quick_menu ehmp
end

Given(/^Quick Menu Icon is collapsed in clinical reminders applet$/) do
  ehmp = PobClinicalRemindersApplet.new
  QuickMenuActions.verify_quick_menu_collapsed ehmp
end

When(/^Quick Menu Icon is selected in clinical reminders applet$/) do
  ehmp = PobClinicalRemindersApplet.new
  QuickMenuActions.select_quick_menu ehmp
end

Then(/^user can see the options in the clinical reminders applet$/) do |table|
  ehmp = PobClinicalRemindersApplet.new
  QuickMenuActions.verify_menu_options ehmp, table
end

When(/^user selects the detail view from Quick Menu Icon of clinical reminders applet$/) do
  ehmp = PobClinicalRemindersApplet.new
  QuickMenuActions.open_menu_click_detail_button ehmp
end


