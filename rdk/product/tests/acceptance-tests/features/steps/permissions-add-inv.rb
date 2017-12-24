After('@Remove_all_Permission_Sets_Individual') do | scenario |
  expect(@save_single_to_replace).to_not be_nil, "Expected scenario @Remove_all_Permission_Sets_Individual to set variable @save_single_to_replace for clean up"
  # Adding random permissions
  permission_name = 'intern'
  additional_permissions = 'review-result-consult-order'
  request = RDKQuery.new('permission-sets-bulk-edit')

  request.add_parameter('users', @save_single_to_replace.to_json)
  request.add_parameter('permissionSets', [permission_name].to_s)
  request.add_parameter('additionalPermissions', [additional_permissions].to_s)
  request.add_parameter('mode', 'add')

  path = request.path

  # reset to nil so don't accidently resuse
  @save_single_to_replace = nil 
  @response = HTTPartyRDK.put_as_user(path, "SITE;USER  ", "PW      ")
  expect(@response.code).to eq(200), "Was not able to reset permissions, next test run may fail: #{@response.body}"
end

After('@mutli_user_remove_all') do | scenario |
  expect(@save_bulk_to_replace).to_not be_nil, "Expected scenario @mutli_user_remove_all to set variable @save_bulk_to_replace for clean up"
  permission_name = 'intern'
  request = RDKQuery.new('permission-sets-bulk-edit')

  request.add_parameter('users', @save_bulk_to_replace.to_json)
  request.add_parameter('permissionSets', [permission_name].to_s)
  request.add_parameter('additionalPermissions', [].to_s)
  request.add_parameter('mode', 'add')

  path = request.path
  # reset to nil so don't accidently resuse
  @save_bulk_to_replace = nil
  @response = HTTPartyRDK.put_as_user(path, "SITE;USER  ", "PW      ")
  expect(@response.code).to eq(200), "Was not able to reset permissions, next test run may fail: #{@response.body}"
end

When(/^client updates single user to remove all permissions$/) do |table|
  query = RDKQuery.new('permission-sets-edit')
  user_hash = {}
  table.rows.each do | key, value |
    user_hash[key] = value
  end

  user_hash['permissions'] = []
  query.add_parameter('user', user_hash.to_json)
  query.add_parameter('permissionSets', [].to_s)
  query.add_parameter('additionalPermissions', [].to_s)
  path = query.path
  @response = HTTPartyRDK.put_as_user(path, "SITE;USER  ", "PW      ")
end

class PermissionsActions
  extend ::RSpec::Matchers
  def self.get_user_permissions(firstname, lastname, inactive = false)
    request = RDKQuery.new('user-service-userlist')
    user_hash = { 'firstName' => firstname, 'lastName' => lastname }
    request.add_parameter('user.filter', user_hash.to_json)
    request.add_parameter('page', '1')
    request.add_parameter('limit', '50')
    request.add_parameter('show.vista.inactive', 'true') if inactive
    request.add_parameter('show.ehmp.inactive', 'true') if inactive
    path = request.path
    HTTPartyRDK.get_as_user(path, "SITE;USER  ", "PW      ")
  end

  def self.parse_permission_sets(user_hash)
    expect(user_hash['permissionSet']).to_not be_nil, "permissionSet nil: #{user_hash}"
    expect(user_hash['permissionSet']['val']).to_not be_nil, "permissionSet, val nil: #{user_hash}"
    user_hash['permissionSet']['val']
  end

  def self.parse_additional_sets(user_hash)
    expect(user_hash['permissionSet']).to_not be_nil, "permissionSet nil: #{user_hash}"
    expect(user_hash['permissionSet']['additionalPermissions']).to_not be_nil, "permissionSet, additionalPermissions nil: #{user_hash}"
    user_hash['permissionSet']['additionalPermissions']
  end
end

Given(/^a user has at least 1 permission set and 1 additional permission for user "([^"]*)", "([^"]*)"$/) do |lastname, firstname|
  @response = PermissionsActions.get_user_permissions firstname, lastname, true
  expect(@response.code).to eq(200), "#{@response.body}"
  body = JSON.parse(@response.body)
  expect(body['data']).to_not be_nil
  expect(body['data'].length).to eq(1)
  set_array = PermissionsActions.parse_permission_sets body['data'][0]
  additional_array = PermissionsActions.parse_additional_sets body['data'][0]

  expect(set_array.length).to be > 0
  expect(additional_array.length).to be > 0
end

Given(/^user "([^"]*)", "([^"]*)" does not have permission set "([^"]*)"$/) do |lastname, firstname, permission_name|
  @response = PermissionsActions.get_user_permissions firstname, lastname, true
  expect(@response.code).to eq(200), "#{@response.body}"
  body = JSON.parse(@response.body)
  expect(body['data']).to_not be_nil
  expect(body['data'].length).to eq(1)
  set_array = PermissionsActions.parse_permission_sets body['data'][0]

  expect(set_array).to_not include permission_name
end

When(/^client updates users to add permission set "([^"]*)"$/) do |permission_name, table|
  request = RDKQuery.new('permission-sets-bulk-edit')
  user_array = []
  table.rows.each do | first, last, uid |
    user_hash = { 'fname' => first.upcase, 'lname' => last.upcase, 'uid' => uid }
    user_array.push(user_hash)#.to_json)
  end
  request.add_parameter('users', user_array.to_json)
  request.add_parameter('permissionSets', [permission_name].to_s)
  request.add_parameter('additionalPermissions', [].to_s)
  request.add_parameter('mode', 'add')

  path = request.path
  @response = HTTPartyRDK.put_as_user(path, "SITE;USER  ", "PW      ")
end

When(/^client updates users to remove permission set "([^"]*)"$/) do |permission_name, table|
  request = RDKQuery.new('permission-sets-bulk-edit')
  user_array = []
  table.rows.each do | first, last, uid |
    user_hash = { 'fname' => first.upcase, 'lname' => last.upcase, 'uid' => uid }
    user_array.push(user_hash)
  end
  request.add_parameter('users', user_array.to_json)
  request.add_parameter('permissionSets', [permission_name].to_s)
  request.add_parameter('additionalPermissions', [].to_s)
  request.add_parameter('mode', 'remove')

  path = request.path
  @response = HTTPartyRDK.put_as_user(path, "SITE;USER  ", "PW      ")
end

Then(/^user "([^"]*)", "([^"]*)" has permission set "([^"]*)"$/) do |lastname, firstname, permission_name|
  @response = PermissionsActions.get_user_permissions firstname, lastname
  expect(@response.code).to eq(200), "#{@response.body}"
  body = JSON.parse(@response.body)
  expect(body['data']).to_not be_nil
  expect(body['data'].length).to eq(1)
  set_array = PermissionsActions.parse_permission_sets body['data'][0]

  expect(set_array).to include permission_name
end

Given(/^user "([^"]*)", "([^"]*)" has at least one permission \( set or individual \)$/) do |lastname, firstname|
  @response = PermissionsActions.get_user_permissions firstname, lastname
  expect(@response.code).to eq(200), "#{@response.body}"
  body = JSON.parse(@response.body)
  expect(body['data']).to_not be_nil
  expect(body['data'].length).to eq(1)
  set_array = PermissionsActions.parse_permission_sets body['data'][0]
  additional_array = PermissionsActions.parse_additional_sets body['data'][0]

  combined_permissions = set_array + additional_array

  expect(combined_permissions.length).to be > 0
end

Then(/^user "([^"]*)", "([^"]*)" has no permissions$/) do |lastname, firstname|
  @response = PermissionsActions.get_user_permissions firstname, lastname, true
  expect(@response.code).to eq(200), "#{@response.body}"
  body = JSON.parse(@response.body)
  expect(body['data']).to_not be_nil
  expect(body['data'].length).to eq(1)
  set_array = PermissionsActions.parse_permission_sets body['data'][0]
  additional_array = PermissionsActions.parse_additional_sets body['data'][0]

  expect(set_array.length).to eq(0)
  expect(additional_array.length).to eq(0)
end

When(/^client updates users to remove all permissions$/) do |table|
  request = RDKQuery.new('permission-sets-bulk-edit')
  user_array = []
  set_to_remove = []
  add_perm_to_remove =[]

  table.rows.each do | first, last, uid |
    user_hash = { 'fname' => first.upcase, 'lname' => last.upcase, 'uid' => uid }
    user_array.push(user_hash)

    @response = PermissionsActions.get_user_permissions first, last, true
    expect(@response.code).to eq(200), "#{@response.body}"

    body = JSON.parse(@response.body)
    expect(body['data']).to_not be_nil
    expect(body['data'].length).to eq(1)
    set_array = PermissionsActions.parse_permission_sets body['data'][0]
    additional_array = PermissionsActions.parse_additional_sets body['data'][0]

    set_to_remove += set_array
    add_perm_to_remove += additional_array
  end
  request.add_parameter('users', user_array.to_json)
  request.add_parameter('permissionSets', Set.new(set_to_remove).to_a.to_s)
  request.add_parameter('additionalPermissions', Set.new(add_perm_to_remove).to_a.to_s)
  request.add_parameter('mode', 'remove')

  path = request.path
  @response = HTTPartyRDK.put_as_user(path, "SITE;USER  ", "PW      ")
end

Given(/^client is single updating permissions for$/) do |table|
  p "Save user to replace permissions after test"
  @save_single_to_replace = []
  table.rows.each do | first, last, uid |
    user_hash = { 'fname' => first.upcase, 'lname' => last.upcase, 'uid' => uid }
    @save_single_to_replace.push(user_hash)
  end
end

Given(/^client is bulk updating permissions for$/) do |table|
  p "Save user to replace permissions after test"
  @save_bulk_to_replace = []
  table.rows.each do | first, last, uid |
    user_hash = { 'fname' => first.upcase, 'lname' => last.upcase, 'uid' => uid }
    @save_bulk_to_replace.push(user_hash)
  end
end
