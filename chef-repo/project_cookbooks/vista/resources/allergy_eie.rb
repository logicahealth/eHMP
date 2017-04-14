#
# Cookbook Name:: vista
# Resource:: allergy_eie
#

actions :update
default_action :update

attribute :log, :kind_of => IO, :default => STDOUT
attribute :full_name, :kind_of => String, :required => true
attribute :eie_allowed, :kind_of => [TrueClass, FalseClass], :required => true
