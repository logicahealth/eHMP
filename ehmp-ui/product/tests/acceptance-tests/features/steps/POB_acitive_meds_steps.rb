Then(/^active meds gist is loaded successfully$/) do
  @ehmp = PobActiveRecentMedApplet.new
  @ehmp.wait_until_applet_gist_loaded 
end

When(/^user opens the first active medication gist item$/) do
  @ehmp = PobActiveRecentMedApplet.new
  @ehmp.wait_until_fld_active_meds_gist_item_visible
  expect(@ehmp).to have_fld_active_meds_gist_item
  rows = @ehmp.fld_active_meds_gist_item
  expect(rows.length >= 1).to eq(true), "this test needs at least 2 rows, found only #{rows.length}"
  rows[1].click
end

Then(/^active meds summary view is loaded successfully$/) do
  @ehmp = PobActiveRecentMedApplet.new
  @ehmp.wait_until_summary_applet_loaded
end

When(/^user opens the first active medication summary item$/) do
  @ehmp = PobActiveRecentMedApplet.new
  @ehmp.wait_until_tbl_active_meds_grid_visible
  expect(@ehmp).to have_tbl_active_meds_grid
  rows = @ehmp.tbl_active_meds_grid
  expect(rows.length >= 0).to eq(true), "this test needs at least 1 row, found only #{rows.length}"
  rows[0].click
end
  
Then(/^active meds info button is displayed$/) do
  @ehmp = PobActiveRecentMedApplet.new
  @ehmp.wait_for_btn_info
  expect(@ehmp).to have_btn_info
end

Then(/^user navigates to active meds expanded view$/) do
  @ehmp = PobMedsReview.new
  @ehmp.load
#  expect(@ehmp).to be_displayed
  @ehmp.wait_until_meds_review_applet_loaded
  @ehmp.menu.wait_until_fld_screen_name_visible
  expect(@ehmp.menu.fld_screen_name.text.upcase).to have_text("Meds Review".upcase)
end

When(/^user opens the first medication row$/) do
  @ehmp = PobMedsReview.new
  wait_until { @ehmp.fld_med_items.length > 0 }
  @ehmp.fld_med_items[0].click
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
