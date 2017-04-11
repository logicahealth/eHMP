#
# Cookbook Name:: workstation
# Recipe:: java_osx
#

node.default["workstation"]["java_osx"]["app_name"]    = "JDK 8 Update 92"
node.default["workstation"]["java_osx"]["volumes_dir"] = "JDK 8 Update 92"
node.default["workstation"]["java_osx"]["package_id"]  = "JDK 8 Update 92.pkg"
node.default["workstation"]["java_osx"]["url"]         = nil
node.default["workstation"]["java_osx"]["dmg_name"]    = "jdk-8u92-macosx-x64"
node.default["workstation"]["java_osx"]["checksum"]    = "626c2d9478d07318e9e6b2c38707f73aeafc0f7a9ede575062749346a7d347ca"
node.default["workstation"]["java_osx"]["java_home"]   = "/Library/Java/JavaVirtualMachines/jdk1.8.0_92.jdk/Contents/Home"
