#
# Cookbook Name:: ehmp_provision
# Attributes:: artifacts
#

default[:ehmp_provision][:artifacts] = {
	:jds => {
		:repo => "releases",
  	:group => "us.vistacore.ehmp",
  	:artifact => "jds",
  	:extension => "ro",
  	:version => ENV['JDS_VERSION'],
  	:release => true
  },
  :jds_data => {
  	:repo => "releases",
  	:group => "us.vistacore.ehmp",
  	:artifact => "jds_data",
  	:extension => "zip",
  	:version => ENV['JDS_DATA_VERSION'],
  	:release => true
  },
	:health_time_core => {
		:repo => "releases",
		:group => "us.vistacore.ehmp",
  	:artifact => "health-time-core",
  	:extension => "jar",
  	:version => ENV['HEALTH_TIME_CORE_VERSION'],
  	:release => true
	},
	:health_time_solr => {
		:repo => "releases",
		:group => "us.vistacore.ehmp",
  	:artifact => "health-time-solr",
  	:extension => "jar",
  	:version => ENV['HEALTH_TIME_SOLR_VERSION'],
  	:release => true
	},
	:vpr => {
		:repo => "releases",
		:group => "us.vistacore.ehmp",
  	:artifact => "vpr",
  	:extension => "tar",
  	:version => ENV['VPR_VERSION'],
  	:release => true
	},
	:nodemockservices => {
		:repo => "releases",
		:group => "us.vistacore.ehmp",
  	:artifact => "NodeMockServices",
  	:extension => "zip",
  	:version => ENV["NODEMOCKSERVICES_VERSION"],
  	:release => true
	},
	:kodak_hmp => {
		:repo => "releases",
		:group => "us.vistacore.ehmp",
  	:artifact => "hmp",
  	:extension => "zip",
  	:version => ENV["KODAK_HMP_VERSION"] || ENV["HMP_VERSION"],
  	:release => true
	},
  :panorama_hmp => {
    :repo => "releases",
    :group => "us.vistacore.ehmp",
    :artifact => "hmp",
    :extension => "zip",
    :version => ENV["PANORAMA_HMP_VERSION"] || ENV["HMP_VERSION"],
    :release => true
  },
	:kodak_cache => {
		:repo => "releases",
		:group => "us.vistacore",
  	:artifact => "vista",
  	:extension => "zip",
  	:version => ENV["KODAK_CACHE_VERSION"] || ENV["CACHE_VERSION"],
  	:release => true
	},
	:panorama_cache => {
		:repo => "releases",
		:group => "us.vistacore",
  	:artifact => "vista",
  	:extension => "zip",
  	:version => ENV["PANORAMA_CACHE_VERSION"] || ENV["CACHE_VERSION"],
  	:release => (ENV["PANORAMA_CACHE_VERSION"] || ENV["CACHE_VERSION"]) != (ENV["KODAK_CACHE_VERSION"] || ENV["CACHE_VERSION"])
	},
	:vxsync => {
		:repo => "releases",
		:group => "us.vistacore.ehmp",
  	:artifact => "vx-sync",
  	:extension => "zip",
  	:version => ENV['VX_SYNC_VERSION'],
  	:release => true
	},
	:asu => {
		:repo => "releases",
		:group => "us.vistacore.ehmp",
  	:artifact => "asu",
  	:extension => "zip",
  	:version => ENV['ASU_VERSION'],
  	:release => true
	},
	:soap_handler => {
		:repo => "releases",
		:group => "us.vistacore.ehmp",
  	:artifact => "soap-handler",
  	:extension => "jar",
  	:version => ENV["SOAP_HANDLER_VERSION"],
  	:release => true
	},
  :correlated_ids => {
    :repo => "releases",
    :group => "us.vistacore.ehmp",
    :artifact => "correlated_ids",
    :extension => "json",
    :version => ENV["CORRELATED_IDS_VERSION"],
    :release => true
  },
  :crs => {
    :repo => "releases",
    :group => "us.vistacore.ehmp",
    :artifact => "crs",
    :extension => "tgz",
    :version => ENV["CRS_VERSION"],
  },
  :mockssoiservlet => {
    :repo => "releases",
    :group => "us.vistacore.ehmp",
    :artifact => "mockssoiservlet",
    :extension => "war",
    :version => ENV["MOCKSSOISERVLET_VERSION"],
    :release => true
  },
  :mocktokengenerator => {
    :repo => "releases",
    :group => "us.vistacore.ehmp",
    :artifact => "mocktokengenerator",
    :extension => "war",
    :version => ENV["MOCKTOKENGENERATOR_VERSION"],
    :release => true
  },
  :mockssoi_users => {
    :repo => "releases",
    :group => "us.vistacore.ehmp",
    :artifact => "mockssoi-users",
    :extension => "json",
    :version => ENV["MOCKSSOI_USERS_VERSION"],
    :release => true
  }
}
