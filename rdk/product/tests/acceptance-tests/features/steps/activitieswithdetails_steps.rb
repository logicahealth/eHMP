class ActivitiesWithDetailsMethods
  extend ::RSpec::Matchers
  def self.correctly_formatted_activitieswithdetails_response_body(response)
    json_object = JSON.parse(response.body)
    expect(json_object['data']).to_not be_nil
    expect(json_object['data']['items']).to_not be_nil
    json_object
  end

  def self.verify_act_details_sort_asc(response, json_path)
    json = JSON.parse(response.body)
    sort_prerequesite_met? json['data']['items']
    variable_allvalues = []
    json_verify = JsonVerifier.new
    json_verify.save_all_values_of_path(0, json_path.split('.'), json, "", variable_allvalues)

    p variable_allvalues
    upcase_all_values = variable_allvalues.map(&:upcase) 
    expect(upcase_all_values).to eq(upcase_all_values.sort)
  end

  def self.verify_act_details_sort_desc(response, json_path)
    json = JSON.parse(response.body)
    sort_prerequesite_met? json['data']['items']
    variable_allvalues = []
    json_verify = JsonVerifier.new
    json_verify.save_all_values_of_path(0, json_path.split('.'), json, "", variable_allvalues)

    p variable_allvalues
    upcase_all_values = variable_allvalues.map(&:upcase) 
    expect(upcase_all_values).to eq(upcase_all_values.sort.reverse)
  end

  def self.activitieswithdetails_field_contains_text(temp_item, path, text)
    json_verify = JsonVerifier.new

    return false unless json_verify.defined?([path], temp_item)
    variable_allvalues = []
    json_verify = JsonVerifier.new
    json_verify.save_all_values_of_path(0, path.split('.'), temp_item, "", variable_allvalues)
    path_set = Set.new(variable_allvalues)

    return path_set.to_a.include? text   
  end

  def self.response_path_set(response, json_path)
    json = JSON.parse(response.body)
    sort_prerequesite_met? json['data']['items']
    variable_allvalues = []
    json_verify = JsonVerifier.new
    json_verify.save_all_values_of_path(0, json_path.split('.'), json, "", variable_allvalues)
    Set.new(variable_allvalues)
  end
end

When(/^the user requests activitiesWithDetails$/) do |table|
  request = RDKQuery.new('activities-with-details')
  table.rows.each do | parameter, value |
    request.add_parameter(parameter, value)
  end
  path = request.path
  p path
  @response = HTTPartyRDK.get(path)
end

When(/^the user "([^"]*)" requests activitiesWithDetails$/) do |client, table|
  request = RDKQuery.new('activities-with-details')
  table.rows.each do | parameter, value |
    request.add_parameter(parameter, value)
  end
  path = request.path
  p path
  @response = HTTPartyRDK.get_as_user(path, client, TestClients.password_for(client))
end

Then(/^the activitiesWithDetails response only contains active items$/) do
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  expected_active_status = %w{1 4}
  expected_open_modes = %w{OPEN}

  all_status_values = []
  all_mode_values = []
  json_verify = JsonVerifier.new

  status_path = 'data.items.STATUS'
  mode_path = 'data.items.MODE'

  json_verify.save_all_values_of_path(0, status_path.split('.'), json_object, "", all_status_values)
  all_status_set = Set.new all_status_values
  all_status_set = all_status_set.to_a.map { |value| value.upcase }

  json_verify.save_all_values_of_path(0, mode_path.split('.'), json_object, "", all_mode_values)
  all_modes_set = Set.new all_mode_values
  all_modes_set = all_modes_set.to_a.map { |value| value.upcase }

  all_status_set.to_a.each do | temp_status |
    expect(expected_active_status).to include(temp_status), "Status #{temp_status} is not considered 'Active'.  Active statuses are #{expected_active_status}"
  end

  all_modes_set.to_a.each do | temp_mode |
    expect(expected_open_modes).to include(temp_mode), "Mode #{temp_mode} is not considered 'Active'. Active modes are #{expected_open_modes}"
  end
end

Then(/^the activitiesWithDetails response only contains items for pid "([^"]*)"$/) do |pid|
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)

  all_values = []
  json_verify = JsonVerifier.new

  path = 'data.items.PID'
  json_verify.save_all_values_of_path(0, path.split('.'), json_object, "", all_values)
  all_values_set = Set.new all_values
  
  expect(all_values_set.size).to eq(1), "Expected only 1 value in response, got #{all_values_set.to_a}"
  expect(all_values_set.to_a[0]).to eq(pid)
end

Then(/^the activitiesWithDetails response only contains items for mode "([^"]*)"$/) do |mode|
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)

  all_values = []
  json_verify = JsonVerifier.new

  path = 'data.items.MODE'
  json_verify.save_all_values_of_path(0, path.split('.'), json_object, "", all_values)
  all_values_set = Set.new all_values
  
  expect(all_values_set.size).to eq(1), "Expected only 1 value in response, got #{all_values_set.to_a}"
  expect(all_values_set.to_a[0].upcase).to eq(mode.upcase)
  p all_values_set
end

Then(/^each response contains parameter ISACTIVITYHEALTHY of value 1 or 2$/) do 
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  all_values = []
  json_verify = JsonVerifier.new

  path = 'data.items.ISACTIVITYHEALTHY'
  json_verify.save_all_values_of_path(0, path.split('.'), json_object, "", all_values)
  all_values_set = Set.new all_values
  p all_values_set
  expected_values = %q{0 1}

  all_values_set.to_a.each do | value |
    expect(expected_values).to include value
  end
end

Then(/^the activities details results are sorted by Disposition asc$/) do
  ActivitiesWithDetailsMethods.verify_act_details_sort_asc @response, "data.items.ACTIVITYJSON.discharge.disposition"
end

Then(/^the activities details results are sorted by AssignedPCP asc$/) do
  ActivitiesWithDetailsMethods.verify_act_details_sort_asc @response, "data.items.ACTIVITYJSON.discharge.primaryCarePhysicianNameAtDischarge"
end

Then(/^the activities details results are sorted by Primary Care Team asc$/) do
  ActivitiesWithDetailsMethods.verify_act_details_sort_asc @response, "data.items.ACTIVITYJSON.discharge.primaryCareTeamAtDischarge"
end

Then(/^the activities details results are sorted by Attempts asc$/) do
  ActivitiesWithDetailsMethods.verify_act_details_sort_asc @response, "data.items.ACTIVITYJSON.contact.attempts"
end

Then(/^the activities details results pageIndex is (\d+)$/) do |expected_page_index|
  json = JSON.parse(@response.body)
  expect(json['data']).to_not be_nil
  expect(json['data']['pageIndex']).to_not be_nil
  expect(json['data']['pageIndex']).to eq(expected_page_index.to_i)
end

Then(/^the activities details results startIndex is (\d+)$/) do |expected_start_index|
  json = JSON.parse(@response.body)
  expect(json['data']).to_not be_nil
  expect(json['data']['startIndex']).to_not be_nil
  expect(json['data']['startIndex']).to eq(expected_start_index.to_i)
end

Then(/^the activities details results itemsPerPage are less then or equal to (\d+)$/) do |expected_items|
  json = JSON.parse(@response.body)
  expect(json['data']).to_not be_nil
  expect(json['data']['itemsPerPage']).to_not be_nil, "Expected response['data'] to contain key itemsPerPage"
  expect(json['data']['itemsPerPage']).to be <= expected_items.to_i
end

Then(/^the activities details results contain a nextStartIndex field$/) do
  json = JSON.parse(@response.body)
  expect(json['data']).to_not be_nil
  expect(json['data']['nextStartIndex']).to_not be_nil
end

Then(/^the activities details results are sorted by Attempts desc$/) do
  ActivitiesWithDetailsMethods.verify_act_details_sort_desc @response, "data.items.ACTIVITYJSON.contact.attempts"
end

Then(/^the activities details results are sorted by ISACTIVITYHEALTHY asc$/) do
  ActivitiesWithDetailsMethods.verify_act_details_sort_asc @response, "data.items.ISACTIVITYHEALTHY"
end

Then(/^the activities details results are sorted by Discharge Date \(desc\)$/) do
  ActivitiesWithDetailsMethods.verify_act_details_sort_desc @response, "data.items.ACTIVITYJSON.discharge.dateTime"
end

Then(/^the activities details results are sorted by PATIENTNAME \(desc\)$/) do
  ActivitiesWithDetailsMethods.verify_act_details_sort_desc @response, "data.items.ACTIVITYJSON.activity.patientName"
end

Then(/^the activities details results contain at least (\d+) unique facility ids$/) do |arg1|
  path_set = ActivitiesWithDetailsMethods.response_path_set @response, 'data.items.ACTIVITYJSON.discharge.fromFacilityId'
  expect(path_set.size).to be >= arg1.to_i
end

Then(/^the activities details results contain at least (\d+) unique facility descriptions$/) do |arg1|
  path_set = ActivitiesWithDetailsMethods.response_path_set @response, 'data.items.ACTIVITYJSON.discharge.fromFacilityDescription'
  expect(path_set.size).to be >= arg1.to_i
end

Then(/^the activities details results are sorted by Facility description asc$/) do
  ActivitiesWithDetailsMethods.verify_act_details_sort_asc @response, "data.items.ACTIVITYJSON.discharge.fromFacilityDescription"
end

Then(/^the activities details results contain at least (\d+) unique activity healthy fields$/) do |arg1|
  path_set = ActivitiesWithDetailsMethods.response_path_set @response, 'data.items.ACTIVITYJSON.activity.activityHealthy'
  expect(path_set.size).to be >= arg1.to_i
end

Then(/^the activities details results are sorted by activity healthy fields asc$/) do
  ActivitiesWithDetailsMethods.verify_act_details_sort_asc @response, "data.items.ACTIVITYJSON.activity.activityHealthy"
end

Then(/^the activities details results contain at least (\d+) unique dispositions$/) do |arg1|
  path_set = ActivitiesWithDetailsMethods.response_path_set @response, 'data.items.ACTIVITYJSON.discharge.disposition'
  expect(path_set.size).to be >= arg1.to_i
end

Then(/^the activities details results contain at least (\d+) unique pcpNames$/) do |arg1|
  path_set = ActivitiesWithDetailsMethods.response_path_set @response, 'data.items.ACTIVITYJSON.discharge.primaryCarePhysicianNameAtDischarge'
  p path_set
  expect(path_set.size).to be >= arg1.to_i
end

Then(/^the activities details results contain at least (\d+) unique Primary Care Teams$/) do |arg1|
  path_set = ActivitiesWithDetailsMethods.response_path_set @response, 'data.items.ACTIVITYJSON.discharge.primaryCareTeamAtDischarge'
  expect(path_set.size).to be >= arg1.to_i
end

Then(/^the activities details results contain at least (\d+) unique attempts$/) do |arg1|
  path_set = ActivitiesWithDetailsMethods.response_path_set @response, 'data.items.ACTIVITYJSON.contact.attempts'
  expect(path_set.size).to be >= arg1.to_i
end

Then(/^the activities details results contain at least (\d+) unique ISACTIVITYHEALTHY$/) do |arg1|
  path_set = ActivitiesWithDetailsMethods.response_path_set @response, 'data.items.ISACTIVITYHEALTHY'
  expect(path_set.size).to be >= arg1.to_i
end

Then(/^the activities details results contain at least (\d+) unique discharge dates$/) do |arg1|
  path_set = ActivitiesWithDetailsMethods.response_path_set @response, 'data.items.ACTIVITYJSON.discharge.dateTime'
  expect(path_set.size).to be >= arg1.to_i
end

Then(/^the activities details results contain at least (\d+) unique patientnames$/) do |arg1|
  path_set = ActivitiesWithDetailsMethods.response_path_set @response, 'data.items.ACTIVITYJSON.activity.patientName'
  expect(path_set.size).to be >= arg1.to_i
end

Then(/^the activitiesWithDetails response contains text "([^"]*)"$/) do |arg1|
  p "only check txt withIN ACTIVITYJSON"
  
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  items_array = json_object['data']['items']
  p items_array.length
  json_verify = JsonVerifier.new
  fields = %w{ACTIVITYJSON.activity.state
              ACTIVITYJSON.activity.patientName
              ACTIVITYJSON.activity.activityHealthy
              ACTIVITYJSON.contact.attempts
              ACTIVITYJSON.discharge.dateTime
              ACTIVITYJSON.discharge.disposition
              ACTIVITYJSON.discharge.primaryCarePhysicianNameAtDischarge 
              ACTIVITYJSON.discharge.fromFacilityDescription
              ACTIVITYJSON.discharge.fromFacilityId
              ACTIVITYJSON.discharge.fromFacilityDescription}
  items_array.each_with_index do | temp_item, index |
    json_verify.reset_output
    found_in_field = false
    fields.each do | temp_field |
      found_in_field = ActivitiesWithDetailsMethods.activitieswithdetails_field_contains_text temp_item, temp_field, arg1
      break if found_in_field
      #next if ActivitiesWithDetailsMethods.activitieswithdetails_field_contains_text temp_item, 'ACTIVITYJSON.discharge.fromFacilityDescription', arg1
      
    end
    expect(found_in_field).to eq(true), "expected item #{index} to include text #{arg1} from fields #{fields}"
  end
  
end

Then(/^the activitiesWithDetails response only contains items$/) do |table|
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  items_array = json_object['data']['items']
  json_verify = JsonVerifier.new
  items_array.each_with_index do | temp_item, index |
    table.rows.each do | temp_key, value |
      json_verify.reset_output
      expected_field = temp_key
      expect(json_verify.defined?([expected_field], temp_item)).to eq(true), "expected #{expected_field} in item[#{index}]"
      all_values = []
  
      json_verify.save_all_values_of_path(0, temp_key.split('.'), temp_item, "", all_values)

      all_values_set = Set.new all_values
      expect(all_values_set.size).to eq(1), "Expected only 1 value in response, got #{all_values_set.to_a}"
      expect(all_values_set.to_a[0]).to eq(value)
    end
  end
end

Then(/^the activitiesWithDetails response contains at least one of the following items$/) do |table|
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  items_array = json_object['data']['items']
  json_verify = JsonVerifier.new
  items_array.each_with_index do | temp_item, index |
    found_match = false
    table.rows.each do | temp_key, value |
      json_verify.reset_output

      expected_field = temp_key
      expect(json_verify.defined?([expected_field], temp_item)).to eq(true), "expected #{expected_field} in item[#{index}]"
      all_values = []
  
      json_verify.save_all_values_of_path(0, temp_key.split('.'), temp_item, "", all_values)

      all_values_set = Set.new all_values
      found_match = all_values_set.include? value
      break if found_match
    end
    expect(found_match).to eq(true), "Expected to find any of the expected values in item #{index}"
  end
end

Then(/^the activitiesWithDetails response contains ISACTIVITYHEALTHY with values (\d+) or (\d+)$/) do |arg1, arg2|
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  items_array = json_object['data']['items']
  json_verify = JsonVerifier.new

  expected_field = 'data.items.ISACTIVITYHEALTHY'
  all_values = []
  
  json_verify.save_all_values_of_path(0, expected_field.split('.'), json_object, "", all_values)
  expect(all_values.length).to eq(json_object['data']['items'].length), "Expected each item to have a ISACTIVITYHEALTHY field"
  p all_values
  all_values_set = Set.new all_values
  expect(all_values_set.size).to be <= 2 
  expect(all_values_set.to_a).to include arg1
  expect(all_values_set.to_a).to include arg2
end

Then(/^the activities details results itemsPerPage is (\d+)$/) do |arg1|
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  expect(json_object['data']['itemsPerPage']).to_not be_nil
  expect(json_object['data']['itemsPerPage']).to eq(arg1.to_i)
end

Then(/^the activities details results are sorted by Discharge On Date \(Most recent first, Primary\) and Patient Name \(Alphabetical, Secondary\)$/) do
  json = JSON.parse(@response.body)
  sort_prerequesite_met? json['data']['items']

  discharge_date_allvalues = []
  patient_name_allvalues = []

  json_verify = JsonVerifier.new
  json_verify.save_all_values_of_path(0, "data.items.ACTIVITYJSON.discharge.dateTime".split('.'), json, "", discharge_date_allvalues)
  json_verify.save_all_values_of_path(0, "data.items.PATIENTNAME".split('.'), json, "", patient_name_allvalues)

  expect(discharge_date_allvalues.length).to eq(patient_name_allvalues.length)

  sorting_array = []
  discharge_date_allvalues.each_with_index do | summary, index |
    sorting_array.push(DocumentSort.new(summary, patient_name_allvalues[index]))
  end

  index_upper_range = sorting_array.length - 1
  for i in 1..index_upper_range
    first_element = sorting_array[i-1]
    second_element = sorting_array[i]
    begin
      expect(first_element.primary).to be >= second_element.primary
      expect(first_element.secondary).to be <= second_element.secondary if first_element.primary == second_element.primary
    rescue Exception => e
      p "#{first_element.primary}.#{first_element.secondary}  -- #{second_element.primary}.#{second_element.secondary}"
      raise e
    end
  end
end

Then(/^the activities details results are sorted by activity\.state \(desc, Primary\) and discharge\.dateTime \(desc, Secondary\)$/) do
  json = JSON.parse(@response.body)
  sort_prerequesite_met? json['data']['items']

  discharge_date_allvalues = []
  activity_state_allvalues = []

  json_verify = JsonVerifier.new
  json_verify.save_all_values_of_path(0, "data.items.ACTIVITYJSON.activity.state".split('.'), json, "", activity_state_allvalues)
  json_verify.save_all_values_of_path(0, "data.items.ACTIVITYJSON.discharge.dateTime".split('.'), json, "", discharge_date_allvalues)

  expect(discharge_date_allvalues.length).to eq(activity_state_allvalues.length)

  sorting_array = []
  activity_state_allvalues.each_with_index do | summary, index |
    sorting_array.push(DocumentSort.new(summary, discharge_date_allvalues[index]))
  end

  index_upper_range = sorting_array.length - 1
  for i in 1..index_upper_range
    first_element = sorting_array[i-1]
    second_element = sorting_array[i]
    begin
      expect(first_element.primary).to be >= second_element.primary
      expect(first_element.secondary).to be >= second_element.secondary if first_element.primary == second_element.primary
    rescue Exception => e
      p "#{first_element.primary}.#{first_element.secondary}  -- #{second_element.primary}.#{second_element.secondary}"
      raise e
    end
  end
end

Given(/^the user "([^"]*)", "([^"]*)" \("([^"]*)"\) does not have read\-task permission$/) do |firstname, lastname, uid|
  request = RDKQuery.new('permission-sets-edit')
  user_array = []

  user_hash = { 'uid' => uid, 'fname' => firstname.upcase, 'lname' => lastname.upcase  }
  user_array.push(user_hash)#.to_json)

  request.add_parameter('user', user_hash.to_json)
  request.add_parameter('permissionSets', [].to_s)
  request.add_parameter('additionalPermissions', ['add-active-medication'].to_s)

  path = request.path
  @response = HTTPartyRDK.put_as_user(path, "SITE;USER  ", "PW      ")
  expect(@response.code).to eq(200), "unable to set permissions because: #{@response.body}"

  @response = PermissionsActions.get_user_permissions firstname, lastname, true
  expect(@response.code).to eq(200), "#{@response.body}"
  body = JSON.parse(@response.body)
  expect(body['data']).to_not be_nil
  expect(body['data'].length).to eq(1)
  set_array = PermissionsActions.parse_permission_sets body['data'][0]
  additional_array = PermissionsActions.parse_additional_sets body['data'][0]

  p set_array
  p additional_array

  expect(set_array.length).to eq(0)
  expect(additional_array.length).to eq(1)
  expect(additional_array[0].upcase).to_not eq('read-task'.upcase)
end

When(/^that user without read\-task permission "([^"]*)" requests default activitiesWithDetails$/) do |user, table|
  request = RDKQuery.new('activities-with-details')
  table.rows.each do | parameter, value |
    request.add_parameter(parameter, value)
  end
  path = request.path
  @response = HTTPartyRDK.get_as_user(path, user, TestClients.password_for(user))
end
