When(/^user enters a comment "([^"]*)" and a timestamp$/) do |user_comment|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_fld_comment
  @new_problem_comment_time = Time.now
  @full_comment = "#{user_comment} #{@new_problem_comment_time}"
  @ehmp.fld_comment.set @full_comment
end

Then(/^the comment character count is updated$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_fld_comment_characters_left
  expect(@ehmp.fld_comment_characters_left.text).to eq((200 - @full_comment.length).to_s)
end

Then(/^the Add Problem comment add button is enabled$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp.btn_add_comment.disabled?).to eq(false), "Expected Add comment button to be enabled"
end

Then(/^the Add Problem accept button is disabled$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp.btn_accept_problem_addition.disabled?).to eq(true), "Expected Add Problem accept button to be disabled"
end

When(/^user adds the problem comment$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  comment_count = @ehmp.fld_comment_rows.length
  expect(@ehmp).to have_btn_add_comment
  @ehmp.btn_add_comment.click
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  wait.until { @ehmp.fld_comment_rows.length == comment_count + 1 }
end

Then(/^the Add Problem comment add button is disabled$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp.btn_add_comment.disabled?).to eq(true), "Expected Add comment button to be disabled"
end

Then(/^the Add Problem accept button is enabled$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp.btn_accept_problem_addition.disabled?).to eq(false), "Expected Add Problem accept button to be enabled"
end

Then(/^a Add Problem comment row is displayed with "([^"]*)" and a timestamp$/) do |user_comment|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  # assumption that the most recently comment is the last in the list
  count = @ehmp.fld_comment_row_text.length
  expect(count).to be > 0
  expect(@ehmp.fld_comment_row_text[count-1].text).to eq("#{user_comment} #{@new_problem_comment_time}")
  expect(@ehmp.btn_comment_row_edit.length).to eq(count), "Expected every comment row to have an edit button"
  expect(@ehmp.btn_comment_row_delete.length).to eq(count), "Expected every comment row to have an edit button"
end

When(/^user chooses to edit the "([^"]*)" comment$/) do |user_comment|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  count = @ehmp.btn_comment_row_edit.length
  index = @ehmp.index_of_comment("#{user_comment} #{@new_problem_comment_time}")
  expect(index).to be >= 0, "a comment with text #{user_comment} #{@new_problem_comment_time} was not found"
  expect(count).to be > index
  @ehmp.btn_comment_row_edit[index].click
  @ehmp.wait_for_txt_comment_edit
end

Then(/^a comment cancel button is enabled$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_btn_comment_cancel_edit
  expect(@ehmp.btn_comment_cancel_edit.disabled?).to eq(false)
end

Then(/^a comment save button is disabled$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_btn_comment_save_edit
  expect(@ehmp.btn_comment_save_edit.disabled?).to eq(true)
end

When(/^user updates comment text to "([^"]*)" and a timestamp$/) do |user_comment|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_txt_comment_edit
  @edit_problem_comment_time = Time.now
  @full_comment = "#{user_comment} #{@edit_problem_comment_time}"
  @ehmp.txt_comment_edit.set @full_comment
end

When(/^user chooses to cancel the comment edit$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_btn_comment_cancel_edit
  @ehmp.btn_comment_cancel_edit.click
  @ehmp.wait_until_btn_comment_cancel_edit_invisible
end

When(/^user chooses to save the comment edit$/) do
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  expect(@ehmp).to have_btn_comment_save_edit
  @ehmp.btn_comment_save_edit.click
  @ehmp.wait_until_btn_comment_save_edit_invisible
  @new_problem_comment_time = @edit_problem_comment_time
end

When(/^user chooses to delete the "([^"]*)" comment$/) do |user_comment|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  count = @ehmp.btn_comment_row_delete.length
  index = @ehmp.index_of_comment("#{user_comment} #{@new_problem_comment_time}")
  expect(index).to be >= 0, "a comment with text #{user_comment} #{@new_problem_comment_time} was not found"
  expect(count).to be > index
  @ehmp.btn_comment_row_delete[index].click

end

Then(/^Comment delete alert is displayed$/) do
  @ehmp = AddProblemsDeleteCommentAlert.new
  expect(@ehmp).to have_mdl_alert_title
  expect(@ehmp.mdl_alert_title.text.upcase).to eq('COMMENT DELETED')
  expect(@ehmp).to have_btn_restore
  expect(@ehmp).to have_btn_okay
end

When(/^user chooses Okay to approve comment deletion$/) do
  @ehmp = AddProblemsDeleteCommentAlert.new
  @ehmp.wait_for_btn_okay
  expect(@ehmp).to have_btn_okay
  @ehmp.btn_okay.click
  @ehmp.wait_until_mdl_alert_title_invisible
end

When(/^user chooses to Restore the comment$/) do
  @ehmp = AddProblemsDeleteCommentAlert.new
  @ehmp.wait_for_btn_restore
  expect(@ehmp).to have_btn_restore
  @ehmp.btn_restore.click
  @ehmp.wait_until_mdl_alert_title_invisible
end

When(/^a Add Problem comment row is not displayed with "([^"]*)" and a timestamp$/) do |user_comment|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  full_comment = "#{user_comment} #{@new_problem_comment_time}"
  index = @ehmp.index_of_comment full_comment
  expect(index).to be < 0, "Comment is incorrectly still displayed"
end

Then(/^the Add Problem comments are in order$/) do |table|
  @ehmp = AddProblemsTrayModal.new unless @ehmp.is_a? AddProblemsTrayModal
  comment_texts = @ehmp.fld_comment_row_text
  expect(comment_texts.length).to eq(table.rows.length)
  table.rows.each_with_index do | text, index |
    comment_texts[index].text.include? text[0]
    expect(comment_texts[index].text.include? text[0]).to eq true
  end
end
