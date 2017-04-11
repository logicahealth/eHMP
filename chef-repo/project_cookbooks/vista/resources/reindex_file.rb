#
# Cookbook Name:: astronaut
# Resource:: reindex_file
#
# Reindexes a file (see mumps_block resource)
#

actions :create
default_action :create

attribute :log, :default => ''
attribute :file, :kind_of => String, :required => true
