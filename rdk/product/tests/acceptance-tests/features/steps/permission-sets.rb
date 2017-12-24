When(/^the client requests to view all user permission sets$/) do 
  query = RDKQuery.new('permission-sets-list')
  query.add_parameter('testdata', 'true')
  path = query.path
  p path
  @response = HTTPartyRDK.get_as_user(path, "SITE;USER  ", "PW      ")
end

When(/^the client requests to view permission sets for a specific user "(.*?)"$/) do |uid|
  query = RDKQuery.new('permission-sets-getUserPermissionSets')
  query.add_parameter('uid', uid)
  path = query.path
  p path
  @response = HTTPartyRDK.get_as_user(path, "SITE;USER  ", "PW      ")
end

When(/^the client requests to update user permission sets with content "(.*?)"$/) do |content|
  query = RDKQuery.new('permission-sets-edit')
  path = query.path
  p path
  @response = HTTPartyRDK.put_as_user(path, "SITE;USER  ", "PW      ", content, { "Content-Type" => "application/json" })
end

Then(/^the permission sets results contain more than (\d+) records$/) do |count|
  json = JSON.parse(@response.body)
  value = json["data"]   #results  in only one value
  expect(value.length).to be > count.to_i
end

Then(/^the permission sets results contain exactly (\d+) values$/) do |count|
  @json_object = JSON.parse(@response.body)
  json = JSON.parse(@response.body)

  p json
  expect(@json_object['data']).to_not be_nil, "expected response ['data'] to not be nil"
  expect(@json_object['data']['val']).to_not be_nil, "Expected response ['data']['val'] to not be nil"

  permission_sets = @json_object["data"]["val"]
  expect(permission_sets.length).to eq(count.to_i)
end

Then(/^the response contains permission sets$/) do |table|
  @json_object = JSON.parse(@response.body)
  permission_sets = @json_object["data"]["val"]
  table.rows.each do |row|
    expect(permission_sets.include? row[0]).to eq(true)
  end
end

class BuildContent
  def get_hash_key(temp_key)
    return temp_key unless temp_key.end_with? '[]'
    return temp_key.sub('[]', '')
  end

  def key_is_array(temp_key)
    temp_key.end_with? '[]'
  end

  def build_from_cucumber_table(table)
    content_body = {}
    table.rows.each do | path, value |
      keys = path.split('.')
      temp_content = content_body
      keys.each_with_index do | key, index |
        stripped_key = get_hash_key key
        if key_is_array(key)  
          temp_content[stripped_key] = [] unless temp_content.key?(stripped_key)
          temp_content[stripped_key].push(value) if value.length > 0
        else
          temp_content[key] = {} unless temp_content.key? key      
          if index == keys.length - 1
            temp_content[key] = value
          end
        end
        temp_content = temp_content[key]
      end   
    end
    content_body
  end
end

When(/^the client requests to update user permission sets with body$/) do |table|
  content_body = {}
  content_body = BuildContent.new.build_from_cucumber_table table
  p content_body

  query = RDKQuery.new('permission-sets-edit')
  path = query.path
  p path
  @response = HTTPartyRDK.put_as_user(path, "SITE;USER  ", "PW      ", content_body.to_json, { "Content-Type" => "application/json" })

end

Given(/^the client has requested the permission set list$/) do
  query = RDKQuery.new('permission-sets-list')
  path = query.path
  p path
  @response = HTTPartyRDK.get_as_user(path, "SITE;USER  ", "PW      ")
end

DISCHARGE_PERMISSION_DISCONTINUE = 'discontinue-discharge-followup'
DISCHARGE_PERMISSION_EDIT = 'edit-discharge-followup'
DISCHARGE_PERMISSION_READ = 'read-discharge-followup'

Then(/^the following sets contain permissions to discontinue, edit and read discharge follow ups$/) do |table|
  discharge = DISCHARGE_PERMISSION_DISCONTINUE
  edit = DISCHARGE_PERMISSION_EDIT
  read = DISCHARGE_PERMISSION_READ

  response_json = JSON.parse(@response.body)
  response_array = response_json['data']
  table.rows.each do | permission_set |
    found = false
    response_array.each do | permission_hash |
      if permission_hash['val'].eql? permission_set[0]
        set_value = permission_set[0]
        set = permission_hash['permissions']

        expect(set).to include(discharge), "Expected set #{set_value} to include #{discharge}: #{set}"
        expect(set).to include(edit), "Expected set #{set_value} to include #{edit}: #{set}"
        expect(set).to include(read), "Expected set #{set_value} to include #{read}: #{set}"
        found = true
        break
      end
    end
    expect(found).to eq(true), "permission set list did not contain permission #{permission_set[0]}"
  end
end

Then(/^the following sets do not contain permissions to discontinue, edit and read discharge follow ups$/) do |table|
  discharge = DISCHARGE_PERMISSION_DISCONTINUE
  edit = DISCHARGE_PERMISSION_EDIT
  read = DISCHARGE_PERMISSION_READ

  response_json = JSON.parse(@response.body)
  response_array = response_json['data']
  table.rows.each do | permission_set |
    found = false
    response_array.each do | permission_hash |
      if permission_hash['val'].eql? permission_set[0]
        set_value = permission_set[0]
        set = permission_hash['permissions']

        expect(set).to_not include(discharge), "Expected set #{set_value} to not include #{discharge}: #{set}"
        expect(set).to_not include(edit), "Expected set #{set_value} to not include #{edit}: #{set}"
        expect(set).to_not include(read), "Expected set #{set_value} to not include #{read}: #{set}"
        found = true
        break
      end
    end
    expect(found).to eq(true), "permission set list did not contain permission #{permission_set[0]}"
  end
end

Then(/^the following sets contain only read discharge follow ups$/) do |table|
  discharge = DISCHARGE_PERMISSION_DISCONTINUE
  edit = DISCHARGE_PERMISSION_EDIT
  read = DISCHARGE_PERMISSION_READ

  response_json = JSON.parse(@response.body)
  response_array = response_json['data']
  table.rows.each do | permission_set |
    found = false
    response_array.each do | permission_hash |
      if permission_hash['val'].eql? permission_set[0]
        set_value = permission_set[0]
        set = permission_hash['permissions']
        expect(set).to_not include(discharge), "Expected set #{set_value} to not include #{discharge}: #{set}"
        expect(set).to_not include(edit), "Expected set #{set_value} to not include #{edit}: #{set}"
        expect(set).to include(read), "Expected set #{set_value} to include #{read}: #{set}"
        found = true
        break
      end
    end
    expect(found).to eq(true), "permission set list did not contain permission #{permission_set[0]}"
  end
end
