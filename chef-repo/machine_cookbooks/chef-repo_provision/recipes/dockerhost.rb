#
# Cookbook Name:: machine
# Recipe:: dockerhost
#


require 'chef/provisioning/aws_driver'
with_driver 'aws'

raise "ENV must include SLAVE_NAME to boot a slave" unless ENV.has_key?('SLAVE_NAME')

node.default[:machine][:stack] = ENV['SLAVE_NAME']

instance_type = ENV["INSTANCE_TYPE"] || "m3.2xlarge"

node.default[:machine][:convergence_options].merge! ({
  install_sh_url: "#{node[:common][:nexus_url]}/nexus/content/repositories/environment/vistacore/chef-install/install/1.0.3.slave/install-1.0.3.slave.sh"
})

machine_options = {
  :bootstrap_options => {
    :key_name => "vagrantaws_c82a142d5205",
    :instance_type => instance_type,
    :subnet_id => "subnet-213b2256",
    :security_group_ids => ["sg-a06097c6", "sg-2946b14f", "sg-d58a9baf", "sg-902232f7"]
  },
  :image_id => "ami-6bb55d7d", # CentOS 7.3 Image Patched 18th Jan 2017
  :ssh_username => "centos",
  :aws_tags => set_ec2_tags,
  :convergence_options => node[:machine][:convergence_options]
}

chef_repo_deps = parse_dependency_versions "chef-repo_provision"
machine_deps = parse_dependency_versions "machine"

r_list = []
r_list << "recipe[role_cookbook::aws@#{machine_deps["role_cookbook"]}]"
r_list << "recipe[dockerhost]"

machine "#{node[:machine][:stack]}" do
  machine_options machine_options
  converge node[:machine][:converge]
  attributes(
    stack: node[:machine][:stack],
    nexus_url: node[:common][:nexus_url],
    data_bag_string: node[:common][:data_bag_string],
    jenkins: {
      master: {
        endpoint: "#{node[:'chef-repo_provision'][:slave][:jenkins_url]}"
      }
    },
    workstation: {
      user: "jenkins",
      user_home: "/var/lib/jenkins"
    }
  )
  file "/#{::Chef::Config.client_key.split("/")[-1]}", ::Chef::Config.client_key
  chef_environment "_default"
  run_list r_list
  action node[:machine][:action]
end
