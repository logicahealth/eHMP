path = File.expand_path '../helper', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)

require 'AccessBrowserV2.rb'

class AppContainer < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new("Current User Menu"), ClickAction.new, AccessHtmlElement.new(:id, "eHMPCurrentUser"))
    add_action(CucumberLabel.new("Help Menu"), ClickAction.new, AccessHtmlElement.new(:id, "eHMP-Help"))
  end
end # 

Then(/^the navigation bar displays "(.*?)"$/) do |app_container_html_element|
  expect(AppContainer.instance.wait_until_element_present(app_container_html_element)).to be_true
end
