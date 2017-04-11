#
# Cookbook: rc
# License: Apache 2.0
#
# Copyright 2015-2016, Bloomberg Finance L.P.
#

if Chef::Resource::ChefGem.instance_methods(false).include?(:compile_time)
  chef_gem 'edn' do
    version '~> 1.1'
    compile_time true
  end

  chef_gem 'toml' do
    version '~> 0.1.2'
    compile_time true
  end

  chef_gem 'java-properties' do
    version '~> 0.1'
    compile_time true
  end

  chef_gem 'iniparse' do
    version '~> 1.4'
    compile_time true
  end
else
  chef_gem 'edn' do
    version '~> 1.1'
    action :nothing
  end.action(:install)

  chef_gem 'toml' do
    version '~> 0.1'
    action :nothing
  end.action(:install)

  chef_gem 'java-properties' do
    version '~> 0.1'
    action :nothing
  end.action(:install)

  chef_gem 'iniparse' do
    version '~> 1.4'
    action :nothing
  end.action(:install)
end
