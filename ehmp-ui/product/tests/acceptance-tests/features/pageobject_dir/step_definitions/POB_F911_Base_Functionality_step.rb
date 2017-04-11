When(/^POB Cover Sheet is active$/) do
  @ehmp = PobOverView.new
  @ehmp.wait_for_fld_demo_patientInfo(60)
  @ehmp = PobCoverSheet.new
  @ehmp.load
  @ehmp.wait_for_all_applets_to_load_in_coversheet
  attempts = 2
  begin
    expect(@ehmp.fld_applet_items.length).to be > 8
  rescue
    puts "CoverSheet Page Loading failed! Retry Again...."
    sleep(2)
    @ehmp = PobCoverSheet.new
    @ehmp.load
    attempts -= 1
    retry if attempts > 0
  end
end

And(/^POB the "(.*?)" Coversheet applet is displayed$/) do |applet|
  @ehmp = PobCoverSheet.new
  expect(object_exists_in_list(@ehmp.fld_applet_items, applet)).to be true
end

And(/^POB the error "(.*?)" is not displayed in any Coversheet applets$/) do |text|
  @ehmp = PobCoverSheet.new
  expect(object_not_exists_in_list(@ehmp.fld_applet_items, text)).to be true
end

And(/^POB the "(.*?)" Overview applet is displayed$/) do |applet|
  @ehmp = PobOverView.new
  expect(object_exists_in_list(@ehmp.fld_all_applets, applet)).to be true
end

And(/^POB the error "(.*?)" is not displayed in any Overview applets$/) do |text|
  @ehmp = PobOverView.new
  expect(object_not_exists_in_list(@ehmp.fld_all_applets, text)).to be true
end

When(/^POB Overview is active$/) do
  @ehmp = PobOverView.new
  @ehmp.wait_for_fld_demo_patientInfo(60)
  @ehmp.wait_for_all_applets_to_load_in_overview
  attempts = 2
  begin
    expect(@ehmp.fld_all_applets.length).to be > 8
  rescue
    puts "Overview Page Loading failed! Retry Again...."
    sleep(2)
    @ehmp = PobOverView.new
    @ehmp.load
    attempts -= 1
    retry if attempts > 0
  end
end

When(/^POB user navigates to Documents Applet$/) do
  @ehmp = PobOverView.new
  @ehmp.wait_for_fld_demo_patientInfo
  @ehmp = PobDocumentsList.new
  @ehmp.load
  expect(@ehmp).to be_displayed
end

When(/^POB the Documents Expanded applet is displayed$/) do
  @ehmp = PobDocumentsList.new
  @ehmp.wait_for_fld_documents_heading
  expect(@ehmp).to have_fld_documents_heading
end

When(/^POB user navigates to Timeline Applet$/) do
  @ehmp = PobOverView.new
  @ehmp.wait_for_fld_demo_patientInfo
  @ehmp = PobTimeline.new
  @ehmp.load
  expect(@ehmp).to be_displayed
end

When(/^POB the Timeline Summary applet is displayed$/) do
  @ehmp = PobTimeline.new
  @ehmp.wait_for_fld_timeline_heading
  expect(@ehmp).to have_fld_timeline_heading
end

When(/^POB user searches for "(.*?)" in Overview$/) do |text|
  @ehmp = PobOverView.new
  @ehmp.wait_for_fld_search_box
  @ehmp.fld_search_box.set text
  expect(@ehmp).to have_btn_search_box
  @ehmp.btn_search_box.click
end

When(/^POB Text Search results are displayed$/) do
  @ehmp = PobSearchRecord.new
  @ehmp.wait_for_fld_result_message
  expect(@ehmp).to have_fld_result_message
end

When(/^POB user navigates to Meds Review Applet$/) do
  @ehmp = PobOverView.new
  @ehmp.wait_for_fld_demo_patientInfo
  @ehmp = PobMedsReview.new
  @ehmp.load
  expect(@ehmp).to be_displayed
end

When(/^POB the Med Review applet is displayed$/) do
  @ehmp = PobMedsReview.new
  @ehmp.wait_for_fld_med_review_header
  expect(@ehmp).to have_fld_med_review_header
end
