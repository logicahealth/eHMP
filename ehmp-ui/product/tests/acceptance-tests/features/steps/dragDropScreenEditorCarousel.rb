class AppletCarousel < AccessBrowserV2
  include Singleton
  def initialize
    super 
    add_action(CucumberLabel.new("Allergies"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='applets-carousel']/div[1]/div[2]/div/div[1]")) 
    add_action(CucumberLabel.new("Health"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='applets-carousel']/div[1]/div[2]/div/div[1]"))
    add_action(CucumberLabel.new("First Allergies Preview"), ClickAction.new, AccessHtmlElement.new(:id, "475c174e6b26"))
    add_action(CucumberLabel.new("Health Summaries"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='gridster2']/ul/li/div/div[2]/p"))
    add_action(CucumberLabel.new("VistA Health Summaries"), ClickAction.new, AccessHtmlElement.new(:css, "#applets-carousel > div:nth-child(2) > div.carousel-inner > div > div:nth-child(15)"))
    add_action(CucumberLabel.new("VistA Health Summaries Summary"), ClickAction.new, AccessHtmlElement.new(:xpath, "//*[@id='applet-1']/div/div[2]/p"))
    add_verify(CucumberLabel.new("Applet Carousel"), VerifyContainsText.new, AccessHtmlElement.new(:css, "#applets-carousel"))
  end
end #AppletCarousel

Then(/^drag and drop the Medications Review right by (\d+) and down by (\d+)$/) do |right_by, down_by|
  driver = TestSupport.driver
  wait_until_loaded("Allergies")
  applet_preview = driver.find_element(:css, "#applets-carousel > div:nth-child(2) > div.carousel-inner > div > div:nth-child(11)")
  perform_drag(applet_preview, right_by, down_by)
end

def wait_until_loaded(element)
  navigation = AppletCarousel.instance
  navigation.wait_until_action_element_visible(element, 60)
end

def perform_drag(applet_preview, right_by, down_by)
  driver = TestSupport.driver
  driver.action.drag_and_drop_by(applet_preview, right_by, down_by).perform
end
