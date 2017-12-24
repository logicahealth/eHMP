# require 'rspec_helper'
# require 'vaToolSet/vaToolSet_PageObject'
# require 'varUtility/varUtility_PageObject'
# require_relative '../module/DBUtility'
require 'waitUtility'

class LoginLogout
  include PageObject

  def initialize(driver)
    @driver = driver
    @ehmp_po  = EHMP_PageObject.new(@driver)
    @waitUtility = WaitUtility.new(@driver)
  end

  def loginWith(user_info)
    @waitUtility.waitWhileSpinnerPresent
    @ehmp_po.login.facility_element.when_visible(TIME_OUT_LIMIT).click
    @ehmp_po.login.station = user_info["station"]
    @driver.send_keys :enter

    @waitUtility.wait_untill_elements_size_steadied
    @ehmp_po.login.accessCode = user_info["access_code"]
    @ehmp_po.login.verifyCode = user_info["verify_code"]
    @waitUtility.wait_untill_elements_size_steadied

    @ehmp_po.login.login_element.when_visible(TIME_OUT_LIMIT).click
  end

  def logout(close=true)
    # @waitUtility.waitWhileSpinnerPresent
    @waitUtility.wait_untill_elements_size_steadied

    @ehmp_po.login.logout_element.when_visible(TIME_OUT_LIMIT).click

    @waitUtility.wait_untill_elements_size_steadied
    @ehmp_po.login.yesLogout_element.when_visible(TIME_OUT_LIMIT).click

    if close
      @driver.close
    end

  end

end