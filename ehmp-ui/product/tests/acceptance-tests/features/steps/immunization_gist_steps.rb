class ImmunizationGist <  AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super
    @appletid = 'immunizations'
    appletid_css ="[data-appletid=#{@appletid}]"
    add_action(CucumberLabel.new("PNEUMOCOCCAL"), ClickAction.new, AccessHtmlElement.new(:css, "[data-infobutton=PNEUMOCOCCAL]"))
    add_verify(CucumberLabel.new("ImmunizationGridVisible"), VerifyText.new, AccessHtmlElement.new(:id, "immunizations-pill-gist-items"))
    add_verify(CucumberLabel.new("Immunization Details"), VerifyContainsText.new, AccessHtmlElement.new(:id, 'immunizations-pill-gist-items'))
    
    add_applet_buttons appletid_css
    add_applet_title appletid_css
    add_applet_add_button appletid_css
    add_toolbar_buttons

    add_verify(CucumberLabel.new("Immunization Gist Tooltip"), VerifyContainsText.new, AccessHtmlElement.new(:id, "urn:va:immunization:9E7A:301:37"))
    gist_view_count = AccessHtmlElement.new(:xpath, "//*[@id='immunizations-pill-gist-items']/descendant::div[contains(@class, 'immunGist')]")
    add_verify(CucumberLabel.new('Immunization gist view count'), VerifyXpathCount.new(gist_view_count), gist_view_count)
    add_verify(CucumberLabel.new("Empty Gist"), VerifyText.new, AccessHtmlElement.new(:css, "#{appletid_css} div.empty-gist-list"))

    add_action(CucumberLabel.new('Add'), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-add-button"))

    header_css = "[id^='urn:va:immunization:'] thead th"
    add_verify(CucumberLabel.new('Quickview header Date'), VerifyText.new, AccessHtmlElement.new(:css, "#{header_css}:nth-child(1)"))
    add_verify(CucumberLabel.new('Quickview header Series'), VerifyText.new, AccessHtmlElement.new(:css, "#{header_css}:nth-child(2)"))
    add_verify(CucumberLabel.new('Quickview header Reaction'), VerifyText.new, AccessHtmlElement.new(:css, "#{header_css}:nth-child(3)"))
    add_verify(CucumberLabel.new('Quickview header Since'), VerifyText.new, AccessHtmlElement.new(:css, "#{header_css}:nth-child(4)"))
  end

  def pill_count
    return TestSupport.driver.find_elements(:css, "[data-appletid='immunizations'] div.gist-item").length
  end

  def applet_loaded?
    return true if am_i_visible? 'Empty Gist'
    return TestSupport.driver.find_elements(:css, '[data-appletid=immunizations] .grid-container [data-infobutton-class=info-button-pill]').length > 0
  rescue => e 
    # p e
    false
  end
end 

When(/^the Immunization Gist Hover Table table contains headers$/) do |table|
  elements = ImmunizationGist.instance
  table.headers.each do | header |
    expect(elements.perform_verification("Quickview header #{header}", header)).to eq(true)
  end
end

When(/^the Immunization Gist Hover Table table contains rows$/) do
  driver = TestSupport.driver
  css = "[id^='urn:va:immunization:'] tbody tr"
  rows = driver.find_elements(:css, css)
  expect(rows.length).to be > 0
  rows = driver.find_elements(:css, "#{css} td:nth-child(1)")
  date_format = Regexp.new("\\d{2}\/\\d{2}\/\\d{4}")
  rows.each do | row |
    # p row.text
    expect(( date_format.match(text)).nil?).to eq(false), "#{row.text} does not match expected data format"
  end
  rows = driver.find_elements(:css, "#{css} td:nth-child(4)")
  age_format = Regexp.new("\\d+y")
  rows.each do | row |
    # p row.text
    expect(( age_format.match(text)).nil?).to eq(false), "#{row.text} does not match expected data format"
  end
end

Then(/^user sees Immunizations Gist$/) do
  aa = ImmunizationGist.instance
  expect(aa.wait_until_action_element_visible("Title", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_verification("Title", "IMMUNIZATIONS")).to be_true
end

Then(/^the immunization gist view has the following information$/) do |table|
  aa = ImmunizationGist.instance
  age_format = Regexp.new("\\d+y")
  table.rows.each do |name, age|
    aa.add_verify(CucumberLabel.new('Immunization name'), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-infobutton='#{name}']")) 
    aa.add_verify(CucumberLabel.new('Immunization age'), VerifyTextFormat.new(age_format), AccessHtmlElement.new(:css, "[data-infobutton='#{name}'] span.age"))
      #{}"//div[contains(@class, 'gist-item')]/div[contains(string(), '#{name}')]/descendant::span[@id='age']")) 

    expect(aa.perform_verification('Immunization name', name)).to be_true, "The value #{name} is not present in the immunization details"
    expect(aa.perform_verification('Immunization age', age)).to be_true, "The value #{age} is not present in the immunization details"
  end
end

When(/^user clicks on "(.*?)" pill$/) do |vaccine_name|
  aa = ImmunizationGist.instance
  driver = TestSupport.driver
  expect(aa.perform_action(vaccine_name, "")).to be_true
  expect(aa.perform_action('Detail View Button')).to eq(true) 
end

Then(/^the immunization gist applet title is "(.*?)"$/)  do |title|
  aa = ImmunizationGist.instance
  aa.wait_until_action_element_visible("Immunization Gist Applet Title")
  expect(aa.perform_verification("Immunization Gist Applet Title", title)).to be_true
end

When(/^user hover over "(.*?)" pill$/) do |_arg1|
  driver = TestSupport.driver
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  hover = wait.until { driver.find_element(:css, "[data-infobutton=PNEUMOCOCCAL]") }
  driver.action.move_to(hover).perform
end

Then(/^the immunizaiton gist view is filtered to (\d+) item$/) do |number_of_items|
  aa = ImmunizationGist.instance
  expect(aa.perform_verification('Immunization gist view count', number_of_items)).to be_true
end

When(/^the Immunizations Gist Applet contains data rows$/) do
  compare_item_counts("[data-appletid=immunizations] .gist-item")
end

When(/^user refreshes Immunizations Gist Applet$/) do
  applet_refresh_action("immunizations")
end

Then(/^the message on the Immunizations Gist Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("immunizations", message_text)
end

Then(/^the Immunizations Gist Applet contains buttons$/) do |table|
  aa = ImmunizationGist.instance
  table.rows.each do | button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(aa.am_i_visible? cucumber_label).to eq(true), "Could not find button #{button[0]}"
  end
end

Then(/^the user filters the Immunization Gist Applet by text "([^"]*)"$/) do |input_text|
  aa = ImmunizationGist.instance
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  pill_count = aa.pill_count
  expect(pill_count).to be > 0, "need at least 1 pill to test functionality"
  p pill_count
  expect(aa.perform_action('Control - applet - Text Filter', input_text)).to eq(true)
  wait.until { pill_count != aa.pill_count }
end

Then(/^the Immunization Gist only diplays pills including text "([^"]*)"$/) do |input_text|
  aa = ImmunizationGist.instance
  upper = input_text.upcase
  lower = input_text.downcase
  path = "//div[@data-appletid='immunizations']/descendant::div[contains(@class, 'gist-item')]/descendant::p[contains(translate(string(), '#{upper}', '#{lower}'), '#{lower}')]"
  p path
  row_count = aa.pill_count
  rows_containing_filter_text = TestSupport.driver.find_elements(:xpath, path).size
  expect(row_count).to eq(rows_containing_filter_text), "Only #{rows_containing_filter_text} pills contain the filter text but #{row_count} pills are visible"
end

When(/^user clicks the first pill$/) do
  @ehmp = PobImmunizationsApplet.new
  @ehmp.wait_until_applet_gist_loaded
  pills = @ehmp.fld_pills
  expect(pills.length).to be > 0, "Need at least 1 immunization pill to perform test"
  pills[0].click
  @ehmp.wait_until_btn_quick_view_visible
  expect(@ehmp).to have_btn_quick_view
end

When(/^a quick look icon is displayed in the immunization toolbar$/) do
  @ehmp = PobImmunizationsApplet.new
  @ehmp.wait_until_fld_toolbar_visible
  expect(@ehmp).to have_btn_quick_view
end

When(/^user clicks the quick look icon$/) do
  @ehmp = PobImmunizationsApplet.new
  @ehmp.btn_quick_view.click
  wait = Selenium::WebDriver::Wait.new(:timeout => 5)
  wait.until { @ehmp.hdr_quickview_headers.length > 0 }
  expect(@ehmp.hdr_quickview_headers.length).to be > 0
end
