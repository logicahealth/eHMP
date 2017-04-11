def default_visit
  visit = {}
  visit['location'] = "urn:va:location:9E7A:137"
  visit['serviceCategory'] = 'I'
  visit['dateTime'] = "20160812134500"
  visit
end

def build_order_draft(parameter_hash)
  current_date = Date.today.strftime("%m/%d/%Y")
  timing = Time.now.strftime "%Y%m%d%H%M%S"

  @order_comment = variable_or_fail(parameter_hash, 'uniqueOrderComment')
  payload = {}

  payload['subDomain'] = 'laboratory'
  payload['uid'] = variable_or_default(parameter_hash['uid'], nil)
  payload['patientUid'] = variable_or_fail(parameter_hash, 'patientUid')
  payload['authorUid'] = variable_or_fail(parameter_hash, 'authorUid')
  payload['domain'] = 'ehmp-order'
  payload['referenceId'] = ''

  payload['visit'] = default_visit

  data = {}
  data['availableLabTests'] = variable_or_fail(parameter_hash, 'availableLabTests')
  data['labTestText'] = variable_or_fail(parameter_hash, 'labTestText')
  data['collectionDate'] = current_date
  data['collectionType'] = variable_or_fail(parameter_hash, 'collectionType')
  data['collectionSample'] = variable_or_fail(parameter_hash, 'collectionSample')
  data['specimen'] = variable_or_fail(parameter_hash, 'specimen')
  data['urgency'] = variable_or_default(parameter_hash['urgency'], '9')
  data['urgencyText'] = variable_or_default(parameter_hash['urgencyText'], 'ROUTINE')

  data['notificationDate'] = ''
  data['pastDueDate'] = ''
  data['collectionTime'] = ''
  data['otherCollectionSample'] = ''

  data['immediateCollectionDate'] = ''
  data['immediateCollectionTime'] = ''
  data['collectionDateTimePicklist'] = ''
  data['howOften'] = ''
  data['howLong'] = ''
  data['otherSpecimen'] = ''

  data['forTest'] = ''
  data['doseDate'] = ''
  data['doseTime'] = ''
  data['drawDate'] = ''
  data['drawTime'] = ''
  data['orderComment'] = @order_comment
  data['anticoagulant'] = ''
  data['sampleDrawnAt'] = ''
  data['urineVolume'] = ''
  data['additionalComments'] = ''
  data['annotation'] = ''
  data['problemRelationship'] = ''
  data['activity'] = ''
  data['isActivityEnabled'] = ''
  payload['data'] = data
  payload['displayName'] = variable_or_fail(parameter_hash, 'displayName')
  payload['ehmpState'] = variable_or_fail(parameter_hash, 'ehmpState')

  payload
end

Given(/^the user "([^"]*)" has started an orders action for patient "([^"]*)" with parameters$/) do |user, pid, table|

  domain_path = String.new(RDClass.resourcedirectory_writeback.get_url('orders-lab-save-draft'))
  domain_path.sub!(':pid', pid)

  parameter_hash = {}
  table.rows.each do | parameter, value |
    parameter_hash[parameter] = value
  end
  parameter_hash['ehmpState'] = 'draft'
  timing = Time.now.strftime "%Y%m%d%H%M%S %L"
  parameter_hash['uniqueOrderComment'] = "Test lab draft #{timing}"
  path = domain_path

  payload = build_order_draft parameter_hash
  payload_json = payload.to_json
  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)

end

def print_values(response_body, fieldsource)
  json = JSON.parse(response_body)
  output_string = ""

  fieldsource = fieldsource
  steps_source = fieldsource.split('.')

  source_allvalues = []

  json_verify = JsonVerifier.new
  json_verify.save_all_values_of_path(0, steps_source, json, output_string, source_allvalues)
  source_allvalues.to_set
end

Then(/^the order draft list contains the created draft$/) do |extra_parameters|
  expect(@order_comment).to_not be_nil, "expected variable @order_comment to have been set with a unique value"
  @json_object = JSON.parse(@response.body)
  json_verify = JsonVerifier.new

  result_array = [@json_object['data']]
  p "resultarray #{result_array}"
  table = []

  table.push(['data.orderComment', @order_comment])
  extra_parameters.rows.each do | parameter, value |
    table.push([parameter, value])
  end

  table.each do |fieldpath, fieldvaluestring|
    p "trying #{fieldpath}"
    json_verify.reset_output

    found = json_verify.build_subarray(fieldpath, fieldvaluestring, result_array)
    result_array = json_verify.subarry
    expect(result_array.length).to be >= 1, "Cannot find expected value for #{fieldpath}"    
  end
  p "new resultarray #{result_array}"
  expect(result_array.length).to eq(1), "Expected a single extry that matches table elements #{table}"
end

When(/^the user "([^"]*)" reads the draft for patient "([^"]*)"$/) do |user, pid|
  domain_path = String.new(RDClass.resourcedirectory_writeback.get_url('orders-read-draft'))
  domain_path.sub!(':pid', pid)
  domain_path.sub!(':resourceId', @draft_resource_id)

  path = domain_path
  @response = HTTPartyRDK.get_as_user(path, user, TestClients.password_for(user))
end

Given(/^the response contains a uid location$/) do
  @json_object = JSON.parse(@response.body)

  base_url = "#{@json_object['data']['request']['uri']['href']}/"
  full_location = @json_object['data']['headers']['location']
  @draft_resource_id = full_location.sub(base_url, '')
  p "draft: #{@draft_resource_id}"
end

Then(/^the order draft list contains the created lab order draft$/) do |extra_parameters|
  expect(@order_comment).to_not be_nil, "expected variable @order_comment to have been set with a unique value"
  @json_object = JSON.parse(@response.body)
  json_verify = JsonVerifier.new

  result_array = @json_object['data']['items']
  p "resultarray #{result_array}"
  table = []

  table.push(['data.orderComment', @order_comment])
  extra_parameters.rows.each do | parameter, value |
    table.push([parameter, value])
  end

  table.each do |fieldpath, fieldvaluestring|
    p "trying #{fieldpath}"
    json_verify.reset_output

    found = json_verify.build_subarray(fieldpath, fieldvaluestring, result_array)
    result_array = json_verify.subarry
    expect(result_array.length).to be >= 1, "Cannot find expected value for #{fieldpath}"    
  end
  p "new resultarray #{result_array}"
  expect(result_array.length).to eq(1), "Expected a single extry that matches table elements #{table}"
end

When(/^the user "([^"]*)" deletes the lab order draft for patient "([^"]*)"$/) do |user, pid, table|
  domain_path = String.new(RDClass.resourcedirectory_writeback.get_url('orders-lab-save-draft'))
  domain_path.sub!(':pid', pid)

  parameter_hash = {}
  table.rows.each do | parameter, value |
    parameter_hash[parameter] = value
  end
  parameter_hash['ehmpState'] = 'deleted'
  parameter_hash['uniqueOrderComment'] = @order_comment
  parameter_hash['uid'] = @draft_resource_id

  path = domain_path

  payload = build_order_draft parameter_hash
  payload_json = payload.to_json
  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

Then(/^the order draft list for user "([^"]*)" and patient "([^"]*)" does not contain the created draft$/) do |user, pid, table|
  expect(@order_comment).to_not be_nil, "expected variable @order_comment to have been set with a unique value"
  expect(@draft_resource_id).to_not be_nil, "expected variable @draft_resource_id to have been set with a numeric value"

  payload = {}
  table.rows.each do | parameter, value |
    payload[parameter] = value
  end
  payload['domain'] = "ehmp-order"
  payload['ehmpState'] = "draft"
  request_drafts(user, pid, payload)
  expect(@response.code).to eq(200), "Received #{@response.code}, #{@response.body}"

  source_allvalues = all_values_in_set(@response.body, 'data.items.data.orderComment')
  # p source_allvalues
  expect(source_allvalues).to_not include(@order_comment)

  source_allvalues = all_values_in_set(@response.body, 'data.items.uid')
  # p source_allvalues
  expect(source_allvalues).to_not include(@draft_resource_id)
end

