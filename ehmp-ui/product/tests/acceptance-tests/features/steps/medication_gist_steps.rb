class ActiveMedGistActions
  def self.unique_search_term
    gist = PobActiveRecentMedApplet.new
    full_medication_name_text = gist.fld_gist_med_names.map { |element| element.text }
    # p full_medication_name_text

    what_now = full_medication_name_text.map { |element| element.split(' ') }
    set_possible_search_terms = Set.new(what_now.flatten)
    full_row_count = gist.fld_active_meds_gist.length
    set_possible_search_terms.each do | temp_search |
      temp_rows = gist.gist_rows_with_text temp_search
      # p "#{temp_search}: #{temp_rows.length}"
      return temp_search if temp_rows.length < full_row_count && temp_rows.length > 0
    end
    last_resort_filter = 'norecordfilter'
    p "was not able to find a unique search term, using #{last_resort_filter}"
    last_resort_filter
  end
end

Then(/^the Active Medication modal is displayed$/) do
  modal = ActiveRecentMedModal.new
  expect(modal.wait_for_fld_modal_title).to eq(true)
  expect(modal.fld_modal_title.text.upcase).to start_with 'Medication'.upcase

  expect(modal).to have_btn_next
  expect(modal).to have_btn_previous
  expect(modal).to have_btn_modal_close

  expect(modal).to have_fld_order_history_label
  expect(modal).to have_fld_med_detail
  expect(modal).to have_fld_med_review_banner # US18298
end

Then(/^the Active & Recent MEDICATIONS gist is displayed$/) do 
  applet = PobActiveRecentMedApplet.new
  expect(applet.wait_for_fld_applet_title).to eq(true), "Expected applet to have a title"
  expect(applet.fld_applet_title.text.upcase).to eq('ACTIVE & RECENT MEDICATIONS')
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet.applet_gist_loaded? }
end

Then(/^the Medications Gist overview table contains headers$/) do |table|
  applet = PobActiveRecentMedApplet.new
  gist_headers = applet.gist_headers_text
  p gist_headers
  table.rows.each do | row |
    expect(gist_headers).to include row[0]
  end
end

Then(/^the Medications Gist Applet displays results$/) do
  applet = PobActiveRecentMedApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)

  wait.until { applet.applet_gist_loaded? }
  expect(applet.fld_active_meds_gist.length).to be > 0
end

Given(/^the filter section is visible in the medication gist applet$/) do
  applet = PobActiveRecentMedApplet.new
  expect(applet).to have_btn_applet_filter_toggle
  applet.btn_applet_filter_toggle.click unless applet.has_fld_applet_text_filter?
  expect(applet.wait_for_fld_applet_text_filter).to eq(true), "Expected Filter input to display"
end

Then(/^the Medications Gist table only diplays rows including text$/) do
  expect(@activemed_search_term).to_not be_nil, "expected variable activemed_search_term to have been set by a previous step"
  @ehmp = PobActiveRecentMedApplet.new
  row_count = @ehmp.fld_active_meds_gist.length 
  rows_containing_filter_text = @ehmp.gist_rows_with_text(@activemed_search_term).length
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

When(/^the user filters the Medications Gist Applet by text$/) do 
  @activemed_search_term = ActiveMedGistActions.unique_search_term
  p "Filtering on term: #{@activemed_search_term}"

  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  @ehmp = PobActiveRecentMedApplet.new
  row_count = @ehmp.fld_active_meds_gist.length
  p "before filter: #{row_count}"

  expect(@ehmp.wait_for_fld_applet_text_filter).to eq(true), "Expected applet to display a filter text input"
  @ehmp.fld_applet_text_filter.set @activemed_search_term
  @ehmp.fld_applet_text_filter.native.send_keys :enter

  wait.until { row_count != @ehmp.fld_active_meds_gist.length }
  p "After filtering, result count is #{@ehmp.fld_active_meds_gist.length }"
end

Then(/^the medication gist view displays at least (\d+) result$/) do |num_result|
  applet = PobActiveRecentMedApplet.new
  expect(applet.fld_active_meds_gist.length).to be > num_result.to_i
end

Then(/^the Medications Gist Applet contains buttons Refresh, Help, Filter Toggle, Expand$/) do
  ehmp = PobActiveRecentMedApplet.new
  ehmp.wait_for_btn_applet_refresh
  ehmp.wait_for_btn_applet_help
  ehmp.wait_for_btn_applet_filter_toggle
  ehmp.wait_for_btn_applet_expand_view

  expect(ehmp).to have_btn_applet_refresh
  expect(ehmp).to have_btn_applet_help
  expect(ehmp).to have_btn_applet_filter_toggle
  expect(ehmp).to have_btn_applet_expand_view
end

When(/^the user expands the Active & Recent MEDICATIONS$/) do
  applet = PobActiveRecentMedApplet.new
  expect(applet).to have_btn_applet_expand_view
  applet.btn_applet_expand_view.click
  applet = PobMedsReview.new
  expect(applet.wait_for_btn_applet_minimize).to eq(true), "Expected expanded applet to display a minimize button"
end
