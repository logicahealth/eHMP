The Machine Cookbook
=================
The machine cookbook is designed to be a utility for the provision cookbooks to include for base chef-provisioning functionality.  

The default recipe in this cookbook contains generic configurations to be used by any machine created using chef-provisioning. The default attributes file converts all the relevant environment variables to chef attributes and defines some base attributes to be used on the host chef-run.

Requirements
------------
#### Cookbooks
This cookbook depends only on the common cookbook, but is a dependency of all provision cookbooks.

#### Gems
- chef-provisioning "= 0.18" || "= 1.3.0"
- chef-provisioning-vagrant "= 0.0.9"
- chef-provisioning-aws "~> 1.3.1"
- chef-provisioning-ssh "~> 0.8.1"
- awscli
- aws-sdk

#### Other
- *Vagrant* (if using the 'vagrant' driver)
- *Amazon Web Services* credentials at ~/.aws/credentials and the aws-cli (if using the 'aws' driver)
- A data bag called "production_settings" with a data bag item that lists all the IP addresses and ssh connection credentials of the target machine (if specified by environment variable PRODUCTION_DATA_BAG)
```json
  {
    "machine-1": {
      "ip_address": "IPADDRESS,
      "ssh_username": "vagrant",
      "ssh_keyname": "~/.vagrant.d/insecure_private_key" 
    },
    "machine-2": {
      "ip_address": "IPADDRESS,
      "ssh_username": "vagrant",
      "ssh_keyname": "~/.vagrant.d/insecure_private_key" 
    }
  }
```

Usage
-----
#### machine::default
The default recipe of the machine cookbook depends on certain environment variables.  Although there are default values for each attribute, the recommendation is to control the values with environment variables.

Environment Variables (Attributes)
----------
<table>
  <tr>
    <th>Key</th>
    <th>Description</th>
    <th>Default</th>
  </tr>
  <tr>
    <td><tt>[:name]</tt></td>
    <td>Name of the machine</td>
    <td><tt>ENV['MACHINE_NAME'] || "all-machines"</tt></td>
  </tr>
  <tr>
    <td><tt>[:stack]</tt></td>
    <td>Name of the stack; either $JOB_NAME or $USER</td>
    <td><tt>ENV['JOB_NAME'] || ENV['USER']</tt></td>
  </tr>
  <tr>
    <td><tt>[:driver]</tt></td>
    <td>Driver to use when booting the machine</td>
    <td><tt>ENV['DRIVER'] || "vagrant"</tt></td>
  </tr>
  <tr>
    <td><tt>[:action]</tt></td>
    <td>Action to define in the creation of machine resources</td>
    <td><tt>ENV['ACTION'] || "converge"</tt></td>
  </tr>
  <tr>
    <td><tt>[:environment]</tt></td>
    <td>Chef environment to be used by the guest node</td>
    <td><tt>ENV['ENVIRONMENT'] || node.environment</tt></td>
  </tr>
  <tr>
    <td><tt>[:batch_action]</tt></td>
    <td>The action used in batch deploys using parallel machine_batch resources</td>
    <td><tt>"converge_only"</tt></td>
  </tr>
  <tr>
    <td><tt>[:allow_web_access]</tt></td>
    <td>Define whether or not to allow guest nodes to access the internet during deployment</td>
    <td><tt>ENV['ALLOW_WEB_ACCESS'] || false</tt></td>
  </tr>
  <tr>
    <td><tt>[:cache_upload]</tt></td>
    <td>Define whether or not to upload the cache of packages after the deployment</td>
    <td><tt>ENV['CACHE_UPLOAD'] || false</tt></td>
  </tr>
</table>

Standard Attributes
----------
<table>
  <tr>
    <th>Key</th>
    <th>Description</th>
    <th>Default</th>
  </tr>
  <tr>
    <td><tt>[:batch_action]</tt></td>
    <td>The action used in batch deploys using parallel machine_batch resources</td>
    <td><tt>"converge_only"</tt></td>
  </tr>
  <tr>
    <td><tt>[:convergence_options]</tt></td>
    <td>A hash of options to be passed to chef provisioning in ssh machine resources</td>
    <td><tt>
    {
      chef_config: "diff_disabled true\n",
      chef_version: "12.3.0"
    }
    </tt></td>
  </tr>
  <tr>
    <td><tt>[:copy_files]</tt></td>
    <td>A hash of :guest_path => :host_path files to copy onto the guest node machines as they are created</td>
    <td><tt>
    {
      "/etc/chef/host_key.pem" => ::Chef::Config.client_key
    }
    </tt></td>
  </tr>
  <tr>
    <td><tt>[:image_id]</tt></td>
    <td>Amazon Web Services image id used when booting into the aws environment</td>
    <td><tt>*depends on AWS account*</tt></td>
  </tr>
  <tr>
    <td><tt>[:box_name]</tt></td>
    <td>Vagrant box name used when booting into the vagrant environment</td>
    <td><tt>"opscode-centos-6.5"</tt></td>
  </tr>
  <tr>
    <td><tt>[:box_url]</tt></td>
    <td>URL to the box file on artifact server</td>
    <td><tt>*depends on Nexus url*</tt></td>
  </tr>
  <tr>
    <td><tt>[:production_settings]</tt></td>
    <td>Empty hash to later be overwritten by either a production settings data bag or the boot custom resource</td>
    <td><tt>{}</tt></td>
  </tr>
</table>

Custom Resources
----------------
#### machine_boot
This is a custom resource designed to boot a machine in either of the two supported environments (Vagrant and Amazon Web Services).  In a production environment where servers are managed by a 3rd party and out of the control of this project, this resource will do nothing (i.e.: action :ssh).

The following code should be added to each provisioner recipe and will boot a machine using the specified driver if the machine was not previously defined by the production settings data bag in the node[:machine][:production_settings] attribute.  The assumption is that either a data bag was not provided or the machine was not in the data bag and therefore, a new machine needs to be created.

```ruby
  machine_boot "boot #{machine_ident} machine to the #{node[:machine][:driver]} environment" do
    machine_name machine_ident
    boot_options boot_options
    driver node[:machine][:driver]
    action node[:machine][:driver]
    only_if { node[:machine][:production_settings][machine_ident.to_sym].nil? }
  end
```
Above, boot_options is a hash which contains the customized values for a given machine using a given driver which will define how a machine is booted.

#### machine_artifacts
This is a custom resource which will create a directory containing each of the artifacts defined by a given provision cookbook's attributes.  It is used in a recipe like the following:

```ruby
# Cookbook Name:: provisioner
# Recipe:: download_artifacts

machine_artifacts "download all artifacts defined by provisioner" do
  provisioner_cookbook "provisioner"
  action :download
end

```

Libraries (Classes)
------------
#### vagrant_options
This library is intended to modify the chef-provisioning-vagrant driver code during runtime.  This is a short term modification of the Chef::Provisioning::VagrantDriver::Driver.create_vm_file method which generates the .vm vagrantfile for a machine using chef-provisioning.  This modification is being made to extend the functionality of this method and enhance the readability of the code as opposed to alternative solutions provided by chef-provisioning.

The following options can be set in hash form:

```ruby 
{
  :vagrant_options => {
    :box => "vagrant-box-name",
    :network => {
      :private_network => {
        :ip => "IPADDRESS"
      }
    },
    :provider => {
      :virtualbox => {
        :name => "vbox-test-machine",
        :cpus => 4,
        :memory => 1024
      }
    },
    :synced_folder => [
      {
        :host_path => "#{ENV['HOME']}/Downloads",
        :guest_path => "/home/vagrant/Downloads",
        :create => true
      },
      {
        :host_path => "/var/chef/cache/cookbooks",
        :guest_path => "/var/chef/cache/cookbooks",
        :create => true
      }
    ]
  }
}
```
and applied to a machine resource using:

```ruby
machine "vbox-test-machine" do 
  machine_options name_of_hash_above
end
```

NOTE:  There are additional configuration options defined by chef-provisioning-vagrant, chef-provisioning and vagrant which can be set in the machine_options hash.  The best source of this information is https://github.com/chef/chef-provisioning, https://github.com/chef/chef-provisioning-vagrant and https://github.com/mitchellh/vagrant

#### vagrant_driver_chef_install
This library is intended to modify the chef-provisioning-vagrant driver code during runtime.  This is a short term modification of the Chef::Provisioning::VagrantDriver::Driver.convergence_strategy_for method which defines Convergence Strategy to use to install chef on guest nodes.  When this library is loaded, it will force Linux and Mac OS X machines to install chef using shell script rather than the default strategy of installed a cached package.

Libraries (Methods Only)
------------

#### artifact_url
This is a simple definition used to construct the REST url for Nexus artifacts.

#### set_ec2_tags
This is a simple definition used to construct a hash of EC2 tags to be used when provisioning a machine using the 'aws' driver.

License and Authors
-------------------
Authors: 
Team Milkyway <team-milkyway@vistacore.us>
