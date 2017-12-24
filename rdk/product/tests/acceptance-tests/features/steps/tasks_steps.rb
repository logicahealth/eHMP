class TaskHelper
  def self.formated_today
    today = Date.today.strftime("%Y%m%d0000")
    today
  end

  def self.formated_future
    future = Date.today.next_month(6).strftime("%Y%m%d0000")
    future
  end

  def self.headers
    headers = {}
    headers['Content-Type'] = "application/json"
    headers
  end
end

When(/^the client requests tasks instances for "([^"]*)" and "([^"]*)"$/) do |context, subcontext|
  request = RDKQuery.new('tasks-tasks')
  today = TaskHelper.formated_today
  enddate = TaskHelper.formated_future
  payload_json = JSON.parse(%Q[{"context":"#{context}","subContext":"#{subcontext}","status":"Created,Ready,Reserved,InProgress","getNotifications":true,"startDate":"#{today}","endDate":"#{enddate}"}]).to_json

  path = request.path

  @response = HTTPartyRDK.post(path, payload_json, TaskHelper.headers)
end

When(/^the "([^"]*)" client requests tasks instances for "([^"]*)" and "([^"]*)"$/) do |user, context, subcontext|
  request = RDKQuery.new('tasks-tasks')
  today = TaskHelper.formated_today
  enddate = TaskHelper.formated_future
  payload_json = JSON.parse(%Q[{"context":"#{context}","subContext":"#{subcontext}","status":"Created,Ready,Reserved,InProgress","getNotifications":true,"startDate":"#{today}","endDate":"#{enddate}"}]).to_json

  path = request.path

  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

def request_task_instances(user, context, subcontext, patientid)
  request = RDKQuery.new('tasks-tasks')

  today = TaskHelper.formated_today
  enddate = TaskHelper.formated_future
  payload_json = JSON.parse(%Q[{"context":"#{context}","pid":"#{patientid}","subContext":"#{subcontext}","status":"Created,Ready,Reserved,InProgress","getNotifications":true,"startDate":"#{today}","endDate":"#{enddate}"}]).to_json

  path = request.path

  @response = HTTPartyRDK.post_as_user(path, user, TestClients.password_for(user), payload_json, TaskHelper.headers)
end

When(/^the client requests tasks instances for "([^"]*)" and "([^"]*)" for patient "([^"]*)"$/) do |context, subcontext, patientid|
  request_task_instances("SITE;USER        ", context, subcontext, patientid)
end

When(/^the "([^"]*)" client requests tasks instances for "([^"]*)" and "([^"]*)" for patient "([^"]*)"$/) do |user, context, subcontext, patientid|
  request_task_instances(user, context, subcontext, patientid)
end

Then(/^the response contains tasks$/) do
  json_object = JSON.parse(@response.body)
  p json_object['data']['items'].length
  expect(json_object['data']['items'].length).to be > 0
end

def request_all_tasks
  context = 'user'
  subcontext = 'teamroles'
  patientid = 'SITE;100728'
  request = RDKQuery.new('tasks-tasks')

  today = TaskHelper.formated_today
  enddate = TaskHelper.formated_future
  payload_json = JSON.parse(%Q[{"context":"#{context}","pid":"#{patientid}","subContext":"#{subcontext}","status":"Created,Ready,Reserved,InProgress","getNotifications":true,"startDate":"#{today}","endDate":"#{enddate}"}]).to_json

  path = request.path
  p path
  @response = HTTPartyRDK.post(path, payload_json, TaskHelper.headers)
end

Given(/^there is at least (\d+) task$/) do |arg1|
  request_all_tasks
  expect(@response.code).to eq(200)
  json_object = JSON.parse(@response.body)
  if json_object['data']['items'].length < 1
    p 'no tasks!'
    step 'the client has the current deploymentid'
    pid = 'SITE;100728'
    request = RDKQuery.new('activities-start')
    path = request.path
    payload_json = start_activity_payload pid
    @response = HTTPartyRDK.post(path, payload_json, TaskHelper.headers)
    expect(@response.code).to eq(200)

    request_all_tasks
    expect(@response.code).to eq(200)
    json_object = JSON.parse(@response.body)
  end
  p "number of tasks #{json_object['data']['items'].length}"
  expect(json_object['data']['items'].length).to be >= arg1.to_i

  @last_task_id = json_object['data']['items'].sort { |l, r| l['TASKID'] <=> r['TASKID'] }.last['TASKID']
end

When(/^the client requests a specific task$/) do
  request = RDKQuery.new('tasks-gettask')
  request.add_parameter('taskid', @last_task_id.to_s)
  path = request.path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests a task by id$/) do
  request = RDKQuery.new('tasks-byid')
  request.add_parameter('taskid', @last_task_id.to_s)
  path = request.path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests open consults for pid "([^"]*)"$/) do | patientid|
  request = RDKQuery.new('tasks-openconsults')
  request.add_parameter('pid', patientid)
  path = request.path

  @response = HTTPartyRDK.get(path)
end

When(/^the client requests the current task with the process instance id$/) do
  request = RDKQuery.new('tasks-current')
  payload_json = JSON.parse(%Q[{"processInstanceId":#{@processinstanceid}}]).to_json

  path = request.path

  @response = HTTPartyRDK.post(path, payload_json, TaskHelper.headers)
end

When(/^the client updates a task$/) do
  request = RDKQuery.new('tasks-update')

  path = request.path
  payload_json = JSON.parse(%Q[{"deploymentId":"#{@deployment_id}","processDefId":"Order.Request","parameter":{"out_activity":{"deploymentId":"#{@deployment_id}","processDefinitionId":"Order.Request","type":"Order","domain":"Request","processInstanceId":"6347","instanceName":"TestAddRequest 2016-08-10 11:11:03","patientUid":null,"clinicalObjectUid":null,"sourceFacilityId":"500","destinationFacilityId":null,"state":"accepted","initiator":"10000000270","timeStamp":"","urgency":9,"assignedTo":"SITE;10000000270","activityHealthy":null,"activityHealthDescription":null,"objectType":"activity"},"out_response":{"objectType":"request","taskInstanceId":"6347","action":"Mark as Complete","assignTo":"","submittedByUid":"urn:va:user:SITE:10000000270","submittedByName":"USER,PANORAMA","submittedTimeStamp":"2016-08-10T19:50:56.033Z","route":{},"visit":{"location":"urn:va:location:SITE:158","serviceCategory":"I","dateTime":"20090105082020"},"earliestDate":"20160810040000","latestDate":"20160910035959"},"out_formAction":"start","out_action":"Mark as Complete"},"icn":"SITE;100728","pid":"SITE;100728","state":"start","taskid":"#{@last_task_id}"}]).to_json

  @response = HTTPartyRDK.post(path, payload_json, TaskHelper.headers)
end

Then(/^print response$/) do
  json_object = JSON.parse(@response.body)
  # p @response.body
  p json_object
#  p json_object['data']['items'].length
end

Then(/^the response contains single task data$/) do
  json_object = JSON.parse(@response.body)
  begin
    length = json_object['data']['items'].length
    returned_id = json_object['data']['items'][0]['PROCESSINSTANCEID']
  rescue => e
    p "response was not in expected format #{json_object}"
    raise e
  end
  
  expect(length).to eq(1)
  expect(returned_id).to eq(@processinstanceid.to_i)
end
