#
# Cookbook Name:: vista
# Recipe:: import_panorama
#

vista_mumps_block "Run MUMPS commands on Panorama" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "K FDA",
    "S FDA(1,52,\"401106,\",26)=3150101",
    "D FILE^DIE(,\"FDA(1)\")",
    "K FDA",
    "S FDA(1,200,\"10000000227,\",9)=983493891",
    "D FILE^DIE(,\"FDA(1)\")",
    "K FDA",
    "S FDA(1,53.79,\"1,\",.11)=\"7U\"",
    "D UPDATE^DIE(,\"FDA(1)\")",
    "K FDA",
    "S FDA(1,9000010,\"1867,\",.08)=542",
    "D UPDATE^DIE(,\"FDA(1)\")",
    "K FDA",
    "S FDA(44,\"8,\",2802)=1",
    "D UPDATE^DIE(,\"FDA\")"
  ]
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

vista_mumps_block "MUMPS commands to assign an ICN to patient with DFN=18 on Panorama" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "S ^DPT(18,\"MPI\")=5123456789",
    "S ^DPT(\"AICN\",5123456789,18)=\"\""
  ]
  log node[:vista][:chef_log]
end

# Install patient test data for development purposes only
vista_load_global "vista-panorama_test_data" do
  patch_list "vista-panorama_test_data"
  manifest_path "#{Chef::Config[:file_cache_path]}/kids-manifest.json"
  log node[:vista][:chef_log]
end

vista_mumps_block "Update patient TWOHUNDREDNINE,PATIENT's problems to have one originate in Panorama and one in Kodak" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "K FDA",
    "S FDA(9000011,\"971,\",.02)=100155",
    "S FDA(9000011,\"971,\",.06)=500",
    "S FDA(9000011.11,\"1,971,\",.01)=500",
    "S FDA(9000011,\"975,\",.02)=100865",
    "S FDA(9000011,\"975,\",.06)=500",
    "S FDA(9000011.11,\"1,975,\",.01)=500",
    "D FILE^DIE(,\"FDA\")"
  ]
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

26.times do |i|
  alph = ("a".."z").to_a

  number = alph[i]
  vista_patient "Create a patient" do
    name "PANORAMA,#{number}"
    sex "MALE"
    dob "01/01/1962"
    not_if { node[:vista][:no_reset] }
  end
end
