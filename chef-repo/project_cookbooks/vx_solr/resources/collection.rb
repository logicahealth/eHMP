actions :create, :delete
default_action :create

attribute :name, :kind_of => String, :name_attribute => true
attribute :num_shards, :kind_of => Integer, :default => 1
attribute :replication_factor, :kind_of => Integer, :default => 1
attribute :max_shards_per_node, :kind_of => Integer, :default => 2
attribute :allow_recreate, :kind_of =>[ TrueClass, FalseClass], :required => true
