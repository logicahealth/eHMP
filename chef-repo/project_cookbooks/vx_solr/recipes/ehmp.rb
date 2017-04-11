#
# Cookbook Name:: vx_solr
# Recipe:: ehmp
#

lucene_filename = ::File.basename(node[:vx_solr][:ehmp][:lucene])
lucene_filepath = "#{Chef::Config[:file_cache_path]}/#{lucene_filename}"
joda_filename = ::File.basename(node[:vx_solr][:ehmp][:joda])
joda_filepath = "#{Chef::Config[:file_cache_path]}/#{joda_filename}"
vpr_path = "#{node[:vx_solr][:ehmp][:vpr_data_path]}/vpr/"

remote_file "#{Chef::Config[:file_cache_path]}/vpr.tar.gz" do
  use_conditional_get true
  source node[:vx_solr][:ehmp][:vpr]
  mode   "0755"
  notifies :delete, "directory[#{vpr_path}]", :immediately
  notifies :restart, "service[solr]"
  # checksum open("#{node[:vx_solr][:ehmp][:vpr]}.sha1", { ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE }).string
end

directory vpr_path do
  action :nothing
  recursive true
end

remote_file lucene_filepath do
  use_conditional_get true
  source node[:vx_solr][:ehmp][:lucene]
  notifies :restart, "service[solr]"
  # checksum open("#{node[:vx_solr][:ehmp][:lucene]}.sha1", { ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE }).string
end

remote_file joda_filepath do
  use_conditional_get true
  source node[:vx_solr][:ehmp][:joda]
  notifies :restart, "service[solr]"
  # checksum open("#{node[:vx_solr][:ehmp][:joda]}.sha1", { ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE }).string
end

vx_solr_wait_for_connection "ensure solr is deployed" do
  url "http://localhost:#{node[:solr][:port]}/solr/"
end

execute 'Unpack_vpr' do
  cwd node[:vx_solr][:ehmp][:vpr_data_path]
  command "tar xzf #{Chef::Config[:file_cache_path]}/vpr.tar.gz"
  action :run
  not_if { Dir.exist? vpr_path }
end

template "#{node[:vx_solr][:ehmp][:vpr_data_path]}/vpr/conf/solrconfig.xml" do
  source 'solrconfig.xml.erb'
  owner 'root'
  group 'root'
  mode '0644'
  variables(
    :filtercache_size => node[:vx_solr][:ehmp][:solrconfig][:filtercache][:size],
    :filtercache_initialsize => node[:vx_solr][:ehmp][:solrconfig][:filtercache][:initialsize],
    :filtercache_autowarmcount => node[:vx_solr][:ehmp][:solrconfig][:filtercache][:autowarmcount]
  )
  notifies :restart, "service[solr]"
end

remote_file "#{node[:vx_solr][:ehmp][:solr_lib_path]}/health-time-core.jar" do
  use_conditional_get true
  source node[:vx_solr][:ehmp][:health_time_core]
  owner "root"
  group "root"
  mode "0755"
  notifies :restart, "service[solr]"
  # checksum open("#{node[:vx_solr][:ehmp][:health_time_core]}.sha1", { ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE }).string
end

remote_file "#{node[:vx_solr][:ehmp][:solr_lib_path]}/health-time-solr.jar" do
  use_conditional_get true
  source node[:vx_solr][:ehmp][:health_time_solr]
  owner "root"
  group "root"
  mode "0755"
  notifies :restart, "service[solr]"
  # checksum open("#{node[:vx_solr][:ehmp][:health_time_solr]}.sha1", { ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE }).string
end

execute 'Copy_hon-lucene-synonyms' do
  command "cp #{lucene_filepath} #{node[:vx_solr][:ehmp][:solr_lib_path]}"
  action :run
end

execute 'Copy_joda_time' do
  command "cp #{joda_filepath} #{node[:vx_solr][:ehmp][:solr_lib_path]}"
  action :run
end
