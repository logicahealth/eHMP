
When(/^user sends request to create patient list with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/list" 
  p path
  p payload
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.post_json_with_authorization(path, payload, type)
  puts @response.body
end

Then(/^a successful response is return$/) do 
  puts @response.code
  expect(@response.code).to eq(200)
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
  @response = HTTPartyWithBasicAuth.post_json_with_authorization(path, payload, type)
  puts @response.body
end

Given(/^a patient list exists$/) do
  #nothing to verify
end

And(/^the cdsjob is scheduled for patient list with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/execute/request"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.post_json_with_authorization(path, payload, type)
  puts @response.body
end

cdsjob_id= ""
And(/^a cdsjob id is returned$/) do
  json = JSON.parse(@response.body)
  id = json["data"][0]["_id"]
  cdsjob_id = id
  puts "this is id= #{id}"
end

When(/^a Hypertension rule is ran for patient list$/) do 
  path = "http://#{ENV['CDSINVOCATION_IP']}:8080/cds-results-service/core/executeRulesJob/TestCDSJob"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.post_json_with_authorization(path, payload, type)
  puts @response.body
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
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, payload, type)
  puts @response.body
end

And(/^user sends PUT request to update patient list with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/list?id=#{list_id}"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.put_json_with_authorization(path, payload, type)
  # puts @response.body
end

And(/^user sends DELETE request to delete a patient list$/) do
  temp = QueryRDKCDS.new
  puts "this is patient list id= #{list_id}"
  path = temp.path + "/patient/list?name=TestPatientList"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.delete_json_with_authorization(path, payload, type)
  puts @response.body
end

And(/^user sends GET request to get patient list$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/list"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, payload, type)
end

When(/^user sends request to create a work product with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/product" 
  p path
  p payload
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.post_json_with_authorization(path, payload, type)
  puts @response.body
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
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, payload, type)
  puts @response.body
end 

And(/^user sends PUT request to update a work product with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/product?id=#{work_id}"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.put_json_with_authorization(path, payload, type)
  puts @response.body
end

Then(/^user sends DELETE request to delete a work product$/) do 
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/product?id=#{work_id}"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.delete_json_with_authorization(path, payload, type)
  puts @response.body
end

And(/^user sends GET request for a created cdsjob$/) do 
  temp = QueryRDKCDS.new
  path = temp.path + "/execute/request?name=TestCDSJob"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, payload, type)
  puts @response.body
end

And(/^user sends PUT request to update a cdsjob with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/execute/request?name=TestCDSJob"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.put_json_with_authorization(path, payload, type)
  puts @response.body
end 

And(/^user sends DELETE request to delete a cdsjob$/) do 
  temp = QueryRDKCDS.new
  path = temp.path + "/execute/request?name=TestCDSJob"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.delete_json_with_authorization(path, payload, type)
  puts @response.body
end

And(/^user sends POST request to schedule a job$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/schedule/job?jobname=TestJob&cdsname=TestCDSJob" 
  p path
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.post_json_with_authorization(path, payload, type)
  puts @response.body
end

And(/^user sends GET request for a scheduled job$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/schedule/job?jobname=TestJob"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, payload, type)
  puts @response.body
end
  
And(/^user sends PUT request to update a scheduled job$/) do 
  temp = QueryRDKCDS.new
  path = temp.path + "/schedule/job?jobname=TestJob"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.put_json_with_authorization(path, payload, type)
  puts @response.body
end 

And(/^user sends DELETE request to delete a scheduled job$/) do 
  temp = QueryRDKCDS.new
  path = temp.path + "/schedule/job?jobname=TestJob"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.delete_json_with_authorization(path, payload, type)
  puts @response.body
end

Given(/^user sends request to create definition with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/definition" 
  p path
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.post_json_with_authorization(path, payload, type)
  puts @response.body
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
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, payload, type)
  puts @response.body
end

# copydef_id = ""
And(/^user sends POST request to copy the created definition$/) do 
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/definition/copy?id=#{def_id}&newname=mydefinition"
  p path
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.post_json_with_authorization(path, payload, type)
  puts @response.body
  # copydef_id = json["data"][0]["_id"]
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
  @response = HTTPartyWithBasicAuth.delete_json_with_authorization(path, payload, type)
  puts @response.body
end

When(/^user sends DELETE request to delete the defintion$/) do 
  temp = QueryRDKCDS.new
  # def_id = "Testingstest"    
  path = temp.path + "/patient/definition?id=#{def_id}"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.delete_json_with_authorization(path, payload, type)
  puts @response.body
end

Given(/^user sends request to create criteria with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/criteria" 
  p path
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.post_json_with_authorization(path, payload, type)
  puts @response.body
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
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, payload, type)
  puts @response.body
end

When(/^user sends DELETE request to delete a criteria$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/criteria?id=#{criteria_id}"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.delete_json_with_authorization(path, payload, type)
  puts @response.body
end

Given(/^subscriptions are available fo the user$/) do
  #nothing to verify
end

And(/^user sends GET request for subscriptions$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/subscriptions" 
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, payload, type)
  puts @response.body
end

And(/^user sends PUT request to update subscriptions with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/subscriptions" 
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.put_json_with_authorization(path, payload, type)
  puts @response.body
end  

When(/^user sends DELETE request to delete the subscription$/) do 
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/subscriptions" 
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.delete_json_with_authorization(path, payload, type)
  puts @response.body
end

When(/^client sends GET request for a static list of the metrics service$/) do
  temp = QueryRDKCDSMetrics.new
  path = temp.path + "/definitions"
  type = { " Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, type)
  puts @response.body
end

Then(/^a successful response is returned with field data instead of payload$/) do
  json = JSON.parse(@response.body)
  id = json["data"][0]["_id"]
  puts id
end

When(/^client sends GET request for order resource$/) do
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/order?subject.identifier=9E7A;3&detail.display=DiagnosticOrder"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, type)
  # puts @response.body
end

Then(/^a successful response is returned with resource type Boundle$/) do
  json = JSON.parse(@response.body)
  resourcetype = json["resourceType"]
  puts resourcetype
  if resourcetype.eql? "Bundle"
  else fail("test failed")
  end
end

When(/^client sends GET request for order resource with a invalid identifier$/) do
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/order?subject.identifier=badindentifier&detail.display=DiagnosticOrder"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, type)
  puts @response.body
end

Then(/^the error code 404 will be returned$/) do 
  puts @response.code
  expect(@response.code).to eq(404)
end

When(/^client sends GET request for medication prescription in FHIR format with "(.*?)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{pid}/medicationprescription"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, type)
  puts @response.body
end

When(/^client sends GET request for Condition in FHIR format with "(.*?)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{pid}/condition"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, type)
  puts @response.body
end

When(/^client sends GET request for Order in FHIR format with "(.*?)"$/) do |arg1|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/order?subject.identifier=#{arg1}"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, type)
  puts @response.body 
end

Given(/^the patient identifiers list from patient "([^"]*)" by calling RDK$/) do |arg1|
  temp = QueryRDKPRD.new
  path = temp.path + "#{arg1}"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, type)
  puts @response.body
  json = JSON.parse(@response.body)
  @one = json["data"]["items"][0]["icn"]
  @two = json["data"]["items"][0]["pid"] 
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
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, type)
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
  @response = HTTPartyWithBasicAuth.get_json_with_authorization(path, type)
  puts @response.body
  expect(@result).to eq("true")
end

Then(/^delete the patient list created before$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/list?name=Test1234"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyWithBasicAuth.delete_json_with_authorization(path, payload, type)
  puts @response.body
end

