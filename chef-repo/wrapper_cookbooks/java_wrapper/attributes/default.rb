#
# Cookbook Name:: java_wrapper
# Attributes:: default
#
#

default["java"]["install_flavor"] = "oracle"
default["java"]["jdk_version"] = "8"
default["java"]["jdk"]["8"]["x86_64"]["url"] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/oracle/jdk/8u121-linux/jdk-8u121-linux-x64.tar.gz"
default["java"]["jdk"]["8"]["x86_64"]["checksum"] = "97e30203f1aef324a07c94d9d078f5d19bb6c50e638e4492722debca588210bc"
default["java"]["jdk"]["version"]["to"]["keep"] = "jdk1.8.0_121"
