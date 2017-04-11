class DocumentResponseCompare
  attr_accessor :total_items
  attr_accessor :current_item_count
  attr_accessor :first_item
end

Given(/^the patient with pid "([^"]*)" has at least (\d+) documents$/) do |pid, num|
  request = QueryRDKDomain.new('document-view')
  request.add_parameter('pid', pid)

  path = request.path
  @response = HTTPartyRDK.get(path)
  expect(@response.code).to eq(200), "Error: unable to determine precondition for test (#{@response.code})"
  body = JSON.parse(@response.body)

  expect(body['data']).to_not be_nil, "documents response data is nil"
  expect(body['data']['totalItems']).to_not be_nil, "documents response ['data']['totalItems'] is nil"

  @total_items = body['data']['totalItems']
  expect(@total_items.to_i).to be >= num.to_i
end

When(/^the client gets a document\-view request with parameters$/) do |table|
  request = QueryRDKDomain.new('document-view')
  table.rows.each do | parameter, value |
    if value.eql?('TOTAL_ITEMS')
      expect(@total_items).to_not be_nil, "This scenario requires a variable (@total_items) that should have been set in a previous step and was not"
      request.add_parameter(parameter, "#{@total_items}")
    else
      request.add_parameter(parameter, value)
    end
  end
  path = request.path
  @response = HTTPartyRDK.get(path)
  expect(@response.code).to eq(200)
end

When(/^the client posts a document\-view request with parameters$/) do |table|
  request = QueryRDKDomain.new('document-view')
  payload = {}

  table.rows.each do | parameter, value |
    payload[parameter] = value
  end
  path = request.path
  @response = HTTPartyRDK.post(path, payload.to_json, TaskHelper.headers)
end

When(/^the client posts a document\-view request with a query parameter for patient "([^"]*)" and a body parameter for "([^"]*)"$/) do |queryPid, bodyPid, table|
  request = QueryRDKDomain.new('document-view')
  request.add_parameter('pid', queryPid)
  payload = {}
  payload['pid'] = bodyPid
  table.rows.each do | parameter, value |
    payload[parameter] = value
  end
  path = request.path
  @response = HTTPartyRDK.post(path, payload.to_json, TaskHelper.headers)
end

When(/^the client notes documents GET results$/) do
  body = JSON.parse(@response.body)
  expect(body['data']['items'].length).to be > 0
  @get_result = DocumentResponseCompare.new
  @get_result.total_items = body['data']['totalItems']
  @get_result.current_item_count = body['data']['currentItemCount']
  @get_result.first_item = body['data']['items'][0]
  p @get_result
end

Then(/^the documents FETCH results are the same as the GET results$/) do
  body = JSON.parse(@response.body)
  expect(body['data']['totalItems']).to eq(@get_result.total_items)
  expect(body['data']['currentItemCount']).to eq(@get_result.current_item_count)
  expect(body['data']['items'][0]).to eq(@get_result.first_item), "expected first item to match from GET and POST"
end

Then(/^the response message is "([^"]*)"$/) do |message|
  body = JSON.parse(@response.body)
  p @response.body
  expect(body['message']).to eq(message)
end
