require 'net/http'
require 'json'

use_inline_resources

action :create do
  collections_url = "http://localhost:#{node[:solr][:port]}/solr/admin/collections"
  create_endpoint = collections_url + "?action=CREATE" +
                    "&name=#{new_resource.name}" +
                    "&numShards=#{new_resource.num_shards}" +
                    "&replicationFactor=#{new_resource.replication_factor}" +
                    "&maxShardsPerNode=#{new_resource.max_shards_per_node}"

  # get current collections
  cluster_status_url = "http://localhost:#{node[:solr][:port]}/solr/admin/collections?action=clusterstatus&wt=json"
  collections = JSON.parse(Net::HTTP.get_response(URI.parse(cluster_status_url)).body)["cluster"]["collections"]

  # if collection already exists, recreating is allowed, and config has changed,
  # delete the existing collection
  if !collections[new_resource.name].nil? and
      new_resource.allow_recreate and (
      new_resource.num_shards != collections[new_resource.name]["shards"].size or
      new_resource.replication_factor != collections[new_resource.name]["replicationFactor"].to_i or
      new_resource.max_shards_per_node != collections[new_resource.name]["maxShardsPerNode"].to_i)

    delete_endpoint = collections_url + "?action=DELETE" + "&name=#{new_resource.name}"

    http_request "delete the existing #{new_resource.name} collection" do
      url delete_endpoint
    end

    # set collection to nil so it gets recreated
    collections[new_resource.name] = nil
  end

  # if collection doesn't exist, create it
  if collections[new_resource.name].nil?
    http_request "create the #{new_resource.name} collection" do
      url create_endpoint
    end

    new_resource.updated_by_last_action(true)
  end
end
