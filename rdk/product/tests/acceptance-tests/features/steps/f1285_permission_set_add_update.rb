Given(/^the user "([^"]*)" attempts to add a new permission set with parameters$/) do |user, table|
  request = RDKQuery.new('permission-set-add')
  parameter_hash = {}
  table.rows.each do | parameter, value |
    parameter_hash[parameter] = value
  end

  path = request.path

  payload = start_add_permission_set_parameter parameter_hash
  payload_json = payload.to_json
  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

Given(/^the user "([^"]*)" attempts to update above permission set with parameters$/) do |user, table|
  request = RDKQuery.new('permission-set-update')
  parameter_hash = {}
  table.rows.each do | parameter, value |
    parameter_hash[parameter] = value
  end

  path = request.path

  payload = start_update_permission_set_parameter parameter_hash
  payload_json = payload.to_json
  @response = HTTPartyRDK.put_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

Given(/^the user retrieves the uid of the added permission set$/) do
  response_body = JSON.parse(@response.body)
  expect(response_body['data']).to_not be_nil, "Expected response body to contain hash tag [data]"
  expect(response_body['data']['uid']).to_not be_nil, "Expect response body to contain hash tag uid"
  @added_permission_uid = response_body['data']['uid']
end

Given(/^the user "([^"]*)" deprecates the above permission set with parameters$/) do |user, table|
  request = RDKQuery.new('permission-set-deprecate')
  parameter_hash = {}
  table.rows.each do | parameter, value |
    parameter_hash[parameter] = value
  end

  path = request.path

  payload = start_deprecate_permission_set_parameter parameter_hash
  payload_json = payload.to_json
  @response = HTTPartyRDK.put_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

def to_bool(str)
  return true if str == "true"
  return false if str == "false"
end

def start_add_permission_set_parameter(parameter_hash)
  parameter = {}
  parameter['nationalAccess'] = to_bool(variable_or_fail(parameter_hash, 'nationalAccess'))
  parameter['status'] = variable_or_fail(parameter_hash, 'status')
  parameter['sub-sets'] = variable_or_fail(parameter_hash, 'sub-sets').split(',')
  parameter['description'] = variable_or_fail(parameter_hash, 'description')
  parameter['permissions'] = variable_or_fail(parameter_hash, 'permissions').split(',')

  timing = Time.now.strftime "%Y%m%d%H%M%S %L"
  @label = variable_or_fail(parameter_hash, 'label') + "#{timing}"
  parameter['label'] = "#{@label}"

  parameter['version'] = variable_or_fail(parameter_hash, 'version')
  parameter
end

def start_update_permission_set_parameter(parameter_hash)
  parameter = {}
  parameter['status'] = variable_or_fail(parameter_hash, 'status')
  parameter['sub-sets'] = variable_or_fail(parameter_hash, 'sub-sets').split(',')
  parameter['description'] = variable_or_fail(parameter_hash, 'description')
  parameter['label'] = "#{@label}"
  parameter['version'] = variable_or_fail(parameter_hash, 'version')
  parameter['uid'] = @added_permission_uid
  parameter
end

def start_deprecate_permission_set_parameter(parameter_hash)
  parameter = {}
  parameter['uid'] = @added_permission_uid
  parameter['deprecatedVersion'] = variable_or_fail(parameter_hash, 'deprecatedVersion')
  parameter['deprecate'] = to_bool(variable_or_fail(parameter_hash, 'deprecate'))
  parameter
end
