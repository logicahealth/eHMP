mapping = {
  	:jds => {
  		:repo => "releases",
    	:group => "us.vistacore.ehmp",
    	:artifact => "jds",
    	:extension => "ro",
    	:version => 'JDS_VERSION',
    	:release => true
    },
    :jds_data => {
    	:repo => "releases",
    	:group => "us.vistacore.ehmp",
    	:artifact => "jds_data",
    	:extension => "zip",
    	:version => 'JDS_DATA_VERSION',
    	:release => true
    },
  	:health_time_core => {
  		:repo => "releases",
  		:group => "us.vistacore.ehmp",
    	:artifact => "health-time-core",
    	:extension => "jar",
    	:version => 'HEALTH_TIME_CORE_VERSION',
    	:release => true
  	},
  	:health_time_solr => {
  		:repo => "releases",
  		:group => "us.vistacore.ehmp",
    	:artifact => "health-time-solr",
    	:extension => "jar",
    	:version => 'HEALTH_TIME_SOLR_VERSION',
    	:release => true
  	},
  	:vpr => {
  		:repo => "releases",
  		:group => "us.vistacore.ehmp",
    	:artifact => "vpr",
    	:extension => "tar",
    	:version => 'VPR_VERSION',
    	:release => true
  	},
  	:nodemockservices => {
  		:repo => "releases",
  		:group => "us.vistacore.ehmp",
    	:artifact => "NodeMockServices",
    	:extension => "zip",
    	:version => "NODEMOCKSERVICES_VERSION",
    	:release => true
  	},
  	:kodak_hmp => {
  		:repo => "releases",
  		:group => "us.vistacore.ehmp",
    	:artifact => "hmp",
    	:extension => "zip",
    	:version => "HMP_VERSION",
    	:release => true
  	},
  	:kodak_cache => {
  		:repo => "releases",
  		:group => "us.vistacore",
    	:artifact => "vista",
    	:extension => "zip",
    	:version => "CACHE_VERSION",
    	:release => true
  	},
  	:vxsync => {
  		:repo => "releases",
  		:group => "us.vistacore.ehmp",
    	:artifact => "vx-sync",
    	:extension => "zip",
    	:version => 'VX_SYNC_VERSION',
    	:release => true
  	},
  	:asu => {
  		:repo => "releases",
  		:group => "us.vistacore.ehmp",
    	:artifact => "asu",
    	:extension => "zip",
    	:version => 'ASU_VERSION',
    	:release => true
  	},
  	:soap_handler => {
  		:repo => "releases",
  		:group => "us.vistacore.ehmp",
    	:artifact => "soap-handler",
    	:extension => "jar",
    	:version => "SOAP_HANDLER_VERSION",
    	:release => true
  	},
    :correlated_ids => {
      :repo => "releases",
      :group => "us.vistacore.ehmp",
      :artifact => "correlated_ids",
      :extension => "json",
      :version => "CORRELATED_IDS_VERSION",
      :release => true
    },
    :crs => {
      :repo => "releases",
      :group => "us.vistacore.ehmp",
      :artifact => "crs",
      :extension => "tgz",
      :version => "CRS_VERSION",
    },
    :mockssoiservlet => {
      :repo => "releases",
      :group => "us.vistacore.ehmp",
      :artifact => "mockssoiservlet",
      :extension => "war",
      :version => "MOCKSSOISERVLET_VERSION",
      :release => true
    },
    :mocktokengenerator => {
      :repo => "releases",
      :group => "us.vistacore.ehmp",
      :artifact => "mocktokengenerator",
      :extension => "war",
      :version => "MOCKTOKENGENERATOR_VERSION",
      :release => true
    },
    :mockssoi_users => {
      :repo => "releases",
      :group => "us.vistacore.ehmp",
      :artifact => "mockssoi-users",
      :extension => "json",
      :version => "MOCKSSOI_USERS_VERSION",
      :release => true
    },
  	:rdk => {
  		:repo => "releases",
    	:group => "us.vistacore.rdk",
    	:artifact => "rdk",
    	:extension => "zip",
    	:version => "RDK_VERSION",
      :release => true
    },
    :jbpm_fitlabproject => {
      :repo => "releases",
      :group => "us.vistacore.jbpm",
      :artifact => "FITLabProject",
      :extension => "jar",
      :version => "JBPM_FITLABPROJECT_VERSION",
      :release => true
    },
    :jbpm_auth => {
      :repo => "releases",
      :group => "us.vistacore.jbpm",
      :artifact => "jboss-custom-login-jar-with-dependencies",
      :extension => "jar",
      :version => "JBPM_AUTH_VERSION",
      :release => true
    },
    :jbpm_eventlisteners => {
      :repo => "releases",
      :group => "us.vistacore.jbpm",
      :artifact => "jbpm-custom-event-listeners",
      :extension => "jar",
      :version => "JBPM_LISTENER_VERSION",
      :release => true
    },
    :jbpm_cdsinvocationservice => {
      :repo => "releases",
      :group => "us.vistacore.jbpm",
      :artifact => "CDSInvocationService",
      :extension => "jar",
      :version => "JBPM_CDSINVOCATIONSERVICE_VERSION",
      :release => true
    },
    :jbpm_fobtlabservice => {
      :repo => "releases",
      :group => "us.vistacore.jbpm",
      :artifact => "FOBTLabService",
      :extension => "jar",
      :version => "JBPM_FOBTLABSERVICE_VERSION",
      :release => true
    },
    :jbpm_tasksservice => {
      :repo => "releases",
      :group => "us.vistacore.jbpm",
      :artifact => "tasksservice",
      :extension => "war",
      :version => "JBPM_TASKSSERVICE_VERSION",
      :release => true
    },
    :jbpm_general_medicine => {
      :repo => "releases",
      :group => "us.vistacore.jbpm",
      :artifact => "General_Medicine",
      :extension => "jar",
      :version => "JBPM_GENERAL_MEDICINE_VERSION",
      :release => true
    },
    :jbpm_order => {
      :repo => "releases",
      :group => "us.vistacore.jbpm",
      :artifact => "Order",
      :extension => "jar",
      :version => "JBPM_ORDER_VERSION",
      :release => true
    },
    :jbpm_activity => {
      :repo => "releases",
      :group => "us.vistacore.jbpm",
      :artifact => "Activity",
      :extension => "jar",
      :version => "JBPM_ACTIVITY_VERSION",
      :release => true
    },
    :jbpm_ehmpservices => {
      :repo => "releases",
      :group => "us.vistacore.jbpm",
      :artifact => "EhmpServices",
      :extension => "jar",
      :version => "JBPM_EHMPSERVICES_VERSION",
      :release => true
    },
    :jbpm_utils => {
      :repo => "releases",
      :group => "us.vistacore.jbpm",
      :artifact => "JbpmUtils",
      :extension => "jar",
      :version => "JBPM_UTILS_VERSION",
      :release => true
    },
    :oracle_sql_config => {
      :repo => "releases",
      :group => "us.vistacore.oracle",
      :artifact => "sql_config",
      :extension => "tgz",
      :version => "ORACLE_SQL_CONFIG_VERSION",
      :release => true
    },
    :cdsi_metrics => {
      :repo => "releases",
      :group => "us.vistacore.cdsinvocation",
      :artifact => "cdsinvocation-metrics",
      :extension => "war",
      :version => "CDSI_METRICS_VERSION",
      :release => true
    },
    :cdsi_results => {
      :repo => "releases",
      :group => "us.vistacore.cdsinvocation",
      :artifact => "cdsinvocation-results",
      :extension => "war",
      :version => "CDSI_RESULTS_VERSION",
      :release => true
    },
    :cdsdashboard => {
      :repo => "releases",
      :group => "us.vistacore.cdsdashboard",
      :artifact => "cds-dashboard",
      :extension => "war",
      :version => "CDSDASHBOARD_VERSION",
      :release => true
    },
    :opencds_knowledge_repository_data => {
      :repo => "releases",
      :group => "us.vistacore.opencds",
      :artifact => "opencds-knowledge-repository-data",
      :extension => "zip",
      :version => "OPENCDS_VERSION",
      :release => true
    },
    :cds_engine_agent => {
      :repo => "releases",
      :group => "us.vistacore.cdsinvocation",
      :artifact => "cds-engine-agent",
      :extension => "war",
      :version => "CDS_ENGINE_AGENT_VERSION",
      :release => true
    },
  	:'ehmp-ui' => {
  		:repo => "releases",
    	:group => "us.vistacore.ehmp-ui",
    	:artifact => "ehmp-ui",
    	:extension => "zip",
    	:version => "EHMPUI_VERSION",
      :release => true
    },
    :adk => {
      :repo => "releases",
      :group => "us.vistacore.adk",
      :artifact => "adk",
      :extension => "tgz",
      :version => "ADK_VERSION",
      :release => true
    },
    :jbpm_sql_config => {
      :repo => "releases",
      :group => "us.vistacore.jbpm",
      :artifact => "sql_config",
      :extension => "tgz",
      :version => "JBPM_SQL_CONFIG_VERSION",
      :release => true
    }
}

ENV['APP_VERSIONS'].split(/\n+/).each do |app_version|
  puts "\n\n\n*** Starting upload of release #{app_version}***"
  folder = File.expand_path(app_version)
  `mkdir #{folder}`

  Dir.chdir(folder) do
    `curl -s -O 'https://store.vistacore.us/nexus/service/local/repositories/releases-export/content/us/vistacore/artifact-versions-shell/#{app_version}/artifact-versions-shell-#{app_version}.sh'`

    File.readlines("artifact-versions-shell-#{app_version}.sh").each do |line|
      key, value = line.gsub("export ", "").split "="
      ENV[key] = value
    end

    ENV.each do |key,value|
      if key.end_with?("_VERSION")
        exported = false
        mapping.each { |artifact_name,coords|
          if coords[:version] == key
            puts "Curling #{artifact_name} with command: curl -s -O 'https://store.vistacore.us/nexus/service/local/repositories/releases-export/content/#{coords[:group].gsub('.','/')}/#{coords[:artifact]}/#{value.chomp}/#{coords[:artifact]}-#{value.chomp}.#{coords[:extension]}'"
            `curl -s -O 'https://store.vistacore.us/nexus/service/local/repositories/releases-export/content/#{coords[:group].gsub('.','/')}/#{coords[:artifact]}/#{value.chomp}/#{coords[:artifact]}-#{value.chomp}.#{coords[:extension]}'`
            exported = true
          end
        }
        exported = true if ["TERM_PROGRAM_VERSION", "BACKEND_VERSION"].include?(key)
        raise "****** FAILURE uploading #{app_version}.  Unable to export #{key}... Perhaps there #{key} is not mapped to an artifact" unless exported
      end
    end
  end
  `rm -r #{folder}`

end
