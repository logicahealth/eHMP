actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :config, :kind_of => String, :required => true
attribute :config_dir, :kind_of => String, :required => true
