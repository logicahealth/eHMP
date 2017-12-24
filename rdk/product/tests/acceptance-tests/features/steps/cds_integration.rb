
When(/^user sends request to create patient list with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/list"
  p path
  p payload
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.post(path, payload, type)
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
  path = temp.path + "/patient/list/patients?id=#{list_id}&pid=SITE;100184"
  p path
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.post(path, payload, type)
  puts @response.body
end

Given(/^a patient list exists$/) do
  #nothing to verify
end

And(/^the cdsjob is scheduled for patient list with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/execute/request"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.post(path, payload, type)
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
  @response = HTTPartyRDK.post(path, payload, type)
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
  @response = HTTPartyRDK.get(path, payload, type)
  puts @response.body
end

And(/^user sends PUT request to update patient list with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/list?id=#{list_id}"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.put(path, payload, type)
  # puts @response.body
end

And(/^user sends DELETE request to delete a patient list$/) do
  temp = QueryRDKCDS.new
  puts "this is patient list id= #{list_id}"
  path = temp.path + "/patient/list?name=TestPatientList"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.delete(path, payload, type)
  puts @response.body
end

And(/^user sends GET request to get patient list$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/list"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path, payload, type)
end

When(/^user sends request to create a work product with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/product"
  p path
  p payload
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.post(path, payload, type)
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
  @response = HTTPartyRDK.get(path, payload, type)
  puts @response.body
end

And(/^user sends PUT request to update a work product with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/product?id=#{work_id}"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.put(path, payload, type)
  puts @response.body
end

Then(/^user sends DELETE request to delete a work product$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/product?id=#{work_id}"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.delete(path, payload, type)
  puts @response.body
end

And(/^user sends GET request for a created cdsjob$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/execute/request?name=TestCDSJob"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path, payload, type)
  puts @response.body
end

And(/^user sends PUT request to update a cdsjob with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/execute/request?name=TestCDSJob"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.put(path, payload, type)
  puts @response.body
end

And(/^user sends DELETE request to delete a cdsjob$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/execute/request?name=TestCDSJob"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.delete(path, payload, type)
  puts @response.body
end

And(/^user sends POST request to schedule a job$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/schedule/job?jobname=TestJob&cdsname=TestCDSJob"
  p path
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.post(path, payload, type)
  puts @response.body
end

And(/^user sends GET request for a scheduled job$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/schedule/job?jobname=TestJob"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path, payload, type)
  puts @response.body
end

And(/^user sends PUT request to update a scheduled job$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/schedule/job?jobname=TestJob"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.put(path, payload, type)
  puts @response.body
end

And(/^user sends DELETE request to delete a scheduled job$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/schedule/job?jobname=TestJob"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.delete(path, payload, type)
  puts @response.body
end

Given(/^user sends request to create definition with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/definition"
  p path
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.post(path, payload, type)
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
  @response = HTTPartyRDK.get(path, payload, type)
  puts @response.body
end

# copydef_id = ""
And(/^user sends POST request to copy the created definition$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/definition/copy?id=#{def_id}&newname=mydefinition"
  p path
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.post(path, payload, type)
  puts @response.body
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
  @response = HTTPartyRDK.delete(path, payload, type)
  puts @response.body
end

When(/^user sends DELETE request to delete the defintion$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/definition?id=#{def_id}"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.delete(path, payload, type)
  puts @response.body
end

Given(/^user sends request to create criteria with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/criteria"
  p path
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.post(path, payload, type)
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
  @response = HTTPartyRDK.get(path, payload, type)
  puts @response.body
end

When(/^user sends DELETE request to delete a criteria$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/criteria?id=#{criteria_id}"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.delete(path, payload, type)
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
  @response = HTTPartyRDK.get(path, payload, type)
  puts @response.body
end

And(/^user sends PUT request to update subscriptions with content "(.*?)"$/) do |payload|
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/subscriptions"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.put(path, payload, type)
  puts @response.body
end

When(/^user sends DELETE request to delete the subscription$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/work-product/subscriptions"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.delete(path, payload, type)
  puts @response.body
end

When(/^client sends GET request for a static list of the metrics service$/) do
  temp = QueryRDKCDSMetrics.new
  path = temp.path + "/definitions"
  type = { " Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path, type)
  puts @response.body
end

Then(/^a successful response is returned with field data instead of payload$/) do
  json = JSON.parse(@response.body)
  id = json["data"][0]["_id"]
  puts id
end

When(/^client sends GET request for order resource$/) do
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/order?subject.identifier=SITE;3&detail.display=DiagnosticOrder"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path, type)
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
  @response = HTTPartyRDK.get(path, type)
  puts @response.body
end

Then(/^the error code 404 will be returned$/) do
  puts @response.code
  expect(@response.code).to eq(404)
end

When(/^client sends GET request for medication prescription in FHIR format with "(.*?)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{pid}/medicationprescription"
  header = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path, {}, header)
  puts @response.body
end

When(/^client sends GET request for Condition in FHIR format with "(.*?)"$/) do |pid|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/patient/#{pid}/condition"
  header = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path, {}, header)
  puts @response.body
end

When(/^client sends GET request for Order in FHIR format with "(.*?)"$/) do |arg1|
  temp = QueryRDKCDSfhir.new
  path = temp.path + "/order?subject.identifier=#{arg1}"
  header = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path, {}, header)
  puts @response.body
end

Given(/^the patient identifiers list from patient "([^"]*)" by calling RDK$/) do |arg1|
  temp = QueryRDKPRD.new
  path = temp.path + "#{arg1}"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path, type)
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
  @response = HTTPartyRDK.get(path, type)
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
  @response = HTTPartyRDK.get(path, type)
  puts @response.body
  expect(@result).to eq("true")
end

Then(/^delete the patient list created before$/) do
  temp = QueryRDKCDS.new
  path = temp.path + "/patient/list?name=Test1234"
  payload = ""
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.delete(path, payload, type)
  puts @response.body
end

Then(/^FHIR date and time conver to Zulu format for Radiology report$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["issued"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Labs Mi$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["issued"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Inpatient Medication$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["effectiveTimePeriod"]["start"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Labs Anatomic Pathology$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["issued"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for clinical note$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["date"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Vitals$/) do
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

Then(/^FHIR date and time conver to Zulu format for Consult$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["dateSent"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Immunization$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["date"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Labs Chemistry$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["issued"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Orders$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["date"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Allergy F361$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["recordedDate"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Diagnostic Report$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["issued"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Education$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["performedDateTime"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)\.(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Health Factor$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["appliesDateTime"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Medication Administration$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["effectiveTimeDateTime"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Medication Dispense$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["contained"][0]["dateWritten"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Medication Prescription$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["dateWritten"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Observation$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][0]["resource"]["issued"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Problem List$/) do
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][1]["resource"]["dateAsserted"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

Then(/^FHIR date and time conver to Zulu format for Outpatient Medication$/) do
  # puts @response.body
  json = JSON.parse(@response.body)
  @zulutime = json["entry"][2]["resource"]["contained"][0]["dateWritten"]
  test = /(\d+)\-(\d+)\-(\w+)\:(\d+)\:(\d+)(Z)/ !~ @zulutime
  puts @zulutime
  expect(test).to eq(false)
end

When(/^the client send a orderable request for searching string "([^"]*)"$/) do |searchString|
  temp = QueryRDKOrderables.new
  path = temp.path + "#{searchString}"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path)
  @string = searchString
end

Then(/^the field of name in the orderable data contains a string "([^"]*)"$/) do |arg1|
  json = JSON.parse(@response.body)
  name = json["data"][0]["name"]
  puts name
  expect(name.include? "#{arg1}").to eq(true)
end

Then(/^the field of type in the orderable data contains a string "([^"]*)"$/) do |arg1|
  json = JSON.parse(@response.body)
  name = json["data"][0]["type"]
  puts name
  expect(name.include? "#{arg1}").to eq(true)
end

Then(/^the field of domain in the orderable data contains a string "([^"]*)"$/) do |arg1|
  json = JSON.parse(@response.body)
  name = json["data"][0]["domain"]
  puts name
  expect(name.include? "#{arg1}").to eq(true)
end

Then(/^the field of subDomain in the orderable data contains a string "([^"]*)"$/) do |arg1|
  json = JSON.parse(@response.body)
  name = json["data"][0]["subDomain"]
  puts name
  expect(name.include? "#{arg1}").to eq(true)
end

Then(/^the field of state in the orderable data contains a string "([^"]*)"$/) do |arg1|
  json = JSON.parse(@response.body)
  name = json["data"][0]["state"]
  puts name
  expect(name.include? "#{arg1}").to eq(true)
end

Then(/^the field of facility-enterprise in the orderable data contains a string "([^"]*)"$/) do |arg1|
  json = JSON.parse(@response.body)
  name = json["data"][0]["facility-enterprise"]
  puts name
  expect(name.include? "#{arg1}").to eq(true)
end

When(/^the client send a enterprise\-orderable request for domain "([^"]*)" and subdomain "([^"]*)" with orderable name "([^"]*)"$/) do |domain, subdomain, name|
  temp = QueryRDKEnterpriseOrderable.new
  path = temp.path + "name=" + "#{name}" + "&state=active" + "&domain=#{domain}" + "&subdomain=#{subdomain}"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(URI.encode(path))
  puts @response
end

Then(/^the field of domain in the enterprise\-orderable data contains a string "([^"]*)"$/) do |arg1|
  json = JSON.parse(@response.body)
  name = json["data"]["items"][0]["domain"]
  puts name
  expect(name.include? "#{arg1}").to eq(true)
end

Then(/^the field of subdomain in the enterprise\-orderable data contains a string "([^"]*)"$/) do |arg1|
  json = JSON.parse(@response.body)
  name = json["data"]["items"][0]["subDomain"]
  puts name
  expect(name.include? "#{arg1}").to eq(true)
end

Then(/^the field of name in the enterprise\-orderable data contains a string "([^"]*)"$/) do |arg1|
  json = JSON.parse(@response.body)
  name = json["data"]["items"][0]["name"]
  puts name
  expect(name.include? "#{arg1}").to eq(true)
end

When(/^the client requests healthfactors for the patient "([^"]*)"$/) do |patient|
  temp = QueryRDKExtendFhirAPI.new
  path = temp.path + "#{patient}" + "/observation?_tag=social-history"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path)
end

Then(/^only healthfactors returned$/) do
  json = JSON.parse(@response.body)
  name = json["entry"][0]["resource"]["code"]["coding"][0]["display"]
  puts name
  expect(name.include? "REFUSES HEPATITIS C TESTING").to eq(true)
end

When(/^the client requests both healthfactors and vitals for the patient "([^"]*)"$/) do |patient|
  temp = QueryRDKExtendFhirAPI.new
  path = temp.path + "#{patient}" + "/observation"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path)
end

Then(/^both healthfactors and vitals results contain "(.*?)"$/) do |_arg1, table|
  @json_object = JSON.parse(@response.body)
  result_array = @json_object["entry"]
  json_verify = VerifyJsonRuntimeValue.new
  json_verify.verify_json_runtime_value(result_array, table)
end

When(/^the client requests Vitals for the patient "([^"]*)"$/) do |patient|
  temp = QueryRDKExtendFhirAPI.new
  path = temp.path + "#{patient}" + "/observation?_tag=vital-signs"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path)
end

Then(/^only Vitals returned$/) do
  json = JSON.parse(@response.body)
  name = json["entry"][0]["resource"]["code"]["coding"][0]["display"]
  observation = json["entry"][0]["resource"]["resourceType"]
  expect(observation.include? "Observation").to eq(true)
  expect(name.include? "TEMPERATURE").to eq(true)
end

@observation = ""
When(/^the client requests Observations in filtering count for the patient "([^"]*)"$/) do |patient|
  temp = QueryRDKExtendFhirAPI.new
  path = temp.path + "#{patient}" + "/observation?_tag=vital-signs&_count=10"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path)
  json = JSON.parse(@response.body)
  i = 0
  while i < json["entry"].size
    @observation = json["entry"][i]["resource"]["resourceType"]
    expect(@observation.include? "Observation").to eq(true)
    p @observation
    i += 1
  end
end

applies_date_time  = []
When(/^the client requests Observations in sorting date for the patient "([^"]*)"$/) do |patient|
  temp = QueryRDKExtendFhirAPI.new
  path = temp.path + "#{patient}" + "/observation?_tag=vital-signs&_count=10&_sort=date"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(path)
  json = JSON.parse(@response.body)
  i = 0
  while i < json["entry"].size
    applies_date_time [i]  = json["entry"][i]["resource"]["appliesDateTime"]
    i += 1
  end
  expect(applies_date_time.first <= applies_date_time.last).to eq(true)
  puts applies_date_time
end

When(/^the client requests Observations in filtering date range for the patient "([^"]*)"$/) do |patient|
  temp = QueryRDKExtendFhirAPI.new
  path = temp.path + "#{patient}" + "/observation?_tag=vital-signs&_count=10&_sort=date&date=>1900&date=<2016"
  type = { "Content-Type" => "application/json" }
  @response = HTTPartyRDK.get(URI.encode(path))
  json = JSON.parse(@response.body)
  i = 0
  while i < json["entry"].size
    applies_date_time [i]  = json["entry"][i]["resource"]["appliesDateTime"]
    i += 1
  end
  puts applies_date_time
  expect(applies_date_time.last <= "2016").to eq(true)
  expect(applies_date_time.first >= "1900").to eq(true)
end

Then(/^the value of field total is more than one$/) do
  json = JSON.parse(@response.body)
  @total = json["total"]
  puts @total
  expect(@total).to be >= 1
end

applies_date_time  = []
Then(/^Each resulting entry should have a date equal or prior to the passed value "([^"]*)"$/) do |arg1|
  json = JSON.parse(@response.body)
  i = 0
  while i < json["entry"].size
    applies_date_time [i]  = json["entry"][i]["resource"]["appliesDateTime"]
    puts applies_date_time [i]
    expect(applies_date_time[i] <= arg1).to eq(true)
    i += 1
  end
end

Then(/^Each resulting entry should have a date equal or beyond the passed value "([^"]*)"$/) do |arg1|
  json = JSON.parse(@response.body)
  i = 0
  while i < json["entry"].size
    applies_date_time [i]  = json["entry"][i]["resource"]["appliesDateTime"]
    puts applies_date_time [i]
    expect(applies_date_time[i] >= arg1).to eq(true)
    i += 1
  end
end

Then(/^No resulting entry should have a date matching the passed value "([^"]*)"$/) do |arg1|
  json = JSON.parse(@response.body)
  i = 0
  while i < json["entry"].size
    applies_date_time [i]  = json["entry"][i]["resource"]["appliesDateTime"]
    puts applies_date_time [i]
    expect(applies_date_time[i] != arg1).to eq(true)
    i += 1
  end
end

