Given(/^user hovers over the numeric lab trend row$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_for_fld_gist_rows
  expect(ehmp.fld_gist_rows.length).to be > 0
  ehmp.fld_gist_rows[0].hover
end

Given(/^user can view the Quick Menu Icon in numeric lab applet$/) do
  ehmp = PobNumericLabApplet.new
  QuickMenuActions.verify_quick_menu ehmp
end

Given(/^Quick Menu Icon is collapsed in numeric lab applet$/) do
  ehmp = PobNumericLabApplet.new
  QuickMenuActions.verify_quick_menu_collapsed ehmp
end

When(/^Quick Menu Icon is selected in numeric lab applet$/) do
  ehmp = PobNumericLabApplet.new
  QuickMenuActions.select_quick_menu(ehmp)
end

Then(/^user can see the options in the numeric lab applet$/) do |table|
  # table is a Cucumber::MultilineArgument::DataTable
  ehmp = PobNumericLabApplet.new
  QuickMenuActions.verify_menu_options ehmp, table
end

Given(/^user hovers over the numeric lab summary row$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_for_summary_rows
  expect(ehmp.summary_rows.length).to be > 0
  ehmp.summary_rows[0].hover
end

Then(/^user hovers over the numeric expanded panel summary row$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_for_summary_panel_expanded_rows
  expect(ehmp.summary_panel_expanded_rows.length).to be > 0
  ehmp.summary_panel_expanded_rows[0].hover
end

Given(/^user hovers over the numeric lab non\-panel summary row$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_for_summary_nonpanel_rows
  expect(ehmp.summary_nonpanel_rows.length).to be > 0
  ehmp.summary_nonpanel_rows[0].hover
end

When(/^user hovers over the numeric lab expanded non\-panel row$/) do
  ehmp = PobNumericLabApplet.new
  ehmp.wait_for_expanded_nonpanel_rows
  expect(ehmp.expanded_nonpanel_rows.length).to be > 0
  ehmp.expanded_nonpanel_rows[0].hover
end

Given(/^user selects the detail view from Quick Menu Icon of numeric lab applet$/) do
  ehmp = PobNumericLabApplet.new
  QuickMenuActions.open_menu_click_detail_button ehmp
end

Then(/^the numeric lab result modal displays$/) do
  modal = NumericLabResultsModal.new
  modal.wait_for_btn_next_lab
  modal.wait_for_btn_previous_lab
  modal.wait_for_tbl_dta
  #expect(modal).to have_btn_next_lab
  #expect(modal).to have_btn_previous_lab
  expect(modal).to have_tbl_dta

end
