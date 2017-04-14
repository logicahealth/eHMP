actions :exportcert, :importcert, :deletecert, :storepasswd, :importkeystore, :createstore
default_action :exportcert

attribute :additional, :kind_of => String
attribute :cert_alias, :kind_of => String
attribute :file, :kind_of => String
attribute :keystore, :kind_of => String, :required => true
attribute :keytool, :kind_of => String, :default => 'keytool'
attribute :new_pass, :kind_of => String
attribute :storepass, :kind_of => String, :required => true
attribute :storepass_file, :kind_of => String
attribute :keystore_alias, :kind_of => String
attribute :common_name, :kind_of => String
attribute :org_unit, :kind_of => String
attribute :org, :kind_of => String
attribute :location, :kind_of => String
attribute :country, :kind_of => String

# these attributes are specific to the :importkeystore action
attribute :srcstoretype, :kind_of => String
attribute :srcstorepass, :kind_of => String
