

When(/^the client adds a notes for patient "(.*?)" with content "(.*?)"$/) do |pid, content|
  path = String.new(DefaultLogin.rdk_writeback_url)
  @response = HTTPartyWithCookies.post_json_with_cookies(path+"/resource/write-health-data/patient/#{pid}/notes", content, { "Content-Type"=>"application/json" })
end

When(/^the client requests unsigned notes for the patient "(.*?)"$/) do |pid|
  path = String.new(DefaultLogin.rdk_fetch_url)
  @response = HTTPartyWithBasicAuth.get_with_authorization(path+"/resource/patient/record/notes?pid=" + pid + "&localPid=" + pid)
  response_body = JSON.parse(@response.body)
  @json_object = response_body["data"]["items"][0]
  result_array = response_body["data"]["items"][0]["notes"]
  @localid_delete = result_array[result_array.size-1]["uid"]
end

When(/^the client requests to delete an unsigned notes for the patient "(.*?)"$/) do |pid|
  path = String.new(DefaultLogin.rdk_writeback_url)
  @response = HTTPartyWithCookies.delete_with_cookies(path +"/resource/write-health-data/patient/#{pid}/notes/#{@localid_delete}")
end
