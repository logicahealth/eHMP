#
# Cookbook Name:: jds
# Recipe:: routines
#

# Restart M server to ensure new JDS source code is activated
service node[:jds][:service_name] do
  service_name node[:jds][:service_name]
  action :restart
end
