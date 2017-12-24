def create_a_default_consult(pid)
  expect(@deployment_id).to_not be_nil
  request = RDKQuery.new('activities-start')
  user = 'SITE;USER  '
  default_id = 'urn:va:user:SITE:10000000272'
  default_name = 'LAST, FIRST'
  parameter_hash = {}
  parameter_hash['icn'] = pid
  parameter_hash['assignedTo'] = '[FC:PANORAMA(500)/TF:Physical Therapy(81)]'
  parameter_hash['executionUserId'] = default_id
  parameter_hash['executionUserName'] = default_name
  parameter_hash['formAction'] = 'accepted'
  parameter_hash['orderingProvider displayName'] = default_name
  parameter_hash['orderingProvider uid'] = default_id
  parameter_hash['destination facility code'] = 500
  parameter_hash['destination facility name'] = 'PANORAMA'

  path = request.path

  payload = start_consult_request_payload
  payload = start_consult_parameter payload, parameter_hash
  payload = start_consult_consult_order payload, parameter_hash
  payload = start_consult_orderable payload, parameter_hash
  payload_json = payload.to_json
  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
  expect(@response.code).to eq(200)
  json = JSON.parse(@response.body)
  @processinstanceid = json['data']['processInstanceId']
  p "created a default consult with processInstanceId #{@processinstanceid}"
end

def retrieve_task_id(user)
  expect(@processinstanceid).to_not be_nil
  request = RDKQuery.new('tasks-tasks')
  today = TaskHelper.formated_today
  enddate = TaskHelper.formated_future

  context = 'user'
  subcontext = 'teamroles'
  payload_json = JSON.parse(%Q[{"context":"#{context}","subContext":"#{subcontext}","status":"Created,Ready,Reserved,InProgress","getNotifications":true,"startDate":"#{today}","endDate":"#{enddate}"}]).to_json

  path = request.path

  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
  expect(@response.code).to eq(200)
  retrieve_task_id_from_response_body
end

def retrieve_task_id_from_response_body(extra_parameters = nil)
  p extra_parameters
  @json_object = JSON.parse(@response.body)
  json_verify = JsonVerifier.new

  result_array = @json_object["data"]['items']
  
  table = []

  table.push(['PROCESSINSTANCEID', @processinstanceid.to_s])
  unless extra_parameters.nil?
    extra_parameters.rows.each do | parameter, value |
      table.push([parameter, value])
    end
  end

  table.each do |fieldpath, fieldvaluestring|
    json_verify.reset_output

    found = json_verify.build_subarray(fieldpath, fieldvaluestring, result_array)
    result_array = json_verify.subarry  
    p "Checking for #{fieldpath}: #{result_array.length}"
  end
  expect(result_array.length).to eq(1), "Did not find the expected combo with PROCESSINSTANCEID: #{@processinstanceid} in response: #{@json_object["data"]['items']}"
  @task_to_update = result_array[0]['TASKID'].to_s
  expect(@task_to_update).to_not eq(''), "Expected response to contain a TASKID: #{result_array[0]}"
end

def sign_a_default_consult(pid)
  expect(@deployment_id).to_not be_nil
  expect(@task_to_update).to_not be_nil

  user = 'SITE;USER  '
  # start update
  start_update_payload = {}
  start_update_payload['deploymentId'] = @deployment_id
  start_update_payload['processDefId'] = 'Order.Consult'
  start_update_payload['taskid'] = @task_to_update
  start_update_payload['icn'] = pid
  start_update_payload['state'] = 'start'
  start_signing_update start_update_payload, user
  expect(@response.code).to eq(200), "Did not get a 200 response when starting update"

  # sign
  sign_consult_payload = {}
  sign_consult_payload['pid'] = pid                  
  sign_consult_payload['site'] = "SITE"                         
  sign_consult_payload['uid'] = "urn:va:user:SITE:10000000272" 
  sign_consult_payload['duz site'] = "SITE"                         
  sign_consult_payload['duz id'] = "10000000272 "                 
  sign_consult_payload['facility'] = "PANORAMA"                     
  sign_consult_payload['firstname'] = "FIRST"                       
  sign_consult_payload['lastname'] = "LAST"                         
  sign_consult_payload['division'] = "500" 
  sign_consult_payload['signer'] = user
  payload = sign_consult sign_consult_payload
  post_sign_consult(payload, user)
  expect(@response.code).to eq(200), "Did not get a 200 response when signing consult"
  
  # complete update
  complete_update_payload = {}
  complete_update_payload['patient_pid'] = pid                
  complete_update_payload['icn'] = pid                  
  complete_update_payload['executionUserId'] = 'urn:va:user:SITE:10000000272' 
  complete_update_payload['executionUserName'] = 'LAST, FIRST'                 
  complete_update_payload['formAction'] =  'accepted'                   
  complete_update_payload['orderingProvider displayName'] = 'LAST, FIRST'                 
  complete_update_payload['orderingProvider uid'] = 'urn:va:user:SITE:10000000272' 
  complete_update_payload['state'] = 'complete'                     
  @parameter_hash = complete_update_payload
  @patient_id = @parameter_hash['patient_pid']
  @activity_user_id = @parameter_hash['initiator']

  payload_json = update_sign.to_json
  post_update_sign_completed(payload_json, user)
  expect(@response.code).to eq(200), "Did not get a 200 response when completing update"
end
