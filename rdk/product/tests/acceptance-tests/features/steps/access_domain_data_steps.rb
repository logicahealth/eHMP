
def count_number_of_results
  json = JSON.parse(@response.body)
  return json['total']
end # count_number_of_results

Then(/^the results contain$/) do |table|
  dateformat = DefaultDateFormat.format
  @json_object = JSON.parse(@response.body)
  if @json_object.key?('data')
    needdata = false
    table.rows.each do |fieldpath, _fieldValuestring|
      if fieldpath.start_with? "data."
        needdata = true
        break
      end
    end
    unless needdata
      @json_object = @json_object['data']
    end
  end
  json_verify = JsonVerifier.new

  allfound = true
  table.rows.each do |fieldpath, fieldvaluestring|
    json_verify.reset_output

    if fieldvaluestring.eql? "IS_FORMATTED_DATE"
      found = json_verify.all_matches_date_format(fieldpath, dateformat, [@json_object])
    elsif fieldvaluestring.eql? "IS_SET"
      found = json_verify.defined?([fieldpath], @json_object)
    elsif fieldvaluestring.start_with? "CONTAINS"
      term = fieldvaluestring.split(' ')
      fieldvalue = [term[1]]
      found = json_verify.object_contains_partial_value(fieldpath, fieldvalue, [@json_object])
    elsif fieldvaluestring.start_with? "IN_ORDER"
      manipulate_input = String.new(fieldvaluestring)
      manipulate_input.slice! 'IN_ORDER'
      p "new fieldValuestring: #{manipulate_input}"
      ordered_array = manipulate_input.lstrip.split(',')
      p "new ordered_array: #{ordered_array}"
      found = json_verify.array_is_in_order(fieldpath, ordered_array, [@json_object])
    else
      fieldvalue = [fieldvaluestring]
      found = json_verify.object_contains_path_value_combo(fieldpath, fieldvalue, [@json_object])
    end # if
    allfound &&= found
    if found == false
      output = json_verify.output
      output.each do |msg|
        p msg
      end # output.each
      puts json_verify.error_message
    end # if found == false
  end # table.rows.each
  expect(allfound).to eq(true)
end
