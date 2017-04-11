#
# Cookbook Name:: vista
# Recipe:: fmql
# Installs FMQL on the server
#
# See https://github.com/caregraf/FMQL/wiki/Install-Instructions
#

# load and install distribution CGFMQL 1.0
vista_install_distribution "fmql_patches" do
  patch_list "fmql_patches"
  manifest_path "#{Chef::Config[:file_cache_path]}/kids-manifest.json"
  log node[:vista][:chef_log]
  run_checksums node[:vista][:run_checksums]
end

fmql_credentials = Chef::EncryptedDataBagItem.load("credentials", "vista_fmql_credentials", node[:data_bag_string])

vista_new_person "create_fmql_user" do
  log node[:vista][:chef_log]
  action :create
  access_code fmql_credentials["access_code"]
  verify_code fmql_credentials["verify_code"]
  full_name node[:fmql][:name]
  initial node[:fmql][:initial]
  secondary_menu_options ["CG FMQL QP USER"]
end

# Download FMQL server components
fmql_url = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/caregraf/cgfmql/1.0/cgfmql-1.0.zip"

remote_file "#{Chef::Config[:file_cache_path]}/CGFMQL1_0.zip" do
  source fmql_url
end

bash "extract_fmql" do
  cwd Chef::Config[:file_cache_path]
  code <<-EOH
    unzip CGFMQL1_0.zip
    mkdir -p /usr/local/fmql
    /bin/cp CGFMQL1_0/usrlocalfmql/* /usr/local/fmql
    EOH
end

ruby_block "enable_fmql_ssl_query" do
  block do
    rc = Chef::Util::FileEdit.new("/usr/local/fmql/fmQuery.html")
    rc.search_file_replace_line(/EPURL = "http:\/\/" \+ location\.host \+ "\/fmqlEP";/, "EPURL = \"https://\" + location.host + \"/fmqlEP\";")
    rc.write_file
  end
end
