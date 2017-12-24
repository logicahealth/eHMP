require 'json'

def define_var
  @clinical_wrapper = [
    ['patientUid', 'urn:va:patient:SITE:3:3'],
    ['authorUid', 'urn:va:user:SITE:10000000270'],
    ['domain', 'ehmp-activity'],
    ['subDomain', 'request'],
    ['visit.location', 'SITE;3'],
    ['visit.serviceCategory', 'D'],
    ['visit.dateTime', '20140814130730'],
    ['ehmpState', 'draft'],
    ['displayName', 'Activity Request']
  ]
end

Given(/^(?:a|the|an) "(.*?)" Clinical "(.*?)" in "(.*?)" state is deleted for patient "(.*?)" with:$/) \
do |domain, _subdomain, _state, patientuid, table|
  domain = 'ehmp-'+domain

  response_data = JSON.parse(@response.body)["data"]

  pid = patientuid
  uid = response_data["uid"]

  domain_path = String.new(RDClass.resourcedirectory_writeback.get_url('clinical-object-update'))
  domain_path.sub!(':pid', pid)
  domain_path.sub!(':resourceId', uid)

  table.rows.each do |field, value|
    if field == 'earliest' || field == 'latest'
      if value[0, 7].downcase == 'system_'
        value = evaluate(value)
      end
    end
    response_data['data'][field] = value
  end

  response_data["ehmpState"] = "deleted"
  content = JSON.generate(response_data)

  @response = HTTPartyRDK.put(domain_path, content, { "Content-Type" => "application/json" })
end

Given(/^(?:a|the|an) "(.*?)" Clinical "(.*?)" in "(.*?)" state is deleted for patient "(.*?)"$/) \
do |domain, _subdomain, _state, patientuid|
  domain = 'ehmp-'+domain

  pid = patientuid
  response_data = JSON.parse(@response.body)["data"]

  response_data["ehmpState"] = "deleted"
  content = JSON.generate(response_data)

  domain_path = String.new(RDClass.resourcedirectory_writeback.get_url('clinical-object-update'))
  domain_path.sub!(':pid', pid)
  domain_path.sub!(':resourceId', @uid)

  @response = HTTPartyRDK.put(domain_path, content, { "Content-Type" => "application/json" })
end

Given(/^(?:a|the|an) "(.*?)" Clinical "(.*?)" in "(.*?)" state is added for patient "(.*?)" with:$/) \
do |title, _subdomain, _state, patientuid, table|
  define_var

  clinical_object = @clinical_wrapper
  clinical_object.delete_if { |a| a[0] == 'displayName' }

  if title[0, 5] == "CHAR*"
    s = "x" * (title[5..-1].to_i - 1)
    clinical_object << ['displayName', s + 'Z']
  elsif title != "NIL"
    clinical_object << ['displayName', title]
  end

  domain = 'ehmp-activity'

  payload_data = []
  table.hashes.each do |elem|
    value = elem[:value]
    if elem[:field] == 'earliest' || elem[:field] == 'latest'
      if value[0, 7].downcase == 'system_'
        value = evaluate(value)
      end
    end
    payload_data << [elem[:field], value]
  end

  clinical_object << ['data', dot_array_to_hash(payload_data)]
  pid = patientuid
  content = dot_array_to_hash(clinical_object).to_json

  domain_path = String.new(RDClass.resourcedirectory_writeback.get_url('clinical-object-add'))
  domain_path.sub!(':pid', pid)

  @response = HTTPartyRDK.post(domain_path, content, { "Content-Type" => "application/json" })
  if @response.code.is_a?(String)
    if @response.code[0..0] == "2"
      @uid = get_uid(@response.body)
    end
  elsif @response.code <= 205
    @uid = get_uid(@response.body)
  end
end

Given(/^(?:a|the|an) "(.*?)" Clinical "(.*?)" in "(.*?)" state is added for patient "(.*?)" with data:$/) \
do |title, _subdomain, _state, patientuid, table|
  define_var

  clinical_object = @clinical_wrapper

  clinical_object.delete_if { |a| a[0] == 'displayName' }

  if title[0, 5] == "CHAR*"
    s = "x" * (title[5..-1].to_i - 1)
    clinical_object << ['displayName', s + 'Z']
  elsif title != "NIL"
    clinical_object << ['displayName', title]
  end

  domain = 'ehmp-activity'

  build_string = ''
  payload_data = ''

  table.rows.each do |row|
    build_string += ' ' + row.join(' ')
  end

  build_string = '{ ' + build_string + ' }'
  payload_data = JSON.parse(build_string)

  if payload_data['data'].key?('earliest')
    puts "has earlies key"
    if payload_data['data']['earliest'][0, 7].downcase == 'system_'
      payload_data['data']['earliest'] = evaluate(payload_data['data']['earliest'])
    end
  end
  if payload_data['data'].key?('latest')
    if payload_data['data']['latest'][0, 7].downcase == 'system_'
      payload_data['data']['latest'] = evaluate(payload_data['data']['latest'])
    end
  end

  clinical_data = dot_array_to_hash(clinical_object)
  clinical_data['data'] = payload_data['data']

  pid = patientuid
  content = clinical_data.to_json

  domain_path = String.new(RDClass.resourcedirectory_writeback.get_url('clinical-object-add'))
  domain_path.sub!(':pid', pid)

  @response = HTTPartyRDK.post(domain_path, content, { "Content-Type" => "application/json" })

  if @response.code.is_a?(String)
    if @response.code[0..0] == "2"
      @uid = get_uid(@response.body)
    end
  elsif @response.code <= 205
    @uid = get_uid(@response.body)
  end
end

Given(/^(?:a|the|an) "(.*?)" Clinical "(.*?)" in "(.*?)" state is updated for patient "(.*?)" with data:$/) \
do |title, _subdomain, _state, patientuid, table|
  define_var

  clinical_object = @clinical_wrapper

  clinical_object.delete_if { |a| a[0] == 'displayName' }

  if title[0, 5] == "CHAR*"
    s = "x" * (title[5..-1].to_i - 1)
    clinical_object << ['displayName', s + 'Z']
  elsif title != "NIL"
    clinical_object << ['displayName', title]
  end
  clinical_object << ['uid', @uid]

  domain = 'ehmp-activity'

  build_string = ''
  payload_data = ''

  table.rows.each do |row|
    build_string += ' ' + row.join(' ')
  end

  build_string = '{ ' + build_string + ' }'
  payload_data = JSON.parse(build_string)

  if payload_data['data'].key?('earliest')
    if payload_data['data']['earliest'][0, 7].downcase == 'system_'
      payload_data['data']['earliest'] = evaluate(payload_data['data']['earliest'])
    end
  end
  if payload_data['data'].key?('latest')
    if payload_data['data']['latest'][0, 7].downcase == 'system_'
      payload_data['data']['latest'] = evaluate(payload_data['data']['latest'])
    end
  end

  clinical_data = dot_array_to_hash(clinical_object)

  clinical_data['data'] = payload_data['data']

  pid = patientuid
  uid = @uid

  content = clinical_data.to_json

  domain_path = String.new(RDClass.resourcedirectory_writeback.get_url('clinical-object-update'))
  domain_path.sub!(':pid', pid)
  domain_path.sub!(':resourceId', uid)

  @response = HTTPartyRDK.put(domain_path, content, { "Content-Type" => "application/json" })
end

Then(/^the activity request contains$/) do |table|
  dateformat = DefaultDateFormat.format

  @json_object = JSON.parse(@response.body)
  json_verify = JsonVerifier.new

  result_array = []
  result_array.push(@json_object["data"])
  search_json2(result_array, table, dateformat)
end

When(/^the client retrieves the activity for patient "(.*?)"$/) \
do |patientuid|
  pid = patientuid

  domain_path = String.new(RDClass.resourcedirectory_writeback.get_url('clinical-object-read'))
  domain_path.sub!(':resourceId', @uid) unless @uid.nil?
  domain_path.sub!(':pid', pid)

  @response = HTTPartyRDK.get(domain_path)
end

def evaluate(expr)
  if expr[0, 16].downcase == 'system_end_date('
    system_end_date(expr.match(/\(([^(\(\))]+)\)/)[1].to_i)
  elsif expr[0, 18].downcase == 'system_start_date('
    system_start_date(expr.match(/\(([^(\(\))]+)\)/)[1].to_i)
  else
    expr
  end
end

def get_uid(raw_response_body)
  location = JSON.parse(raw_response_body)['data']['headers']['location']
  location[location.index('clinicobj/')+10..-1]
end

def system_start_date(nbr_of_days = 0)
  ((Time.now + (24*60*60*nbr_of_days)).to_datetime).strftime("%Y%m%d000000")
end

def system_end_date(nbr_of_days = 0)
  ((Time.now + (24*60*60*nbr_of_days)).to_datetime).strftime("%Y%m%d235959")
end

def dot_array_to_hash(array)
  array_to_hash(dot_array_to_array(array))
end

def array_to_hash(array)
  result = {}
  array.each do |elem|
    second = \
      if elem.last.is_a?(Array)
        if elem.last.first == "$ARRAY"
          elem.last.drop(1)
        else
          array_to_hash(elem.last)
        end
      else
        elem.last
      end
    result.merge!({ elem.first => second })
  end
  result
end

def result_entry(sub_array, prev_key)
  if sub_array.is_a?(Array)
    if sub_array[0] == "$ARRAY"
      [prev_key, sub_array]
    else
      [prev_key, sub_array.unshift("$ARRAY")]
    end
  else
    [prev_key, sub_array]
  end
end

def sub_array_entry(sub_array, prev_remkey, prev_value)
  if prev_remkey == ""
    sub_array = prev_value
  else
    if sub_array.is_a?(String)
      hold = sub_array
      sub_array = []
      sub_array << [hold, [prev_remkey, prev_value]]
    else
      sub_array << [prev_remkey, prev_value]
    end
  end
  sub_array
end

def dot_array_to_array(dot_array)
  result = []
  sub_array = []
  prev_key = ""
  prev_remkey = ""
  prev_value = ""

  dot_array.each_with_index do |elem, index|
    if elem.is_a?(String)
      return elem
    end

    if !elem.first.index('.').nil?
      curr_key = elem.first.split('.').first
      curr_remkey = elem.first[elem.first.index('.')+1..-1]
      curr_value = elem.last
    else
      curr_key = elem.first
      curr_remkey = ""
      curr_value = elem.last
    end

    if index > 0
      sub_array = sub_array_entry(sub_array, prev_remkey, prev_value)
      if prev_key != curr_key
        if sub_array.is_a?(Array) && prev_remkey != ""
          result << [prev_key, dot_array_to_array(sub_array)]
        else
          result << result_entry(sub_array, prev_key)
        end
        sub_array = []
      end
    end

    prev_remkey = curr_remkey.strip
    prev_key = curr_key.strip
    prev_value = curr_value
  end

  sub_array = sub_array_entry(sub_array, prev_remkey, prev_value)

  if sub_array.is_a?(Array) && prev_remkey != ""
    result << [prev_key, dot_array_to_array(sub_array)]
  else
    result << result_entry(sub_array, prev_key)
  end
  result
end

def search_json2(result_array, table, _dateformat = DefaultDateFormat.format)
  json_verify = JsonVerifier.new
  table.rows.each do |fieldpath, fieldvaluestring|
    json_verify.reset_output

    found = \
      if fieldvaluestring[0, 16].downcase == 'system_end_date(' || fieldvaluestring[0, 18].downcase == 'system_start_date('
        json_verify.build_subarray(fieldpath, evaluate(fieldvaluestring), result_array)
      elsif fieldvaluestring.eql? "IS_SET"
        found = json_verify.defined?([fieldpath], result_array)
      elsif fieldvaluestring.eql? "IS_NOT_SET"
        found = json_verify.not_defined?([fieldpath], result_array)
      else
        json_verify.build_subarray(fieldpath, fieldvaluestring, result_array)
      end
    result_array = json_verify.subarry

    if found == false
      output = json_verify.output
      output.each do |msg|
        p msg
      end #output.each
      puts "for field #{fieldpath}: #{json_verify.error_message}"
    end # if found == false
    expect(found).to eq(true)
    expect(result_array.length).to_not eq(0)
  end # table.rows.each
end
