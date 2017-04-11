#
# Cookbook Name:: ehmp_provision
# Attributes:: artifacts
#

default[:ehmp_provision][:artifacts] = {
	:jds => {
		:repo => "ehmp",
  	:group => "releases.us.vistacore.ehmp",
  	:artifact => "jds",
  	:extension => "ro",
  	:version => ENV['JDS_VERSION'],
  	:release => true
  },
  :jds_data => {
  	:repo => "ehmp",
  	:group => "releases.us.vistacore.ehmp",
  	:artifact => "jds_data",
  	:extension => "zip",
  	:version => ENV['JDS_DATA_VERSION'],
  	:release => true
  },
	:health_time_core => {
		:repo => "ehmp",
		:group => "releases.us.vistacore.ehmp",
  	:artifact => "health-time-core",
  	:extension => "jar",
  	:version => ENV['HEALTH_TIME_CORE_VERSION'],
  	:release => true
	},
	:health_time_solr => {
		:repo => "ehmp",
		:group => "releases.us.vistacore.ehmp",
  	:artifact => "health-time-solr",
  	:extension => "jar",
  	:version => ENV['HEALTH_TIME_SOLR_VERSION'],
  	:release => true
	},
	:vpr => {
		:repo => "ehmp",
		:group => "releases.us.vistacore.ehmp",
  	:artifact => "vpr",
  	:extension => "tar",
  	:version => ENV['VPR_VERSION'],
  	:release => true
	},
	:nodemockservices => {
		:repo => "ehmp",
		:group => "releases.us.vistacore.ehmp",
  	:artifact => "NodeMockServices",
  	:extension => "zip",
  	:version => ENV["NODEMOCKSERVICES_VERSION"],
  	:release => true
	},
	:hmp => {
		:repo => "ehmp",
		:group => "releases.us.vistacore.ehmp",
  	:artifact => "hmp",
  	:extension => "zip",
  	:version => ENV["HMP_VERSION"],
  	:release => true
	},
	:kodak_cache => {
		:repo => "ehmp",
		:group => "releases.us.vistacore",
  	:artifact => "vista",
  	:extension => "zip",
  	:version => ENV["KODAK_CACHE_VERSION"] || ENV["CACHE_VERSION"],
  	:release => true
	},
	:panorama_cache => {
		:repo => "ehmp",
		:group => "releases.us.vistacore",
  	:artifact => "vista",
  	:extension => "zip",
  	:version => ENV["PANORAMA_CACHE_VERSION"] || ENV["CACHE_VERSION"],
  	:release => (ENV["PANORAMA_CACHE_VERSION"] || ENV["CACHE_VERSION"]) != (ENV["KODAK_CACHE_VERSION"] || ENV["CACHE_VERSION"])
	},
	:vxsync => {
		:repo => "ehmp",
		:group => "releases.us.vistacore.ehmp",
  	:artifact => "vx-sync",
  	:extension => "zip",
  	:version => ENV['VX_SYNC_VERSION'],
  	:release => true
	},
	:asu => {
		:repo => "ehmp",
		:group => "releases.us.vistacore.ehmp",
  	:artifact => "asu",
  	:extension => "zip",
  	:version => ENV['ASU_VERSION'],
  	:release => true
	},
	:soap_handler => {
		:repo => "ehmp",
		:group => "releases.us.vistacore.ehmp",
  	:artifact => "soap-handler",
  	:extension => "jar",
  	:version => ENV["SOAP_HANDLER_VERSION"],
  	:release => true
	},
  :correlated_ids => {
    :repo => "ehmp",
    :group => "releases.us.vistacore.ehmp",
    :artifact => "correlated_ids",
    :extension => "json",
    :version => ENV["CORRELATED_IDS_VERSION"],
    :release => true
  }
}
