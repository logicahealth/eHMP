When(/^the client requests a list of video visit appointments for patient "([^"]*)" for the next (\d+) days$/) do |pid, days|
  date_today = Date.today
  date_future = Date.today.next_day(days.to_i)

  request = RDKQuery.new('video-visit-appointments-get')
  request.add_parameter('pid', pid)
  request.add_parameter('date.start', date_today.strftime("%Y%m%d"))
  request.add_parameter('date.end', date_future.strftime("%Y%m%d"))
  path = request.path
  p path
  @response = HTTPartyRDK.get_as_user(path, VideoVisit.user,  TestClients.password_for(VideoVisit.user))
end

Then(/^the video visit response contains only appointents for the next (\d+) days$/) do |days|
  json = JSON.parse(@response.body)
  output_string = ""

  fieldsource = 'data.items.dateTime'
  steps_source = fieldsource.split('.')

  source_allvalues = []

  json_verify = JsonVerifier.new
  json_verify.save_all_values_of_path(0, steps_source, json, output_string, source_allvalues)

  date_today = Date.today
  date_future = Date.today.next_day(days.to_i)

  source_allvalues.each do | temp_datetime_string |
    temp_date = Date.strptime(temp_datetime_string, "%Y-%m-%dT%H:%M:%S.%L")
    expect(temp_date).to be >= date_today
    expect(temp_date).to be <= date_future
  end
end

When(/^the client requests a video visit provider contact for patient "([^"]*)"$/) do |pid|
  request = RDKQuery.new('video-visit-provider-contact-get')
  request.add_parameter('pid', pid)
  path = request.path
  p path
  @response = HTTPartyRDK.get_as_user(path, VideoVisit.user,  TestClients.password_for(VideoVisit.user))
end

When(/^the client requests a video visit facility timezone for patient "([^"]*)"$/) do |pid|
  request = RDKQuery.new('video-visit-facility-timezone-get')
  request.add_parameter('pid', pid)
  path = request.path
  p path
  @response = HTTPartyRDK.get_as_user(path, VideoVisit.user,  TestClients.password_for(VideoVisit.user))
end

When(/^the client requests a video visit instructions for patient "([^"]*)"$/) do |pid|
  request = RDKQuery.new('video-visit-instructions-get')
  request.add_parameter('pid', pid)
  path = request.path
  p path
  @response = HTTPartyRDK.get_as_user(path, VideoVisit.user,  TestClients.password_for(VideoVisit.user))
end

When(/^the client requests a video visit patient demographics for patient "([^"]*)"$/) do |pid|
  request = RDKQuery.new('video-visit-patient-demographics-get')
  request.add_parameter('pid', pid)
  path = request.path
  p path
  @response = HTTPartyRDK.get_as_user(path, VideoVisit.user,  TestClients.password_for(VideoVisit.user))
end

When(/^the client requests a video visit patient emergency contact for patient "([^"]*)"$/) do |pid|
  request = RDKQuery.new('video-visit-patient-emergency-contact-get')
  request.add_parameter('pid', pid)
  path = request.path
  p path
  @response = HTTPartyRDK.get_as_user(path, VideoVisit.user,  TestClients.password_for(VideoVisit.user))
end

Then(/^the video visit response contains$/) do |table|
  @json_object = JSON.parse(@response.body)
  json_verify = JsonVerifier.new
  result_array = @json_object["data"]["items"]
  search_json(result_array, table)
end

class VideoVisit
  def self.user
    'SITE;USER  '
  end

  def self.default_video_patient(parameter_hash)
    patient_array = []
    default_patient = {}

    default_patient['id'] = {}
    default_patient['id']['assigningAuthority'] = 'ICN'
    default_patient['id']['uniqueId'] = "10110V004877"

    default_patient['contactInformation'] = {}
    phone_type = variable_or_default(parameter_hash['patient phone type'], 'mobile')
    default_patient['contactInformation'][phone_type] = variable_or_default(parameter_hash['patient phone'], '2222222222')
    default_patient['contactInformation']['preferredEmail'] = variable_or_default(parameter_hash['patient email'], 'test_defaultpatient@accenturefederal.com')
    default_patient['contactInformation']['timeZone'] = 'EST'

    default_patient['location'] = {}
    default_patient['location']['facility'] = {}
    default_patient['location']['facility']['name'] = 'PANORAMA'
    default_patient['location']['facility']['siteCode'] = '500'
    default_patient['location']['facility']['timeZone'] = 'EST'
    default_patient['location']['type'] = 'NonVA'

    default_patient['name'] = {}
    default_patient['name']['firstName'] = 'Patient'
    default_patient['name']['lastName'] = 'Ten'

    patient_array.push default_patient
    patient_array
  end

  def self.default_video_patient_pid
    'SITE;8'
  end

  def self.default_video_provider(parameter_hash)
    provider_array = []
    default_provider = {}

    default_provider['id'] = {}
    default_provider['id']['assigningAuthority'] = 'ICN'
    default_provider['id']['uniqueId'] = "10000000272"

    default_provider['contactInformation'] = {}
    phone_type = variable_or_default(parameter_hash['provider phone type'], 'mobile')
    default_provider['contactInformation'][phone_type] = variable_or_default(parameter_hash['provider phone'], '1111111111')
    default_provider['contactInformation']['preferredEmail'] = variable_or_default(parameter_hash['provider email'], 'test.provider@accenturefederal.com')
    default_provider['contactInformation']['timeZone'] = 'EST'

    default_provider['location'] = {}
    default_provider['location']['facility'] = {}
    default_provider['location']['facility']['name'] = 'PANORAMA'
    default_provider['location']['facility']['siteCode'] = '500'
    default_provider['location']['facility']['timeZone'] = 'EST'
    default_provider['location']['type'] = 'VA'

    default_provider['name'] = {}
    default_provider['name']['firstName'] = 'VIHAAN'
    default_provider['name']['lastName'] = 'KHAN'

    provider_array.push default_provider
    provider_array
  end

  def self.create_video_visit(parameter_hash)
    json_hash = {}
  
    json_hash['dateTime'] = variable_or_fail(parameter_hash, 'dateTime')
    json_hash['desiredDate'] = variable_or_fail(parameter_hash, 'desiredDate')
    json_hash['bookingNotes'] = variable_or_default(parameter_hash['comment'], '')
  
    json_hash['patients'] = {}
    json_hash['patients']['patient'] = default_video_patient(parameter_hash)
  
    json_hash['providers'] = {}
    json_hash['providers']['provider'] = default_video_provider(parameter_hash)
    json_hash['duration'] = variable_or_default(parameter_hash['duration'], 20).to_i
    json_hash['schedulingRequestType'] = "NEXT_AVAILABLE_APPT"
    json_hash['type'] = 'REGULAR'
    json_hash['appointmentKind'] = "ADHOC"
    json_hash['pid'] = default_video_patient_pid

    unless parameter_hash['instruction'].nil?
      json_hash['instruction'] = variable_or_fail(parameter_hash, 'instruction')
      json_hash['instruction'] = "The VA is excited to offer you this upcoming appointment using video telehealth. &nbsp;The Virtual Medical Room platform is simple to use and will only require an application download for iPad and iPhone products. All other home devices will NOT require any software/application download. Because we want you to have the best possible video experience, we suggest the following:↵Connect to your video appointment from a location that is quiet, private, and well lit.↵Use a device or computer that has a strong internet connection.↵If using a cell phone, use a Wi-Fi connection so your cell data plan is not used.↵To use a Virtual Medical Room, your home devices must have a web cam and microphone available. External cameras and microphones may be used if your personal device does not have a built in camera and/or microphone.↵If you will be using an iPad or iPhone, download the required iOS app in advance: VideoConnect.↵You can connect to your Virtual Medical Room through the VA Video Appointment App using the link in your appointment confirmation email."
      my_boolean = variable_or_fail(parameter_hash, 'instructionsOther')
      json_hash['instructionsOther'] = my_boolean.eql?('true') 
      json_hash['instructionsTitle'] = variable_or_fail(parameter_hash, 'instructionsTitle')
    end

    json_hash 
  end
end

When(/^the client creates a video visit$/) do |table|
  request = RDKQuery.new('video-visit-appointments-post')
  path = request.path

  parameters = {}
  table.rows.each do | parameter, value |
    parameters[parameter] = value
  end
  parameters['comment'] = "#{parameters['comment']} #{Time.now}" unless parameters['comment'].nil?
  current_time_plus = Time.now + (60 * 60) # 60 seconds * 60 min
  parameters['dateTime'] = current_time_plus.strftime("%Y-%m-%dT%H:%M:%S.%LZ")
  parameters['desiredDate'] = current_time_plus.strftime("%Y-%m-%dT%H:%M:%S.%LZ")
  headers = {}
  headers['Content-Type'] = "application/json"
  payload = VideoVisit.create_video_visit(parameters)
  payload_json = payload.to_json
  # p payload_json
  @response = HTTPartyRDK.post_as_user(path, VideoVisit.user, TestClients.password_for(VideoVisit.user), payload_json, headers)

  @video_payload = payload
  p @video_payload['bookingNotes']
end

Then(/^the video visit response contains the newly created video visit$/) do |incoming_table |
  json_object = JSON.parse(@response.body)
  json_verify = JsonVerifier.new

  expect(@video_payload).to_not be_nil

  table = []
  result_array = json_object["data"]['items']

  all_values = []
  source_allvalues = []

  incoming_table.rows.each do | whtht |
    json_verify.reset_output
    source_allvalues = []
    json_verify.save_all_values_of_path(0, whtht[0].split('.'), @video_payload, '', source_allvalues)
    if whtht[0].eql?('dateTime')
      table.push([whtht[0], source_allvalues[0][0..-2]])
    else
      table.push([whtht[0], source_allvalues[0]])
    end
    p source_allvalues[0]
  end

  table.each do |fieldpath, fieldvaluestring|
    json_verify.reset_output
    found = json_verify.build_subarray(fieldpath, fieldvaluestring, result_array)
    result_array = json_verify.subarry  
    expect(result_array.length).to be > 0, "could not find field #{fieldpath} with value #{fieldvaluestring}"
  end
  expect(result_array.length).to eq(1), "Did not find expected video visit, found #{result_array.length}"
end

When(/^the client changes the video visit patient demographics for patient "([^"]*)"$/) do |pid|
  expect(@video_demographics).to_not be_nil
  expect(@video_demographics['phones']).to_not be_nil, @video_demographics
  expect(@video_demographics['phones'][0]).to_not be_nil
  expect(@video_demographics['phones'][0]['number']).to_not be_nil
  @expected_phone = @video_demographics['phones'][0]['number'].eql?('1111111111')? '2222222222' : '1111111111'
  @expected_type = @video_demographics['phones'][0]['type'].eql?('Home')? 'Work' : 'Home'

  @video_demographics['isPatientContactInfoChanged'] = true
  @video_demographics['pid'] = pid
  @video_demographics['phones'][0]['number'] = @expected_phone
  @video_demographics['phones'][0]['type'] = @expected_type

  request = RDKQuery.new('video-visit-patient-demographics-post')
  path = request.path
  p path

  headers = {}
  headers['Content-Type'] = "application/json"

  payload_json = @video_demographics.to_json
  @response = HTTPartyRDK.post_as_user(path, VideoVisit.user, TestClients.password_for(VideoVisit.user), payload_json, headers)
end

Then(/^the video visit patient demographics were updated$/) do
  expect(@expected_phone).to_not be_nil
  expect(@expected_type).to_not be_nil
  p "expecting phone/type to be #{@expected_phone}/#{@expected_type}"

  json_object = JSON.parse(@response.body)
  output_string = ""

  number = 'data.items.phones.number'
  type = 'data.items.phones.type'

  number_allvalues = []
  type_allvalues = []

  json_verify = JsonVerifier.new
  json_verify.save_all_values_of_path(0,  number.split('.'), json_object, output_string, number_allvalues)
  json_verify.save_all_values_of_path(0,  type.split('.'), json_object, output_string, type_allvalues)

  expect(number_allvalues.length).to eq(1)
  expect(type_allvalues.length).to eq(1)
end

Given(/^the client notes the current patient demographics$/) do
  response_body = JSON.parse(@response.body)
  expect(response_body['data']).to_not be_nil
  expect(response_body['data']['items']).to_not be_nil
  expect(response_body['data']['items'].length).to be > 0

  @video_demographics = response_body['data']['items'][0]
end
