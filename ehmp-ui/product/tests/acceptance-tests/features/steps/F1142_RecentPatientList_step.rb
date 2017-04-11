

When(/^user selects the recent patient dropdown$/) do
  @ehmp = PobHeaderFooter.new
  expect(@ehmp.wait_for_btn_recent_patient). to eq(true), "Recent patient button is not visible"
  expect(@ehmp).to have_btn_recent_patient
  @ehmp.btn_recent_patient.click
end

Then(/^recent patient list is displayed$/) do
  @ehmp = PobHeaderFooter.new
  max_attempt = 4
  begin
    expect(@ehmp.wait_for_fld_recent_patient_header). to eq(true), "Recent patient header is not visible"
    expect(@ehmp).to have_fld_recent_patient_header
    expect(@ehmp.fld_recent_patient_header.text.upcase).to eq("RECENT PATIENTS")
    expect(@ehmp.wait_for_fld_recent_patient_list).to eq(true)
    expect(@ehmp).to have_fld_recent_patient_list
    rows = @ehmp.fld_recent_patient_list
    expect(rows.length).to be > 0
  rescue Exception => e
    p "*** entered rescue block ***"
    p "#{e}"
    sleep(1)
    max_attempt-=1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
end

Given(/^the user opens the recent patient dropdown$/) do
  @ehmp = PobHeaderFooter.new
  expect(@ehmp.wait_for_btn_recent_patient). to eq(true), "Recent patient button is not visible"
  expect(@ehmp).to have_btn_recent_patient
  max_attempt = 4
  begin
    @ehmp.btn_recent_patient.click
    expect(@ehmp.wait_for_fld_recent_patient_header). to eq(true), "Recent patient header is not visible"
    expect(@ehmp).to have_fld_recent_patient_header
    expect(@ehmp.fld_recent_patient_header.text.upcase).to eq("RECENT PATIENTS")
    #@ehmp.wait_until_fld_recent_patient_list_visible(30)
    expect(@ehmp.wait_for_fld_recent_patient_list).to eq(true)
    expect(@ehmp).to have_fld_recent_patient_list
    rows = @ehmp.fld_recent_patient_list
    expect(rows.length).to be > 0
  rescue Exception => e
    p "*** entered rescue block ***"
    p "#{e}"
    max_attempt-=1
    raise e if max_attempt <= 0
    step 'the user closes the recent patient dropdown'
    retry if max_attempt > 0
  end
end

Then(/^the first record in the list is "(.*?)"$/) do |most_recent_patient|
  @ehmp = PobHeaderFooter.new
  @ehmp.wait_until_fld_recent_patient_list_visible
  rows = @ehmp.fld_recent_patient_list
  expect(rows[0].text.upcase).to have_text(most_recent_patient.upcase), "Expected #{rows[0].text} to have #{most_recent_patient}"
end

Then(/^user navigates to the staff view screen$/) do
  @ehmp = PobStaffView.new
  @ehmp.wait_until_fld_staff_view_visible
  expect(@ehmp).to have_fld_staff_view
  @ehmp.fld_staff_view.click
  @ehmp.wait_until_fld_active_staff_view_visible
  expect(@ehmp).to have_fld_active_staff_view
end

Given(/^the user closes the recent patient dropdown$/) do
  @ehmp = PobHeaderFooter.new
  expect(@ehmp.wait_for_btn_recent_patient). to eq(true), "Recent patient button is not visible"
  expect(@ehmp).to have_btn_recent_patient
  @ehmp.btn_recent_patient.click
  begin
    @ehmp.wait_until_fld_recent_patient_header_invisible
  rescue Exception => e
    p "Error waiting for invisiblity #{e}"
  end
  expect(@ehmp).to_not have_fld_recent_patient_header
end
