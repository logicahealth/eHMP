actions :execute
default_action :execute

attribute :name, :kind_of => String, :name_attribute => true
attribute :url, :kind_of => String, :required => true, :name_attribute => true
attribute :attempts, :kind_of => Integer, :default => 10
attribute :attempt_delay, :kind_of => Integer, :default => 5
