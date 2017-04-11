def jar_deployed?(artifactId, version, user, password)
  require 'uri'
  require 'net/http'

  auth_string = "#{user}:#{password}"
  url = URI("http://#{node[:ipaddress]}:8080/business-central/rest/deployment")
  
  http = Net::HTTP.new(url.host, url.port)
  request = Net::HTTP::Get.new(url)
  request["authorization"] = "Basic #{Base64.encode64(auth_string)}"
  request["accept"] = "application/json"

  response = http.request(request)
  body = JSON.parse(response.body)

  body["deploymentUnitList"].each{ |unit|
    return true if unit["artifactId"] == artifactId && unit["version"] == version && unit["status"] == "DEPLOYED"
  }
  false
end
