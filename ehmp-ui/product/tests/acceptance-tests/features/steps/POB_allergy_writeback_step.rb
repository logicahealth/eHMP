Then(/^POB user adds a new allergy$/) do
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_until_btn_add_allergy_visible
  @ehmp.btn_add_allergy.click
end

Then(/^POB add allergy modal detail title says "(.*?)"$/) do |modal_title|
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_until_fld_modal_title_visible
  expect(@ehmp.fld_modal_title).to have_text(modal_title)
end

Then(/^POB add allergy detail modal displays labels$/) do |table|
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_until_fld_modal_titles_visible
  table.rows.each do |heading|
    p heading[0]
    expect(object_exists_in_list(@ehmp.fld_modal_titles, "#{heading[0]}")).to eq(true)
  end
end

Then(/^POB add allergy detail modal displays Table rows$/) do |table|
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_fld_modal_table_rows
  table.rows.each do |heading|
    p heading[0]
    expect(object_exists_in_list(@ehmp.fld_modal_table_rows, "#{heading[0]}")).to eq(true)
  end
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
  add_allergy(allergen)
end

def add_allergy(allergen)
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_until_fld_allergen_drop_down_visible
  expect(@ehmp).to have_fld_allergen_drop_down
  @ehmp.fld_allergen_drop_down.click
  @ehmp.wait_until_fld_allergen_search_visible
  @ehmp.fld_allergen_search.set allergen
  @ehmp.fld_allergen_search.native.send_keys(:enter)
  @ehmp.wait_until_fld_allergen_select_visible
  expect(@ehmp).to have_fld_allergen_select
  @ehmp.fld_allergen_select.click
  expect(@ehmp.fld_allergen_drop_down).to have_text(allergen)
  @ehmp.wait_until_fld_nature_of_reaction_drop_down_visible
  @ehmp.fld_nature_of_reaction_drop_down "Allergy"
  @ehmp.wait_until_btn_confirm_add_allergy_visible
  expect(@ehmp).to have_btn_confirm_add_allergy
  @ehmp.btn_confirm_add_allergy.click
end

When(/^POB user expands the Allergies Applet$/) do
  pending # express the regexp above with the code you wish you had
end

Then(/^POB expanded Allergies Applet is displayed$/) do
  pending # express the regexp above with the code you wish you had
end

Then(/^POB Allergies Applet expand view contains data rows$/) do
  pending # express the regexp above with the code you wish you had
end

Then(/^POB user verifies the above "(.*?)" allergy is added to patient record$/) do |arg1|
  pending # express the regexp above with the code you wish you had
end

Then(/^POB user opens allergy row "(.*?)" and marks as "(.*?)"$/) do |arg1, arg2|
  pending # express the regexp above with the code you wish you had
end



