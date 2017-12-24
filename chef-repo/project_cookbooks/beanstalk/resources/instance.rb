actions :create
default_action :create

attribute :vxsync_application, :kind_of => String, :name_attribute => true
attribute :home_dir, :kind_of => String, :required => true
attribute :beanstalk_processes, :kind_of => Hash, :required => true
attribute :beanstalk_dir, :kind_of => String, :required => true
attribute :log_dir, :kind_of => String, :required => true
attribute :bluepill_log_dir, :kind_of => String, :required => true
attribute :user, :kind_of => String, :required => true
attribute :group, :kind_of => String, :required => true