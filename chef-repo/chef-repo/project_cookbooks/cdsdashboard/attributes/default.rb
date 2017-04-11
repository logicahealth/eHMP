#
# Cookbook Name:: cdsdashboard
# Recipe:: default
#

default[:cdsdashboard][:fqdn] = "cdsdashboard.vistacore.us"

default[:cdsdashboard][:apache2_config][:port] = "443"

# Logging
default['tomcat']['logging']['sizeBasedTriggeringPolicy'] = "50MB"
default['tomcat']['logging']['defaultRolloverStrategy'] = "10"
