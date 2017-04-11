When(/^the client requests the ehmp-config$/) do
  request = RDKQuery.new('ehmp-config')
  @response = HTTPartyRDK.get(request.path)
end

And(/^the ehmp-config has a key of "(.*?)"$/) do |key|
  response_body = JSON.parse(@response.body)
  expect(response_body['data']).to_not be_nil, "Expected response body to contain hash tag [data]"
  expect(response_body['data'][key]).to_not be_nil, "Expect response body to contain hash tag [data]#{key}"
end

Then(/^the ehmp\-config contains the attribute$/) do |table|
  response_body = JSON.parse(@response.body)
  json_verify = JsonVerifier.new

  result_array = response_body["data"]

  table.rows.each do | table_row |
    json_verify.reset_output
    found = json_verify.defined?(table_row, result_array)
    expect(found).to eq(true), "Response did not contain #{table_row}. Response is #{response_body}"
  end
end
