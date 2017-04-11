include_recipe "aws"

aws = data_bag_item("aws", "main")

aws_resource_tag node[:ec2][:instance_id] do
  aws_access_key aws['aws_access_key_id']
  aws_secret_access_key aws['aws_secret_access_key']
  tags(node[:ehmp_balancer][:aws][:tags])
end

ec2 = RightAws::Ec2.new(aws['aws_access_key_id'], aws['aws_secret_access_key'])

instance_info = ec2.describe_instances(node[:ec2][:instance_id])

instance_info[0][:block_device_mappings].each do |device|
  aws_resource_tag device[:ebs_volume_id] do
    aws_access_key aws['aws_access_key_id']
    aws_secret_access_key aws['aws_secret_access_key']
    tags(node[:ehmp_balancer][:aws][:tags])
    action :update
  end
end

# if node[:ehmp_ui][:aws].has_key?(:elastic_ip) && !node[:ehmp_ui][:aws][:elastic_ip].nil? && !node[:ehmp_ui][:aws][:elastic_ip].empty?
#   aws_elastic_ip "associate_ehmp_eip" do
#     aws_access_key aws['aws_access_key_id']
#     aws_secret_access_key aws['aws_secret_access_key']
#     ip node[:ehmp_ui][:aws][:elastic_ip]
#     action :associate
#   end

aws_elastic_ip "associate_ehmp_eip" do
  aws_access_key aws['aws_access_key_id']
  aws_secret_access_key aws['aws_secret_access_key']
  ip node[:ehmp_balancer][:aws][:elastic_ip]
  action :associate
  only_if { node[:ehmp_balancer][:aws].has_key?(:elastic_ip) && !node[:ehmp_balancer][:aws][:elastic_ip].nil? && !node[:ehmp_balancer][:aws][:elastic_ip].empty? }
end
