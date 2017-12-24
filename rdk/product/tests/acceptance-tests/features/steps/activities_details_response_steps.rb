def json_is_hash(temp)
  temp.class.name.eql? 'Hash'
end

def json_is_filled_array(temp)
  return false unless temp.class.name.eql? 'Array'
  return false unless temp.length > 0
  return true
end

Then(/^the activitiesWithDetails response items contain a "([^"]*)" object$/) do |obj_name, table|
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  json_verify = JsonVerifier.new
  json_object['data']['items'].each_with_index do | temp_item, index |
    json_verify.reset_output
    expect(json_verify.defined?(["ACTIVITYJSON.#{obj_name}"], temp_item)).to eq(true), "Expected response to contain a #{obj_name} object, item #{index} did not #{json_object['data']['items'][index]}"
    temp_discharge = temp_item['ACTIVITYJSON'][obj_name]
    # p "#{temp_discharge.class.name} #{json_is_hash(temp_discharge)} #{json_is_filled_array(temp_discharge)}"

    if json_is_hash(temp_discharge) || json_is_filled_array(temp_discharge)
      table.rows.each do | expected_field |
        json_verify.reset_output
        expected_field = expected_field[0]
        expect(json_verify.defined?([expected_field], temp_discharge)).to eq(true), "expected #{expected_field} in item[#{index}]"
      end
    end
  end
end

Then(/^the response items do not contain an ACTIVITYJSON object$/) do
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  json_verify = JsonVerifier.new
  json_object['data']['items'].each_with_index do | temp_item, index |
    json_verify.reset_output
    expect(json_verify.defined?(['ACTIVITYJSON'], temp_item)).to eq(false), "Expected response to NOT contain ACTIVITYJSON object"    
  end
end

Then(/^the response items do contain an ACTIVITYJSON object$/) do
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  json_verify = JsonVerifier.new
  json_object['data']['items'].each_with_index do | temp_item, index |
    json_verify.reset_output
    expect(json_verify.defined?(['ACTIVITYJSON'], temp_item)).to eq(true), "Expected response to contain ACTIVITYJSON object, item #{index} did not"    
  end
end

Then(/^the activitiesWithDetails response contains only items with a processDefinitionId of "([^"]*)"$/) do |arg1|
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  json_verify = JsonVerifier.new
  json_object['data']['items'].each_with_index do | temp_item, index |
    json_verify.reset_output
    path = 'ACTIVITYJSON.activity.processDefinitionId'
    expect(json_verify.defined?([path], temp_item)).to eq(true), "item[#{index}] did not contain #{path}"    
  end
  json_verify.reset_output
  all_values = []
  path = 'data.items.ACTIVITYJSON.activity.processDefinitionId'
  json_verify.save_all_values_of_path(0, path.split('.'), json_object, "", all_values)

  all_values_set = Set.new all_values
  expect(all_values_set.size).to eq(1), "Expected only 1 value in response, got #{all_values_set.to_a}"
  expect(all_values_set.to_a[0]).to eq(arg1)
end

Given(/^the activities details results contain at least (\d+) results$/) do |arg1|
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  expect(json_object['data']['items'].length).to be >= arg1.to_i
  p json_object['data']['items'].length
end

Given(/^the user notes the (\d+)nd result$/) do |arg1|
  result_index = arg1.to_i - 1
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  @expected_activity_details = json_object['data']['items'][result_index].clone
  p "result_index: #{result_index}"
  p "#{json_object['data']['items'][0]} #{json_object['data']['items'][1]}"
end

Then(/^the first activities details result is as expected$/) do
  expect(@expected_activity_details).to_not be_nil, "Expected variable @expected_activity_details to have been set by a previous step"
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  expect(json_object['data']['items'].length).to be > 0
  expect(json_object['data']['items'][0]).to eq(@expected_activity_details)
end

Given(/^the user notes the total activitiesWithDetails results$/) do
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  @expected_activity_details_limit = json_object['data']['items'].length / 2
  p @expected_activity_details_limit
end

When(/^the user requests activitiesWithDetails with a limit$/) do |table|
  expect(@expected_activity_details_limit).to_not be_nil, "Expected variable @expected_activity_details_limit to have been set by a previous step"
  request = RDKQuery.new('activities-with-details')
  table.rows.each do | parameter, value |
    request.add_parameter(parameter, value)
  end
  request.add_parameter('limit', "#{@expected_activity_details_limit}")
  path = request.path
  p path
  @response = HTTPartyRDK.get(path)
end

Then(/^the activities details result is limited as expected$/) do
  expect(@expected_activity_details_limit).to_not be_nil, "Expected variable @expected_activity_details_limit to have been set by a previous step"
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  expect(json_object['data']['items'].length).to eq(@expected_activity_details_limit)
end

Then(/^the activities details result contains pagination variables$/) do |table|
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  table.rows.each do | temp_key |
    key = temp_key[0]
    expect(json_object['data'][key]).to_not be_nil, "Expected response to contain a data.#{key} field"
  end
end

Then(/^the activitiesWithDetails response items contain fields$/) do |table|
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)
  json_verify = JsonVerifier.new
  json_object['data']['items'].each_with_index do | temp_item, index |
    table.rows.each do | expected_field |
      json_verify.reset_output
      expect(json_verify.defined?(expected_field, temp_item)).to eq(true)
    end   
  end
end

Then(/^the activitiesWithDetails response contains items for mode open and closed$/) do
  json_object = ActivitiesWithDetailsMethods.correctly_formatted_activitieswithdetails_response_body(@response)

  all_values = []
  json_verify = JsonVerifier.new

  path = 'data.items.MODE'
  json_verify.save_all_values_of_path(0, path.split('.'), json_object, "", all_values)
  all_values_set = Set.new all_values
  
  
  expect(all_values_set.to_a.map(&:upcase)).to include "open".upcase
  expect(all_values_set.to_a.map(&:upcase)).to include "closed".upcase
end

class LoopActivitiesWithDetails
  extend ::RSpec::Matchers
  
  def self.parse_for_next_start_index(response)
    expect(response['data']).to_not be_nil
    expect(response['data']['nextStartIndex']).to_not be_nil
    response['data']['nextStartIndex']
  end

  def self.request_activities_with_start(request, table, start_index)
    request = RDKQuery.new('activities-with-details')
    table.rows.each do | parameter, value |
      request.add_parameter(parameter, value)
    end
    request.add_parameter('start', "#{start_index}")
    path = request.path
    p path
    @response = HTTPartyRDK.get(path)
    expect(@response.code).to eq(200)
    @response
  end

  def self.parse_for_num_items(response)
    expect(response['data']).to_not be_nil
    expect(response['data']['items']).to_not be_nil
    return response['data']['items'].length
  end

  def self.check_for_unique_field(field_path, table)
    request = RDKQuery.new('activities-with-details')
    start_index = 0
    found_unique = false
    check_for = Time.now + (60 * 5)
    response = nil
    while Time.now < check_for
      p "Checking for unique at start index #{start_index}"
      response = request_activities_with_start request, table, start_index
      response_json = JSON.parse(response.body)
      break if parse_for_num_items(response_json) == 0

      path_set = ActivitiesWithDetailsMethods.response_path_set response, field_path
      found_unique = path_set.size >= 2
      break if found_unique
      start_index = parse_for_next_start_index(response_json)
    end
    expect(found_unique).to eq(true), "Precondition not met: expected at least 2 unique dispositions"
    return response
  end
end

When(/^the user requests activitiesWithDetails with unique facility descriptions$/) do |table|
  @response = LoopActivitiesWithDetails.check_for_unique_field 'data.items.ACTIVITYJSON.discharge.fromFacilityDescription', table
end

When(/^the user requests activitiesWithDetails with unique dispositions$/) do |table|
  @response = LoopActivitiesWithDetails.check_for_unique_field 'data.items.ACTIVITYJSON.discharge.disposition', table
end

When(/^the user requests activitiesWithDetails with unique pcpNames$/) do |table|
  @response = LoopActivitiesWithDetails.check_for_unique_field 'data.items.ACTIVITYJSON.discharge.primaryCarePhysicianNameAtDischarge', table
end

When(/^the user requests activitiesWithDetails with unique Primary Care Teams$/) do |table|
  @response = LoopActivitiesWithDetails.check_for_unique_field 'data.items.ACTIVITYJSON.discharge.primaryCareTeamAtDischarge', table
end

When(/^the user requests activitiesWithDetails with unique attempts$/) do |table|
  @response = LoopActivitiesWithDetails.check_for_unique_field 'data.items.ACTIVITYJSON.contact.attempts', table
end

When(/^the user requests activitiesWithDetails with unique activity healthy fields$/) do |table|
  @response = LoopActivitiesWithDetails.check_for_unique_field 'data.items.ACTIVITYJSON.activity.activityHealthy', table
end

When(/^the user requests activitiesWithDetails with unique discharge dates$/) do |table|
  @response = LoopActivitiesWithDetails.check_for_unique_field 'data.items.ACTIVITYJSON.discharge.dateTime', table
end

When(/^the user requests activitiesWithDetails with unique patientnames$/) do |table|
  @response = LoopActivitiesWithDetails.check_for_unique_field 'data.items.ACTIVITYJSON.activity.patientName', table
end

