class LabResultsCoverSheet < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Date"), VerifyText.new, AccessHtmlElement.new(:id, "lab_results_grid-observed"))
    add_verify(CucumberLabel.new("Lab Test"), VerifyText.new, AccessHtmlElement.new(:id, "lab_results_grid-typeName"))
    add_verify(CucumberLabel.new("Result"), VerifyText.new, AccessHtmlElement.new(:id, "lab_results_grid-result"))
    add_verify(CucumberLabel.new("Site"), VerifyContainsText.new, AccessHtmlElement.new(:id, "lab_results_grid-facilityCode"))

    row_count = AccessHtmlElement.new(:xpath, "//div[@data-appletid='lab_results_grid']//table/descendant::tr")
    add_verify(CucumberLabel.new("Num Numeric Lab Results"), VerifyXpathCount.new(row_count), row_count)

    add_action(CucumberLabel.new("Flag column"), ClickAction.new, AccessHtmlElement.new(:css, "#lab_results_grid-flag a"))
  end
end # LabResultsCoverSheet

Then(/^the Lab Results Applet contains data rows$/) do
  compare_item_counts("[data-appletid=lab_results_grid] .data-grid table tbody tr")
end

When(/^user refreshes Lab Results Applet$/) do
  applet_refresh_action("lab_results_grid")
end

Then(/^the message on the Lab Results Applet does not say "(.*?)"$/) do |message_text|
  compare_applet_refresh_action_response("lab_results_grid", message_text)
end
