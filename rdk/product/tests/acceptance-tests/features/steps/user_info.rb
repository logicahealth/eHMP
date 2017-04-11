When(/^the client requests to view list Active users with name search criteria "(.*?)","(.*?)"$/) do |lastName, firstName|
  query = RDKQuery.new('user-service-userlist')
  query.add_parameter('user.filter', '{"firstName":"'+firstName +'","lastName":"'+ lastName+ '"}')
  path = query.path
  p path
  @response = HTTPartyRDK.get_as_user(path, "9E7A;PW    ", "PW    !!")
end
When(/^the client requests to view list Active and Inactive users with name search criteria "(.*?)","(.*?)"$/) do |lastName, firstName|
  query = RDKQuery.new('user-service-userlist')
  query.add_parameter('user.filter', '{"firstName":"'+firstName +'","lastName":"'+ lastName+ '"}')
  query.add_parameter('show.inactive', 'true')
  path = query.path
  p path
  @response = HTTPartyRDK.get_as_user(path, "9E7A;PW    ", "PW    !!")
end
When(/^the client requests to view list Active users with name and role search criteria "(.*?)","(.*?)","(.*?)"$/) do |lastName, firstName, role|
  query = RDKQuery.new('user-service-userlist')
  query.add_parameter('user.filter', '{"firstName":"'+firstName +'","lastName":"'+ lastName+ '","role":"'+ role+ '"}')
  query.add_parameter('show.inactive', 'true')
  path = query.path
  p path
  @response = HTTPartyRDK.get_as_user(path, "9E7A;PW    ", "PW    !!")
end
Then(/^the results contains all required fields$/) do
  json = JSON.parse(@response.body)
  ValueArray = json["data"]

  ValueArray.each do |item|
    #test all the required fields exists
    expect(item["uid"]).to_not be_nil
    expect(item["facility"]).to_not be_nil
    expect(item["fname"]).to_not be_nil
    expect(item["lname"]).to_not be_nil
    expect(item["site"]).to_not be_nil
    expect(item["roles"]).to_not be_nil
  end
end
