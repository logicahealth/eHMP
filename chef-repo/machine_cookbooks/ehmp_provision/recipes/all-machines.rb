#
# Cookbook Name:: ehmp_provision
# Recipe:: all-machines
#

node.override[:machine][:action] = :setup if node[:machine][:action].eql?("converge")
node.override[:machine][:batch_action] = :nothing if node[:machine][:action].eql?("destroy")
node.default[:ehmp_provision][:machines].delete("solr") if node[:machine][:driver] == "vagrant"

node[:ehmp_provision][:machines].each {|machine_name|
  include_recipe "ehmp_provision::#{machine_name}"
}
include_recipe "ehmp_provision::vxsync"

stack = node[:machine][:driver] == "vagrant" ? "#{node[:machine][:stack]}-node" : node[:machine][:stack]

machine_batch "converge_backend" do 
  node[:ehmp_provision][:machines].each { |machine_name|
    machine "#{machine_name}-#{stack}"
  }
  action node[:machine][:batch_action]
  notifies node[:machine][:batch_action], "machine[vxsync-#{stack}]", :immediately
end
