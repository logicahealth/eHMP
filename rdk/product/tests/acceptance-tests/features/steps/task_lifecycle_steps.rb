When(/^the client creates a process with content latest deployment ID and content "(.*?)"$/) do |content|
  path = RDKStartProcess.new.path
  p path
  updated_content = "{\"deploymentId\":\"#{@deployment_id}\"," + content
  @response = HTTPartyRDK.post(path, updated_content, { "Content-Type" => "application/json" })
  @new_process_id = @response["data"]["processInstanceId"]
  puts "New Process Id = #{@new_process_id}"
end

When(/^the client requests to see the list of tasks for a patient "(.*?)"$/) do |content|
  path = RDKProcessList.new.path
  p path
  @response = HTTPartyRDK.post(path, content, { "Content-Type" => "application/json" })
end

And(/^the results contain the new process ID$/) do
  processid_found = false
  #@resonse below is from the POST call that returns list of all processes under a patient ID
  @response["data"]["items"].each do |items|
    if items["PROCESSINSTANCEID"].to_i == @new_process_id.to_i
      processid_found = true
      @new_task_id = items["TASKID"]
      puts "New task ID = #{@new_task_id}, New process ID = #{items['PROCESSINSTANCEID']}"
      break
    end
  end
  expect(processid_found).to eq(true)
end

And(/^the result does not contain the new task ID$/) do
  taskid_found = false
  #@resonse below is from the POST call that returns list of all processes/tasks under a patient ID
  @response["data"]["items"].each do |items|
    if items["TASKID"].to_i == @new_task_id.to_i
      taskid_found = true
      puts "Error - task #{@new_task_id} is still not complete"
      break
    end
  end
  expect(taskid_found).to eq(false)
end

When(/^the client changes state of the newly created task to "(.*?)"$/) do |state|
  query = RDKQuery.new('tasks-update')
  path = query.path
  content = "{\"deploymentId\":\"#{@deployment_id}\",\"parameter\":{\"out_training_completed\":true,\
          \"out_training_notes\":\"Done\"},\"state\":\"#{state}\",\"taskid\":\"#{@new_task_id}\"}"
  @response = HTTPartyRDK.post(path, content, { "Content-Type" => "application/json" })
end

When(/^the client cancels the new process$/) do
  query = RDKQuery.new('tasks-abortprocess')
  path = query.path
  content = "{\"deploymentId\":\"#{@deployment_id}\",\"processInstanceId\":#{@new_process_id}}"
  @response = HTTPartyRDK.post(path, content, { "Content-Type" => "application/json" })
end

Then(/^the result is an empty array$/) do
  @json_object = JSON.parse(@response.body)
  str = @json_object.to_s
  expect(str.include? "\"items\"=>[]").to eq(true)
end

When(/^the client gets list of all available process definitions$/) do
  query = RDKQuery.new('tasks-getprocessdefinitions')
  path = query.path
  @response = HTTPartyRDK.get(path)
end

Then(/^save the deployment ID for "(.*?)"$/) do |project_name|
  deploymentid_found = false
  #@resonse below is from the POST call that returns list of all available process definitions
  @response["data"]["items"].each do |items|
    if items["deploymentId"].to_s.include? project_name
      deploymentid_found = true
      @deployment_id = items["deploymentId"]
      break
    end
  end
  puts "@deployment_id = #{@deployment_id}"
  expect(deploymentid_found).to eq(true)
end
