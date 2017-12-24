class ActiveMedsActions  
  extend ::RSpec::Matchers
  def self.open_active_med_row
    ehmp = PobActiveRecentMedApplet.new
    ehmp.wait_for_tbl_active_meds_grid
    expect(ehmp).to have_tbl_active_meds_grid
    rows = ehmp.tbl_active_meds_grid
    expect(rows.length).to be > 0
    rows[0].hover
    true
  end
  
  def self.open_active_med_gist_row
    ehmp = PobActiveRecentMedApplet.new
    ehmp.wait_for_fld_active_meds_gist_item
    expect(ehmp).to have_fld_active_meds_gist_item
    rows = ehmp.fld_active_meds_gist_item
    expect(rows.length).to be > 0
    rows[0].hover
    true
  end
end

Then(/^active meds summary view is loaded successfully$/) do
  @ehmp = PobActiveRecentMedApplet.new
  @ehmp.wait_until_summary_applet_loaded
end

#adding deliberate extra wait to load at least one item
When(/^user opens the first active medication summary item$/) do
  @ehmp = PobActiveRecentMedApplet.new
  rows = @ehmp.tbl_active_meds_grid
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time * 2)
  wait.until { rows.length > 0 }
  expect(@ehmp).to have_tbl_active_meds_grid  
  expect(rows.length >= 0).to eq(true), "this test needs at least 1 row, found only #{rows.length}"
  rows[0].click
end

Then(/^user navigates to active meds expanded view$/) do
  @ehmp = PobMedsReview.new
  @ehmp.load
#  expect(@ehmp).to be_displayed
  @ehmp.wait_until_meds_review_applet_loaded
  @ehmp.menu.wait_until_fld_screen_name_visible
  expect(@ehmp.menu.fld_screen_name.text.upcase).to have_text("Medication Review".upcase)
end

Then(/^the user sorts the Medication Gist by column Medication$/) do
  @ehmp = PobActiveRecentMedApplet.new
  @ehmp.wait_until_fld_active_meds_name_header_visible
  expect(@ehmp).to have_fld_active_meds_name_header
  @ehmp.fld_active_meds_name_header.click  
end

Then(/^the Medication Gist is sorted in alphabetic order based on Medication$/) do
  @ehmp = PobActiveRecentMedApplet.new
  @ehmp.wait_for_fld_gist_med_names
    
  column_values = @ehmp.fld_gist_med_names
  expect(column_values.length).to be > 2
  is_ascending = ascending? column_values
  expect(is_ascending).to be(true), "Values are not in Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_ascending == false}"
end

Then(/^the Medication Gist is sorted in reverse alphabetic order based on Medication$/) do
  @ehmp = PobActiveRecentMedApplet.new
  @ehmp.wait_for_fld_gist_med_names
  
  column_values = @ehmp.fld_gist_med_names
  expect(column_values.length).to be > 2
  is_descending = descending? column_values
  expect(is_descending).to be(true), "Values are not in reverse Alphabetical Order: #{print_all_value_from_list_elements(column_values) if is_descending == false}"
end

When(/^user views first active medication details$/) do
  ehmp = PobActiveRecentMedApplet.new
  ehmp.wait_for_tbl_active_meds_grid
  expect(ehmp).to have_tbl_active_meds_grid
  rows = ehmp.tbl_active_meds_grid
  expect(rows.length).to be > 0
  rows[0].click
end

Then(/^the detail view displays the notice banner$/) do
  @ehmp = PobMedsReview.new
  @ehmp.wait_for_fld_med_review_banner
  expect(@ehmp).to have_fld_med_review_banner
  expect(@ehmp.fld_med_review_banner.text.upcase).to have_text("NOTICE: Order check information, override reasons and comments are not available in eHMP. This information is available in CPRS.".upcase) 
end

Given(/^user can view the Quick Menu Icon in activemeds applet$/) do
  ehmp = PobActiveRecentMedApplet.new
  QuickMenuActions.verify_quick_menu ehmp
end

Given(/^Quick Menu Icon is collapsed in activemeds applet$/) do
  ehmp = PobActiveRecentMedApplet.new
  QuickMenuActions.verify_quick_menu_collapsed ehmp
end

When(/^Quick Menu Icon is selected in activemeds applet$/) do
  ehmp = PobActiveRecentMedApplet.new
  QuickMenuActions.select_quick_menu(ehmp)
end

Then(/^user can see the options in the activemeds applet$/) do |table|
  ehmp = PobActiveRecentMedApplet.new
  QuickMenuActions.verify_menu_options ehmp, table
end

Then(/^there exists a quick view popover table in activemeds applet$/) do 
  ehmp = PobActiveRecentMedApplet.new
  QuickMenuActions.verify_popover_table ehmp
end

Then(/^user scrolls the activemeds applet into view$/) do 
  ehmp = PobActiveRecentMedApplet.new
  ehmp.scroll_into_view
end

When(/^user hovers over the activemeds applet trend view row$/) do
  expect(ActiveMedsActions.open_active_med_gist_row).to eq(true)
end

When(/^user hovers over the activemeds applet row$/) do
  expect(ActiveMedsActions.open_active_med_row).to eq(true)
end

When(/^user selects the detail view button from Quick Menu Icon of the first activemeds row$/) do
  ehmp = PobActiveRecentMedApplet.new
  QuickMenuActions.open_menu_click_detail_button ehmp
end

Then(/^activemeds quick look table contains headers$/) do |table|
  ehmp = PobActiveRecentMedApplet.new
  QuickMenuActions.verify_popover_table_headers ehmp, table
end


