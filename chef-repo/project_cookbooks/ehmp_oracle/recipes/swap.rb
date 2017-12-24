#
# Cookbook Name:: oracle_wrapper
# Recipe:: swap
#

# add enough swap for oracle enterprise to be installed
swap_file '/mnt/swap' do
  size node['oracle']['swap']
  persist true
  only_if { node['ehmp_oracle']['swap']['include_swap'] }
end
