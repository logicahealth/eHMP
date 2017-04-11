#
# Cookbook Name:: rdk
# Provider:: node_cluster
#

require 'chef/mixin/shell_out'
require 'chef/mixin/language'

include Chef::Mixin::ShellOut

def whyrun_supported?
  true
end

use_inline_resources 

action :create do

  jbpm_admin_password = Chef::EncryptedDataBagItem.load("credentials", "jbpm_admin_password", 'n25q2mp#h4')["password"]
  jbpm_nurseuser_password = Chef::EncryptedDataBagItem.load("credentials", "jbpm_nurseuser_password", 'n25q2mp#h4')["password"]
  jbpm_activitydbuser_password = Chef::EncryptedDataBagItem.load("credentials", "jbpm_activitydbuser_password", 'n25q2mp#h4')["password"]
  rdk_secure_passcode_list = Chef::EncryptedDataBagItem.load("resource_server", "config", 'n25q2mp#h4')["passcode"]

  cleanup_configuration_files

  template "/etc/init/#{new_resource.name}.conf" do
    variables(
      :name => new_resource.name,
      :level =>  new_resource.run_level
    )
    source new_resource.service_template
    notifies :restart, "service[#{new_resource.name}]"
  end

  service "#{new_resource.name}" do
    provider Chef::Provider::Service::Upstart
    restart_command "/sbin/stop #{new_resource.name}; /sbin/start #{new_resource.name}"
    action :enable
  end

  template "/etc/bluepill/#{new_resource.name}.pill" do
    source new_resource.cluster_template
    variables(
      :name => new_resource.name,
      :working_directory => new_resource.working_directory,
      :deploy_path => new_resource.deploy_path,
      :config_file => new_resource.config_file,
      :port => new_resource.port,
      :dev_deploy => new_resource.dev_deploy,
      :debug_port => new_resource.debug_port,
      :processes => new_resource.processes,
      :log_directory => node[:rdk][:log_dir]
    )
    notifies :restart, "service[#{new_resource.name}]"
  end

  template("#{new_resource.config_file}.json") do
    source "#{::File.basename(new_resource.config_file)}.json.erb"
    variables(
      :jds => find_node_by_role("jds", node[:stack]),
      :pjds => find_node_by_role("pjds", node[:stack], "jds"),
      :solr => find_node_by_role("solr", node[:stack], "mocks"),
      :vxsync => find_node_by_role("vxsync", node[:stack]),
      :vhic => find_node_by_role("vhic", node[:stack], "mocks"),
      :mvi => find_node_by_role("mvi", node[:stack], "mocks"),
      :jbpm => find_optional_node_by_role("jbpm", node[:stack]),
      :cdsinvocation => find_optional_node_by_role("cdsinvocation", node[:stack]),
      :cdsdb => find_optional_node_by_role("cdsdb", node[:stack]),
      :vista_sites => find_multiple_nodes_by_role("vista*", node[:stack]),
      :log_directory => node[:rdk][:log_dir],
      :secure_passcode_list => rdk_secure_passcode_list,
      :jbpm_admin_password => jbpm_admin_password,
      :jbpm_nurseuser_password => jbpm_nurseuser_password,
      :jbpm_activitydbuser_password => jbpm_activitydbuser_password,
      :port => new_resource.port,
      :complex_note_port => node[:rdk][:complex_note_port],
      :index => 0
    )
    mode '0644'
    notifies :restart, "service[#{new_resource.name}]"
  end

  1.upto(new_resource.processes) {|index|
    template("#{new_resource.config_file}-#{index}.json") do
      source "#{::File.basename(new_resource.config_file)}.json.erb"
      variables(
        :jds => find_node_by_role("jds", node[:stack]),
        :pjds => find_node_by_role("pjds", node[:stack], "jds"),
        :solr => find_node_by_role("solr", node[:stack], "mocks"),
        :vxsync => find_node_by_role("vxsync", node[:stack]),
        :vhic => find_node_by_role("vhic", node[:stack], "mocks"),
        :mvi => find_node_by_role("mvi", node[:stack], "mocks"),
        :jbpm => find_optional_node_by_role("jbpm", node[:stack]),
        :cdsinvocation => find_optional_node_by_role("cdsinvocation", node[:stack]),
        :cdsdb => find_optional_node_by_role("cdsdb", node[:stack]),
        :vista_sites => find_multiple_nodes_by_role("vista*", node[:stack]),
        :log_directory => node[:rdk][:log_dir],
        :secure_passcode_list => rdk_secure_passcode_list,
        :jbpm_admin_password => jbpm_admin_password,
        :jbpm_nurseuser_password => jbpm_nurseuser_password,
        :jbpm_activitydbuser_password => jbpm_activitydbuser_password,
        :port => new_resource.port - 1 + index,
        :fetch_host => "localhost:#{node[:rdk][:fetch_server][:port]}",
        :write_back_host => "localhost:#{node[:rdk][:write_back][:port]}",
        :pick_list_host => "localhost:#{node[:rdk][:pick_list][:port]}",
        :complex_note_port => node[:rdk][:complex_note_port],
        :index => index
      )
      mode '0644'
    end
  }

end

action :start do
  unless @current_resource.running
    converge_by("start #{ @new_resource }") do
      shell_out!(start_command)
    end
  end
end

action :stop do
  if @current_resource.running
    converge_by("stop #{ @new_resource }") do
      shell_out!(stop_command)
    end
  end
end

action :restart do
  converge_by("restart #{ @new_resource }") do
    Chef::Log.debug "Restarting #{new_resource.name}"
    shell_out!(restart_command)
    Chef::Log.debug "Restarted #{new_resource.name}"
  end
end

def load_current_resource
  @current_resource = Chef::Resource::RdkNodeCluster.new(new_resource.name)
  @current_resource.name(new_resource.name)

  Chef::Log.debug("Checking status of node_process #{new_resource.name}")

  determine_current_status!

  @current_resource
end

protected

def start_command
  "/sbin/start #{new_resource.name}"
end

def stop_command
  "/sbin/stop #{new_resource.name}"
end

def restart_command
  "/sbin/stop #{new_resource.name}; /sbin/start #{new_resource.name}"
end

def status_command
  "/sbin/status #{new_resource.name} | grep running"
end

def cleanup_configuration_files
  if process_count_lower?
    # Remove extra config files if the current number of processes
    # is lower than the existing number of processes
    begin
      process_config_files.each {|config_file|
        File.delete config_file
      }
    rescue
      Chef::Log.warn "failed to remove old configuration file... manual cleanup may be required"
    end
  end
end

def process_count_lower?
  previous_process_count = Dir.glob("#{new_resource.config_file}-*.json").size
  new_resource.processes < previous_process_count
end

def process_config_files
  config_files = Dir.glob("#{new_resource.config_file}-*.json").sort!
  config_files.slice!(0, new_resource.processes)
  return config_files
end

def determine_current_status!
  node_process_running?
  node_process_enabled?
end

def node_process_running?
  begin
    if shell_out(status_command).exitstatus == 0
      @current_resource.running true
      Chef::Log.debug("#{new_resource} is running")
    end
  rescue Mixlib::ShellOut::ShellCommandFailed, SystemCallError
    @current_resource.running false
    nil
  end
end

def node_process_enabled?
  if ::File.exists?("/etc/bluepill/#{new_resource.name}.pill") &&
      ::File.symlink?("/etc/init/#{new_resource.name}.conf")
    @current_resource.enabled true
  else
    @current_resource.enabled false
  end
end
