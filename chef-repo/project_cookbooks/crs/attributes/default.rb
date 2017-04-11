default[:crs][:fuseki][:install_dir] = "/opt"
default[:crs][:fuseki][:version] = "2.3.1"
default[:crs][:fuseki][:source] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/apache/apache-jena-fuseki/#{node[:crs][:fuseki][:version]}/apache-jena-fuseki-#{node[:crs][:fuseki][:version]}.tar.gz"
default[:crs][:fuseki][:base] = "#{node[:crs][:fuseki][:install_dir]}/apache-jena-fuseki-#{node[:crs][:fuseki][:version]}"
default[:crs][:fuseki][:home] = node[:crs][:fuseki][:base]
default[:crs][:fuseki][:port] = 3030

default[:crs][:deploy_crs][:extract_dir] = "/tmp/crs"

default[:crs][:deploy_third_party] = {
  "rxnorm.ttl" => {
      "data_set" => "ehmp",
      "graph" => "rxnorm",
      "coords" => {
          "repo"=> "filerepo",
          "group"=> "third-party/project/nlm",
          "artifact"=> "rxnorm",
          "version"=> "2015AA",
          "extension"=> "ttl"
      }
  },
  "loinc.ttl"=> {
      "data_set"=> "ehmp",
      "graph"=> "loinc",
      "coords"=> {
          "repo"=> "filerepo",
          "group"=> "third-party/project/loinc",
          "artifact"=> "loinc",
          "version"=> "2.54",
          "extension"=> "ttl"
      }
  },
  "snomedct.owl"=> {
      "data_set"=> "ehmp",
      "graph"=> "snomed",
      "coords"=> {
          "repo"=> "filerepo",
          "group"=> "third-party/project/ihtsdo",
          "artifact"=> "snomedct",
          "version"=> "RF2Release_US1000124_20150901",
          "extension"=> "owl"
      }
  }
}