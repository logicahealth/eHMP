Then(/^POB user adds a new allergy$/) do

  
  refresh_page = true
  begin
    @ehmp = PobAllergiesApplet.new
    expect(@ehmp.wait_for_btn_applet_add).to eq(true)
    @ehmp.btn_applet_add.click

    @ehmp.wait_until_fld_modal_title_visible
  rescue
    if refresh_page
      p 'refreshing the page'
      refresh_page = false
      PobCoverSheet.new.load
      step "Cover Sheet is active"
      retry
    else
      raise
    end
  end
end

Then(/^POB add allergy modal detail title says "(.*?)"$/) do |modal_title|
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_until_fld_modal_title_visible
  expect(@ehmp.fld_modal_title.text.upcase).to eq(modal_title.upcase)
end

Then(/^add allergy detail modal displays allergen search input drop down$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_fld_allergen_drop_down
  expect(@ehmp).to have_fld_allergen_drop_down
end

Then(/^add allergy detail modal displays historical check box$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_fld_historical_check_box
  expect(@ehmp).to have_fld_historical_check_box
end

Then(/^add allergy detail modal displays observed check box$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_fld_observed_check_box
  expect(@ehmp).to have_fld_observed_check_box
end

Then(/^add allergy detail modal displays reaction date input box$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_fld_reaction_date_input
  expect(@ehmp).to have_fld_reaction_date_input
end

Then(/^add allergy detail modal displays reaction time input box$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_fld_reaction_time_input
  expect(@ehmp).to have_fld_reaction_time_input
end

Then(/^add allergy detail modal displays severity drop down$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_fld_severity_drop_down
  expect(@ehmp).to have_fld_severity_drop_down
end

Then(/^add allergy detail modal displays nature of reaction drop down$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_fld_nature_of_reaction_drop_down
  expect(@ehmp).to have_fld_nature_of_reaction_drop_down
end

Then(/^add allergy detail modal displays available signs\/symptoms input box$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_fld_available_signs_input
  expect(@ehmp).to have_fld_available_signs_input
end

Then(/^add allergy detail modal displays comments input box$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_fld_comments_input
  expect(@ehmp).to have_fld_comments_input
end

Then(/^add allergy detail modal displays buttons "(.*?)" and "(.*?)"$/) do |add_btn, cancel_btn|
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_btn_add_allergy_cancel
  expect(@ehmp).to have_btn_add_allergy_cancel
  @ehmp.wait_for_btn_confirm_add_allergy
  expect(@ehmp).to have_btn_confirm_add_allergy
end

Then(/^POB user adds historical allergy "(.*?)"$/) do |allergen|
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_fld_historical_check_box
  @ehmp.fld_historical_check_box.click
  add_allergy(allergen, "historical")
end

Then(/^POB user adds observed allergy "(.*?)"$/) do |allergen|
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_fld_observed_check_box
  @ehmp.fld_historical_check_box.click
  add_allergy(allergen, "observed")
end

def add_allergy(allergen, type)
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_until_fld_allergen_drop_down_visible
  expect(@ehmp).to have_fld_allergen_drop_down
  @ehmp.fld_allergen_drop_down.click
  cc = PobCommonElements.new
  cc.wait_until_fld_pick_list_input_visible
  expect(cc).to have_fld_pick_list_input
  cc.fld_pick_list_input.set allergen
  cc.fld_pick_list_input.native.send_keys(:enter)

  expect(@ehmp.fld_allergen_drop_down).to have_text(allergen)
  @ehmp.wait_until_fld_nature_of_reaction_drop_down_visible
  @ehmp.fld_nature_of_reaction_drop_down.select "Allergy"
  
  if type == "observed"
    @ehmp.wait_until_fld_severity_drop_down_visible
    @ehmp.fld_severity_drop_down.select "Severe"
    @ehmp.wait_until_btn_anxiety_visible
    expect(@ehmp).to have_btn_anxiety
    @ehmp.btn_anxiety.click

    @ehmp = PobAllergiesApplet.new
    @ehmp.wait_for_fld_selected_second_symptom
    expect(@ehmp).to have_fld_selected_second_symptom

    rows = @ehmp.fld_selected_symptom
    expect(rows.length > 1).to eq(true), "this test needs at least 1 row, found only #{rows.length}"
  end
  
  @ehmp.wait_until_btn_confirm_add_allergy_visible
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  wait.until { @ehmp.btn_confirm_add_allergy.disabled? != true }  
  expect(@ehmp).to have_btn_confirm_add_allergy
  @ehmp.btn_confirm_add_allergy.click
  
  verify_and_close_growl_alert_pop_up("Allergy Submitted")
end

Then(/^the allergy detail modal displays expected elements$/) do
  @ehmp = AllergyWritebackModal.new
  @ehmp.wait_for_fld_allergen_label
  expect(@ehmp).to have_fld_allergen_label, "Did not have expected allergen label"

  expect(@ehmp).to have_fld_historical_label
  expect(@ehmp.fld_historical_label.text.upcase).to eq('HISTORICAL')
  expect(@ehmp).to have_rdb_historical_check_box

  expect(@ehmp).to have_fld_observed_label
  expect(@ehmp.fld_observed_label.text.upcase).to eq('OBSERVED')
  expect(@ehmp).to have_rdb_observed_check_box

  expect(@ehmp).to have_fld_reaction_date_label
  expect(@ehmp).to have_fld_reaction_date
  expect(@ehmp.fld_reaction_date.disabled?).to eq(true)

  expect(@ehmp).to have_fld_reaction_time_label
  expect(@ehmp).to have_fld_reaction_time
  expect(@ehmp.fld_reaction_time.disabled?).to eq(true)

  expect(@ehmp).to have_fld_severity_label
  expect(@ehmp).to have_fld_severity
  expect(@ehmp.fld_severity.disabled?).to eq(true)

  expect(@ehmp).to have_fld_nature_of_reaction_label
  expect(@ehmp).to have_fld_nature_of_reaction
  expect(@ehmp.fld_nature_of_reaction.disabled?).to eq(true)

  expect(@ehmp).to have_fld_sign_symptom_label
  expect(@ehmp).to have_fld_sign_symptom_filter
  expect(@ehmp.fld_sign_symtptom_options.length).to be > 0

  expect(@ehmp).to have_fld_comment_label
  expect(@ehmp).to have_fld_comment
end
