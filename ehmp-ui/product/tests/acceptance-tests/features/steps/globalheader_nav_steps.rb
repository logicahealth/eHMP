Then(/^the CCOW status icon is in the footer$/) do
  footer = PobHeaderFooter.new
  footer.wait_for_btn_icon_ccow_status
  expect(footer).to have_btn_icon_ccow_status
end

Then(/^CCOW status text is in the footer$/) do
  footer = PobHeaderFooter.new
  footer.wait_for_btn_ccow_status
  expect(footer).to have_btn_ccow_status
end

Then(/^the CCOW status text is "([^"]*)"$/) do |status|
  footer = PobHeaderFooter.new
  expect(footer.wait_for_btn_ccow_status).to eq(true), 'expected a ccow button'
  all_text = footer.btn_ccow_status.text.upcase
  sr_text = footer.btn_ccow_status_sr.text.upcase
  visible_text = all_text.sub(sr_text, '').strip
  expect(visible_text).to eq(status.upcase)
end

Then(/^the staff view screen displays Current Patient in the sidebar tray$/) do
  staff_view = PobStaffView.new
  expect(staff_view).to have_patient_search_tray
  expect(staff_view.patient_search_tray.wait_for_btn_current_patient).to eq(true), "Current Patient button is not visible"
  expect(staff_view.patient_search_tray.btn_current_patient.text.upcase).to eq("CURRENT PATIENT")
end

When(/^the user hovers over the Current Patient button$/) do
  staff_view = PobStaffView.new
  expect(staff_view).to have_patient_search_tray
  expect(staff_view.patient_search_tray.wait_for_btn_current_patient).to eq(true), "Current Patient button is not visible"
  tooltips = ToolTips.new
  num_visible_tooltips = tooltips.fld_tooltips.length
  staff_view.patient_search_tray.btn_current_patient.hover
  wait_until { tooltips.fld_tooltips.length > num_visible_tooltips }
end

Then(/^the tool tip displays "([^"]*)"$/) do |tooltip_text|
  tooltips = ToolTips.new
  expect(tooltips.fld_tooltips.last.text.upcase).to eq(tooltip_text.upcase)
end

When(/^the user selects the Current Patient button$/) do
  staff_view = PobStaffView.new
  expect(staff_view).to have_patient_search_tray
  expect(staff_view.patient_search_tray.wait_for_btn_current_patient).to eq(true), "Current Patient button is not visible"
  
  staff_view.patient_search_tray.btn_current_patient.click
end

Then(/^the patient selection confirmation modal is for patient "([^"]*)"$/) do |name|
  page = PobPatientSearch.new
  expect(page.wait_for_fld_confirm_header).to eq(true), "Expect confirm header to be visible"
  expect(page.fld_confirm_header.text.upcase).to eq(name.upcase)
end

Then(/^the staff view screen has Home icon$/) do
  home = PobHeaderFooter.new
  expect(home.wait_for_link_nav_home).to eq(true)
  expect(home.link_nav_home.text.upcase).to eq("HOME")
end  

When(/^user selects Home link$/) do
  home = PobHeaderFooter.new
  expect(home.wait_for_link_nav_home).to eq(true)
  home.link_nav_home.click
end  

Then(/^the Patients Search sidebar tray displays$/) do
  page = PobStaffView.new
  page.wait_for_patient_search_tray
  expect(page).to have_patient_search_tray
  page.patient_search_tray.wait_for_fld_my_site_input
  page.patient_search_tray.wait_for_btn_current_patient
  expect(page.patient_search_tray).to have_fld_my_site_input
  expect(page).to have_patient_search_tray

  expect(page.patient_search_tray).to have_btn_current_patient
  expect(page.patient_search_tray).to have_btn_closed_cprslist

  expect(page.patient_search_tray).to have_closed_ward
  expect(page.patient_search_tray).to have_closed_nationwide
end

Then(/^the Recent Patients tray is open$/) do
  page = PobStaffView.new
  page.wait_for_patient_search_tray
  expect(page).to have_patient_search_tray
  expect(page.patient_search_tray.wait_for_open_recentpatients).to eq(true), "recent patients tray did not open"
  expect(page.wait_for_btn_search_tray_close).to eq(true), "X (close) button in tray header did not display"
  wait_until { page.fld_search_result_headers.length > 0 }
end

Then(/^the patient button is active$/) do
  page = PobHeaderFooter.new
  expect(page.wait_for_btn_patients_active).to eq(true), "Patients button active"
end

