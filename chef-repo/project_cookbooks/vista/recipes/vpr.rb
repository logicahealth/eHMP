#
# Cookbook Name:: vista
# Recipe:: vpr
#
# Even logging to File.open(File::NULL, "w") will not capture the control characters which require 'reset' to clear
#

# add entries to HMP SUBSCRIPTION file
vista_fileman "create_hmp_subscription" do
  action          :create
  file            "800000"
  field_values    ".01" => "hmp-development-box"
  log             node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

vista_install_distribution "vista_patches" do
  patch_list "vista_patches"
  manifest_path "#{Chef::Config[:file_cache_path]}/kids-manifest.json"
  log node[:vista][:chef_log]
  run_checksums node[:vista][:run_checksums]
end

vista_ro_install "hmp.ro" do
  action :execute
  namespace node[:vista][:namespace]
  source "#{Chef::Config[:file_cache_path]}/hmp.ro"
end

vista_install_distribution "vista-#{node[:vista][:site].downcase}_patches" do
  patch_list "vista-#{node[:vista][:site].downcase}_patches"
  manifest_path "#{Chef::Config[:file_cache_path]}/kids-manifest.json"
  log node[:vista][:chef_log]
  run_checksums node[:vista][:run_checksums]
end

# Install test data patches
vista_install_distribution "test_data_patches" do
  patch_list "test_data_patches"
  manifest_path "#{Chef::Config[:file_cache_path]}/kids-manifest.json"
  log node[:vista][:chef_log]
  run_checksums node[:vista][:run_checksums]
end

# Load test data globals
vista_load_global "global_test_data_patches" do
  patch_list "global_test_data_patches"
  manifest_path "#{Chef::Config[:file_cache_path]}/kids-manifest.json"
  log node[:vista][:chef_log]
end

vista_mumps_block "Reset all subscriptions on deploy" do
  namespace node[:vista][:namespace]
  command [
    # Reset subscription
    "S ARGS(\"server\")=\"hmp-development-box\"",
    "S ARGS(\"command\")=\"resetAllSubscriptions\"",
    "D API^HMPDJFS(.OUT,.ARGS)",
    # Print the results
    "ZW @OUT",
    # Clean up
    "K OUT,ARGS"
  ]
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end
