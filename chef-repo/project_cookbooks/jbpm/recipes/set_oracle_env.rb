#
# Cookbook Name:: jbpm
# Recipe:: set_oracle_env
#

ENV["PATH"] = "#{ENV['PATH']}:#{node['jbpm']['oracle_client_path']}"
ENV["LD_LIBRARY_PATH"] = "#{node['jbpm']['ld_library_path']}"
