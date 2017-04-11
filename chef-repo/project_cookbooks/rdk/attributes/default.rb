#
# Cookbook Name:: rdk
# Recipe:: default
#

default[:rdk][:protocol] = "http"
default[:rdk][:source] = nil
default[:rdk][:ccow_service] = "ccow"
default[:rdk][:home_dir] = '/opt/rdk'
default[:rdk][:ccow_dir] = '/opt/ccow'
default[:rdk][:config][:xml_path] = "#{node[:rdk][:home_dir]}/src/resources/patient-search/xml/"
default[:rdk][:log_dir] = "/var/rdk/logs"
default[:rdk][:config][:processing_code] = 'T'

default[:rdk][:audit_log_path] = "#{node[:rdk][:log_dir]}/audit.log"
default[:rdk][:audit_host] = "172.16.4.105"
default[:rdk][:audit_port] = "9200"

default[:rdk][:complex_note_port] = "8080"

default[:rdk][:node_dev_home]= "/usr/local/bin/"

default[:rdk][:fetch_server][:processes] = 1
default[:rdk][:fetch_server][:service] = "fetch_server"
default[:rdk][:fetch_server][:port] = 8888
default[:rdk][:fetch_server][:deploy_path] = "bin/rdk-fetch-server.js"
default[:rdk][:fetch_server][:config_file] = "#{node[:rdk][:home_dir]}/config/rdk-fetch-server-config"
default[:rdk][:fetch_server][:debug_port] = 5858
default[:rdk][:write_dir] = "#{node[:rdk][:home_dir]}/src/write"
default[:rdk][:write_back][:processes] = 1
default[:rdk][:write_back][:service] = "write_back"
default[:rdk][:write_back][:port] = 9999
default[:rdk][:write_back][:deploy_path] = "bin/rdk-write-server.js"
default[:rdk][:write_back][:config_file] = "#{node[:rdk][:home_dir]}/config/rdk-write-server-config"
default[:rdk][:write_back][:debug_port] = 5868
default[:rdk][:pick_list][:processes] = 1
default[:rdk][:pick_list][:service] = "pick_list"
default[:rdk][:pick_list][:port] = 7777
default[:rdk][:pick_list][:deploy_path] = "bin/rdk-pick-list-server.js"
default[:rdk][:pick_list][:config_file] = "#{node[:rdk][:home_dir]}/config/rdk-pick-list-server-config"
default[:rdk][:pick_list][:debug_port] = 5878

default[:rdk][:oracledb_module][:version] = "1.4.0"
