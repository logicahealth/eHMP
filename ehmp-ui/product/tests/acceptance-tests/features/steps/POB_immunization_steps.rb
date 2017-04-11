Then(/^immunization gist is loaded successfully$/) do
  @ehmp = PobImmunizationsApplet.new
  @ehmp.wait_until_applet_gist_loaded 
end

When(/^user opens the first immunization gist item$/) do
  @ehmp = PobImmunizationsApplet.new
  @ehmp.wait_until_fld_immunization_gist_item_visible
  expect(@ehmp).to have_fld_immunization_gist_item
  @ehmp.fld_immunization_gist_item.click
end

Then(/^immunization info button is displayed$/) do
  @ehmp = PobImmunizationsApplet.new
  @ehmp.wait_for_btn_info
  expect(@ehmp).to have_btn_info
end

Then(/^user navigates to immunization expanded view$/) do
  @ehmp = PobImmunizationsApplet.new
  @ehmp.load_and_wait_for_screenname
  @ehmp.wait_until_applet_loaded 
  
  expect(@ehmp.menu.fld_screen_name.text.upcase).to have_text("Immunization".upcase)
end

When(/^user opens the first immunization row$/) do
  @ehmp = PobImmunizationsApplet.new
  @ehmp.wait_until_tbl_immunization_grid_visible
  rows = @ehmp.tbl_immunization_grid
  expect(rows.length >= 0).to eq(true), "this test needs at least 1 row, found only #{rows.length}"
  rows[0].click
end

When(/^user opens the newly added immunization pill$/) do
  @ehmp = PobImmunizationsApplet.new
  @ehmp.wait_until_btn_new_immunization_pill_visible
  expect(@ehmp).to have_btn_new_immunization_pill
  @ehmp.btn_new_immunization_pill.click
end

Given(/^POB user adds a new immunization$/) do
  @ehmp = PobImmunizationsApplet.new
  @ehmp.wait_until_btn_applet_add_visible
  expect(@ehmp).to have_btn_applet_add
  @ehmp.btn_applet_add.click
   
  max_attempt = 2
  begin
    PobCommonElements.new.wait_until_fld_modal_body_visible 
  rescue Exception => e
    max_attempt-=1
    raise e if max_attempt <= 0
    p "*** Going to retry Adding Immunization ***"
    retry if max_attempt > 0
  end
end

When(/^POB user adds administered immunization "([^"]*)"$/) do |immunization_type|
  @ehmp = PobImmunizationsApplet.new
  cmele = PobCommonElements.new
  
  @ehmp.wait_until_chk_administered_visible
  expect(@ehmp).to have_chk_administered
  @ehmp.chk_administered.click
  
  @ehmp.wait_until_ddl_immunization_type_visible
  expect(@ehmp).to have_ddl_immunization_type
  @ehmp.ddl_immunization_type.click
   
  cmele.wait_until_fld_pick_list_input_visible
  expect(cmele).to have_fld_pick_list_input
  cmele.fld_pick_list_input.set immunization_type
  @ehmp.wait_until_fld_immunization_results_visible
  cmele.fld_pick_list_input.native.send_keys(:enter)
  
  @ehmp.wait_until_ddl_ordered_by_visible
  expect(@ehmp).to have_ddl_ordered_by
  @ehmp.ddl_ordered_by.click
  
  cmele.wait_until_fld_pick_list_input_visible
  expect(cmele).to have_fld_pick_list_input
  cmele.fld_pick_list_input.set "User,Panorama"
  cmele.fld_pick_list_input.native.send_keys(:enter)
 
  @ehmp.wait_until_ddl_lot_number_visible
  @ehmp.ddl_lot_number.select "EHMP00012"
  
  @ehmp.wait_until_ddl_route_of_administration_visible
  @ehmp.ddl_route_of_administration.select "INTRAMUSCULAR"
  
  @ehmp.wait_until_ddl_anatomic_location_visible
  @ehmp.ddl_anatomic_location.select "LEFT UPPER ARM"
  
  @ehmp.wait_until_fld_dosage_input_visible
  @ehmp.fld_dosage_input.set "50"
  @ehmp.fld_dosage_input.native.send_keys(:enter)
  
  @ehmp.wait_until_ddl_series_visible
  @ehmp.ddl_series.select "Complete"
  
  TestSupport.driver.find_element(:css, "#visDateOffered").location_once_scrolled_into_view
  @ehmp.wait_for_fld_vis_date_input
  @ehmp.fld_vis_date_input.set Time.new.strftime("%m/%d/%Y")
  @ehmp.fld_vis_date_input.native.send_keys(:enter)
  
  TestSupport.driver.find_element(:css, "#comments").location_once_scrolled_into_view
  @ehmp.wait_for_fld_comments
  @ehmp.fld_comments.set "Immunization added by automation test"
  @ehmp.fld_comments.native.send_keys(:enter)
  @ehmp.fld_comments.native.send_keys(:tab)
  
  @ehmp.wait_for_chk_information_stmt1
  expect(@ehmp).to have_chk_information_stmt1
  @ehmp.chk_information_stmt1.click
  
  @ehmp.wait_for_chk_information_stmt2
  expect(@ehmp).to have_chk_information_stmt2
  @ehmp.chk_information_stmt2.click
  
  TestSupport.driver.find_element(:css, ".addBtn").location_once_scrolled_into_view
  @ehmp.wait_for_btn_addBtn
  expect(@ehmp).to have_btn_addBtn
  @ehmp.btn_addBtn.click
  
  verify_and_close_growl_alert_pop_up("Immunization Submitted")
  
  PobImmunizationsApplet.new.wait_until_btn_addBtn_invisible(30)
end

When(/^POB user adds historical immunization "([^"]*)"$/) do |immunization_type|
  @ehmp = PobImmunizationsApplet.new
  cmele = PobCommonElements.new
  
  @ehmp.wait_until_chk_historical_visible
  expect(@ehmp).to have_chk_historical
  @ehmp.chk_historical.click
  
  @ehmp.wait_until_ddl_immunization_type_visible
  expect(@ehmp).to have_ddl_immunization_type
  @ehmp.ddl_immunization_type.click
  
  cmele.wait_until_fld_pick_list_input_visible
  expect(cmele).to have_fld_pick_list_input
  cmele.fld_pick_list_input.set immunization_type
  @ehmp.wait_until_fld_immunization_results_visible
  cmele.fld_pick_list_input.native.send_keys(:return)
  
  @ehmp.wait_until_fld_administered_date_input_visible
  @ehmp.fld_administered_date_input.set Time.new.strftime("%m/%d/%Y")
  @ehmp.fld_administered_date_input.native.send_keys(:enter)
  
  TestSupport.driver.find_element(:css, "#comments").location_once_scrolled_into_view
  @ehmp.wait_for_fld_comments
  @ehmp.fld_comments.set "Immunization added by automation test"
  @ehmp.fld_comments.native.send_keys(:enter)
  
  @ehmp.wait_until_ddl_information_source_visible
  @ehmp.ddl_information_source.select "From Birth Certificate"
  
  TestSupport.driver.find_element(:css, ".addBtn").location_once_scrolled_into_view
  @ehmp.wait_for_btn_addBtn
  expect(@ehmp).to have_btn_addBtn
  @ehmp.btn_addBtn.click
  
  verify_and_close_growl_alert_pop_up("Immunization Submitted")
  
  PobImmunizationsApplet.new.wait_until_btn_addBtn_invisible(30)
end

Then(/^POB new immunization "([^"]*)" is added to the immunization applet$/) do | immunization_type |
  PobOverView.new.wait_for_all_applets_to_load_in_overview
  @ehmp = PobImmunizationsApplet.new
  @ehmp.add_immunization_data_info_btn(immunization_type)
  @ehmp.wait_until_btn_new_immunization_pill_visible
  expect(@ehmp).to have_btn_new_immunization_pill
end

Then(/^POB user verifies the immunization detail modal fields$/) do |table|
  @ehmp = PobImmunizationsApplet.new
  @ehmp.wait_for_btn_detail_view
  expect(@ehmp).to have_btn_detail_view
  @ehmp.btn_detail_view.click
  @ehmp.wait_until_tbl_modal_body_immunization_table_visible
  @ehmp = PobCommonElements.new
  @ehmp.wait_until_fld_modal_body_visible(30)
  table.rows.each do | field, value|
    expect(@ehmp.fld_modal_body.text.include? "#{field}").to eq(true), "the field #{field} is not present"
    expect(@ehmp.fld_modal_body.text.include? "#{value}").to eq(true), "the value #{value} is not present"
  end
end
  
Then(/^POB new immunization "([^"]*)" is added to the note objects$/) do |immunization_type|
  @ehmp = PobNotes.new
  @ehmp.btn_view_note_object
  @ehmp.wait_until_fld_note_objects_visible
  @ehmp.wait_until_btn_view_note_object_visible
  p @ehmp.fld_note_objects.text
  expect(@ehmp.fld_note_objects.text.downcase.include? "#{immunization_type}".downcase.strip).to eq(true), "the value '#{immunization_type}' is not present"
end
