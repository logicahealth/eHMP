actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :attempts, :kind_of => [Integer, String], :default => 30
