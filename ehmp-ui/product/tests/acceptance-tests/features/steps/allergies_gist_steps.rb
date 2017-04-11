class AllergiesGist <  AllApplets
  include Singleton
  attr_reader :appletid
  def initialize
    super
    @appletid = 'allergy_grid'
    appletid_css = "[data-appletid=#{@appletid}]"
    add_verify(CucumberLabel.new("AllergiesGridVisible"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid=allergy_grid] div.gridContainer"))
    add_verify(CucumberLabel.new("Allergy Details"), VerifyContainsText.new, AccessHtmlElement.new(:css, "[data-appletid=allergy_grid] div.gridContainer")) 
    
    add_verify(CucumberLabel.new('Empty Allergy Gist'), VerifyContainsText.new, AccessHtmlElement.new(:css, "#{appletid_css} p.color-grey-darkest"))
    pills = AccessHtmlElement.new(:css, '[data-appletid=allergy_grid] [data-infobutton-class=info-button-pill]')
    add_verify(CucumberLabel.new('Allergy Pills'), VerifyXpathCount.new(pills), pills)
    add_action(CucumberLabel.new('first pill'), ClickAction.new, AccessHtmlElement.new(:xpath, "//div[@data-appletid='allergy_grid']/descendant::div[@data-infobutton-class='info-button-pill'][1]"))

    # Allergy Gist Applet buttons
    add_applet_buttons appletid_css

    add_applet_title appletid_css

    add_applet_add_button appletid_css

    add_toolbar_buttons

    add_action(CucumberLabel.new('Add'), ClickAction.new, AccessHtmlElement.new(:css, "#{appletid_css} .applet-add-button"))
  end

  def applet_loaded?
    return true if am_i_visible? 'Empty Allergy Gist'
    return (TestSupport.driver.find_elements(:css, '[data-appletid=allergy_grid] .grid-container [data-infobutton-class=info-button-pill]').length > 0)
  rescue => e 
    # p e
    false
  end

  def pills
    TestSupport.driver.find_elements(:css, '#allergy_grid-pill-gist-items [data-infobutton-class=info-button-pill]')
  end
end 

Before do
  @ag = AllergiesGist.instance
end

Then(/^user sees Allergies Gist$/) do
  expect(@ag.wait_until_action_element_visible("Title", DefaultLogin.wait_time)).to be_true
  expect(@ag.perform_verification("Title", "ALLERGIES")).to be_true
end

Then(/^the Allergies Gist view contains$/) do |table|  
  expect(@ag.wait_until_action_element_visible("AllergiesGridVisible", DefaultLogin.wait_time)).to be_true    
  table.rows.each do |row|
    expect(@ag.perform_verification('Allergy Details', row[0])).to be_true, "The value #{row[0]} is not present in the allergy details"
  end
end

Then(/^the Allergies Applet title is "(.*?)"$/) do |title|
  expect(@ag.wait_until_action_element_visible("Title", DefaultLogin.wait_time)).to be_true
  expect(@ag.perform_verification("Title", title)).to be_true
end

# add_verify(CucumberLabel.new("Allergies Gist Applet Filter Result"), VerifyContainsText.new, AccessHtmlElement.new(:id, "pill-gist-popover-urn:va:allergy:ABCD:16:106"))
# When(/^Allegies Gist Applet contains only "(.*?)"$/) do |allergy_type|
#   expect(@ag.wait_until_action_element_visible("AllergiesGridVisible", DefaultLogin.wait_time)).to be_true
#   expect(@ag.perform_verification("Allergies Gist Applet Filter Result", allergy_type)).to be_true
# end

Then(/^the Allergies Gist applet is finished loading$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { @ag.applet_loaded? }
end

Then(/^the Allergies Gist Applet contains buttons$/) do |table|
  table.rows.each do | button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(@ag.am_i_visible? cucumber_label).to eq(true), "Could not find button #{button[0]}"
  end
end

Then(/^the Allergies Gist Applet does not contain buttons$/) do |table|
  table.rows.each do | button|
    cucumber_label = "Control - applet - #{button[0]}"
    expect(@ag.am_i_visible? cucumber_label).to eq(false), "Applet should not have button #{button[0]}"
  end
end

Then(/^the Allergies Gist contains at least (\d+) pill$/) do |arg1|
  # count = arg1.to_i - 1
  # expect(@ag.wait_until_xpath_count_greater_than('Allergy Pills', count)).to eq(true), "Test requires at least #{arg1} pill to be displayed"

  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_fld_allergy_gist_all_pills
  pill_count = @ehmp.fld_allergy_gist_all_pills.length.to_s
  expect(pill_count).to be >= (arg1), "In the Applet, Pill counts are showing: #{pill_count}"
end

When(/^user clicks an allergy pill$/) do
  expect(@ag.perform_action('first pill')).to eq(true)
end

Then(/^a popover displays with icons$/) do |table|
#  expect(@ag.wait_until_action_element_visible('Popover Toolbar')).to eq(true), "Popover did not display"
  expect(@ag.am_i_visible?('Info Button')).to eq(true), "Info icon did not display"
  expect(@ag.am_i_visible?('Detail View Button')).to eq(true), "Detail icon did not display"
end

When(/^user views the first allergy details$/) do
  expect(@ag.perform_action('first pill')).to eq(true)
  expect(@ag.wait_until_action_element_visible('Popover Toolbar')).to eq(true), "Popover did not display"
  expect(@ag.perform_action('Detail View Button')).to eq(true)
end

Then(/^the modal's title matches the first pill$/) do
  @ehmp = PobAllergiesApplet.new
  modal = ModalElements.new
  modal.wait_until_fld_modal_title_visible
  expect(modal.fld_modal_title.text.upcase).to eq("ALLERGEN - #{@ehmp.first_pill_text.upcase}")
end

When(/^the Allergies Gist Applet contains data rows$/) do
  compare_item_counts("#grid-panel-allergy_grid [gistviewtype=pills] .gist-item")
end

When(/^user refreshes Allergies Gist Applet$/) do
  applet_refresh_action("allergy_grid")
end

Then(/^the message on the Allergies Gist Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("allergy_grid", message_text)
end

When(/^the user minimizes the expanded Allergies Applet$/) do
  @ehmp = PobAllergiesApplet.new
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  wait.until { applet_grid_loaded(@ehmp.has_fld_empty_row?, @ehmp.expanded_rows) }
  expect(@ag.perform_action('Control - applet - Minimize View')).to eq(true)
end

When(/^the user views the first Allergies Gist detail view$/) do 
  expect(@ag.wait_until_xpath_count_greater_than('Allergy Pills', 0)).to eq(true), "Test requires at least 1 row to be displayed"
  expect(@ag.perform_action('first pill')).to eq(true)
  expect(@ag.perform_action('Detail View Button')).to eq(true)
end
