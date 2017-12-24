def sign_consult(parameter_hash)
  payload = {}
  payload['deploymentId'] = "#{@deployment_id}"
  payload['processDefId'] = 'Order.Consult'
  payload['taskid'] = ''
  payload['pid'] = variable_or_fail(parameter_hash, 'pid')
  user_signing = variable_or_fail(parameter_hash, 'signer')
  payload['signature'] = TestClients.password_for(user_signing)
  p "#{user_signing} #{payload['signature']}"

  session = {}
  session['site'] = variable_or_fail(parameter_hash, 'site')
  session['uid'] = variable_or_fail(parameter_hash, 'uid')
  session['disabled'] = variable_or_default(parameter_hash['disabled'], false)
  session['divisionSelect'] = variable_or_default(parameter_hash['divisionSelect'], false)

  duz_key = variable_or_fail(parameter_hash, 'duz site')
  session[duz_key] = variable_or_fail(parameter_hash, 'duz id')

  session['facility'] = variable_or_fail(parameter_hash, 'facility')
  session['firstname'] = variable_or_fail(parameter_hash, 'firstname')
  session['lastname'] = variable_or_fail(parameter_hash, 'lastname')
  session['pcmm'] = []
  session['requiresReset'] = false
  session['section'] = variable_or_default(parameter_hash['section'], 'Medicine')
  session['sessionLength'] = 900_000
  session['division'] = variable_or_fail(parameter_hash, 'division')
  session['title'] = variable_or_default(parameter_hash['title'], 'Clinician')
  session['provider'] = variable_or_default(parameter_hash['provider'], true)
  session['status'] = 'loggedin'
  session['infobutton-oid'] = '1.3.6.1.4.1.3768.86'
  session['infobutton-site'] = 'http://service.oib.utah.edu:8080/infobutton-service/infoRequest?'
  preferences = { :defaultScreen => {} }

  #session['permissions'] = %w{sign-consult-order add-consult-order cancel-task complete-consult-order edit-consult-order edit-task review-result-consult-order triage-consult-order}
  session['permissions'] = permissions_array
  session['preferences'] = preferences
  payload['session'] = session
  payload
end

def update_econsult
  payload = {}

  state = @parameter_hash['state']
  payload = update_base payload, state
end

def post_sign_consult(payload, user)
  domain_path = String.new(RDClass.resourcedirectory_writeback.get_url('consult-orders-sign'))
  @response = HTTPartyRDK.post_as_user(domain_path, user, TestClients.password_for(user), payload.to_json, TaskHelper.headers)
end

When(/^the "([^"]*)" client signs the consult order$/) do |user, table|
  @parameter_hash = {}
  table.rows.each do | parameter, value |
    @parameter_hash[parameter] = value
  end
  @parameter_hash['signer'] = user
  payload = sign_consult @parameter_hash
  post_sign_consult(payload, user)
end

def post_update_sign_completed(payload_json, user)
  request = RDKQuery.new('tasks-update')
  path = request.path
  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

When(/^the "([^"]*)" client requests the task is updated to be signed$/) do |user, table|
  @parameter_hash = {}
  table.rows.each do | parameter, value |
    @parameter_hash[parameter] = value
  end

  @patient_id = @parameter_hash['patient_pid']
  @activity_user_id = @parameter_hash['initiator']

  payload_json = update_sign.to_json
  post_update_sign_completed(payload_json, user)
end

Given(/^the user SITE;USER   has created and signed a consult for patient "([^"]*)"$/) do |pid|
  create_a_default_consult pid
  retrieve_task_id 'SITE;USER  '
  sign_a_default_consult pid
  retrieve_task_id 'SITE;USER  '
end

def post_update_task(payload, user)
  request = RDKQuery.new('tasks-update')
  path = request.path
  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload.to_json, TaskHelper.headers)
end

def start_update_task_no_parameter(user, table)
  expect(@task_to_update).to_not be_nil

  payload = {}
  payload = start_consult_request_payload
  payload['taskid'] = @task_to_update
  table.rows.each do | parameter, value |
    payload[parameter] = value
  end
  payload['parameter'] = nil
  post_update_task payload, user
end

When(/^the user "([^"]*)" requests to update task to eConsult \(start\)$/) do |user, table|
  start_update_task_no_parameter user, table
end

When(/^the user "([^"]*)" requests to update task to Return for Clarafication \(start\)$/) do |user, table|
  start_update_task_no_parameter user, table
end

When(/^the user "([^"]*)" requests to update task to Referred to Community Care \(start\)$/) do |user, table|
  start_update_task_no_parameter user, table
end

When(/^the user "([^"]*)" requests to update task to Assign to triage member \(start\)$/) do |user, table|
  start_update_task_no_parameter user, table
end

When(/^the user "([^"]*)" requests to update task to Send to Scheduling \(start\)$/) do |user, table|
  start_update_task_no_parameter user, table
end

When(/^the user "([^"]*)" requests to update task to eConsult$/) do |user, table|
  expect(@task_to_update).to_not be_nil
  parameter_hash = {}
  table.rows.each do | parameter, value |
    parameter_hash[parameter] = value
  end

  payload = {}
  payload['deploymentId'] = @deployment_id
  payload['processDefId'] = "Order.Consult"
  payload['taskid'] = @task_to_update
  payload['icn'] = variable_or_fail(parameter_hash, 'icn')
  payload['state'] = variable_or_fail(parameter_hash, 'state')

  ordering_provider = {}
  ordering_provider['displayName'] = variable_or_fail(parameter_hash, 'orderingProvider displayName')
  ordering_provider['uid'] = variable_or_fail(parameter_hash, 'orderingProvider uid')

  consult_order = build_consult_order_payload(parameter_hash)

  consult_order['communityCareStatus'] = nil
  consult_order['conditions'] = { :code => "null", :name => "" }
  consult_order['contactAttempt'] = nil
  consult_order['instructions'] = nil
  consult_order['orderingProvider'] = ordering_provider
  consult_order['overrideReason'] = nil
  consult_order['orderResultComment'] = nil
  consult_order['scheduledDate'] = nil

  parameter = {}
  parameter['consultOrder'] = consult_order
  payload['parameter'] = parameter
  post_update_task payload, user
end

When(/^the user "([^"]*)" requests to update task to Return for Clarafication$/) do |user, table|
  expect(@task_to_update).to_not be_nil
  parameter_hash = {}
  table.rows.each do | parameter, value |
    parameter_hash[parameter] = value
  end

  payload = {}
  payload['deploymentId'] = @deployment_id
  payload['processDefId'] = "Order.Consult"
  payload['taskid'] = @task_to_update
  payload['icn'] = variable_or_fail(parameter_hash, 'icn')
  payload['state'] = variable_or_fail(parameter_hash, 'state')

  ordering_provider = {}
  ordering_provider['displayName'] = variable_or_fail(parameter_hash, 'orderingProvider displayName')
  ordering_provider['uid'] = variable_or_fail(parameter_hash, 'orderingProvider uid')

  consult_order = build_consult_order_payload(parameter_hash)

  consult_order['communityCareStatus'] = nil
  consult_order['conditions'] = { :code => "null", :name => "" }
  consult_order['contactAttempt'] = nil
  consult_order['instructions'] = nil
  consult_order['orderingProvider'] = ordering_provider
  consult_order['overrideReason'] = nil
  consult_order['orderResultComment'] = nil
  consult_order['scheduledDate'] = nil
  consult_order['formComment'] = variable_or_fail(parameter_hash, 'formComment')

  parameter = {}
  parameter['consultOrder'] = consult_order
  payload['parameter'] = parameter
  post_update_task payload, user
end

When(/^the user "([^"]*)" requests to update task to Referred to Community Care$/) do |user, table|
  expect(@task_to_update).to_not be_nil
  parameter_hash = {}
  table.rows.each do | parameter, value |
    parameter_hash[parameter] = value
  end

  payload = {}
  payload['deploymentId'] = @deployment_id
  payload['processDefId'] = "Order.Consult"
  payload['taskid'] = @task_to_update
  payload['icn'] = variable_or_fail(parameter_hash, 'icn')
  payload['state'] = variable_or_fail(parameter_hash, 'state')

  ordering_provider = {}
  ordering_provider['displayName'] = variable_or_fail(parameter_hash, 'orderingProvider displayName')
  ordering_provider['uid'] = variable_or_fail(parameter_hash, 'orderingProvider uid')

  consult_order = build_consult_order_payload(parameter_hash)

  consult_order['communityCareStatus'] = variable_or_fail(parameter_hash, 'communityCareStatus')
  consult_order['communityCareType'] = variable_or_fail(parameter_hash, 'communityCareType')
  consult_order['conditions'] = { :code => "null", :name => "" }
  consult_order['contactAttempt'] = nil
  consult_order['instructions'] = nil
  consult_order['orderingProvider'] = ordering_provider
  consult_order['overrideReason'] = nil
  consult_order['orderResultComment'] = nil
  consult_order['scheduledDate'] = nil

  parameter = {}
  parameter['consultOrder'] = consult_order
  payload['parameter'] = parameter
  post_update_task payload, user
end

When(/^the user "([^"]*)" requests to update task to Assign to triage member$/) do |user, table|
  expect(@task_to_update).to_not be_nil
  parameter_hash = {}
  table.rows.each do | parameter, value |
    parameter_hash[parameter] = value
  end

  payload = {}
  payload['deploymentId'] = @deployment_id
  payload['processDefId'] = "Order.Consult"
  payload['taskid'] = @task_to_update
  payload['icn'] = variable_or_fail(parameter_hash, 'icn')
  payload['state'] = variable_or_fail(parameter_hash, 'state')

  ordering_provider = {}
  ordering_provider['displayName'] = variable_or_fail(parameter_hash, 'orderingProvider displayName')
  ordering_provider['uid'] = variable_or_fail(parameter_hash, 'orderingProvider uid')

  consult_order = build_consult_order_payload(parameter_hash)
  accepting_provider = {}
  accepting_provider['displayName'] = variable_or_fail(parameter_hash, 'acceptingProvider displayName')
  accepting_provider['uid'] = variable_or_fail(parameter_hash, 'acceptingProvider uid')
  consult_order['acceptingProvider'] = accepting_provider

  consult_order['conditions'] = { :code => "null", :name => "" }
  consult_order['orderingProvider'] = ordering_provider
  timing = Time.now.strftime "%Y%m%d%H%M%S %L"
  consult_order['formComment'] = "Reassign Comment #{timing}"

  parameter = {}
  parameter['consultOrder'] = consult_order
  payload['parameter'] = parameter
  post_update_task payload, user
end

When(/^the user "([^"]*)" requests to update task to Send to Scheduling$/) do |user, table|
  expect(@task_to_update).to_not be_nil
  parameter_hash = {}
  table.rows.each do | parameter, value |
    parameter_hash[parameter] = value
  end

  payload = {}
  payload['deploymentId'] = @deployment_id
  payload['processDefId'] = "Order.Consult"
  payload['taskid'] = @task_to_update
  payload['icn'] = variable_or_fail(parameter_hash, 'icn')
  payload['state'] = variable_or_fail(parameter_hash, 'state')

  ordering_provider = {}
  ordering_provider['displayName'] = variable_or_fail(parameter_hash, 'orderingProvider displayName')
  ordering_provider['uid'] = variable_or_fail(parameter_hash, 'orderingProvider uid')

  consult_order = build_consult_order_payload(parameter_hash)
  # accepting_provider = {}
  # accepting_provider['displayName'] = variable_or_fail(parameter_hash, 'acceptingProvider displayName')
  # accepting_provider['uid'] = variable_or_fail(parameter_hash, 'acceptingProvider uid')
  # consult_order['acceptingProvider'] = accepting_provider

  consult_order['conditions'] = { :code => "null", :name => "" }
  # consult_order['orderingProvider'] = ordering_provider
  # timing = Time.now.strftime "%Y%m%d%H%M%S %L"
  # consult_order['formComment'] = "Reassign Comment #{timing}"

  parameter = {}
  parameter['consultOrder'] = consult_order
  payload['parameter'] = parameter
  post_update_task payload, user

end

Then(/^the response reports valid signature$/) do
  response = JSON.parse(@response.body)
  expect(response['data']['data']).to eq('Valid signature')
end

def start_signing_update(payload, user)
  request = RDKQuery.new('tasks-update')
  path = request.path

  payload_json = payload.to_json
  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

When(/^the "([^"]*)" client requests the sign update start$/) do |user, table|

  payload = {}
  payload['deploymentId'] = @deployment_id
  payload['processDefId'] = 'Order.Consult'
  payload['taskid'] = @task_to_update
  table.rows.each do| key, value |
    payload[key] = value
  end
  start_signing_update payload, user
end

When(/^set taskid$/) do
  @last_task_id = @task_to_update
end

Then(/^response task contains$/) do |extra_parameters|
  @json_object = JSON.parse(@response.body)
  p @json_object
  json_verify = JsonVerifier.new

  result_array = @json_object["data"]['items']
  
  table = []

  extra_parameters.rows.each do | parameter, value |
    table.push([parameter, value])
  end

  table.each do |fieldpath, fieldvaluestring|
    json_verify.reset_output

    found = json_verify.build_subarray(fieldpath, fieldvaluestring, result_array)
    result_array = json_verify.subarry  
    p "Checking for #{fieldpath}: #{result_array.length}"
  end
  expect(result_array.length).to eq(1)#, "Did not find the expected combo with PROCESSINSTANCEID: #{@processinstanceid} in response: #{@json_object["data"]['items']}"

end

Given(/^the user "([^"]*)" signals to activate order$/) do |user, table|
  request = RDKQuery.new('activities-signal')

  path = request.path
  parameter_hash = {}
  table.rows.each do | key, value |
    parameter_hash[key] = value
  end
  payload = {}
  payload['deploymentId'] = @deployment_id
  payload['processInstanceId'] = @processinstanceid.to_i
  payload['signalName'] = 'ORDER.ACTIVATE'
  signal_body = {}
  signal_body['objectType'] = 'signalBody'
  signal_body['comment'] = 'order activate'
  signal_body['userId'] = variable_or_fail(parameter_hash, 'userId')
  parameter = { :signalBody => signal_body }
  payload['parameter'] = parameter
  payload_json = payload.to_json
  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
  expect(@response.code).to eq(200), "Received #{@response.code}, #{@response.body}"
end
