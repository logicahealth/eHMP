actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :file_name, :kind_of => String, :required => true
attribute :file_type, :kind_of => String, :required => true
attribute :file_path, :kind_of => String, :required => true
attribute :log, :kind_of => IO, :default => ''
