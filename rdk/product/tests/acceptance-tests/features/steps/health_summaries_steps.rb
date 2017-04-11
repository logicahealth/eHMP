# healthsummaries-getSitesInfoFromPatientData

When(/^the client requests health summaries for the patient "([^"]*)"$/) do |pid|
  request = RDKQuery.new('healthsummaries-getSitesInfoFromPatientData')
  request.add_parameter('pid', pid)

  p request.path
  path = request.path
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
end

Then(/^the health summaries response contains$/) do |table|
  @json_object = JSON.parse(@response.body)
  result_array = @json_object["data"]

  json_verify = VerifyJsonRuntimeValue.new
  json_verify.verify_json_runtime_vlaue(result_array, table)
end
