Then(/^problems gist is loaded successfully$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_applet_gist_loaded 
end

Then(/^problems summary view is loaded successfully$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_applet_loaded 
end

When(/^user opens the first problems gist item$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_fld_problems_gist_item_visible
  expect(@ehmp).to have_fld_problems_gist_item
  @ehmp.fld_problems_gist_item.click
  @ehmp.wait_until_btn_info_visible
end

Then(/^problems info button is displayed$/) do
  @ehmp = PobProblemsApplet.new
  expect(@ehmp).to have_btn_info
end

Then(/^user navigates to problems expanded view$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.load
#  expect(@ehmp).to be_displayed
  @ehmp.wait_until_applet_loaded 
  @ehmp.menu.wait_until_fld_screen_name_visible
  expect(@ehmp.menu.fld_screen_name.text.upcase).to have_text("Problems".upcase)
end

When(/^user opens the first problems row$/) do
  @ehmp = PobProblemsApplet.new
  @ehmp.wait_until_tbl_problems_visible
  rows = @ehmp.tbl_problems
  expect(rows.length >= 0).to eq(true), "this test needs at least 1 row, found only #{rows.length}"
  rows[0].click
end
