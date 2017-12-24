

class OrdersApplet < AccessBrowserV2
  include Singleton
  def initialize
    super
    add_action(CucumberLabel.new('Orders Expand button'), ClickAction.new, AccessHtmlElement.new(:css, "div[data-appletid=orders] .applet-maximize-button"))
    add_action(CucumberLabel.new('All Range button'), ClickAction.new, AccessHtmlElement.new(:id, 'all-range-orders'))
  
    xpath_row_count = AccessHtmlElement.new(:xpath, "//div[@data-appletid='orders']//table/descendant::tr[contains(@class, 'selectable')]")
    add_verify(CucumberLabel.new('Orders grid row count'), VerifyXpathCount.new(xpath_row_count), xpath_row_count)
  
    add_action(CucumberLabel.new('Order Type Open dropdown'), ClickAction.new, AccessHtmlElement.new(:css, '[data-appletid=orders] .grid-toolbar select'))
  end
end

Then(/^the Orders applet displays "(.*?)"$/) do |arg1|
  driver = TestSupport.driver
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time) # seconds # wait until list opens
  wait.until { driver.find_element(:xpath, "//div[@data-appletid='orders']//table/descendant::td[contains(string(),'#{arg1}')]").displayed? }
end

When(/^the user clicks the control Expand View in the Orders applet$/) do
  applet = PobOrdersApplet.new
  applet.wait_for_btn_applet_expand_view
  expect(applet).to have_btn_applet_expand_view
  applet.btn_applet_expand_view.click
  expect(applet.wait_for_btn_applet_minimize).to eq(true)
end

When(/^the user clicks the date control All on the Orders applet$/) do
  expect(OrdersApplet.instance.perform_action('All Range button')).to be_true
end

When(/^the user selects "(.*?)" in the Orders applet Order Type dropdown$/) do |arg1|
  # OrdersApplet.instance.add_action(CucumberLabel.new("dropdown option"), ClickAction.new, AccessHtmlElement.new(:xpath, "//a[contains(string(), '#{arg1}')]"))
  OrdersApplet.instance.add_action(CucumberLabel.new("dropdown option"), ClickAction.new, AccessHtmlElement.new(:xpath, "//div[@data-appletid='orders']//select/option[contains(string(), '#{arg1}')]"))
  wait = Selenium::WebDriver::Wait.new(:timeout => DefaultLogin.wait_time)
  wait.until {
    OrdersApplet.instance.perform_action('Order Type Open dropdown') && OrdersApplet.instance.perform_action('dropdown option')
    sleep 10
  }
end
