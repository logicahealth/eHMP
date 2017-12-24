#
# Class for clearing the cache on a JDS database
#
class JDSCache
  # Clear Cache
  def self.clear(base_uri)
    # Require specific gem version at convergence-time
    gem 'httparty', '=0.11.0'
    require 'httparty'

    # get count of total syncstatus objects
    before_count = get_count(get_syncstatuses(base_uri).body)

      # Clear VPR, ODC, and Error Log
      clear_list = ['vpr', 'data', 'vxsyncerr/']

      clear_list.each do |endpoint|
      begin
        response = HTTParty.delete("#{base_uri}/#{endpoint}?confirm=true")
      rescue SocketError
        raise "Could not connect to #{base_uri}"
      end
      unless response.code == 200
        fail "Incorrect response received: #{response.code} #{response.body}"
      end
    end

    # get count of total syncstatus objects (should be 0)
    after_count = get_count(get_syncstatuses(base_uri).body)
    Chef::Log.info "Cleared JDS (#{before_count} -> #{after_count} syncstatus objects)"
  end

  def self.get_syncstatuses(base_uri)
    HTTParty.get("#{base_uri}/data/find/syncstatus/uid")
  end

  def self.get_count(json)
    JSON.parse(json)['data']['totalItems']
  end
end
