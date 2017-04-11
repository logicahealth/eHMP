Then(/^POB the Appointments coversheet table contains headers$/) do |table|
  @ehmp = PobCoverSheet.new
  @ehmp.wait_for_fld_appointments_thead(30)
  expect(@ehmp).to have_fld_appointments_thead
  table.rows.each do |field, value|
    @ehmp.fld_appointments_thead.text.include? "#{field}" "#{value}"
  end
end

When(/^POB the user clicks the Appointments Expand Button$/) do
  @ehmp = PobCoverSheet.new
  @ehmp.wait_until_btn_appointments_expand_visible
  expect(@ehmp).to have_btn_appointments_expand
  @ehmp.btn_appointments_expand.click
end

And(/^POB Appointments applet loaded successfully$/) do
  @ehmp = PobAppointmentsApplet.new
  @ehmp.wait_until_btn_appointments_all_visible(30)
  expect(@ehmp).to be_displayed
end

When(/^POB the user clicks the 24 hr Appointments Range$/) do
  @ehmp = PobAppointmentsApplet.new
  @ehmp.wait_until_btn_appointments_24hr_visible
  expect(@ehmp).to have_btn_appointments_24hr
  @ehmp.btn_appointments_24hr.click
end

And(/^POB Appointments data table display "(.*?)" and "(.*?)"$/) do |header, data|
  @ehmp = PobAppointmentsApplet.new
  @ehmp.wait_for_fld_appointment_data_thead
  @ehmp.wait_for_all_data_to_load_in_appointment_table
  expect(object_exists_in_list(@ehmp.fld_appointment_table_row, header)).to be true
  expect(object_exists_in_list(@ehmp.fld_appointment_table_row, data)).to be true
end
