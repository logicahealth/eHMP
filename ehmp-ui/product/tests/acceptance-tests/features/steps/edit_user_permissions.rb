Then(/^the Select Permissions Window displays$/) do
  modal = SelectPermissionsWindow.new
  expect(modal.wait_for_noncommon_title).to eq(true), "Expected a new modal to display"
  modal.wait_for_available_sets_names(20)
  expect(modal.available_sets_rows.length).to be > 0, "Expected a list of available permission sets"
end

Then(/^the Select Permissions Window displays an Available Permission Sets section$/) do
  modal = SelectPermissionsWindow.new
  expect(modal.wait_for_available_sets_label).to eq(true), "Expected an Available Permission Sets Label"
  expect(modal.available_sets_label.text.upcase).to eq("Available Permission Sets".upcase)
  expect(modal.wait_for_available_sets_filter).to eq(true), "Expected a filter input"
  modal.wait_for_available_sets_names(20)
  expect(modal.available_sets_rows.length).to be > 0, "Expected a list of available permission sets"
  expect(modal.available_sets_names.length).to be > 0, "Expected a column of available permission set names"
  expect(modal.available_sets_details.length).to be > 0, "Expected a column of available permission set detail buttons"
  expect(modal.available_sets_actions.length).to be > 0, "Expected a column of available permission set Add/Remove links"

end

Then(/^the Select Permissions Window displays a Selected Permission Sets section$/) do
  modal = SelectPermissionsWindow.new
  expect(modal.wait_for_selected_sets_label).to eq(true), "Expected an Selected Permission Sets Label"
  expect(modal.selected_sets_label.text.upcase).to eq("Selected Permission Sets".upcase)

  expect(modal.selected_sets_rows.length).to be > 0, "Expected a list of selected permission sets"
  expect(modal.selected_sets_names.length).to be > 0, "Expected a column of selected permission set names"
  expect(modal.selected_sets_details.length).to be > 0, "Expected a column of selected permission set detail buttons"
  expect(modal.selected_sets_actions.length).to be > 0, "Expected a column of selected permission set Add/Remove links"
  expect(modal.wait_for_total_selected_sets).to eq(true), "Expected Total Selected display"
  expect(modal.total_selected_sets.text.upcase).to match(/TOTAL SELECTED: \d+/)
end

Then(/^the Select Permissions Window displays an Available Additional Individual Permissions section$/) do
  modal = SelectPermissionsWindow.new
  expect(modal.wait_for_available_indperm_label).to eq(true), "Expected an Available Additional Individual Permissions Label"
  expect(modal.available_indperm_label.text.upcase).to eq("AVAILABLE ADDITIONAL INDIVIDUAL PERMISSIONS".upcase)
  expect(modal.wait_for_available_indperm_filter).to eq(true), "Expected a filter input"
  expect(modal.available_indperm_rows.length).to be > 0, "Expected a list of available individual permission"
  expect(modal.available_indperm_names.length).to be > 0, "Expected a column of available individual permission names"
  expect(modal.available_indperm_details.length).to be > 0, "Expected a column of available individual permission detail buttons"
  expect(modal.available_indperm_actions.length).to be > 0, "Expected a column of available individual permission Add/Remove links"

end

Then(/^the Select Permissions Window displays a Selected Additional Individual Permissions section$/) do
  modal = SelectPermissionsWindow.new
  expect(modal.wait_for_selected_indperm_label).to eq(true), "Expected an Selected Permission Sets Label"
  expect(modal.selected_indperm_label.text.upcase).to eq("Selected ADDITIONAL individual Permissions".upcase)

  if modal.selected_indperm_rows.length > 0
    expect(modal.selected_indperm_names.length).to be > 0, "Expected a column of selected individual permission names"
    expect(modal.selected_indperm_details.length).to be > 0, "Expected a column of selected individual permission detail buttons"
    expect(modal.selected_indperm_actions.length).to be > 0, "Expected a column of selected individual permission Add/Remove links"
  else
    expect(modal).to have_selected_inderm_empty_message
  end
  expect(modal.wait_for_total_selected_indperm).to eq(true), "Expected Total Selected display"
  expect(modal.total_selected_indperm.text.upcase).to match(/TOTAL SELECTED: \d+/)
end

Then(/^the Select Permissions Window displays a Cancel and a Save button$/) do
  modal = SelectPermissionsWindow.new
  expect(modal.wait_for_btn_cancel).to eq(true), "Expected a Cancel button"
  expect(modal.wait_for_btn_save).to eq(true), "Expected a Save button"
end

Then(/^the permission set is added to the selected permission set list$/) do
  modal = SelectPermissionsWindow.new
  new_total = @total_selected_sets + 1
  selected_names = modal.selected_sets_names.map { |element| element.text }
  temp_btn = modal.available_sets_actions[@available_index]

  expect(temp_btn['class']).to include 'checked-true'  
  expect(modal.selected_sets_rows.length).to eq(new_total)
  expect(selected_names).to include @test_permission_set_name
  expect(modal.total_selected_sets.text.upcase).to eq("TOTAL SELECTED: #{new_total}")

  # permission set action text is now Remove
  modal.define_add_remove_role_buttons @test_permission_set_name
  expect(modal.wait_for_btn_remove_role).to eq(true), "Expected selected list to display Remove link"
  expect(modal.btn_remove_role.text.upcase).to eq("REMOVE")
  expect(modal.wait_for_btn_remove_role_available).to eq(true), "Expected available list to display Remove link"
  expect(modal.btn_remove_role_available.text.upcase).to eq('REMOVE')
end

Given(/^there is at least (\d+) selected permission set$/) do |arg1|
  modal = SelectPermissionsWindow.new
  modal.wait_for_available_sets_names(20)
  expect(modal.selected_sets_rows.length).to be > 0, "Expected Selected Permission Sets to have at least 1 row"
  expect(modal.selected_sets_actions.length).to be > 0, "Expected Selected Permission Sets to have at least 1 row that can be removed"
end

Then(/^the permission set is removed from the select permission set list$/) do
  modal = SelectPermissionsWindow.new
  new_total = @total_selected_sets - 1
  selected_names = modal.selected_sets_names.map { |element| element.text }

  expect(modal.selected_sets_rows.length).to eq(new_total)
  expect(selected_names).to_not include @test_permission_set_name
  expect(modal.total_selected_sets.text.upcase).to eq("TOTAL SELECTED: #{new_total}")

  # permission set action text is now Add
  modal.define_add_remove_role_buttons @test_permission_set_name
  expect(modal.wait_for_btn_add_role).to eq(true), "Expected available list to display Add link"
  expect(modal.btn_add_role.text.upcase).to eq('ADD')
end

When(/^the authorized user filters the available permission sets by term "([^"]*)"$/) do |arg1|
  modal = SelectPermissionsWindow.new
  expect(modal.wait_for_available_sets_filter).to eq(true)
  modal.wait_for_available_sets_names(20)
  expect(modal.available_sets_names.length).to be > 0
  num_names = modal.available_sets_names.length

  modal.available_sets_filter.set arg1
  wait_until { modal.available_sets_names.length != num_names }
end

Then(/^the Available Permission Sets all include term "([^"]*)"$/) do |arg1|
  modal = SelectPermissionsWindow.new
  expect(modal.available_sets_names.length).to be > 0, "Check that #{arg1} is a valid filter term"
  selected_names = modal.available_sets_names.map { |element| element.text }
  selected_names.each do | permission_set |
    expect(permission_set.upcase.include? arg1.upcase).to eq(true), "#{permission_set}"
  end
end

When(/^the authorized user filters the available individual permissions by term "([^"]*)"$/) do |arg1|
  modal = SelectPermissionsWindow.new
  expect(modal.wait_for_available_indperm_filter).to eq(true)
  expect(modal.available_indperm_names.length).to be > 0
  num_names = modal.available_indperm_names.length

  modal.available_indperm_filter.set arg1
  wait_until { modal.available_indperm_names.length != num_names }
end

Then(/^the Available Individual Permission all include term "([^"]*)"$/) do |arg1|
  modal = SelectPermissionsWindow.new
  expect(modal.available_indperm_names.length).to be > 0, "Check that #{arg1} is a valid filter term"
  selected_names = modal.available_indperm_names.map { |element| element.text }
  selected_names.each do | permission_set |
    expect(permission_set.upcase.include? arg1.upcase).to eq(true), "#{permission_set}"
  end
end

When(/^the authorized user views available permission set's details$/) do
  modal = SelectPermissionsWindow.new
  expect(modal.available_sets_details.length).to be > 0
  modal.available_sets_details[0].click
  @selected_permission = modal.available_sets_names[0].text
end

def verify_permission_set_details(detail_button)
  modal = SelectPermissionsWindow.new
  expect(modal.wait_for_permission_details).to eq(true), "Details popover not displayed"
  
  expect(detail_button['class'].include? 'popover-shown').to eq(true), "#{detail_button['class']}"
  
  expect(modal.permission_details).to have_detail_title
  expect(modal.permission_details.detail_title.text.upcase).to eq("Details for #{@selected_permission}".upcase)
  
  expect(modal.permission_details.table_headers.length).to eq(1)
  expect(modal.permission_details.table_headers[0].text.upcase).to eq('permissions'.upcase)

  expect(modal.permission_details.table_rows.length).to be > 0
end

def verify_individual_permissions_details(detail_button)
  modal = SelectPermissionsWindow.new
  expect(modal.wait_for_permission_details).to eq(true), "Details popover not displayed"
  
  expect(detail_button['class'].include? 'popover-shown').to eq(true), "#{detail_button['class']}"
  
  expect(modal.permission_details).to have_detail_title
  expect(modal.permission_details.detail_title.text.upcase).to eq("Details for #{@selected_permission}".upcase)
  
  expect(modal.permission_details.table_headers.length).to eq(2)
  expect(modal.permission_details.table_headers[0].text.upcase).to eq('Description'.upcase)
  expect(modal.permission_details.table_headers[1].text.upcase).to eq('example'.upcase)
  expect(modal.permission_details.table_rows.length).to be > 0
end

Then(/^the avaiable permission set's details are displayed$/) do
  detail_button = SelectPermissionsWindow.new.available_sets_details[0]
  verify_permission_set_details detail_button
end

When(/^the authorized user views selected permission set's details$/) do
  modal = SelectPermissionsWindow.new
  expect(modal.selected_sets_details.length).to be > 0
  modal.selected_sets_details[0].click
  @selected_permission = modal.selected_sets_names[0].text
end

Then(/^the selected permission set's details are displayed$/) do
  detail_button = SelectPermissionsWindow.new.selected_sets_details[0]
  verify_permission_set_details detail_button
end

Then(/^permissions details contain data$/) do
  modal = SelectPermissionsWindow.new
  expect(modal.permission_details.table_rows.length).to be > 0
  columns = modal.permission_details.table_rows
  columns.each do | td |
    # p td.text
    expect(td.text.length).to be > 0, "Expect permission data rows to contain data"
  end
end

Given(/^there is at least (\d+) available individual permission$/) do |arg1|
  modal = SelectPermissionsWindow.new
  expect(modal.available_indperm_rows.length).to be > 0, "Expected Available Individual Permissions to have at least 1 row"
  expect(modal.available_indperm_actions.length).to be > 0, "Expected Available Individual Permissions to have at least 1 row that can be removed"
end

When(/^the authorized user views available individual permission's details$/) do
  modal = SelectPermissionsWindow.new
  expect(modal.available_indperm_details.length).to be > 0
  modal.available_indperm_details[0].click
  @selected_permission = modal.available_indperm_names[0].text
  p @selected_permission
end

Then(/^the available individual permission details are displayed$/) do
  detail_button = SelectPermissionsWindow.new.available_indperm_details[0]
  verify_individual_permissions_details detail_button
end

Given(/^there is at least (\d+) selected indvidual permission$/) do |arg1|
  modal = SelectPermissionsWindow.new
  expect(modal.selected_indperm_rows.length).to be > 0, "Expected Available Individual Permissions to have at least 1 row"
  expect(modal.selected_indperm_actions.length).to be > 0, "Expected Available Individual Permissions to have at least 1 row that can be removed"
end

When(/^the authorized user views selected individual permission's details$/) do
  modal = SelectPermissionsWindow.new
  expect(modal.selected_indperm_details.length).to be > 0
  modal.selected_indperm_details[0].click
  @selected_permission = modal.selected_indperm_names[0].text
  p @selected_permission
end

Then(/^the available selected permission details are displayed$/) do
  detail_button = SelectPermissionsWindow.new.selected_indperm_details[0]
  verify_individual_permissions_details detail_button
end

Then(/^the individual permission  is added to the selected individual permission list$/) do
  modal = SelectPermissionsWindow.new
  new_total = @total_selected_sets + 1
  selected_names = modal.selected_indperm_names.map { |element| element.text }

  available_names = modal.available_indperm_names.map { |element| element.text }

  temp_btn = modal.available_indperm_actions[@available_index]

  expect(temp_btn['class']).to include 'checked-true'  
  expect(modal.selected_indperm_rows.length).to eq(new_total)
  expect(selected_names).to include @test_permission_set_name
  expect(modal.total_selected_indperm.text.upcase).to eq("TOTAL SELECTED: #{new_total}")

  modal.define_add_remove_role_buttons @test_permission_set_name
  expect(modal.wait_for_btn_remove_role).to eq(true), "Expected selected list to display Remove link"
  expect(modal.btn_remove_role.text.upcase).to eq("REMOVE")
  expect(modal.wait_for_btn_remove_role_available).to eq(true), "Expected available list to display Remove link"
  expect(modal.btn_remove_role_available.text.upcase).to eq('REMOVE')
end

Given(/^there is at least (\d+) selected individual permission$/) do |arg1|
  modal = SelectPermissionsWindow.new
  expect(modal.selected_indperm_rows.length).to be > 0, "Expected Selected individual Permissions to have at least 1 row"
  expect(modal.selected_indperm_actions.length).to be > 0, "Expected Selected individual Permissions to have at least 1 row that can be removed"
end

Then(/^the permission set is removed from the select individual permission list$/) do
  modal = SelectPermissionsWindow.new
  new_total = @total_selected_sets - 1
  selected_names = modal.selected_indperm_names.map { |element| element.text } 
  expect(modal.selected_indperm_rows.length).to eq(new_total)
  expect(selected_names).to_not include @test_permission_set_name
  expect(modal.total_selected_indperm.text.upcase).to eq("TOTAL SELECTED: #{new_total}")

  modal.define_add_remove_role_buttons @test_permission_set_name
  expect(modal.wait_for_btn_add_role).to eq(true), "Expected available list to display Add link"
  expect(modal.btn_add_role.text.upcase).to eq('ADD')
end

Given(/^the permission set "([^"]*)" is not selected$/) do |set|
  modal = SelectPermissionsWindow.new
  selected_names = modal.selected_sets_names.map { |element| element.text }
  expect(selected_names).to_not include set
end

When(/^the authorized user adds permission set "([^"]*)"$/) do |set| 
  modal = SelectPermissionsWindow.new
  modal.wait_for_available_sets_names(20)
  modal.define_add_remove_role_buttons set
  expect(modal.wait_for_btn_add_role).to eq(true)
  expect(modal).to have_btn_add_role
 
  index = -1
  available_names = modal.available_sets_names.map { |element| element.text }
  available_names.each_with_index do | temp_name, temp_i |
    index = temp_i if temp_name.upcase.eql? set.upcase
    break if index != -1
  end
  expect(index).to_not eq(-1), "Expected to find set #{set} in the avialable list"
  @test_permission_set_name = set
  @total_selected_sets = modal.selected_sets_rows.length
  @total_reported_selected = /\d+/.match(modal.total_selected_sets.text)
  @available_index = index

  modal.btn_add_role.click
  wait_until { modal.selected_sets_rows.length != @total_selected_sets }

  step 'the permission set is added to the selected permission set list'
end

When(/^the authorized user saves the permissions$/) do
  modal = SelectPermissionsWindow.new
  expect(modal.wait_for_btn_save).to eq(true)
  modal.btn_save.click
end

Then(/^the Select Permissions Window closes$/) do
  modal = SelectPermissionsWindow.new
  begin
    modal.wait_until_noncommon_title_invisible
  rescue Exception => e
    p "#{e}"
    raise e
  end
end

Then(/^the User Information Detail Window displays sucessful message$/) do
  window = UserInformationDetailWindow.new
  expect(window.wait_for_alert).to eq(true)
  expect(window.alert.text.upcase).to include "Modified Permissions".upcase
  expect(window.alert.text.upcase).to include "The permissions have been successfully modified with no errors".upcase
end

Then(/^the Permission Sets sections includes set "([^"]*)"$/) do |set_name|
  window = UserInformationDetailWindow.new
  window.build_info_groups 'Permission Sets'
  wait_until { window.values.length > 0 }
  set_names = window.values.map { |element| element.text }
  expect(set_names).to include set_name
end

Given(/^the permission set "([^"]*)" is selected$/) do |set|
  modal = SelectPermissionsWindow.new
  selected_names = modal.selected_sets_names.map { |element| element.text }
  expect(selected_names).to include set
end

When(/^the authorized user attempts to remove permission set "([^"]*)"$/) do |set_name|
  modal = SelectPermissionsWindow.new
  modal.define_add_remove_role_buttons set_name
  @test_permission_set_name = set_name
  @total_selected_sets = modal.selected_sets_rows.length
  @total_reported_selected = /\d+/.match(modal.total_selected_sets.text)

  modal.btn_remove_role.click
end

When(/^the authorized user removes permission set "([^"]*)"$/) do |set_name|
  modal = SelectPermissionsWindow.new
  step "the authorized user attempts to remove permission set \"#{set_name}\""

  wait_until { modal.selected_sets_rows.length != @total_selected_sets }

  step 'the permission set is removed from the select permission set list'
end

Then(/^the Permission Sets sections does not include set "([^"]*)"$/) do |set_name|
  window = UserInformationDetailWindow.new
  window.build_info_groups 'Permission Sets'
  wait_until { window.values.length > 0 }
  set_names = window.values.map { |element| element.text }
  expect(set_names).to_not include set_name
end

Given(/^the individual permission "([^"]*)" is not selected$/) do |ind_perm|
  modal = SelectPermissionsWindow.new
  selected_names = modal.selected_indperm_names.map { |element| element.text }
  expect(selected_names).to_not include ind_perm
end

When(/^the authorized user adds individual permission "([^"]*)"$/) do |ind_perm|
  modal = SelectPermissionsWindow.new
  modal.define_add_remove_role_buttons ind_perm
  expect(modal).to have_btn_add_role
 

  @test_permission_set_name = ind_perm
  @total_selected_sets = modal.selected_indperm_rows.length
  @total_reported_selected = /\d+/.match(modal.total_selected_sets.text)
  
  modal.btn_add_role.click
  wait_until { modal.selected_indperm_rows.length != @total_selected_sets }

  # with each permission/permission set added/deleted the available individual permission list changes
  index = -1
  available_names = modal.available_indperm_names.map { |element| element.text }
  available_names.each_with_index do | temp_name, temp_i |
    index = temp_i if temp_name.upcase.eql? ind_perm.upcase
    break if index != -1
  end
  p index
  expect(index).to_not eq(-1), "Expected to find permission #{ind_perm} in the avialable list"
  @available_index = index
  # with each permission/permission set added/deleted the available individual permission list changes

  step 'the individual permission  is added to the selected individual permission list'
end

Then(/^the Individual Permission section includes "([^"]*)"$/) do |perm_name|
  window = UserInformationDetailWindow.new
  window.build_info_groups 'Additional Individual Permissions'
  wait_until { window.values.length > 0 }
  set_names = window.values.map { |element| element.text }
  expect(set_names).to include perm_name
end

When(/^the authorized user removes individual permission "([^"]*)"$/) do |ind_perm|
  modal = SelectPermissionsWindow.new
  modal.define_add_remove_role_buttons ind_perm
  @test_permission_set_name = ind_perm
  @total_selected_sets = modal.selected_indperm_rows.length
  @total_reported_selected = /\d+/.match(modal.total_selected_indperm.text)

  modal.btn_remove_role.click
  # p "#{@test_permission_set_name} #{@total_selected_sets} #{@total_reported_selected}"
  wait_until { modal.selected_indperm_rows.length != @total_selected_sets }

  step 'the permission set is removed from the select individual permission list'
end

Then(/^the Individual Permission section does not include "([^"]*)"$/) do |perm_name|
  window = UserInformationDetailWindow.new
  window.build_info_groups 'Additional Individual Permissions'
  wait_until { window.values.length > 0 }
  set_names = window.values.map { |element| element.text }
  expect(set_names).to_not include perm_name
end

When(/^the authorized user cancels the permission changes$/) do
  window = SelectPermissionsWindow.new
  expect(window.wait_for_btn_cancel).to eq(true)
  window.btn_cancel.click
end

Given(/^permission set "([^"]*)" is selected$/) do |set_name|
  window = SelectPermissionsWindow.new
  selected_names = window.selected_sets_names.map { |element| element.text }
  already_selected = selected_names.include? set_name
  unless already_selected
    p "not selected, add set"
    step_name = "the authorized user adds permission set \"#{set_name}\""
    step step_name
  end
end

Given(/^individual permission "([^"]*)" is selected$/) do |ind_perm_name|
  window = SelectPermissionsWindow.new
  selected_names = window.selected_indperm_names.map { |element| element.text }
  already_selected = selected_names.include? ind_perm_name
  unless already_selected
    p "not selected, add set"
    step_name = "the authorized user adds individual permission \"#{ind_perm_name}\""
    step step_name
  end
end

Given(/^the individual permission "([^"]*)" is included in selected list$/) do |perm|
  modal = SelectPermissionsWindow.new
  selected_names = modal.selected_indperm_names.map { |element| element.text }
  expect(selected_names).to include perm
end

Then(/^the Selected Permissions Window displays an Error Editing message$/) do
  window = SelectPermissionsWindow.new
  expect(window.wait_for_alert_message).to eq(true)
  expect(window.alert_message.text.upcase).to include 'Error Editing Permission Sets'.upcase
  expect(window.alert_message.text.upcase).to include "You are not allowed to remove 'Access Control Coordinator' from the assigned Permission Sets until 'Edit Own Permissions' is removed from Additional Permissions.".upcase
end

When(/^the authorized user removes all Selected Permission Sets$/) do
  window = SelectPermissionsWindow.new
  num_selected_sets = window.selected_sets_rows.length
  for i in 0..num_selected_sets-1
    selected_names = window.selected_sets_names.map { |element|element.text }
    expect(selected_names.length).to be > 0
    steps %Q{ When the authorized user removes permission set "#{selected_names.first}" }
  end
end

Then(/^the Selected Permissions Window displays an Auto Update message$/) do
  window = SelectPermissionsWindow.new
  expect(window.wait_for_alert_message).to eq(true)
  expect(window.alert_message.text.upcase).to include 'Permission Set Auto Update'.upcase
  expect(window.alert_message.text.upcase).to include "'Edit Own Permissions' automatically grants 'Access Control Coordinator' Permission Set".upcase
end

Then(/^the Permission Set "([^"]*)" is added to the Selected Permissions Set$/) do |set|
  window = SelectPermissionsWindow.new
  selected_names = window.selected_sets_names.map { |element| element.text }
  expect(selected_names).to include set
end
