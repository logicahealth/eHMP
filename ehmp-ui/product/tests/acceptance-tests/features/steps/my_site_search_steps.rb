Then(/^the staff view screen displays My Site in the sidebar tray$/) do
  staff_view = PobStaffView.new
  expect(staff_view.wait_for_closed_my_site).to eq(true), "Unselected My Site button is not visible"
  expect(staff_view.wait_for_btn_open_my_site).to eq(true)
  expect(staff_view.btn_open_my_site.text.upcase).to eq("MY SITE")
end

Then(/^the staff view screen displays My Site search input box$/) do
  staff_view = PobStaffView.new
  expect(staff_view.wait_for_fld_my_site_input).to eq(true), "My Site search input box is not visible"
end

When(/^the user opens the My Site tray$/) do
  staff_view = PobStaffView.new
  expect(staff_view.wait_for_closed_my_site).to eq(true), "Unselected My Site button is not visible"
  expect(staff_view.wait_for_btn_open_my_site).to eq(true), "Button to open My Site tray is not visible"
  staff_view.btn_open_my_site.click
  expect(staff_view.wait_for_open_my_site).to eq(true), "My Site tray did not open"
end

Then(/^the My Site tray displays instruction "([^"]*)"$/) do |instruction|
  my_site_tray = PobStaffView.new
  expect(my_site_tray.wait_for_fld_my_site_instructions).to eq(true), "Expected search instructions did not display"
  expect(my_site_tray.fld_my_site_instructions.text.upcase).to eq(instruction.upcase)
end

Then(/^the My Site tray displays a close x button$/) do
  my_site_tray = PobStaffView.new
  expect(my_site_tray.wait_for_btn_search_tray_close).to eq(true), "X (close) button in tray header did not display"
end

Then(/^the staff view My Site search input box placeholder text is "([^"]*)"$/) do |arg1|
  staff_view = PobStaffView.new
  expect(staff_view.wait_for_fld_my_site_input).to eq(true), "My Site search input box is not visible"
  expect(staff_view.fld_my_site_input[:placeholder].upcase).to eq('MY SITE PATIENT SEARCH (EX: S1234 OR SMITH, JOHN...)')
end

def search_with_button(search_term)
  staff_view = PobStaffView.new
  expect(staff_view.wait_for_fld_my_site_input).to eq(true), "My Site search input box is not visible"
  expect(staff_view.wait_for_btn_my_site_search).to eq(true), "My Site search button is not visible"
  staff_view.fld_my_site_input.set search_term
  staff_view.btn_my_site_search.click
end

def search_with_enter(search_term)
  my_site_tray = PobStaffView.new
  staff_view = PobStaffView.new
  expect(staff_view.wait_for_fld_my_site_input).to eq(true), "My Site search input box is not visible"

  staff_view.fld_my_site_input.set search_term
  staff_view.fld_my_site_input.native.send_keys(:enter)
end

When(/^the user searchs My Site with search term (.*)$/) do |search_term|
  # search_with_button search_term
  search_with_enter search_term
end

Then(/^the error message "([^"]*)" displays$/) do |message|
  staff_view = PobStaffView.new
  expect(staff_view.wait_for_fld_my_site_search_help).to eq(true), "Expected error message to display"
  wait_until { staff_view.fld_my_site_search_help.text.length > 0 }
  expect(staff_view.fld_my_site_search_help.text.upcase).to eq(message.upcase)
end

When(/^the user searches My Site by selecting button$/) do
  search_with_button "Eight,Patient"
end

When(/^the user searches My Site by keyboard ENTER$/) do
  search_with_enter "Eight,Patient"
end

Then(/^the My Site Tray displays$/) do
  my_site_tray = PobStaffView.new
  expect(my_site_tray.wait_for_open_my_site).to eq(true), "Expected My Site tray to display"
  expect(my_site_tray.wait_for_btn_search_tray_close).to eq(true), "Excpected My Site tray header to contain a close (x) button"
end

Then(/^the My Site Tray contains search results$/) do
  my_site_tray = PobStaffView.new
  begin
    wait_until { my_site_tray.my_site_search_results_dob.length > 0 }
  rescue Exception => e
    p "My Site Tray did not display any search results"
    raise e
  end
end

Then(/^the tray error message "([^"]*)" displays$/) do |message|
  my_site_tray = PobStaffView.new
  wait_until { my_site_tray.my_site_search_results_name.length > 0 }
  expect(my_site_tray.my_site_search_results_name.length).to eq(1), "Expected search results to contain a single row with an error message"
  max_attempt = DefaultTiming.default_wait_time
  begin
    expect(my_site_tray.my_site_search_results_name[0].text.upcase).to eq(message.upcase)
  rescue Exception => e
    max_attempt -= 1
    raise e if max_attempt <= 0
    sleep 1  
    retry if max_attempt > 0
  end
end

Then(/^the tray error message The number of rows returned exceeds the maximum allowable\. Be more specific in your search criteria displays$/) do
  my_site_tray = PobStaffView.new
  wait_until { my_site_tray.my_site_search_results_name.length > 0 }
  expect(my_site_tray.my_site_search_results_name.length).to eq(1), "Expected search results to contain a single row with an error message"
  max_attempt = DefaultTiming.default_wait_time
  begin
    expected_message = /The number of rows returned \(\d+\) exceeds the maximum allowable \(\d+\). Be more specific in your search criteria./
    actual_message = my_site_tray.my_site_search_results_name[0].text
    result = actual_message.match(expected_message)
    expect(result).to_not be_nil, "#{actual_message} did not match expected format"
  rescue Exception => e
    max_attempt -= 1
    raise e if max_attempt <= 0
    sleep 1  
    retry if max_attempt > 0
  end
end

Then(/^the My Site Tray table headers are$/) do |table|
  my_site_tray = PobStaffView.new
  my_site_tray.wait_for_my_site_search_results_headers
  num_headers = my_site_tray.my_site_search_results_headers.length
  expect(num_headers).to eq(table.rows.length), "Expected #{table.rows.length} table headers to be displayed on tray.  There are #{num_headers}"
  table.rows.each do | header |
    expect(object_exists_in_list(my_site_tray.my_site_search_results_headers, header[0])).to eq(true), "Expected header #{header[0]} to be displayed."
  end
end

Then(/^the My Site Tray patient name search results are in format Last Name, First Name \+ \(First Letter in Last Name \+ Last (\d+) SSN \)$/) do |arg1|
  my_site_tray = PobStaffView.new
  wait_until { my_site_tray.my_site_search_results_name.length > 0 }
  column1_visible_text = my_site_tray.patient_name_visible_text
  column1_visible_text.each do | name |
    result = name.match(/\w+, \w+ \(\w\d{4}\)/)
    expect(result).to_not be_nil, "#{name} did not match expected format"
  end
end

Then(/^the My Site Tray date of birth search results are in format Date \(Agey\)$/) do
  my_site_tray = PobStaffView.new
  wait_until { my_site_tray.my_site_search_results_dob.length > 0 }
  column1_visible_text = my_site_tray.patient_dob_visible_text  
  column1_visible_text.each do | name |
    result = name.match(/\d{2}\/\d{2}\/\d{4}  \(\d+y\)/)
    expect(result).to_not be_nil, "#{name} did not match expected format"
  end
end

Then(/^the My Site Tray results contain patient "([^"]*)" with DOB "([^"]*)" and gender "([^"]*)"$/) do |patient_name, dob, gender|

  my_site_tray = PobStaffView.new
  allowable_genders = my_site_tray.allowable_genders
  wait_until { my_site_tray.my_site_search_results_dob.length > 0 }
  column1_visible_text = my_site_tray.patient_name_visible_text
  found_patient_index = -1
  column1_visible_text.each_with_index do | name, index |
    p name.upcase.gsub(' ', '')
    p patient_name.upcase.gsub(' ', '')

    found_patient_index = index if name.upcase.gsub(' ', '').eql? patient_name.upcase.gsub(' ', '')
    break if found_patient_index > -1
  end
  expect(found_patient_index).to be > -1, "Did not find #{patient_name} in the search results"
  expect(my_site_tray.my_site_search_results_dob.length).to be > found_patient_index
  expect(my_site_tray.patient_dob_visible_text[found_patient_index].upcase.gsub(' ', '')).to eq(dob.upcase.gsub(' ', ''))
  expect(allowable_genders).to include my_site_tray.my_site_gender_text[found_patient_index].upcase
end

Then(/^the My Site search input box is cleared$/) do
  my_site_tray = PobStaffView.new
  expect(my_site_tray.wait_for_fld_my_site_input).to eq(true), "My Site search input box is not visible"
  expect(my_site_tray.fld_my_site_input.text).to eq('')
  expect(my_site_tray.fld_my_site_input.value).to eq('')
end

Then(/^the My Site search input box is populated with term (.*)$/) do |search_term|
  my_site_tray = PobStaffView.new
  expect(my_site_tray.wait_for_fld_my_site_input).to eq(true), "My Site search input box is not visible"
  expect(my_site_tray.fld_my_site_input.value.upcase).to eq(search_term.upcase)
end

Then(/^the My Site Tray gender search results are in terms Male, Female or Unknown$/) do
  my_site_tray = PobStaffView.new
  genders = my_site_tray.allowable_genders
  wait_until { my_site_tray.my_site_search_results_gender.length > 0 }
  column1_visible_text = my_site_tray.my_site_gender_text  
  column1_visible_text.each do | temp_gender |
    expect(genders).to include temp_gender
  end
end
