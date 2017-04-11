require 'set'
When(/^the client requests activities instances for pid "([^"]*)"$/) do |pid|
  request = RDKQuery.new('activities-instances-available')
  request.add_parameter('context', 'patient')
  request.add_parameter('pid', pid)
  path = request.path
  p path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests activities available$/) do
  request = RDKQuery.new('activities-available')
  path = request.path
  p path
  @response = HTTPartyRDK.get(path)
end

Given(/^the client has the current deploymentid$/) do
  step 'the client requests activities available'
  step 'a successful response is returned'
  step 'client grabs the deploymentId'
end

Then(/^client grabs the deploymentId$/) do
  json_object = JSON.parse(@response.body)
  item_array = json_object['data']['items']
  all_ids = []
  item_array.each do | item_object |
    if item_object['id'] == 'Order.Request'
      all_ids.push(item_object['deploymentId'])
    end
  end
  @deployment_id = all_ids.last
end

When(/^the client requests a single instance activity for pid "([^"]*)"$/) do |arg1|
  request = RDKQuery.new('activities-single-instance')
  request.add_parameter('id', @processinstanceid)
  path = request.path
  p path
  @response = HTTPartyRDK.get(path)
end

def start_activity_payload(pid)
  pid_array = pid.split(';')
  facility = pid_array[0]
  patient_id = pid_array[1]

  p "#{facility}  #{patient_id}"
  tomorrow = Date.today.next_day.strftime("%Y%m%d000000")
  nextmonth = Date.today.next_month.strftime("%Y%m%d000000")
  timestamp = Time.now.strftime "%Y-%m-%dT%H:%M:%S.%LZ" # 2016-08-04T18:58:58.624Z
  timeonly = Time.now.strftime "%H:%M:%S"
  title = "TestAddRequest #{Date.today} #{timeonly}"
  user_id = '10000000270'
  p title

  @activity_title = title
  @activity_user_id = user_id

  # TODO: HOW TO HANDLE THE VISIT HARD CODED
                              #{"deploymentId"=>"VistaCore:Order", "processDefId"=>"Order.Request", "parameter"=>{"requestActivity"=>{"objectType"=>"requestActivity", "patientUid"=>"urn:va:patient:9E7A:3:3", "authorUid"=>"urn:va:user:9E7A:10000000016", "creationDateTime"=>"20160815000000", "domain"=>"ehmp-activity", "subDomain"=>"request", "visit"=>{"location"=>"urn:va:location:9E7A:195", "serviceCategory"=>"I", "dateTime"=>"20160812134500", "locationDesc"=>"Cardiology"}, "ehmpState"=>"accepted", "displayName"=>"Test ", "referenceId"=>"", "instanceName"=>"Test", "data"=>{"activity"=>{"objectType"=>"activity", "deploymentId"=>"VistaCore:", "processDefinitionId"=>"Order.Request", "processInstanceId"=>"", "state"=>"accepted", "initiator"=>"10000000016", "assignTo"=>"Person", "timeStamp"=>"", "urgency"=>"9", "assignedTo"=>"9E7A;10000000270", "instanceName"=>"TestAddRequ", "domain"=>"Request", "sourceFacilityId"=>"500", "destinationFacilityId"=>"500", "type"=>"Order"}, "signals"=>[], "requests"=>{"objectType"=>"request", "taskinstanceId"=>"", "urgency"=>"routine", "earliestDate"=>"20160816000000", "latestDate"=>"20160915000000", "title"=>"TestAddRequest 2016-08-15 13:17:25", "assignTo"=>"Person", "request"=>"TestAddRequest 2016-08-15 13:17:25", "submittedByUid"=>"urn:va:user:9E7A:10000000016", "submittedByName"=>"TDNURSE,ONE", "submittedTimeStamp"=>"2016-08-15T13:17:25.475Z", "visit"=>{"location"=>"urn:va:location:9E7A:195", "serviceCategory"=>"I", "dateTime"=>"20160812134500", "locationDesc"=>"Cardiology"}, "route"=>{"facility"=>"500", "facilityName"=>"", "person"=>"9E7A;10000000270", "personName"=>"USER, PANORAMA"}}, "responses"=>[]}}, "icn"=>"9E7A;3", "pid"=>"9E7A;3", "instanceName"=>"TestAddRequest 2016-08-15 13:17:25", "formAction"=>"accepted", "urgency"=>"9", "subDomain"=>"Request", "assignedTo"=>"9E7A;10000000270", "type"=>"Order", "facility"=>"500", "destinationFacility"=>"500", "description"=>"TestDesc 2016-08-15 13:17:25"}}
                             #{"deploymentId":"VistaCore:Order:",  "processDefId":"Order.Request","parameter":{"requestActivity":{"objectType":"requestActivity","patientUid":"urn:va:patient:9E7A:3:3","authorUid":"urn:va:user:9E7A:10000000016",                              "creationDateTime":"20160816000000","domain":"ehmp-activity","subDomain":"request","visit":{"location":"urn:va:location:9E7A:195","serviceCategory":"I","dateTime":"20160812134500","locationDesc":"Cardiology"},"ehmpState":"accepted","displayName":"Test","referenceId":"","instanceName":"TestAddRe","data":{"activity":{"objectType":"activity","deploymentId":"VistaCore:Order","processDefinitionId":"Order.Request","processInstanceId":"","state":"accepted","initiator":"10000000016","timeStamp":"","urgency":"9","assignedTo":"9E7A;10000000270","instanceName":"TestAddRequest 2016-","domain":"Request","sourceFacilityId":"500","destinationFacilityId":"500","type":"Order","assignTo":"Person"},"signals":[],"requests":[{"objectType":"request","taskinstanceId":"","urgency":"routine","earliestDate":"20160817000000","latestDate":"20160916000000","title":"TestAd","request":"TestAddRequest 2016-08-16 14:12:14","submittedByUid":"urn:va:user:9E7A:10000000016","submittedByName":"TDNURSE,ONE","submittedTimeStamp":"2016-08-16T14:12:14.653Z","visit":{"location":"urn:va:location:9E7A:195","serviceCategory":"I","dateTime":"20160812134500","locationDesc":"Cardiology"},"assignTo":"Person","route":{"facility":"500","facilityName":"","person":"9E7A;10000000270","personName":"USER, PANORAMA"}}],"responses":[]}},"icn":"9E7A;3","pid":"9E7A;3","instanceName":"TestAddRequest 2016-08-16 14:12:14","formAction":"accepted","urgency":"9","subDomain":"Request","assignedTo":"9E7A;10000000270","type":"Order","facility":"500","destinationFacility":"500","description":"TestDesc 2016-08-16 14:12:14"}}
  payload_json = JSON.parse(%Q[{"deploymentId":"#{@deployment_id}","processDefId":"Order.Request","parameter":{"requestActivity":{"objectType":"requestActivity","patientUid":"urn:va:patient:#{facility}:#{patient_id}:#{patient_id}","authorUid":"urn:va:user:9E7A:#{user_id}","creationDateTime":"#{tomorrow}","domain":"ehmp-activity","subDomain":"request","visit":{"location":"urn:va:location:9E7A:158","serviceCategory":"X","dateTime":"20140814130730","locationDesc":"7A GEN MED"},"ehmpState":"accepted","displayName":"#{title}","referenceId":"","instanceName":"#{title}","data":{"activity":{"objectType":"activity","deploymentId":"#{@deployment_id}","processDefinitionId":"Order.Request","processInstanceId":"","state":"accepted","initiator":"#{user_id}","assignTo":"Me","timeStamp":"","urgency":9,"assignedTo":"9E7A;#{user_id}","instanceName":"#{title}","domain":"Request","sourceFacilityId":"500","type":"Order"},"signals":[],                                                "requests":[{"objectType":"request","taskinstanceId":"","urgency":"routine","earliestDate":"#{tomorrow}","latestDate":"#{nextmonth}","title":"#{title}","assignTo":"Me","submittedByUid":"urn:va:user:9E7A:#{user_id}","submittedByName":"USER,PANORAMA","submittedTimeStamp":"#{timestamp}","visit":{"location":"urn:va:location:9E7A:158","serviceCategory":"X","dateTime":"20140814130730","locationDesc":"7A GEN MED"}}],"responses":[]}},"icn":"#{pid}","pid":"#{pid}","instanceName":"#{title}","formAction":"accepted","urgency":"9","subDomain":"Request","assignedTo":"9E7A;#{user_id}","type":"Order","facility":"9E7A","description":"Test Description."}}]).to_json
end

When(/^the client starts an activity on patient "([^"]*)"$/) do |pid|
  request = RDKQuery.new('activities-start')
  headers = {}
  headers['Content-Type'] = "application/json"
  path = request.path

  payload_json = start_activity_payload pid
  @response = HTTPartyRDK.post(path, payload_json, headers)
end

Given(/^the client has started an activity$/) do
  p @processinstanceid

  expect(@processinstanceid).to_not be_nil
  expect(@processinstanceid).to_not be_nil, "Expected an activity to have been started in a previous test"
end

Given(/^the response contains a process instance id$/) do
  json_object = JSON.parse(@response.body)

  @processinstanceid = json_object['data']['processInstanceId']
  expect(@processinstanceid).to_not be_nil
  p @processinstanceid
end

def request_activities_instances_available(user, table)
  request = RDKQuery.new('activities-instances-available')
  request.add_parameter('context', 'staff')
  request.add_parameter('mode', 'open')
  table.rows.each do | label, value |
    request.add_parameter(label, value)
  end
  path = request.path
  p path
  @response = HTTPartyRDK.get_as_user(path, user,  TestClients.password_for(user))
end

When(/^the client requests open activities for the staff context$/) do |table|
  request_activities_instances_available "9E7A;PW    ", table
end

When(/^the clicent requests open activities for the patient context$/) do |table|
  request = RDKQuery.new('activities-instances-available')
  request.add_parameter('context', 'patient')
  request.add_parameter('mode', 'open')
  table.rows.each do | label, value |
    request.add_parameter(label, value)
  end
  path = request.path
  p path
  @response = HTTPartyRDK.get(path)
end

When(/^the clicent requests closed activities for the patient context$/) do |table|
  end_date = Date.today.next_month(6).strftime("%Y%m%d1000")
  start_date = Date.today.prev_month(18).strftime("%Y%m%d1000")
  request = RDKQuery.new('activities-instances-available')
  request.add_parameter('context', 'patient')
  request.add_parameter('mode', 'closed')
  request.add_parameter('endDate', end_date)
  request.add_parameter('startDate', start_date)
  table.rows.each do | label, value |
    request.add_parameter(label, value)
  end
  path = request.path
  p path
  @response = HTTPartyRDK.get(path)
end

When(/^the clicent requests open and closed activities for the patient context$/) do |table|
  end_date = Date.today.next_month(6).strftime("%Y%m%d1000")
  start_date = Date.today.prev_month(18).strftime("%Y%m%d1000")
  request = RDKQuery.new('activities-instances-available')
  request.add_parameter('context', 'patient')
  request.add_parameter('endDate', end_date)
  request.add_parameter('startDate', start_date)
  table.rows.each do | label, value |
    request.add_parameter(label, value)
  end
  path = request.path
  p path
  @response = HTTPartyRDK.get(path)
end

Then(/^the response contains a task for the new process instance id$/) do
  source_allvalues = all_values_in_set(@response.body, 'data.items.PROCESSINSTANCEID')
  
  expect(source_allvalues).to include(@processinstanceid)
end

When(/^the user tdnurse has started an activity assigned to a person with parameters$/) do |table|
  request = RDKQuery.new('activities-start')
  headers = {}
  headers['Content-Type'] = "application/json"
  path = request.path

  parameters = {}
  table.rows.each do | parameter, value |
    parameters[parameter] = value
  end
  payload_json = start_person_activity(parameters).to_json 
  @response = HTTPartyRDK.post_as_user(path, "9E7A;1tdnurse", "PW      ", payload_json, headers)
end

Given(/^the user "([^"]*)" has started an activity assigned to a person with parameters$/) do |user, table|
  request = RDKQuery.new('activities-start')
  path = request.path
  parameters = {}
  table.rows.each do | parameter, value |
    parameters[parameter] = value
  end
  payload_json = start_person_activity(parameters).to_json 
  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
  expect(@response.code).to eq(200), "response code was #{@response.code}: response body #{@response.body}"
  json = JSON.parse(@response.body)
  @processinstanceid = json['data']['processInstanceId']
end

Given(/^the user tdnurse has started an activity for any team with parameters$/) do |table|
  request = RDKQuery.new('activities-start')
  headers = {}
  headers['Content-Type'] = "application/json"
  path = request.path

  parameters = {}
  table.rows.each do | parameter, value |
    parameters[parameter] = value
  end
  payload_json = start_anyteam_activity(parameters).to_json 
  @response = HTTPartyRDK.post_as_user(path, "9E7A;1tdnurse", "PW      ", payload_json, headers)
end

Given(/^the user tdnurse has started an activity for my teams with parameters$/) do |table|
  request = RDKQuery.new('activities-start')
  headers = {}
  headers['Content-Type'] = "application/json"
  path = request.path

  parameters = {}
  table.rows.each do | parameter, value |
    parameters[parameter] = value
  end
  payload_json = start_myteam_activity(parameters).to_json 
  @response = HTTPartyRDK.post_as_user(path, "9E7A;1tdnurse", "PW      ", payload_json, headers)
end

Given(/^the user tdnurse has started an activity assigned to me with parameters$/) do |table|
  request = RDKQuery.new('activities-start')
  path = request.path

  parameters = {}
  table.rows.each do | parameter, value |
    parameters[parameter] = value
  end
  payload_json = start_activity_assignedtome(parameters).to_json 
  @response = HTTPartyRDK.post_as_user(path, "9E7A;1tdnurse", "PW      ", payload_json, TaskHelper.headers)
end

Given(/^the user "([^"]*)" has started a consult with parameters$/) do |user, table|
  expect(@deployment_id).to_not be_nil
  activities_start_call user, table
end

Given(/^the user tdnurse has started an activity for Patient's Teams with parameters$/) do |table|
  request = RDKQuery.new('activities-start')
  headers = {}
  headers['Content-Type'] = "application/json"
  path = request.path

  parameters = {}
  table.rows.each do | parameter, value |
    parameters[parameter] = value
  end
  payload_json = start_patientteam_activity(parameters).to_json 
  @response = HTTPartyRDK.post_as_user(path, "9E7A;1tdnurse", "PW      ", payload_json, headers)
end

def all_values_in_set(response_body, fieldsource)
  json = JSON.parse(response_body)
  output_string = ""

  fieldsource = fieldsource
  steps_source = fieldsource.split('.')

  source_allvalues = []

  json_verify = JsonVerifier.new
  json_verify.save_all_values_of_path(0, steps_source, json, output_string, source_allvalues)
  # p "-------- #{fieldsource}"
  # p "arraylength: #{source_allvalues.length}"
  source_allvalues_set = SortedSet.new(source_allvalues) # source_allvalues.to_set
  # p "setlength: #{source_allvalues_set.length}"
  source_allvalues_set
end

Then(/^the activity response does not contain the title$/) do
  source_allvalues = all_values_in_set(@response.body, 'data.items.INSTANCENAME')
  
  expect(source_allvalues).to_not include(@new_activity_title)
end

Then(/^the activity response does contain the title$/) do
  source_allvalues = all_values_in_set(@response.body, 'data.items.INSTANCENAME')
  
  expect(source_allvalues).to include(@new_activity_title)
end

When(/^the user "([^"]*)" requests open activities for the patient context$/) do |patient_access_code, table|
  request = RDKQuery.new('activities-instances-available')
  request.add_parameter('context', 'patient')
  request.add_parameter('mode', 'open')
  table.rows.each do | label, value |
    request.add_parameter(label, value)
  end
  path = request.path
  p path
  verify_code = TestClients.password_for(patient_access_code)
  expect(verify_code).to_not be_nil, "Test Framework does not have a saved verify code for #{patient_access_code}"

  @response = HTTPartyRDK.get_as_user(path, patient_access_code, verify_code)
end

Then(/^the activity response only contains activities started by pu(\d+)$/) do |arg1|
  source_allvalues_names = all_values_in_set(@response.body, 'data.items.CREATEDBYNAME')
  source_allvalues_id = all_values_in_set(@response.body, 'data.items.CREATEDBYID')

  expect(source_allvalues_names.length).to_not be > 1, "expected only 1 created by name, received #{source_allvalues_names.length} (#{source_allvalues_names})"
  expect(source_allvalues_names).to include('USER,PANORAMA') if source_allvalues_names.length > 0

  expect(source_allvalues_id.length).to_not be > 1, "expected only 1 created by name, received #{source_allvalues_id.length} (#{source_allvalues_id})"
  expect(source_allvalues_id).to include('9E7A;10000000270') if source_allvalues_names.length > 0
end

Then(/^the activity response only contains activities started by tdnurse$/) do
  source_allvalues_names = all_values_in_set(@response.body, 'data.items.CREATEDBYNAME')
  source_allvalues_id = all_values_in_set(@response.body, 'data.items.CREATEDBYID')

  expect(source_allvalues_names.length).to eq(1)
  expect(source_allvalues_names).to include('TDNURSE,ONE')

  expect(source_allvalues_id.length).to eq(1), "expected only 1 created by name, received #{source_allvalues_id.length} (#{source_allvalues_id})"
  expect(source_allvalues_id).to include('9E7A;10000000016')
end

Given(/^the successful response contains a processInstanceId$/) do
  json = JSON.parse(@response.body)
  @processinstanceid = json['data']['processInstanceId']
end
