def wait_for_jar(artifactId, version, user, password, attempt, max_attempts)
  raise "#{artifactId} did not deploy correctly" if attempt > max_attempts
  begin
    unless jar_deployed?(artifactId, version, user, password)
      puts "waiting for deployment"
      sleep(2)
      return wait_for_jar(artifactId, version, user, password, attempt + 1, max_attempts)
    end
    true
  end
end

def deactivate_jar(groupId, artifactId, version, user, password, attempt, max_attempts)
  raise "#{artifactId} did not deactivate" if attempt > max_attempts
  begin
    unless jar_deactivated?(groupId, artifactId, version, user, password)
      puts "waiting for deactivation"
      sleep(2)
      return deactivate_jar(groupId, artifactId, version, user, password, attempt + 1, max_attempts)
    end
    true
  end
end

def jar_deployed?(artifactId, version, user, password)
  deployed_jars(user, password).each{ |unit|
    # return true if unit["artifactId"] == artifactId && unit["version"] == version && unit["status"] == "DEPLOYED"
    if (unit.key?("deployment-unit")) # true if "deployment-unit" is defined - BPM v6.3, false fro BPM v6.1
      return true if unit["deployment-unit"]["artifactId"] == artifactId && unit["deployment-unit"]["version"] == version && unit["deployment-unit"]["status"] == "DEPLOYED"
    else
      return true if unit["artifactId"] == artifactId && unit["version"] == version && unit["status"] == "DEPLOYED"
    end
  }
  false
end

def jar_deactivated?(groupId, artifactId, version, user, password)
  auth_string = "#{user}:#{password}"
  url = URI("http://#{node[:ipaddress]}:8080/business-central/rest/deployment/#{groupId}:#{artifactId}:#{version}/deactivate")

  http = Net::HTTP.new(url.host, url.port)
  request = Net::HTTP::Post.new(url)
  request["Authorization"] = "Basic #{Base64.encode64(auth_string)}"
  request["Accept"] = "application/json"
  begin
    response = http.request(request)
    body = JSON.parse(response.body)
    return true if body["status"] == "SUCCESS"
    Chef::Log.warn("jar_deactivated: CHEF Received this response.body: #{response.body}")
    false
  rescue
    Chef::Log.warn("Deactivation request returned a bad result:  #{response.body}")
    false
  end
end

def deployed_jars(user, password)
  require 'net/http'

  auth_string = "#{user}:#{password}"
  url = URI("http://#{node[:ipaddress]}:8080/business-central/rest/deployment")
  
  http = Net::HTTP.new(url.host, url.port)
  request = Net::HTTP::Get.new(url)
  request["authorization"] = "Basic #{Base64.encode64(auth_string)}"
  request["accept"] = "application/json"

  response = http.request(request)
  body = JSON.parse(response.body)
  body["deploymentUnitList"] || []
end
