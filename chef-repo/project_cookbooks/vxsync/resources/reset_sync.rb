actions :execute
default_action :execute

attribute :name, :kind_of => String, :name_attribute => true
attribute :reset, kind_of: [TrueClass, FalseClass], default: false

