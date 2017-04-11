default[:vista][:cache_service] = "cache"
default[:vista][:cache_package] = "cache-server"
default[:vista][:cache_version] = "2014.1.3.775.0-1.rh"
default[:vista][:cache_arch] = "x86_64"
default[:vista][:existing_version] = nil
default[:vista][:install_method] = "upgrade"
default[:vista][:production] = "false"

default[:vista][:hmp_path] = "#{Chef::Config[:file_cache_path]}/hmp.zip"
default[:vista][:hmp_manifest_name] = "kids-manifest.json"

default[:vista][:session]  =                 "csession cache"
default[:vista][:shell_timeout_seconds] =    20
default[:vista][:prompt] =           "VISTA>"
default[:vista][:namespace] =        "VISTA"
default[:vista][:rpc_port] = 9210

default[:vista][:cache_user] =   "cacheserver"
default[:vista][:cache_dir] =    "/usr/cachesys"
default[:vista][:cache_mgr_dir] =    "/usr/cachesys/mgr"
default[:vista][:vista_dir] =    "/usr/cachesys/mgr/VISTA"

default[:vista][:cache_license_data_bag] = "cache_license"
default[:vista][:cache_license_item] = "license"

default[:vista][:cache_key_file] =     "key1"
default[:vista][:cache_key_user] =  "UNKNOWNUSER"
default[:vista][:cache_key] =  ""
default[:vista][:cache_key_identifier] =  "FB925728-1114-11E4-956B-00274DB37D00"

default[:vista][:chef_log] = nil

default[:vista][:diedit_initial_field_regex] =   /EDIT WHICH FIELD:/
default[:vista][:diedit_next_field_regex] =  /THEN EDIT FIELD:/

default[:vista][:jds_namespace] =        "JSONVPR"
default[:vista][:jds_jsonvpr_dir] =    "/usr/cachesys/vista/jsonvpr"
default[:vista][:jds_jsonvpr_vista_dir] =    "/usr/cachesys/vista"
default[:vista][:jds_listener_ports] = [9080]

default[:fmql][:name] =  "USER,FMQL"
default[:fmql][:initial] =   "FMQL"

default[:vista][:httpd_user] = "root"
default[:vista][:trace_enable] = "off"

default[:apache][:ssl_dir] = '/etc/httpd/ssl'
default[:apache][:ssl_cert_file] = "#{node[:apache][:ssl_dir]}/server.crt"
default[:apache][:ssl_cert_key_file] = "#{node[:apache][:ssl_dir]}/server.key"

default[:vista][:jds_jsonvpr_ecryptfs] = false

default[:vista][:cron_dir] = "/etc/cron.d"
default[:vista][:vista_version] = "2015.01.08"
default[:vista][:mgr_version] = "2013.12.02"

default[:vista][:import_recipe] = "panorama"
default[:vista][:site_recipe] = "panorama"

default[:vista][:site] = nil
default[:vista][:site_id] = nil
default[:vista][:station_number] = nil
default[:vista][:access_code] = nil
default[:vista][:verify_code] = nil
default[:vista][:abbreviation] = nil

default[:vista][:connect_timeout] = 3000
default[:vista][:send_timeout] = 20000

default[:vista][:ua_tracker] = true
