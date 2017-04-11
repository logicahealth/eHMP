path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'all_applets.rb'

class ProblemDOD < AllApplets
  include Singleton
  def initialize
    super
    appletid_css = "[data-appletid=problems]"
    add_applet_buttons appletid_css
    add_action(CucumberLabel.new("Non DOD Record"), ClickAction.new, AccessHtmlElement.new(:xpath, ".//*[@data-row-instanceid='urn-va-problem-9E7A-3-627']/td[7]"))
    add_action(CucumberLabel.new("DOD Record"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@data-row-instanceid='urn-va-problem-DOD-0000000003-1000000523']/td[7]"))
    add_verify(CucumberLabel.new("Acuity"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@id='problems-acuityName']/a"))
    add_verify(CucumberLabel.new("Remove"), VerifyContainsText.new, AccessHtmlElement.new(:id, "deleteBtn"))
    add_verify(CucumberLabel.new("Edit"), VerifyContainsText.new, AccessHtmlElement.new(:id, "editBtn"))
    add_verify(CucumberLabel.new("Encounter Location"), VerifyContainsText.new, AccessHtmlElement.new(:id, "selectedInfo"))
    add_action(CucumberLabel.new("Hospital Admissions"), ClickAction.new, AccessHtmlElement.new(:id, "visit-tab-admits"))
    add_action(CucumberLabel.new("New Visit"), ClickAction.new, AccessHtmlElement.new(:id, "visit-tab-new"))
  end
end

When(/^the user clicks on the expand view of Problem Applet$/) do
  con = ProblemDOD.instance
  driver = TestSupport.driver
  expect(con.perform_action("Control - applet - Expand View", "")).to be_true
end
