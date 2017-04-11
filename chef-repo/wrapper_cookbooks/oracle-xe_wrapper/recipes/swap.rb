#
# Cookbook Name:: oracle-xe_wrapper
# Recipe:: swap
#

# add enough swap for oracle-xe to be installed
swap_file '/mnt/swap' do 
  size 2048
  persist true
end
