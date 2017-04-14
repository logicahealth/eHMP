# Cookbook Name:: asu
# Recipe:: default
#

# Blank recipe for reset_sync. 
#
# When vxsync::reset_sync is run the asu attributes of the
# vxsync node get cleared. This is only a problem locally
# as in aws we don't run reset_sync. Therefore, including this
# recipe to the runlist for reset_sync will allow asu default
# attributes to get loaded onto the node. This is helpful when
# rdk does a find_node for asu attributes

