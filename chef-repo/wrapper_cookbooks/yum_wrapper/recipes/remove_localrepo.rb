#
# Cookbook Name:: yum_wrapper
# Recipe:: remove_localrepo
#

log "remove_localrepo_at_deployment_end" do
  message "Removing localrepo after deployment"
  level :info
  notifies :delete, "yum_repository[#{node['yum_wrapper']['localrepo']['name']}]", :delayed
end
