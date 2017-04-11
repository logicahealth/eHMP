#
# Cookbook Name:: java_wrapper
# Attributes:: default
#
#

default["java"]["install_flavor"] = "oracle"
default["java"]["jdk_version"] = "8"
# default["java"]["jdk"]["8"]["x86_64"]["url"] = "#{node[:nexus_url]}/nexus/content/repositories/ehmp/filerepo/third-party/project/oracle/jdk/8u66-linux/jdk-8u66-linux-x64.tar.gz"
default["java"]["jdk"]["8"]["x86_64"]["url"] = "file:///opt/private_licenses/java/jdk-8u66-linux-x64.tar.gz"
default["java"]["jdk"]["8"]["x86_64"]["checksum"] = "7e95ad5fa1c75bc65d54aaac9e9986063d0a442f39a53f77909b044cef63dc0a"
default["java"]["jdk"]["version"]["to"]["keep"] = "jdk1.8.0_66"
