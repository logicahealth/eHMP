actions :aws, :vagrant, :ssh

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :machine_name, :kind_of => String, :required => true
attribute :driver, :kind_of => String, :default => "aws"
attribute :boot_options, :kind_of => Hash, :default => { :instance_type => "m3.medium" }
attribute :elastic_ip, :kind_of => String, :default => nil
