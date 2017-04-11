#
# Cookbook Name:: workstation
# Recipe:: slave
#

chef_gem 'chef-vault' do
  version '2.6.1'
end

require 'chef-vault'

ENV['WORKSPACE'] = "#{node[:workstation][:user_home]}/Projects/vistacore"
ENV['GEM_HOME'] = "#{ENV['WORKSPACE']}/.gems"
ENV['GEM_PATH'] = "#{ENV['GEM_HOME']}:#{ENV['GEM_PATH']}"
ENV['PATH'] = "#{ENV['GEM_HOME']}/bin:#{ENV['PATH']}"

git = ChefVault::Item.load(
  "jenkins", "git",
  node_name: 'jenkins',
  client_key_path: "/jenkins.pem"
).to_hash
git_credentials = git['credentials']

aws = ChefVault::Item.load(
  "jenkins", "aws",
  node_name: 'jenkins',
  client_key_path: "/jenkins.pem"
).to_hash

authentication = ChefVault::Item.load(
  "jenkins", "authentication",
  node_name: 'jenkins',
  client_key_path: "/jenkins.pem"
).to_hash
node.run_state[:jenkins_username] = authentication["credentials"]["username"]
node.run_state[:jenkins_password] = authentication["credentials"]["password"]

include_recipe "java_wrapper"

jenkins_jnlp_slave node[:stack] do
  remote_fs "/var/lib/jenkins"
  executors 4
  availability "always"
  labels [node[:stack],node[:platform_family]]
  action [:create, :connect]
end

template '/var/lib/jenkins/.netrc' do
  source 'netrc.erb'
  variables(
    :stash_fqdn => "code.vistacore.us",
    :git_credentials => git_credentials
  )
  owner node[:workstation][:user]
  group node[:workstation][:user]
  mode "0755"
end

directory "#{node[:workstation][:user_home]}/.aws" do
 owner node[:workstation][:user]
  group node[:workstation][:user]
  mode "0755"
end


template "#{node[:workstation][:user_home]}/.aws/credentials" do
  source "aws_credentials.erb"
  variables(
    :aws => aws
  )
  owner node[:workstation][:user]
  group node[:workstation][:user]
  mode "0755"
end

template "#{node[:workstation][:user_home]}/.aws/config" do
  source "aws_config.erb"
  variables(
    :aws => aws
  )
  owner node[:workstation][:user]
  group node[:workstation][:user]
  mode "0755"
end

template '/var/lib/jenkins/.npmrc' do
  source 'npmrc.erb'
  owner node[:workstation][:user]
  group node[:workstation][:user]
  mode "0755"
end

include_recipe "awscli"
include_recipe "newrelic_wrapper"

