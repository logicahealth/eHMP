#
# Cookbook Name:: common
# Attributes:: _merge_db
#

unless node[:db_env].nil?
  node[:db_env].each do |bag_name, item_name|
    next if item_name.nil?
    attributes = Chef::EncryptedDataBagItem.load(bag_name, item_name, node[:data_bag_string]).to_hash
    attributes.each_key do |key|
      next if key == "id"
      node.override[key] = Chef::Mixin::DeepMerge.hash_only_merge(node[key], attributes[key])
    end
  end
end
