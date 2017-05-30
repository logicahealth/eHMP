#
# Cookbook Name:: vista
# Recipe:: import_beta
#

chef_gem 'vistarpc4r' do
  version '0.3.0'
end

require 'rubygems'
require 'vistarpc4r'

ruby_block "import_beta" do
  block do

    broker = VistaRPC4r::RPCBrokerConnection.new("127.0.0.1", 9210, "REDACTED", "REDACTED", false)
    broker.connect
    broker.setContext('OR CPRS GUI CHART')

    data_bag('beta').each do | vistaItem |
      Chef::Log.info("Found vitals data: #{vistaItem}\n")
      p = data_bag_item('beta', vistaItem)
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
      end
    end
  end
end

vista_mumps_block "Run MUMPS commands on beta" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "K FDA",
    "S FDA(1,52,\"401106,\",26)=3150101",
    "D FILE^DIE(,\"FDA(1)\")",
    "K FDA",
    "S FDA(1,200,\"10000000227,\",9)=983493891",
    "D FILE^DIE(,\"FDA(1)\")"
  ]
  log node[:vista][:chef_log]
end
