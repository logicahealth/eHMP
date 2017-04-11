Given(/^the client requests all\-orders for the patient "([^"]*)"$/) do |pid|
  resource_query = RDKQuery.new('all-orders')
  resource_query.add_parameter("pid", pid)
  filter = 'between(entered,"19500101","21160916235959")'
  resource_query.add_parameter("filter", filter)
  path = resource_query.path

  @response = HTTPartyRDK.get(path)
end

Given(/^the client notes the first order localId for kind "([^"]*)"$/) do |kind|
  @json_object = JSON.parse(@response.body)
  json_verify = JsonVerifier.new
  result_array = @json_object["data"]["items"]

  table = []
  table.push(['kind', kind])
  #search_json(result_array, table)

  table.each do |fieldpath, fieldvaluestring|
    json_verify.reset_output
    
    found = json_verify.build_subarray(fieldpath, fieldvaluestring, result_array)
    result_array = json_verify.subarry
  end # if found == false
  expect(result_array.length).to be > 0, "Expected patient to have at least 1 order type of #{kind}"
  @localid = result_array[0]['localId']
  expect(@localid).to_not be_nil
end

Given(/^the client notes the first order localId$/) do
  json = JSON.parse(@response.body)
  @localid = json['data']['items'][0]['localId']
  expect(@localid).to_not be_nil
end

When(/^the client requests orders detail lab with saved localId for patient "([^"]*)"$/) do |pid|
  domain_path = String.new(RDClass.resourcedirectory_writeback.get_url('orders-lab-detail'))
  domain_path.sub!(':pid', pid)
  domain_path.sub!(':resourceId', "#{@localid};1")
  site_dfn = pid.split(';')
  p site_dfn
  domain_path.concat("?dfn=#{site_dfn[1]}")
  domain_path.concat("&site=#{site_dfn[0]}")
  p domain_path

  @response = HTTPartyRDK.get(domain_path)
end
