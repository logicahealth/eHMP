class ProblemSearch < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("CurrentLocationVerify"), VerifyContainsText.new, AccessHtmlElement.new(:xpath, "//*[@id='mainModalLabel']"))
    add_verify(CucumberLabel.new("NoResultVerify"), VerifyContainsText.new, AccessHtmlElement.new(:id, "problemsNoResults"))
  end
end

And(/^the modal title "(.*?)" appears$/) do |arg1|
  con = ProblemSearch.instance
  con.perform_verification("CurrentLocationVerify", arg1)
end

Then(/^"No results" message should appear$/) do
  result = "No result"
  con = ProblemSearch.instance
  con.perform_verification("NoResultVerify", result)
end

