actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :host, :kind_of => String, :required => true
attribute :port, :kind_of => Integer, :required => true
attribute :reporter_type, :kind_of => String, :required => true
attribute :zk_hosts, :kind_of => Array, :required => true
attribute :zk_path, :kind_of => String, :required => true
attribute :check_interval, :kind_of => Integer, :required => true
attribute :checks, :kind_of => Array, :required => true



