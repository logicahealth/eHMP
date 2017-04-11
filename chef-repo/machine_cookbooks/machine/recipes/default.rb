#
# Cookbook Name:: machine
# Recipe:: default
#

if node[:machine][:driver] == "vagrant" && node[:machine][:release_version].to_s != ""
  node.default[:machine][:stack] = node[:machine][:stack].to_s + "-#{node[:machine][:release_version].to_s}"
end

require_relative "ssh_aws_chef_install" if node[:machine][:driver] == "aws" || node[:machine][:driver] == "ssh"

#Load Nexus URL from common cookbook
include_recipe "common::load_nexus_url"
include_recipe "common::load_string"

node.default[:machine][:convergence_options] = {} if node.default[:machine][:convergence_options].nil?
node.default[:machine][:convergence_options].merge! ({
  install_sh_url: "#{node[:common][:nexus_url]}/nexus/content/repositories/environment/vistacore/chef-install/install/1.0.3/install-1.0.3.sh",
  install_sh_path: "/etc/chef/install.sh"
})

if ENV.has_key?("PRODUCTION_DATA_BAG")
  node.default[:machine][:production_settings].merge! (
    Chef::EncryptedDataBagItem.load("production_settings", ENV['PRODUCTION_DATA_BAG'], node[:common][:data_bag_string]).to_hash
)
end
if ENV.has_key?("CERT_PATH")
  node.default[:machine][:copy_files].merge! (
    {
      "/etc/chef/trusted_certs/chef_server.crt" => "#{ENV['CERT_PATH']}"
    }
  )
end
if ENV.has_key?("CACHE_UPLOAD")
  node.normal[:machine][:allow_web_access] = true
  node.normal[:machine][:cache_upload] = true
end
