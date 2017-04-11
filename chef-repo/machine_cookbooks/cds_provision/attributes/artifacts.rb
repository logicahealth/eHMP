#
# Cookbook Name:: cdsinvocation
# Attributes:: artifacts
#

default[:cds_provision][:artifacts] = {
  :cdsi_metrics => {
    :repo => "ehmp",
    :group => "us.vistacore.cdsinvocation",
    :artifact => "cdsinvocation-metrics",
    :extension => "war",
    :version => ENV["CDSI_METRICS_VERSION"],
    :release => true
  },
  :cdsi_results => {
    :repo => "ehmp",
    :group => "us.vistacore.cdsinvocation",
    :artifact => "cdsinvocation-results",
    :extension => "war",
    :version => ENV["CDSI_RESULTS_VERSION"],
    :release => true
  },
  :cdsdashboard => {
    :repo => "ehmp",
    :group => "us.vistacore.cdsdashboard",
    :artifact => "cdsdashboard",
    :extension => "war",
    :version => ENV["CDSDASHBOARD_VERSION"],
    :release => true
  },
  :opencds_knowledge_repository_data => {
    :repo => "ehmp",
    :group => "us.vistacore.opencds",
    :artifact => "opencds-knowledge-repository-data",
    :extension => "zip",
    :version => ENV["OPENCDS_VERSION"],
    :release => true
  },
  :cds_engine_agent => {
    :repo => "ehmp",
    :group => "us.vistacore.cdsinvocation",
    :artifact => "cds-engine-agent",
    :extension => "war",
    :version => ENV["CDS_ENGINE_AGENT_VERSION"],
    :release => true
  }
}
