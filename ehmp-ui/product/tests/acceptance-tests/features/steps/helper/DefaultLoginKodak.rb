# Valid Login information to be used for most tests
class DefaultLoginKodak
  @@adk_url = ENV.keys.include?('ADK_IP') ? 'http://' + ENV['ADK_IP'] : "http://IP        /"
  @@ehmpui_url = ENV.keys.include?('EHMPUI_IP') ? ENV['EHMPUI_IP'] : "https://IP        "
  @@default_wait_time = 30

  @@facility_name = "KODAK"
  @@accesscode = "REDACTED"
  @@verifycode = "REDACTED"

  @@screenshot_folder = ENV.keys.include?('SCREENSHOT_FOLDER') ? ENV['SCREENSHOT_FOLDER'] : "screenshots"

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
end # DefaultLogin
