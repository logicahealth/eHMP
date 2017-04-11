When(/^the client requests to view all ehmp permissions$/) do 
  query = RDKQuery.new('permissions-list')
  path = query.path
  p path
  @response = HTTPartyWithBasicAuth.get_with_authorization_for_user(path, "9E7A;PW    ", "PW    !!")
end

Then(/^the permissions results contain more than (\d+) records$/) do |count|
  json = JSON.parse(@response.body)
  value = json["data"]   #results  in only one value
  expect(value.length).to be > count.to_i
end
