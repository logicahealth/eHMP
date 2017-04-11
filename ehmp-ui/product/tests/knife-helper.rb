require 'json'

JSON.create_id = nil

def knife_search_for_ip(machine_name)
  release = File.read(File.dirname(__FILE__) + "/../../infrastructure/properties/releaseVersion")
  stack = ENV['JOB_NAME'] || "#{ENV['USER']}-#{release}"
  if ENV.key?('BUNDLE_BIN_PATH')
    raw_search = Bundler.with_clean_env { `/opt/chefdk/bin/knife search node \'role:#{machine_name} AND stack:#{stack}\' -Fj --config ~/Projects/vistacore/.chef/knife.rb` }
  else
    raw_search = `/opt/chefdk/bin/knife search node \'role:#{machine_name} AND stack:#{stack}\' -Fj --config ~/Projects/vistacore/.chef/knife.rb`
  end
  parsed_search = JSON.parse(raw_search)
  fail "More than one node with that name found" if parsed_search["results"] > 1
  fail "No node with that name found" if parsed_search["results"] == 0
  ip = parsed_search["rows"][0]['automatic']['ipaddress']
end

def knife_search_for_attribute(machine_name, attribute, attribute_type)
  release = File.read(File.dirname(__FILE__) + "/../../infrastructure/properties/releaseVersion")
  stack = ENV['JOB_NAME'] || "#{ENV['USER']}-#{release}"
  if ENV.key?('BUNDLE_BIN_PATH')
    raw_search = Bundler.with_clean_env { `/opt/chefdk/bin/knife search node \'role:#{machine_name} AND stack:#{stack}\' -Fj --config ~/Projects/vistacore/.chef/knife.rb` }
  else
    raw_search = `/opt/chefdk/bin/knife search node \'role:#{machine_name} AND stack:#{stack}\' -Fj --config ~/Projects/vistacore/.chef/knife.rb`
  end
  parsed_search = JSON.parse(raw_search)
  fail "More than one node with that name found" if parsed_search["results"] > 1
  fail "No node with that name found" if parsed_search["results"] == 0
  node_attributes = parsed_search["rows"][0][attribute_type]
  depth = 0
  while node_attributes.is_a?(Hash) && node_attributes.keys.size > 0
    node_attributes = node_attributes["#{attribute[depth]}"]
    depth = depth + 1
  end
  return node_attributes.inspect
end

def knife_search_for_key_name(machine_name, driver)
  release = File.read(File.dirname(__FILE__) + "/../../infrastructure/properties/releaseVersion")
  stack = ENV['JOB_NAME'] || "#{ENV['USER']}-#{release}"
  driver == "aws" ? key_box = "#{machine_name}-#{stack}-noint" : key_box = "#{machine_name}-#{stack}"
  raw_search = `/opt/chefdk/bin/knife search node \'name:#{key_box}\' -Fj --config ~/Projects/vistacore/.chef/knife.rb`
  parsed_search = JSON.parse(raw_search)
  fail "More than one key was found for: #{machine_name}" if parsed_search["results"] > 1
  fail "No key was found for: #{machine_name}" if parsed_search["results"] == 0
  begin
    key = parsed_search["rows"][0]['normal']["chef_provisioning"]["reference"]["key_name"]
  rescue NoMethodError
    begin
      key = parsed_search["rows"][0]['normal']["chef_provisioning"]["location"]["key_name"] 
    rescue 
      raise %/
      No attribute found for #{machine_name}-#{stack} at: ['rows'][0]['normal']['chef_provisioning']['location']['key_name'] 
      or ['rows'][0]['normal']['chef_provisioning']['reference']['key_name']
      /
    end
  end
  if driver == "virtualbox" && key.nil?
    key_name = "#{ENV['HOME']}/Projects/vistacore/.vagrant.d/insecure_private_key"
  else 
    key_name = File.expand_path(key, "#{ENV['HOME']}/Projects/vistacore/.chef/keys")
  end
end
