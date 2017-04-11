class PreProcedureCBW < CBW
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Pre-Procedure"), ClickAction.new, AccessHtmlElement.new(:link_text, "Pre-Procedure"))

    # applets
    add_verify(CucumberLabel.new("PROBLEMS"), VerifyContainsText.new, applet_panel_title("problems"))
    add_verify(CucumberLabel.new("VITALS"), VerifyContainsText.new, applet_panel_title("vitals"))
    add_verify(CucumberLabel.new("ORDERS"), VerifyContainsText.new, applet_panel_title("orders"))
    add_verify(CucumberLabel.new("APPOINTMENTS & VISITS"), VerifyContainsText.new, applet_panel_title("appointments"))
    add_verify(CucumberLabel.new("TIMELINE"), VerifyContainsText.new, applet_panel_title("newsfeed"))
    add_verify(CucumberLabel.new("NUMERIC LAB RESULTS"), VerifyContainsText.new, applet_panel_title("lab_results_grid"))
    add_verify(CucumberLabel.new("DOCUMENTS"), VerifyContainsText.new, applet_panel_title("documents"))
    add_verify(CucumberLabel.new("MEDICATIONS REVIEW"), VerifyContainsText.new, applet_panel_title("medication_review"))
    add_verify(CucumberLabel.new("ALLERGIES"), VerifyContainsText.new, applet_panel_title("allergy_grid"))
  end
end

When(/^user selects Pre\-procedure from Coversheet dropdown$/) do
  prepro = PreProcedureCBW.instance
  expect(prepro.perform_action("Coversheet Dropdown", "")).to be_true, "Could not click on Dropdown menu"
  expect(prepro.wait_until_element_present("Drop Down Menu", 60)).to be_true, "Could not see the drop down menu"
  expect(prepro.perform_action("Pre-Procedure")).to be_true, "Could not click on Pre-Procedure link form drop down menu"
end

Then(/^the Pre\-procedure CBW is displayed$/) do
  prepro = PreProcedureCBW.instance
  expect(prepro.perform_verification('Screenname', 'Pre-Procedure')).to eq(true), "Expected screenname to be Pre-Procedure"
end

When(/^the user navigates to the Pre\-procedure CBW$/) do
  navigate_in_ehmp '#pre-procedure-cbw'
  prepro = PreProcedureCBW.instance
  expect(prepro.perform_verification('Screenname', 'Pre-Procedure')).to eq(true), "Expected screenname to be Pre-Procedure"
end

When(/^the applets are displayed on the Pre\-procedure CBW$/) do |table|
  prepro = PreProcedureCBW.instance
  table.rows.each do |field_name|
    single_cell = field_name[0]
    prepro.wait_until_element_present(single_cell)
    expect(prepro.perform_verification(single_cell, single_cell)).to be_true, "Failed looking for #{field_name}"
  end
end
