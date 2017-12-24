#
# Cookbook Name:: jds
# Recipe:: routines
#

# Restart cache server to ensure new JDS source code is activated
service "restart cache" do
  service_name node[:jds][:service_name]
  action :restart
end
