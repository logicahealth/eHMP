def variable_or_default(parameter_element, default_value)
  return default_value if parameter_element == nil
  parameter_element
end

def variable_or_fail(parameter_hash, variable)
  parameter_element = parameter_hash[variable]

  return parameter_element unless parameter_element.nil?
  p parameter_hash.keys
  p variable
  p parameter_element
  p parameter_element.nil?
  fail "Expected hash to have variable #{variable}, but only contained #{parameter_hash}"
end

def update_out_activity
  out_activity = {}
  out_activity['deploymentId'] = @deployment_id
  out_activity['processDefinitionId'] = 'Order.Request'
  out_activity['type'] = 'Order'
  out_activity['domain'] = 'Request'
  out_activity['processInstanceId'] = @processinstanceid
  out_activity['instanceName'] = ''
  out_activity['patientUid'] = nil
  out_activity['clinicalObjectUid'] = nil
  out_activity['sourceFacilityId'] = '500'
  out_activity['destinationFacilityId'] = '500'
  out_activity['state'] = variable_or_fail(@parameter_hash, 'out_activity_state')
  out_activity['initiator'] = variable_or_fail(@parameter_hash, 'initiator')
  out_activity['timeStamp'] = ''
  out_activity['urgency'] = variable_or_default(@parameter_hash['urgency'], 9)
  
  out_activity['activityHealthy'] = nil
  out_activity['activityHealthDescription'] = nil
  out_activity['objectType'] = 'activity'
  out_activity
end

def update_out_response(action)
  timestamp = Time.now.strftime "%Y-%m-%dT%H:%M:%S.%LZ"

  tomorrow = Time.now + (60 * 60 * 24)
  next_month = Time.now + (60 * 60 * 24 *30)
  earliest = tomorrow.strftime "%Y%m%d040000"
  latest = next_month.strftime "%Y%m%d035959"
  out_response = {}
  out_response['objectType'] = 'request'
  out_response['taskInstanceId'] = @processinstanceid
  out_response['action'] = action
  out_response['request'] = 'test request'
  out_response['submittedByUid'] = "urn:va:user:SITE:#{@activity_user_id}"
  out_response['submittedByName'] = ''
  out_response['submittedTimeStamp'] = "#{timestamp}"
  out_response['earliestDate'] = "#{earliest}"
  out_response['latestDate'] = "#{latest}"

  route = {}
  visit = default_visit

  out_response['route'] = route
  out_response['visit'] = visit

  out_response
end

def update_parameter(out_activity_state, action)
  parameter = {}
  parameter['out_activity'] = update_out_activity
  parameter['out_response'] = update_out_response(action)
  parameter['out_formAction'] = @parameter_hash['out_formAction']
  parameter['out_action'] = @parameter_hash['out_action']
  parameter
end

def update_base(payload, state)
  payload['deploymentId'] = @deployment_id
  payload['processDefId'] = 'Order.Request'
  payload['icn'] = @patient_id
  payload['pid'] = @patient_id
  payload['taskid'] =@task_to_update
  payload['state'] = @parameter_hash['state']

  payload
end

def update_reassignment
  payload = {}

  state = @parameter_hash['state']
  action = @parameter_hash['out_action']
  payload = update_base payload, state
  payload['parameter'] = update_parameter state, action

  route = {}
  route['person'] = @parameter_hash['route_person']
  route['facility'] = @parameter_hash['route_facility']

  payload['parameter']['out_response']['route'] = route
  payload['parameter']['out_response']['assignTo'] = 'Person'
  payload['parameter']['out_activity']['assignedTo'] = @parameter_hash['route_person']

  payload
end

def update_markcomplete
  payload = {}

  state = @parameter_hash['state']
  action = @parameter_hash['out_action']
  payload = update_base payload, state
  payload['parameter'] = update_parameter state, action
  payload['parameter']['out_activity']['assignedTo'] = @parameter_hash['full_assignedTo']
  payload
end

def update_markdeclined
  payload = {}

  state = @parameter_hash['state']
  action = @parameter_hash['out_action']
  payload = update_base payload, state
  payload['parameter'] = update_parameter state, action

  route = {}
  route['person'] = @parameter_hash['route_person']
  route['facility'] = @parameter_hash['route_facility']
  payload['parameter']['out_response']['route'] = route
  payload['parameter']['out_activity']['assignedTo'] = @parameter_hash['route_person']
  payload['parameter']['out_response']['assignTo'] = 'Person'

  payload
end

def update_clarafication
  payload = {}

  state = @parameter_hash['state']
  action = @parameter_hash['out_action']
  payload = update_base payload, state
  payload['parameter'] = update_parameter state, action

  route = {}
  route['person'] = @parameter_hash['route_person']
  route['facility'] = @parameter_hash['route_facility']
  payload['parameter']['out_response']['route'] = route
  payload['parameter']['out_activity']['assignedTo'] = @parameter_hash['route_person']
  payload['parameter']['out_response']['assignTo'] = 'Person'

  payload
end

def update_sign
  payload = {}
  parameter_hash = @parameter_hash
  state = @parameter_hash['state']

  payload['deploymentId'] = @deployment_id
  payload['processDefId'] = 'Order.Request'
  payload['icn'] = @patient_id
  payload['taskid'] =@task_to_update
  payload['state'] = @parameter_hash['state']

  payload['processDefId'] = 'Order.Consult'
  payload['parameter'] = {}

  timing = Time.now.strftime "%Y%m%d%H%M%S %L"
  @request_reason = "Test Request #{timing}"

  @unique_comment = "Test Comment #{timing}"

  expect(payload['parameter']).to_not be_nil

  conditions = {}
  conditions['code'] = variable_or_default(parameter_hash['conditions code'], "25106000")
  conditions['name'] = variable_or_default(parameter_hash['conditions name'], 'Occasional Uncontrolled Chest Pain Icd 9 Cm 411 1')
 
  ordering_provider = {}
  ordering_provider['displayName'] = variable_or_fail(parameter_hash, 'orderingProvider displayName')
  ordering_provider['uid'] = variable_or_fail(parameter_hash, 'orderingProvider uid')

  consult_order = build_consult_order_payload(parameter_hash)

  consult_order['communityCareStatus'] = nil
  consult_order['conditions'] = conditions
  consult_order['contactAttempt'] = nil
  consult_order['instructions'] = nil
  consult_order['orderingProvider'] = ordering_provider
  consult_order['overrideReason'] = nil
  consult_order['orderResultComment'] = nil

  consult_order['scheduledDate'] = nil

  visit = default_visit
  visit['locationDesc'] = 'Comp and Pen'

  consult_order['visit'] = visit

  payload['parameter']['consultOrder'] = consult_order

  payload
end

Given(/^the client starts an activity assigned to me on patient "([^"]*)"$/) do |pid|
  request = RDKQuery.new('activities-start')
  path = request.path

  payload_json = start_activity_payload pid
  @response = HTTPartyRDK.post(path, payload_json, TaskHelper.headers)

  expect(@response.code).to eq(200), "Response: #{@response.code}, #{@response.body}"
  json_object = JSON.parse(@response.body)

  @processinstanceid = json_object['data']['processInstanceId']
  expect(@processinstanceid).to_not be_nil
end

Then(/^the task associated with the processInstanceId has$/) do |extra_parameters|
  retrieve_task_id_from_response_body extra_parameters
end

When(/^the "([^"]*)" client requests the task is updated for reassignment to$/) do |user, table|
  @parameter_hash = {}
  table.rows.each do | parameter, value |
    @parameter_hash[parameter] = value
  end
  @parameter_hash['out_action'] = 'reassign'
  @parameter_hash['out_activity_state'] = 'accepted'
  
  @patient_id = @parameter_hash['patient_pid']
  @activity_user_id = @parameter_hash['initiator']
  request = RDKQuery.new('tasks-update')

  path = request.path
  payload_json = update_reassignment.to_json
  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

When(/^the "([^"]*)" client requests the task is updated to be marked as complete$/) do |user, table|
  @parameter_hash = {}
  table.rows.each do | parameter, value |
    @parameter_hash[parameter] = value
  end
  @parameter_hash['out_action'] = 'complete'
  @parameter_hash['out_activity_state'] = 'accepted'

  @patient_id = @parameter_hash['patient_pid']
  @activity_user_id = @parameter_hash['initiator']

  request = RDKQuery.new('tasks-update')

  path = request.path

  payload_json = update_markcomplete.to_json

  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

When(/^the "([^"]*)" client requests the task is updated to be clarafication$/) do |user, table|
  @parameter_hash = {}
  table.rows.each do | parameter, value |
    @parameter_hash[parameter] = value
  end
  @parameter_hash['out_action'] = 'clarification'
  @parameter_hash['out_activity_state'] = 'accepted'

  @patient_id = @parameter_hash['patient_pid']
  @activity_user_id = @parameter_hash['initiator']

  request = RDKQuery.new('tasks-update')
  path = request.path
  payload_json = update_clarafication.to_json
  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

When(/^the "([^"]*)" client requests the task is updated to be declined$/) do |user, table|
  @parameter_hash = {}
  table.rows.each do | parameter, value |
    @parameter_hash[parameter] = value
  end
  @parameter_hash['out_action'] = 'decline'
  @parameter_hash['out_activity_state'] = 'accepted'

  @patient_id = @parameter_hash['patient_pid']
  @activity_user_id = @parameter_hash['initiator']

  request = RDKQuery.new('tasks-update')
  path = request.path

  payload_json = update_markdeclined.to_json
  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

Then(/^the response does not contain the processInstanceId$/) do
  source_allvalues_names = all_values_in_set(@response.body, 'data.items.PROCESSINSTANCEID')
  expect(source_allvalues_names).to_not include @processinstanceid
end

Then(/^the task result contains$/) do |table|
  @last_task_id = @task_to_update
  step 'the client requests a specific task'

  @json_object = JSON.parse(@response.body)
  json_verify = JsonVerifier.new

  result_array = @json_object["data"]['items']
  table.rows.each do |fieldpath, fieldvaluestring|
    json_verify.reset_output

    found = json_verify.build_subarray(fieldpath, fieldvaluestring, result_array)
    result_array = json_verify.subarry    
  end
  expect(result_array.length).to eq(1)

end
