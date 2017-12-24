require 'active_support/time'

require 'rspec'

module DriverUtility

  def initializeConfigurations(base_url)
    @driver = Watir::Browser.new :chrome
    @driver.cookies.clear
    @driver.goto(base_url)
   # @driver.window.resize_to 1500, 850
   # @driver.window.move_to 0,0
    #@driver.driver.manage.timeouts.implicit_wait = 3
  end

  def goTo(url)
    @driver.goto(url)
  end

  def initializeConfigurations_chrome(base_url)
    # Specify the driver path
    chromedriver_path = File.join(File.absolute_path('../', File.dirname(__FILE__)),"module/browser_driver","chromedriver")

    puts ("path for chrome " + chromedriver_path)

    Selenium::WebDriver::Chrome.driver_path = chromedriver_path

    @driver = Watir::Browser.new :chrome
    @driver.cookies.clear
    @driver.goto(base_url)
    @driver.window.resize_to 1100, 850
    @driver.window.move_to 0,0
    #@driver.driver.manage.timeouts.implicit_wait = 3

  end

  def gotoHome(baseUrl)
    @driver.goto(baseUrl + "/")
  end

  def getCurrentURL()
    return @driver.url
  end

  def quitDriver()
    @driver.quit
  end

  def resizeWindowTo(width, height)
    @driver.window.resize_to width, height
    sleep 0.5
  end

  def resizeWindowToDefault()
    resizeWindowTo(1260, 727)
    sleep 0.5
  end

  def resizeWindowToPhone()
    resizeWindowTo(320, 480)
  end

  def switchWindowToWindowHandleLast()
    @driver.windows.last.use
  end

  def switchWindowToWindowHandleFirst()
    @driver.windows.first.use
  end

  def refreshBrowser()
    @driver.refresh()
  end

end