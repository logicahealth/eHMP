#
# Cookbook Name:: vista
# Recipe:: import_panorama
#

chef_gem 'vistarpc4r' do
  version '0.3.0'
end

require 'rubygems'
require 'vistarpc4r'

remote_directory '/var/data/panorama_data' do
  source 'panorama_data'
  owner 'root'
  group 'root'
  mode '0755'
  action :create
end

ruby_block "import_panorama" do
  block do

    broker = VistaRPC4r::RPCBrokerConnection.new("127.0.0.1", 9210, "PW    ", "PW    !!", false)
    broker.connect
    broker.setContext('OR CPRS GUI CHART')

    Dir.glob("/var/data/panorama_data/*.json") do |json_file|
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
