class ProblemsSecondary < ADKContainer
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Description"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='problems'] [data-header-instanceid='problems-problemText'] a"))
    add_verify(CucumberLabel.new("Standardized Description"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='problems'] [data-header-instanceid='problems-standardizedDescription'] a"))
    add_verify(CucumberLabel.new("Acuity"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='problems'] [data-header-instanceid='problems-acuityName'] a"))
    add_verify(CucumberLabel.new("Status"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='problems'] [data-header-instanceid='problems-statusName'] a"))
    add_verify(CucumberLabel.new("Onset Date"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='problems'] [data-header-instanceid='problems-onsetFormatted'] a"))
    add_verify(CucumberLabel.new("Last Updated"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='problems'] [data-header-instanceid='problems-updatedFormatted'] a"))
    add_verify(CucumberLabel.new("Provider"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='problems'] [data-header-instanceid='problems-providerDisplayName'] a"))
    add_verify(CucumberLabel.new("Facility"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='problems'] [data-header-instanceid='problems-facilityMoniker'] a"))
    add_verify(CucumberLabel.new("Comments"), VerifyText.new, AccessHtmlElement.new(:css, "[data-appletid='problems'] [data-header-instanceid='problems-comments']"))
  end
end #ProblemsSecondar

#Validate the headers in the problems expanded view
Then(/^the Problems expanded headers are$/) do |table|
  ps = ProblemsSecondary.instance
  expect(ps.wait_until_action_element_visible("Description", DefaultLogin.wait_time)).to be_true
  verify_problems_headers(ProblemsSecondary.instance, table)
end #Problems Headers

def verify_problems_headers(access_browser_instance, table)
  driver = TestSupport.driver
  headers = driver.find_elements(:css, "#data-grid-problems th") 
  expect(headers.length).to_not eq(0)
  expect(headers.length).to eq(table.rows.length)
  elements = access_browser_instance
  table.rows.each do |header_text|
    does_exist = elements.static_dom_element_exists? header_text[0]
    p "#{header_text[0]} was not found" unless does_exist
    expect(does_exist).to be_true
  end #table
end #verify_table_headers

