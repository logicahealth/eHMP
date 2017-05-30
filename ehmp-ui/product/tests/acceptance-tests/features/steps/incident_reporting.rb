Then(/^the footer displays the eHMP Incident button$/) do
  footer = PobHeaderFooter.new
  expect(footer.wait_for_btn_incident_report).to eq(true), "Expected footer to display 'Report Incident' button"
end

When(/^the user selectes the eHMP Incident button in the footer$/) do
  footer = PobHeaderFooter.new
  expect(footer.wait_for_btn_incident_report).to eq(true), "Expected footer to display 'Report Incident' button"
  footer.btn_incident_report.click
end

Then(/^the eHMP Incident Popup Window displays$/) do
  incident_window = IncidentReportWindow.new
  begin
    wait_until { incident_window.submit_report_elements_all_there? }
  rescue Exception => e
    p "#{e}"
    raise "All elements for the incident window did not display"
  end
end

Then(/^the eHMP Incident Popup Window has an input field$/) do
  incident_window = IncidentReportWindow.new
  expect(incident_window.wait_for_fld_incident_comment).to eq(true)
end

Then(/^the eHMP Incident Popup Window has a Send Report button$/) do
  incident_window = IncidentReportWindow.new
  expect(incident_window.wait_for_btn_send_report).to eq(true)
end

When(/^the user submits an incident report$/) do
  footer = PobHeaderFooter.new
  incident_window = IncidentReportWindow.new
  expect(footer.wait_for_btn_incident_report).to eq(true), "Expected footer to display 'Report Incident' button"
  footer.btn_incident_report.click

  wait_until { incident_window.submit_report_elements_all_there? }

  incident_window.fld_incident_comment.set "Incident Report: #{Time.now}"
  expect(incident_window.wait_for_btn_enabled_send_report).to eq(true)
  incident_window.btn_enabled_send_report.click
end

Then(/^the Incident Popup Window displays a confirmation message$/) do
  incident_window = IncidentReportWindow.new
  expect(incident_window.wait_for_fld_confirmation_message).to eq(true)
end

Then(/^the Incident Popup Window displays an incident number$/) do
  incident_window = IncidentReportWindow.new
  expect(incident_window.wait_for_fld_incident_number).to eq(true)
  incident_number_format = Regexp.new("\\w+, \\w+")

  number = incident_number_format.text

  expect(incident_number_format.match(number).nil?).to eq(false), "#{number} did not match expected format"
end
