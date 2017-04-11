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
  @ehmp.wait_until_fld_med_item_visible
  @ehmp.fld_med_item.click
end
