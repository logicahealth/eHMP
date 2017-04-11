#
# Cookbook Name:: vagrant_wrapper
# Recipe:: set_tags
#

creds = data_bag_item("aws", "main")

aws_resource_tag node[:ec2][:instance_id] do
	aws_access_key creds['aws_access_key_id']
  aws_secret_access_key creds['aws_secret_access_key']
	tags(node[:aws_wrapper][:tags])
	not_if { node[:aws_wrapper][:tags].empty? }
end
