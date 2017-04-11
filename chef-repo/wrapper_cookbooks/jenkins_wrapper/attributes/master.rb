#
# Cookbook Name:: jenkins_wrapper
# Attributes:: master
#

# We are running these on CentOS
# The master.rb attribute file in the jenkins cookbook sets the install type
# based on OS. If we decide to run Jenkins on a different platform, that would need to get set
# These values are only used on a CentOS/RedHat/Debian system. On other systems, the 
# ['jenkins']['master']['install_method'] attibute would need to be set as "war" 
# Refer to the jenkins cookbook for more information

default['jenkins']['master']['repository'] = "#{node[:nexus_url]}/nexus/content/repositories/yum-managed"
default['jenkins']['master']['repository_key'] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/program/jenkins-ci/jenkins-ci_org_key/redhat/jenkins-ci_org_key-redhat.key"
default['jenkins']['master']['version'] = "1.651.2-1.1"
