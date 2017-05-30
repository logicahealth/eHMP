default[:jds][:cache_version] = "2014.1.3.775.14809"
default[:jds][:cache_install_version] = "2014.1.3.775.0.14809"
default[:jds][:cache_arch] = "lnxrhx64"
default[:jds][:cache_source] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/intersystems/cache/#{node[:jds][:cache_version]}/cache-#{node[:jds][:cache_version]}-#{node[:jds][:cache_arch]}.tar.gz"

default[:jds][:cache_user] = "cacheserver"
default[:jds][:cache_dir] = "/usr/cache-#{node[:jds][:cache_version]}"
default[:jds][:cache_mgr_dir] = "#{node[:jds][:cache_dir]}/mgr"
default[:jds][:installer_dir] = "#{Chef::Config[:file_cache_path]}/cache"
default[:jds][:cache_temp] = "/tmp"
default[:jds][:instance_name] = "jds"
default[:jds][:service_name] = "cache_jds_#{node[:jds][:cache_version]}"
default[:jds][:cache_install_type] = "Normal"

default[:jds][:install_user] = node[:jds][:cache_user]
default[:jds][:shell] = "sudo -H -u #{node[:jds][:install_user]} sh"
default[:jds][:shell_prompt] = /sh-[0-9\.]+/
default[:jds][:session] = "csession #{node[:jds][:instance_name]}"
default[:jds][:shell_timeout_seconds] = 20
default[:jds][:cache_namespace] = "JSONVPR"
default[:jds][:prompt] = "#{node[:jds][:cache_namespace]}>"
default[:jds][:user_password] = nil
default[:jds][:csp_password] = nil
default[:jds][:default_admin_user] = "admin"

default[:jds][:cache_license_data_bag] = "cache_license"
default[:jds][:cache_license_item] = "license"

default[:jds][:cache_key_file] = "key1"
default[:jds][:cache_key_user] = "UNKNOWNUSER"
default[:jds][:cache_key_pw] = "cache"
default[:jds][:cache_key] = ""
default[:jds][:cache_key_identifier] = "FB925728-1114-11E4-956B-00274DB37D00"

default[:jds][:chef_log] = STDOUT

default[:jds][:jds_database_location] = "/usr/cachesys/vista/jsonvpr"
default[:jds][:cache_listener_ports][:general] = 9080
default[:jds][:cache_listener_ports][:vxsync] = 9082

default[:jds][:httpd_user] = "root"
default[:jds][:trace_enable] = "off"

default[:jds][:cache_jsonvpr_ecryptfs] = false

default[:jds][:cron_dir] = "/etc/cron.d"
default[:jds][:mgr_version] = "2013.12.02"

default[:jds][:source] = nil

default[:jds][:config][:trackSolrStorage] = true
default[:jds][:config][:solrStorageExceptions] = ["auxiliary", "diagnosis", "education", "exam", "factor", "obs", "patient", "roadtrip", "skin", "task", "treatment"]

default[:jds][:jds_data][:artifact_name] = "jds_data"
default[:jds][:jds_data][:dir] = "/tmp/jds_data"
default[:jds][:jds_data][:source] = nil

default[:jds][:data_store][:ehmpusers] = "ehmpusers"
default[:jds][:data_store][:entordrbls] = "entordrbls"
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
default[:jds][:data_store][:entordrbls] = "entordrbls"
default[:jds][:data_store][:activeusr] = "activeusr"
default[:jds][:data_store][:osynclinic] = "osynclinic"
default[:jds][:data_store][:osyncblist] = "osyncblist"
default[:jds][:data_store][:prefetch] = "prefetch"

default[:jds][:jds_data][:data_bag][:ehmp_users] = nil
default[:jds][:jds_data][:data_bag][:permission] = nil
default[:jds][:jds_data][:data_bag][:permset] = nil
default[:jds][:jds_data][:data_bag][:teamlist] = nil
default[:jds][:jds_data][:data_bag][:teamsys] = nil
default[:jds][:jds_data][:data_bag][:entordrbls] = nil
default[:jds][:jds_data][:data_bag][:activeusr] = nil
default[:jds][:jds_data][:data_bag][:osynclinic] = nil
default[:jds][:jds_data][:data_bag][:osyncblist] = nil
default[:jds][:jds_data][:data_bag][:prefetch] = nil

if node[:jds][:jds_data][:dev_pjds]
	default[:jds][:jds_data][:use_artifact][:entordrbls] = true
	default[:jds][:jds_data][:use_artifact][:ehmpusers] = true
	default[:jds][:jds_data][:use_artifact][:permset] = true
	default[:jds][:jds_data][:use_artifact][:permission] = true
	default[:jds][:jds_data][:use_artifact][:teamlist] = true
	default[:jds][:jds_data][:use_artifact][:trustsys] = true
    default[:jds][:jds_data][:use_artifact][:osynclinic] = false
	default[:jds][:jds_data][:use_artifact][:osyncblist] = false
	default[:jds][:jds_data][:use_artifact][:activeusr] = false
	default[:jds][:jds_data][:use_artifact][:prefetch] = false
	default[:jds][:jds_data][:delete_stores] = true
else
	default[:jds][:jds_data][:use_artifact][:entordrbls] = true
	default[:jds][:jds_data][:use_artifact][:ehmpusers] = false
	default[:jds][:jds_data][:use_artifact][:permset] = true
	default[:jds][:jds_data][:use_artifact][:permission] = true
	default[:jds][:jds_data][:use_artifact][:teamlist] = false
	default[:jds][:jds_data][:use_artifact][:trustsys] = true
    default[:jds][:jds_data][:use_artifact][:osynclinic] = true
	default[:jds][:jds_data][:use_artifact][:osyncblist] = true
	default[:jds][:jds_data][:use_artifact][:activeusr] = false
	default[:jds][:jds_data][:use_artifact][:prefetch] = true
	default[:jds][:jds_data][:delete_stores] = false
end

default[:jds][:clear_jds_journal] = true
default[:jds][:jds_data][:delete_permsets] = true
