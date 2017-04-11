actions :add
default_action :add

attribute :list, :kind_of => Array, :required => true, :default => :mount
attribute :name, :kind_of => String, :name_attribute => true