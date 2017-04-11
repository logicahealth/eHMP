require 'net/http'

action :execute do
  ruby_block "wait_for_connection:#{new_resource.name}" do
    block do
      raise "Could not connect to #{new_resource.url} after #{new_resource.attempts} attempts!" unless attempt_connection(new_resource.url, 1, new_resource.attempts)
    end
  end
end

def attempt_connection(url, attempt, max_attempts)
  return false if attempt > max_attempts
  begin
    Chef::Log.info("Attempt #{attempt} to connect to #{url}")
    response_code = Net::HTTP.get_response(URI(url)).code
    unless response_code =~ /2\d\d/
      Chef::Log.info("Received response #{response_code}")
      sleep(5)
      return attempt_connection(url, attempt + 1, max_attempts)
    end
  rescue Exception => e
    Chef::Log.info(e.message)
    sleep(5)
    return attempt_connection(url, attempt + 1, max_attempts)
  end
  true
end
