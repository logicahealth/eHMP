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

    rows = AccessHtmlElement.new(:css, '#data-grid-immunizations tbody tr.selectable')
    add_verify(CucumberLabel.new('Rows - Immunizations Applet'), VerifyXpathCount.new(rows), rows)
    add_action(CucumberLabel.new('first row'), ClickAction.new, AccessHtmlElement.new(:css, '#data-grid-immunizations tbody tr.selectable:nth-child(1)'))

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

class ImmunizationsDetailModal < ADKContainer
  include Singleton
  def initialize
    super 
    add_verify(CucumberLabel.new('Name Label'), VerifyText.new, AccessHtmlElement.new(:xpath, "//h5[string() = 'Name']"))
    add_verify(CucumberLabel.new('Name'), VerifyText.new, AccessHtmlElement.new(:xpath, "//h5[string() = 'Name']/following-sibling::p"))

    add_verify(CucumberLabel.new('Series Label'), VerifyText.new, AccessHtmlElement.new(:xpath, "//h5[string() = 'Series']"))
    add_verify(CucumberLabel.new('Series'), VerifyText.new, AccessHtmlElement.new(:xpath, "//h5[string() = 'Series']/following-sibling::p"))

    add_verify(CucumberLabel.new('Date Administered Label'), VerifyText.new, AccessHtmlElement.new(:xpath, "//h5[string() = 'Date Administered']"))
    add_verify(CucumberLabel.new('Date Administered'), VerifyText.new, AccessHtmlElement.new(:xpath, "//h5[string() = 'Date Administered']/following-sibling::p"))

    add_action(CucumberLabel.new('next button'), ClickAction.new, AccessHtmlElement.new(:id, 'immunizationsNext'))
    add_action(CucumberLabel.new('previous button'), ClickAction.new, AccessHtmlElement.new(:id, 'immunizationsPrevious'))
    add_action(CucumberLabel.new('close button'), ClickAction.new, AccessHtmlElement.new(:id, 'modal-close-button'))
  end
end

class Immunizationsexpanded < AccessBrowserV2
  include Singleton
  def initialize
    super 
    add_verify(CucumberLabel.new("Vaccine Name"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid="immunizations"] [data-header-instanceid="immunizations-name"]'))
    add_verify(CucumberLabel.new("Standardized Name"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid="immunizations"] [data-header-instanceid="immunizations-standardizedName"]'))
    add_verify(CucumberLabel.new("Reaction"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid="immunizations"] [data-header-instanceid="immunizations-reactionName"]'))
    add_verify(CucumberLabel.new("Date"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid="immunizations"] [data-header-instanceid="immunizations-administeredFormatted"]'))
    add_verify(CucumberLabel.new("Series"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid="immunizations"] [data-header-instanceid="immunizations-seriesName"]'))
    add_verify(CucumberLabel.new("Repeat Contraindicated"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid="immunizations"] [data-header-instanceid="immunizations-contraindicatedDisplay"]'))
    add_verify(CucumberLabel.new("Facility"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid="immunizations"] [data-header-instanceid="immunizations-facilityMoniker"]'))
    add_verify(CucumberLabel.new("Comments"), VerifyText.new, AccessHtmlElement.new(:css, '[data-appletid="immunizations"] [data-header-instanceid="immunizations-"]'))
  end
end #Immunizationsexpanded

#Find Immunizations Coversheet Headers 
Then(/^the immunizations coversheet table contains headers$/) do |table|
  verify_immunizations_primary_table_headers(ImmunizationsCoverSheet.instance, table)
end

#Find Immunizations expanded Headers 
Then(/^the immunizations expanded table contains headers$/) do |table|
  verify_immunizations_primary_table_headers(Immunizationsexpanded.instance, table)
end

#Find rows in the Immunizations Coversheet
Then(/^the immunizations table contains rows$/) do |table|
  driver = TestSupport.driver
  num_of_rows = driver.find_elements(:css, "#data-grid-immunizations>tbody>tr")
  #Loop through rows in cucumber   
  table.rows.each do |row_defined_in_cucumber|
    matched = false
    p "Checking new row"
    #Loop through UI rows
    for i in 1..num_of_rows.length
      row_data = driver.find_elements(:xpath, ".//*[@id='data-grid-immunizations']/tbody/tr[#{i}]/td")     
      
      if row_defined_in_cucumber.length != row_data.length
        matched = false
        p "The number of columns in the UI is #{row_data.length} but in cucumber it's #{row_defined_in_cucumber.length}"
      else 
        matched = avoid_block_nesting(row_defined_in_cucumber, row_data)            
      end         
      if matched
        break 
      end
    end # for loop  
    p "#{matched}"
    p "could not match data: #{row_defined_in_cucumber}" unless matched  
    driver.save_screenshot("incorrect_rows.png") unless matched
    expect(matched).to be_true
  end #do loop  
end #Problems coversheet

#Check the number of pages
Then(/^the Immunizations coversheet contains (\d+) pages$/) do |num_pages|
  driver = TestSupport.driver 
  pages_data = driver.find_elements(:css, "#left3 .backgrid-paginator ul li")
  pages = pages_data.length - 2
  matched = false   
  if pages == num_pages.to_i
    matched = true 
  else
    matched = false
  end  
  p "The UI has #{pages} pa when the test believes it should have #{num_pages} rows" unless matched
  p "#{matched}" unless matched
  expect(matched).to be_true
end 

def verify_immunizations_primary_table_headers(access_browser_instance, table)
  driver = TestSupport.driver
  headers = driver.find_elements(:css, "#data-grid-immunizations th") 
  expect(headers.length).to_not eq(0)
  expect(headers.length).to eq(table.rows.length)
  elements = access_browser_instance
  table.rows.each do |header_text|
    does_exist = elements.static_dom_element_exists? header_text[0]
    p "#{header_text[0]} was not found" unless does_exist
    expect(does_exist).to be_true
  end #table
end #verify_table_headers2

Then(/^the Immunizations applet displays$/) do
  imm_coversheet = ImmunizationsCoverSheet.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { imm_coversheet.applet_loaded? }
  wait.until { infiniate_scroll('#data-grid-immunizations tbody') }
end

Then(/^the Immunizations applet title is "([^"]*)"$/) do |arg1|
  imm_coversheet = ImmunizationsCoverSheet.instance
  expect(imm_coversheet.perform_verification('Title', arg1)).to eq(true), "Expected title of #{arg1}"
end

Then(/^the Immunizations applet contains butons$/) do |table|
  imm_coversheet = ImmunizationsCoverSheet.instance
  table.rows.each do | button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(imm_coversheet.am_i_visible? cucumber_label).to eq(true), "Could not find button #{button[0]}"
  end
end

Then(/^the immunizations applet finishes loading$/) do
  imm_coversheet = ImmunizationsCoverSheet.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { imm_coversheet.applet_loaded? }
end

Then(/^the Immunizations grid is sorted in alphabetic order based on Vaccine Name$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { VerifyTableValue.verify_alphabetic_sort_caseinsensitive('data-grid-immunizations', 1, true) }
end

When(/^the user sorts the Immunizations grid by "([^"]*)"$/) do |arg1|
  imm_coversheet = ImmunizationsCoverSheet.instance
  label = "#{arg1} Header"
  expect(imm_coversheet.perform_action(label)).to eq(true)
end

Then(/^the Immunizations grid is sorted in alphabetic order based on Facility$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until { VerifyTableValue.verify_alphabetic_sort_caseinsensitive('data-grid-immunizations', 4, true) }
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

  path =  "//table[@id='data-grid-immunizations']/descendant::td[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]/ancestor::tr"

  row_count = imm_coversheet.get_elements("Rows - Immunizations Applet").size 
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} rows contain the filter text but #{row_count} rows are visible"
end

When(/^the user clicks the Immunizations Expand Button$/) do
  imm_coversheet = ImmunizationsCoverSheet.instance
  expect(imm_coversheet.perform_action('Control - Applet - Expand View')).to eq(true)
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
  imm_coversheet = ImmunizationsCoverSheet.instance
  first_element = TestSupport.driver.find_elements(:css, "#data-grid-immunizations tbody tr.selectable:nth-child(1) td")[0]
  # remove screen reader text
  first_element_text = first_element.text.sub('Press enter to open the toolbar menu.', '')
  p first_element_text
  # remove newline
  first_element_text = first_element_text[1, first_element_text.length-1]
  p first_element_text

  max_attempt = 4
  begin
    p "Attempt Count-------#{max_attempt}"
    @first_imm_title = first_element_text
    expect(imm_coversheet.perform_action('first row')).to eq(true)
    expect(imm_coversheet.perform_action('Detail View Button')).to eq(true)
  rescue => e
    p e
    max_attempt -= 1
    retry if max_attempt > 0
    raise e if max_attempt <= 0
  end
end

Then(/^the modal's title displays "(.*?)" and immunization name$/) do |arg1|
  title = "#{arg1} - #{@first_imm_title}"
  expect(ModalTest.instance.perform_verification("ModalTitle", title)).to be_true
end

Then(/^the modal's title displays the immunization name$/) do
  title = "#{@first_imm_title}"
  expect(ModalTest.instance.perform_verification("ModalTitle", title)).to be_true
end

Then(/^the Immunization Detail modal displays$/) do |table|
  modal = ImmunizationsDetailModal.instance
  table.rows.each do | row |
    expect(modal.am_i_visible? row[0]).to eq(true), "#{row[0]} was not visible"
  end
end

When(/^the user refreshes the immunization applet$/) do
  imm_coversheet = ImmunizationsCoverSheet.instance
  expect(imm_coversheet.perform_action('Control - Applet - Refresh')).to eq(true)
end

Then(/^the Immunization Applet contains data rows$/) do
  compare_item_counts("#data-grid-immunizations tr")
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
