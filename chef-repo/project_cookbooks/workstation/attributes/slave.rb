#
# Cookbook Name:: workstation
# Recipe:: slave
#

default[:workstation][:slave][:executors] = "4"
default[:workstation][:slave][:launch_type] = 'jnlp'
