And(/^the user clicks on the "(.*?)" decrepancy button$/) do |partial_id|
  @ehmp = PobDemographicsElements.new
  @ehmp.load_decrepant_elements(partial_id)
  max_attempt = 1
  begin
    @ehmp.wait_until_fld_patient_info_title_visible
    @ehmp.wait_until_btn_decrepant_visible
    # Deliberately added sleep as wait_until didn't resolve element Presence
    sleep(1)
    expect(@ehmp).to have_btn_decrepant
    @ehmp.btn_decrepant.click
  rescue Exception => e
    max_attempt -= 1
    raise e if max_attempt < 0
    raise e if @ehmp.has_fld_patient_info_title?
    p "Tray was closed, reopen"
    DemographicsActions.open_patient_info_tray
    retry
  end
end

Then(/^the "(.*?)" decrepant information is displayed$/) do |partial_id|
  @ehmp = PobDemographicsElements.new
  @ehmp.load_decrepant_elements(partial_id)
  max_attempt = 1
  begin
    @ehmp.wait_for_fld_decrepant_info
    @ehmp.wait_until_fld_decrepant_info_visible
    expect(@ehmp).to have_fld_decrepant_info
  rescue Exception => e
    max_attempt -= 1
    raise e if max_attempt < 0
    raise e if @ehmp.has_fld_patient_info_title?
    p "Tray was closed, reopen"
    DemographicsActions.open_patient_info_tray
    retry
  end
end

Then(/^the "(.*?)" decrepant information is hidden$/) do |partial_id|
  @ehmp = PobDemographicsElements.new
  @ehmp.load_decrepant_elements(partial_id)
  max_attempt = 1
  begin
    @ehmp.wait_until_fld_decrepant_info_invisible
    expect(@ehmp).not_to have_fld_decrepant_info
  rescue Exception => e
    max_attempt -= 1
    raise e if max_attempt < 0
    raise e if @ehmp.has_fld_patient_info_title?
    p "Tray was closed, reopen"
    DemographicsActions.open_patient_info_tray
    retry
  end
end

And(/^the Discrepant Data indicator icon displays for "(.*?)"$/) do |partial_id|
  @ehmp = PobDemographicsElements.new
  @ehmp.load_decrepant_elements(partial_id)
  max_attempt = 1
  begin
    @ehmp.wait_for_btn_decrepant
    expect(@ehmp).to have_btn_decrepant
  rescue Exception => e
    max_attempt -= 1
    raise e if max_attempt < 0
    raise e if @ehmp.has_fld_patient_info_title?
    p "Tray was closed, reopen"
    DemographicsActions.open_patient_info_tray
    retry
  end
end

And(/^the Discrepant Data indicator icon does not displays for "(.*?)"$/) do |partial_id|
  @ehmp = PobDemographicsElements.new
  @ehmp.load_decrepant_elements(partial_id)
  max_attempt = 1
  begin
    expect(@ehmp.wait_for_fld_patient_info_title).to eq(true), "Expected patient information tray to be displayed"
    expect(@ehmp).to_not have_btn_decrepant
  rescue Exception => e
    max_attempt -= 1
    raise e if max_attempt < 0
    raise e if @ehmp.has_fld_patient_info_title?
    p "Tray was closed, reopen"
    DemographicsActions.open_patient_info_tray
    retry
  end
end
