class HypertensionCBW < CBW
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Hypertension"), ClickAction.new, AccessHtmlElement.new(:link_text, "Hypertension"))

    # applets
    add_verify(CucumberLabel.new("CONDITIONS"), VerifyContainsText.new, applet_panel_title("problems"))
    add_verify(CucumberLabel.new("NUMERIC LAB RESULTS"), VerifyContainsText.new, applet_panel_title("lab_results_grid"))
    add_verify(CucumberLabel.new("VITALS"), VerifyContainsText.new, applet_panel_title("vitals"))
    add_verify(CucumberLabel.new("TIMELINE"), VerifyContainsText.new, applet_panel_title("newsfeed"))
    add_verify(CucumberLabel.new("MEDICATIONS REVIEW"), VerifyContainsText.new, applet_panel_title("medication_review"))
    add_verify(CucumberLabel.new("CLINICAL REMINDERS"), VerifyContainsText.new, applet_panel_title("cds_advice"))
    add_verify(CucumberLabel.new("APPOINTMENTS & VISITS"), VerifyContainsText.new, applet_panel_title("appointments"))
    add_verify(CucumberLabel.new("DOCUMENTS"), VerifyContainsText.new, applet_panel_title("documents"))
    add_verify(CucumberLabel.new("VISTA HEALTH SUMMARIES"), VerifyContainsText.new, applet_panel_title("vista_health_summaries"))
    add_verify(CucumberLabel.new("Numberic Lab Results Filter Title"), VerifyText.new, applet_filter('lab_results_grid'))
  end
end

When(/^user selects Hypertension from Coversheet dropdown$/) do
  hypertension = HypertensionCBW.instance
  expect(hypertension.perform_action("Coversheet Dropdown", "")).to be_true, "Could not click on Dropdown menu"
  expect(hypertension.wait_until_element_present("Drop Down Menu", 60)).to be_true, "Could not see the drop down menu"
  expect(hypertension.perform_action("Hypertension")).to be_true, "Could not click on Hypertension link form drop down menu"
end

Then(/^the Hypertension CBW is displayed$/) do
  hypertension = HypertensionCBW.instance
  expect(hypertension.perform_verification('Screenname', 'Hypertension')).to eq(true), "Expected screenname to be Hypertension"
end

When(/^the user navigates to the Hypertension CBW$/) do
  navigate_in_ehmp '#hypertension-cbw'
  hypertension = HypertensionCBW.instance
  expect(hypertension.perform_verification('Screenname', 'Hypertension')).to eq(true), "Expected screenname to be Hypertension"
end

When(/^the applets are displayed on the Hypertension CBW$/) do |table|
  hypertension = HypertensionCBW.instance
  table.rows.each do |field_name|
    single_cell = field_name[0]
    hypertension.wait_until_element_present(single_cell)
    expect(hypertension.perform_verification(single_cell, single_cell)).to be_true, "Failed looking for #{field_name}"
  end
end
