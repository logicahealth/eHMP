#
# Cookbook Name:: vx_solr
# Attributes:: ecryptfs
#

default[:vx_solr][:ehmp][:lucene] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/healthonnet/hon-lucene-synonyms/1.3.3-solr-4.3.0/hon-lucene-synonyms-1.3.3-solr-4.3.0.jar"
default[:vx_solr][:ehmp][:joda] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/joda/joda-time/2.2/joda-time-2.2.jar"
default[:vx_solr][:ehmp][:health_time_core] = nil
default[:vx_solr][:ehmp][:health_time_solr] = nil
default[:vx_solr][:ehmp][:vpr_data_path] = "#{node[:solr][:dir]}-#{node[:solr][:version]}/unpacked_vpr"
default[:vx_solr][:ehmp][:solr_lib_path] = "#{node[:vx_solr][:server_dir]}/solr-webapp/webapp/WEB-INF/lib"

default[:vx_solr][:ehmp][:solrconfig] = {
    :log4j => {
        :max_file_size => "100MB",
        :zookeeper_log_level => "WARN"
    },
  :filtercache => {
    :size => "512",
    :initialsize => "512",
    :autowarmcount => "0"
  },
  :softCommitMaxTime => nil,
  :commitMaxTime => 2000,
  :commitOpenSearcher => true,
  :commitMaxDocs => nil
}


default[:vx_solr][:ehmp][:collection] = {
  :num_shards => 1,
  :replication_factor => 1,
  :max_shards_per_node => 2,
  :allow_recreate => nil # set in solr machine recipe
}

default[:vx_solr][:ehmp][:cron_schedule] = '0 2 * * * '

default[:vx_solr][:ehmp][:create_cron_job] = true
