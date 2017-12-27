#
# Cookbook Name:: workstation
# Recipe:: rhel
#
ENV['WORKSPACE'] = "#{node[:workstation][:user_home]}/Projects/vistacore"
ENV['GEM_HOME'] = node[:workstation][:rhel_gem_dir]
ENV['GEM_PATH'] = "#{ENV['GEM_HOME']}:#{ENV['GEM_PATH']}"
ENV['PATH'] = "/opt/chefdk/embedded/bin:#{ENV['GEM_HOME']}/bin:#{ENV['PATH']}"

include_recipe "nokogiri_wrapper"

include_recipe "chef-dk_wrapper"

include_recipe "java_wrapper"

include_recipe "gradle_wrapper"

include_recipe "phantomjs_wrapper"

# Removed by OSEHRA/SMH 26dec2017
#include_recipe "workstation::git"

include_recipe "build-essential"

include_recipe "xvfb_wrapper"

include_recipe "nodejs_wrapper"

include_recipe "nodejs_wrapper::node_6_dev_tools"

include_recipe "workstation::install_packages"

execute "correct ownership of gem home" do
	command "chown -R #{node[:workstation][:user]} #{ENV['GEM_HOME']}"
end

# Removed by OSEHRA/SMH 26dec2017
#include_recipe 'oracle_wrapper::client'

# Removed by OSEHRA/SMH 26dec2017
#include_recipe "workstation::slave_config"

include_recipe 'workstation::correct_package_ownership'

include_recipe 'workstation::workspace_scripts'
