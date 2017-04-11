When(/^POB user selects and sets new encounter "(.*?)"$/) do |encounter_location|
  @ehmp = PobEncountersApplet.new
  @ehmp.wait_until_fld_visit_set_visible
  expect(@ehmp.fld_visit_set).to have_text("No visit set")
  @ehmp.wait_until_btn_set_encounter_visible
  expect(@ehmp).to have_btn_set_encounter
  @ehmp.btn_set_encounter.click
  @ehmp.wait_for_fld_tab_new_visit
  @ehmp.wait_until_fld_tab_new_visit_visible
  expect(@ehmp).to have_fld_tab_new_visit
  @ehmp.fld_tab_new_visit.click
  @ehmp.wait_until_fld_new_encounter_location_drop_down_visible
  expect(@ehmp).to have_fld_new_encounter_location_drop_down
  @ehmp.fld_new_encounter_location_drop_down.click
  @ehmp.wait_until_fld_encounter_location_search_box_visible
  @ehmp.fld_encounter_location_search_box.set encounter_location
  @ehmp.fld_encounter_location_search_box.native.send_keys(:enter)
  @ehmp.wait_until_btn_confirm_encounter_visible
  expect(@ehmp).to have_btn_confirm_encounter
  @ehmp.btn_confirm_encounter.click
  @ehmp.wait_until_fld_visit_set_visible
  expect(@ehmp.fld_visit_set).to have_text(encounter_location)
end
