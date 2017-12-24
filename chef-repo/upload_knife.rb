current_dir = File.dirname(__FILE__)
log_level                :info
log_location             STDOUT
node_name                "jenkins"
client_key               "#{ENV['HOST_KEY_PATH']}"
chef_server_url          "https://pantry.vistacore.us/organizations/vistacore"
ssl_verify_mode          :verify_none
cache_type               'BasicFile'
cache_options( :path => "#{ENV['HOME']}/chef-repo/.chef/checksums" )
workspace = ENV["WORKSPACE"] || "#{ENV["HOME"]}/workspace/#{ENV["JOB_NAME"]}"
cookbook_path [
  "#{workspace}/cookbooks",
]
