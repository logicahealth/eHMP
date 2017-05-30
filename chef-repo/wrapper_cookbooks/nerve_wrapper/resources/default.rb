actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :host, :kind_of => String, :default => "localhost"
attribute :service_type, :kind_of => String, :required => true
attribute :port, :kind_of => Integer, :required => true
attribute :reporter_type, :kind_of => String, :default => "zookeeper"
attribute :service_type, :kind_of => String, :required => true
attribute :check_interval, :kind_of => Integer, :required => true
attribute :checks, :kind_of => Array, :required => true



