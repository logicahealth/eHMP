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
  @ehmp.wait_for_btn_info
  expect(@ehmp).to have_btn_info
end

Then(/^User clicks the Expand View in the Allergies Applet$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_btn_applet_expand_view
  expect(@ehmp).to have_btn_applet_expand_view, "User was not able to find <expand> button"
  @ehmp.btn_applet_expand_view.click
  @ehmp.wait_for_btn_applet_minimize
  expect(@ehmp).to have_btn_applet_minimize
end

Then(/^the expanded Allergies Applet title is "(.*?)"$/) do |title|
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_btn_applet_minimize
  expect(@ehmp).to have_fld_expanded_applet_title
  expect(@ehmp.fld_expanded_applet_title.text).to include(title), "Applet title shows #{@ehmp.fld_expanded_applet_title.text} instead #{title}"
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

Given(/^user can view the Quick Menu Icon in allergies applet$/) do
  ehmp = PobAllergiesApplet.new
  QuickMenuActions.verify_quick_menu ehmp
end

Given(/^Quick Menu Icon is collapsed in allergies applet$/) do
  ehmp = PobAllergiesApplet.new
  QuickMenuActions.verify_quick_menu_collapsed ehmp
end

When(/^Quick Menu Icon is selected in allergies applet$/) do
  ehmp = PobAllergiesApplet.new
  QuickMenuActions.select_quick_menu ehmp
end

Then(/^user can see the options in the allergies applet$/) do |table|
  ehmp = PobAllergiesApplet.new
  QuickMenuActions.verify_menu_options ehmp, table
end

Then(/^user scrolls the allergies applet into view$/) do 
  ehmp = PobAllergiesApplet.new
  ehmp.scroll_into_view
end

When(/^user hovers over the allergy pill$/) do
  ehmp = PobAllergiesApplet.new
  ehmp.wait_for_fld_allergy_gist_pills
  expect(ehmp).to have_fld_allergy_gist_pills
  rows = ehmp.fld_allergy_gist_pills
  expect(rows.length).to be > 0
  rows[0].hover
end

When(/^user hovers over the allergy row$/) do
  ehmp = PobAllergiesApplet.new
  ehmp.wait_for_expanded_rows
  expect(ehmp).to have_expanded_rows
  rows = ehmp.expanded_rows
  expect(rows.length).to be > 0
  rows[0].hover
end

When(/^user selects the detail view from Quick Menu Icon of allergies applet$/) do
  ehmp = PobAllergiesApplet.new
  QuickMenuActions.open_menu_click_detail_button ehmp
end

