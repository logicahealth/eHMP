#
# Cookbook Name:: rdk
# Resources:: node_cluster
#

# Actions handled by this resource
actions :create, :delete, :start, :stop, :restart
default_action :create

# Required attributes
attribute :deploy_path, :kind_of => String, :required => true
attribute :config_file, :kind_of => String, :required => true
attribute :working_directory, :kind_of => String, :required => true
attribute :port, :kind_of => Integer, :required => true

# Optional attributes
attribute :name, :kind_of => String, :name_attribute => true
attribute :run_level, :kind_of => String, :default => '2345'
attribute :processes, :kind_of => Integer, :default => 1
attribute :dev_deploy, :kind_of => [TrueClass, FalseClass], :default => false
attribute :debug_port, :kind_of => Integer, :default => 5858
attribute :service_template, :kind_of => String, :default => "upstart-node_process.erb"
attribute :cluster_template, :kind_of => String, :default => "node_process-cluster.pill.erb"
attribute :enabled, :default => false
attribute :running, :default => false
