Given(/^an incident report$/) do |table|
  @incident_body = create_json_hash_from_table(table)
end

Given(/^the incident report has an incident$/) do |table|
  hash = create_json_hash_from_table(table)
  @incident_body = { 'incidents' => [] } if @incident_body.nil?
  @incident_body['incidents'].push(hash)
end

When(/^an incident report creation is requested$/) do
  create_incident_path = RDKQuery.new('incident-report')
  @response = HTTPartyRDK.post(create_incident_path.path, @incident_body)
end

def split_json_path_to_array(property)
  # property_path = property.split(/\.|\[(\d+)\]|\[\]/)
  # property_path.delete ''
  property_path = property.gsub(/(?:^|\.)([^\[.]*)/, '[\1]').scan(/(?<=\[).*?(?=\])/)
  property_path.map do |item|
    if /^\d+$/.match(item)
      item.to_i
    else
      item
    end
  end
end

def set_value_at_path(json_root, path_array, value)
  json_item = json_root
  path_array.each_cons(2) do |path_item, next_path_item|
    if json_item[path_item].nil?
      if next_path_item.is_a? Integer
        json_item[path_item] = []
      else
        json_item[path_item] = {}
      end
    end
    json_item = json_item[path_item]
  end
  json_item[path_array.last] = value
  json_root
end

def create_json_hash_from_table(table)
  json_root = {}
  table.rows.each do |property, value|
    path_array = split_json_path_to_array(property)
    begin
      value = JSON.load(value) unless value.empty?
    rescue
      nil
    end
    set_value_at_path(json_root, path_array, value)
  end
  json_root
end
