
class Announcements
  extend ::RSpec::Matchers
  def self.to_boolean(str)
    return true if str.downcase == "true"
    return false
  end

  def self.build_commmunication_preferences_payload(table_hash)
    comm_pref = {}
    comm_pref['category'] = {}
    comm_pref['category']['code'] = table_hash['category.code'] unless table_hash['category.code'].nil?
    comm_pref['category']['system'] = table_hash['category.system'] unless table_hash['category.system'].nil?
    comm_pref['enabled'] = Announcements.to_boolean(table_hash['enabled']) unless table_hash['enabled'].nil?
    comm_pref['userId'] = table_hash['userId'] unless table_hash['userId'].nil?
    comm_pref
  end

  def self.verify_single_type(path, expected_value, response)
    response_body = JSON.parse(response)
    all_values = []

    json_verify = JsonVerifier.new
    json_verify.save_all_values_of_path(0, path.split('.'), response_body, "", all_values)
    all_values_set = Set.new all_values
    expected_value.each do | value |
      expect(all_values_set).to include(value), "Expected only '#{value}' in response, but got #{all_values_set.to_a}"
    end
    expect(all_values_set.size).to eq(expected_value.length), "Expected only 1 value in response, got #{all_values_set.to_a}"
  end

  def self.verify_descending_order(path, response)
    response_body = JSON.parse(response)
    all_values = []

    json_verify = JsonVerifier.new
    json_verify.save_all_values_of_path(0, path.split('.'), response_body, "", all_values)
    expect(all_values.length).to be > 1, "Need at least 2 values to verify order, received #{all_values.length}"
    expect(Set.new(all_values).size).to be > 1, "Need at least 2 unique values to verify order"
    
    clone_values = all_values.clone.sort.reverse
    expect(clone_values).to eq(all_values)
  end

  def self.verify_terms_returned(response)
    response_body = JSON.parse(response.body)
    expect(response_body['data']).to_not be_nil
    expect(response_body['data']['items']).to_not be_nil
    expect(response_body['data']['items']['communication']).to_not be_nil
    expect(response_body['data']['items']['communication'].length).to be > 0
  end

  def self.index_of_attachment(response)
    response_body = JSON.parse(response.body)
    communication_array = response_body['data']['items']['communication']
    image_index = -1
    communication_array.each_with_index do | message_block, index |
      expect(message_block['payload']).to_not be_nil 
      expect(message_block['payload'][0]).to_not be_nil 
      expect(message_block['payload'][0]['content']).to_not be_nil
      expect(message_block['payload'][0]['content'][0]).to_not be_nil  
      image_index = index unless message_block['payload'][0]['content'][0]['contentAttachment'].nil?
      break if image_index > -1
    end
    expect(image_index).to be > -1
    image_index
  end

  def self.communication_identifier(response_body, index)
    expect(response_body['data']['items']['communication'][index]).to_not be_nil
    expect(response_body['data']['items']['communication'][index]['identifier']).to_not be_nil
    expect(response_body['data']['items']['communication'][index]['identifier'][0]['value']).to_not be_nil
    return response_body['data']['items']['communication'][index]['identifier'][0]['value']
  end

  def self.image_identifier(response_body, index)
    expect(response_body['data']['items']['communication'][index]).to_not be_nil
    communication_element = response_body['data']['items']['communication'][index]
    expect(communication_element['payload']).to_not be_nil
    expect(communication_element['payload'][0]).to_not be_nil
    expect(communication_element['payload'][0]['content']).to_not be_nil
    expect(communication_element['payload'][0]['content'][0]).to_not be_nil
    expect(communication_element['payload'][0]['content'][0]['contentAttachment']).to_not be_nil
    expect(communication_element['payload'][0]['content'][0]['contentAttachment']['contentAttachmentIdentifier']).to_not be_nil
    return communication_element['payload'][0]['content'][0]['contentAttachment']['contentAttachmentIdentifier']
  end

  def self.attachment_link(response_body, index)
    expect(response_body['data']['items']['communication'][index]).to_not be_nil
    communication_element = response_body['data']['items']['communication'][index]
    expect(communication_element['payload']).to_not be_nil
    expect(communication_element['payload'][0]).to_not be_nil
    expect(communication_element['payload'][0]['content']).to_not be_nil
    expect(communication_element['payload'][0]['content'][0]).to_not be_nil
    expect(communication_element['payload'][0]['content'][0]['contentAttachment']).to_not be_nil
    expect(communication_element['payload'][0]['content'][0]['contentAttachment']['link']).to_not be_nil
    return communication_element['payload'][0]['content'][0]['contentAttachment']['link']
  end
end

When(/^client requests communications for$/) do |table|
  request = RDKQuery.new('ehmp-announcements')
  table.rows.each do | parameter, value |
    request.add_parameter(parameter, value)
  end

  path = request.path
  p path
  @response = HTTPartyRDK.get(path)
end

When(/^the client updates user preferences$/) do |table|
  post_body = Announcements.build_commmunication_preferences_payload(table.rows_hash)
  request = RDKQuery.new('ehmp-announcements-preferences')
  path = "#{request.path}/"
  @response = HTTPartyRDK.post(path, post_body.to_json, TaskHelper.headers)
end

When(/^client requests preferences$/) do |table|
  post_body = Announcements.build_commmunication_preferences_payload(table.rows_hash)
  request = RDKQuery.new('ehmp-announcements-preferences')
  path = "#{request.path}/"
  @response = HTTPartyRDK.post(path, post_body.to_json, TaskHelper.headers)
end

Then(/^the response message is 'The required parameter "([^"]*)" is missing\.'$/) do |arg1|
  message = "The required parameter \"#{arg1}\" is missing."
  p message
  response_body = JSON.parse(@response.body)
  expect(response_body['message']).to eq(message)
end

Then(/^the response only contains messages with a completed status$/) do
  path = 'data.items.communication.status.code'
  expected_value = 'completed'
  Announcements.verify_single_type(path, [expected_value], @response.body)

  path = 'data.items.communication.status.system'
  expected_value = 'http://hl7.org/fhir/ValueSet/communication-status'
  Announcements.verify_single_type(path, [expected_value], @response.body)
end

Then(/^the response only contains messages with a delete status$/) do
  path = 'data.items.communication.status.code'
  expected_value = 'deleted'
  Announcements.verify_single_type(path, [expected_value], @response.body)

  path = 'data.items.communication.status.system'
  expected_value = 'http://ehmp.DNS   /messageStatus'
  Announcements.verify_single_type(path, [expected_value], @response.body)
end

Then(/^the response only contains messages of type terms "([^"]*)"$/) do |terms|
  path = 'data.items.communication.category.code'
  expected_value = terms
  Announcements.verify_single_type(path, [expected_value], @response.body)
end

Then(/^the response only contains messages of requested version "([^"]*)"$/) do |version|
  path = 'data.items.communication.recipient.ehmpAppVersion'
  expected_value = version
  Announcements.verify_single_type('data.items.communication.recipient.ehmpAppVersion', [expected_value], @response.body)
end

Then(/^the term announcements are returned in descending order$/) do
  Announcements.verify_descending_order('data.items.communication.sent', @response.body)
end

Then(/^the system announcements are returned in descending order$/) do
  Announcements.verify_descending_order('data.items.communication.sent', @response.body)
end

Then(/^the terms are not returned$/) do
  response_body = JSON.parse(@response.body)
  p response_body
  expect(response_body['data']).to_not be_nil
  expect(response_body['data']['items']).to_not be_nil
  expect(response_body['data']['items']['communication']).to_not be_nil
  expect(response_body['data']['items']['communication'].length).to eq(0)
end

Then(/^the terms are returned$/) do
  Announcements.verify_terms_returned @response
end

When(/^client requests attachment for invalid identifier$/) do
  request = RDKQuery.new('ehmp-announcements-attachment')
  path = request.path
  path.sub!(':identifier', 'invalid')
  p path
  @response = HTTPartyRDK.get(path)
end

Given(/^the response contains at least (\d+) term announcement with an attachment$/) do |arg1|
  Announcements.verify_terms_returned @response
  begin
    Announcements.index_of_attachment @response
  rescue Exception => e
    p "#{e}"
    raise "Precondition not met: the response did not contain a message with an attachment"
  end
end

When(/^the client requests the attachment for the first returned term using substitution$/) do
  Announcements.verify_terms_returned @response
  image_index = Announcements.index_of_attachment @response
  response_body = JSON.parse(@response.body)
  message_id = Announcements.communication_identifier response_body, image_index
  image_id = Announcements.image_identifier response_body, image_index

  request = RDKQuery.new('ehmp-announcements-attachment')
  path = request.path
  path.sub!(':identifier', message_id)
  path.sub!(':idAttachment', image_id)
  p path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests the attachment for the first returned term using the link$/) do
  Announcements.verify_terms_returned @response
  image_index = Announcements.index_of_attachment @response
  response_body = JSON.parse(@response.body)
  image_link = Announcements.attachment_link response_body, image_index

  request = RDKQuery.new('ehmp-announcements')
  path = request.path
  path = path.concat(image_link)
  p path
  @response = HTTPartyRDK.get(path)
end

Then(/^the attachment response contains populated$/) do |table|
  response_body = JSON.parse(@response.body)
  expect(response_body['data']).to_not be_nil
  expect(response_body['data']['contentType']).to_not be_nil, "Expected response body to contain key ['data']['contentType']"
  expect(response_body['data']['contentType'].length).to be > 0, "Expected ['data']['contentType'] to be populated"

  expect(response_body['data']['src']).to_not be_nil, "Expected response body to contain key ['data']['src']"
  expect(response_body['data']['src'].length).to be > 0, "Expected ['data']['src'] to be populated"
end
