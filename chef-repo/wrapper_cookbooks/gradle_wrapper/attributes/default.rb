#
# Cookbook Name:: gradle_wrapper
# Attributes:: default
#
#

default[:gradle][:url] = "http://nexus.osehra.org:8081/nexus/content/repositories/filerepo/third-party/program/gradle/gradle/2.4/gradle-2.4-bin.zip"
default[:gradle][:version] = "2.4"
default[:gradle][:checksum] = "c4eaecc621a81f567ded1aede4a5ddb281cc02a03a6a87c4f5502add8fc2f16f"
default[:gradle][:home] = "/usr/local/gradle/gradle-#{node[:gradle][:version]}"
