#
# Cookbook Name:: ehmp-ui
# Recipe:: default
#

include_recipe "adk::default"

dest_file = "#{Chef::Config['file_cache_path']}/ehmp-ui.zip"
dest_dir = "#{node[:ehmp_ui][:home_dir]}"
app_config = "#{dest_dir}/../app.json"

yum_package "unzip"

remote_file dest_file do
  source node[:ehmp_ui][:source]
  mode "0755"
  #checksum open("#{node[:ehmp_ui][:source]}.sha1", { ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE }).string
  use_conditional_get true
  notifies :delete, "directory[#{dest_dir}]", :immediately
  not_if ("mountpoint -q #{dest_dir}")
end

directory dest_dir do
  owner  "root"
  group  "root"
  mode "0755"
  recursive true
  action :create
end

execute "extract from ZIP" do
  cwd dest_dir
  command "unzip #{Chef::Config['file_cache_path']}/ehmp-ui.zip"
  action :run
  notifies :run, "execute[Move app.json to app directory]", :immediately
  only_if { (Dir.entries(dest_dir) - %w{ . .. }).empty? }
end

execute "Move app.json to app directory" do
  cwd dest_dir
  command "mv -f app.json #{dest_dir}/../"
  action :nothing
end

template "#{dest_dir}/../manifest.json" do
  source 'manifest.json.erb'
  variables(
    :overall_version => node[:ehmp_ui][:manifest][:overall_version],
    :versions => node[:ehmp_ui][:manifest][:versions]
  )
end
