#
# Cookbook Name:: adk
#

default[:adk][:filename] = "adk.tgz"
default[:adk][:artifact_path] = "#{Chef::Config['file_cache_path']}/#{node[:adk][:filename]}"
default[:adk][:source] = "#{node[:nexus_url]}/nexus/service/local/artifact/maven/redirect?r=releases&g=us.vistacore.adk&a=adk&v=LATEST&e=tgz"
default[:adk][:port] = "80"
default[:adk][:dir] = "adk"
default[:adk][:apache_cache] = false
default[:adk][:home_dir] = "/var/www/#{node[:adk][:dir]}"
default[:adk][:resourcedirectory] = nil
default[:adk][:synced] = false 
default[:adk][:demo] = false
default[:adk][:deployment_type] = nil
default[:adk][:install_method] = nil
default[:adk][:aws][:tag_name] = "adk"
default[:adk][:aws][:elastic_ip] = nil
