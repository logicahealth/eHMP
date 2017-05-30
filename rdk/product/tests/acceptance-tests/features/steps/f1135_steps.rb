def request_sorted_documents(pid, table_or_hash, start_date, end_date)
  table = table_or_hash.kind_of?(Cucumber::MultilineArgument::DataTable) ? table_or_hash.rows_hash : table_or_hash
  today = convert_cucumber_date('TODAY')

  request = QueryRDKDomain.new('document-view')
  table['pid'] = pid

  path = request.path

  @response = HTTPartyRDK.post(path, table.to_json, TaskHelper.headers.merge({ 'X-HTTP-Method-Override' => 'GET' }))
  @response
end

def numeric?(parameter)
  Float(parameter) != nil rescue false
end

When(/^the client attempts to request sorted DOCUMENTS for the patient "([^"]*)"$/) do |pid, table|
  request_parameters = {}

  table.rows.each do | parameter, value |
    request_parameters[parameter] = numeric?(value) ? value.to_i : value
  end
  request_sorted_documents(pid, request_parameters, "19350101", convert_cucumber_date('TODAY'))
end

def sort_prerequesite_met?(data_items)
  expect(data_items).to_not be_nil
  expect(data_items).to be_a(Array)
  required_result_count = 2
  expect(data_items.length).to be >= required_result_count, "Prerequesite not met: require at least #{required_result_count} results to test sort. #{data_items.length} results"
end

class DocumentSort
  attr_reader :primary
  attr_reader :secondary
  def initialize(temp_primary, temp_secondary)
    @primary = temp_primary.clone.upcase
    @secondary = temp_secondary.clone.upcase
  end

  def inspect
    "#{primary} #{secondary}" 
  end
end

def build_sorting_array(response_body, field1)
  json = JSON.parse(response_body)
  sort_prerequesite_met? json['data']['items']

  summary_allvalues = []
  datetime_allvalues = []
  reference_all_values = []

  json_verify = JsonVerifier.new
  json_verify.save_all_values_of_path(0, "data.items.#{field1}".split('.'), json, "", summary_allvalues)
  json_verify.save_all_values_of_path(0, "data.items.dateTime".split('.'), json, "", datetime_allvalues)
  json_verify.save_all_values_of_path(0, "data.items.referenceDateTime".split('.'), json, "", reference_all_values)

  expect(summary_allvalues.length).to eq(datetime_allvalues.length)
  expect(datetime_allvalues.length).to eq(reference_all_values.length)

  document_array = []
  summary_allvalues.each_with_index do | summary, index |
    invalid_datetime = datetime_allvalues[index].match(/\d{8,}/).nil?
    invalid_referencedatetime = reference_all_values[index].match(/\d{8,}/).nil?
    document_array.push(DocumentSort.new(summary, datetime_allvalues[index])) unless invalid_datetime
    next unless invalid_datetime
    document_array.push(DocumentSort.new(summary, reference_all_values[index])) unless invalid_referencedatetime
    next unless invalid_referencedatetime
    p "#{datetime_allvalues[index]} (#{datetime_allvalues[index].strip.length})   #{reference_all_values[index]} (#{reference_all_values[index].strip.length})"
    document_array.push(DocumentSort.new(summary, "HUGE ISSUE"))
  end
  document_array
end

def build_sorting_array_date_only(response_body)
  json = JSON.parse(response_body)
  sort_prerequesite_met? json['data']['items']

  datetime_allvalues = []
  reference_all_values = []

  json_verify = JsonVerifier.new
  json_verify.save_all_values_of_path(0, "data.items.dateTime".split('.'), json, "", datetime_allvalues)
  json_verify.save_all_values_of_path(0, "data.items.referenceDateTime".split('.'), json, "", reference_all_values)

  expect(datetime_allvalues.length).to eq(reference_all_values.length)

  document_array = []
  datetime_allvalues.each_with_index do | datetime, index |
    invalid_datetime = datetime_allvalues[index].match(/\d{8,}/).nil?
    invalid_referencedatetime = reference_all_values[index].match(/\d{8,}/).nil?
    document_array.push(DocumentSort.new("", datetime_allvalues[index])) unless invalid_datetime
    next unless invalid_datetime
    document_array.push(DocumentSort.new("", reference_all_values[index])) unless invalid_referencedatetime
    next unless invalid_referencedatetime
    p "#{datetime_allvalues[index]} (#{datetime_allvalues[index].strip.length})   #{reference_all_values[index]} (#{reference_all_values[index].strip.length})"
  end
  document_array
end

Then(/^the document results are in ascending sort order by "([^"]*)" \( then descending dateTime \)$/) do |field1|
  document_array = build_sorting_array(@response.body, field1)
  index_upper_range = document_array.length - 1
  for i in 1..index_upper_range
    first_document = document_array[i-1]
    second_document = document_array[i]
    begin
      expect(first_document.primary).to be <= second_document.primary
      expect(first_document.secondary).to be >= second_document.secondary if first_document.primary == second_document.primary
    rescue Exception => e
      p "#{first_document.primary}.#{first_document.secondary}  -- #{second_document.primary}.#{second_document.secondary}"
      raise e
    end
  end
end

Then(/^the document results are in ascending sort order by "([^"]*)" \( then ascending dateTime \)$/) do |field1|
  document_array = build_sorting_array(@response.body, field1)
  index_upper_range = document_array.length - 1
  for i in 1..index_upper_range
    first_document = document_array[i-1]
    second_document = document_array[i]
    begin
      expect(first_document.primary).to be <= second_document.primary
      expect(first_document.secondary).to be <= second_document.secondary if first_document.primary == second_document.primary
    rescue Exception => e
      p "#{first_document.primary}.#{first_document.secondary}  -- #{second_document.primary}.#{second_document.secondary}"
      raise e
    end
  end
end

Then(/^the document results are in descending sort order by "([^"]*)" \( then descending dateTime \)$/) do |field1|
  document_array = build_sorting_array(@response.body, field1)
  index_upper_range = document_array.length - 1
  for i in 1..index_upper_range
    first_document = document_array[i-1]
    second_document = document_array[i]
    begin
      expect(first_document.primary).to be >= second_document.primary
      expect(first_document.secondary).to be >= second_document.secondary if first_document.primary == second_document.primary
    rescue Exception => e
      p "#{first_document.primary}.#{first_document.secondary}  -- #{second_document.primary}.#{second_document.secondary}"
      raise e
    end
  end
end

Then(/^the document results are in ascending sort order by dateTime$/) do
  document_array = build_sorting_array_date_only(@response.body)
  index_upper_range = document_array.length - 1

  for i in 1..index_upper_range
    first_document = document_array[i-1]
    second_document = document_array[i]
    begin
      expect(first_document.primary).to be <= second_document.primary
      expect(first_document.secondary).to be <= second_document.secondary if first_document.primary == second_document.primary
    rescue Exception => e
      p "#{first_document.primary}.#{first_document.secondary}  -- #{second_document.primary}.#{second_document.secondary}"
      raise e
    end
  end
end

Then(/^the document results are in descending sort order by dateTime$/) do
  document_array = build_sorting_array_date_only(@response.body)
  index_upper_range = document_array.length - 1

  for i in 1..index_upper_range
    first_document = document_array[i-1]
    second_document = document_array[i]
    begin
      expect(first_document.primary).to be >= second_document.primary
      expect(first_document.secondary).to be >= second_document.secondary if first_document.primary == second_document.primary
    rescue Exception => e
      p "#{first_document.primary}.#{first_document.secondary}  -- #{second_document.primary}.#{second_document.secondary}"
      raise e
    end
  end
end

Then(/^the document results pageIndex is (\d+)$/) do |expected_page_index|
  json = JSON.parse(@response.body)
  expect(json['data']).to_not be_nil
  expect(json['data']['pageIndex']).to_not be_nil
  expect(json['data']['pageIndex']).to eq(expected_page_index.to_i)
end

Then(/^the document results startIndex is (\d+)$/) do |expected_start_index|
  json = JSON.parse(@response.body)
  expect(json['data']).to_not be_nil
  expect(json['data']['startIndex']).to_not be_nil
  expect(json['data']['startIndex']).to eq(expected_start_index.to_i)
end

Then(/^the document results itemsPerPage are less then or equal to (\d+)$/) do |expected_items|
  json = JSON.parse(@response.body)
  expect(json['data']).to_not be_nil
  expect(json['data']['itemsPerPage']).to_not be_nil
  expect(json['data']['itemsPerPage']).to be <= expected_items.to_i
end

Then(/^the document results contain a nextStartIndex field$/) do
  json = JSON.parse(@response.body)
  expect(json['data']).to_not be_nil
  expect(json['data']['nextStartIndex']).to_not be_nil
end

When(/^the client requests sorted DOCUMENTS for the patient "([^"]*)" starting with the nextStartIndex$/) do |pid, table|
  expect(@response).to_not be_nil
  json = JSON.parse(@response.body)
  expect(json['data']).to_not be_nil
  expect(json['data']['nextStartIndex']).to_not be_nil
  @next_start_index = json['data']['nextStartIndex']
  p "next start index #{@next_start_index}"
  p @next_start_index.class
  p @next_start_index.to_i.class

  parameter_hash = table.rows_hash
  parameter_hash['start'] = @next_start_index.to_s

  request_sorted_documents(pid, parameter_hash, "19350101", convert_cucumber_date('TODAY'))
  expect(@response.code).to eq(200), "Request failed: #{@response.code} - #{@response.body}"

end

Then(/^the document results startIndex is equal to the last nextStartIndex$/) do
  expect(@next_start_index).to_not be_nil, "expected variable @next_start_index to be set in a previous step"
  json = JSON.parse(@response.body)
  expect(json['data']).to_not be_nil
  expect(json['data']['startIndex']).to_not be_nil
  expect(json['data']['startIndex']).to eq(@next_start_index)
end

When(/^the client requests sorted DOCUMENTS for the patient "([^"]*)"$/) do |pid, table|
  request_parameters = {}

  table.rows.each do | parameter, value |
    request_parameters[parameter] = numeric?(value) ? value.to_i : value
  end
  request_parameters['filterFields'] = DocumentFilterHelper.defined_filter_fields
  request_sorted_documents(pid, request_parameters, "19350101", convert_cucumber_date('TODAY'))
  expect(@response.code).to eq(200), "Request failed: #{@response.code} - #{@response.body}"
end

When(/^the client requests sorted DOCUMENTS by scrolling for the patient "([^"]*)"$/) do |pid, table|
  parameter_hash = {}
  table.rows.each do | key, value |
    parameter_hash[key] = value
  end

  @document_scrolled_items = []
  start_index = 0
  scroll_times = 3
  
  
  parameter_hash['limit'] = @document_nonscrolled_items.length / scroll_times
  parameter_hash['start'] = 0
  parameter_hash['filterFields'] = DocumentFilterHelper.defined_filter_fields

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
