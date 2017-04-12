current_dir = File.dirname(__FILE__)
log_level                :info
log_location             STDOUT
node_name                "deploy"
client_key               "#{current_dir}/deploy.pem"
chef_server_url          "https://pantry.vistacore.us/organizations/vistacore"
ssl_verify_mode          :verify_none 
cache_type               'BasicFile'
cache_options( :path => "#{ENV['HOME']}/chef-repo/.chef/checksums" )
local_mode true
cookbook_path           [
  "#{ENV["HOME"]}/Projects/vistacore/chef-repo/project_cookbooks",
  "#{ENV["HOME"]}/Projects/vistacore/chef-repo/wrapper_cookbooks",
  "#{ENV["HOME"]}/Projects/vistacore/chef-repo/third_party_cookbooks",
  "#{ENV["HOME"]}/Projects/vistacore/chef-repo/machine_cookbooks"
]
