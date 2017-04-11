actions :download

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :provisioner_cookbook, :kind_of => String, :required => false, :default => nil

