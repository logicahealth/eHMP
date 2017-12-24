#
# Cookbook Name:: workstation
# Recipe:: java_osx
#

node.default["workstation"]["java_osx"]["app_name"]    = "JDK 8 Update 131"
node.default["workstation"]["java_osx"]["volumes_dir"] = "JDK 8 Update 131"
node.default["workstation"]["java_osx"]["package_id"]  = "JDK 8 Update 131.pkg"
node.default["workstation"]["java_osx"]["url"]         = nil
node.default["workstation"]["java_osx"]["dmg_name"]    = "jdk-8u131-macosx-x64"
node.default["workstation"]["java_osx"]["checksum"]    = "642aca454e10bea70a36a36f54cc5bac22267de78bf85c2d019b1fefbc023c43"
node.default["workstation"]["java_osx"]["java_home"]   = "/Library/Java/JavaVirtualMachines/jdk1.8.0_131.jdk/Contents/Home"