#
# Cookbook Name:: nodejs_wrapper
# Recipe:: node_6_dev_tools
#

# Dependencies for installing native node modules:
yum_package 'centos-release-scl-rh'  # provides devtoolset-3-gcc-c++
yum_package 'scl-utils'  # provides scl
yum_package 'devtoolset-3-gcc-c++'  # provides c++11
yum_package 'python27'  # build dependency of node v4, so possible build dependency of node modules
