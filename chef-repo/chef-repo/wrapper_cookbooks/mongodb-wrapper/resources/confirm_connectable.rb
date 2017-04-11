actions :execute
default_action :execute

attribute :name, :kind_of => String, :name_attribute => true
attribute :connection, :kind_of => Hash
attribute :attempts, :kind_of => [Integer, String], :default => 10

