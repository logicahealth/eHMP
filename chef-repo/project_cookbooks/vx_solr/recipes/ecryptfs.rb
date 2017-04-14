#
# Cookbook Name:: vx_solr
# Recipe:: ecryptfs
#

if node[:vx_solr][:ecryptfs][:encrypt]
  vx_solr_ecryptfs "solr_logs" do
    list [node[:vx_solr][:log_dir]]
    action :add
  end
else
  yum_package "ecryptfs-utils"
end
