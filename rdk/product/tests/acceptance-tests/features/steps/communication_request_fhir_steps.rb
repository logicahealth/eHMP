require 'VerifyJsonRuntimeValue.rb'
require 'json'

#Communication request support backslash in recipientId. The path method of RDKQuery uses URI to escape url.  It does not
#escape the / and if %2F is used it will escape the %.  This is a workaround to use %2F for backslash in features.
def remove_escaped_amp(url)
  url.gsub('%252F', '%2F')
end

Given(/^no communication request for a recipient$/) do
end

Given(/^communication request with an unknown resource id$/) do
end

Given(/^an invalid communication request$/) do
end

Given(/^the system knows about the following communication requests for the "(.*?)" recipient$/) do |recipient, table|
  @recipient_id = recipient

  #puts 'recipient id: ' + @recipient_id

  type = { 'Content-Type' => 'application/json' }
  resource = RDKQuery.new('communicationrequest-add')

  table.map_headers! { |header| header.downcase.to_sym }

  table.hashes.each do |row|
    json = { 'resourceType' => 'CommunicationRequest',
             'category' => { 'coding' => [{ 'code' => row[:category] }] },
             'sender' => { 'reference' => row[:sender] },
             'medium' => [{ 'coding' => [{ 'code' => row[:medium] }] }],
             'recipient' => [{ 'reference' => row[:recipient] }],
             'payload' => [{ 'contentReference' => { 'reference' => row[:payload] } }],
             'status' => row[:status],
             'reason' => [{ 'coding' => [{ 'code' => row[:reason] }] }],
             'subject' => { 'reference' => row[:subject] },
             'priority' => { 'coding' => [{ 'code' => row[:priority] }] } }.to_json

    #puts resource.path, json, type

    @response = HTTPartyRDK.post(resource.path, json, type)
  end
end

When(/^the client retrieves all communication requests for recipient "(.*?)"$/) do |recipient_id|
  resource = RDKQuery.new('communicationrequest-get-all')
  resource.replace_path_var(':recipientId', recipient_id)  unless recipient_id.nil?

  path = remove_escaped_amp(resource.path)
  @response = HTTPartyRDK.get(path)
end

When(/^the client retrieves a communication request for recipient "(.*?)" with the resource id$/) do |recipient_id|
  #resource id generated on backend. Important: one request can create multiple messages (one per recipient)
  #need to get all to get resource id
  #assuming only one message given

  resource = RDKQuery.new('communicationrequest-get-all')
  resource.replace_path_var(':recipientId', recipient_id) unless recipient_id.nil?

  path = remove_escaped_amp(resource.path)
  @response = HTTPartyRDK.get(path)

  result_array = JSON.parse(@response.body)
  expect(result_array).to be_a_kind_of(Array)

  #puts 'result array: ' + result_array.join

  #get single request by id

  resource_id = result_array[0]['id']
  #puts 'resourceId: ' + resourceId

  resource = RDKQuery.new('communicationrequest-get')
  resource.replace_path_var(':recipientId', recipient_id) unless recipient_id.nil?
  resource.replace_path_var(':id', resource_id)

  path = remove_escaped_amp(resource.path)
  @response = HTTPartyRDK.get(path)
end

When(/^the client deletes the communication request for recipient "(.*?)" with a resource id$/) do |recipient_id|
  #resource id generated on backend. Important: one request can create multiple messages (one per recipient)
  #need to get all to get resource id
  #assuming only one message given

  resource = RDKQuery.new('communicationrequest-get-all')
  resource.replace_path_var(':recipientId', recipient_id) unless recipient_id.nil?

  path = remove_escaped_amp(resource.path)
  @response = HTTPartyRDK.get(path)

  result_array = JSON.parse(@response.body)
  expect(result_array).to be_a_kind_of(Array)

  #puts 'delete results array:' + result_array.join

  #delete single request by id

  resource_id = result_array[0]['id']

  #puts 'resource id: ' + resource_id

  resource = RDKQuery.new('communicationrequest-delete')
  resource.replace_path_var(':recipientId', recipient_id)  unless recipient_id.nil?
  resource.replace_path_var(':id', resource_id)

  path = remove_escaped_amp(resource.path)
  @response = HTTPartyRDK.delete(path)
end

When(/^the client retrieves a communication request for recipient "(.*?)" with an unknown resource id$/) do |recipient_id|
  resource = RDKQuery.new('communicationrequest-get')
  resource.replace_path_var(':recipientId', recipient_id)  unless recipient_id.nil?
  resource.replace_path_var(':id', '0-0')

  path = remove_escaped_amp(resource.path)
  @response = HTTPartyRDK.get(path)
end

When(/^trying to add an invalid communication requests$/) do |table|
  type = { 'Content-Type' => 'application/json' }
  resource = RDKQuery.new('communicationrequest-add')

  table.map_headers! { |header| header.downcase.to_sym }

  table.hashes.each do |row|
    json_values = { 'resourceType' => 'CommunicationRequest',
                    'category' => { 'coding' => [{ 'code' => row[:category] }] },
                    'sender' => { 'reference' => row[:sender] },
                    'medium' => [{ 'coding' => [{ 'code' => row[:medium] }] }],
                    'payload' => [{ 'contentReference' => { 'reference' => row[:payload] } }],
                    'status' => row[:status],
                    'reason' => [{ 'coding' => [{ 'code' => row[:reason] }] }],
                    'subject' => { 'reference' => row[:subject] },
                    'priority' => { 'coding' => [{ 'code' => row[:priority] }] } }

    if row[:recipient]
      json_values[:recipient] = [{ 'reference' => row[:recipient] }]
    end

    json = json_values.to_json

    #puts resource.path, json, type

    @response = HTTPartyRDK.post(resource.path, json, type)
  end
end

Then(/^the response is a list containing (\d+) communication requests$/) do |number_of_results|
  num_results_int = number_of_results.to_i
  json = JSON.parse(@response.body)

  expect(json).to be_a_kind_of(Array)
  expect(json.count).to eq(num_results_int) unless number_of_results.nil?
end

Then(/^one of the communication request has the following data:$/) do |table|
  result = JSON.parse(@response.body)

  json_verify = VerifyJsonRuntimeValue.new
  json_verify.verify_json_runtime_value(result, table)
end

Then(/^the communication request contains$/) do |table|
  result = [JSON.parse(@response.body)]

  json_verify = VerifyJsonRuntimeValue.new
  json_verify.verify_json_runtime_value(result, table)
end

Then(/^remove all communication requests for recipient "(.*?)"/) do |recipient_id|
  # need to get all to get resource id
  resource = RDKQuery.new('communicationrequest-get-all')
  resource.replace_path_var(':recipientId', recipient_id) unless recipient_id.nil?

  path = remove_escaped_amp(resource.path)
  @response = HTTPartyRDK.get(path)

  result_array = JSON.parse(@response.body)
  expect(result_array).to be_a_kind_of(Array)

  for i in 0..result_array.length-1
    resource_id = result_array[i]['id']
    resource = RDKQuery.new('communicationrequest-delete')
    resource.replace_path_var(':recipientId', recipient_id)  unless recipient_id.nil?
    resource.replace_path_var(':id', resource_id)

    path = remove_escaped_amp(resource.path)
    @response = HTTPartyRDK.delete(path)
  end
end
