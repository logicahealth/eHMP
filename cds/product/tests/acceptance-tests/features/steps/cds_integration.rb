
When(/^user sends request to create patient list with content "(.*?)"$/) do | payload |
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/list"
  p path
  p payload
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.post_json_with_authorization(path, payload, type)
end

Then(/^a successful response is returned$/) do
  puts @response.code
  expect(@response.code).to eq(200)
end

Then(/^a successful database delete response is returned$/) do
  puts @response.code
  [200, 404].should include @response.code
end

list_id = ""
Then(/^a successful response is returned for created$/) do
  puts @response.code
  expect(@response.code).to eq(201)
end

And(/^the patient list id is returned$/) do
  puts @response.body
  json = JSON.parse(@response.body)
  id = json["data"][0]["_id"]
  list_id = id
  puts "this is patient list id= #{list_id}"
end

When(/^user adds a patient in the patient list$/) do
  puts "In the add patient"
  puts "this is id= #{list_id}"
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/list/patients?id=#{list_id}&pid=9E7A;100184"
  p path
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.post_json_with_authorization(path, payload, type)
end

Given(/^a patient list exists$/) do
  #nothing to verify
end

And(/^the cdsjob is scheduled for patient list with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/execute/request"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.post_json_with_authorization(path, payload, type)
end

cdsjob_id= ""
And(/^a cdsjob id is returned$/) do
  json = JSON.parse(@response.body)
  id = json["data"][0]["_id"]
  cdsjob_id = id
  puts "this is id= #{id}"
end

When(/^a Hypertension rule is ran for patient list$/) do
  host = QueryCDSInvocation.new
  path = host.path+"/cds-results-service/core/executeRulesJob/TestCDSJob"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.post_json_with_authorization(path, payload, type)
end

Then(/^a workproduct is created for Hypertension$/) do
  puts @response.body
  json = JSON.parse(@response.body)
  total = json["totalSubjectsProcessed"]
  expect(total).to eq(1)
end

And(/^user sends GET request for a created patient list$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/list?id=#{list_id}"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.get_json_with_authorization(path, payload, type)
end

And(/^user sends PUT request to update patient list with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/list?id=#{list_id}"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.put_json_with_authorization(path, payload, type)
end

And(/^user sends DELETE request to delete a patient list$/) do
  temp = QueryRDKCDS.new
  puts "this is patient list id= #{list_id}"
  path = temp.path + "/patient/list?name=TestPatientList"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.delete_json_with_authorization(path, payload, type)
end

And(/^user sends GET request to get patient list$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/list"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.get_json_with_authorization(path, payload, type)
end

When(/^user sends request to create a work product with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/product"
  p path
  p payload
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.post_json_with_authorization(path, payload, type)
end
work_id = ""
And(/^a work product id is returned$/) do
  json = JSON.parse(@response.body)
  id = json["data"][0]["id"]
  work_id = id
  puts "this is work id= #{id}"
end

And(/^user sends GET request for a created work product$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/product?id=#{work_id}"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSsysAdminAuth.get_json_with_authorization(path, payload, type)
end

And(/^user sends PUT request to update a work product with content "(.*?)"$/) do | payload |
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/product?id=#{work_id}"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.put_json_with_authorization(path, payload, type)
end

Then(/^user sends DELETE request to delete a work product$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/product?id=#{work_id}"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.delete_json_with_authorization(path, payload, type)
end

And(/^user sends GET request for a created cdsjob$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/execute/request?name=TestCDSJob"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.get_json_with_authorization(path, payload, type)
end

And(/^user sends PUT request to update a cdsjob with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/execute/request?name=TestCDSJob"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.put_json_with_authorization(path, payload, type)
end

And(/^user sends DELETE request to delete a cdsjob$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/execute/request?name=TestCDSJob"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.delete_json_with_authorization(path, payload, type)
end

And(/^user sends POST request to schedule a job$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/schedule/job?jobname=TestJob&cdsname=TestCDSJob"
  p path
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.post_json_with_authorization(path, payload, type)
end

And(/^user sends GET request for a scheduled job$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/schedule/job?jobname=TestJob"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.get_json_with_authorization(path, payload, type)
end

And(/^user sends PUT request to update a scheduled job$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/schedule/job?jobname=TestJob"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.put_json_with_authorization(path, payload, type)
end

And(/^user sends DELETE request to delete a scheduled job$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/schedule/job?jobname=TestJob"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.delete_json_with_authorization(path, payload, type)
end

Given(/^user sends request to create definition with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/definition"
  p path
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.post_json_with_authorization(path, payload, type)
end

def_id = ""
And(/^the definition id is returned$/) do
  json = JSON.parse(@response.body)
  id = json["data"][0]["_id"]
  def_id = id
  puts "this is id= #{id}"
end

And(/^user sends GET request for a definition$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/definition?id=#{def_id}"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.get_json_with_authorization(path, payload, type)
end

And(/^user sends POST request to copy the created definition$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/definition/copy?id=#{def_id}&newname=mydefinition"
  p path
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.post_json_with_authorization(path, payload, type)
end

copydef_id = ""
And(/^the copy of definition id is returned$/) do
  json = JSON.parse(@response.body)
  id = json["data"][0]["_id"]
  copydef_id = id
  puts "this is copy def id= #{id}"
end

And(/^user sends DELETE request to delete the copy of definition$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/definition?id=#{copydef_id}"
  p path
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.delete_json_with_authorization(path, payload, type)
end

When(/^user sends DELETE request to delete the defintion$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/definition?id=#{def_id}"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.delete_json_with_authorization(path, payload, type)
end

Given(/^user sends request to create criteria with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/criteria"
  p path
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.post_json_with_authorization(path, payload, type)
end

criteria_id = ""
And(/^the criteria id is returned$/) do
  json = JSON.parse(@response.body)
  id = json["data"][0]["_id"]
  criteria_id = id
  puts "this is id= #{id}"
end

And(/^user sends GET request for a criteria$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/criteria?id=#{criteria_id}"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.get_json_with_authorization(path, payload, type)
end

When(/^user sends DELETE request to delete a criteria$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/criteria?id=#{criteria_id}"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.delete_json_with_authorization(path, payload, type)
end

Given(/^subscriptions are available fo the user$/) do
  #nothing to verify
end

And(/^user sends GET request for subscriptions$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/subscriptions"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.get_json_with_authorization(path, payload, type)
end

And(/^user sends PUT request to update subscriptions with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/subscriptions"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.put_json_with_authorization(path, payload, type)
end

When(/^user sends DELETE request to delete the subscription$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/subscriptions"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.delete_json_with_authorization(path, payload, type)
end

And(/^user sends GET request for inbox$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/inbox"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, payload, type)
end

When(/^client sends GET request for a static list of the metrics service$/) do
  temp = QueryRDKCDSMetrics.new
  path = temp.path + "/definitions"
  type = { " Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.get_json_with_authorization(path, type)
end

Then(/^a successful response is returned with field data instead of payload$/) do
  json = JSON.parse(@response.body)
  id = json["data"][0]["_id"]
  puts id
end

When(/^the "(.*?)" is requested with parameter "(.*?)" value "(.*?)" for patient "(.*?)"$/) do |observation, date, value, patient|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{patient}/#{observation}?#{date}=#{value}"
  encoded = URI.encode(path)    
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.get_json_with_authorization(encoded, type)
end

Then(/^a bad request response is returned$/) do
  puts @response.code
  expect(@response.code).to eq(400)
end

Then(/^the FHIR results contain "(.*?)"$/) do |_arg1, table|
  @json_object = JSON.parse(@response.body)
  result_array = @json_object["entry"]
  json_verify = VerifyJsonRuntimeValue.new
  json_verify.verify_json_runtime_vlaue(result_array, table)
end

entryname = ""
When(/^user sends POST request to create cds engine registry entry with payload "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/engine/registry"
  p path
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.post_json_with_authorization(path, payload, type)
  puts @response.body
  json = JSON.parse(@response.body)
  puts json
  puts "#######################################"
  puts entryname
end

And(/^successful response returned\.$/) do
  puts @response.code
  expect(@response.code).to eq(201)
  json = JSON.parse(@response.body)
  puts json["data"][0]["_id"]
  puts json["data"][0]["version"]
end

When(/^request CDS engine by name$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/engine/registry?name=testingEngineRegistry"
  type = { " Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.get_json_with_authorization(path, type)
  expect(@response.code).to eq(200)
end

Then(/^get registry$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/engine/registry"
  @response = HTTPartyWithSysAdminAuth.get_json_with_authorization(path)
  puts @response.body
  expect(@response.code).to eq(200)
end
    
Then(/^delete the entry$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/engine/registry?name=testingEngineRegistry"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.delete_json_with_authorization(path, payload, type)
  puts @response.body
  expect(@response.code).to eq(200)
end

When(/^the entry is deleted$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/engine/registry?name=testingEngineRegistry"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.delete_json_with_authorization(path, payload, type)
  puts @response.body
end

When(/^modify the entry with payload "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/engine/registry"
  p path
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.put_json_with_authorization(path, payload, type)
  puts @response.body
  json = JSON.parse(@response.body)
  puts json
  puts "modified entry:"
  puts @response.body
end

Then(/^delete modified entry$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/engine/registry?name=testingEngineRegistry"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.delete_json_with_authorization(path, payload, type)
  puts @response.body
  expect(@response.code).to eq(200)
end

When(/^request CDS engine by filter$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/engine/registry?filter={\"name\":\"testingEngineRegistry\"}"
  type = { " Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.get_json_with_authorization(path, type)
  expect(@response.code).to eq(200)
  puts @response.body
end

When(/^the "(.*?)" is requested with all parameters for patient "(.*?)"$/) do |observation, patient|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{patient}/#{observation}?count=5&code=http://loinc.org|8310-5&date=2015"
  encoded = URI.encode(path)    
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.get_json_with_authorization(encoded, type)
end

Given(/^the patient identifiers list from patient "([^"]*)" by calling RDK$/) do |arg1|
  temp = QueryRDKPRD.new
  path = temp.path + "#{arg1}"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.get_json_with_authorization(path, type)
  puts @response.body
  json = JSON.parse(@response.body)
  @one = json["data"]["items"][1]["icn"]
  @two = json["data"]["items"][1]["pid"] 
  puts "##########################"
  puts "identifier 1: #{@one}"
  puts "##########################"
  puts "identifier 2: #{@two}"
  puts "##########################"
end

When(/^the client send a request for patient list membership status with one identifier$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/list/status?type=pid&value=#{@one}"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.get_json_with_authorization(path, type)
  json = JSON.parse(@response.body)
  @result = json["message"]
  puts @response.body
  expect(@result).to eq("true")
end

Then(/^the message true returned$/) do
  puts @response.body
  json = JSON.parse(@response.body)
  @result = json["message"]
  puts @result 
end

When(/^the client send a request for patient list membership status with another identifier$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/list/status?type=pid&value=#{@two}"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.get_json_with_authorization(path, type)
  puts @response.body
  expect(@result).to eq("true")
end

Then(/^delete the patient list created before$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/list?name=Testing"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithSysAdminAuth.delete_json_with_authorization(path, payload, type)
  puts @response.body
end

Then(/^FHIR date and time convert to Zulu format for Diagnostic Report$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["issued"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Allergies$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["updated"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)\.(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time convert to Zulu format for Immunization$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["date"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time convert to Zulu format for Observation$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["appliesDateTime"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^the value of field total is more than one$/) do
  json = JSON.parse(@response.body)
  @total = json["total"]
  puts @total
  expect(@total).to be >= 1
end
