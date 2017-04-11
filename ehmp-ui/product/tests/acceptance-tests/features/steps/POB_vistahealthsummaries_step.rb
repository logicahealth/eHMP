When(/^the user navigates to the Vista Health Summary applet$/) do
  @ehmp = PobVistaHealthSummariesApplet.new
  @ehmp.load
  expect(@ehmp).to be_displayed
  @ehmp.wait_until_applet_loaded 
end

Then(/^the Vista Health Summary expanded applet is displayed$/) do
  @ehmp = PobVistaHealthSummariesApplet.new
  @ehmp.wait_until_applet_loaded 
end

Then(/^the Vista Health Summary displays a list of VistA sites$/) do
  @ehmp = PobVistaHealthSummariesApplet.new
  expect(@ehmp.fld_group_rows.length).to be > 0
end

Then(/^the user's primary vista site "(.*?)" is listed first$/) do |label|
  @ehmp = PobVistaHealthSummariesApplet.new
  expect(@ehmp.fld_group_labels[0]).to include(label)
end

Then(/^the reports listed under each vista are in alphabetical order$/) do | table |
  @ehmp = PobVistaHealthSummariesApplet.new
  # get groups
  # loop
   # click group to open rows
   # get rows that have td[1] of group name
   # check alphabetic
  # end loop

  #labels = @ehmp.fld_group_labels
  #expanders = @ehmp.fld_group_expand
  #expect(labels.length).to eq(expanders.length), "The number of VistA labels does not match the number of VistA groups"

  #(0..labels.length-1).each do |i|
  table.rows.each do | label |
    @ehmp.btn_vista_site(label[0])
    expect(@ehmp).to have_btn_facility
    @ehmp.btn_facility.click
    labeled_rows = @ehmp.rows_for_label(label[0])
    expect(@ehmp.td_text_in_alpha_order(labeled_rows)).to eq(true), "Reports listed under #{label[0]} are not in alpha order"
  end
end

When(/^the user sorts the vista summary reports applet by column Report$/) do 
  @ehmp = PobVistaHealthSummariesApplet.new
  expect(@ehmp.has_fld_header_report?).to eq(true)
  @ehmp.fld_header_report.click
end

Then(/^the vista summary reports applet sorts the reports in alphabetical order$/) do
  @ehmp = PobVistaHealthSummariesApplet.new
  labels = @ehmp.fld_group_labels_text
  expect(labels.length).to be > 2, "prerequisite was not met, need at least 2 elements to compare alphabetical order"
  expect(@ehmp.text_in_alpha_order_after_remote(labels)).to eq(true), "Report Groups are not in alpha order"
end

Then(/^the user counts the number of reports listed for the first group$/) do
  @ehmp = PobVistaHealthSummariesApplet.new
  labels = @ehmp.fld_group_labels
  @badge_count_label = labels[0]
  @num_reports_under_group = @ehmp.rows_for_label(@badge_count_label).length
end

Then(/^the vista summary reports applet displays the correct count for the group "([^"]*)"$/) do |badge_count_label|
  @ehmp = PobVistaHealthSummariesApplet.new
  
  @ehmp.group_count_badge(badge_count_label)
  @ehmp.wait_until_fld_badge_count_visible
  expect(@ehmp.fld_badge_count.text).to eq(@num_reports_under_group.to_s), "Badge count #{@ehmp.fld_badge_count.text}, number of rows #{@num_reports_under_group.to_s}"
end

When(/^user refreshes Vista Health Summary Applet$/) do
  @ehmp = PobVistaHealthSummariesApplet.new
  @num_groups_displayed = @ehmp.fld_group_rows.length
  @ehmp.btn_applet_refresh.click
end

Then(/^the message on the Vista Health Summary Applet does not say "(.*?)"$/) do |arg1|
  @ehmp = PobVistaHealthSummariesApplet.new
  @ehmp.wait_until_applet_loaded 
  expect(@ehmp.has_fld_error_msg?).to eq(false)
end

When(/^the user expands vista site "([^"]*)"$/) do |facility|
  @ehmp = PobVistaHealthSummariesApplet.new unless @ehmp.is_a? PobVistaHealthSummariesApplet
  @ehmp.btn_vista_site(facility)
  expect(@ehmp).to have_btn_facility
  @ehmp.btn_facility.click
end

Then(/^the user counts the number of reports listed for vista site "([^"]*)"$/) do |facility|
  @ehmp = PobVistaHealthSummariesApplet.new

  @num_reports_under_group = @ehmp.rows_for_label(facility).length
  p @num_reports_under_group
end

When(/^the user minimizes vista site "([^"]*)"$/) do |facility|
  @ehmp = PobVistaHealthSummariesApplet.new unless @ehmp.is_a? PobVistaHealthSummariesApplet
  @ehmp.btn_vista_site(facility)
  expect(@ehmp).to have_btn_facility
  @ehmp.btn_facility.click
end
