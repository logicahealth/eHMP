#
# Cookbook Name:: oracle_wrapper
# Recipe:: swap
#

# add enough swap for oracle enterprise to be installed
swap_file '/mnt/swap' do 
  size node['oracle']['swap']
  persist true
end
