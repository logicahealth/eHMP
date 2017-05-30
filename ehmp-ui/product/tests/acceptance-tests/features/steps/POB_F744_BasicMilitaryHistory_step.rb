Then(/^the Military History applet contains headers$/) do |table|
  @ehmp = PobAppletMilitaryApplet.new
#  @ehmp.wait_for_fld_military_history_thead(DefaultTiming.default_table_row_load_time)
#  expect(@ehmp).to have_fld_military_history_thead
#  t_data=1
#  table.rows.each do |field|
#    p "Field: #{field[0]}"
#    p "Row Data: #{@ehmp.get_military_history_data_row("thead", "1", t_data, 'th')}"
#    expect((@ehmp.get_military_history_data_row("thead", "1", t_data, 'th')).upcase).to eq(field[0].upcase)
#    t_data+=1
#  end
  @ehmp.wait_until_tbl_military_history_headers_visible
  table.rows.each do |header|
    expect(object_exists_in_list(@ehmp.tbl_military_history_headers, "#{header[0]}")).to eq(true), "Field '#{header[0]}' was not found"
  end
end

Then(/^the Military History table contains rows$/) do |table|
  @ehmp = PobAppletMilitaryApplet.new
#  @ehmp.wait_for_fld_military_history_tbody(DefaultTiming.default_table_row_load_time)
#  expect(@ehmp).to have_fld_military_history_tbody
#  t_row=1
#  table.rows.each do |field|
#    p "Field: #{field[0]}"
#    p "Row Data: #{@ehmp.get_military_history_data_row("tbody", t_row , '1', 'td')}"
#    expect(@ehmp.get_military_history_data_row("tbody", t_row , '1', 'td')).to eq(field[0])
#    t_row+=1
#  end
  @ehmp.wait_until_tbl_military_history_rows_visible
  table.rows.each do |name|
    expect(object_exists_in_list(@ehmp.tbl_military_history_rows, "#{name[0]}")).to eq(true), "Field '#{name[0]}' was not found"
  end
end

When(/^POB the user clicks the Military History Expand Button$/) do
  @ehmp = PobAppletMilitaryApplet.new
  @ehmp.wait_until_btn_expand_military_history_visible
  expect(@ehmp).to have_btn_expand_military_history
  @ehmp.btn_expand_military_history.click
end

Then(/^the user minimizes the expanded Military History applet/) do
  @ehmp = PobAppletMilitaryApplet.new
  @ehmp.wait_until_btn_minimize_military_history_visible
  expect(@ehmp).to have_btn_minimize_military_history
  @ehmp.btn_minimize_military_history.click
end

And(/^POB "(.*?)" Military History applet loaded successfully$/) do |applet_id|
  @ehmp = PobAppletMilitaryApplet.new
  @ehmp.wait_until_tbl_military_hist_expanded_data_row_loaded_visible(DefaultTiming.default_table_row_load_time)
  expect(@ehmp).to have_tbl_military_hist_expanded_data_row_loaded
  VerifyTableValue.check_all_data_loaded(applet_id)
end

When(/^the user clicks on data row number "(.*?)"$/) do |row_num|
  @ehmp = PobAppletMilitaryApplet.new
  expect(@ehmp.check_each_row_loaded(row_num)).to eq(true)
  max_attempt = 5
  begin
    @ehmp.click_military_hist_data_row(row_num)
    @ehmp.wait_until_btn_edit_view_visible(DefaultTiming.default_wait_time)
    @ehmp.wait_until_btn_detail_view_visible(DefaultTiming.default_wait_time)
  rescue => e
    #p "max_attempt: #{max_attempt}"
    max_attempt-=1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
end

Then(/^the buttons Details form and Edit form are displayed on$/) do
  @ehmp = PobAppletMilitaryApplet.new
  @ehmp.wait_until_btn_edit_view_visible(DefaultTiming.default_wait_time)
  expect(@ehmp).to have_btn_detail_view
  expect(@ehmp).to have_btn_edit_view
end

And(/^the user clicks on Edit form button$/) do
  @ehmp = PobAppletMilitaryApplet.new
  @ehmp.wait_until_btn_detail_view_visible(DefaultTiming.default_table_row_load_time)
  @ehmp.wait_until_btn_edit_view_visible(DefaultTiming.default_table_row_load_time)
  @ehmp.btn_edit_view.click
  @ehmp.wait_until_fld_military_history_textarea_visible(DefaultTiming.default_table_row_load_time)
  expect(@ehmp.fld_military_history_edit_header.text.strip).to eq("Edit Military History")
end

Then(/^the Edit form has a Text box, Cancel and Save buttons$/) do
  @ehmp = PobAppletMilitaryApplet.new
  @ehmp.wait_until_fld_military_history_textarea_visible(DefaultTiming.default_table_row_load_time)
  expect(@ehmp).to have_fld_military_history_textarea
  expect(@ehmp).to have_btn_military_history_save
  expect(@ehmp).to have_btn_military_history_cancel
end

And(/^the user enters text "(.*?)" and clicks row "(.*?)" save$/)  do |description, t_row|
  @ehmp = PobAppletMilitaryApplet.new
  max_attempt = 5
  begin
    @ehmp.find_edit_modal_label.should have_content('Edit Military History')
    @ehmp.fld_military_history_textarea.click
    # This is done to see the description count in affect otherwise even after clearing the character the previous count is maintained
    # This is to replicate manual clearing of text area.
    page.fill_in("description", with: "")
    @ehmp.fld_military_history_textarea.set "a"
    @ehmp.fld_military_history_textarea.native.send_keys :backspace
    @ehmp.find_remaining_char_span.should have_content("200 of 200")
  rescue => e
    #p "max_attempt: #{max_attempt}"
    max_attempt-=1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end

  description_saved = "#{description} #{t_row}"
  p description_saved

  max_attempt = 5
  begin
    page.fill_in("description", with: description_saved)
    #p @ehmp.get_remaining_character_number(description)
    @ehmp.find_remaining_char_span.should have_content("#{ @ehmp.get_remaining_character_number(description) } of 200")
  rescue => e
    #p "max_attempt: #{max_attempt}"
    max_attempt-=1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end

  @ehmp.wait_until_btn_military_history_save_visible(DefaultTiming.default_table_row_load_time)
  @ehmp.btn_military_history_save.click
  max_attempt = 1
  begin
    wait_until { @ehmp.has_btn_military_history_save? == false }
  rescue
    max_attempt-=1
    retry if max_attempt >= 0
    raise e if max_attempt < 0
  end
  @ehmp.wait_until_fld_military_history_edit_header_invisible(DefaultTiming.default_wait_time)
  @ehmp.wait_until_tbl_military_hist_data_row_loaded_visible(DefaultTiming.default_wait_time)

  p "Header: #{@ehmp.get_military_history_data_row("thead", "1", "2", 'th')}"
  expect((@ehmp.get_military_history_data_row("thead", "1", "2", 'th')).upcase).to eq("Description".upcase)

  p "Description for row #{t_row}: #{@ehmp.get_military_history_data_row("tbody", t_row , '2', 'td')}"
  expect(@ehmp.get_military_history_data_row("tbody", t_row , '2', 'td')).to eq(description_saved)
end

And(/^the user edits text and clicks row "(.*?)" cancel$/) do |t_row|
  @ehmp = PobAppletMilitaryApplet.new
  @ehmp.wait_until_fld_military_history_textarea_visible(DefaultTiming.default_table_row_load_time)
  @ehmp.fld_military_history_textarea.click
  description_cancelled = "This text #{t_row} shouldn't be saved"
  description_saved = "This is 2nd testing text row #{t_row}"
  max_attempt = 5
  begin
    page.fill_in("description", with: description_cancelled)
    @ehmp.wait_until_btn_military_history_cancel_visible(DefaultTiming.default_table_row_load_time)
    expect(@ehmp.btn_military_history_cancel.visible?).to eq(true)
    expect(@ehmp.fld_military_history_textarea.value).to eq(description_cancelled)
    expect(@ehmp.fld_military_history_textarea.value).not_to eq(description_saved)
    @ehmp.btn_military_history_cancel.click
    @ehmp.wait_until_tbl_military_hist_data_row_loaded_visible(DefaultTiming.default_table_row_load_time)
  rescue => e
    max_attempt-=1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
end

Then(/^the description for row "(.*?)" is not updated and displays previous text$/) do |t_row|
  @ehmp = PobAppletMilitaryApplet.new
  description_cancelled = "This text #{t_row} shouldn't be saved"
  description_saved = "This is 2nd testing text row #{t_row}"

  p "Cancelled Text: #{description_cancelled}"
  p "Text After Cancelling: #{@ehmp.get_military_history_data_row("tbody", t_row , '2', 'td')}"

  p "Header: #{@ehmp.get_military_history_data_row("thead", "1", "2", 'th')}"
  expect((@ehmp.get_military_history_data_row("thead", "1", "2", 'th')).upcase).to eq("Description".upcase)

  p "Description for row #{t_row}: #{@ehmp.get_military_history_data_row("tbody", t_row , '2', 'td')}"
  expect(@ehmp.get_military_history_data_row("tbody", t_row , '2', 'td')).to eq(description_saved)
  expect(@ehmp.get_military_history_data_row("tbody", t_row , '2', 'td')).not_to eq(description_cancelled)
end

Then(/^the description for row "([^"]*)" is updated to "([^"]*)"$/) do |t_row, description|
  @ehmp = PobAppletMilitaryApplet.new
  concat_description = "#{description} #{t_row}"

  expect((@ehmp.get_military_history_data_row("thead", "1", "2", 'th')).upcase).to eq("Description".upcase)

  p "Description for row #{t_row}: #{@ehmp.get_military_history_data_row("tbody", t_row , '2', 'td')}"
  expect(@ehmp.get_military_history_data_row("tbody", t_row , '2', 'td')).to eq(concat_description)
end

And(/^the Last Modified column displays last updated date$/) do
  @ehmp = PobAppletMilitaryApplet.new
  last_modified = Time.strptime(@ehmp.get_military_history_expanded_data_row(1, 3), "%m/%d/%Y")
  expect(last_modified.strftime('%m/%d/%Y')).to eq(DateTime.now.strftime('%m/%d/%Y'))
end

And(/^the Location column displays the name of the site "(.*?)"$/) do |site|
  @ehmp = PobAppletMilitaryApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  begin
    wait.until { @ehmp.get_military_history_expanded_data_row(1, 4).eql?(site) }
  rescue
    expect(@ehmp.get_military_history_expanded_data_row(1, 4)).to eq(site)
  end
end

And(/^the Modified By column displays the name of the user "(.*?)" who edited the description$/) do |last_modified_user|
  @ehmp = PobAppletMilitaryApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  begin
    wait.until { @ehmp.get_military_history_expanded_data_row(1, 5).eql?(last_modified_user) }
  rescue
    expect(@ehmp.get_military_history_expanded_data_row(1, 5)).to eq(last_modified_user)
  end
end

When(/^the user clicks on Detail view button for row "(.*?)"$/) do |t_row, table|
  @ehmp = PobAppletMilitaryApplet.new
  max_attempt = 5
  begin
    @ehmp.click_military_hist_data_row(t_row)
    @ehmp.wait_until_btn_detail_view_visible(DefaultTiming.default_table_row_load_time)
    expect(@ehmp.btn_detail_view.visible?).to eq(true)
    @ehmp.btn_detail_view.click
    @ehmp.wait_until_btn_military_history_detail_view_close_visible(DefaultTiming.default_table_row_load_time)
  rescue => e
    max_attempt-=1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
  table.rows.each do |field|
    p "Field: #{field[0]}"
    expect(@ehmp.mdl_detail_view_title.text(:visible)).to eq(field[0])
  end
end

Then(/^the user validates Detail view saved text is displayed for row "(.*?)"$/) do |t_row|
  @ehmp = PobAppletMilitaryApplet.new
  detail_view_text = @ehmp.mdl_detail_view_description.text
  @ehmp.wait_until_btn_military_history_detail_view_close_visible(DefaultTiming.default_table_row_load_time)
  expect(@ehmp.btn_military_history_dismiss_edit_view.visible?).to eq(true)
  expect(@ehmp.btn_military_history_detail_view_close.visible?).to eq(true)
  @ehmp.btn_military_history_detail_view_close.click
  expect(@ehmp.check_each_row_loaded(t_row)).to eq(true)
  description_saved = @ehmp.get_military_history_data_row("tbody", t_row , '2', 'td')
  expect(detail_view_text).to eq(description_saved)
end
