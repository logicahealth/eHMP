Given(/^I am able to post a persistent communication request$/) do |table|
  type = { 'Content-Type' => 'application/json' }
  resource = RDKQuery.new('communicationrequest-add')

  table.map_headers! { |header| header.downcase.to_sym }

  table.hashes.each do |row|
    json = { 'resourceType' => 'CommunicationRequest',
             'sender' => { 'reference' => row[:sender] },
             'recipient' => [{ 'reference' => row[:recipient] }],
             'subject' => { 'reference' => row[:subject] },
             'priority' => { 'coding' => [{ 'code' => row[:priority] }] },
             'payload' => [{ 'contentString' => row[:payload] }] }.to_json
    #puts resource.path, json, type
    @response = HTTPartyWithBasicAuth.post_json_with_authorization(resource.path, json, type)
  end
end

Then(/^I am able to retrieve comm requests for provider "([^"]*)"$/) do |provider|
  #http://IP             /resource/fhir/communicationrequest/9E7A;10000000270
  resource = RDKQuery.new('communicationrequest-add')
  path = resource.path + '/' + provider
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
end

Then(/^I am able to retrieve comm requests for patient "([^"]*)" of provider "([^"]*)"$/) do |patient, provider|
  #http://IP             /resource/fhir/communicationrequest/9E7A;10000000270?subject=patient/9E7A;253
  resource = RDKQuery.new('communicationrequest-add')
  path = resource.path + '/' + provider + '?subject=patient/' + patient
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
  #p @response.body
end

Then(/^I am able to retrieve counters for unread notifications for provider "([^"]*)"$/) do |provider|
  #http://IP             /resource/fhir/communicationrequest/9E7A;10000000270&status=received&count=true
  resource = RDKQuery.new('communicationrequest-add')
  path = resource.path + '/' + provider + '?status=received&count=true'
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
  p @response.body
  response_body = @response.body
  expect(response_body.include? 'count').to be_true
end

Then(/^I am able to retrieve lists of unread notifications for provider "([^"]*)"$/) do |provider|
  #http://IP             /resource/fhir/communicationrequest/9E7A;10000000270?status=received
  resource = RDKQuery.new('communicationrequest-add')
  path = resource.path + '/' + provider + '?status=received'
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
  #p @response.body
end

Then(/^I am able to mark a notification as read as provider "([^"]*)"$/) do |provider|
  #http://IP             /resource/fhir/communicationrequest/setstatus/read/9E7A;10000000270/<ID>
  type = { 'Content-Type' => 'application/json' }
  resource = RDKQuery.new('communicationrequest-add')

  getpath = resource.path + '/' + provider
  @response = HTTPartyWithBasicAuth.get_with_authorization(getpath) 

  for i in 0..JSON.parse(@response.body).length do
    if JSON.parse(@response.body)[i]["status"] == "received"
      break
    end
  end

  id = JSON.parse(@response.body)[i]["id"]

  putpath = resource.path + '/setstatus/read/' + provider + "/" + id
  json = {}.to_json
  #puts resource.path, json, type
  @response = HTTPartyWithBasicAuth.put_json_with_authorization(putpath, json, type)
end

Then(/^I am able to mark a notification as completed as provider "([^"]*)"$/) do |provider|
  #http://IP             /resource/fhir/communicationrequest/setstatus/completed/9E7A;10000000270/<ID>
  type = { 'Content-Type' => 'application/json' }
  resource = RDKQuery.new('communicationrequest-add')

  getpath = resource.path + '/' + provider
  @response = HTTPartyWithBasicAuth.get_with_authorization(getpath)
  id = JSON.parse(@response.body)[0]["id"]

  putpath = resource.path + '/setstatus/completed/' + provider + "/" + id
  json = {}.to_json
  #puts resource.path, json, type
  @response = HTTPartyWithBasicAuth.put_json_with_authorization(putpath, json, type)
end
