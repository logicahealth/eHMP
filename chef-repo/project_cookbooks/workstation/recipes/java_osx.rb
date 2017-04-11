#
# Cookbook Name:: workstation
# Recipe:: java_osx
#

node.default["workstation"]["java_osx"]["url"] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/oracle/jdk/8u92-macosx/jdk-8u92-macosx-x64.dmg"


dmg_package "JavaOSx-Installer" do
  dmg_name node["workstation"]["java_osx"]["dmg_name"]
  app node["workstation"]["java_osx"]["app_name"]
  package_id node["workstation"]["java_osx"]["package_id"]
  volumes_dir node["workstation"]["java_osx"]["volumes_dir"]
  source node["workstation"]["java_osx"]["url"]
  checksum node["workstation"]["java_osx"]["checksum"]
  type "pkg"
  action :install
  not_if { File.directory? node["workstation"]["java_osx"]["java_home"] }
end
