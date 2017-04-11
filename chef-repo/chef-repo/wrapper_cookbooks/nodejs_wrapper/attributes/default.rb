#
# Cookbook Name:: nodsjs_wrapper
# Attributes:: default
#
#

default[:nodejs][:version] = "0.10.40"
default[:nodejs][:install_method] = "binary"
default[:nodejs][:binary][:checksum] = "0bb15c00fc4668ce3dc1a70a84b80b1aaaaea61ad7efe05dd4eb91165620a17e"
default[:nodejs][:binary][:url] = "#{node[:nexus_url]}/nexus/content/repositories/filerepo/third-party/project/nodejs/node/v0.10.40/node-v0.10.40-linux-x64.tar.gz"
default[:nodejs][:checksum_linux_x64] = "0bb15c00fc4668ce3dc1a70a84b80b1aaaaea61ad7efe05dd4eb91165620a17e"
default[:nodejs][:checksum_linux_x86] = "59c1ea305239d6d42fc4b28e40cf4d2df81ebd9d7ab060c6e340e76518e0107d"
default[:nodejs][:source][:checksum] = "bae79c2fd959aebe1629af36077bebbb760128db753da226d2344cd91499149f"

