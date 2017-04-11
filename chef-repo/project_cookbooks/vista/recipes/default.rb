#
# Cookbook Name:: vista
# Recipe:: default
#

# Configure the apache attribute with https port
node.normal[:apache] = {
  "default_site_enabled" => true,
  "package" => "httpd",
  "listen_ports" => [
    "80",
    "443"
  ]
}

# Include apache2 cookbook and necessary modules
include_recipe "apache2"
include_recipe "apache2::mod_rewrite"
include_recipe "apache2::mod_ssl"
include_recipe "apache2::mod_wsgi"

# Set selinux to permissive and install iptables
include_recipe "selinux::permissive"
include_recipe "simple_iptables"

# Configure iptables to allow https connections
simple_iptables_rule "http" do
  rule [ "--proto tcp --dport 443" ]
  jump "ACCEPT"
end

# Install dos2unix
case node[:platform]
when "centos", "redhat", "fedora", "suse"
  yum_package "dos2unix" do
    not_if "rpm -qa | grep dos2unix"
  end
end

gem_package 'greenletters'

# Include vista recipes to install cache and configure the vistas
include_recipe 'vista::unzip_hmp'
include_recipe 'vista::cache'
include_recipe "vista::#{node[:vista][:site_recipe]}"
include_recipe "vista::apache2"
include_recipe "vista::fmql"
include_recipe "vista::import_#{node[:vista][:import_recipe]}"
include_recipe "vista::rollingdates"
