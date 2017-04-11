Then(/^the staff view screen displays Wards in the sidebar tray$/) do
  staff_view = PobStaffView.new
  expect(staff_view.wait_for_closed_ward).to eq(true), "Unselected Ward button is not visible"
  expect(staff_view.wait_for_btn_open_ward).to eq(true)
  expect(staff_view.btn_open_ward.text.upcase).to eq("WARDS")
end

When(/^the user opens the Ward tray$/) do
  staff_view = PobStaffView.new
  expect(staff_view.wait_for_closed_ward).to eq(true), "Unselected Ward button is not visible"
  expect(staff_view.wait_for_btn_open_ward).to eq(true), "Button to open Ward tray is not visible"
  staff_view.btn_open_ward.click
  expect(staff_view.wait_for_open_ward).to eq(true), "Ward tray did not open"
end

Then(/^the Ward tray displays a close x button$/) do
  ward_tray = PobStaffView.new
  expect(ward_tray.wait_for_btn_search_tray_close).to eq(true), "X (close) button in tray header did not display"
end

Then(/^the Ward tray displays a help button$/) do
  ward_tray = PobStaffView.new
  expect(ward_tray.wait_for_btn_search_tray_help).to eq(true), "Help button in tray header did not display"
end

Then(/^the Ward tray displays a Ward Location selection box$/) do
  ward_tray = PobStaffView.new
  expect(ward_tray.wait_for_fld_ward_label).to eq(true), "Ward Location label did not display"
  expect(ward_tray.fld_ward_label.text.upcase).to eq("WARD LOCATION *")
  expect(ward_tray.wait_for_fld_ward_select).to eq(true), "Ward Location selection box did not display"
end

When(/^the user selects a ward with patients$/) do
  ward_tray = PobStaffView.new
  attempt_num_wards = 20
  ward_contains_no_patients = false
  for i in 0..attempt_num_wards
    ward_location_open
    num_wards = ward_tray.fld_ward_location_options
    break if num_wards.length <= i

    p "attempt to click #{num_wards[i].text}"
    @choosen_ward = num_wards[i].text.upcase
    num_wards[i].click
    wait_until { ward_tray.ward_search_results_loaded? }
    ward_tray.wait_for_fld_ward_dob_results
    break if ward_tray.fld_ward_dob_results.length > 0
  end
  expect(ward_tray.fld_ward_dob_results.length).to be > 0, "Could not find a ward with patients, searched #{attempt_num_wards} wards"
end

Then(/^the Ward Tray contains search results$/) do
  ward_tray = PobStaffView.new
  wait_until { ward_tray.ward_search_results_loaded? }
  expect(ward_tray.fld_ward_dob_results.length).to be > 0
end

Then(/^the Ward Tray table headers are$/) do |table|
  ward_tray = PobStaffView.new
  wait_until { ward_tray.fld_ward_result_headers.length > 0 }
  table.rows.each do | expected_header |
    expect(ward_tray.fld_ward_result_headers_text).to include expected_header[0].upcase
  end
end

Then(/^the Ward Tray patient name search results are in format Last Name, First Name \+ \(First Letter in Last Name \+ Last (\d+) SSN \)$/) do |arg1|
  ward_tray = PobStaffView.new
  names = ward_tray.fld_ward_result_name_text
  expect(names.length).to be > 0

  names.each do | name |
    result = name.match(/\w+, \w+ \(\w\d{4}\)/)
    expect(result).to_not be_nil, "#{name} did not match expected format"
  end
end

Then(/^the Ward Tray date of birth search results are in format Date \(Agey\) \- Gender \(first letter\)$/) do
  ward_tray = PobStaffView.new
  dobs = ward_tray.fld_ward_result_dob_text
  expect(dobs.length).to be > 0

  dobs.each do | dob |
    result = dob.match(/\d{2}\/\d{2}\/\d{4}  \(\d+y\)  - [MFU]/)
    expect(result).to_not be_nil, "#{dob} did not match expected format"
  end
end

Then(/^the Ward Tray Room\-Bed contains data$/) do
  ward_tray = PobStaffView.new
  rooms = ward_tray.fld_ward_result_dob_text
  expect(rooms.length).to be > 0
  found_at_least_one_room = false

  rooms.each do | room_bed |
    result = room_bed.length
    found_at_least_one_room = result > 0
    break if found_at_least_one_room
  end  
  expect(found_at_least_one_room).to eq(true), "Room-Bed column did not contain text with length longer then 0"
end

def ward_location_open
  ward_tray = PobStaffView.new
  expect(ward_tray.wait_for_ddl_ward_location).to eq(true)
  ward_tray.ddl_ward_location.click
  expect(ward_tray.wait_for_fld_ward_search_box).to eq(true)
  wait_until { ward_tray.fld_ward_location_options.length > 0 }
end

When(/^the user filters the Ward Location selection box with "([^"]*)"$/) do |filter_term|
  ward_tray = PobStaffView.new
  ward_location_open
  ward_tray.fld_ward_search_box.set filter_term
  # ward_tray.fld_ward_search_box.native.send_keys(:enter)
end

Then(/^the Ward filter reports "([^"]*)"$/) do |message|
  ward_tray = PobStaffView.new
  expect(ward_tray.wait_for_fld_ward_filter_no_results).to eq(true)
  expect(ward_tray.fld_ward_filter_no_results.text.upcase).to eq(message.upcase)
end

Then(/^the Ward list only diplays rows including text "([^"]*)"$/) do |search_text|
  ward_tray = PobStaffView.new
  max_attempt = 3
  begin
    ward_text_list = ward_tray.ward_location_list_text
    expect(ward_text_list.length).to be > 0
    ward_text_list.each do | ward_text |
      p "#{ward_text} #{search_text}"
      expect(ward_text).to include search_text.upcase
    end
  rescue Exception => e
    p "Error: #{e}"
    max_attempt-=1
    raise e if max_attempt <= 0
    sleep 1
    retry if max_attempt > 0
  end
end

When(/^the user selects a ward without patients$/) do
  ward_tray = PobStaffView.new
  attempt_num_wards = 100
  ward_contains_no_patients = false
  for i in 0..attempt_num_wards
    ward_location_open
    num_wards = ward_tray.fld_ward_location_options
    break if num_wards.length <= i

    p "attempt to click #{num_wards[i].text}"
    num_wards[i].click
    ward_contains_no_patients = ward_tray.wait_for_fld_ward_no_patients
    break if ward_contains_no_patients
  end
  expect(ward_contains_no_patients).to eq(true), "Could not find a ward without patients, searched #{attempt_num_wards} wards"
end

Then(/^the Ward Tray error message "([^"]*)" displays$/) do |message|
  ward_tray = PobStaffView.new
  expect(ward_tray.wait_for_fld_ward_no_patients).to eq(true)
  expect(ward_tray.fld_ward_no_patients.text.upcase).to eq(message.upcase)
end

Then(/^the Ward Tray no results message displays$/) do
  message = "No results found."
  ward_tray = PobStaffView.new
  expect(ward_tray.wait_for_fld_search_no_results).to eq(true)
  expect(ward_tray).to have_fld_search_no_results
  expect(ward_tray.fld_search_no_results.text.upcase).to eq(message.upcase)
end

When(/^user chooses to load a patient from the Ward results list$/) do
  patient_search = PatientSearch2.instance
  ward_tray = PobStaffView.new
  wait_until { ward_tray.ward_search_results_loaded? }
  expect(ward_tray.fld_ward_dob_results.length).to be > 0

  ward_tray.fld_ward_dob_results[0].click
  expect(patient_search.perform_action("Confirm")).to be_true
  expect(wait_until_dom_has_confirmflag_or_patientsearch(120)).to be_true, "Patient selection did not complete successfully"
end
