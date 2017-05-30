class DocumentFilterHelper
  def self.defined_filter_fields
    # ['dateDisplay', 'referenceDateTime', 'typeName', 'kind', 'authorDisplayName', 'providerDisplayName', 'signerDisplayName', 'activity.responsible', 'facilityName']
    %w{ amended dateTime referenceDateTime localTitle typeName summary name kind clinicians[].displayName authorDisplayName signerDisplayName providerDisplayName  activity[].responsible facilityName imageLocation orderName reason}
  end

  def self.default_document_filter_parameters
    parameters = {}
    parameters['limit'] = 40
    parameters['start'] = 0
    parameters['order'] = 'dateTime ASC'
    parameters['template'] = 'notext'
    parameters['range'] = "19350407..20170620235959"
    parameters['filterFields'] = defined_filter_fields
    parameters
  end

  def self.request_documents(pid)
    table = default_document_filter_parameters

    response = request_sorted_documents(pid, table, "19350101", convert_cucumber_date('TODAY'))
    fail "Request failed: #{response.code} - #{response.body}" unless @response.code.eql?(200)
    response
  end

  def self.request_first_document_field(pid, field)
    response_contains_items_array(@response.body)    
    json_body = JSON.parse(@response.body)

    all_values = []

    json_verify = JsonVerifier.new
    json_verify.save_all_values_of_path(0, "data.items.#{field}".split('.'), json_body, "", all_values)
    fail "No values found for data.items.#{field}" unless all_values.length > 0
    # p all_values.length
    # p all_values

    all_values.each do | possible_value |
      next if possible_value.nil?
      return possible_value unless possible_value.strip.length == 0
    end
    fail "Unable to find a populated #{field} to test with"
  end

  def self.all_values_of(field, response_body)
    response_contains_items_array response_body
    
    json_body = JSON.parse(response_body)
    fail "response.body ['data']['items'] did not contain elements" unless json_body['data']['items'].length > 0

    all_values = []

    json_verify = JsonVerifier.new
    json_verify.save_all_values_of_path(0, "data.items.#{field}".split('.'), json_body, "", all_values)
    s1 = Set.new all_values
    s1
  end

  def self.total_count(response_body)
    fail "do not have a saved response body" if response_body.nil?
    json_body = JSON.parse(response_body)
    fail "response.body ['data'] was nil" if json_body['data'].nil?
    fail "response.body ['data']['totalItems'] was nil" if json_body['data']['totalItems'].nil?
    json_body['data']['totalItems']
  end

  def self.response_contains_items_array(response_body)
    fail "do not have a saved response body" if response_body.nil?
    json_body = JSON.parse(response_body)
    fail "response.body ['data'] was nil" if json_body['data'].nil?
    fail "response.body ['data']['items'] was nil" if json_body['data']['items'].nil?
    fail "response.body ['data']['items'] did not contain elements" unless json_body['data']['items'].length > 0
    true
  end
end

Given(/^the client has noted the first document "([^"]*)" for pid "([^"]*)"$/) do |field, pid|
  @response = DocumentFilterHelper.request_documents(pid)
  full_field_text = DocumentFilterHelper.request_first_document_field(pid, field)
  field_string_array = full_field_text.scan(/[a-zA-Z0-9]+/)
  # p field_string_array
  # p field_string_array.max_by(&:length)
  @document_filter_term = field_string_array.max_by(&:length)
  # @document_filter_term = 'PROGRAMMER,TWENTYEIGHT'
  p "Will be testing #{field} with #{@document_filter_term}"
  @total_documents_before_filtering = DocumentFilterHelper.total_count(@response.body)
end

Given(/^the client requests sorted DOCUMENTS for the patient "([^"]*)" filtered by a "([^"]*)"$/) do |pid, field|
  expect(@document_filter_term).to_not be_nil, "Expected variable document_filter_term to be set by previous step"
  
  parameter_hash = DocumentFilterHelper.default_document_filter_parameters
  parameter_hash['filterList'] = [@document_filter_term]

  request_sorted_documents(pid, parameter_hash, "19350101", convert_cucumber_date('TODAY'))
  expect(@response.code).to eq(200), "Request failed: #{@response.code} - #{@response.body}"
end

Given(/^the client requests sorted DOCUMENTS for the patient "([^"]*)" filtered by a upcase "([^"]*)"$/) do |pid, field|
  expect(@document_filter_term).to_not be_nil, "Expected variable document_filter_term to be set by previous step"
  
  parameter_hash = DocumentFilterHelper.default_document_filter_parameters
  parameter_hash['filterList'] = [@document_filter_term.upcase]

  request_sorted_documents(pid, parameter_hash, "19350101", convert_cucumber_date('TODAY'))
  expect(@response.code).to eq(200), "Request failed: #{@response.code} - #{@response.body}"
end

Then(/^the client requests sorted DOCUMENTS for the patient "([^"]*)" filtered by a downcase "([^"]*)"$/) do |pid, field|
  expect(@document_filter_term).to_not be_nil, "Expected variable document_filter_term to be set by previous step"
  
  parameter_hash = DocumentFilterHelper.default_document_filter_parameters
  parameter_hash['filterList'] = [@document_filter_term.downcase]

  request_sorted_documents(pid, parameter_hash, "19350101", convert_cucumber_date('TODAY'))
  expect(@response.code).to eq(200), "Request failed: #{@response.code} - #{@response.body}"
end

Then(/^document results are filtered on field "([^"]*)"$/) do |field|
  expect(DocumentFilterHelper.total_count(@response.body)).to be < @total_documents_before_filtering

  s1 = DocumentFilterHelper.all_values_of(field, @response.body)
  unless s1.include? @document_filter_term
    p "the response contains an item that does not have the filter text in its primary field, check all other fields"
    all_fields = DocumentFilterHelper.defined_filter_fields

    expect(DocumentFilterHelper.response_contains_items_array @response.body).to eq(true)
    json_body = JSON.parse(@response.body)
    json_body['data']['items'].each_with_index do | item, response_item_index |
      found_filter_string = false
      all_fields.each_with_index do | temp_field, all_fields_index |
        temp_field = temp_field.gsub('[]', '')

        all_values = []
        json_verify = JsonVerifier.new
        json_verify.save_all_values_of_path(0, "#{temp_field}".split('.'), item, "", all_values)

        found_filter_string = true if all_values.any? { |s| s.upcase.include?(@document_filter_term.upcase) unless s.nil? }
        p "response[data][items][#{response_item_index}]: found filter string in field #{temp_field}" if found_filter_string
        break if found_filter_string
      end
      p json_body['data']['items'][response_item_index] unless found_filter_string
      expect(found_filter_string).to eq(true), "response[data][items][#{response_item_index}] did not contain filter string #{@document_filter_term} for fields #{all_fields}"
    end
  end
end

Given(/^the client requests sorted DOCUMENTS for the patient "([^"]*)" filtered by terms$/) do |pid, table|
  filter_list = []
  table.rows.each do | value |
    filter_list.push(value[0])
  end
  
  parameter_hash = DocumentFilterHelper.default_document_filter_parameters
  parameter_hash['filterList'] = filter_list

  request_sorted_documents(pid, parameter_hash, "19350101", convert_cucumber_date('TODAY'))
  expect(@response.code).to eq(200), "Request failed: #{@response.code} - #{@response.body}"
end

Then(/^the document results are filtered on terms$/) do |table|
  all_fields = DocumentFilterHelper.defined_filter_fields

  expect(DocumentFilterHelper.response_contains_items_array @response.body).to eq(true)
  found_filter_string = false
  json_body = JSON.parse(@response.body)
  json_body['data']['items'].each_with_index do | item, response_item_index |
    all_fields.each_with_index do | temp_field, all_fields_index |
      temp_field = temp_field.gsub('[]', '')

      all_values = []
      found_array = []
      found_filter_string = false
      string_that_matched = ''

      table.rows.each do | filter_term |
        json_verify = JsonVerifier.new
        json_verify.save_all_values_of_path(0, "#{temp_field}".split('.'), item, "", all_values)
        # p "looking for #{filter_term[0]} in field #{temp_field}"

        found_filter_string = true if all_values.any? { |s| s.upcase.include?(filter_term[0].upcase) unless s.nil? }
        string_that_matched = filter_term[0] if found_filter_string
        break if found_filter_string
      end
      p "response[data][items][#{response_item_index}]: found filter string #{string_that_matched} in field #{temp_field}" if found_filter_string
      break if found_filter_string
    end
    p json_body['data']['items'][response_item_index] unless found_filter_string
    expect(found_filter_string).to eq(true), "response[data][items][#{response_item_index}] did not contain filter string #{table.to_s} for fields #{all_fields}"
  end
end

Given(/^the client notes the returned documents non\-scrolled results$/) do
  json_body = JSON.parse(@response.body)
  @document_nonscrolled_items = json_body['data']['items']
  p "length of nonscrollitems #{@document_nonscrolled_items.length}"
end

When(/^the client requests documents by scrolling for the patient "([^"]*)" filtered by terms$/) do |pid, table|
  filter_list = []
  table.rows.each do | value |
    filter_list.push(value[0])
  end

  @document_scrolled_items = []
  start_index = 0
  scroll_times = 3
  
  parameter_hash = {}
  parameter_hash['limit'] = @document_nonscrolled_items.length / scroll_times
  parameter_hash['start'] = 0
  parameter_hash['order'] = 'dateTime ASC'
  parameter_hash['template'] = 'notext'
  parameter_hash['range'] = "19350407..20170620235959"
  parameter_hash['filterFields'] = DocumentFilterHelper.defined_filter_fields
  parameter_hash['filterList'] = filter_list

  for i in 0..scroll_times
    parameter_hash['start'] = start_index
    request_sorted_documents(pid, parameter_hash, "", "")
    expect(@response.code).to eq(200), "Request failed: #{@response.code} - #{@response.body}"
    json_body = JSON.parse(@response.body)
    p "adding #{json_body['data']['items'].length} to full array"
    @document_scrolled_items.push(json_body['data']['items'])
    start_index = json_body['data']['nextStartIndex']
  end
end

Then(/^the document results are the same as non\-scrolled results$/) do
  p @document_scrolled_items.flatten.length
  expect(@document_scrolled_items.flatten.length).to eq(@document_nonscrolled_items.length)
  # p @document_scrolled_items.flatten[0]
  # p '----------------------'
  # p @document_nonscrolled_items[0]

  compare_documents = @document_scrolled_items.flatten

  compare_documents.each_with_index do | doc, index |
    hash3 = doc
    hash1 = @document_nonscrolled_items[index]
    # hash3.to_a - hash1.to_a # => [["c", 3]]

    if hash3.size > hash1.size
      difference = hash3.to_a - hash1.to_a
    else
      difference = hash1.to_a - hash3.to_a
    end
    p difference

    expect(difference.length).to eq(0), "#{index}: #{hash3}  -- #{hash1}"
    #p Hash[*difference.flatten] 
  end
  expect(@document_scrolled_items.flatten <=> @document_nonscrolled_items).to eq(0)
end

Given(/^the client requests unlimited documents for the patient "([^"]*)" filtered by terms$/) do |pid, table|
  filter_list = []
  table.rows.each do | value |
    filter_list.push(value[0])
  end
  
  parameter_hash = {}
  parameter_hash['start'] = 0
  parameter_hash['order'] = 'dateTime ASC'
  parameter_hash['template'] = 'notext'
  parameter_hash['range'] = "19350407..20170620235959"
  parameter_hash['filterFields'] = DocumentFilterHelper.defined_filter_fields
  parameter_hash['filterList'] = filter_list

  request_sorted_documents(pid, parameter_hash, "19350101", convert_cucumber_date('TODAY'))
  expect(@response.code).to eq(200), "Request failed: #{@response.code} - #{@response.body}"
end
