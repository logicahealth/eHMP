class DepressionCBW < CBW
  include Singleton
  def initialize
    super

    add_action(CucumberLabel.new("Depression"), ClickAction.new, AccessHtmlElement.new(:link_text, "Depression"))

    # applets
    add_verify(CucumberLabel.new("CONDITIONS"), VerifyContainsText.new, applet_panel_title("problems"))
    add_verify(CucumberLabel.new("DOCUMENTS"), VerifyContainsText.new, applet_panel_title("documents"))
    add_verify(CucumberLabel.new("ORDERS"), VerifyContainsText.new, applet_panel_title("orders"))
    add_verify(CucumberLabel.new("APPOINTMENTS & VISITS"), VerifyContainsText.new, applet_panel_title("appointments"))
    add_verify(CucumberLabel.new("TIMELINE"), VerifyContainsText.new, applet_panel_title("newsfeed"))
    add_verify(CucumberLabel.new("MEDICATIONS REVIEW"), VerifyContainsText.new, applet_panel_title("medication_review"))
    add_verify(CucumberLabel.new("NUMERIC LAB RESULTS"), VerifyContainsText.new, applet_panel_title("lab_results_grid"))
    add_verify(CucumberLabel.new("CLINICAL REMINDERS"), VerifyContainsText.new, applet_panel_title("cds_advice"))

    add_verify(CucumberLabel.new("Numberic Lab Results Filter Title"), VerifyText.new, applet_filter('lab_results_grid'))
  end
end

When(/^user selects Depression from Coversheet dropdown$/) do
  depression = DepressionCBW.instance
  expect(depression.perform_action("Coversheet Dropdown", "")).to be_true, "Could not click on Dropdown menu"
  expect(depression.wait_until_element_present("Drop Down Menu", 60)).to be_true, "Could not see the drop down menu"
  expect(depression.perform_action("Depression")).to be_true, "Could not click on Depression link form drop down menu"
end

Then(/^the Depression CBW is displayed$/) do
  depression = DepressionCBW.instance
  expect(depression.perform_verification('Screenname', 'Depression')).to eq(true), "Expected screenname to be Depression"
end

When(/^the user navigates to the Depression CBW$/) do
  navigate_in_ehmp '#depression-cbw'
  depression = DepressionCBW.instance
  expect(depression.perform_verification('Screenname', 'Depression')).to eq(true), "Expected screenname to be Depression"
end

When(/^the applets are displayed on the Depression CWB$/) do |table|
  depression = DepressionCBW.instance
  table.rows.each do |field_name|
    single_cell = field_name[0]
    depression.wait_until_element_present(single_cell)
    expect(depression.perform_verification(single_cell, single_cell)).to be_true, "Failed looking for #{field_name}"
  end
end

Then(/^the Lab Results applet reports filtered "([^"]*)"$/) do |arg1|
  depression = DepressionCBW.instance
  expect(depression.perform_verification('Numberic Lab Results Filter Title', arg1)).to eq(true), "'Lab Results filter did not say #{arg1}"
end

Then(/^the filters applied to Lab Results are$/) do |table|
  open_and_verify_filters('lab_results_grid', table)
end
