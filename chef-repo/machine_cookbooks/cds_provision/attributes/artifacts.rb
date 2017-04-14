#
# Cookbook Name:: cdsinvocation
# Attributes:: artifacts
#

default[:cds_provision][:artifacts] = {
  :cdsi_metrics => {
    :repo => "releases",
    :group => "us.vistacore.cdsinvocation",
    :artifact => "cdsinvocation-metrics",
    :extension => "war",
    :version => ENV["CDSI_METRICS_VERSION"],
    :release => true
  },
  :cdsi_results => {
    :repo => "releases",
    :group => "us.vistacore.cdsinvocation",
    :artifact => "cdsinvocation-results",
    :extension => "war",
    :version => ENV["CDSI_RESULTS_VERSION"],
    :release => true
  },
  :cdsdashboard => {
    :repo => "releases",
    :group => "us.vistacore.cdsdashboard",
    :artifact => "cds-dashboard",
    :extension => "war",
    :version => ENV["CDSDASHBOARD_VERSION"],
    :release => true
  },
  :opencds_knowledge_repository_data => {
    :repo => "releases",
    :group => "us.vistacore.opencds",
    :artifact => "opencds-knowledge-repository-data",
    :extension => "zip",
    :version => ENV["OPENCDS_VERSION"],
    :release => true
  },
  :cds_engine_agent => {
    :repo => "releases",
    :group => "us.vistacore.cdsinvocation",
    :artifact => "cds-engine-agent",
    :extension => "war",
    :version => ENV["CDS_ENGINE_AGENT_VERSION"],
    :release => true
  }
}
