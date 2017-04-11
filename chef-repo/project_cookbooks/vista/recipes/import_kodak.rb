#
# Cookbook Name:: vista
# Recipe:: import_kodak
#

chef_gem 'vistarpc4r' do
  version '0.3.0'
end

require 'rubygems'
require 'vistarpc4r'

remote_directory '/var/data/kodak_data' do
   source 'kodak_data'
   owner 'root'
   group 'root'
   mode '0755'
   action :create
end

ruby_block "import_kodak" do
  block do

    broker = VistaRPC4r::RPCBrokerConnection.new("127.0.0.1", 9210, "PW    ", "PW    !!", false)
    broker.connect
    broker.setContext('OR CPRS GUI CHART')

    Dir.glob("/var/data/kodak_data/*.json") do |json_file|
      Chef::Log.info("Found vitals data: #{json_file}\n")
      p = JSON.parse(File.read(File.expand_path(json_file, File.dirname(__FILE__))))
      if p['vitals'] != nil && p['vitals']['observations'] != nil
        p['vitals']['observations'].each do |observation|
          vrpc = VistaRPC4r::VistaRPC.new("GMV ADD VM", VistaRPC4r::RPCResponse::ARRAY)
          vrpc.params[0] = "#{p['vitals']['date']}.#{p['vitals']['time']}^#{p['vitals']['patientIEN']}^#{observation['VITAL TYPE']};#{observation['result']};^#{p['vitals']['location']}^#{p['vitals']['userIEN']}"
          broker.execute(vrpc)
        end
      elsif p['allergies'] != nil && p['allergies']['list'] != nil
        third_parameter = []
        p['allergies']['list'].each do |list|
          if list['ordinal'] == nil || list['ordinal'] == ""
            third_parameter << ["\"#{list['key']}\"", list['value']]
          else
            third_parameter << ["\"#{list['key']}\", #{list['ordinal']}", list['value']]
          end
        end
        vrpc = VistaRPC4r::VistaRPC.new("ORWDAL32 SAVE ALLERGY", VistaRPC4r::RPCResponse::SINGLE_VALUE)
        vrpc.params[0] = "0" # first parameter is the allergy IEN to update/insert, if inserting, default to 0
        vrpc.params[1] = p['allergies']['patientIEN'] # second parameter is the DFN of the patient to insert the allergy for
        # third parameter is the list of allergy information to insert
        vrpc.params[2] = third_parameter
        broker.execute(vrpc)
      elsif p['notes'] != nil
        n = p['notes']


        vrpc = VistaRPC4r::VistaRPC.new("OOPS NEW PERSON DATA", VistaRPC4r::RPCResponse::ARRAY)
        vrpc.params = [
          n["provider"],
        ]

        resp = broker.execute(vrpc)
        provider_ien = resp.value.first.split('^').first

        vrpc = VistaRPC4r::VistaRPC.new("TIU CREATE RECORD", VistaRPC4r::RPCResponse::SINGLE_VALUE)
        vrpc.params = [
          n["patientIEN"],
          n["noteType"],
          "",
          "",
          "",
          [
            ["1202", provider_ien],
            ["1201", "T"],
            ["1205", n["location"]],
            ["1701",""],
          ],
          "#{n["location"]};T;A",
          "1"
        ]

        resp = broker.execute(vrpc)
        id = resp.value

        vrpc = VistaRPC4r::VistaRPC.new("TIU SET DOCUMENT TEXT", VistaRPC4r::RPCResponse::SINGLE_VALUE)
        vrpc.params = [
          id,
          [
            ["\"TEXT\",1,0", n["text"]],
            ["\"HDR\"","1^1"]
          ],
          "0"
        ]
        resp = broker.execute(vrpc)
      end
    end

    broker.close
  end
  not_if { node[:vista][:no_reset] }
end

vista_mumps_block "Run MUMPS commands on Kodak" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "S FDA(1,2,\"227,\",.09)=987654321",
    "D UPDATE^DIE(,\"FDA(1)\")",
    "S ^LR(140,\"CY\",7059588,1.1,1,0)=\"NO MALIGNANCY FOUND\"",
    "K FDA",
    "S FDA(1,52,\"401106,\",6)=151",
    "S FDA(1,52,\"401106,\",26)=3150101",
    "D FILE^DIE(,\"FDA(1)\")",
    "S $P(^LR(184,\"CH\",6949681.966382,0),\"^\",3)=\"3050318.043728\"",
    "S $P(^LR(184,\"CH\",6949681.966382,430),\"^\",1)=\"15.9\"",
    "F I=1:1:3 S ^RARPT(535,\"I\",I,0)=\"New impression \"_I_\": \"_^RARPT(535,\"I\",I,0)",
    "F R=1:1:3 S ^RARPT(535,\"R\",R,0)=\"New report \"_R_\": \"_^RARPT(535,\"R\",R,0)",
    "K FDA",
    "S FDA(1,200,\"10000000227,\",9)=983493891",
    "D FILE^DIE(,\"FDA(1)\")",
    "S $P(^LR(184,\"MI\",7048982.848075,1),\"^\",3)=11247",
    "S $P(^LR(184,\"MI\",7048982.848075,1),\"^\")=2951027",
    "K FDA S FDA(1,100,\"10629,\",4)=2991002.0801",
    "D FILE^DIE(,\"FDA(1)\")",
    "K FDA",
    "S FDA(1,52,\"401710,\",4)=940",
    "D FILE^DIE(,\"FDA(1)\")",
    # Radiology Data Staging, change CARDIAC MYOPERFUSION SCAN DRUG STRESS to CARDIAC MYOPERFUSION SCAN DRUG STRESS
    # In the Radiology lookup for id 730
    "K FDA S FDA(1,71,\"730,\",.01)=\"CARDIAC MYOPERFUSION SCAN DRUG STRESS\"",
    "D FILE^DIE(,\"FDA(1)\")",
    # Inpatient Medications
    "S ^OR(100,10629,.1,1,0)=1671",
    "K ^OR(100,10629,.1,\"B\",1393,1)",
    "S ^OR(100,10629,.1,\"B\",1671,1)=\"\"",
    "S ^OR(100,10629,4.5,1,1)=1671",
    "S ^OR(100,10629,8,1,.1,1,0)=\"IBUPROFEN TAB\"",
    "K FDA",
    "S FDA(1,53.79,\"1,\",.11)=\"7U\"",
    "D UPDATE^DIE(,\"FDA(1)\")"
  ]
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

vista_mumps_block "MUMPS commands to assign an ICN to patient with DFN=18 on Kodak" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "S ^DPT(18,\"MPI\")=5123456789",
    "S ^DPT(\"AICN\",5123456789,18)=\"\""
  ]
  log node[:vista][:chef_log]
end

vista_mumps_block "MUMPS commands to set patient with DFN=18 to non-sensitive status on Kodak" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "K FDA",
    "S FDA(1,38.1,\"18,\",2)=0",
    "S FDA(1,2,\"18,\",.361)=7",
    "D UPDATE^DIE(,\"FDA(1)\")"
  ]
  log node[:vista][:chef_log]
end

vista_mumps_block "MUMPS commands to assign an ICN to patient with DFN=100033 on Kodak" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "S ^DPT(100033,\"MPI\")=100031",
    "S ^DPT(\"AICN\",100031,100033)=\"\""
  ]
  log node[:vista][:chef_log]
end

# Install patient test data for development purposes only
vista_load_global "vista-kodak_test_data" do
  patch_list "vista-kodak_test_data"
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

vista_mumps_block "Modify picklist values in Kodak only" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    # Remove Inactive flag for "VOODOO SHOT (HISTORICAL)"
    "S DA=500001,DIE=\"^AUTTIMM(\",DR=\".07///@\" D ^DIE"
  ]
  log node[:vista][:chef_log]
end
