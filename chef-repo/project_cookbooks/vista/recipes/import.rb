#
# Cookbook Name:: vista
# Recipe:: import
#

chef_gem 'vistarpc4r' do
  version '0.2.3'
end

require 'rubygems'
require 'vistarpc4r'

ruby_block "import_vitals" do
  block do
    data_bag('vitals').each do | vitals_obs |
      Chef::Log.info("Found vitals data: #{vitals_obs}\n")
      p = data_bag_item('vitals', vitals_obs)

      p['vitals']['observations'].each do |observations|
        vrpc = VistaRPC4r::VistaRPC.new("GMV ADD VM", VistaRPC4r::RPCResponse::ARRAY)
        vrpc.params[0] = "#{p['vitals']['date']}.#{p['vitals']['time']}^#{p['vitals']['IED']}^#{observations['VITAL TYPE']};#{observations['result']};^#{p['vitals']['IED']}^#{p['vitals']['userIED']}"
        @broker.execute(vrpc)
      end
    end
  end
end
