class CommunityHealthSummaryActions
  extend ::RSpec::Matchers
  def self.detail_view_loaded?
    max_atttempt = 2
    wait = Selenium::WebDriver::Wait.new(:timeout => 10)
    begin
      @ehmp = PobCommunityHealthApplet.new
      @ehmp.wait_for_fld_patient_identifier
      @ehmp.wait_for_btn_next
      @ehmp.wait_for_btn_previous
      @ehmp.wait_for_fld_patient_identifier
      @ehmp.wait_for_fld_details
      wait.until { !@ehmp.ccd_content_body.nil? }
      expect(@ehmp).to have_btn_next
      expect(@ehmp).to have_btn_previous
      expect(@ehmp).to have_fld_patient_identifier
      expect(@ehmp).to have_fld_details
    rescue Selenium::WebDriver::Error::StaleElementReferenceError => stale_ele
      max_atttempt -= 1
      raise stale_ele if max_atttempt < 0 
      p "StaleElementReferenceError, retry"
      retry
    end
  end

  def self.wait_for_detail_view_loaded?
    wait = Selenium::WebDriver::Wait.new(:timeout => 30)
    wait.until { detail_view_loaded? }
  end

  def self.click_and_load(temp_button, current_ccd_body)
    wait = Selenium::WebDriver::Wait.new(:timeout => 10)
    comm_health = PobCommunityHealthApplet.new

    temp_button.click
    wait.until { comm_health.ccd_content_body != current_ccd_body }
    wait_for_detail_view_loaded?
    comm_health.ccd_content_body
  end
end

Then(/^the Community Health Summary finishes loading$/) do
  comm_health = PobCommunityHealthApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(comm_health.has_fld_empty_row?, comm_health.tbl_data_rows) }
end

When(/^the Community Health Summary displays at least (\d+) rows$/) do |num_result|
  comm_health = PobCommunityHealthApplet.new
  expect(comm_health.tbl_data_rows.length).to be > 0, "minimum requirement is not met, need at least #{num_result} rows"
end

When(/^the user clicks the Community Health Summary Expand Button$/) do
  comm_health = PobCommunityHealthApplet.new
  expect(comm_health.wait_for_btn_applet_expand_view).to eq(true)
  comm_health.btn_applet_expand_view.click
end

Then(/^the Expanded Community Health Summary applet displays$/) do
  comm_health = PobCommunityHealthApplet.new
  expect(comm_health.menu.wait_for_fld_screen_name).to eq(true)
  expect(comm_health.menu.fld_screen_name.text.upcase).to eq('Community Health Summaries'.upcase)

end

When(/^the user clicks the Community Health Summary Minimize Button$/) do
  comm_health = PobCommunityHealthApplet.new
  expect(comm_health.wait_for_btn_applet_minimize).to eq(true)
  comm_health.btn_applet_minimize.click
end

Then(/^the user returns to the coversheet$/) do
  browser_access = CoverSheet.instance  
  expect(browser_access.wait_until_element_present("Cover Sheet Pill", 60)).to be_true  
  expect(browser_access.perform_verification("Cover Sheet Pill", "Coversheet")).to be_true
  expect(browser_access.wait_until_xpath_count("Number of Applets", 9)).to be_true
end

Then(/^the Community Health Summary View detail view displays$/) do
  CommunityHealthSummaryActions.detail_view_loaded?
end

When(/^the Community Health Summary Applet contains data rows$/) do
  compare_item_counts("[data-appletid=ccd_grid] table tr")
end

When(/^user refreshes Community Health Summary Applet$/) do
  applet_refresh_action("ccd_grid")
end

Then(/^the message on the Community Health Summary Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("ccd_grid", message_text)
end

Given(/^user navigates to expanded Community Health Summaries$/) do
  comm_health = PobCommunityHealthApplet.new
  comm_health.load
  wait = Selenium::WebDriver::Wait.new(:timeout => 30)
  wait.until { applet_grid_loaded(comm_health.has_fld_empty_row?, comm_health.tbl_data_rows) }
end

Then(/^the community health summary applet has headers$/) do |table|
  comm_health = PobCommunityHealthApplet.new
  num_headers = table.rows.length
  wait_until { comm_health.tbl_headers.length == num_headers }
  table.rows.each do | header_text |
    expect(object_exists_in_list(comm_health.tbl_headers, "#{header_text[0]}")).to eq(true), "#{header_text[0]} was not found on Community Health Summary Applet"
  end
end

Then(/^the community health summary applet filter is not visible$/) do
  comm_health = PobCommunityHealthApplet.new
  expect(comm_health).to_not have_fld_applet_text_filter
end

Then(/^the community health summary applet date column is in correct format MM\/dd\/YYYY$/) do
  comm_health = PobCommunityHealthApplet.new
  date_format = Regexp.new("\\d{2}\/\\d{2}\/\\d{4}")
  max_atttempt = 1
  begin
    date_fields = comm_health.date_column_text
    date_fields.each do | date_field |

      result = date_format.match(date_field)
      expect(result).to_not be_nil, "td #{date_field} was not in expected format"
    end
  rescue Selenium::WebDriver::Error::StaleElementReferenceError => stale_ele
    max_atttempt -= 1
    raise stale_ele if max_atttempt < 0 
    p "StaleElementReferenceError, retry"
    retry
  end
end

Then(/^the community health summary applet date column is in correct format MM\/dd\/YYYY \- HH:SS$/) do
  comm_health = PobCommunityHealthApplet.new
  date_format = Regexp.new("\\d{2}\/\\d{2}\/\\d{4} - \\d{2}:\\d{2}")
  max_atttempt = 1
  begin
    date_fields = comm_health.date_column_text
    date_fields.each do | date_field |

      result = date_format.match(date_field)
      expect(result).to_not be_nil, "td #{date_field} was not in expected format"
    end
  rescue Selenium::WebDriver::Error::StaleElementReferenceError => stale_ele
    max_atttempt -= 1
    raise stale_ele if max_atttempt < 0 
    p "StaleElementReferenceError, retry"
    retry
  end
end

When(/^the user sorts the community health summary applet by column Authoring Institution$/) do
  comm_health = PobCommunityHealthApplet.new
  expect(comm_health.wait_for_tbl_header_authoringinstitution).to eq(true)
  comm_health.tbl_header_authoringinstitution.click
end

Then(/^Authoring Institution column is sorted in ascending order in expanded Community Health Summaries$/) do
  comm_health = PobCommunityHealthApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  expect(comm_health.tbl_expanded_authoring_column.length).to be > 0
  begin
    wait.until { ascending? comm_health.tbl_expanded_authoring_column }
  ensure
    expect(ascending? comm_health.tbl_expanded_authoring_column).to eq(true)
  end
end

Then(/^Authoring Institution column is sorted in descending order in expanded Community Health Summaries$/) do
  comm_health = PobCommunityHealthApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  expect(comm_health.tbl_expanded_authoring_column.length).to be > 0
  begin
    wait.until { descending? comm_health.tbl_expanded_authoring_column }
  ensure
    expect(descending? comm_health.tbl_expanded_authoring_column).to eq(true)
  end
end

When(/^the user filters the community health summary applet by text "([^"]*)"$/) do |text|
  comm_health = PobCommunityHealthApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  row_count = comm_health.tbl_data_rows.length

  expect(comm_health.wait_for_btn_applet_filter_toggle).to eq(true), "Expected a filter button in the header"
  comm_health.btn_applet_filter_toggle.click unless comm_health.has_fld_applet_text_filter?
  expect(comm_health.wait_for_fld_applet_text_filter).to eq(true)
  comm_health.fld_applet_text_filter.set text
  wait.until { row_count != comm_health.tbl_data_rows.length }
end

Then(/^the community health summary table only diplays rows including text "([^"]*)"$/) do |input_text|
  comm_health = PobCommunityHealthApplet.new
  upper = input_text.upcase
  lower = input_text.downcase

  path =  "//div[contains(@class, 'gist-item-list')]/descendant::div[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::div[@data-code]"

  path = "//div[@data-appletid='ccd_grid']/descendant::tbody/descendant::td[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::tr"
  row_count = comm_health.tbl_data_rows.length
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

When(/^the user views the first expanded Community Health Summary detail view$/) do
  comm_health = PobCommunityHealthApplet.new
  expect(comm_health.tbl_expanded_authoring_column.length).to be > 0
  first_description = comm_health.tbl_expanded_description[0].text
  first_author = comm_health.tbl_expanded_authoring_column_text[0]

  @expected_chs_title = "#{first_description} - #{first_author}"
  comm_health.tbl_expanded_authoring_column[0].click
end

Then(/^the community health summary detail title is correct$/) do
  expect(@expected_chs_title).to_not be_nil, "Expected variable expected_chs_title to be set in a previous step"
  modal = ModalElements.new
  expect(modal.wait_for_fld_modal_title).to eq(true)
  expect(modal.fld_modal_title.text.upcase).to eq(@expected_chs_title.upcase)
end

Then(/^the community health summary detail view displays Next \/ Previous buttons$/) do
  comm_health = PobCommunityHealthApplet.new
  max_atttempt = 2
  begin
    comm_health.wait_for_btn_next
    comm_health.wait_for_btn_previous

    expect(comm_health).to have_btn_next
    expect(comm_health).to have_btn_previous
  rescue Selenium::WebDriver::Error::StaleElementReferenceError => stale_ele
    max_atttempt -= 1
    raise stale_ele if max_atttempt < 0 
    p "StaleElementReferenceError, retry"
    retry
  end
end

Then(/^the community health summary detail view displays patient name, birthdate, age, ssn$/) do
  comm_health = PobCommunityHealthApplet.new
  max_atttempt = 2
  begin
    comm_health.wait_for_fld_patient_identifier
    expect(comm_health).to have_fld_patient_identifier
    identifier_format = Regexp.new("\\w+,\\w+, \\d{2}\/\\d{2}\/\\d{4}, \\d+y, \\d{3}-\\d{2}-\\d{4}")
    identifier_text = comm_health.fld_patient_identifier.text
    result = identifier_format.match(identifier_text)
    expect(result).to_not be_nil, "'#{identifier_text}'' was not in expected format"
  rescue Selenium::WebDriver::Error::StaleElementReferenceError => stale_ele
    max_atttempt -= 1
    raise stale_ele if max_atttempt < 0 
    p "StaleElementReferenceError, retry"
    retry
  end
end

Given(/^the user notes the first (\d+) rows of the expanded Community Health Summary detail view$/) do |num_rows|
  comm_health = PobCommunityHealthApplet.new
  expect(comm_health.tbl_expanded_authoring_column.length).to be >= num_rows.to_i
  @expected_chs_titles = []
  for i in 0..num_rows.to_i - 1
    first_description = comm_health.tbl_expanded_description[i].text
    first_author = comm_health.tbl_expanded_authoring_column_text[i]
    @expected_chs_titles.push("#{first_description} - #{first_author}")
  end
  p @expected_chs_titles
end

Then(/^the user can step through the community health summaries using the next button$/) do
  expect(@expected_chs_titles).to_not be_nil, "Expected variable expected_chs_titles to have been set by a previous step"
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  modal = ModalElements.new
  comm_health = PobCommunityHealthApplet.new
  current_ccd_body = comm_health.ccd_content_body
  @expected_chs_titles.each_with_index do |modal_title, index|
    max_atttempt = 1
    begin
      expect(modal.fld_modal_title.text.upcase).to eq(modal_title.upcase)
    rescue Selenium::WebDriver::Error::StaleElementReferenceError => stale_ele
      max_atttempt -= 1
      raise stale_ele if max_atttempt < 0 
      p "StaleElementReferenceError, retry"
      retry
    rescue => other_err
      p "#{other_err}"
      p "#{modal.fld_modal_title.text.upcase} #{modal_title.upcase}"
      fail other_err
    end
    p "click next"
    current_ccd_body = CommunityHealthSummaryActions.click_and_load comm_health.btn_next, current_ccd_body
  end
end

Then(/^the user can step through the community health summaries using the previous button$/) do
  expect(@expected_chs_titles).to_not be_nil, "Expected variable expected_chs_titles to have been set by a previous step"
  wait = Selenium::WebDriver::Wait.new(:timeout => 10)
  modal = ModalElements.new
  comm_health = PobCommunityHealthApplet.new

  expect(comm_health.wait_for_btn_previous).to eq(true)

  current_ccd_body = current_ccd_body = CommunityHealthSummaryActions.click_and_load comm_health.btn_previous, comm_health.ccd_content_body
  @expected_chs_titles.reverse.each_with_index { |modal_title, index| 
    begin
      expect(modal.fld_modal_title.text.upcase).to eq(modal_title.upcase)
    rescue Selenium::WebDriver::Error::StaleElementReferenceError => stale_ele
      max_atttempt -= 1
      raise stale_ele if max_atttempt < 0 
      p "StaleElementReferenceError, retry"
      retry
    rescue => other_err
      p "#{other_err}"
      p "#{modal.fld_modal_title.text.upcase} #{modal_title.upcase}"
      fail other_err
    end
    p "click previous #{index}"
    current_ccd_body = CommunityHealthSummaryActions.click_and_load comm_health.btn_previous, current_ccd_body unless index == @expected_chs_titles.length - 1
  }
end

Then(/^Authoring Institution column is sorted in ascending order in summary Community Health Summaries$/) do
  comm_health = PobCommunityHealthApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)

  expect(comm_health.tbl_summary_authoring_column.length).to be > 0
  begin
    wait.until { ascending? comm_health.tbl_summary_authoring_column }
  ensure
    expect(ascending? comm_health.tbl_summary_authoring_column).to eq(true)
  end
end

Then(/^Authoring Institution column is sorted in descending order in summary Community Health Summaries$/) do
  comm_health = PobCommunityHealthApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_wait_time)
  expect(comm_health.tbl_summary_authoring_column.length).to be > 0
  begin
    wait.until { descending? comm_health.tbl_summary_authoring_column }
  ensure
    expect(descending? comm_health.tbl_summary_authoring_column).to eq(true)
  end
end

When(/^the user views the first summary Community Health Summary detail view$/) do
  comm_health = PobCommunityHealthApplet.new
  expect(comm_health.tbl_summary_authoring_column.length).to be > 0
  first_author = comm_health.tbl_summary_authoring_column_text[0]

  @expected_chs_title = "- #{first_author}"
  comm_health.tbl_summary_authoring_column[0].click
end

Then(/^the summary community health summary detail title is correct$/) do
  expect(@expected_chs_title).to_not be_nil, "Expected variable expected_chs_title to be set in a previous step"
  modal = ModalElements.new
  expect(modal.wait_for_fld_modal_title).to eq(true)
  title_format = Regexp.new("\\w+ #{@expected_chs_title.upcase}")
  result = title_format.match(modal.fld_modal_title.text.upcase)
  expect(result).to_not be_nil, "title #{modal.fld_modal_title.text.upcase} was not in expected format"
end

When(/^user hovers over the CommunityHealthSummaries applet row$/) do
  ehmp = PobCommunityHealthApplet.new
  ehmp.wait_for_tbl_data_rows
  expect(ehmp).to have_tbl_data_rows
  rows = ehmp.tbl_data_rows
  expect(rows.length).to be > 0
  rows[0].hover
end

Given(/^user can view the Quick Menu Icon in CommunityHealthSummaries applet$/) do
  ehmp = PobCommunityHealthApplet.new
  QuickMenuActions.verify_quick_menu ehmp
end

Given(/^Quick Menu Icon is collapsed in CommunityHealthSummaries applet$/) do
  ehmp = PobCommunityHealthApplet.new
  QuickMenuActions.verify_quick_menu_collapsed ehmp
end

When(/^Quick Menu Icon is selected in CommunityHealthSummaries applet$/) do
  ehmp = PobCommunityHealthApplet.new
  QuickMenuActions.select_quick_menu ehmp
end

Then(/^user can see the options in the CommunityHealthSummaries applet$/) do |table|
  ehmp = PobCommunityHealthApplet.new
  QuickMenuActions.verify_menu_options ehmp, table
end

When(/^user selects the detail view from Quick Menu Icon of CommunityHealthSummaries applet$/) do
  ehmp = PobCommunityHealthApplet.new
  QuickMenuActions.open_menu_click_detail_button ehmp
end

