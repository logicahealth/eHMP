#
# Cookbook Name:: jbpm
# Recipe:: default
#

default[:jbpm][:configure][:datasource] = "jbpmDS"
default[:jbpm][:configure][:activitydb_datasource] = "activityDbDS"
default[:jbpm][:configure][:security_domain] = "ehmp"
default[:jbpm][:configure][:processeventlistener] = "gov.va.jbpm.eventlisteners.CustomProcessEventListener"
default[:jbpm][:configure][:taskeventlistener] = "gov.va.jbpm.eventlisteners.CustomTaskEventListener"
