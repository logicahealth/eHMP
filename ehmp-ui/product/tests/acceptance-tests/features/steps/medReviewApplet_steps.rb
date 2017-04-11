class MedReviewApplet2 < AllApplets
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Coversheet Dropdown"), ClickAction.new, AccessHtmlElement.new(:id, "screenName"))
    add_verify(CucumberLabel.new("Drop Down Menu"), VerifyText.new, AccessHtmlElement.new(:class, "dropdown-menu"))
    add_action(CucumberLabel.new("Meds Review"), ClickAction.new, AccessHtmlElement.new(:link_text, "Meds Review"))                   
  end
end

When(/^user selects Meds Review from Coversheet dropdown$/) do
  aa = MedReviewApplet2.instance
  expect(aa.wait_until_action_element_visible("Coversheet Dropdown", DefaultLogin.wait_time)).to be_true
  expect(aa.perform_action("Coversheet Dropdown", "")).to be_true, "Could not click on Drop down menu"
  expect(aa.wait_until_element_present("Drop Down Menu", 60)).to be_true, "Could not see the drop down menu"
  expect(aa.perform_action("Meds Review", "")).to be_true, "Could not click on Med Review link"
end
