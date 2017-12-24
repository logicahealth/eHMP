When(/^the client requests the APPOINTMENTS for the patient "([^"]*)" with parameters$/) do |pid, table|
  request = QueryRDKDomain.new('appointment', pid)
  build_parameters = {}
  table.rows.each do |parameter, value|
    converted_today = value.include?('TODAY') ? value.sub('TODAY', convert_cucumber_date('TODAY')) : value
    combined_value = (build_parameters[parameter].nil?) ? converted_today : "#{build_parameters[parameter]},#{converted_today}"
    build_parameters[parameter] = combined_value
  end
  build_parameters.each do |key, value|
    request.add_parameter(key, value)
  end
  p request.path
  path = request.path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests problems\/conditions for the patient "([^"]*)" with parameters$/) do |pid, table|
  request = QueryRDKDomain.new('problem', pid)
  
  table.rows.each do |row|
    request.add_parameter(row[0], row[1])
  end
  p request.path
  path = request.path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests the timeline for the patient "([^"]*)" with parameters$/) do |pid, table|
  request = QueryRDKDomain.new('timeline', pid)
  
  table.rows.each do |row|
    request.add_parameter(row[0], row[1])
  end
  p request.path
  path = request.path
  @response = HTTPartyRDK.get(path)
end

Then(/^the client recieves (\d+) data points of type "([^"]*)"$/) do |number_of_results, arg2|
  json = JSON.parse(@response.body)
  #p @response.body
  output_string = ""

  fieldsource = "data.items.uid"
  steps_source = fieldsource.split('.')

  source_allvalues = []

  json_verify = JsonVerifier.new
  json_verify.save_all_values_of_path(0, steps_source, json, output_string, source_allvalues)

  num_type_results = 0
  source_panorama = Regexp.new("urn:va:#{arg2}")
  p source_panorama 
  source_allvalues.each do |value|
    #if value.start_with? "urn:va:allergy:SITE" #PANORAMA
    p "checking #{value}"
    unless source_panorama.match(value).nil?
      num_type_results += 1
    end
    
  end
  expect(num_type_results).to eq(number_of_results.to_i)
end

Then(/^the client recieves (\d+) data points of kind "([^"]*)"$/) do |number_of_results, arg2|
  json = JSON.parse(@response.body)
  #p @response.body
  output_string = ""

  fieldsource = "data.items.kind"
  steps_source = fieldsource.split('.')

  source_allvalues = []

  json_verify = JsonVerifier.new
  json_verify.save_all_values_of_path(0, steps_source, json, output_string, source_allvalues)

  num_type_results = 0
  
  source_allvalues.each do |value|
    p "checking #{value}"
    if value.downcase.eql? arg2.downcase
      num_type_results += 1
    end
    
  end
  expect(num_type_results).to eq(number_of_results.to_i)
end

def convert_cucumber_date(date_string)
  dm = DateManipulation.new
  # p "converting #{date_string}"
  return dm.string_of_todays_date if date_string.eql?('TODAY')
  return dm.string_of_months_ago(18) if date_string.eql?('18_MONTHS_AGO')
  return dm.string_of_months_hence(6) if date_string.eql?('6_MONTHS_FUTURE')
  return dm.string_of_months_hence(1200) if date_string.eql?('100_YEAR_FUTURE')

  return date_string
end

def build_date_range(string_range)
  to_from = string_range.split('-')
  to = convert_cucumber_date to_from[0]
  from = convert_cucumber_date to_from[1]
  filter_string = ""
  filter_string = "or(between(referenceDateTime,\"#{to}\",\"#{from}\")"
  filter_string << ",between(dateTime,\"#{to}\",\"#{from}\"))"  
end

When(/^the client requests the REPORTS for the patient "([^"]*)" with parameters$/) do |pid, table|
  request = QueryRDKDomain.new('document-view')
  filter_string = ""
  table.rows.each do |row|
    filter_string << "," if filter_string.length > 0
    filter_string << build_date_range(row[1]) if row[0].eql? 'FILTER_DATE'
    filter_string << row[1] if row[0].eql? 'FILTER'
  end
  request.add_parameter('filter', filter_string)
  request.add_parameter('pid', pid)
  path = request.path
  @response = HTTPartyRDK.get(path)
end

Then(/^the REPORT results contain$/) do |table|
  @json_object = JSON.parse(@response.body)
  result_array = @json_object["data"]

  json_verify = VerifyJsonRuntimeValue.new
  json_verify.verify_json_runtime_value(result_array, table)
end

def build_vital_date_range(string_range)
  to_from = string_range.split('-')
  to = convert_cucumber_date to_from[0]
  from = convert_cucumber_date to_from[1]
  filter_string = ""
  filter_string << "between(observed,\"#{to}\",\"#{from}\"))"  
end

When(/^the client requests the VITALS for the patient "([^"]*)" with parameters$/) do |pid, table|
  request = QueryRDKDomain.new('vital')
  filter_string = ""
  table.rows.each do |row|
    filter_string << "," if filter_string.length > 0
    filter_string << build_vital_date_range(row[1]) if row[0].eql? 'FILTER_DATE'
    filter_string << row[1] if row[0].eql? 'FILTER'
  end
  request.add_parameter('filter', filter_string)
  request.add_parameter('pid', pid)
  path = request.path
  @response = HTTPartyRDK.get(path)
end

Then(/^the results contain (\d+) totalItems$/) do |arg1|
  @json_object = JSON.parse(@response.body)
  total_items = @json_object["data"]["totalItems"]
  expect(total_items).to eq(arg1.to_i)
end

When(/^the client requests the TIMELINE for the patient "([^"]*)" with starting at "([^"]*)"$/) do |pid, start_date|
  today = convert_cucumber_date('TODAY')
  filter_string = "or(between(dateTime,\"#{start_date}\",\"#{today}\")"
  filter_string << ",or(between(administratedDateTime,\"#{start_date}\",\"#{today}\")"
  filter_string << ",between(observed,\"#{start_date}\",\"#{today}\")"
  request = QueryRDKDomain.new('timeline')
  request.add_parameter('filter', filter_string)
  request.add_parameter('pid', pid)
  path = request.path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests the TIMELINE for the patient "(.*?)" with GDF set to custom date range between "(.*?)" and "(.*?)"$/) do |pid, start_date, stop_date|
  filter_string = "or(between(dateTime,\"#{start_date}\",\"#{stop_date}\")"
  filter_string << ",or(between(administratedDateTime,\"#{start_date}\",\"#{stop_date}\")"
  filter_string << ",between(observed,\"#{start_date}\",\"#{stop_date}\")))"
  request = QueryRDKDomain.new('timeline')
  request.add_parameter('filter', filter_string)
  request.add_parameter('pid', pid)
  path = request.path
  @response = HTTPartyRDK.get(path)
end

def count_medication_kind(kind)
  json = JSON.parse(@response.body)
  output_string = ""

  fieldsource = "data.items.kind"
  steps_source = fieldsource.split('.')

  source_allvalues = []

  json_verify = JsonVerifier.new
  json_verify.save_all_values_of_path(0, steps_source, json, output_string, source_allvalues)

  p source_allvalues
  num_vista_results = 0
  source_allvalues.each do |value|
    num_vista_results += 1 if value.eql?(kind)
  end
  num_vista_results
  # expect(num_vista_results).to eq(number_of_results.to_i)
end

Then(/^the response should contain (\d+) inpatient meds$/) do |number_of_results|
  num_inpatient_results = count_medication_kind('Medication, Inpatient')
  num_infusion_results = count_medication_kind('Medication, Infusion')
  num_results = num_inpatient_results + num_infusion_results
  expect(num_results).to eq(number_of_results.to_i)
end

Then(/^the response should contain (\d+) outpatient meds$/) do |number_of_results|
  num_vista_results = count_medication_kind('Medication, Outpatient')
  expect(num_vista_results).to eq(number_of_results.to_i)
end

Then(/^the response should contain (\d+) non\-va meds$/) do |number_of_results|
  num_vista_results = count_medication_kind('Medication, Non-VA')
  expect(num_vista_results).to eq(number_of_results.to_i)
end

When(/^the client requests immunizations for the patient "([^"]*)"$/) do |pid|
  request = QueryRDKDomain.new('immunization', pid)
  
  # table.rows.each do | row |
  #   request.add_parameter(row[0], row[1])
  # end
  p request.path
  path = request.path
  @response = HTTPartyRDK.get(path)
end

Then(/^the Immunization result contain$/) do |table|
  @json_object = JSON.parse(@response.body)
  result_array = @json_object["data"]

  json_verify = VerifyJsonRuntimeValue.new
  json_verify.verify_json_runtime_value(result_array, table)
end

When(/^the client requests the DOCUMENTS for the patient "([^"]*)" with starting at "([^"]*)"$/) do |pid, start_date|
  today = convert_cucumber_date('TODAY')
  filter_string = "or(between(referenceDateTime,\"#{start_date}\",\"#{today}\")"
  filter_string << ",between(dateTime,\"#{start_date}\",\"#{today}\")"
  filter_string << "),not(and(in(kind,[\"Consult\",\"Imaging\",\"Procedure\"]),ne(statusName,\"COMPLETE\")))"
  request = QueryRDKDomain.new('document-view')
  request.add_parameter('filter', filter_string)
  request.add_parameter('pid', pid)
  path = request.path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests the DOCUMENTS for the patient "(.*?)" with GDF set to custom date range between "(.*?)" and "(.*?)"$/) do |pid, start_date, stop_date|
  filter_string = "or(between(referenceDateTime,\"#{start_date}\",\"#{stop_date}\")"
  filter_string << ",between(dateTime,\"#{start_date}\",\"#{stop_date}\")"
  filter_string << "),not(and(in(kind,[\"Consult\",\"Imaging\",\"Procedure\"]),ne(statusName,\"COMPLETE\")))"
  request = QueryRDKDomain.new('document-view')
  request.add_parameter('filter', filter_string)
  request.add_parameter('pid', pid)
  path = request.path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests the ORDERS for the patient "(.*?)" with GDF set to all$/) do |pid|
  today = convert_cucumber_date('100_YEAR_FUTURE')
  filter_string = "lte(entered,\"#{today}\")"
  request = QueryRDKDomain.new('order')
  request.add_parameter('filter', filter_string)
  request.add_parameter('pid', pid)
  path = request.path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests the ORDERS for the patient "(.*?)" with GDF set to custom date range between "(.*?)" and "(.*?)"$/) do |pid, start, stop|
  filter_string = "between(entered,\"#{start}\",\"#{stop}\")"
  request = QueryRDKDomain.new('order')
  request.add_parameter('filter', filter_string)
  request.add_parameter('pid', pid)
  path = request.path
  @response = HTTPartyRDK.get(path)
end

Then(/^the VPR results for Documents contain$/) do |table|
  @json_object = JSON.parse(@response.body)
  json_verify = JsonVerifier.new
  result_array = @json_object["data"]
  search_json(result_array, table)
end

When(/^the client requests clinical reminders for the patient "([^"]*)"$/) do |pid|
  clinical_reminders_query = RDKQuery.new('cds-advice-list')
  clinical_reminders_query.add_parameter('use', 'non')
  clinical_reminders_query.add_parameter('cache', 'false')
  clinical_reminders_query.add_parameter('pid', pid)
  path = clinical_reminders_query.path
  p path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests encounters for the patient "([^"]*)"$/) do |pid|
  # patient-record-timeline
  visit = "eq(kind, \"Visit\")"
  admission = "eq(kind, \"Admission\")"
  procedure = "eq(kind, \"Procedure\")"
  dodapp = "eq(kind, \"DoD Appointment\")"
  app = "eq(kind, \"Appointment\")"
  dodenc = "eq(kind, \"DoD Encounter\")"
  or_string = "or(#{visit},#{admission},#{procedure},#{dodapp},#{app},#{dodenc})"

  dm = DateManipulation.new
  six_months = dm.string_of_months_hence(6)
  and_string = "and(lte(dateTime,\"#{six_months}\"))"
  filter_string = "#{or_string},#{and_string}"
  order_string = 'dateTime DESC'
  request = QueryRDKDomain.new('timeline')
  request.add_parameter('filter', filter_string)
  request.add_parameter('order', order_string)
  request.add_parameter('pid', pid)
  path = request.path
  p path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests medications for Active Medications applet for the patient "([^"]*)"$/) do |pid|
  va_status = "ne(vaStatus,\"CANCELLED\")"
  or_string = "or(eq(vaType, \"O\"),eq(vaType, \"N\"))"
  filter_string = "and(#{va_status},#{or_string})"
  request = QueryRDKDomain.new('med')
  request.add_parameter('filter', filter_string)
  request.add_parameter('pid', pid)
  path = request.path
  p path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests lab results for Lab Results Gist applet for the patient "([^"]*)"$/) do |pid|
  request = QueryRDKDomain.new('lab', pid)
  today = convert_cucumber_date('TODAY')
  filter_string = "between(observed,\"19941130\",\"#{today}\"),eq(categoryCode , \"urn:va:lab-category:CH\")"
  request.add_parameter('filter', filter_string)
  p request.path
  path = request.path
  @response = HTTPartyRDK.get(path)
end

When(/^the client requests narrative lab results for the patient "([^"]*)"$/) do |pid|
  # labsbypanel
  request = QueryRDKDomain.new('labsbypanel', pid)
  today = convert_cucumber_date('TODAY')
  filter_string = "and(between(observed,\"19930716\",\"#{today}\"),ne(categoryCode , \"urn:va:lab-category:CH\"))"
  request.add_parameter('filter', filter_string)
  p request.path
  path = request.path
  @response = HTTPartyRDK.get(path)
end
