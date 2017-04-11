And(/^the user clicks on the "(.*?)" decrepancy button$/) do |partial_id|
  @ehmp = PobDemographicsElements.new
  @ehmp.wait_until_fld_patient_info_title_visible
  @ehmp.load_decrepant_elements(partial_id)
  @ehmp.wait_until_btn_decrepant_visible
  # Deliberately added sleep as wait_until didn't resolve element Presence
  sleep(1)
  expect(@ehmp).to have_btn_decrepant
  @ehmp.btn_decrepant.click
end

Then(/^the "(.*?)" decrepant information is displayed$/) do |partial_id|
  @ehmp = PobDemographicsElements.new
  @ehmp.load_decrepant_elements(partial_id)
  @ehmp.wait_for_fld_decrepant_info
  @ehmp.wait_until_fld_decrepant_info_visible
  expect(@ehmp).to have_fld_decrepant_info
end

Then(/^the "(.*?)" decrepant information is hidden$/) do |partial_id|
  @ehmp = PobDemographicsElements.new
  @ehmp.load_decrepant_elements(partial_id)
  @ehmp.wait_until_fld_decrepant_info_invisible
  expect(@ehmp).not_to have_fld_decrepant_info
end

And(/^the Discrepant Data indicator icon displays for "(.*?)"$/) do |partial_id|
  @ehmp = PobDemographicsElements.new
  @ehmp.load_decrepant_elements(partial_id)
  @ehmp.wait_until_btn_decrepant_visible
  expect(@ehmp).to have_btn_decrepant
end

And(/^the Discrepant Data indicator icon does not displays for "(.*?)"$/) do |partial_id|
  @ehmp = PobDemographicsElements.new
  @ehmp.load_decrepant_elements(partial_id)
  @ehmp.wait_until_fld_patient_info_title_visible
  expect(@ehmp).not_to have_btn_decrepant
end
