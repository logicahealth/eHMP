def delete_consult_payload(parameter_hash)
  payload = {}
  payload['deploymentId'] = @deployment_id
  payload['processInstanceId'] = @processinstanceid.to_i
  payload['signalName'] = 'END'

  exe_user_id = {}
  exe_user_id['uid'] = variable_or_fail(parameter_hash, 'uid')
  exe_user_id['displayName'] = variable_or_fail(parameter_hash, 'displayName')

  signal_body = {}
  signal_body['objectType'] = 'signalBody'
  signal_body['comment'] = "Abort Process"
  signal_body['reason'] = "Delete"
  signal_body['actionText'] = "Delete"
  signal_body['executionUserName'] = variable_or_fail(parameter_hash, 'executionUserName')
  signal_body['executionUserId'] = exe_user_id
  parameter = {}
  parameter['signalBody'] = signal_body
  payload['parameter'] = parameter
  payload
end

def start_consult_request_payload
  payload = {}
  payload['deploymentId'] = @deployment_id
  payload['processDefId'] = "Order.Consult"
  payload
end

def start_consult_parameter(payload, parameter_hash)
  parameter = {}
  parameter['cdsIntentResult'] = variable_or_default(parameter_hash['cdsIntentResult'], '')
  parameter['assignedTo'] = variable_or_fail(parameter_hash, 'assignedTo')
  parameter['domain'] = variable_or_default(parameter_hash['domain'], 'ehmp-activity')
  parameter['icn'] = variable_or_fail(parameter_hash, 'icn')
  parameter['instanceName'] = variable_or_default(parameter_hash['domain'], 'Physical Therapy')
  parameter['subDomain'] = 'consult'
  parameter['type'] = 'Order'
  parameter['urgency'] = variable_or_default(parameter_hash['urgency'], '9')
  payload['parameter'] = parameter
  payload
end

def start_consult_consult_order(payload, parameter_hash)
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

  consult_order['conditions'] = [conditions]
  consult_order['orderingProvider'] = ordering_provider

  visit = default_visit
  visit['locationDesc'] = 'Comp and Pen'

  team_focus = {}
  team_focus['code'] = variable_or_default(parameter_hash['domain_code'], 81)
  team_focus['name'] = variable_or_default(parameter_hash['domain'], 'Physical Therapy')

  consult_order['visit'] = visit
  consult_order['teamFocus'] = team_focus

  payload['parameter']['consultOrder'] = consult_order
  payload
end

def start_consult_orderable(payload, parameter_hash)
  orderable = {}
  expect(payload['parameter']).to_not be_nil

  orderable['domain'] = 'ehmp-activity'
  orderable['facility-enterprise'] = 'enterprise'
  orderable['name'] = variable_or_default(parameter_hash['domain'], 'Physical Therapy')
  orderable['state'] = 'active'
  orderable['subDomain'] = 'consult'
  orderable['type'] = 'ehmp-enterprise-orderable'
  orderable['uid'] = 'urn:va:entordrbls:1'

  data = {}
  activity = { :deploymentId => 'VistaCore:Order', :processDefinitionId => 'Order:Consult' }

  codes = [{ :code => '444831000124102', :display => 'Referral for physical therapy', :system => 'urn:oid:2.16.840.1.113883.6.96' }]
  team_focus = {}
  team_focus['code'] = variable_or_default(parameter_hash['domain_code'], 81)
  team_focus['name'] = variable_or_default(parameter_hash['domain'], 'Physical Therapy')

  data['activity'] = activity
  data['codes'] = codes
  data['team_focus'] = team_focus
  orderable['data'] = data
  payload['parameter']['orderable'] = orderable.to_json
  payload
end

def activities_start_call(user, table)
  request = RDKQuery.new('activities-start')
  parameter_hash = {}
  table.rows.each do | parameter, value |
    parameter_hash[parameter] = value
  end

  path = request.path

  payload = start_consult_request_payload
  payload = start_consult_parameter payload, parameter_hash
  payload = start_consult_consult_order payload, parameter_hash
  payload = start_consult_orderable payload, parameter_hash
  payload_json = payload.to_json
  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

Given(/^the user "([^"]*)" has started a consult draft with parameters$/) do |user, table|
  expect(@deployment_id).to_not be_nil
  activities_start_call user, table
end

def request_drafts(user, pid, payload)
  domain_path = String.new(RDClass.resourcedirectory_writeback.get_url('orders-find-draft'))
  domain_path.sub!(':pid', pid)

  payload_json = payload.to_json
  @response = HTTPartyRDK.post_as_user(domain_path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

When(/^the user "([^"]*)" requests activity drafts for patient "([^"]*)"$/) do |user, pid, table|
  payload = {}
  table.rows.each do | parameter, value |
    payload[parameter] = value
  end
  payload['domain'] = "ehmp-activity"
  payload['ehmpState'] = "draft"
  request_drafts(user, pid, payload)
end

When(/^the user "([^"]*)" requests order drafts for patient "([^"]*)"$/) do |user, pid, table|
  payload = {}
  table.rows.each do | parameter, value |
    payload[parameter] = value
  end
  payload['domain'] = "ehmp-order"
  payload['ehmpState'] = "draft"
  request_drafts(user, pid, payload)
end

Then(/^the draft list contains the created draft$/) do |extra_parameters|
  @json_object = JSON.parse(@response.body)
  json_verify = JsonVerifier.new

  result_array = @json_object["data"]['items']
  table = []

  table.push(['data.activity.processInstanceId', @processinstanceid])
  table.push(['data.consultOrders.request', @request_reason])
  extra_parameters.rows.each do | parameter, value |
    table.push([parameter, value])
  end

  table.each do |fieldpath, fieldvaluestring|
    json_verify.reset_output

    found = json_verify.build_subarray(fieldpath, fieldvaluestring, result_array)
    result_array = json_verify.subarry    
  end
  expect(result_array.length).to eq(1), "Expected a single extry that matches table elements #{table}"
end

When(/^the user "([^"]*)" reads the consult draft for patient "([^"]*)"$/) do |user, patient|
  request = RDKQuery.new('activity-instance-byid')
  p @deployment_id
  p @processinstanceid
  payload = {}
  payload['deploymentId'] = @deployment_id
  payload['processInstanceId'] = @processinstanceid.to_i

  path = request.path

  payload_json = payload.to_json
  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

Then(/^the order draft list contains the created consult draft$/) do |extra_parameters|
  expect(@unique_comment).to_not be_nil, "expected variable @order_comment to have been set with a unique value"
  @json_object = JSON.parse(@response.body)
  json_verify = JsonVerifier.new

  result_array = [@json_object['data']]
  p "resultarray #{result_array}"
  table = []

  table.push(['consultOrder.requestComment', @unique_comment])
  table.push(['consultClinicalObject.data.consultOrders.comment', @unique_comment])
  extra_parameters.rows.each do | parameter, value |
    table.push([parameter, value])
  end

  table.each do |fieldpath, fieldvaluestring|
    json_verify.reset_output

    found = json_verify.build_subarray(fieldpath, fieldvaluestring, result_array)
    result_array = json_verify.subarry
    expect(result_array.length).to be >= 1, "Cannot find expected value for #{fieldpath}"    
  end
  expect(result_array.length).to eq(1), "Expected a single extry that matches table elements #{table}"
end

When(/^the user "([^"]*)" deletes a consult draft with parameters$/) do |user, table|
  request = RDKQuery.new('activities-signal')

  path = request.path
  parameter_hash = {}
  table.rows.each do | key, value |
    parameter_hash[key] = value
  end
  payload = delete_consult_payload parameter_hash
  payload_json = payload.to_json
  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

Then(/^the consult draft list for user "([^"]*)" and patient "([^"]*)" does not contain the created draft$/) do |user, pid, table|
  expect(@unique_comment).to_not be_nil, "expected variable @order_comment to have been set with a unique value"
  payload = {}
  table.rows.each do | parameter, value |
    payload[parameter] = value
  end
  payload['domain'] = "ehmp-activity"
  payload['ehmpState'] = "draft"
  request_drafts(user, pid, payload)
  expect(@response.code).to eq(200), "Received #{@response.code}, #{@response.body}"

  source_allvalues = all_values_in_set(@response.body, 'data.items.data.consultOrders.comment')
  p source_allvalues
  expect(source_allvalues).to_not include(@unique_comment)
end

