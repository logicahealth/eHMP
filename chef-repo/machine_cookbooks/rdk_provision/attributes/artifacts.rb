#
# Cookbook Name:: rdk_provision
# Attributes:: artifacts
#

default[:rdk_provision][:artifacts] = {
	:rdk => {
		:repo => "releases",
  	:group => "us.vistacore.rdk",
  	:artifact => "rdk",
  	:extension => "zip",
  	:version => ENV["RDK_VERSION"],
    :release => true
  },
  :vistatasks => {
    :repo => "releases",
    :group => "us.vistacore.jbpm",
    :artifact => "VistaTasks",
    :extension => "jar",
    :version => ENV["JBPM_VISTATASKS_VERSION"],
    :release => true
  },
  :jbpm_fitlabproject => {
    :repo => "releases",
    :group => "us.vistacore.jbpm",
    :artifact => "FITLabProject",
    :extension => "jar",
    :version => ENV["JBPM_FITLABPROJECT_VERSION"],
    :release => true
  },
  :jbpm_auth => {
    :repo => "releases",
    :group => "us.vistacore.jbpm",
    :artifact => "jboss-custom-login-jar-with-dependencies",
    :extension => "jar",
    :version => ENV["JBPM_AUTH_VERSION"],
    :release => true
  },
  :jbpm_eventlisteners => {
    :repo => "releases",
    :group => "us.vistacore.jbpm",
    :artifact => "jbpm-custom-event-listeners",
    :extension => "jar",
    :version => ENV["JBPM_LISTENER_VERSION"],
    :release => true
  },
  :jbpm_cdsinvocationservice => {
    :repo => "releases",
    :group => "us.vistacore.jbpm",
    :artifact => "CDSInvocationService",
    :extension => "jar",
    :version => ENV["JBPM_CDSINVOCATIONSERVICE_VERSION"],
    :release => true
  },
  :jbpm_fobtlabservice => {
    :repo => "releases",
    :group => "us.vistacore.jbpm",
    :artifact => "FOBTLabService",
    :extension => "jar",
    :version => ENV["JBPM_FOBTLABSERVICE_VERSION"],
    :release => true
  },
  :jbpm_tasksservice => {
    :repo => "releases",
    :group => "us.vistacore.jbpm",
    :artifact => "tasksservice",
    :extension => "war",
    :version => ENV["JBPM_TASKSSERVICE_VERSION"],
    :release => true
  },
  :jbpm_general_medicine => {
    :repo => "releases",
    :group => "us.vistacore.jbpm",
    :artifact => "General_Medicine",
    :extension => "jar",
    :version => ENV["JBPM_GENERAL_MEDICINE_VERSION"],
    :release => true
  },
  :jbpm_order => {
    :repo => "releases",
    :group => "us.vistacore.jbpm",
    :artifact => "Order",
    :extension => "jar",
    :version => ENV["JBPM_ORDER_VERSION"],
    :release => true
  },
  :jbpm_activity => {
    :repo => "releases",
    :group => "us.vistacore.jbpm",
    :artifact => "Activity",
    :extension => "jar",
    :version => ENV["JBPM_ACTIVITY_VERSION"],
    :release => true
  },
  :jbpm_ehmpservices => {
    :repo => "releases",
    :group => "us.vistacore.jbpm",
    :artifact => "EhmpServices",
    :extension => "jar",
    :version => ENV["JBPM_EHMPSERVICES_VERSION"],
    :release => true
  },
  :jbpm_sql_config => {
    :repo => "releases",
    :group => "us.vistacore.jbpm",
    :artifact => "sql_config",
    :extension => "tgz",
    :version => ENV["JBPM_SQL_CONFIG_VERSION"],
    :release => true
  }
}
