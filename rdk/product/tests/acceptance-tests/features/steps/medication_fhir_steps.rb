path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
require 'VerifyJsonRuntimeValue.rb'

When(/^the client requests medication results for that patient "(.*?)"$/) do |pid|
  temp = RDKQuery.new('medicationdispense-getMedicationDispense')
  temp.add_parameter("subject.identifier", pid)
  temp.add_format("json")
  temp.add_acknowledge("true")
  p temp.path
  @response = HTTPartyRDK.get(temp.path)
end

Then(/^the results contain medication results$/) do |table|
  @json_object = JSON.parse(@response.body)
  result_array = @json_object["entry"]

  json_verify = VerifyJsonRuntimeValue.new
  json_verify.verify_json_runtime_value(result_array, table)
end

When(/^the client breaks glass and repeats a request for out\-patient medication results for that patient "(.*?)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/composition?subject.identifier=#{pid}"
  @response = HTTPartyRDK.get(path)

end

When(/^the client requests out\-patient medication results for that sensitive patient "(.*?)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/composition?subject.identifier=#{pid}"
  @response = HTTPartyRDK.get(path)
end

When(/^the client breaks glass and repeats a request for in\-patient medication results for that patient "(.*?)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/medicationadministration?subject.identifier=" + "#{pid}" + "&_ack=true"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path)
  puts @response
end

When(/^the client requests in\-patient medication results for that sensitive patient "(.*?)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/medicationadministration?subject.identifier=" + "#{pid}"
  @response = HTTPartyRDK.get(path)
  puts @response
end

When(/^the client breaks glass and repeats a request for out\-patient medication statement for that patient "(.*?)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/composition?subject.identifier=#{pid}"
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests out\-patient medication statement for that sensitive patient "(.*?)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/composition?subject.identifier=#{pid}"
  @response = HTTPartyRDK.get(path)
end
