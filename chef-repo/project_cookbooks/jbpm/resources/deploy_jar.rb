actions :execute
default_action :execute

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :max_attempts, :kind_of => [Integer, String], :default => 20
attribute :user, :kind_of => String, :default => node[:jbpm][:install][:admin_user]
attribute :password, :kind_of => String, :required => true
attribute :group_id, :kind_of => String, :required => true
attribute :artifact_id, :kind_of => String, :required => true
attribute :version, :kind_of => String, :required => true
attribute :jar_source, :kind_of => String, :required => true


attribute :owner, :kind_of => String, :default => 'root'
attribute :group, :kind_of => String, :default => 'root'
attribute :mode, :kind_of => String, :default => '0755'