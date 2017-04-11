##############################################################################
# RDK patient/* resource steps
##############################################################################

# patient-record-search-detail-document
When(/^the client searches(?: for| where)? (?:detail|detailed) documents (?:for|where)\
(?: pid(?: is| of| in| equals to| equals| =) "(.*?)")?\
(?:, and| and|,| with)?\
(?: query(?: is| of| in| equals to| equals| =) "(.*?)")?\
(?:, and| and|,| with)?\
(?: group.field(?: is| of| in| equals to| equals| =) "(.*?)")?\
(?:, and| and|,| with)?\
(?: group.value(?: is| of| in| equals to| equals| =) "(.*?)")?\
(?:, and| and|,| with)?\
(?: fields?(?: is| of| in| equals to| equals| =) "(.*?)")?/) \
do |pid, query, group_field, group_value, whitelist|
  # puts "pid=[#{pid}]"
  # puts "query=[#{query}]"
  # puts "group_field=[#{group_field}]"
  # puts "group_value=[#{group_value}]"
  # puts "whitelist=[#{whitelist}]"

  query = parameterize_string(query)
  group_value = parameterize_string(group_value)

  resource = RDKQuery.new('patient-record-search-detail-document')
  resource.add_parameter('pid', pid)  unless pid.nil?
  resource.add_parameter('query', query) unless query.nil?
  resource.add_parameter('group.field', group_field) unless group_field.nil?
  resource.add_parameter('group.value', group_value) unless group_value.nil?
  resource.add_parameter('fields', whitelist) unless whitelist.nil?

  path = resource.path
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
end

# patient-record-search-suggest
When(/^the client searches(?: for| where)? text suggestions (?:for|where)\
(?: pid(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: query(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: fields?(?: is| of| in| equals to| equals| =) "(.*?)")?/) \
do |pid, query, whitelist|
  # puts "pid=[#{pid}]"
  # puts "query=[#{query}]"
  # puts "whitelist=[#{whitelist}]"

  query = parameterize_string(query)

  resource = RDKQuery.new('patient-record-search-suggest')
  resource.add_parameter('pid', pid)  unless pid.nil?
  resource.add_parameter('query', query) unless query.nil?
  resource.add_parameter('fields', whitelist) unless whitelist.nil?

  path = resource.path
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
  # puts @response.body
end

# patient-record-search-detail-trend
When(/^the client searches(?: for| where)? (?:detail|detailed) trends? (?:for|where)\
(?: pid(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: uid(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: fields?(?: is| of| in| equals to| equals| =) "(.*?)")?/) \
do |pid, uid, whitelist|
  # puts "pid=[#{pid}]"
  # puts "uid=[#{uid}]"
  # puts "whitelist=[#{whitelist}]"

  uid = parameterize_string(uid)

  resource = RDKQuery.new('patient-record-search-detail-trend')
  resource.add_parameter('pid', pid)  unless pid.nil?
  resource.add_parameter('uid', uid) unless uid.nil?
  resource.add_parameter('fields', whitelist) unless whitelist.nil?

  path = resource.path
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
  # puts @response.body
end

# patient-record-search-text
When(/^the client searches(?: for| where)? text (?:for|where)\
(?: pid(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: query(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: types(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: fields?(?: is| of| in| equals to| equals| =) "(.*?)")?/) \
do |pid, query, types, whitelist|
  # puts "pid=[#{pid}]"
  # puts "query=[#{query}]"
  # puts "types=[#{types}]"
  # puts "whitelist=[#{whitelist}]"

  query = parameterize_string(query)

  resource = RDKQuery.new('patient-record-search-text')
  resource.add_parameter('pid', pid)  unless pid.nil?
  resource.add_parameter('query', query) unless query.nil?
  resource.add_parameter('types', types) unless types.nil?
  resource.add_parameter('fields', whitelist) unless whitelist.nil?

  path = resource.path
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
  # puts @response.body
end

# patient-record-complexnote
When(/^the client searches(?: for| where)? complex notes? (?:for|where)\
(?: pid(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: uid(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: fields?(?: is| of| in| equals to| equals| =) "(.*?)")?/) \
do |pid, uid, whitelist|
  # puts "pid=[#{pid}]"
  # puts "uid=[#{uid}]"
  # puts "whitelist=[#{whitelist}]"

  resource = RDKQuery.new('patient-record-complexnote-pdf')
  resource.add_parameter('pid', pid)  unless pid.nil?
  resource.add_parameter('uid', uid) unless uid.nil?
  resource.add_parameter('fields', whitelist) unless whitelist.nil?

  path = resource.path
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
  # puts @response.body
end

# patient-record-searchbytype-{domain}
When(/^the client searches domain "(.*?)" by type ? (?:for|where)\
(?: pid(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: type(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: date.start(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: date.end(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: start(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: end(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: limit(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: order(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: fields?(?: is| of| in| equals to| equals| =) "(.*?)")?/) \
do |domain, pid, type, date_start, date_end, start, endx, limit, order, whitelist|
  # puts "pid=[#{pid}]"
  # puts "domain=[#{domain}]"
  # puts "type=[#{type}]"
  # puts "date_start=[#{date_start}]"
  # puts "date_end=[#{date_end}]"
  # puts "start=[#{start}]"
  # puts "endx=[#{endx}]"
  # puts "limit=[#{limit}]"
  # puts "order=[#{order}]"
  # puts "whitelist=[#{whitelist}]"

  resource = RDKQuery.new("patient-record-searchbytype-#{domain}")
  resource.add_parameter('pid', pid)  unless pid.nil?
  # resource.add_parameter('domain', domain) unless domain.nil?
  resource.add_parameter('type', type) unless type.nil?
  resource.add_parameter('date.start', date_start) unless date_start.nil?
  resource.add_parameter('date.end', date_end) unless date_end.nil?
  resource.add_parameter('start', start) unless start.nil?
  resource.add_parameter('endx', endx) unless endx.nil?
  resource.add_parameter('limit', limit) unless limit.nil?
  resource.add_parameter('order', order) unless order.nil?
  resource.add_parameter('fields', whitelist) unless whitelist.nil?

  path = resource.path
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
  # puts @response.body
end

# patient-generated
# - Future

# patient-assessment
# - Future

# patient-search-pid
When(/^the client searches(?: for pid|pid) (?:for|where)\
(?: pid(?: is| of| in| equals to| equals| =)? "(.*?)")?\
(?:, and| and|,| with)?\
(?: fields?(?: is| of| in| equals to| equals| =) "(.*?)")?/) \
do |pid, whitelist|
  # puts "pid=[#{pid}]"
  # puts "whitelist=[#{whitelist}]"

  resource = RDKQuery.new('patient-search-pid')
  resource.add_parameter('pid', pid)  unless pid.nil?
  resource.add_parameter('fields', whitelist) unless whitelist.nil?

  path = resource.path
  @response = HTTPartyWithBasicAuth.get_with_authorization(path)
  # puts @response.body
end

# search-default-search
# Future - When(/^the client searches default cprs (?:for|where)...

##############################################################################
# Response steps
##############################################################################

Given(/^the response contains matched data items$/) \
do
  items = hash_to_array(get_hash_items(@response.body))
  pending "Note: Response contains zero items, therefore skipping remainder of the scenario." unless items.size > 0
end

Then(/^all "(.*?)" values are within the past (\d+) (year?|years?|day?|days?|month?|months?)/) \
do |field, nbr, unit|
  nbr = nbr.to_i

  if unit == "year" || unit == "years"
    nbr_of_days = nbr * 365
  elsif unit == "month" || unit == "months"
    nbr_of_days = nbr * 30
  else
    nbr_of_days = nbr
  end

  date_start = ((Time.now - (24*60*60*nbr_of_days)).to_datetime).strftime("%Y%m%d0000")
  a = hash_to_array(get_hash_items(@response.body))
  a.each_with_index do |_, i|
    expect(a[i][field]).to be >= date_start
  end
end

Then(/^the response contains( between| no more than| at least| at most| no less than| only)? (\d+)(?: and (\d+))? (data rows?|items?|data item results?)$/) \
do |range, num1, num2, row_type|
  range.strip! unless range.nil?

  if row_type == 'item' || row_type == 'items'
    items = hash_to_array(get_hash_items(@response.body))
  elsif row_type == 'data row' || row_type == 'data rows'
    items = hash_to_array(get_hash_data(@response.body))
  else
    items = hash_to_array(get_hash_data_items_results(@response.body))
  end

  if range.nil?
    expect(items.size).to eq(num1.to_i)
  elsif range == 'only'
    expect(items.size).to eq(num1.to_i)
  elsif range == 'no more than' || range == 'at most'
    expect(items.size).to be <= (num1.to_i)
  elsif range == 'at least'  || range == 'no less than'
    expect(items.size).to be >= (num1.to_i)
  elsif range == 'between'
    expect(items.size).to be >= (num1.to_i)
    expect(items.size).to be <= (num2.to_i)
  end
end

Then(/^the response contains field "(.*?)"(?: which| whose)?(?: value| valued)?(?: is| at)? "(.*?)"$/) \
do |field, value|
  # puts "field=[#{field}]"
  # puts "value=[#{value}]"
  # puts "json=[#{key_value(@response.body, field)}]"
  # puts is_numeric?(value)
  if isnumeric?(value)
    expect(key_value(@response.body, field)).to eq(value.to_i)
  else
    expect(key_value(@response.body, field)).to eq(value)
  end
end

##############################################################################
# From module JsonUtilities in in /rspec-test/lib/json_utilities.rb
##############################################################################

# compares two json objects (Array, Hash, or String to be parsed) for equality
# Returns true if the objects are equivalent, false otherwise
def compare_json(jsonA, jsonB, exclude_list = [])
  # Need to do a deep copy of the hash because the compare routine may modify
  # it when it removes the 'updated' key/value
  json1 = Marshal.load(Marshal.dump(jsonA))
  json2 = Marshal.load(Marshal.dump(jsonB))
  # return false if classes mismatch or don't match our allowed types
  unless (json1.class == json2.class) &&
         (json1.is_a?(String) || json1.is_a?(Hash) || json1.is_a?(Array))
    return false
  end

  # Parse objects to JSON if Strings
  json1, json2 = [json1, json2].map! do |json|
    json.is_a?(String) ? JSON.parse(json) : json
  end
  return compare_json0(json1, json2, exclude_list)
end

def compare_json0(json1, json2, exclude_list)
  # initializing result var in the desired scope
  result = false

  # If an array, loop through each subarray/hash within the array and
  # recursively call self with these objects for traversal
  if json1.is_a?(Array)
    # Lengths must match
    # puts "\nDEBUG: json lengths #{json1.length} == #{json2.length}"
    return false unless json1.length == json2.length
    result = true # Zero length is also valid
    json1.each_with_index do |obj, index|
      json1_obj, json2_obj = obj, json2[index]
      result = compare_json0(json1_obj, json2_obj, exclude_list)
      # puts "\n DEBUG: Array compare #{result} #{json1_obj} #{json2_obj}"
      # End loop once a false match has been found
      break unless result
    end
  elsif json1.is_a?(Hash)

    # If a hash, check object1's keys and their values object2's keys
    # and values

    # first check that there are the same number of keys
    # return false unless (json1.keys.length==json2.keys.length)

    # created_at and updated_at can create false mismatches due to occasional
    # millisecond differences in tests
    if exclude_list.size == 0
      [json1, json2].each { |json|
        json.delete_if { |key, _value|
          %w(created_at updated_at updated).include?(key)
        }
      }
    else
      [json1, json2].each { |json|
        json.delete_if { |key, _value|
          exclude_list.include?(key)
        }
      }
    end

    json1.each do |key, value|
      # both objects must have a matching key to pass
      return false unless json2.key?(key)

      json1_val, json2_val = value, json2[key]

      result = compare_json0(json1_val, json2_val, exclude_list)
      # puts "\nDEBUG: Hash compare #{result} #{json1_val} #{json2_val}"

      # End loop once a false match has been found
      break unless result
    end
  end

  return result ? true : (json1 == json2)
end

def _find_data_section(table, json_object)
  if json_object.key?('data')
    needdata = false
    # table.rows.each do | fieldpath, fieldValuestring |
    table.each do |row|
      fieldpath = row[0]
      # _fieldValuestring = row[1]

      if fieldpath.start_with? "data."
        needdata = true
        break
      end
    end
    unless needdata
      json_object = json_object['data']
    end
  end
  json_object
end

def get_hash_data(response_body)
  JSON.parse(response_body)['data']
end

def get_hash_items(response_body)
  parsed_body = JSON.parse(response_body)
  if parsed_body['data'].nil?
    return nil
  else
    return parsed_body['data']['items']
  end
end

def get_hash_data_items_results(response_body)
  JSON.parse(response_body)['data']['items']['results']
end

def does_response_contain(table, responsebody)
  if responsebody.is_a?(Hash)
    allfound = check_contains(table, responsebody)
  elsif responsebody.is_a?(Array)
    allfound = false
    responsebody.each do |row|
      allfound = check_contains(table, row)
      break if allfound
    end
  else
    allfound = check_contains(table,
                              _find_data_section(table,
                                                 JSON.parse(responsebody)))
  end
  return allfound
end

def find_item_in_array(item, item_array)
  found = false
  for i in 0...(item_array.size) do
    found = does_response_contain(item, item_array[i])
    break if found
  end
  found ? i : -1
end

def verify_response_contains_item(table, item_array)
  found = false
  for i in 0...(item_array.size) do
    # puts '-------------------------------------------'
    # puts i
    found = does_response_contain(table, item_array[i])
    break if found
  end
  expect(found).to eq(true)
end

def verify_response_contains(table, responsebody)
  if responsebody.is_a?(Hash)
    # puts "verify_response_contains: HASH"
    allfound = check_contains(table, responsebody)
  elsif responsebody.is_a?(Array)
    # puts "verify_response_contains: ARRAY"
    allfound = false
    responsebody.each do |row|
      allfound = check_contains(table, row)
      break if allfound
    end
  else
    # puts "verify_response_contains: ELSE <#{responsebody.is_a?(Hash)}>"
    # puts "responsebody=<#{responsebody}>"
    allfound = check_contains(table,
                              _find_data_section(table,
                                                 JSON.parse(responsebody)))
  end
  expect(allfound).to eq(true)
end

def check_contains(table, json_object)
  # Code from: acceptance-tests/features/steps/access_domain_data_steps.rb
  # puts "check_contains......................................"
  dateformat = DefaultDateFormat.format
  json_verify = JsonVerifier.new

  allfound = true
  table.each do |row|
    fieldpath = row[0]
    fieldvaluestring = row[1]
    # puts "verify_response_contains(): <#{fieldpath}> <#{fieldvaluestring}>"
    json_verify.reset_output

    if fieldvaluestring.eql? "IS_FORMATTED_DATE"
      found = json_verify.all_matches_date_format(fieldpath,
                                                  dateformat,
                                                  [json_object])
    elsif fieldvaluestring.eql? "IS_SET"
      found = json_verify.defined?([fieldpath], json_object)
    elsif fieldvaluestring.start_with? "CONTAINS"
      term = fieldvaluestring.split(' ')
      fieldvalue = [term[1]]
      found = json_verify.object_contains_partial_value(fieldpath,
                                                        fieldvalue,
                                                        [json_object])
    elsif fieldvaluestring.start_with? "IN_ORDER"
      manipulate_input = String.new(fieldvaluestring)
      manipulate_input.slice! 'IN_ORDER'
      p "new fieldValuestring: #{manipulate_input}"
      ordered_array = manipulate_input.lstrip.split(',')
      p "new ordered_array: #{ordered_array}"
      found = json_verify.array_is_in_order(fieldpath,
                                            ordered_array,
                                            [json_object])
    else
      fieldvalue = [fieldvaluestring]
      # puts "verify_response_contains(): fieldpath=<#{fieldpath}> " \
      #      "fieldvalue=<#{fieldvalue}>" \
      #      "json_object=<#{json_object}>"

      found = json_verify.object_contains_path_value_combo(fieldpath,
                                                           fieldvalue,
                                                           [json_object])
    end # if
    # allfound = allfound && found
    allfound &&= found
    unless found
      output = json_verify.output
      output.each do |msg|
        p msg
      end # output.each
      puts json_verify.error_message
    end # if found == false
    next unless allfound
  end # table.rows.each
  return allfound
end

def hash_to_array(p)
  # Converts hash table to an key-value paired array of arrays
  # If already an array, return it back. otherwise, convert to an array
  # e.g.,
  # hash1 = {                     gets converts to:
  #   'key1' => 'value1',
  #   'key2' => {                         [ [ 'key1'      , 'value1' ],
  #     'key21' => 'value21',               [ 'key2.key21', 'value21'],
  #     'key22' => 'value22'                [ 'key2.key23', 'value23'],
  #   }                                     [ 'key3'      , 'value3' ]
  #   'key3' => 'value3'                  ]
  # }

  def _convert_hash_to_array(h, a, keyPrefix)
    h.keys.each do |k|
      v = h[k]
      if v.is_a?(Hash)
        _convert_hash_to_array(v, a, keyPrefix+'.'+k)
      else
        a << [keyPrefix+'.'+k, v]
      end
    end
    return a
  end

  if p.is_a?(Array)
    return p
  else
    return_array = []
    _convert_hash_to_array(p, [], "").each do |e|
      return_array << [e[0][1..-1], e[1]]
    end
    return return_array
  end
end

# Given a json object and a hash key, this will traverse the json object and
# return the hash key value if one exists. If key does not exist, it returns
# a nil.
def nested_hash_value(obj, key)
  if obj.respond_to?(:key?) && obj.key?(key)
    obj[key]
  elsif obj.respond_to?(:each)
    r = nil
    obj.find { |*a| r=nested_hash_value(a.last, key) }
    r
  end
end

def key_value(obj, key)
  nested_hash_value(JSON.parse(obj), key)
end

def parameterize_string(value)
  unless value.nil?
    # value = value.gsub(/:/, "\%3A")
    # value = value.gsub(/ /, "%20")
    value = value.gsub(/\//, "%2F").gsub(/\,/, "%2C")
    # puts value
  end
  value
end

def isnumeric?(obj)
  obj.to_s.match(/\A[+-]?\d+?(\.\d+)?\Z/) == nil ? false : true
end

def display_items(response_body, field = 'all')
  puts '-------------------------------------------'
  a = hash_to_array(get_hash_items(response_body))
  puts "asize=#{a.size} #{field}"
  a.each_with_index do |_, i|
    if field == 'all'
      a.each do |e|
        e.each do |key, value|
          puts "key=[#{key}] --> [#{value}]"
        end
      end
    else
      puts a[i][field]
    end
  end
  puts '- - - - - - - - - - - - - - - - - - - - - -'
end
