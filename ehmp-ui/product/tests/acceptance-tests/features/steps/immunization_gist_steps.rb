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

    add_verify(CucumberLabel.new("Immunization Gist Tooltip"), VerifyContainsText.new, AccessHtmlElement.new(:id, "urn:va:immunization:SITE:301:37"))
    gist_view_count = AccessHtmlElement.new(:xpath, "//*[@id='immunizations-pill-gist-items']/descendant::div[contains(@class, 'immunGist')]")
    add_verify(CucumberLabel.new('Immunization gist view count'), VerifyXpathCount.new(gist_view_count), gist_view_count)
    add_verify(CucumberLabel.new("Empty Gist"), VerifyText.new, AccessHtmlElement.new(:css, "#{appletid_css} p.color-grey-darkest"))

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

Then(/^user sees Immunizations Gist$/) do
  applet = PobImmunizationsApplet.new
  applet.wait_for_fld_applet_title
  expect(applet).to have_fld_applet_title
  expect(applet.fld_applet_title.text.upcase). to eq('IMMUNIZATIONS')
end

Then(/^the immunization gist view has the following information$/) do |table|
  applet = PobImmunizationsApplet.new
  age_format = Regexp.new("\\d+y")
  table.rows.each do |name, age|
    applet.add_immunization_data_info_btn name
    expect(applet).to have_btn_new_immunization_pill
    expect(applet.btn_new_immunization_pill.text.upcase).to include name.upcase
    expect(applet).to have_btn_new_immunization_pill_age
    expect(applet.btn_new_immunization_pill_age.text).to match age_format
  end
end

Then(/^the immunization gist applet title is "(.*?)"$/)  do |title|
  @ehmp = PobImmunizationsApplet.new
  expect(@ehmp).to have_fld_applet_title
  expect(@ehmp.fld_applet_title.text.upcase).to eq(title.upcase)
end

When(/^user hover over "(.*?)" pill$/) do |_arg1|
  driver = TestSupport.driver
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  hover = wait.until { driver.find_element(:css, "[data-infobutton=PNEUMOCOCCAL]") }
  driver.action.move_to(hover).perform
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

Then(/^the Immunizations Gist Applet contains buttons an Add button$/) do
  applet = PobImmunizationsApplet.new
  expect(applet.wait_for_btn_applet_add).to eq(true)
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
