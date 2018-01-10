#
# Cookbook Name:: java_wrapper
# Attributes:: default
#
#

default["java"]["install_flavor"] = "oracle"
default["java"]["jdk_version"] = "8"
default["java"]["jdk"]["8"]["x86_64"]["url"] = "http://nexus.osehra.org:8081/nexus/content/repositories/filerepo/third-party/project/oracle/jdk/8u131-linux/jdk-8u131-linux-x64.tar.gz"
default["java"]["jdk"]["8"]["x86_64"]["checksum"] = "62b215bdfb48bace523723cdbb2157c665e6a25429c73828a32f00e587301236"
default["java"]["jdk"]["version"]["to"]["keep"] = "jdk1.8.0_131"
