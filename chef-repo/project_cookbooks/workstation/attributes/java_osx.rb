#
# Cookbook Name:: workstation
# Recipe:: java_osx
#

node.default["workstation"]["java_osx"]["app_name"]    = "JDK 8 Update 121"
node.default["workstation"]["java_osx"]["volumes_dir"] = "JDK 8 Update 121"
node.default["workstation"]["java_osx"]["package_id"]  = "JDK 8 Update 121.pkg"
node.default["workstation"]["java_osx"]["url"]         = nil
node.default["workstation"]["java_osx"]["dmg_name"]    = "jdk-8u121-macosx-x64"
node.default["workstation"]["java_osx"]["checksum"]    = "82ff2493cd4b9ebdaeb9135abaffc9a37b71d341b007a83f73aa6ff3df1b6a3a"
node.default["workstation"]["java_osx"]["java_home"]   = "/Library/Java/JavaVirtualMachines/jdk1.8.0_121.jdk/Contents/Home"