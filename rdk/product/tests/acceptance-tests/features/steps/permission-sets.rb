When(/^the client requests to view all user permission sets$/) do 
  query = RDKQuery.new('permission-sets-list')
  query.add_parameter('testdata', 'true')
  path = query.path
  p path
  @response = HTTPartyRDK.get_as_user(path, "9E7A;vk1234", "vk1234!!")
end

When(/^the client requests to view permission sets for a specific user "(.*?)"$/) do |uid|
  query = RDKQuery.new('permission-sets-getUserPermissionSets')
  query.add_parameter('uid', uid)
  path = query.path
  p path
  @response = HTTPartyRDK.get_as_user(path, "9E7A;vk1234", "vk1234!!")
end

When(/^the client requests to update user permission sets with content "(.*?)"$/) do |content|
  query = RDKQuery.new('permission-sets-edit')
  path = query.path
  p path
  @response = HTTPartyRDK.put_as_user(path, "9E7A;vk1234", "vk1234!!", content, { "Content-Type" => "application/json" })
end

Then(/^the permission sets results contain more than (\d+) records$/) do |count|
  json = JSON.parse(@response.body)
  value = json["data"]   #results  in only one value
  expect(value.length).to be > count.to_i
end

Then(/^the permission sets results contain exactly (\d+) values$/) do |count|
  @json_object = JSON.parse(@response.body)
  json = JSON.parse(@response.body)
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
