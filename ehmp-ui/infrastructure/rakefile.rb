#
# Rakefile for updating the nodes in production-staging environment deploys
#

require 'json'
require 'deep_merge'

desc "update data bag nodes for production-staging"
task :update_data_bag_nodes, :stack, :data_bag do |t, args|
  stack = args[:stack]
  data_bag = args[:data_bag].gsub(".", "-")
  update_data_bag_with_mocks(stack, data_bag)
  update_data_bag_with_vistas(stack, data_bag)
end

###########################################################################################
# Call all methods to update the data bag items
###########################################################################################

def update_data_bag_with_mocks(stack, data_bag)
  knife_download_node("mocks", stack)
  mocks_node = JSON.parse(IO.read("nodes/mocks-#{stack}.json")).to_hash
  update_hdr(mocks_node, data_bag)
  update_vler(mocks_node, data_bag)
  update_pgd(mocks_node, data_bag)
  update_vhic(mocks_node, data_bag)
  update_mvi(mocks_node, data_bag)
  update_jmeadows(mocks_node, data_bag)
end

def update_data_bag_with_vistas(stack, data_bag)
  knife_download_node("vista-kodak", stack)
  knife_download_node("vista-panorama", stack)
  vista_kodak_node = JSON.parse(IO.read("nodes/vista-kodak-#{stack}.json")).to_hash 
  vista_panorama_node = JSON.parse(IO.read("nodes/vista-panorama-#{stack}.json")).to_hash 
  update_vista(vista_kodak_node, data_bag)
  update_vista(vista_panorama_node, data_bag)
end

###########################################################################################
# Update Data bag items
###########################################################################################

def update_hdr(node, data_bag)
  mocks_node = merge_attributes(node)
  hdr_sites = []
  mocks_node["attributes"]["hdr"]["hdr_sites"].each { |hdr_site|
    knife_download_data_bag_item(data_bag, "hdr_#{hdr_site['site_id']}")
    hdr_data_bag_node = JSON.parse(File.read("data_bags/#{data_bag}/hdr_#{hdr_site['site_id']}.json")).to_hash
    hdr_data_bag_node["id"] = "hdr_#{hdr_site['site_id']}"
    hdr_data_bag_node["normal"]["ipaddress"] = mocks_node["attributes"]["ipaddress"]
    hdr_data_bag_node["normal"]["stack"] = data_bag
    hdr_data_bag_node["normal"]["hdr"]["hdr_sites"] = [
      {
        "site_id" => hdr_site["site_id"],
        "station_number" => hdr_site["station_number"]
      }
    ]
    hdr_data_bag_node["normal"]["hdr"]["pub_sub"] = {
      "port" => mocks_node["attributes"]["hdr"]["pub_sub"]["port"],
      "protocol" => mocks_node["attributes"]["hdr"]["pub_sub"]["protocol"],
      "timeout" => mocks_node["attributes"]["hdr"]["pub_sub"]["timeout"]
    }
    hdr_data_bag_node["normal"]["hdr"]["req_res"] = {
      "protocol" => mocks_node["attributes"]["hdr"]["req_res"]["protocol"]
    }
    hdr_data_bag_node["normal"]["roles"] = [
      "hdr"
    ]
    File.open("data_bags/#{data_bag}/hdr_#{hdr_site['site_id']}.json", "w") do |file|
      file.write(JSON.pretty_generate hdr_data_bag_node)
    end
    hdr_sites << "data_bags/#{data_bag}/hdr_#{hdr_site['site_id']}.json"
  }
  hdr_sites.each { |hdr_item|
    hdr_item = hdr_item.split("/")[-1]
    hdr_item.slice!(".json")
    knife_data_bag_from_file(data_bag, "data_bags/#{data_bag}/#{hdr_item}.json")
  }
  hdr_old_sites = Dir.glob("data_bags/#{data_bag}/hdr_*.json") - hdr_sites
  hdr_old_sites.each { |old_hdr_item|
    old_hdr_item = old_hdr_item.split("/")[-1]
    old_hdr_item.slice!(".json")
    knife_delete_data_bag_item(data_bag, old_hdr_item)
  }
end

def update_vista(node, data_bag)
  vista_node = merge_attributes(node)
  vista_node_name = vista_node["name"]
  vista_node_name.slice!("-#{vista_node['attributes']['stack']}")
  knife_download_data_bag_item(data_bag, vista_node_name)
  vista_data_bag_node = JSON.parse(File.read("data_bags/#{data_bag}/#{vista_node_name}.json")).to_hash
  vista_data_bag_node["id"] = vista_node_name
  vista_data_bag_node["normal"]["ipaddress"] = vista_node["attributes"]["ipaddress"]
  vista_data_bag_node["normal"]["stack"] = data_bag
  vista_data_bag_node["normal"]["vista"] = {
    "domain_name" => vista_node["attributes"]["vista"]["domain_name"],
    "site_recipe" => vista_node["attributes"]["vista"]["site_recipe"],
    "import_recipe" => vista_node["attributes"]["vista"]["import_recipe"],
    "site_id" => vista_node["attributes"]["vista"]["site_id"],
    "site" => vista_node["attributes"]["vista"]["site"],
    "station_number" => vista_node["attributes"]["vista"]["station_number"],
    "production" => vista_node["attributes"]["vista"]["production"],
    "access_code" => vista_node["attributes"]["vista"]["access_code"],
    "verify_code" => vista_node["attributes"]["vista"]["verify_code"],
    "connect_timeout" => vista_node["attributes"]["vista"]["connect_timeout"],
    "send_timeout" => vista_node["attributes"]["vista"]["send_timeout"],
    "division" => vista_node["attributes"]["vista"]["division"], 
    "rpc_port" => vista_node["attributes"]["vista"]["rpc_port"],
    "clinics_osync_appointment_request" => vista_node["attributes"]["vista"]["clinics_osync_appointment_request"],
    "ua_tracker" => vista_node["attributes"]["vista"]["ua_tracker"]
  }
  vista_data_bag_node["normal"]["roles"] = [
    vista_node_name
  ]  
  File.open("data_bags/#{data_bag}/#{vista_node_name}.json", "w") do |file|
    file.write(JSON.pretty_generate vista_data_bag_node)
  end
  knife_data_bag_from_file(data_bag, "data_bags/#{data_bag}/#{vista_node_name}.json")
end

def update_jmeadows(node, data_bag)
  name = "jmeadows"
  mocks_node = merge_attributes(node)
  knife_download_data_bag_item(data_bag, name)
  mocked_data_bag_node = JSON.parse(File.read("data_bags/#{data_bag}/#{name}.json")).to_hash
  mocked_data_bag_node["id"] = name
  mocked_data_bag_node["normal"]["ipaddress"] = mocks_node["attributes"]["ipaddress"]
  mocked_data_bag_node["normal"]["stack"] = data_bag
  mocked_data_bag_node["normal"]["roles"] = [name]
  mocked_data_bag_node["normal"]["jmeadows"] = {
    "application" => mocks_node["attributes"]["jmeadows"]["application"],
    "version" => mocks_node["attributes"]["jmeadows"]["version"]
  }
  File.open("data_bags/#{data_bag}/#{name}.json", "w") do |file|
    file.write(JSON.pretty_generate mocked_data_bag_node)
  end
  knife_data_bag_from_file(data_bag, "data_bags/#{data_bag}/#{name}.json")
end

def update_mvi(node, data_bag)
  name = "mvi"
  mocks_node = merge_attributes(node)
  knife_download_data_bag_item(data_bag, name)
  mocked_data_bag_node = JSON.parse(File.read("data_bags/#{data_bag}/#{name}.json")).to_hash
  mocked_data_bag_node["id"] = name
  mocked_data_bag_node["normal"]["ipaddress"] = mocks_node["attributes"]["ipaddress"]
  mocked_data_bag_node["normal"]["stack"] = data_bag
  mocked_data_bag_node["normal"]["roles"] = [name]
  mocked_data_bag_node["normal"]["mvi"] = {
    "sync_path" => mocks_node["attributes"]["mvi"]["sync_path"],
    "port" => mocks_node["attributes"]["mvi"]["port"],
    "protocol" => mocks_node["attributes"]["mvi"]["protocol"],
    "agent_options" => mocks_node["attributes"]["mvi"]["agent_options"]
  }
  File.open("data_bags/#{data_bag}/#{name}.json", "w") do |file|
    file.write(JSON.pretty_generate mocked_data_bag_node)
  end
  knife_data_bag_from_file(data_bag, "data_bags/#{data_bag}/#{name}.json")
end

def update_pgd(node, data_bag)
  name = "pgd"
  mocks_node = merge_attributes(node)
  knife_download_data_bag_item(data_bag, name)
  mocked_data_bag_node = JSON.parse(File.read("data_bags/#{data_bag}/#{name}.json")).to_hash
  mocked_data_bag_node["id"] = name
  mocked_data_bag_node["normal"]["ipaddress"] = mocks_node["attributes"]["ipaddress"]
  mocked_data_bag_node["normal"]["stack"] = data_bag
  mocked_data_bag_node["normal"]["roles"] = [name]
  mocked_data_bag_node["normal"]["pgd"] = {
    "protocol" => mocks_node["attributes"]["pgd"]["protocol"]
  }
  File.open("data_bags/#{data_bag}/#{name}.json", "w") do |file|
    file.write(JSON.pretty_generate mocked_data_bag_node)
  end
  knife_data_bag_from_file(data_bag, "data_bags/#{data_bag}/#{name}.json")
end

def update_vhic(node, data_bag)
  name = "vhic"
  mocks_node = merge_attributes(node)
  knife_download_data_bag_item(data_bag, name)
  mocked_data_bag_node = JSON.parse(File.read("data_bags/#{data_bag}/#{name}.json")).to_hash
  mocked_data_bag_node["id"] = name
  mocked_data_bag_node["normal"]["ipaddress"] = mocks_node["attributes"]["ipaddress"]
  mocked_data_bag_node["normal"]["stack"] = data_bag
  mocked_data_bag_node["normal"]["roles"] = [name]
  mocked_data_bag_node["normal"]["vhic"] = {
    "agent_options" => mocks_node["attributes"]["vhic"]["agent_options"]
  }
  File.open("data_bags/#{data_bag}/#{name}.json", "w") do |file|
    file.write(JSON.pretty_generate mocked_data_bag_node)
  end
  knife_data_bag_from_file(data_bag, "data_bags/#{data_bag}/#{name}.json")
end

def update_vler(node, data_bag)
  name = "vler"
  mocks_node = merge_attributes(node)
  knife_download_data_bag_item(data_bag, name)
  mocked_data_bag_node = JSON.parse(File.read("data_bags/#{data_bag}/#{name}.json")).to_hash
  mocked_data_bag_node["id"] = name
  mocked_data_bag_node["normal"]["ipaddress"] = mocks_node["attributes"]["ipaddress"]
  mocked_data_bag_node["normal"]["stack"] = data_bag
  mocked_data_bag_node["normal"]["roles"] = [name]
  mocked_data_bag_node["normal"]["vler"] = {
    "port" => mocks_node["attributes"]["vler"]["port"],
    "protocol" => mocks_node["attributes"]["vler"]["protocol"],
    "doc_query" => mocks_node["attributes"]["vler"]["doc_query"],
    "doc_retrieve" => mocks_node["attributes"]["vler"]["doc_retrieve"]
  }
  File.open("data_bags/#{data_bag}/#{name}.json", "w") do |file|
    file.write(JSON.pretty_generate mocked_data_bag_node)
  end
  knife_data_bag_from_file(data_bag, "data_bags/#{data_bag}/#{name}.json")
end

###########################################################################################
# Helper methods
###########################################################################################

def knife_data_bag_from_file(stack, item_path)
  system("/opt/chefdk/bin/knife data bag from file #{stack} #{item_path} --secret #{string()}-c #{ENV["WORKSPACE"]}/.chef/knife.rb")
end

def string()
  knife_download_data_bag("string")
  ret_string = JSON.parse(::File.read(data_path))["data_bag_key"]
end

def knife_delete_data_bag_item(stack, item)
  system("yes | /opt/chefdk/bin/knife data bag delete #{stack} #{item} -c #{ENV["WORKSPACE"]}/.chef/knife.rb")
end

def knife_download_data_bag(stack)
  system("/opt/chefdk/bin/knife download data_bags/#{stack} -c #{ENV["WORKSPACE"]}/.chef/knife.rb")
end

def knife_download_data_bag_item(stack, item)
  Dir.mkdir "data_bags" unless Dir.exists? "data_bags"
  Dir.mkdir "data_bags/#{stack}" unless Dir.exists? "data_bags/#{stack}"
  system("/opt/chefdk/bin/knife data bag show #{stack} #{item} -F json > data_bags/#{stack}/#{item}.json -c #{ENV["WORKSPACE"]}/.chef/knife.rb")
end

def knife_download_node(machine, stack)
  Dir.mkdir "nodes" unless Dir.exists? "nodes"
  system("/opt/chefdk/bin/knife node show #{machine}-#{stack} -l -F json > nodes/#{machine}-#{stack}.json -c #{ENV["WORKSPACE"]}/.chef/knife.rb")
end

def merge_attributes(node)
  attributes = ["automatic", "default", "normal", "override"]
  node["attributes"] = {}
  attributes.each { |attrs|
    node["attributes"].deep_merge!(node[attrs]) unless node[attrs].nil?
  }
  return node
end
