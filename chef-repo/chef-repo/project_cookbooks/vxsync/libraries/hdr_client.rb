#
# Class for clear all subscription status in HDR pub/sub mode mock server
#
# Require specific gem version at convergence-time

class HDRClient
  # Clear All Subscription
  def self.unsubscribeAll(base_uri)
    # Require specific gem version at convergence-time
    gem 'httparty', '=0.11.0'
    require 'httparty'
	begin
		if base_uri.end_with?("/")
			base_uri = base_uri[0..-2]
		end
	  response = HTTParty.post("#{base_uri}/cancel/all")
	rescue SocketError
	  raise "Could not connect to #{base_uri}"
	end
	unless response.code == 200
	  fail "Incorrect response received: #{response.code} #{response.body}"
	end
	Chef::Log.info "unsubscribeAll: #{response}"
    #Chef::Log.info "Cleared JDS (#{before_count} -> #{after_count} syncstatus objects)"
  end

  def self.ping(base_url)
    Chef::Log.info HTTParty.get("#{base_url}/ping")
  end
end