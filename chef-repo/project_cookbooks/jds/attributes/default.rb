default[:jds][:cache_version] = "2017.1.1.111.0"
default[:jds][:cache_install_version] = "2017.1.1.111.0"
default[:jds][:cache_arch] = "lnxrhx64"
default[:jds][:cache_source] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/intersystems/cache/#{node[:jds][:cache_version]}/cache-#{node[:jds][:cache_version]}-#{node[:jds][:cache_arch]}.tar.gz"
default[:jds][:security_domain] = "#{node[:hostname]}"

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
default[:jds][:jds_data][:get_ehmpusers_from_vistas] = false

default[:jds][:clear_jds_journal] = true

default[:jds][:vvmax] = {
	:decoder => 100,
	:encoder => 100
}

default[:jds][:jds_data_stores] = {
	:vxsyncerr => {
		:index => {
			:'vxsyncerr-jobType-classification-severity' => {
				:message => {
					:indexName => "vxsyncerr-jobType-classification-severity",
	        		:fields => "jobType/s/\"\", classification, severity",
				:sort => "jobType asc, classification asc, severity asc",
	        		:type => "attr"
				}
			},
			:'vxsyncerr-patientIdentifierValue' => {
				:message => {
					:indexName => "vxsyncerr-patientIdentifierValue",
	        		:fields => "patientIdentifierValue",
				:sort => "patientIdentifierValue asc",
	        		:type => "attr"
				}
			},
			:'vxsyncerr-timestamp' => {
				:message => {
					:indexName => "vxsyncerr-timestamp",
	        		:fields => "timestamp",
				:sort => "timestamp asc",
	        		:type => "attr"
				}
			}
		}
	}
}

default[:jds][:pjds_data_stores] = {
	:pidmeta => {},
	:commreq => {},
	:clinicobj => {
		:index => {
			:'clinicobj-referenceId' => {
				:message => {
					:indexName => "clinicobj-referenceId",
					:fields => "referenceId",
					:sort => "referenceId asc",
					:type => "attr"
				}
			}
		}
	},
	:ordersets => {},
	:quickorder => {},
	:orderfavs => {},
	:activeusr => {},
	:ehmpusers => {
		:populate_store => true,
		:populate_params => {
			:identifier_field => "uid",
			:check_for_field => "createdBy",
			:action => "put",
			:allow_overwrite => true
		}
	},
	:entordrbls => {
		:clear_store => true,
		:populate_store => true,
		:populate_params => {
			:identifier_field => "name",
			:check_for_field => "items",
			:action => "put",
			:allow_overwrite => true
		}
	},
	:permission => {
		:populate_store => true,
		:populate_params => {
			:identifier_field => "uid",
			:check_for_field => "description",
			:action => "put",
			:allow_overwrite => true
		}
	},
	:permset => {
		:populate_store => true,
		:populate_params => {
			:identifier_field => "uid",
			:check_for_field => "label",
			:action => "put",
			:allow_overwrite => true
		}
	},
	:featperms => {
		:populate_store => true,
		:populate_params => {
			:identifier_field => "uid",
			:check_for_field => "label",
			:action => "put",
			:allow_overwrite => true
		}
	},
	:teamlist => {
		:clear_store => true,
		:populate_store => true,
		:populate_params => {
			:identifier_field => "facility",
			:check_for_field => "items",
			:action => "post",
			:allow_overwrite => true
		}
	},
	:trustsys => {
		:populate_store => true,
		:populate_params => {
			:identifier_field => "uid",
			:check_for_field => "name",
			:action => "put",
			:allow_overwrite => true
		}
	},
	:osynclinic => {
		:index => {
			:'osynclinic-site' => {
				:message => {
					:indexName => "osynclinic-site",
					:fields => "site",
					:sort => "site asc",
					:type => "attr"
				}
			}
		}
	},
	:osyncblist => {
		:index => {
			:'osyncblist-user' => {
				:message => {
					:indexName => "osyncblist-user",
					:fields => "site, uid",
					:sort => "site asc, uid asc",
					:type => "attr",
					:setif => "$$OSYNCUSER^VPRJFPS"
				}
			},
			:'osyncblist-patient' => {
				:message => {
					:indexName => "osyncblist-patient",
					:fields => "site, uid",
					:sort => "site asc, uid asc",
					:type => "attr",
					:setif => "$$OSYNCPAT^VPRJFPS"
				}
			}
		}
	},
	:prefetch => {
		:index => {
			:'ehmp-patients' => {
				:message => {
					:indexName => "ehmp-patients",
					:fields => "sourceDate, isEhmpPatient",
					:sort => "sourceDate asc, isEhmpPatient asc",
					:type => "attr"
				}
			},
			:'ehmp-source' => {
				:message => {
					:indexName => "ehmp-source",
					:fields => "source, sourceDate, facility/s/\"\"",
					:sort => "source asc, sourceDate asc, facility asc",
					:type => "attr"
				}
			}
		},
		:template => {
			:minimal => {
				:message => {
					:name => "minimal",
					:directives => "include, applyOnSave",
					:fields => "patientIdentifier, isEhmpPatient"
		    	}
			}
		}
	}
}

default[:jds][:ecp][:ordinality] = 1
default[:jds][:ecp][:servers] = 1
default[:jds][:ecp][:shards] = 224
default[:jds][:ecp][:shards_per_server] = 224

default[:jds][:ecp][:max_servers] = 254
default[:jds][:ecp][:max_servers_conn] = 254
default[:jds][:ecp][:globals8kb] = 16384
default[:jds][:ecp][:gmheap] = 2097152
default[:jds][:ecp][:locksiz] = 16384000
default[:jds][:ecp][:routines] = 1023
default[:jds][:ecp][:default_port] = 1972
default[:jds][:ecp][:db_size] = 200
default[:jds][:ecp][:expansion_size] = 0
