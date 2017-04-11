actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :upload_url, :kind_of => String, :required => true
attribute :yum_cache_path, :kind_of => String, :default => "#{Chef::Config['file_cache_path']}/yum"
