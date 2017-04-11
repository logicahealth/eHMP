And(/^POB Narrative Lab results applet loaded successfully$/) do
  @ehmp = PobLabResults.new
  @ehmp.wait_until_btn_lab_results_all_visible(30)
  expect(@ehmp).to be_displayed
end

When(/^POB the user clicks the Numeric Lab Results Expand Button$/) do
  @ehmp = PobOverView.new
  @ehmp.wait_until_btn_lab_results_maximize_visible
  expect(@ehmp).to have_btn_lab_results_maximize
  @ehmp.btn_lab_results_maximize.click
end

When(/^POB the user clicks the date control All in the Narrative Lab Results applet$/) do
  @ehmp = PobLabResults.new
  @ehmp.wait_until_btn_lab_results_all_visible
  expect(@ehmp).to have_btn_lab_results_all
  @ehmp.btn_lab_results_all.click
end

When(/^POB the user click on any lab test result$/) do
  @ehmp = PobLabResults.new
  @ehmp.wait_to_load_all_data_in_lab_results_table
  @ehmp.click_table_cell_by_text('data-grid-lab_results_grid', 2, '- BLOOD')
  @ehmp.wait_until_btn_sidekick_detail_visible
  expect(@ehmp).to have_btn_sidekick_detail
  @ehmp.btn_sidekick_detail.click
end

When(/^POB verify lab results modal is displayed$/) do
  @ehmp = PobLabResults.new
  @ehmp.wait_for_fld_lab_results_modal_header(30)
  @ehmp.wait_for_fld_lab_results_modal_data
  expect(@ehmp).to have_fld_lab_results_modal_data
end

When(/^POB verify user can close the lab results modal$/) do
  @ehmp = PobLabResults.new
  @ehmp.wait_until_btn_lab_results_modal_close_visible
  expect(@ehmp).to have_btn_lab_results_modal_close
  @ehmp.btn_lab_results_modal_close.click
end

Then(/^user navigates to numeric lab results expanded view$/) do
  @ehmp = PobLabResults.new
  begin
    @ehmp.load_and_wait_for_screenname
    expect(@ehmp.menu.fld_screen_name.text.upcase).to have_text("Numeric Lab Results".upcase)
  rescue Exception => e
    p "Exception waiting for screenname: #{e}, try to continue"
  end
  @ehmp.wait_to_load_all_data_in_lab_results_table
end

When(/^user opens the first numeric lab results row$/) do
  @ehmp = PobLabResults.new
  @ehmp.wait_to_load_all_data_in_lab_results_table
  rows = @ehmp.fld_lab_results_table_row
  expect(@ehmp.has_fld_empty_row?).to eq(false), "Numeric Lab Results table is empty. This test expects at least two rows in the table"
  expect(rows.length >= 2).to eq(true), "this test needs at least 2 rows, found only #{rows.length}"
  rows[2].click
end

