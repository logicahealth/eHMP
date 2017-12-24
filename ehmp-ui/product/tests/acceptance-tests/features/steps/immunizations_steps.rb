#F144_ImmunizationsApplet.feature 
#Team Neptune 

class ImmunizationsCoverSheet < AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super 
    @appletid='immunizations'
    appletid_css = "[data-appletid=#{@appletid}]"
    add_verify(CucumberLabel.new("Vaccine Name"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid="immunizations"] [data-header-instanceid="immunizations-name"]'))
    add_verify(CucumberLabel.new("Reaction"), VerifyText.new, AccessHtmlElement.new(:id, "immunizations-reactionName"))
    add_verify(CucumberLabel.new("Date"), VerifyText.new, AccessHtmlElement.new(:id, "immunizations-administeredFormatted"))
    add_verify(CucumberLabel.new("Facility"), VerifyText.new, AccessHtmlElement.new(:id, "immunizations-facilityMoniker"))

    add_verify(CucumberLabel.new('Screenname'), VerifyText.new, AccessHtmlElement.new(:id, 'screenName'))

    add_verify(CucumberLabel.new("Empty Record"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#{appletid_css} tr.empty"))

    add_applet_buttons appletid_css
    add_applet_title appletid_css
    add_applet_add_button appletid_css
    add_toolbar_buttons

    rows = AccessHtmlElement.new(:css, '[data-appletid="immunizations"] tbody tr.selectable')
    add_verify(CucumberLabel.new('Rows - Immunizations Applet'), VerifyXpathCount.new(rows), rows)
    add_action(CucumberLabel.new('first row'), ClickAction.new, AccessHtmlElement.new(:css, '[data-appletid="immunizations"] tbody tr.selectable:nth-child(1)'))

    # Headers for sorting
    add_action(CucumberLabel.new("Vaccine Name Header"), ClickAction.new, AccessHtmlElement.new(:css, '[data-appletid="immunizations"] [data-header-instanceid="immunizations-name"] a'))
    add_action(CucumberLabel.new("Facility Header"), ClickAction.new, AccessHtmlElement.new(:css, '[data-appletid="immunizations"] [data-header-instanceid="immunizations-facilityName"] a'))

    add_action(CucumberLabel.new('Applet Toolbar Detail'), ClickAction.new, AccessHtmlElement.new(:css, '#info-button-template #info-button-sidekick-detailView'))
    add_action(CucumberLabel.new('Add'), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-add-button"))
  end

  def applet_loaded?
    return true if am_i_visible? 'Empty Record'
    return get_elements("Rows - Immunizations Applet").size > 0
  rescue => e 
    # p e
    false
  end
end #ImmunizationsCoverSheet

Then(/^the Immunizations applet displays$/) do
  imm_coversheet = ImmunizationsCoverSheet.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { imm_coversheet.applet_loaded? }
  wait.until { infiniate_scroll('[data-appletid=immunizations] tbody') }
end

Then(/^the Immunizations grid is sorted in alphabetic order based on Vaccine Name$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { VerifyTableValue.verify_alphabetic_sort_caseinsensitive_gist('[data-appletid=immunizations] table tbody td:nth-child(1)', true) }
end

When(/^the user sorts the Immunizations grid by "([^"]*)"$/) do |arg1|
  imm_coversheet = ImmunizationsCoverSheet.instance
  label = "#{arg1} Header"
  expect(imm_coversheet.perform_action(label)).to eq(true)
end

Then(/^the Immunizations grid is sorted in alphabetic order based on Facility$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { VerifyTableValue.verify_alphabetic_sort_caseinsensitive_gist('[data-appletid=immunizations] table tbody td:nth-child(5)', true) }
end

Then(/^the user filters the Immunizations Applet by text "([^"]*)"$/) do |input_text|
  imm_coversheet = ImmunizationsCoverSheet.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { imm_coversheet.applet_loaded? }
  expect(imm_coversheet.am_i_visible? 'Control - Applet - Text Filter').to eq(true)
  sleep 2 # deliberate addition of sleep
  row_count = imm_coversheet.get_elements("Rows - Immunizations Applet").size
  expect(imm_coversheet.perform_action('Control - Applet - Text Filter', input_text)).to eq(true)
  wait.until { row_count != imm_coversheet.get_elements("Rows - Immunizations Applet").size }
end

Then(/^the immunizations table only diplays rows including text "([^"]*)"$/) do |input_text|
  imm_coversheet = ImmunizationsCoverSheet.instance
  upper = input_text.upcase
  lower = input_text.downcase

  path =  "//div[@data-appletid='immunizations']//table/descendant::td[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::tr"

  row_count = imm_coversheet.get_elements("Rows - Immunizations Applet").size 
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

When(/^the user clicks the Immunizations Expand Button$/) do
  applet = PobImmunizationsApplet.new
  applet.wait_for_btn_applet_expand_view
  expect(applet).to have_btn_applet_expand_view
  applet.btn_applet_expand_view.click
end

When(/^the user is viewing the Immunizations expanded view$/) do
  imm_coversheet = ImmunizationsCoverSheet.instance
  expect(imm_coversheet.perform_verification('Screenname', 'Immunizations')).to eq(true)
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { imm_coversheet.applet_loaded? }
end

Given(/^the immunization applet displays at least (\d+) immunization$/) do |num_result|
  imm_coversheet = ImmunizationsCoverSheet.instance
  expect(imm_coversheet.wait_until_xpath_count_greater_than('Rows - Immunizations Applet', num_result.to_i)).to eq(true), "Test requires at least one result to verify functionality"
end

When(/^the user views the details for the first immunization$/) do  
  ehmp = PobImmunizationsApplet.new
  ehmp.wait_for_tbl_immunization_first_row_columns
  ehmp.wait_for_tbl_immunization_grid
  expect(ehmp.tbl_immunization_grid.length).to be > 0
  ehmp.tbl_immunization_grid[0].click
  @first_imm_title = ehmp.tbl_immunization_first_row_columns[1].text
end

Then(/^the modal's title displays the immunization name$/) do
  title = "#{@first_imm_title}"
  modal = ImmunizationDetail.new
  modal.wait_for_fld_modal_title
  expect(modal).to have_fld_modal_title
  expect(modal.fld_modal_title.text.upcase).to end_with(title.upcase)
end

Then(/^the Immunization Detail modal displays$/) do 
  modal = ImmunizationDetail.new
  expect(modal).to be_all_there
end

Then(/^the Immunization Applet contains data rows$/) do
  compare_item_counts("[data-appletid=immunizations] .data-grid table tr")
end

When(/^user refreshes Immunization Applet$/) do
  applet_refresh_action("immunizations")
end

Then(/^the message on the Immunization Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("immunizations", message_text)
end

Then(/^the user can step through the immunizations using the next button$/) do
  @ehmp = PobImmunizationsApplet.new
  @titles.each do |modal_title|
    expect(@uc.perform_verification("Modal Title", modal_title)).to eq(true), "Expected title to be #{modal_title}"
    @ehmp.btn_next.click
  end
end

Then(/^the user can step through the immunizations using the previous button$/) do
  @ehmp = PobImmunizationsApplet.new
  @ehmp.btn_previous.click
  @titles.reverse.each { |val| 
    expect(@uc.perform_verification("Modal Title", val)).to eq(true), "Expected title to be #{val}"
    @ehmp.btn_previous.click
  }
end

Given(/^the user notes the first (\d+) immunizations$/) do |num_immunizations|
  @ehmp = PobImmunizationsApplet.new
  @titles = @ehmp.summary_immunization_names num_immunizations.to_i
  expect(@titles.length).to be > num_immunizations.to_i
  @titles = @titles[0..num_immunizations.to_i - 1]
end

Then(/^the Immunization Expanded applet table contains headers$/) do |table|
  @ehmp = PobImmunizationsApplet.new
  existing_headers = @ehmp.immunization_table_headers
  table.rows.each do | header_text |
    expect(existing_headers).to include header_text[0]
  end
end

Then(/^the Immunization Detail modal displays disabled previous button$/) do
  modal = ImmunizationDetail.new
  modal.wait_for_btn_previous
  expect(modal).to have_btn_previous
  expect(modal.btn_previous['disabled']).to_not be_nil
end

Then(/^the Immunizations applet contains an Add button$/) do
  applet = PobImmunizationsApplet.new
  applet.wait_for_btn_applet_add
  expect(applet).to have_btn_applet_add
end
