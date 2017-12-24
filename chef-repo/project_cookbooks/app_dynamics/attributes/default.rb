#
# Cookbook Name:: app_dynamics
# Recipe:: default
#

default[:app_dynamics][:proxy][:home] = "/opt/AppDynamics"
default[:app_dynamics][:proxy][:log_path] = "#{node[:app_dynamics][:proxy][:home]}/agentLogs"
default[:app_dynamics][:proxy][:ctl_dir] = "#{node[:app_dynamics][:proxy][:home]}/proxy_ctl_dir"
default[:app_dynamics][:proxy][:proxyAutolaunchDisabled] = true
default[:app_dynamics][:proxy][:noNodeNameSuffix] = true
