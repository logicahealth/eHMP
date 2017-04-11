Then(/^allergy gist is loaded successfully$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_until_applet_gist_loaded 
end

When(/^user opens the first allergy pill$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_until_fld_allergy_gist_pills_visible
  rows = @ehmp.fld_allergy_gist_pills
  expect(rows.length >= 0).to eq(true), "this test needs at least 1 row, found only #{rows.length}"
  rows[0].click
end

Then(/^allergies info button is displayed$/) do
  @ehmp = PobAllergiesApplet.new
  expect(@ehmp).to have_btn_info
end

Then(/^user navigates to allergies expanded view$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.load_and_wait_for_screenname
  @ehmp.wait_until_applet_loaded 
  @ehmp.menu.wait_until_fld_screen_name_visible
  expect(@ehmp.menu.fld_screen_name.text.upcase).to have_text("Allergies".upcase)
end

When(/^user opens the first allergy row$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_until_tbl_allergy_grid_visible
  rows = @ehmp.tbl_allergy_grid
  expect(rows.length >= 0).to eq(true), "this test needs at least 1 row, found only #{rows.length}"
  rows[0].click
end
