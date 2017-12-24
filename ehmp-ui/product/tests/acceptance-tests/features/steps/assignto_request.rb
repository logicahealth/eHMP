When(/^the user views the Request \- New tray$/) do
  ehmp = PobCommonElements.new
  ehmp.wait_until_btn_action_tray_visible
  expect(ehmp).to have_btn_action_tray
  ehmp.btn_action_tray.click
  ehmp.wait_until_btn_add_new_action_visible
  expect(ehmp).to have_btn_add_new_action
  ehmp.btn_add_new_action.click
  ehmp = PobRequestApplet.new
  expect(ehmp.wait_for_btn_add_request).to eq(true)
  rows = ehmp.btn_add_request
  expect(rows.length >=1).to eq(true), "Expected to find 2 orders button, found only #{rows.length}"
  rows[0].click
end

Then(/^the default Assign To is Me$/) do 
  request = PobActionRequest.new
  expect(request.wait_for_btn_Action_me_radio).to eq(true)
  expect(request.lgo_Action_me_radio.text.upcase).to eq('ME')
  expect(request.btn_Action_me_radio.checked?).to eq(true)
end

Then(/^the new request Facility dropdown is not displayed$/) do
  request = PobActionRequest.new
  expect(request.wait_for_fld_Request_facility(3)).to eq(false)
end

Then(/^the new request Person dropdown is not displayed$/) do
  request = PobActionRequest.new
  expect(request.wait_for_fld_Request_control_person(3)).to eq(false)
end

Then(/^the new request Team dropdown is not displayed$/) do
  request = PobActionRequest.new
  expect(request.wait_for_fld_Request_control_team(3)).to eq(false)
end

Then(/^the new request Roles dropdown is not displayed$/) do
  request = PobActionRequest.new
  expect(request.wait_for_fld_Request_control_roles(3)).to eq(false)
end

When(/^the user selects Assign to Person$/) do
  request = PobActionRequest.new
  expect(request.wait_for_btn_Action_person_radio).to eq(true)
  expect(request.lgo_Action_person_radio.text.upcase).to eq('PERSON')
  request.btn_Action_person_radio.click
end

Then(/^the new request Facility dropdown is displayed$/) do
  request = PobActionRequest.new
  expect(request.wait_for_lgo_Request_facility).to eq(true)
  expect(request.lgo_Request_facility.text.upcase).to eq('FACILITY *')
end

Then(/^the new request Facility dropdown defaults to user's facility "([^"]*)"$/) do |arg1|
  request = PobActionRequest.new
  expect(request.wait_for_fld_Request_facility).to eq(true)
  expect(request.fld_Request_facility.text).to eq(arg1)
end

Then(/^the new request Person dropdown is displayed$/) do
  request = PobActionRequest.new
  expect(request.wait_for_lgo_Request_person).to eq(true)
  expect(request.lgo_Request_person.text.upcase).to eq('PERSON *')
end

When(/^the user selects Assign to My Teams$/) do
  request = PobActionRequest.new
  expect(request.wait_for_btn_Action_myteam_radio).to eq(true)
  expect(request.lgo_Action_myteam_radio.text.upcase).to eq('MY TEAMS')
  request.btn_Action_myteam_radio.click
end

Then(/^the new request Team dropdown is displayed$/) do
  request = PobActionRequest.new
  expect(request.wait_for_lgo_Request_myteam).to eq(true)
  expect(request.lgo_Request_myteam.text.upcase).to eq('TEAM *')
  expect(request.wait_for_ddl_Request_team).to eq(true)
  request.ddl_Request_team.click
end

Then(/^the new request Team picklist displays a section for My Teams Associated with Patient$/) do
  request = PobActionRequest.new
  request.wait_for_ddl_list_titles
  expect(request.ddl_list_titles.length).to be > 0, "Expected picklist to display titles, none displayed"
  titles = request.ddl_list_titles.map { |element| element.text.upcase }
  expect(titles).to include "MY TEAMS ASSOCIATED WITH PATIENT"
end

Then(/^the new request Team picklist displays a section for My Teams$/) do
  request = PobActionRequest.new

  request.wait_for_ddl_list_titles
  expect(request.ddl_list_titles.length).to be > 0, "Expected picklist to display titles, none displayed"
  titles = request.ddl_list_titles.map { |element| element.text.upcase }
  expect(titles).to include "MY TEAMS"
end

When(/^the user selects a new request Team$/) do
  request = PobActionRequest.new
  expect(request.wait_for_ddl_Request_team_1_select).to eq(true)
  request.ddl_Request_team_1_select.click
end

Then(/^the new request Roles dropdown is displayed$/) do
  request = PobActionRequest.new
  expect(request.wait_for_lgo_Request_roles).to eq(true)
  expect(request.lgo_Request_roles.text.upcase).to eq('ROLES *')
end

When(/^the user selects Assign to Patient's Team$/) do
  request = PobActionRequest.new
  expect(request.wait_for_btn_Action_patientteams_radio).to eq(true)
  expect(request.lgo_Action_patientteams_radio.text.upcase).to eq("PATIENT'S TEAMS")
  request.btn_Action_patientteams_radio.click
end

Then(/^the new request Team picklist displays a section for Teams Associated with Patient$/) do
  request = PobActionRequest.new
  request.wait_for_ddl_list_titles
  expect(request.ddl_list_titles.length).to be > 0, "Expected picklist to display titles, none displayed"
  titles = request.ddl_list_titles.map { |element| element.text.upcase }
  expect(titles).to include "TEAMS ASSOCIATED WITH PATIENT"
end

When(/^the user selects Assign to Any Team$/) do
  request = PobActionRequest.new
  expect(request.wait_for_btn_Action_anyteam_radio).to eq(true)
  expect(request.lgo_Action_anyteam_radio.text.upcase).to eq("ANY TEAM")
  request.btn_Action_anyteam_radio.click
end

Then(/^the new request Team picklist displays a section for All Teams$/) do
  request = PobActionRequest.new
  request.wait_for_ddl_list_titles
  expect(request.ddl_list_titles.length).to be > 0, "Expected picklist to display titles, none displayed"
  titles = request.ddl_list_titles.map { |element| element.text.upcase }
  expect(titles).to include "ALL TEAMS"
end

When(/^the user selects "([^"]*)" request Facility$/) do |option|
  request = PobActionRequest.new
  expect(request.wait_for_ddl_Request_facility).to eq(true)
  request.ddl_Request_facility.click
  request.facility_option(option)
  expect(request.wait_for_ddl_facility_option).to eq(true), "Option #{option} did not display"
  request.ddl_facility_option.click
end

Then(/^the dropdown error message "([^"]*)" is displayed$/) do |message|
  request = PobActionRequest.new
  expect(request.wait_for_lgo_error_tems).to eq(true)
  expect(request.lgo_error_tems.text.upcase).to eq(message.upcase)
end

