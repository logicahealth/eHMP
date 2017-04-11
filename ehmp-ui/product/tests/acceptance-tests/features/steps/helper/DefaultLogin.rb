require_relative 'DefaultTiming.rb'
# Valid Login information to be used for most tests
class DefaultLogin
  @@adk_url = ENV.keys.include?('ADK_IP') ? 'http://' + ENV['ADK_IP'] : "http://IP_ADDRESS/"
  @@ehmpui_url = ENV.keys.include?('EHMPUI_IP') ? ENV['EHMPUI_IP'] : "https://IP_ADDRESS"
  @@local_testrun = ENV.keys.include?('LOCAL')

  @@default_wait_time = DefaultTiming.default_wait_time
  @@facility_name = "PANORAMA"
  @@accesscode = "PW"
  @@verifycode = "PW"
  @@logged_in = false
  @@login_step=/^POB user is logged into EHMP\-UI with facility as  "(.*?)" accesscode as  "(.*?)" verifycode as  "(.*?)"/

  ARGV.each do|argument|
    if argument.upcase.include? "IP"
      ip_array = argument.split('=')
      @@ehmpui_url = ip_array[1]
    end
  end

  @@screenshot_folder = ENV.keys.include?('SCREENSHOT_FOLDER') ? ENV['SCREENSHOT_FOLDER'] : "screenshots"

  def self.login_step
    return @@login_step
  end

  def self.logged_in
    return @@logged_in
  end

  def self.logged_in=(set_to)
    @@logged_in = set_to
  end

  def self.screenshot_folder
    return @@screenshot_folder
  end

  def self.default_facility_name
    return @@facility_name
  end

  def self.accesscode
    return @@accesscode
  end

  def self.verifycode
    return @@verifycode
  end
  
  def self.wait_time
    return @@default_wait_time
  end

  def self.adk_url
    return @@adk_url
  end
  
  def self.ehmpui_url
    return @@ehmpui_url
  end

  def self.local_testrun
    return @@local_testrun
  end
end # DefaultLogin
