#
# Cookbook Name:: solr_client
# Attributes:: default
#

default[:solr_client][:data_timeout_millis] = 30000
default[:solr_client][:wait_loop_delay_millis] = 100
default[:solr_client][:requery_loop_delay_millis] = 1000
default[:solr_client][:core] = "vpr"
default[:solr_client][:path] = "/collections/vpr/state.json"
default[:solr_client][:zookeeper_options][:retries] = 5