#
# Cookbook Name:: vista
# Recipe:: vpr
#
# Even logging to File.open(File::NULL, "w") will not capture the control characters which require 'reset' to clear
#

vista_mumps_block "Add DOD test entry ZZUSDOD EDIPI TEST FACILITY to Institution file #4" do
  duz       1
  programmer_mode true
  namespace "VISTA"
  log node[:vista][:chef_log]
  command [
    's FDA(1,4,"+1,",.01)="ZZUSDOD EDIPI TEST FACILITY"',
    's FDA(1,4,"+1,",.02)="ILLINOIS"',
    's FDA(1,4,"+1,",11)="LOCAL"',
    's FDA(1,4,"+1,",13)="DOD"',
    's FDA(1,4,"+1,",99)="200DOD"',
    'd UPDATE^DIE("","FDA(1)","ERR")'
  ]
  not_if { node[:vista][:no_reset] }
end

patient_edipis = {
  "EIGHT,INPATIENT"              => "0000000001",
  "EIGHT,OUTPATIENT"             => "0000000002",
  "EIGHT,PATIENT"                => "0000000003",
  "ZZZRETIREDZERO,PATIENT"       => "0000000004",
  "ZZZRETIREDFIFTYSEVEN,PATIENT" => "0000000005",
  "ZZZRETIREDFIFTYTHREE,PATIENT" => "0000000006",
  "ZZZRETSIXTHIRTYFOUR,PATIENT"  => "0000000007",
  "TEN,PATIENT"                  => "0000000008",
  "ZZZRETFOURTHIRTYTWO,PATIENT"  => "0000000009",
  "BCMA,EIGHT"                   => "0000000010",
  "ONEHUNDREDSIXTEEN,PATIENT"    => "0000000011",
  "ZZZRETSIXTWENTYEIGHT,PATIENT" => "0000000012",
  "ZZZRETIREDFORTYEIGHT,PATIENT" => "0000000013",
  "GRAPHINGPATIENT,TWO"          => "0000000014",
  "ZZZRETIREDTWELVE,PATIENT"     => "0000000015"
}

patient_edipis.each do |patient, edipi|

  patient_edipi = {
    ".01" => patient,
    ".02" => "ZZUSDOD EDIPI TEST FACILITY",
    "11" => edipi,
    "12" => "Active",
    "10" => "USDOD"
  }

  vista_mumps_block "Add local ids and #{edipi} to #{patient}" do
    duz       1
    programmer_mode true
    namespace "VISTA"
    log node[:vista][:chef_log]
    command [
      "S dfn=$$FIND1^DIC(2,,\"MX\",\"#{patient}\",,,\"ERR\")",
      "S edipi=\"#{edipi}^NI^USDOD^200DOD\"",
      "D NEWTF^VAFCTFU2(.DATA,dfn,edipi)",
      'D FILENEW^VAFCTFU(dfn,500,"","","",.ERROR,"",dfn,"A")',
      "zw DATA"
    ]
    not_if { node[:vista][:no_reset] }
  end
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


device_entry = {
  "$I" => ["HFS", "/vagrant/HFS.TXT"]
}

vista_fileman "update $I for DEVICE file" do
  action          :update
  file            "3.5"
  field_values    device_entry
  log             node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

# add entry to VPR SUBSCRIPTION file
vpr_subscription_entry = {
  ".01" => "hmp-development-box"
}

vista_fileman "create_vpr_subscription" do
  action          :create
  file            "560"
  field_values    vpr_subscription_entry
  log             node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

# add entry to HMP SUBSCRIPTION file
vista_fileman "create_hmp_subscription" do
  action          :create
  file            "800000"
  field_values    ".01" => "hmp-development-box"
  log             node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

vpr_subscription_entry = {
  ".01" => "2-hmp-2"
}

vista_fileman "create_vpr_subscription for second VistA-Exchange" do
  action          :create
  file            "560"
  field_values    vpr_subscription_entry
  log             node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
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
