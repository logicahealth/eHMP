#
# Cookbook Name:: dockerhost
# Recipe:: default
#
# Copyright 2016, Vistacore
#
# All rights reserved - Do Not Redistribute
#

yum_repository 'docker' do
  description 'Docker Repository'
  baseurl 'https://yum.dockerproject.org/repo/main/centos/7/'
  gpgkey 'https://yum.dockerproject.org/gpg'
  enabled true
  gpgcheck true
  action :create
end


docker_installation_package 'default' do
  version node['dockerhost']['version']
  action :create
end

docker_service 'default' do
  host [ 'tcp://0.0.0.0:443', 'unix:///var/run/docker.sock' ]
  action [:create, :start]
end

chef_gem 'chef-vault' do
  version '2.6.1'
end

require 'chef-vault'

aws = ChefVault::Item.load(
  'jenkins', 'aws',
  node_name: 'jenkins',
  client_key_path: '/jenkins.pem'
).to_hash

directory '/root/.aws' do
  owner 'root'
  group 'root'
  mode '0755'
end


template '/root/.aws/credentials' do
  source 'aws_credentials.erb'
  variables(
    :aws => aws
  )
  owner 'root'
  group 'root'
  mode '0755'
end

template '/root/.aws/config' do
  source 'aws_config.erb'
  variables(
    :aws => aws
  )
  owner 'root'
  group 'root'
  mode '0755'
end

include_recipe 'awscli'

execute 'login_into_ecr' do
  command 'eval $(aws ecr get-login --region us-east-1)'
end

execute 'pull_image' do
  command 'docker pull 241688162785.dkr.ecr.us-east-1.amazonaws.com/jenkins-slave:latest'
end

# docker_image has a bug and is not working
# docker_image "jenkins-slave" do
# repo '241688162785.dkr.ecr.us-east-1.amazonaws.com/jenkins-slave'
# tag 'latest'
# action :pull
# end
