#
# Cookbook Name:: workstation
# Recipe:: java_osx
#

node.default["workstation"]["java_osx"]["app_name"]    = "JDK 8 Update 66"
node.default["workstation"]["java_osx"]["volumes_dir"] = "JDK 8 Update 66"
node.default["workstation"]["java_osx"]["package_id"]  = "JDK 8 Update 66.pkg"
node.default["workstation"]["java_osx"]["url"]         = nil
node.default["workstation"]["java_osx"]["dmg_name"]    = "jdk-8u66-macosx-x64"
node.default["workstation"]["java_osx"]["checksum"]    = "cd416de4f41f9f0a6984c456481437681674a717da62259740c54732f174fa08"
node.default["workstation"]["java_osx"]["java_home"]   = "/Library/Java/JavaVirtualMachines/jdk1.8.0_66.jdk/Contents/Home"
