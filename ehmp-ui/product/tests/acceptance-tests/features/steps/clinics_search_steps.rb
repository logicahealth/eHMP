Then(/^the user opens clinic search tray$/) do
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_closed_clinics_search).to eq(true), "clinics sidebar is not selected"
  expect(clinic.wait_for_btn_open_clinics_search).to eq(true), "button to open clinics tray"
  clinic.btn_open_clinics_search.click
  expect(clinic.wait_for_open_clinics_search).to eq(true), "clinics search tray is open"
  clinic.wait_for_fld_disabled_clinics_location(15) # deliberately not verifying the outcome
  expect(clinic.wait_for_fld_clinics_location(60)).to eq(true), "enabled clinic location dropdown did not display"
  begin
    wait = Selenium::WebDriver::Wait.new(:timeout => 10)
    wait.until { clinic.fld_clinics_location_options.length > 0 }
  rescue
    expect(clinic.fld_clinics_location_options.length).to be > 0, "Expected more then 0 clinic location options"
  end  
end  

Then(/^clinics tray heading is clinics$/) do
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_hdr_heading_clinics_tray).to eq(true)
  expect(clinic.hdr_heading_clinics_tray.text.upcase).to have_text("clinics".upcase)
end

Then(/^the my site screen displays clinics in the sidebar tray$/) do
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_closed_clinics_search).to eq(true), "clinics tray is not selected"
  expect(clinic.wait_for_btn_open_clinics_search).to eq(true)
  expect(clinic.btn_open_clinics_search.text.upcase).to eq("CLINICS")
end

Then(/^the Clinic tray displays a close x button$/) do
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_btn_close_clinics_search_x).to eq(true), "X (close) button in tray header did not display"
end

Then(/^user selects x button to close the clinics tray$/) do
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_btn_close_clinics_search_x).to eq(true), "X (close) button in tray header did not display"
  clinic.btn_close_clinics_search_x.click
  expect(clinic.wait_for_closed_clinics_search).to eq(true), "clinic tray button is not indicating that the tray is closed"
  expect(clinic).to_not have_btn_close_clinics_search_x, "X (close) button is still visible"
end

Then(/^clinic location drop down field is displayed$/) do
  clinic = PobClinicsSearch.new
  clinic.wait_until_fld_clinics_location_visible
  expect(clinic.wait_for_fld_clinics_location).to eq(true)
end

Then(/^user selects "([^"]*)" from the drop down field$/) do |arg1|
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_btn_clinics_location).to eq(true)
  clinic.btn_clinics_location.click
  @ehmp = PobCommonElements.new
  expect(@ehmp.wait_for_fld_pick_list_input).to eq(true)
  @ehmp.fld_pick_list_input.set arg1
  @ehmp.fld_pick_list_input.native.send_keys(:enter)
  wait_until { clinic.clinics_search_results_loaded? }
end

Then(/^user selects minusThirtyDays from the predefined dates/) do 
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_btn_clinics_minusThirtyDays).to eq(true)
  clinic.btn_clinics_minusThirtyDays.click
  expect(clinic.wait_for_btn_clinics_minusThirtyDays_active).to eq(true)
end

Then(/^the clinics Tray contains search results$/) do
  clinic = PobClinicsSearch.new
  wait_until { clinic.clinics_search_results_loaded? }
  expect(clinic.tbl_clinics_search_resultes_rows.length > 0).to eq(true)
end

Then(/^the clinic location drop down displays error message "([^"]*)"$/) do |arg1|
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_ddl_clinics_location_results).to eq(true)
  expect(clinic.ddl_clinics_location_results.text.upcase).to eq(arg1.upcase)
end

Then(/^user enters "([^"]*)" in the drop down field$/) do |arg1|
  clinic = PobClinicsSearch.new
  clinic.wait_until_btn_clinics_location_visible
  expect(clinic.wait_for_btn_clinics_location).to eq(true), "dropdown button is prasent"
  clinic.btn_clinics_location.click
  @ehmp = PobCommonElements.new
  expect(@ehmp.wait_for_fld_pick_list_input).to eq(true)
  @ehmp.fld_pick_list_input.set arg1
end

Then(/^user selects minusSevenDays from the predefined dates$/) do
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_btn_clinics_minusSevenDays).to eq(true)
  clinic.btn_clinics_minusSevenDays.click
  expect(clinic.wait_for_btn_clinics_minusSevenDays_active).to eq(true)
end

Then(/^user selects minusOneDay from the predefined dates$/) do
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_btn_clinics_minusOneDay).to eq(true)
  clinic.btn_clinics_minusOneDay.click
  expect(clinic.wait_for_btn_clinics_minusOneDay_active).to eq(true)
end  

Then(/^user selects plusOneDay from the predefined dates$/) do
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_btn_clinics_plusOneDay).to eq(true)
  clinic.btn_clinics_plusOneDay.click
  expect(clinic.wait_for_btn_clinics_plusOneDay_active).to eq(true)
end  

Then(/^user selects plusSevenDays from the predefined dates$/) do
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_btn_clinics_plusSevenDay).to eq(true)
  clinic.btn_clinics_plusSevenDay.click
  expect(clinic.wait_for_btn_clinics_plusSevenDay_active).to eq(true)
end  

Then(/^make sure predefined date today is selected default$/) do
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_btn_clinics_today_active).to eq(true)
end

Then(/^user changes From date "([^"]*)" field$/) do |arg1|
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_fld_clinics_from_date).to eq(true)
  max_attempt = 3
  begin
    clinic.fld_clinics_from_date.click
    clinic.fld_clinics_from_date.native.send_keys [:end]
    clinic.fld_clinics_from_date.native.send_keys [:shift, :home], :backspace
    clinic.fld_clinics_from_date.native.send_keys arg1, :tab
    expect(clinic.fld_clinics_from_date.value).to eq(arg1)
  rescue Exception => e
    p "Attempt fromdate #{max_attempt}: #{e}"
    max_attempt -= 1
    raise e if max_attempt < 0
    retry
  end
end

Then(/^user changes to date "([^"]*)" field$/) do |arg1|
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_fld_clinics_to_date).to eq(true)
  max_attempt = 3
  begin
    clinic.fld_clinics_to_date.click
    clinic.fld_clinics_to_date.native.send_keys [:end]
    clinic.fld_clinics_to_date.native.send_keys [:shift, :home], :backspace 
    clinic.fld_clinics_to_date.native.send_keys arg1, :tab
    expect(clinic.fld_clinics_to_date.value).to eq(arg1)
  rescue Exception => e
    p "Attempt todate #{max_attempt}: #{e}"
    max_attempt -= 1
    raise e if max_attempt < 0
    retry
  end

end

Then(/^user selects apply button$/) do
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_btn_clinics_apply).to eq(true)
  clinic.btn_clinics_apply.click
end

When(/^the clinics tray displays a help button$/) do
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_btn_clinics_helpicon).to eq(true), "Help button in tray header did not display"
end

Then(/^the clinics Tray table headers are$/) do |table|
  clinic = PobClinicsSearch.new
  clinic.wait_until_fld_clinics_result_headers_visible
  table.rows.each do |headers|
    expect(object_exists_in_list(clinic.fld_clinics_result_headers, "#{headers[0]}")).to eq(true), "#{headers[0]} was not found"
  end
end

Then(/^the clinics Tray Appt Date Time search results are in format date HH:MM$/) do
  clinic = PobClinicsSearch.new
  wait_until { clinic.clinics_search_results_loaded? }
  clinic.wait_until_tbl_clinics_resultes_patientname_visible
  expect(clinic.tbl_clinics_resultes_patientname.length > 0).to eq(true)
  clinic.wait_until_tbl_clinics_resultes_AppDate_visible
  expect(clinic.tbl_clinics_resultes_AppDate.length > 0).to eq(true)
  names = clinic.tbl_clinics_resultes_AppDate
  names.each do | name |
    result = name.text.match(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)
    expect(result).to_not be_nil, "#{name.text} did not match expected format"
  end
end

Then(/^the clinics tray patient name search results are in format Last Name, First Name \+ \(First Letter in Last Name \+ Last (\d+) SSN \)$/) do |arg1|
  clinic = PobClinicsSearch.new
  wait_until { clinic.clinics_search_results_loaded? }
  clinic.wait_until_tbl_clinics_resultes_patientname_visible
  expect(clinic.tbl_clinics_resultes_patientname.length > 0).to eq(true)
  names = clinic.tbl_clinics_resultes_patientname
  names.each do | name_td |
    name = name_td.text
    result = name.match(/\w+, \w+ \(\w\d{4}\)/)
    if result.nil?
      result_sensitive = name.match(/\w+, \w+ \(\*SENSITIVE\*\)/)
      expect(result_sensitive).to_not be_nil, "#{name} did not match expected format"
    end
  end
end

Then(/^the Clinic Tray To Date input field is correctly set to current date$/) do
  date_format_template = "%m/%d/%Y"
  clinic = PobClinicsSearch.new
  expected_to_date = DateTime.now.strftime(date_format_template)
  actual_to_date = clinic.fld_clinics_to_date.value
  expect(expected_to_date).to eq(actual_to_date), "#{expected_to_date} was not found, found #{actual_to_date}"
end

Then(/^the "([^"]*)" input field is correctly set to "([^"]*)" days in the past$/)  do |_custom_field, days|
  date_format_template = "%m/%d/%Y"
  clinic = PobClinicsSearch.new
  expected_from_date = DateTime.now.prev_day(days.to_i).strftime(date_format_template)
  actual_from_date = clinic.fld_clinics_from_date.value
  expect(actual_from_date).to eq(expected_from_date)
end

Then(/^the from date input field is correctly set to current date$/) do
  date_format_template = "%m/%d/%Y"
  clinic = PobClinicsSearch.new
  expected_from_date = DateTime.now.strftime(date_format_template)
  actual_from_date = clinic.fld_clinics_from_date.value
  expect(expected_from_date).to eq(actual_from_date), "#{expected_from_date} was not found"
end

Then(/^the Clinic Tray To Date input field is correctly set to (\d+) days from current date$/) do |days|
  date_format_template = "%m/%d/%Y"
  clinic = PobClinicsSearch.new
  expected_to_date = DateTime.now.next_day(days.to_i).strftime(date_format_template)
  actual_to_date = clinic.fld_clinics_to_date.value
  expect(expected_to_date).to eq(actual_to_date)
end

Then(/^the clinic search results are within the last (\d+) days$/) do |days|
  date_format_template = "%m/%d/%Y"
  clinic = PobClinicsSearch.new
  wait_until { clinic.clinics_search_results_loaded? }
  unless clinic.has_tbl_clinics_error?
    expected_from_date = Date.today.prev_day(days.to_i)
    expected_to_date = Date.today

    actual = clinic.fld_clinics_date_resultes
    expect(actual.length).to be > 0
    actual.each do | day |
      regex = Regexp.new(/\d{2}\/\d{2}\/\d{4}/)
      text = day.text
      result = Date.strptime(regex.match(text)[0], date_format_template)
      p result.strftime(date_format_template)
      expect(expected_from_date).to be <= result
      expect(expected_to_date).to be >= result
    end
  end
end

Then(/^the clinic search results are within the next (\d+) days$/) do |days|
  date_format_template = "%m/%d/%Y"
  clinic = PobClinicsSearch.new
  expected_from_date = Date.today
  expected_to_date = Date.today.next_day(days.to_i)
  wait_until { clinic.clinics_search_results_loaded? }
  unless clinic.has_tbl_clinics_error?
    actual = clinic.fld_clinics_date_resultes
    expect(actual.length).to be > 0
    actual.each do | day |
      regex = Regexp.new(/\d{2}\/\d{2}\/\d{4}/)
      text = day.text
      result = Date.strptime(regex.match(text)[0], date_format_template)
      p result.strftime(date_format_template)
      expect(expected_from_date).to be <= result
      expect(expected_to_date).to be >= result
    end 
  end  
end

Then(/^search results displays "([^"]*)" error message$/) do |arg1|
  clinic = PobClinicsSearch.new
  clinic.wait_for_tbl_clinics_error
  expect(clinic.tbl_clinics_error.text.upcase).to eq(arg1.upcase)
end

When(/^at least (\d+) Predefined date filter is selected$/) do |num|
  clinic = PobClinicsSearch.new
  begin
    wait_until { clinic.btn_clinics_active.length >= num.to_i }
  rescue Exception => e
    expect(clinic.btn_clinics_active.length).to be > num.to_i
  end
end

Then(/^none of the Predefined dates filters are selected$/) do
  clinic = PobClinicsSearch.new
  begin
    wait_until { clinic.btn_clinics_active.length == 0 }
  rescue Exception => e
    expect(clinic.btn_clinics_active.length).to eq(0)
  end
end

Then(/^the clinic results displays appointment between "([^"]*)" and "([^"]*)"$/) do |arg1, arg2|
  date_format_template = "%m/%d/%Y"
  clinic = PobClinicsSearch.new
  expected_from_date = Date.strptime(arg1, date_format_template)
  expected_to_date = Date.strptime(arg2, date_format_template)
  clinic.wait_until_tbl_clinics_table_visible(120)
  wait_until { clinic.clinics_search_results_loaded? }
  unless clinic.has_tbl_clinics_error?
    actual = clinic.fld_clinics_date_resultes
    expect(actual.length).to be > 0
    actual.each do | day |
      regex = Regexp.new(/\d{2}\/\d{2}\/\d{4}/)
      text = day.text
      result =  Date.strptime(regex.match(text)[0], date_format_template)
      puts result
      expect(expected_from_date).to be <= result
      expect(expected_to_date).to be >= result
    end 
  end  
end

Then(/^user selects today from the predefined dates$/) do
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_btn_clinics_today).to eq(true), "Today button did not display"
  clinic.btn_clinics_today.click
  expect(clinic.wait_for_btn_clinics_today_active).to eq(true), "Today button is not active"
end

Then(/^the Clinic search results correctly set to current date$/) do
  date_format_template = "%m/%d/%Y"
  clinic = PobClinicsSearch.new
  expected_from_date = DateTime.now.strftime(date_format_template)
  expected_to_date = DateTime.now.strftime(date_format_template)
  expect(expected_from_date).to eq(expected_to_date)
  wait_until { clinic.clinics_search_results_loaded? }
  unless clinic.has_tbl_clinics_error?
    actual = clinic.fld_clinics_date_resultes
    expect(actual.length).to be > 0
    actual.each do | day |
      regex = Regexp.new(/\d{2}\/\d{2}\/\d{4}/)
      text = day.text
      result =  regex.match(text)[0]    
      p result
      expect(expected_from_date).to be == result
    end 
  end 

end

Then(/^from date error message is displayed currently with dates "([^"]*)" and "([^"]*)"$/) do |from_date, to_date|
  date_format_template = "%m/%d/%Y"
  clinic = PobClinicsSearch.new
  error = "DATE MUST BE BETWEEN #{from_date} - #{to_date}."
  expect(clinic.wait_for_hdr_error_from_date).to eq(true)
  expect(clinic.hdr_error_from_date.text.upcase).to eq(error.upcase)
end

Then(/^to date error message is displayed currently with dates "([^"]*)" and today \+ (\d+) years$/) do |from_date, years_from_now|
  date_format_template = "%m/%d/%Y"
  clinic = PobClinicsSearch.new
  expected_to_date = DateTime.now.next_year(years_from_now.to_i).strftime(date_format_template)
  error = "Date must be between #{from_date} - #{expected_to_date}."
  expect(clinic.wait_for_hdr_error_to_date).to eq(true)
  expect(clinic.hdr_error_to_date.text.upcase).to eq(error.upcase)
end

Then(/^clinic tray has "([^"]*)" "([^"]*)" and "([^"]*)"$/) do |arg1, arg2, arg3|
  clinic = PobClinicsSearch.new
  expect(clinic.wait_for_fld_clinics_location_label).to eq(true)
  expect(clinic.fld_clinics_location_label.text.upcase).to eq(arg1.upcase)
  expect(clinic.wait_for_fld_clinics_fromdate_label).to eq(true)
  expect(clinic.fld_clinics_fromdate_label.text.upcase).to eq(arg2.upcase)
  expect(clinic.wait_for_fld_clinics_todate_label).to eq(true)
  expect(clinic.fld_clinics_todate_label.text.upcase).to eq(arg3.upcase)
end

Then(/^the clinics Tray date of birth search results are in format Date \(Agey\)$/) do
  clinic = PobClinicsSearch.new
  dobs = clinic.tbl_clinics_resultes_text
  expect(dobs.length).to be > 0
  dobs.each do | dob |
    result = dob.match(/\d{2}\/\d{2}\/\d{4}  \(\d+y\)/)
    if result.nil?
      result_sensitive = dob.match(/\*SENSITIVE\*/)
      expect(result_sensitive).to_not be_nil, "#{dob} did not match expected format"
    end
  end
end

Then(/^the clinics Tray gender search results are in terms Male, Female or Unknown$/) do
  allowable_genders = PobStaffView.new.allowable_genders
  clinic = PobClinicsSearch.new
  genders = clinic.tbl_clinics_results_gender_text
  expect(genders.length).to be > 0
  genders.each do | temp_gender |
    expect(allowable_genders).to include temp_gender.upcase
  end
end

When(/^the user selects a clinics without patients$/) do
  clinic = PobClinicsSearch.new
  attempt_num_clinics = 531
  clinics_contains_no_resluts = false
  for i in 0..attempt_num_clinics
    expect(clinic.wait_for_btn_clinics_location).to eq(true)
    clinic.btn_clinics_location.click
    expect(clinic.wait_for_fld_clinics_location_options).to eq(true)
    wait_until { clinic.fld_clinics_location_options.length > 0 }
    num_clinics = clinic.fld_clinics_location_options
    break if num_clinics.length <= i
    p "attempt to click #{num_clinics[i].text}"
    num_clinics[i].click
    clinics_contains_no_resluts = clinic.wait_for_tbl_clinics_error
    break if clinics_contains_no_resluts
  end
  expect(clinics_contains_no_resluts).to eq(true), "Could not find a clinics without patients, searched #{attempt_num_clinics} clinics"
end
