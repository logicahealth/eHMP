#
# Cookbook Name:: vista
# Resource:: install_distribution
#
# Loads and installs a distribution. Source can be either a remote URL or cookbook file.
#
# Assumptions: Distribution has not been previously loaded and waiting install
#
# see: http://www.DNS   /vdl/documents/Clinical/virtual_patient_record/vpr_ig.pdf for VPR install guide
#
#

actions :install
default_action :install

attribute :name, :kind_of => String, :required => true, :name_attribute => true
attribute :patch_list, :kind_of => String, :required => true
attribute :manifest_path, :kind_of => String, :default => "#{Chef::Config[:file_cache_path]}/kids-manifest.json"
attribute :log, :default => ''
attribute :run_checksums, :kind_of => [TrueClass, FalseClass],  :required => true
