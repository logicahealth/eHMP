require 'httparty'

class DefaultLogin
  @@default_wait_time = 50

  local_ip = "http://IP        "

  @@rdk_fetch_url = ENV.keys.include?('RDK_FETCH_HOST') ? 'http://' + ENV['RDK_FETCH_HOST'] + ":" + ENV["RDK_FETCH_PORT"]  : "#{local_ip}:PORT"
  @@rdk_writeback_url = ENV.keys.include?('RDK_WRITEBACK_HOST') ? 'http://' + ENV['RDK_WRITEBACK_HOST'] + ":" + ENV["RDK_WRITEBACK_PORT"] : "#{local_ip}:PORT"
  @@rdk_picklist_url = ENV.keys.include?('RDK_PICKLIST_HOST') ? 'http://' + ENV['RDK_PICKLIST_HOST'] + ":" + ENV["RDK_PICKLIST_PORT"] : "#{local_ip}:PORT"

  @@jds_url = ENV.keys.include?('JDS_IP') ? 'http://' + ENV['JDS_IP'] + ":PORT" : "http://IP             "
  @@pjds_url = ENV.keys.include?('PJDS_IP') ? 'http://' + ENV['PJDS_IP'] + ":PORT" : "http://IP             "

  def self.rdk_writeback_url
    return @@rdk_writeback_url
  end

  def self.rdk_picklist_url
    return @@rdk_picklist_url
  end

  def self.rdk_fetch_url
    return @@rdk_fetch_url
  end

  def self.wait_time
    return @@default_wait_time
  end

  def self.jds_url
    return @@jds_url
  end

  def self.pjds_url
    return @@pjds_url
  end
end
