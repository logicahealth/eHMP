#
# Cookbook: vx_solr
# Library: zookeeper_helper
#
# Copyright 2016, Vistacore
#

# this patch allows for zookeeper configuration that we use for solr zookeeper that is not supported by the 3rd party cookbook
# 1. allows different instances to have the same hostname
# 2. allows different port values for each instance
module ZookeeperClusterCookbook
  module Resource
    class ZookeeperConfig < Chef::Resource
      # add two properties two the resource, see usage below
      attribute(:instance_id, kind_of: Integer, required: true)
      attribute(:expanded_ensemble, kind_of: Array, required: true)

      # override the method that gets the id of an instance
      # avoid hostname search for calculating id, allowing instances to share a hostname
      def myid
        instance_id.to_s
      end

      # override the method that builds the config file content
      def to_s
        # avoid hostname seach for calculating id
        # get leader and election ports for each instance, instead of one value for all instances
        servers = []
        expanded_ensemble.each_with_index do |instance, index|
          id = index + 1
          servers << "server.#{id}:#{instance[:hostname]}:#{instance[:leader_port]}:#{instance[:election_port]}"
        end
        # the following is unchanged from 3rd party cookbook
        properties.merge(
          'dataDir' => data_dir,
          'leaderPort' => leader_port,
          'clientPort' => client_port,
          'electionPort' => election_port).map { |kv| kv.join('=') }.concat(servers).join("\n")
      end
    end
  end
end
