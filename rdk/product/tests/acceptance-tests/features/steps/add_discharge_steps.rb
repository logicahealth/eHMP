def discharge_start_call(user, table)
  request = RDKQuery.new('activities-start')
  parameter_hash = {}
  table.rows.each do | parameter, value |
    parameter_hash[parameter] = value
  end

  path = request.path

  payload = start_discharge_request_payload
  payload = start_discharge_parameter payload, parameter_hash
  payload_json = payload.to_json
  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

def start_discharge_request_payload
  payload = {}
  payload['deploymentId'] = @deployment_id
  payload['processDefId'] = "Order.DischargeFollowup"
  payload
end

def start_discharge_parameter(payload, parameter_hash)
  parameter = {}
  parameter['pid'] = variable_or_fail(parameter_hash, 'pid')
  parameter['deploymentId'] = "VistaCore:Order:1.0"
  parameter['processDefId'] = "Order.DischargeFollowup"
  parameter['dischargeFollowup'] = start_discharge_followup(parameter_hash)
  payload['parameter'] = parameter
  payload
end

def start_discharge_followup(parameter_hash)
  current_date_time = Time.now.strftime "%Y%m%d%H%M"
  discharge_followup = {}
  discharge_followup['objectType'] = "dischargeFollowup"
  discharge_followup['patientUid'] = variable_or_fail(parameter_hash, 'patientUid') 
  discharge_followup['authorUid'] = "urn:va:user:SITE:8"
  discharge_followup['referenceId'] = "urn:va:user:SITE:8"
  discharge_followup['domain'] = "ehmp-activity"
  discharge_followup['subDomain'] = "discharge"
  visit = {}
  visit['location'] = "urn:va:location:SITE:8"
  visit['serviceCategory'] = "SC"
  visit['dateTime'] = current_date_time
  discharge_followup['visit'] = visit
  discharge_followup['data'] = discharge_followup_data(parameter_hash)

  discharge_followup
end

def discharge_followup_data(parameter_hash)
  current_date_time = Time.now.strftime "%Y%m%d%H%M"
  data = {}
  data['deceased'] = "false"
  data['icn'] = variable_or_fail(parameter_hash, 'icn')
  data['lastUpdateTime'] = current_date_time
  data['facilityCode'] = "998"
  data['facilityName'] = "ABILENE (CAA)"
  data['kind'] = "discharge"
  data['locationDisplayName'] = "7A Gen Med"
  data['locationName'] = "7A GEN MED"
  data['locationUid'] = "urn:va:location:SITE:8"
  data['reasonName'] = "CHEST PAIN"
  data['roomBed'] = "735-B"
  data['service'] = "MEDICINE"
  data['shortLocationName'] = "7A GM"
  data['specialty'] = "MEDICAL OBSERVATION"
  data['stampTime'] = current_date_time
  movements = {}
  movements['dateTime'] = current_date_time
  movements['localId'] = "4781"
  movements['movementType'] = "DISCHARGE"
  movements['movementSubType'] = "REGULAR"
  movements['transferFacilityCode'] = "optional"
  movements['transferFacilityName'] = "optional"
  movements['summary'] = "EncounterMovement"
  movements_array = []
  movements_array.push(movements)
  data['movements'] = movements_array
  primary_provider = {}
  primary_provider['primary'] = "true"
  primary_provider['providerDisplayName'] = "Provider,Eightyfive"
  primary_provider['providerName'] = "PROVIDER,EIGHTYFIVE"
  primary_provider['providerUid'] = "urn:va:user:SITE:9010"
  primary_provider['role'] = "P"
  primary_provider['summary'] = "EncounterProvider"
  data['primaryProvider'] = primary_provider             
  stay = {}
  stay['arrivalDateTime'] = current_date_time     
  stay['dischargeDateTime'] = variable_or_default(parameter_hash['dischargeDateTime'], Time.now.strftime("%Y%m%d%H%M%S"))
  data['stay'] = stay   
  data 
end          
