#
# Cookbook Name:: vista
# Resource:: patients
#
# creates patients
#

action :create do

  chef_gem 'vistarpc4r' do
    version '0.3.0'
  end
  require 'rubygems'
  require 'vistarpc4r'

  ruby_block "appointment:create:#{new_resource}" do
    block do

      broker = VistaRPC4r::RPCBrokerConnection.new("127.0.0.1", 9210, "PW    ", "PW    !!", false)
      broker.connect
      broker.setContext('OR CPRS GUI CHART')

      patient_rpc = VistaRPC4r::VistaRPC.new("ISI IMPORT PAT", VistaRPC4r::RPCResponse::ARRAY)
      patient_rpc.params = [[
        ["1", "TEMPLATE^DEFAULT"],
        ["2", "IMP_TYPE^I"],
        ["3", "NAME^#{new_resource.name}"],
        ["4", "SEX^#{new_resource.sex}"],
        ["5", "DOB^#{new_resource.dob}"]
      ]]


      broker.execute(patient_rpc)
    end
  end
end