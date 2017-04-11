path = File.expand_path '..', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
path = File.expand_path '../../../../shared-test-ruby', __FILE__
$LOAD_PATH.unshift path unless $LOAD_PATH.include?(path)
require 'VerifyJsonRuntimeValue.rb'

When(/^the data return for "(.*?)" is "(.*?)"$/) do |arg1, arg2|
  @json_object = JSON.parse(@response.body)
  result_array = @json_object["syncStatus"]["completedStamp"]["sourceMetaStamp"].keys
end

Then(/^the client recieved data just for site\(s\) "(.*?)"$/) do |site_list|
  site_list = site_list.upcase.split";"
  
  @json_object = JSON.parse(@response.body)
  completed_result_array = @json_object["syncStatus"]["completedStamp"]["sourceMetaStamp"].keys
  
  result = (completed_result_array - site_list) + (site_list - completed_result_array)
  fail "The site name does not match for site(s): \n #{result}" unless result.empty?
end

Then(/^the job status array and inProgress array are empty$/) do
  @json_object = JSON.parse(@response.body)
  job_status = @json_object["jobStatus"]
  inprogress_result_array = @json_object["syncStatus"]["inProgress"]
  
  fail "The Job Status array is not empty: \n #{job_status}" unless job_status.empty?
  fail "The inProgress array is not empty: \n #{job_status}" unless inprogress_result_array.nil?
end

When(/^a patient with icn "([^"]*)" has no demographics we should receive an error message$/) do |icn|
  base_url = DefaultLogin.vx_sync_url
  p path = "#{base_url}/sync/doLoad?icn=#{icn}"

  vx_sync = VxSync.new
  p @response = vx_sync.sync_request(path)
  @response = nil
  p status_path = "#{base_url}/sync/status?icn=#{icn}"
#  p status_path = "http://10.3.3.6:8080/sync/status?icn=4325679V4325679"
  demographic_error_return = false
  max_index_run = 60
  index = 0
  sleep_time = 2
  demographic_error = "no error returned"
  while demographic_error_return == false && index < max_index_run
    sleep sleep_time
#   p response = HTTPartyWithBasicAuth.get_with_authorization(status_path)

    p json_object = vx_sync.find_sync_status_body(status_path)
    p @response = vx_sync.response
    begin
      demographic_error = @response["jobStatus"][0]["error"]["message"]
      demographic_error_return = true
#     rescue
#     demographic_error = "no error returned"
    end
    index = index + sleep_time
  end
  expect(demographic_error).to eq "Patient has no demographic record and none was provided."
 # fail "The sync status failed. Response: \n #{@response}" if @response == nil #|| @response.code != 200
end

#Then(/^insert demographics for patient with icn "([^"]*)"$/) do |icn|
Then(/^insert demographics for patient ICNONLY, PATIENT \(with icn (\d+)V(\d+)\)$/) do |notused1, notused2|
  base_url = DefaultLogin.vx_sync_url
  p path = "#{base_url}/sync/demographicSync"
  p param = String('{"icn":"4325679V4325679","demographics":{"givenNames":"PATIENT","familyName":"ICNONLY","genderCode":"M","ssn":"*****1235","birthDate":"19671010","address":[{"city":"Norfolk","line1":"ICN Street","state":"VA","use":"H","zip":"20152"}],"telecom":[{"use":"H","value":"301-222-3334"}],"id":"4325679V4325679^NI^200M^USVHA","facility":"200M","dataSource":"USVHA","pid":"4325679V4325679","idType":"NI","idClass":"ICN","fullName":"ICNONLY,PATIENT","displayName":"ICNONLY,PATIENT","age":47,"ssn4":"1235","genderName":"Male","ageYears":"Unk","dob":"19671010"}}')
#  param = @param.to_json
#  p path = @path
#  p param = @param
  p param
  begin
    #p "VXSync writeBack Response" + "^*"* 20
    p @response = HTTPartyWithBasicAuth.post_write_back(path, param)
    #p "^*"* 20
    success_result = true
  rescue Exception => e
    puts "An error has occured in demographic insert."
    puts e
    response = e
    success_result = false
  end
 # json_object = JSON.parse(@response.body)
  p @response.code
  expect(@response.code).to eq 202
end
