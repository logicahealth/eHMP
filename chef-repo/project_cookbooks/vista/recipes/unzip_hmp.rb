#
# Cookbook Name:: vista
# Recipe:: unzip_hmp
#

remote_file node[:vista][:hmp_path] do
  source node[:vista][:hmp_source]
  use_conditional_get true
end

execute "uzip_hmp" do
  command "unzip -o -q #{node[:vista][:hmp_path]} -d #{Chef::Config[:file_cache_path]}"
  action :run
end
