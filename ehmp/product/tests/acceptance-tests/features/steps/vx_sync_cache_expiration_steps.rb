Then(/^the sync status contain lastAccessTime$/) do
  vx_sync = VxSync.new
  @response = vx_sync.response
  json_object = JSON.parse(@response.body)
  
  p @last_access_time = json_object["syncStatus"]["completedStamp"]["lastAccessTime"]
  sleep 1
  fail "There is no lastAccessTime on the sync status. The response body: \n #{json_object}" if @last_access_time.nil? || @last_access_time.to_s.empty?
end

Then(/^the lastAccessTime get update$/) do
  p old_last_access_time = @last_access_time
  @last_access_time = ""
  json_object = JSON.parse(@response.body)
  
  p @last_access_time = json_object["syncStatus"]["completedStamp"]["lastAccessTime"]
  err_msg = "The lastAccessTime should get update. lastAccessTime: \n before read the patient record: #{old_last_access_time} \n after read the patient record: #{@last_access_time}"
  fail err_msg if @last_access_time <= old_last_access_time
end
