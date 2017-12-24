When(/^the user clicks the first numeric lab result panel row$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_for_summary_panel_rows
  expect(ehmp.summary_panel_rows.length).to be > 0
  ehmp.summary_panel_rows[0].click
end

Then(/^the numeric lab result applet displays expanded panel rows$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_for_summary_panel_expanded_rows
  expect(ehmp.summary_panel_expanded_rows.length).to be > 0
end

When(/^the user clicks a panel row$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_for_summary_panel_expanded_rows
  expect(ehmp.summary_panel_expanded_rows.length).to be > 0
  ehmp.summary_panel_expanded_rows[0].click
end

Then(/^the From Date input NOT should have the value "([^"]*)" in the Numeric Lab Results modal$/) do |date_value|
  ehmp = NumericLabResultsModal.new
  ehmp.wait_for_fld_from_date
  expect(ehmp).to have_fld_from_date
  expect(ehmp.fld_from_date.value).to_not eq(date_value)
end

Then(/^the To Date input NOT should have the value "([^"]*)" in the Numeric Lab Results modal$/) do |date_value|
  ehmp = NumericLabResultsModal.new
  ehmp.wait_for_fld_to_date
  expect(ehmp).to have_fld_to_date
  expect(ehmp.fld_to_date.value).to_not eq(date_value)
end
