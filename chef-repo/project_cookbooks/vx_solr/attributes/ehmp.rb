#
# Cookbook Name:: vx_solr
# Attributes:: ecryptfs
#

default[:vx_solr][:ehmp][:lucene] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/project/healthonnet/hon-lucene-synonyms/1.3.3-solr-4.3.0/hon-lucene-synonyms-1.3.3-solr-4.3.0.jar"
default[:vx_solr][:ehmp][:joda] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/project/joda/joda-time/2.2/joda-time-2.2.jar"
default[:vx_solr][:ehmp][:health_time_core] = nil
default[:vx_solr][:ehmp][:health_time_solr] = nil
default[:vx_solr][:ehmp][:vpr_data_path] = node[:solr][:data_dir]
default[:vx_solr][:ehmp][:solr_lib_path] = "#{node[:vx_solr][:server_dir]}/solr-webapp/webapp/WEB-INF/lib"

default[:vx_solr][:ehmp][:solrconfig] = {
  filtercache: {
    size: "512",
    initialsize: "512",
    autowarmcount: "0"
  }
}
