#
# Cookbook Name:: workstation
# Recipe:: java_win
#
# Copyright 2016, Medicasoftllc
#
# All rights reserved - Do Not Redistribute
#

#node.default["workstation"]["java_win"]["app_name"]    = "JDK 8 Update 77"
#node.default["workstation"]["java_win"]["volumes_dir"] = "JDK 8 Update 77"
#node.default["workstation"]["java_win"]["package_id"]  = "JDK 8 Update 66.pkg"
node.default["workstation"]["java_win"]["url"]         = nil
#node.default["workstation"]["java_win"]["dmg_name"]    = "jdk-8u77-macosx-x64"
node.default["workstation"]["java_win"]["checksum"]    = "97acbab89ad1367a28954be428953ab179aece763c319b88d979068762bf72be"
node.default["workstation"]["java_win"]["java_home"]   = "c:/Program Files/Java/jdk1.8.0_77"

