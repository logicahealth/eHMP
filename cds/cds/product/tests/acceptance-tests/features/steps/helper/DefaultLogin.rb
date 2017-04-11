require 'httparty'

class DefaultLogin
  @@default_wait_time = 50

  # TODO: Once RDK_FETCH_HOST is defined and RDK_IP is removed, clean up code below.  Ref. US7931
  if ENV.keys.include?('RDK_FETCH_HOST')
    @@rdk_fetch_url = ENV.keys.include?('RDK_FETCH_HOST') ? 'http://' + ENV['RDK_FETCH_HOST'] + ":" + ENV['RDK_FETCH_PORT']  : "http://10.4.4.105:8888"
  else
    @@rdk_fetch_url = ENV.keys.include?('RDK_IP') ? 'http://' + ENV['RDK_IP'] + ":" + ENV["RDK_PORT"]  : "http://10.4.4.105:8888"
  end

  @@rdk_writeback_url = ENV.keys.include?('RDK_WRITEBACK_HOST') ? 'http://' + ENV['RDK_WRITEBACK_HOST'] + ":" + ENV["RDK_WRITEBACK_PORT"] : "http://10.4.4.105:9999"
  @@rdk_picklist_url = ENV.keys.include?('RDK_PICKLIST_HOST') ? 'http://' + ENV['RDK_PICKLIST_HOST'] + ":" + ENV["RDK_PICKLIST_PORT"] : "http://10.4.4.105:7777"

  # TODO: Once JDS_HOST is defined and JDS_IP is removed, clean up code below.  Ref. US7931
  if ENV.keys.include?('JDS_HOST')
    @@jds_url = ENV.keys.include?('JDS_HOST') ? 'http://' + ENV['JDS_HOST'] + ":" + ENV['JDS_PORT']  : 'http://10.2.2.110:9080'
  else
    @@jds_url = ENV.keys.include?('JDS_IP') ? 'http://' + ENV['JDS_IP'] + ":9080" : "http://10.2.2.110:9080"
  end

  @@cdsinvocation_url = ENV.keys.include?('CDSINVOCATION_IP') && ENV.keys.include?('CDSINVOCATION_PORT') ? 'http://' + ENV['CDSINVOCATION_IP'] + ":" + ENV['CDSINVOCATION_PORT']  : 'http://10.2.2.49:8080'

  @@cdsdb_url = ENV.keys.include?('CDSDB_IP') && ENV.keys.include?('CDSDB_PORT') ? "https://#{ENV['CDSDB_IP']}:#{ENV['CDSDB_PORT']}" : 'https://10.2.2.125:27017'

  @@opencds_url = ENV.keys.include?('OPENCDS_IP') && ENV.keys.include?('OPENCDS_PORT') ? "http://#{ENV['OPENCDS_IP']}:#{ENV['OPENCDS_PORT']}" : 'http://10.2.2.47:8080'
    
  @@cdsdashboard_url = ENV.keys.include?('CDSDASHBOARD_IP') && ENV.keys.include?('CDSDASHBOARD_PORT') ? "http://#{ENV['CDSDASHBOARD_IP']}:#{ENV['CDSDASHBOARD_PORT']}" : 'http://10.2.2.48:8080'

  # TODO: Once VISTA_PANORAMA_HOST is defined and VISTA_IP is removed, clean up code below.  Ref. US7931
  if ENV.keys.include?('VISTA_PANORAMA_HOST')
    @@vista_url = ENV.keys.include?('VISTA_PANORAMA_HOST') ? 'http://' + ENV['VISTA_PANORAMA_HOST'] + ":" + ENV['VISTA_PANORAMA_PORT']  : 'http://10.2.2.101'
  else
    @@vista_url = ENV.keys.include?('VISTA_IP') ? 'http://' + ENV['VISTA_IP'] + ":" : "http://10.2.2.101"
  end

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

  def self.vista_url
    return @@vista_url
  end

  def self.cdsinvocation_url
    return @@cdsinvocation_url
  end

  def self.cdsdb_url
    return @@cdsdb_url
  end

  def self.opencds_url
    return @@opencds_url
  end
    
  def self.cdsdashboard_url
    return @@cdsdashboard_url
  end
end
