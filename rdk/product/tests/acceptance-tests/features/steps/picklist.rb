require 'VerifyJsonRuntimeValue.rb'

Then(/^the Service Conntected result contains$/) do |table|
  result_array = @json_object["data"]
 
  table.rows.each do |label, abbrevation, status|
    if status.upcase == "ON"
      status = "{\"enabled\"=>true, \"value\"=>\"\"}"
    else
      status = "{\"enabled\"=>false, \"value\"=>\"\"}"
    end
    value = result_array[abbrevation]
    expect(status.to_s).to eq(value.to_s), "Expecting #{abbrevation} value to be #{status} but got #{value}"
  end
end

When(/^the client requests picklist with the parameters and site "([^"]*)"$/) do |site, table|
  querypicklist = RDKQueryPicklist.new('write-pick-list')
  table.rows.each do |row|
    querypicklist.add_parameter(row[0], row[1])
  end
  querypicklist.add_parameter('site', site)
  path = querypicklist.path
  @response = HTTPartyRDK.get_as_user(path, "#{site};USER  ", "PW      ")
  @json_object = JSON.parse(@response.body)
end

When(/^the client requests a picklist with the parameters for "([^"]*)" with the user "([^"]*)"$/)  do |title, username, table|
  querypicklist = RDKQueryPicklist.new('write-pick-list-' + title)
  table.rows.each do |row|
    querypicklist.add_parameter(row[0], row[1])
  end
  path = querypicklist.path
  @response = HTTPartyRDK.get_as_user(path, username, TestClients.password_for(username))
  @json_object = JSON.parse(@response.body)
end

Then(/^the result contains$/) do |table|
  result_array = @json_object["data"]
  table.rows.each do |field, expected_value|
    actual_value = result_array[field]
    if expected_value.upcase.start_with? 'CONTAINS'
      expect(expected_value).to include(actual_value.to_s), "Expecting #{field} to be #{expected_value} but got #{actual_value}"
    else
      expect(expected_value).to eq(actual_value.to_s), "Expecting #{field} to be #{expected_value} but got #{actual_value}"
    end
  end
end

Then(/^the picklist result contains$/) do |table|
  test = VerifyJsonRuntimeValue.new
  result_array = @json_object["data"]
  test.verify_json_runtime_value(result_array, table)
end

Then(/^the picklist result is empty$/) do
  result_array = @json_object["data"]
  expect(result_array.length).to eq(0)
end
