class DiabetesMellitusCBW < CBW
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Diabetes Mellitus"), ClickAction.new, AccessHtmlElement.new(:link_text, "Diabetes Mellitus"))

    # applets
    add_verify(CucumberLabel.new("PROBLEMS"), VerifyContainsText.new, applet_panel_title("problems"))
    add_verify(CucumberLabel.new("STACKED GRAPHS"), VerifyContainsText.new, applet_panel_title("stackedGraph"))
    add_verify(CucumberLabel.new("APPOINTMENTS & VISITS"), VerifyContainsText.new, applet_panel_title("appointments"))
    add_verify(CucumberLabel.new("CLINICAL REMINDERS"), VerifyContainsText.new, applet_panel_title("cds_advice"))
    add_verify(CucumberLabel.new("MEDICATIONS REVIEW"), VerifyContainsText.new, applet_panel_title("medication_review"))
    add_verify(CucumberLabel.new("TIMELINE"), VerifyContainsText.new, applet_panel_title("newsfeed"))
    add_verify(CucumberLabel.new("ORDERS"), VerifyContainsText.new, applet_panel_title("orders"))
    add_verify(CucumberLabel.new("DOCUMENTS"), VerifyContainsText.new, applet_panel_title("documents"))
    add_verify(CucumberLabel.new("VISTA HEALTH SUMMARIES"), VerifyContainsText.new, applet_panel_title("vista_health_summaries"))

    add_verify(CucumberLabel.new("Documents Filter Title"), VerifyText.new, applet_filter('documents'))
    add_verify(CucumberLabel.new("Appointments Filter Title"), VerifyText.new, applet_filter('appointments'))
    add_verify(CucumberLabel.new("Timeline Filter Title"), VerifyText.new, applet_filter('newsfeed'))
    add_verify(CucumberLabel.new("Meds Review Filter Title"), VerifyText.new, applet_filter('medication_review'))
  end
end

When(/^user selects Diabetes Mellitus from Coversheet dropdown$/) do
  diabetes = DiabetesMellitusCBW.instance
  expect(diabetes.perform_action("Coversheet Dropdown", "")).to be_true, "Could not click on Dropdown menu"
  expect(diabetes.wait_until_element_present("Drop Down Menu", 60)).to be_true, "Could not see the drop down menu"
  expect(diabetes.perform_action("Diabetes Mellitus")).to be_true, "Could not click on Diabetes Mellitus link form drop down menu"
end

When(/^the user navigates to the Diabetes Mellitus CBW$/) do
  navigate_in_ehmp '#diabetes-mellitus-cbw'
  diabetes = DiabetesMellitusCBW.instance
  expect(diabetes.perform_verification('Screenname', 'Diabetes Mellitus')).to eq(true), "Expected screenname to be Diabetes Mellitus"
end

When(/^the applets are displayed on the Diabetes Mellitus CBW$/) do |table|
  diabetes = DiabetesMellitusCBW.instance
  table.rows.each do |field_name|
    single_cell = field_name[0]
    diabetes.wait_until_element_present(single_cell)
    expect(diabetes.perform_verification(single_cell, single_cell, DefaultTiming.default_table_row_load_time)).to be_true, "Failed looking for #{field_name}"
  end
end

Then(/^the Diabetes Mellitus CBW is displayed$/) do
  diabetes = DiabetesMellitusCBW.instance
  expect(diabetes.perform_verification('Screenname', 'Diabetes Mellitus')).to eq(true), "Expected screenname to be Depression"
end

Then(/^the Documents applet reports filtered "([^"]*)"$/) do |arg1|
  diabetes = DiabetesMellitusCBW.instance
  expect(diabetes.perform_verification('Documents Filter Title', arg1)).to eq(true), "Documents filter did not say #{arg1}"
end

Then(/^the filters applied to Documents are$/) do |table|
  open_and_verify_filters('documents', table)
end

Then(/^the filters applied to Appointment & Visit are$/) do |table|
  open_and_verify_filters('appointments', table)
end

Then(/^the Appointment & Visit applet reports filtered "([^"]*)"$/) do |arg1|
  diabetes = DiabetesMellitusCBW.instance
  expect(diabetes.perform_verification('Appointments Filter Title', arg1)).to eq(true), "Appointments filter did not say #{arg1}"
end

Then(/^the Timeline applet reports filtered "([^"]*)"$/) do |arg1|
  diabetes = DiabetesMellitusCBW.instance
  expect(diabetes.perform_verification('Timeline Filter Title', arg1)).to eq(true), "Timeline filter did not say #{arg1}"
end

Then(/^the filters applied to Timeline are$/) do |table|
  # table is a Cucumber::Core::Ast::DataTable
  open_and_verify_filters('newsfeed', table)
end

Then(/^the Meds Review applet reports filtered "([^"]*)"$/) do |arg1|
  diabetes = DiabetesMellitusCBW.instance
  expect(diabetes.perform_verification('Meds Review Filter Title', arg1)).to eq(true), "Meds Review filter did not say #{arg1}"
end

Then(/^the filters applied to Meds Review are$/) do |table|
  open_and_verify_filters('medication_review', table)
end
