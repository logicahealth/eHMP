#
# Cookbook Name:: vxsync
# Recipe:: default
#

# SOAP Handler Configuration
default[:soap_handler][:filename] = 'soap_handler.jar'
default[:soap_handler][:artifact_path] = "#{Chef::Config['file_cache_path']}/#{node[:soap_handler][:filename]}"
default[:soap_handler][:home_dir] = '/opt/soap_handler'
default[:soap_handler][:service_name] = 'soap_handler'
default[:soap_handler][:config_file] = "#{node[:soap_handler][:home_dir]}/config.json"
default[:soap_handler][:server_port] = "5400"
default[:soap_handler][:admin_port] = "5401"
default[:soap_handler][:idle_timeout] = "90s"         # Value must be >= TCP keep-alive interval which for Linux is 75 seconds
default[:soap_handler][:idle_thread_timeout] = "60s"  # Increase as needed to account for long-running backend requests that leave the thread idle

default[:soap_handler][:security][:trust_store] = nil
default[:soap_handler][:security][:trust_store_pw] = nil
default[:soap_handler][:security][:key_store] = nil
default[:soap_handler][:security][:key_store_pw] = nil

default[:soap_handler][:log_level] = "INFO"
default[:soap_handler][:console_log_level] = "WARN"
default[:soap_handler][:request_log_level] = "INFO"

default[:soap_handler][:user] = 'dropwizard'
default[:soap_handler][:group] = 'dropwizard'
default[:soap_handler][:soap_handler_log_dir] = "/var/log/soap_handler"
default[:soap_handler][:bluepill_log_dir] = "#{node[:soap_handler][:soap_handler_log_dir]}/bluepill"
