When(/^the client requests the permission set categories$/) do
  request = RDKQuery.new('permission-sets-categories')
  @response = HTTPartyRDK.get_as_user(request.path, "SITE;USER  ", "PW      ")
end

Then(/^the permission set categories contain the attributes$/) do |table|
  response_body = JSON.parse(@response.body)
  json_verify = JsonVerifier.new

  result_array = response_body["data"]

  table.rows.each do | table_row |
    json_verify.reset_output
    found = json_verify.defined?(table_row, result_array)
    expect(found).to eq(true), "Response did not contain #{table_row}. Response is #{response_body}"
  end
end
