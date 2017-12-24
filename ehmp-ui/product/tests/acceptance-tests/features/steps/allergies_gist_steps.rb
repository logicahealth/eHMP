class AllergyFunctions
  extend ::RSpec::Matchers

  def self.verify_title(title)
    allergy_applet = PobAllergiesApplet.new
    expect(allergy_applet).to have_fld_applet_title
    expect(allergy_applet.fld_applet_title.text.upcase).to eq(title.upcase)
  end
end

Then(/^user sees Allergies Gist$/) do
  AllergyFunctions.verify_title 'ALLERGIES'
end

Then(/^the Allergies Applet title is "(.*?)"$/) do |title|
  AllergyFunctions.verify_title title
end

Then(/^the Allergies Gist applet is finished loading$/) do
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultTiming.default_table_row_load_time)
  applet = PobAllergiesApplet.new
  wait.until { applet.applet_gist_loaded? }
end

Then(/^the Allergies Gist Applet contains an Add Button$/) do
  allergy_applet = PobAllergiesApplet.new
  expect(allergy_applet.wait_for_btn_applet_add).to eq(true), "Expected applet to display an Add Button"
end

Then(/^the Allergies Gist contains at least (\d+) pill$/) do |arg1|
  @ehmp = PobAllergiesApplet.new
  @ehmp.wait_for_fld_allergy_gist_all_pills
  pill_count = @ehmp.fld_allergy_gist_all_pills.length.to_s
  expect(pill_count).to be >= (arg1), "In the Applet, Pill counts are showing: #{pill_count}"
end

When(/^user views the first allergy details$/) do
  ehmp = PobAllergiesApplet.new
  expect(ehmp.fld_allergy_gist_pills.length).to be > 0
  @first_allergy_name = ehmp.first_pill_text
  ehmp.fld_allergy_gist_pills[0].click
end

When(/^the Allergies Gist Applet contains data rows$/) do
  compare_item_counts("[data-appletid=allergy_grid] [gistviewtype=pills] .gist-item")
end

When(/^user refreshes Allergies Gist Applet$/) do
  applet = PobAllergiesApplet.new
  expect(applet.wait_for_btn_applet_refresh).to eq(true)
  applet.btn_applet_refresh.click
end

Then(/^the message on the Allergies Gist Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("allergy_grid", message_text)
end

When(/^the user minimizes the expanded Allergies Applet$/) do
  allergy_applet = PobAllergiesApplet.new
  expect(allergy_applet.wait_for_btn_applet_minimize).to eq(true), "Expected applet to display a minimize button"
  allergy_applet.btn_applet_minimize.click
  expect(allergy_applet.wait_for_btn_applet_expand_view).to eq(true), "Expected applet to display an expand button"
end

Then(/^the Allergies Gist Applet contains buttons Refresh, Help and Expand$/) do
  ehmp = PobAllergiesApplet.new
  ehmp.wait_for_btn_applet_refresh
  ehmp.wait_for_btn_applet_help
  ehmp.wait_for_btn_applet_expand_view

  expect(ehmp).to have_btn_applet_refresh
  expect(ehmp).to have_btn_applet_help
  expect(ehmp).to have_btn_applet_expand_view
end

Then(/^the Allergies Gist Applet does not contain button Filter Toggle$/) do
  ehmp = PobAllergiesApplet.new
  expect(ehmp).to_not have_btn_applet_filter_toggle
end

Given(/^the user notes the number of allergy pills$/) do
  ehmp = PobAllergiesApplet.new
  @num_allergy_pills = ehmp.fld_allergy_gist_pills.length
end

Then(/^the Allergies Gist displays the expected number of allergy pills$/) do
  expect(@num_allergy_pills).to_not be_nil, "Expected variable num_allergy_pills to be set in a previous step"
  ehmp = PobAllergiesApplet.new
  expect(ehmp.fld_allergy_gist_pills.length).to eq(@num_allergy_pills)
end

