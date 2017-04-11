#
# Cookbook Name:: workstation
# Recipe:: rhel
#

include_recipe "nokogiri_wrapper"

include_recipe "chef-dk_wrapper"

include_recipe "java_wrapper"

include_recipe "gradle_wrapper"

include_recipe "phantomjs_wrapper"

include_recipe "workstation::git"

include_recipe "build-essential"

include_recipe "firefox_wrapper"

include_recipe "xvfb_wrapper"

include_recipe "nodejs_wrapper"

include_recipe "workstation::install_packages"

execute "correct ownership of gem home" do
	command "chown -R #{node[:workstation][:user]} #{node[:workstation][:user_home]}/Projects/vistacore/.gems"
end

include_recipe 'oracle_wrapper::client'

include_recipe "workstation::slave_config"
