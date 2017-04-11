class ActiveScreen < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_verify(CucumberLabel.new("Active Screen"), VerifyText.new, AccessHtmlElement.new(:id, "screenName"))
  end
end # 

Then(/^"(.*?)" is active$/) do |screen_name|
  browser_access = ActiveScreen.instance
  expect(browser_access.wait_until_element_present("Active Screen", DefaultLogin.wait_time)).to be_true
  expect(browser_access.perform_verification("Active Screen", screen_name)).to be_true
end
