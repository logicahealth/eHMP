#
# Cookbook Name:: vagrant_wrapper
# Recipe:: set_ip
#

creds = data_bag_item("aws", "main")

aws_elastic_ip node[:ec2][:instance_id] do
  aws_access_key creds['aws_access_key_id']
  aws_secret_access_key creds['aws_secret_access_key']
  ip node[:aws][:elastic_ip]
  action :associate
  not_if { node[:aws_wrapper][:elastic_ip].nil? }
end
