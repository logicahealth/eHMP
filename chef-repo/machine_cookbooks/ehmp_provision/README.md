ehmp_provision Cookbook
=======================

This is the provisioner cookbook for the ehmp machine. The ehmp_provision cookbook boots a new machine using the vagrant/aws chef-provisioning providers or does not boot, and then provisions them using the ssh-provider.


Requirements
------------
###Cookbooks
- machine
- jds
- vx_solr
- mocks
- vista
- osync
- vxsync

Attributes
----------

#### ehmp_provision::default
<table>
  <tr>
    <th>Key</th>
    <th>Type</th>
    <th>Description</th>
    <th>Default</th>
  </tr>
  <tr>
    <td><tt>[:ehmp_provision][:machines]</tt></td>
    <td>String Array</td>
    <td>List of machines deployed from this cookbook</td>
    <td><tt>["jds", "solr", "mocks", "vista-kodak", "vista-panorama"]</tt></td>
  </tr>
</table>

#### ehmp_provision::cookbook\_versions
<table>
  <tr>
    <th>Key</th>
    <th>Type</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><tt>[:ehmp_provision][:cookbook_versions]</tt></td>
    <td>Hash</td>
    <td>Cookbook => Version for all project cookbooks required by ehmp_provision</td>
  </tr>
</table>

#### ehmp_provision::artifacts
<table>
  <tr>
    <th>Key</th>
    <th>Type</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><tt>[:ehmp_provision][:artifacts]</tt></td>
    <td>Hash of hashes</td>
    <td>The artifacts that are downloaded and used by this cookbook</td>
  </tr>
</table>

#### ehmp_provision::jds
<table>
  <tr>
    <th>Key</th>
    <th>Type</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><tt>[:ehmp_provision][:jds][:aws][:instance_type]</tt></td>
    <td>String</td>
    <td>The aws instance type for the machine to boot into</td>
  </tr>
  <tr>
  <td><tt>[:ehmp_provision][:jds][:aws][:subnet]</tt></td>
    <td>String</td>
    <td>The aws subnet associated with the machine</td>
  </tr>
  <tr>
  <td><tt>[:ehmp_provision][:jds][:aws][:ssh_username]</tt></td>
    <td>String</td>
    <td>The aws username associated with the machine</td>
  </tr>
  <tr>
  <td><tt>[:ehmp_provision][:jds][:aws][:ssh_keyname]</tt></td>
    <td>String</td>
    <td>The name of the aws key associated with the machine</td>
  </tr>
  <tr>
  <td><tt>[:ehmp_provision][:jds][:aws][:ssh_key_path]</tt></td>
    <td>String</td>
    <td>The path to the aws key associated with the machine</td>
  </tr>
  <tr>
  <td><tt>[:ehmp_provision][:jds][:vagrant][:ip_address]</tt></td>
    <td>String</td>
    <td>The ip address associated with the vagrant box</td>
  </tr>
  <tr>
  <td><tt>[:ehmp_provision][:jds][:vagrant][:provider_config]</tt></td>
    <td>Hash</td>
    <td>Machine options to pass to the vagrant box. e.g, :memory => 1024</td>
  </tr>
  <tr>
  <td><tt>[:ehmp_provision][:jds][:vagrant][:copy_files]</tt></td>
    <td>Hash</td>
    <td>Files to copy onto the vagrant box in the form guest_path => host_path</td>
  </tr>
  <tr>
  <td><tt>[:ehmp_provision][:jds][:vagrant][:shared_folders]</tt></td>
    <td>Array</td>
    <td>Folders shared between the host and guest</td>
  </tr>
  </table>

Usage
-----
Call the ehmp_provision::default recipe directly. This recipe includes the machine cookbook, which sets necessary attributes such as machine\_name. Then, the machine-recipe within ehmp\_provision will get included.

Refer to the machine cookbook to see which environment variables need to be set beforehand.

e.g.
MACHINE_NAME=jds chef-client -o ehmp\_provision::default

License and Authors
-------------------
Authors:
Team Milkyway <team-milkyway@vistacore.us>