def default_visit
  visit = {}
  visit['location'] = "urn:va:location:SITE:137"
  visit['serviceCategory'] = 'I'
  visit['dateTime'] = "20160812134500"
  visit
end

# Payload for starting a new lab order
def build_order_start(parameter_hash)
  current_date = Date.today.strftime("%m/%d/%Y")

  @order_comment = variable_or_fail(parameter_hash, 'uniqueOrderComment')
  payload = {}

  payload['pid'] = variable_or_fail(parameter_hash, 'pid')
  payload['provider'] = variable_or_fail(parameter_hash, 'provider')
  payload['availableLabTests'] = variable_or_fail(parameter_hash, 'availableLabTests')
  payload['location'] = default_visit['location']
  payload['collectionDate'] = current_date
  payload['collectionDateTime'] = 'TODAY'
  payload['collectionTypeDefault'] = variable_or_fail(parameter_hash, 'collectionType')
  payload['urgencyDefaultCache'] = variable_or_default(parameter_hash['urgency'], '9')
  payload['labTestText'] = variable_or_fail(parameter_hash, 'labTestText')
  payload['orderDialog'] = 'LR OTHER LAB TESTS'
  payload['quickOrderDialog'] = '2'
  payload['displayGroup'] = '6'
  payload['kind'] = 'Laboratory'
  payload['clinicalObject'] = build_clinical_object(parameter_hash)

  # Build inputList parameter- an array of hashes
  input_list = []
  input_list << { 'inputKey' => '4', 'inputValue' => variable_or_fail(parameter_hash, 'inputValue4') } 
  input_list << { 'inputKey' => '126', 'inputValue' => variable_or_fail(parameter_hash, 'inputValue126') } 
  input_list << { 'inputKey' => '127', 'inputValue' => variable_or_fail(parameter_hash, 'inputValue127') } 
  input_list << { 'inputKey' => '180', 'inputValue' => variable_or_fail(parameter_hash, 'inputValue180') } 
  input_list << { 'inputKey' => '28', 'inputValue' => variable_or_fail(parameter_hash, 'inputValue28') } 
  input_list << { 'inputKey' => '6', 'inputValue' => variable_or_fail(parameter_hash, 'inputValue6') } 
  payload['inputList'] = input_list

  payload
end

def build_clinical_object(parameter_hash)
  current_date = Date.today.strftime("%m/%d/%Y")

  clinical_object = {}

  clinical_object['subDomain'] = 'laboratory'
  clinical_object['uid'] = variable_or_default(parameter_hash['uid'], nil)
  clinical_object['patientUid'] = variable_or_fail(parameter_hash, 'patientUid')
  clinical_object['authorUid'] = variable_or_fail(parameter_hash, 'authorUid')
  clinical_object['domain'] = 'ehmp-order'
  clinical_object['referenceId'] = ''
  clinical_object['visit'] = default_visit

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
  clinical_object['data'] = data
  clinical_object['displayName'] = variable_or_fail(parameter_hash, 'displayName')
  clinical_object['ehmpState'] = variable_or_fail(parameter_hash, 'ehmpState')
  clinical_object
end

# Payload for drafting a lab order
def build_order_draft(parameter_hash)
  current_date = Date.today.strftime("%m/%d/%Y")

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

# Start a new lab order activity
Given(/^the user "([^"]*)" has started a lab order activity for patient "([^"]*)" and provider "([^"]*)" with parameters$/) do |user, pid, provider, table|
  @pid = pid
  @provider = provider
  domain_path = String.new(RDClass.resourcedirectory_writeback.get_url('orders-lab-create'))
  domain_path.sub!(':pid', pid)

  parameter_hash = {}
  table.rows.each do | parameter, value |
    parameter_hash[parameter] = value
  end
  parameter_hash['provider'] = provider
  parameter_hash['ehmpState'] = 'draft'
  timing = Time.now.strftime "%Y%m%d%H%M%S %L"
  parameter_hash['uniqueOrderComment'] = "Test lab draft #{timing}"
  path = domain_path

  payload = build_order_start parameter_hash
  payload_json = payload.to_json

  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

# Draft lab order 
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

And(/^the response contains a lab order id$/) do
  json_object = JSON.parse(@response.body)
  p "Lab creation response : #{json_object}"
  expect(json_object.to_s).to_not include('Duplicate order'), "Duplicate Lab Order"
  data_hash = JSON.parse(json_object['data']['data'])
  @laborderid = data_hash['localId']
  p "Lab Order id #{@laborderid}"
  expect(@laborderid).to_not be_nil
end

When(/^the user deletes the lab order$/) do
  # Get value for hash
  expect(@pid).to_not be_nil
  expect(@provider).to_not be_nil 
  domain_path = String.new(RDClass.resourcedirectory_writeback.get_url('orders-lab-discontinue-details'))
  domain_path.sub!(':pid', @pid)
  payload = {}
  payload['provider'] = @provider
  payload['statusName'] = 'UNRELEASED'
  payload['summary'] = ''
  payload['kind'] = 'Laboratory'
  payload['action'] = 'cancel'
  payload['id'] = '1'
  payload['reasonListItems'] = []
  payload['reason'] = ''
  payload['orderIds'] = [@laborderid.to_s + ';1']
  payload['pid'] = @pid
  payload['location'] = default_visit['location'].split(':').last
  payload['siteCode'] = default_visit['location'].split(':')[3]

  path = domain_path
  payload_json = payload.to_json
  @response = HTTPartyRDK.post(path, payload_json, TaskHelper.headers)
  expect(@response.code).to eq(200)
  json_object = JSON.parse(@response.body)
  expect(json_object['data']).to_not be_nil
  expect(json_object['data'].length).to be > 0
  hash_id = json_object['data'][0]['hash']
  expect(hash_id).to_not be_nil
  
  # Delete the lab order
  domain_path = String.new(RDClass.resourcedirectory_writeback.get_url('orders-lab-discontinue'))
  domain_path.sub!(':pid', @pid)

  payload = {}
  payload['provider'] = @provider
  payload['kind'] = 'Laboratory'
  payload['location'] =  default_visit['location'].split(':').last

  order_list = []
  order_hash = {}
  order_hash['orderId'] = @laborderid.to_s + ';1'
  order_hash['hash'] = hash_id
  order_list.push(order_hash)
  payload['orderList'] = order_list

  payload['reason'] = ''
  path = domain_path
  payload_json = payload.to_json

  p "Deleting lab order #{@laborderid}"
  @response = HTTPartyRDK.delete(path, payload_json, TaskHelper.headers)
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

Then(/^the task associated with the lab order has$/) do |extra_parameters|
  @json_object = JSON.parse(@response.body)
  json_verify = JsonVerifier.new

  result_array = @json_object["data"]['items']
  
  extra_parameters.rows.each do |fieldpath, fieldvaluestring|
    json_verify.reset_output
    found = json_verify.build_subarray(fieldpath, fieldvaluestring, result_array)
    result_array = json_verify.subarry  
    p "Checking for #{fieldpath}: #{result_array.length}"
  end
  expect(result_array.length).to be > 0, "Did not find the expected combo of lab order in response: #{@json_object["data"]['items']}"
end

Then(/^the user notes the number of tasks returned$/) do 
  expect(@response.code).to eq(200)
  json_object = JSON.parse(@response.body)
  @number_of_original_tasks = json_object['data']['items'].length
  p "Number of original tasks #{@number_of_original_tasks}"
end

When(/^the "([^"]*)" client waits for updated tasks instances for "([^"]*)" and "([^"]*)" for patient "([^"]*)"$/) do |user, context, subcontext, patientid|
  seconds_to_wait = 30
  i = 0
  task_found = false
  while i < seconds_to_wait
    request_task_instances(user, context, subcontext, patientid)
    json_object = JSON.parse(@response.body)
    #p "Task response : #{json_object}"
    number_of_new_tasks = json_object['data']['items'].length
    if number_of_new_tasks > @number_of_original_tasks
      i = seconds_to_wait
      p "Number of new tasks #{number_of_new_tasks}"
      task_found = true
    else
      sleep 1
      p "request_task_instances::Number of tasks is #{number_of_new_tasks}, wait 1 second"
    end
    i += 1
  end
  expect(task_found).to eq(true), "Lab order activity task was not created."
end

After('@start_lab_order_activity') do | scenario |
  if scenario.failed?
    p 'clean up after failure'
    if @laborderid.is_a? Numeric
      step "the user deletes the lab order"
      @laborderid = nil 
      step 'a successful response is returned'
    end
  end
end
