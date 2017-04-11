default[:jds][:cache_service] = "cache"
default[:jds][:cache_package] = "cache-server"
default[:jds][:cache_arch] = "x86_64"
default[:jds][:cache_version] = "2014.1.3.775.0"
#default[:jds][:cache_arch] = "lnxrhx64"
# default[:jds][:cache_source] = "#{node[:nexus_url]}/nexus/service/local/artifact/maven/redirect?r=ehmp&g=filerepo.third-party.project.intersystems&a=cache&v=#{node[:jds][:cache_version]}&c=#{node[:jds][:cache_arch]}&e=tar.gz"
#default[:jds][:cache_source] = "file:///opt/private_licenses/cache_server/cache-" + node[:jds][:cache_version] + "-" + node[:jds][:cache_arch] + ".tar.gz"
default[:jds][:cache_source] = "/opt/private_licenses/cache_server/" + node[:jds][:cache_package] + "-" + node[:jds][:cache_version] + "-1.rh." + node[:jds][:cache_arch] + ".rpm"
default[:jds][:build_jds] = false

default[:jds][:session]  =                 "csession cache"
default[:jds][:shell_timeout_seconds] =    20
default[:jds][:prompt] =           "VISTA>"
default[:jds][:namespace] =        "VISTA"
default[:jds][:rpc_port] = 9210

default[:jds][:cache_user] =   "cacheserver"
default[:jds][:cache_dir] =    "/usr/cachesys"
default[:jds][:cache_mgr_dir] =    "/usr/cachesys/mgr"
default[:jds][:vista_dir] =    "/usr/cachesys/mgr/VISTA"
default[:jds][:installer_dir] = "#{Chef::Config[:file_cache_path]}/cache"

default[:jds][:cache_parameter] = {
  'ISC_PACKAGE_INSTANCENAME'=>"#{node[:jds][:cache_service]}",
  'ISC_PACKAGE_INSTALLDIR'=>"#{node[:jds][:cache_dir]}",
  'ISC_PACKAGE_CACHEUSER'=>"#{node[:jds][:cache_user]}",
  'ISC_PACKAGE_CACHEGROUP'=>"#{node[:jds][:cache_user]}"
}

default[:jds][:cache_license_data_bag] = "cache_license"
default[:jds][:cache_license_item] = "license"

default[:jds][:cache_key_file] =     "key1"
default[:jds][:cache_key_user] =  "UNKNOWNUSER"
default[:jds][:cache_key_pw] =  "cache"
default[:jds][:cache_key] =  ""
default[:jds][:cache_key_identifier] =  "FB925728-1114-11E4-956B-00274DB37D00"

default[:jds][:chef_log] =     STDOUT

default[:jds][:cache_namespace] =        "JSONVPR"
default[:jds][:cache_jsonvpr_dir] =    "/usr/cachesys/vista/jsonvpr"
default[:jds][:cache_jsonvpr_vista_dir] =    "/usr/cachesys/vista"
default[:jds][:cache_listener_ports][:general] = 9080
default[:jds][:cache_listener_ports][:vxsync] = 9082

default[:jds][:httpd_user] = "root"
default[:jds][:trace_enable] = "off"

default[:jds][:cache_jsonvpr_ecryptfs] = false

default[:jds][:cron_dir] = "/etc/cron.d"
default[:jds][:vista_version] = "2015.01.08"
default[:jds][:mgr_version] = "2013.12.02"

default[:jds][:source] = nil

default[:jds][:jds_data][:artifact_name] = "jds_data"
default[:jds][:jds_data][:dir] = "/tmp/jds_data"
default[:jds][:jds_data][:source] = nil

default[:jds][:data_store][:ehmpusers] = "ehmpusers"
default[:jds][:data_store][:permission] = "permission"
default[:jds][:data_store][:permset] = "permset"
default[:jds][:data_store][:teamlist] = "teamlist"
default[:jds][:data_store][:trustsys] = "trustsys"
default[:jds][:data_store][:pidmeta] = "pidmeta"
default[:jds][:data_store][:commreq] = "commreq"
default[:jds][:data_store][:clinicobj] = "clinicobj"
default[:jds][:data_store][:ordersets] = "ordersets"
default[:jds][:data_store][:quickorders] = "quickorder"
default[:jds][:data_store][:orderfavorites] = "orderfavs"
