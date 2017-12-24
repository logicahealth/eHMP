Given(/^the User Information Detail Window displays$/) do
  modal = UserInformationDetailWindow.new
  expect(modal).to have_fld_modal_title
  expect(modal.fld_modal_title.text.upcase).to eq("PANORAMA USER")
end

Then(/^the User Information Detail Window displays user's full name "([^"]*)"$/) do |name|
  modal = UserInformationDetailWindow.new
  expect(modal.wait_for_full_name).to eq(true), "Modal is not displaying user's full name element"
  expect(modal.full_name.text.upcase).to eq(name.upcase)
end

Then(/^the User Information Detail Window displays VISTA status$/) do
  modal = UserInformationDetailWindow.new
  expect(modal.wait_for_vista_status).to eq(true), "Modal is not displaying user's vista status"
  
  split_status = modal.vista_status.text.split(' ')
  expect(split_status.length).to eq(2), "expected vista status to be in 2 parts"
  expect(split_status[0]).to eq("VISTA:")
  expect(modal.allowable_status).to include split_status[1]
end

Then(/^the User Information Detail Window displays eHMP status$/) do
  modal = UserInformationDetailWindow.new
  expect(modal.wait_for_ehmp_status).to eq(true), "Modal is not displaying user's ehmp status"
  split_status = modal.ehmp_status.text.split(' ')
  expect(split_status.length).to eq(2), "expected ehmp status to be in 2 parts"
  expect(split_status[0]).to eq("eHMP:")
  expect(modal.allowable_status).to include split_status[1]

end

Then(/^the User Information Detail Window displays First name "([^"]*)"$/) do |name|
  modal = UserInformationDetailWindow.new
  label = 'First name'
  modal.build_info_elements(label)
  expect(modal.wait_for_label).to eq(true), "Expected modal to display a #{label} label"
  expect(modal.wait_for_value).to eq(true), "Expected modal to display a #{label} value"
  expect(modal.value.text.upcase).to eq(name.upcase), "Expected modal #{label} to eq #{name}"
end

Then(/^User Information Detail Window displays Last name "([^"]*)"$/) do |name|
  modal = UserInformationDetailWindow.new
  label = 'Last name'
  modal.build_info_elements(label)
  expect(modal.wait_for_label).to eq(true), "Expected modal to display a #{label} label"
  expect(modal.wait_for_value).to eq(true), "Expected modal to display a #{label} value"
  expect(modal.value.text.upcase).to eq(name.upcase), "Expected modal #{label} to eq #{name}"
end

Then(/^User Information Detail Window displays Permission Sets$/) do
  modal = UserInformationDetailWindow.new
  label = 'Permission Sets'
  modal.build_info_groups(label)
  expect(modal.wait_for_label).to eq(true), "Expected modal to display a #{label} label"
  expect(modal.values.length).to be > 0, "Expected modal to display #{label} values"
end

Then(/^User Information Detail Window displays Additional Individual Permissions$/) do
  modal = UserInformationDetailWindow.new
  label = 'Additional Individual Permissions'
  modal.build_info_groups(label)
  expect(modal.wait_for_label).to eq(true), "Expected modal to display a #{label} label"
  expect(modal.values.length).to be > 0, "Expected modal to display #{label} values"
end

Then(/^User Information Detail Window displays Facility$/) do
  modal = UserInformationDetailWindow.new
  label = 'Facility'
  modal.build_info_elements(label)
  expect(modal.wait_for_label).to eq(true), "Expected modal to display a #{label} label"
  expect(modal.wait_for_value).to eq(true), "Expected modal to display a #{label} value"
  
  # commented out until DE7817 is resolved
  # expect(modal.value.text.length).to be > 0, "Expected #{label} value to contain data"
end

Given(/^User Information Detail Window displays Facility value$/) do
  p "This is here for DE7817, "
  modal = UserInformationDetailWindow.new
  label = 'Facility'
  modal.build_info_elements(label)
  
  expect(modal.wait_for_value).to eq(true), "Expected modal to display a #{label} value"
  expect(modal.value.text.length).to be > 0, "Expected #{label} value to contain data"
end

Then(/^User Information Detail Window displays a Close button$/) do
  modal = UserInformationDetailWindow.new
  expect(modal.wait_for_btn_modal_close).to eq(true), "Expected modal to display a Close button"
end
