# require 'rspec_helper'
# require 'varUtility/varUtility_PageObject'

class WaitUtility
  include PageObject

  def initialize(driver)
    @driver = driver
  end

  def wait_until_page_loaded(timeout=TIME_OUT_LIMIT)
    @driver.wait
    wait = Selenium::WebDriver::Wait.new(:timeout => timeout)
    wait.until { @driver.ready_state.eql? "complete" }
  end

  def waitWhileSpinnerPresent(timeout=TIME_OUT_LIMIT)
    spinner = @driver.body(:text => /Loading eHMP/)
    spinner.wait_while_present(timeout)

    spinner = @driver.body(:text => /AUTHENTICATING/)
    spinner.wait_while_present(timeout)
  end

  def waitWhileModuleSpinnerPresent(timeout=TIME_OUT_LIMIT)
    spinner = @driver.body(:text => /Loading/)
    spinner.wait_while_present(timeout)

  end

 def waitWhileGrowlerPresent(timeout=TIME_OUT_LIMIT)
    growler = @driver.body(:text => /Appointment successfully booked/)
    growler.wait_while_present(timeout)

  end

  def wait_untill_elements_size_steadied(timeout=TIME_OUT_LIMIT)
    @old_size = 0
     # @driver.wait
    wait = Selenium::WebDriver::Wait.new(:timeout => timeout)
    wait.until { elements_size_steadied? }
  end

end

def elements_size_steadied?
  current_ele = @driver.element.html
  current_size = current_ele.size
  if @old_size == current_size && current_size > 0
    sleep 0.2
    return true
  else
    @old_size = current_size
  end
  return false
end


