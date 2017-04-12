action :ssh do
  puts "********************************************"
  puts "**   VM Already exists, not creating it   **"
  puts "********************************************"
end

action :aws do
  require "chef/provisioning/aws_driver"
  with_driver "aws"

  node.default[:machine][:production_settings]["#{new_resource.machine_name}".to_sym] = {
    "ssh_username" => new_resource.boot_options[:ssh_username],
    "ssh_key" => new_resource.boot_options[:ssh_key_path]
  }

  chef_gem "awscli"
  chef_gem "aws-sdk"

  require "aws"
  require "aws-sdk"
  require "json"

  machine_options = {
      :bootstrap_options => {
        :key_name => ::File.basename(node[:machine][:production_settings]["#{new_resource.machine_name}".to_sym][:ssh_key]),
        :instance_type => new_resource.boot_options[:instance_type],
        :subnet_id => new_resource.boot_options[:subnet]
      },
      :image_id => node[:machine][:image_id],
      :ssh_username => node[:machine][:production_settings]["#{new_resource.machine_name}".to_sym][:ssh_username],
      :aws_tags => set_ec2_tags
  }

  if node[:machine][:allow_web_access]
    machine_options[:bootstrap_options][:security_group_ids] = node[:machine][:security_groups][:enable_web_access]
  else
    machine_options[:bootstrap_options][:security_group_ids] = node[:machine][:security_groups][:disable_web_access]
  end

  machine_name = "#{new_resource.machine_name}-#{node[:machine][:stack]}-noint"
  if node[:machine][:action].eql?("destroy")
    machine_action = :destroy
  elsif node[:machine][:action].eql?("stop")
    machine_action = :stop
  else
    machine_action = :ready
  end

  machine machine_name do
    machine_options machine_options
    driver new_resource.driver
    action machine_action
  end

  aws_eip_address "assign_elastic_ip_to_#{machine_name}" do
    machine machine_name
    public_ip new_resource.elastic_ip
    not_if { machine_action.eql?(:destroy) || new_resource.elastic_ip.nil? }
  end

  ruby_block "set_ip_attribute_for_#{new_resource.machine_name}" do
    block do
      id = get_instance_id(machine_name)
      node.normal[:machine][:production_settings]["#{new_resource.machine_name}".to_sym][:ip] = get_public_ip_by_instance_id(id)
      puts "\n Public IP Address: " + node[:machine][:production_settings]["#{new_resource.machine_name}".to_sym][:ip]
    end
    action :run
    not_if { machine_action.eql?(:destroy) || machine_action.eql?(:stop)}
  end

end

action :vagrant do

  require "chef/provisioning/vagrant_driver"
  with_driver "vagrant"

  vagrant_box "opscode-centos-6.5" do
    url lazy { "#{node[:common][:nexus_url]}/repositories/filerepo/third-party/program/opscode/centos/6.5/centos-6.5-provisionerless.box" }
  end

  node.default[:machine][:production_settings]["#{new_resource.machine_name}".to_sym] = {
    "ssh_username" => new_resource.boot_options[:ssh_username],
    "ssh_key" => new_resource.boot_options[:ssh_key_path]
  }

  node.default[:machine][:production_settings]["#{new_resource.machine_name}".to_sym][:ssh_username] = "vagrant"
  node.default[:machine][:production_settings]["#{new_resource.machine_name}".to_sym][:ssh_key] = "#{ENV['HOME']}/Projects/vistacore/.vagrant.d/insecure_private_key"
  # For vagrant 1.4.3 and chefdk 0.4.0, the line below had to be changed to the line above
  # node.default[:machine][:production_settings][:ssh_key] = "#{ENV['HOME']}/Projects/vistacore/.chef/vms/.vagrant/machines/#{new_resource.machine_name}-#{node[:machine][:stack]}-noint/virtualbox/private_key"

  machine_options = {
    :vagrant_options => {
      'vm.box' => node[:machine][:box_name],
      'vm.network' => {
        'private_network' => {
          :ip => new_resource.boot_options[:ip_address]
        }
      },
      'ssh.insert_key' => false,
      'vm.provider' => {
        "virtualbox" => {
          :name => "#{new_resource.machine_name}-#{node[:machine][:stack]}"
        }.merge!(new_resource.boot_options[:provider_config])
      },
      'vm.synced_folder' => [
        {
          :host_path => "#{ENV['HOME']}/Projects/vistacore/.chef/cache/#{new_resource.machine_name}",
          :guest_path => "/var/chef/cache",
          :create => true
        },
        {
          :host_path => "#{ENV['HOME']}/Projects/vistacore/.chef/cookbook_cache/#{new_resource.machine_name}",
          :guest_path => "/var/chef/cache/cookbooks",
          :create => true
        }
      ].push(new_resource.boot_options[:shared_folders]).flatten!
    }
  }

  machine_name = "#{new_resource.machine_name}-#{node[:machine][:stack]}"
  if node[:machine][:action].eql?("destroy")
    machine_action = :destroy
  elsif node[:machine][:action].eql?("stop")
    machine_action = :stop
  else
    machine_action = :ready
  end

  chef_node "delete_#{machine_name}_to_clear_attributes" do
    name machine_name
    action :delete
    only_if { Chef::Node.load(machine_name).class.eql?(Chef::Node) rescue false }
    not_if { node[:machine][:action].eql?("destroy") || node[:machine][:action].eql?("stop") }
  end

  machine machine_name do
    machine_options machine_options
    driver new_resource.driver
    action machine_action
    run_list ["placeholder"]
  end

  chef_node "delete_#{machine_name}_on_destroy" do
    name machine_name
    action :delete
    only_if { node[:machine][:action].eql?("destroy") && Chef::Node.load(machine_name).class.eql?(Chef::Node) rescue false }
  end

  ruby_block "set_ip_attribute_for_#{new_resource.machine_name}" do
    block do
      node.normal[:machine][:production_settings]["#{new_resource.machine_name}".to_sym][:ip] = new_resource.boot_options[:ip_address]
    end
    action :run
    not_if { machine_action.eql?(:destroy) }
  end
end


def get_instance_id(machine_name)
  booted_node = search(:node, "name:#{machine_name}")[0].to_hash
  begin
    old_instance_id = booted_node["chef_provisioning"]["location"]["instance_id"]
  rescue
    new_instance_id = booted_node["chef_provisioning"]["reference"]["instance_id"]
  end
  return old_instance_id || new_instance_id
end

def get_public_ip_by_instance_id(id)
  Aws.config[:region] = "us-east-1"
  resp = Aws::EC2::Client.new.describe_instances({
  filters: [
    {
        name: "instance-id",
        values: [id],
    }]
  })
  resp.reservations[0].instances[0].public_ip_address
end
