actions :create
default_action :create

attribute :application, :kind_of => String, :name_attribute => true
attribute :vista_sites, :kind_of => Array, :required => true
attribute :processes, :kind_of => Hash, :required => true
attribute :vxsync_environments, :kind_of => Array, default: nil
