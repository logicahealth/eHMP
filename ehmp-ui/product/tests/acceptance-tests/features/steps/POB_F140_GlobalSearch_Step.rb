When(/^POB user clicks on confirm Flagged Patient Button$/) do
  @ehmp = PobPatientSearch.new
  @ehmp.wait_for_btn_confirmFlagged
  expect(@ehmp).to have_btn_confirmFlagged
  @ehmp.btn_confirmFlagged.click
end
