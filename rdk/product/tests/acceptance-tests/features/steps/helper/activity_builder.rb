ADD_ACTIVITY_FACILITY_CODE = '500'
ADD_ACTIVITY_FACILITY_NAME = 'PANORAMA (PAN) COLVILLE, WA'
ADD_ACTIVITY_URGENCY_CODE = '9'
ADD_ACTIVITY_URGENCY_TEXT = 'routine'

def build_assigned_to_person(base_payload, parameter_hash)
  facility = variable_or_default(parameter_hash['facility'], ADD_ACTIVITY_FACILITY_CODE)
  assigned_to = parameter_hash['full_assignedTo']

  base_payload['parameter']['requestActivity']['data']['activity']['assignTo'] = "Person"
  base_payload['parameter']['requestActivity']['data']['requests'][0]['assignTo'] = "Person"

  route = {}
  route['facility'] = facility
  route['facilityName'] = parameter_hash['facility name']
  route['person'] = assigned_to
  route['personName'] = "USER, PANORAMA"
  base_payload['parameter']['requestActivity']['data']['requests'][0]['route'] = route
  base_payload
end

def build_assigned_to_any_team(base_payload, parameter_hash)
  facility = variable_or_default(parameter_hash['facility'], ADD_ACTIVITY_FACILITY_CODE)
  assigned_to = parameter_hash['full_assignedTo']

  base_payload['parameter']['requestActivity']['data']['activity']['assignTo'] = "Any Team"
  base_payload['parameter']['requestActivity']['data']['requests'][0]['assignTo'] = "Any Team"

  route = {}
  route['routingCode'] = assigned_to
  team = {}
  team['code'] = parameter_hash['team code']
  team['name'] = parameter_hash['team name']

  assigned_roles = {}
  assigned_roles['code'] = parameter_hash['assigned roles code']
  assigned_roles['name'] = parameter_hash['assigned roles name']
  route['team'] = team
  route['assignedRoles'] = [assigned_roles]
  route['facility'] = facility
  base_payload['parameter']['requestActivity']['data']['requests'][0]['route'] = route
  base_payload
end

def build_assigned_to_my_team(base_payload, parameter_hash)
  facility = variable_or_default(parameter_hash['facility'], ADD_ACTIVITY_FACILITY_CODE)
  assigned_to = parameter_hash['full_assignedTo']
  base_payload['parameter']['requestActivity']['data']['activity']['assignTo'] = "My Teams"
  base_payload['parameter']['requestActivity']['data']['requests'][0]['assignTo'] = "My Teams"

  route = {}
  route['routingCode'] = assigned_to
  team = {}
  team['code'] = parameter_hash['team code']
  team['name'] = parameter_hash['team name']

  assigned_roles = {}
  assigned_roles['code'] = parameter_hash['assigned roles code']
  assigned_roles['name'] = parameter_hash['assigned roles name']
  route['team'] = team
  route['assignedRoles'] = [assigned_roles]
  route['facility'] = facility
  base_payload['parameter']['requestActivity']['data']['requests'][0]['route'] = route
  base_payload
end

def build_assigned_to_patient_team(base_payload, parameter_hash)
  facility = variable_or_default(parameter_hash['facility'], ADD_ACTIVITY_FACILITY_CODE)
  assigned_to = parameter_hash['full_assignedTo']
  base_payload['parameter']['requestActivity']['data']['activity']['assignTo'] = "Patient's Teams"
  base_payload['parameter']['requestActivity']['data']['requests'][0]['assignTo'] = "Patient's Teams"

  route = {}
  route['routingCode'] = assigned_to
  team = {}
  team['code'] = parameter_hash['team code']
  team['name'] = parameter_hash['team name']

  assigned_roles = {}
  assigned_roles['code'] = parameter_hash['assigned roles code']
  assigned_roles['name'] = parameter_hash['assigned roles name']
  route['team'] = team
  route['assignedRoles'] = [assigned_roles]
  route['facility'] = facility
  base_payload['parameter']['requestActivity']['data']['requests'][0]['route'] = route
  base_payload
end

def build_assigned_to_me(base_payload, parameter_hash)
  base_payload['parameter']['requestActivity']['data']['activity']['assignTo'] = "Me"
  base_payload['parameter']['requestActivity']['data']['requests'][0]['assignTo'] = "Me"
  base_payload
end

def build_data(title, parameter_hash, visit)
  # can be changed
  urgency = variable_or_default(parameter_hash['urgency'], ADD_ACTIVITY_URGENCY_CODE)
  assigned_to = parameter_hash['full_assignedTo']
  tomorrow = Date.today.strftime("%Y%m%d040000")
  nextmonth = Date.today.next_month.strftime("%Y%m%d035959")
  timestamp = Time.now.strftime "%Y-%m-%dT%H:%M:%S.%LZ" # 2016-08-04T18:58:58.624Z
  facility = variable_or_default(parameter_hash['facility'], ADD_ACTIVITY_FACILITY_CODE)

  data = {}

  activity = {}
  activity['objectType'] = 'activity'
  activity['deploymentId'] = "#{@deployment_id}"
  activity['processDefinitionId'] = "Order.Request"
  activity['processInstanceId'] = ''
  activity['state'] = 'accepted'
  activity['initiator'] = variable_or_fail(parameter_hash, 'authorId')

  activity['timeStamp'] = ''
  activity['urgency'] = urgency
  activity['assignedTo'] = assigned_to
  activity['instanceName'] = title
  activity['domain'] = 'Request'
  activity['sourceFacilityId'] = facility
  activity['destinationFacilityId'] = facility
  activity['type'] = 'Order'
  data['activity'] =  activity

  data['signals'] = []

  requests = {}
  requests['objectType'] = 'request'
  requests['taskinstanceId'] = ''
  requests['urgency'] = variable_or_default(parameter_hash['urgency text'], ADD_ACTIVITY_URGENCY_TEXT)
  requests['earliestDate'] = tomorrow
  requests['latestDate'] = nextmonth
  requests['title'] = title
  
  requests['request'] = title
  requests['submittedByUid'] = "urn:va:user:#{parameter_hash['authorFac']}:#{parameter_hash['authorId']}"
  requests['submittedByName'] = parameter_hash['authorName']
  requests['submittedTimeStamp'] = timestamp
  requests['visit'] = visit

  data['requests'] = [requests]
  data['responses'] = []
  data
end

def build_request_activity(title, parameter_hash)
  patient_facility = variable_or_fail(parameter_hash, 'patient_facility')
  patient_id = variable_or_fail(parameter_hash, 'patient_id')
  author_facility = variable_or_fail(parameter_hash, 'authorFac')
  author_id = variable_or_fail(parameter_hash, 'authorId')

  request = {}
  request['objectType'] = 'requestActivity'
  request['patientUid'] = "urn:va:patient:#{patient_facility}:#{patient_id}:#{patient_id}"
  request['authorUid'] = "urn:va:user:#{author_facility}:#{author_id}"
  request['creationDateTime'] = Date.today.strftime("%Y%m%d%H%M%S")
  request['domain'] = 'ehmp-activity'
  request['subDomain'] = 'request'
  visit = default_visit
  visit['locationDesc'] = "Cardiology"

  request['visit'] = visit
  request['ehmpState'] = 'accepted'
  request['displayName'] = title
  request['referenceId'] = ''
  request['instanceName'] = title

  request['data'] = build_data title, parameter_hash, visit
  request
end

def build_parameter(parameter_hash)
  expect(@patient_pid).to_not be_nil, "Expected variable @patient_pid to have been set by a previous step"
  timeonly = Time.now.strftime "%H:%M:%S %L"
  @new_activity_title = "TestAddRequest #{Date.today} #{timeonly}"

  p "New Activity with title #{@new_activity_title}"
  facility = variable_or_default(parameter_hash['facility'], ADD_ACTIVITY_FACILITY_CODE)

  parameter = {}
  parameter['requestActivity'] = build_request_activity @new_activity_title, parameter_hash
  parameter['icn'] = "#{@patient_pid}"
  parameter['pid'] = "#{@patient_pid}"
  parameter['instanceName'] = @new_activity_title
  parameter['formAction'] = 'accepted'
  parameter['urgency'] = variable_or_default(parameter_hash['urgency'], ADD_ACTIVITY_URGENCY_CODE)
  parameter['subDomain'] = 'Request'
  parameter['assignedTo'] = variable_or_fail(parameter_hash, 'full_assignedTo')
  parameter['type'] = 'Order'
  parameter['facility'] = facility
  parameter['destinationFacility'] = facility
  parameter['description'] = "TestDesc #{Date.today} #{timeonly}"
  
  parameter
end

def start_base_activity(parameter_hash)
  expect(@deployment_id).to_not be_nil, "Expected variable @deployment_id to have been set by a previous step"
  patient_facility = variable_or_fail(parameter_hash, 'patient_facility')
  patient_id = variable_or_fail(parameter_hash, 'patient_id')

  @patient_pid = "#{patient_facility};#{patient_id}"
  base_payload = {}
  base_payload['deploymentId'] = "#{@deployment_id}"
  base_payload['processDefId'] = 'Order.Request'
  base_payload
end

def start_person_activity(parameter_hash)
  base_payload = start_base_activity(parameter_hash)
  base_payload['parameter'] = build_parameter parameter_hash
  base_payload = build_assigned_to_person(base_payload, parameter_hash)
  base_payload
end

def start_anyteam_activity(parameter_hash)
  base_payload = start_base_activity(parameter_hash)
  base_payload['parameter'] = build_parameter parameter_hash
  base_payload = build_assigned_to_any_team(base_payload, parameter_hash)
  base_payload
end

def start_myteam_activity(parameter_hash)
  base_payload = start_base_activity(parameter_hash)
  base_payload['parameter'] = build_parameter parameter_hash
  base_payload = build_assigned_to_my_team(base_payload, parameter_hash)
  base_payload
end

def start_patientteam_activity(parameter_hash)
  p variable_or_default(parameter_hash['facility'], 'defaultfacility')
  p variable_or_default(parameter_hash['facility2'], 'defaultfacility')
  base_payload = start_base_activity(parameter_hash)
  base_payload['parameter'] = build_parameter parameter_hash
  base_payload = build_assigned_to_patient_team(base_payload, parameter_hash)
  base_payload
end

def start_activity_assignedtome(parameter_hash)
  base_payload = start_base_activity(parameter_hash)
  base_payload['parameter'] = build_parameter parameter_hash
  base_payload = build_assigned_to_me(base_payload, parameter_hash)
  base_payload
end
