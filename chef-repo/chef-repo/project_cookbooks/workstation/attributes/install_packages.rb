#
# Cookbook Name:: workstation
# Recipe:: install_packages
#

default[:workstation][:install_packages][:npm_packages] = {
  "grunt-cli" => "0.1.7",
  "bower" => "1.3.12",
  "bower-installer" => "1.2.0"
}

default[:workstation][:install_packages][:gem_packages] = {
  "compass" => ["0.12.6"],
  "breakpoint" => ["2.0.7"],
  "sass" => ["3.2.9"],
  "oauth" => ["0.4.7"],
  "bundler" => ["1.10.5"],
  "nokogiri" => ["1.5.11"],
  "greenletters" => ['0.3.0'],
  "nexus" => ['1.2.1'],
  "deep_merge" => ['1.0.1'],
  "rake" => ["11.3.0"]
}

default[:workstation][:install_packages][:yum_packages] = [
  "libxml2",
  "libxml2-devel",
  "libxslt",
  "libxslt-devel"
]
