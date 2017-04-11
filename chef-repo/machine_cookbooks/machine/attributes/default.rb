#
# Cookbook Name:: machine
# Atrributes:: default
#

default[:machine][:release_version] = "master"

# These default attributes are set to the values of optional environment variables environment variables
default[:machine][:stack] = ENV["PRODUCTION_DATA_BAG"] || ENV["JOB_NAME"] || ENV["USER"].gsub("_", "-") rescue ""
default[:machine][:environment] = ENV["ENVIRONMENT"] || node.environment
default[:machine][:name] = ENV["MACHINE_NAME"] || "all-machines"
default[:machine][:driver] = ENV["DRIVER"] || "vagrant"
default[:machine][:action] = ENV["ACTION"] || "converge"
default[:machine][:batch_action] = "converge_only"
default[:machine][:allow_web_access] = ENV['ALLOW_WEB_ACCESS'] || ENV['ALLOW_EXTERNAL_SOURCES'] || false
default[:machine][:cache_upload] = ENV['CACHE_UPLOAD'] || false

# These convergence options apply to all machines and control how chef sets up an instance before converging
default[:machine][:convergence_options] = {
  chef_config: "diff_disabled true\n",
  chef_version: "12.3.0"
}
default[:machine][:copy_files] = {
  "/etc/chef/host_key.pem" => ::Chef::Config.client_key
}

# These are base box comfigurations for aws and vagrant
default[:machine][:image_id] = "ami-2f5f134a"
default[:machine][:box_name] = "opscode-centos-6.5"
default[:machine][:box_url] = "#{node[:common][:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/program/opscode/centos/6.5/centos-6.5-provisionerless.box"

# These are production settings used by the ssh provivisioner
# This is set to an empty hash because it will be overwritten by 
# either the default recipe in this cookbook or the 'boot' lwrp
default[:machine][:production_settings] = {}
