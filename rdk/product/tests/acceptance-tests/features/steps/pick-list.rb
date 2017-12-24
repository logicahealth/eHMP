class PickListCalls
  def self.picklist(list_title, table)
    query = RDKQueryPicklist.new(list_title)
    table.rows.each do | param_name, param_value |
      query.add_parameter(param_name, param_value)
    end
    HTTPartyRDK.get(query.path)
  end

  def self.wait_until_call_returns_success(callback, title, table, num_seconds_retry = 20)
    picklist_loaded_or_failed = false
    start_time = Time.now
    p start_time
    @response = nil
    until picklist_loaded_or_failed
      response = callback.call(title, table) 
      if response.code == 200
        picklist_loaded_or_failed = true
      elsif response.code != 202
        picklist_loaded_or_failed = true
      elsif Time.now > start_time + num_seconds_retry #sec
        picklist_loaded_or_failed = true
      else
        p Time.now
        sleep 1
      end
    end
    response
  end
end

When(/^the user requests roles for team$/) do |table|
  @response = PickListCalls.picklist 'write-pick-list-roles-for-team', table
end

Given(/^the user has requested roles for team$/) do |table|
  @response = PickListCalls.wait_until_call_returns_success(PickListCalls.method(:picklist), 'write-pick-list-roles-for-team', table)
  expect(@response).to_not be(nil), "Did not receive a valid response"
  expect(@response.code).to eq(200)
end

When(/^the user requests teams for facility$/) do |table|
  @response = PickListCalls.picklist 'write-pick-list-teams-for-facility', table
end

Given(/^the user has requested teams for facility$/) do |table|
  @response = PickListCalls.wait_until_call_returns_success(PickListCalls.method(:picklist), 'write-pick-list-teams-for-facility', table)
  expect(@response).to_not be(nil), "Did not receive a valid response"
  expect(@response.code).to eq(200)
end

When(/^the user requests teams for facility patient related$/) do |table|
  @response = PickListCalls.picklist 'write-pick-list-teams-for-facility-patient-related', table
end

Given(/^the user has requested teams for facility patient related$/) do |table|
  @response = PickListCalls.wait_until_call_returns_success(PickListCalls.method(:picklist), 'write-pick-list-teams-for-facility-patient-related', table)
  expect(@response).to_not be(nil), "Did not receive a valid response"
  expect(@response.code).to eq(200)
end

When(/^the user requests teams for patient$/) do |table|
  @response = PickListCalls.picklist 'write-pick-list-teams-for-patient', table
end

When(/^the user requests teams for user$/) do |table|
  @response = PickListCalls.picklist('write-pick-list-teams-for-user', table)
end

When(/^the user requests teams for user patient related$/) do |table|
  @response = PickListCalls.picklist 'write-pick-list-teams-for-user-patient-related', table
end

Given(/^the user has requested teams for user patient related$/) do |table|
  @response = PickListCalls.wait_until_call_returns_success(PickListCalls.method(:picklist), 'write-pick-list-teams-for-user-patient-related', table)
  expect(@response).to_not be(nil), "Did not receive a valid response"
  expect(@response.code).to eq(200)
end

When(/^the user requests people for facility$/) do |table|
  @response = PickListCalls.picklist 'write-pick-list-people-for-facility', table
end

Given(/^the user has requested people for facility$/) do |table|
  @response = PickListCalls.wait_until_call_returns_success(PickListCalls.method(:picklist), 'write-pick-list-people-for-facility', table)
  expect(@response).to_not be(nil), "Did not receive a valid response"
  expect(@response.code).to eq(200)
end

Then(/^picklist response contains$/) do |table|
  result_array = JSON.parse(@response.body)["data"]
  table.rows.each do |key, value|
    contains = json_array_contains(result_array, key, value)
    expect(contains).to eq(true), "Results did not contain: #{key} = #{value}"
  end
end

Then(/^picklist response contains teamIDs$/) do |table|
  result_array = JSON.parse(@response.body)["data"]
  table.rows.each do |key, value|
    contains = json_array_contains(result_array, key, value.to_i)
    expect(contains).to eq(true), "Results did not contain: #{key} = #{value}"
  end
end

Then(/^the picklist response contains (\d+) items$/) do |arg1|
  result_array = JSON.parse(@response.body)["data"]
  expect(result_array.length).to eq(arg1.to_i)
end

Then(/^the picklist reponse contains at least (\d+) roleID and name$/) do |arg1|
  result_array = JSON.parse(@response.body)
  expect(result_array['data']).to_not be_nil
  expect(result_array['data'].length).to be >= arg1.to_i
  unless result_array['data'].length < 1
    item = result_array['data'][0]
    expect(item['roleID']).to_not be_nil, "Expected roleID to not be nil"
    expect(item['name']).to_not be_nil, "Expected name to not be nil"
  end
end

Then(/^the picklist teams response contains$/) do |table|
  result_array = JSON.parse(@response.body)
  expect(result_array['data']).to_not be_nil
  expect(result_array['data'].length).to be > 0
  unless result_array['data'].length < 1
    item = result_array['data'][0]
    table.rows.each do | key |
      expect(item[key[0]]).to_not be_nil, "Expected #{key[0]} to not be nil"
    end
  end
end

Given(/^the user has requested teams for user$/) do |table|

  @response = PickListCalls.wait_until_call_returns_success(PickListCalls.method(:picklist), 'write-pick-list-teams-for-user', table)
  expect(@response).to_not be(nil), "Did not receive a valid response"
  expect(@response.code).to eq(200)
  @user_teams = JSON.parse(@response.body)['data']
  expect(@user_teams).to_not be_nil
end

Given(/^the user has requested teams for patient$/) do |table|
  @response = PickListCalls.wait_until_call_returns_success(PickListCalls.method(:picklist), 'write-pick-list-teams-for-patient', table)
  expect(@response).to_not be(nil), "Did not receive a valid response"
  expect(@response.code).to eq(200), "#{@response.code}: #{@response.body}"
  @patient_teams = JSON.parse(@response.body)['data']
  expect(@patient_teams).to_not be_nil
end

Then(/^the picklist response contains the teams common to user teams and patient teams$/) do
  expect(@user_teams).to_not be_nil, "Expected variable user_teams to be set by previous step"
  expect(@patient_teams).to_not be_nil, "Expected variable patient_teams to be set by previous step"
  @user_patient_teams = JSON.parse(@response.body)['data']
  user_patient_ids = @user_patient_teams.map { |element| element['teamID'] }
  user_ids = @user_teams.map { |element| element['teamID'] }
  patient_ids = @patient_teams.map { |element| element['teamID'] }
  expected_combined = user_ids & patient_ids
  expect(user_patient_ids.sort).to eq(expected_combined.sort)
end
