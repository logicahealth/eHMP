#
# Cookbook Name:: vx_solr
# Recipe:: ehmp
#

lucene_filename = ::File.basename(node[:vx_solr][:ehmp][:lucene])
lucene_filepath = "#{Chef::Config[:file_cache_path]}/#{lucene_filename}"
joda_filename = ::File.basename(node[:vx_solr][:ehmp][:joda])
joda_filepath = "#{Chef::Config[:file_cache_path]}/#{joda_filename}"
vpr_path = "#{node[:vx_solr][:ehmp][:vpr_data_path]}/vpr/"

directory node[:vx_solr][:ehmp][:vpr_data_path] do
  owner node['solr']['user']
  group node['solr']['group']
end

remote_file "#{Chef::Config[:file_cache_path]}/vpr.tar.gz" do
  owner node['solr']['user']
  group node['solr']['group']
  use_conditional_get true
  source node[:vx_solr][:ehmp][:vpr]
  mode   "0755"
  notifies :delete, "directory[#{vpr_path}]", :immediately
  notifies :restart, "service[solr]"
  # checksum open("#{node[:vx_solr][:ehmp][:vpr]}.sha1", { ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE }).string
end

directory vpr_path do
  owner node['solr']['user']
  group node['solr']['group']
  action :nothing
  recursive true
end

remote_file lucene_filepath do
  owner node['solr']['user']
  group node['solr']['group']
  use_conditional_get true
  source node[:vx_solr][:ehmp][:lucene]
  notifies :restart, "service[solr]"
  # checksum open("#{node[:vx_solr][:ehmp][:lucene]}.sha1", { ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE }).string
end

remote_file joda_filepath do
  owner node['solr']['user']
  group node['solr']['group']
  use_conditional_get true
  source node[:vx_solr][:ehmp][:joda]
  notifies :restart, "service[solr]"
  # checksum open("#{node[:vx_solr][:ehmp][:joda]}.sha1", { ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE }).string
end

vx_solr_wait_for_connection "ensure solr is deployed" do
  url "http://localhost:#{node[:solr][:port]}/solr/"
end

execute 'Unpack_vpr' do
  user node['solr']['user']
  cwd node[:vx_solr][:ehmp][:vpr_data_path]
  command "tar xzf #{Chef::Config[:file_cache_path]}/vpr.tar.gz"
  action :run
  not_if { Dir.exist? vpr_path }
end

solrconfig = template "#{node[:vx_solr][:ehmp][:vpr_data_path]}/vpr/conf/solrconfig.xml" do
  source 'solrconfig.xml.erb'
  owner node['solr']['user']
  group node['solr']['group']
  mode '0644'
  variables(
    :filtercache_size => node[:vx_solr][:ehmp][:solrconfig][:filtercache][:size],
    :filtercache_initialsize => node[:vx_solr][:ehmp][:solrconfig][:filtercache][:initialsize],
    :filtercache_autowarmcount => node[:vx_solr][:ehmp][:solrconfig][:filtercache][:autowarmcount],
    :softCommitMaxTime => node[:vx_solr][:ehmp][:solrconfig][:softCommitMaxTime],
    :commitMaxTime => node[:vx_solr][:ehmp][:solrconfig][:commitMaxTime],
    :commitOpenSearcher => node[:vx_solr][:ehmp][:solrconfig][:commitOpenSearcher],
    :commitMaxDocs => node[:vx_solr][:ehmp][:solrconfig][:commitMaxDocs]
  )
  notifies :restart, "service[solr]"
end

template "#{node[:vx_solr][:resources_dir]}/log4j.properties" do
  source 'log4j.properties.erb'
  owner node['solr']['user']
  group node['solr']['group']
  mode '0644'
  variables(
      :max_file_size => node[:vx_solr][:ehmp][:solrconfig][:log4j][:max_file_size],
      :solr_log_dir => node[:vx_solr][:log_dir],
      :solr_log_level => node[:vx_solr][:log_level],
      :zookeeper_log_level => node[:vx_solr][:ehmp][:solrconfig][:log4j][:zookeeper_log_level]
  )
  notifies :restart, "service[solr]"
end

remote_file "#{node[:vx_solr][:ehmp][:solr_lib_path]}/health-time-core.jar" do
  use_conditional_get true
  source node[:vx_solr][:ehmp][:health_time_core]
  owner node['solr']['user']
  group node['solr']['group']
  mode "0755"
  notifies :restart, "service[solr]"
  # checksum open("#{node[:vx_solr][:ehmp][:health_time_core]}.sha1", { ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE }).string
end

remote_file "#{node[:vx_solr][:ehmp][:solr_lib_path]}/health-time-solr.jar" do
  use_conditional_get true
  source node[:vx_solr][:ehmp][:health_time_solr]
  owner node['solr']['user']
  group node['solr']['group']
  mode "0755"
  notifies :restart, "service[solr]"
  # checksum open("#{node[:vx_solr][:ehmp][:health_time_solr]}.sha1", { ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE }).string
end

execute 'Copy_hon-lucene-synonyms' do
  user node['solr']['user']
  command "cp #{lucene_filepath} #{node[:vx_solr][:ehmp][:solr_lib_path]}"
  action :run
end

execute 'Copy_joda_time' do
  user node['solr']['user']
  command "cp #{joda_filepath} #{node[:vx_solr][:ehmp][:solr_lib_path]}"
  action :run
end

ruby_block "remove default Xmx settings" do
  block do
    file = Chef::Util::FileEdit.new(node[:vx_solr][:service][:script])
    file.search_file_replace_line(/SOLR_JAVA_MEM=\('-Xms512m' '-Xmx512m'\)/, "nop='Do Not set Xmx value in Solr 5.1, workaround for Solr defect SOLR-7392'")
    file.write_file
  end
  only_if "cat #{node[:vx_solr][:service][:script]} | grep \"SOLR_JAVA_MEM=\(\'-Xms512m\' \'-Xmx512m\'\)\""
  notifies :restart, "service[solr]"
end

# upload configs to zookeeper
execute "#{node[:vx_solr][:server_dir]}/scripts/cloud-scripts/zkcli.sh -zkhost #{node[:vx_solr][:zookeeper][:zookeeper_connection]} -cmd upconfig -n vprConfig -d #{node[:vx_solr][:ehmp][:vpr_data_path]}/vpr/conf" do
  user node['solr']['user']
  only_if { solrconfig.updated_by_last_action? || node[:vx_solr][:service_script].updated_by_last_action? }
end

# link config with collection
execute "#{node[:vx_solr][:server_dir]}/scripts/cloud-scripts/zkcli.sh -zkhost #{node[:vx_solr][:zookeeper][:zookeeper_connection]} -cmd linkconfig -collection vpr -confname vprConfig" do
  user node['solr']['user']
  only_if { solrconfig.updated_by_last_action? || node[:vx_solr][:service_script].updated_by_last_action? }
end

# create the collection, specifiying shards and replications values
vx_solr_collection "vpr" do
  num_shards node[:vx_solr][:ehmp][:collection][:num_shards]
  replication_factor node[:vx_solr][:ehmp][:collection][:replication_factor]
  max_shards_per_node node[:vx_solr][:ehmp][:collection][:max_shards_per_node]
  allow_recreate node[:vx_solr][:ehmp][:collection][:allow_recreate]
end

# conditionally create or remove cron job
create_cron_job_action = node[:vx_solr][:ehmp][:create_cron_job] ? :create : :delete

#cron job to build suggestions
template "#{node[:vx_solr][:cron_dir]}/solr_build_suggest" do
  source 'solr_build_suggest.erb'
  owner 'root'
  group 'root'
  mode '0644'
  variables(
      :solr_port => node[:solr][:port],
      :cron_schedule => node[:vx_solr][:ehmp][:cron_schedule]
  )
  action create_cron_job_action
end
