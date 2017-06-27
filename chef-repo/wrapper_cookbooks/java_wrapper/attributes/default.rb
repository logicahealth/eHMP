#
# Cookbook Name:: java_wrapper
# Attributes:: default
#
#

default["java"]["install_flavor"] = "oracle"
default["java"]["jdk_version"] = "8"
#default["java"]["jdk"]["8"]["x86_64"]["url"] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/oracle/jdk/8u92-linux/jdk-8u92-linux-x64.tar.gz"
default["java"]["jdk"]["8"]["x86_64"]["url"] = "file:///opt/private_licenses/java/jdk-8u92-linux-x64.tar.gz"
default["java"]["jdk"]["8"]["x86_64"]["checksum"] = "79a3f25e9b466cb9e969d1772ea38550de320c88e9119bf8aa11ce8547c39987"
default["java"]["jdk"]["version"]["to"]["keep"] = "jdk1.8.0_92"
