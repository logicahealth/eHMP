#
# Cookbook Name:: common
# Provider:: directory
#

require 'pathname'

use_inline_resources 

action :create do
  common_directory = []
  if new_resource.recursive
    Pathname.new(new_resource.path).descend do |directory_path|
      current_directory = directory directory_path do
        owner new_resource.owner
        group new_resource.group
        mode new_resource.mode
        path directory_path.to_s
        recursive true
        action :create
        not_if { ::Dir.exist?(directory_path) }
      end
      common_directory.push(current_directory.updated?)
    end
  else
    current_directory = directory directory_path do
      owner new_resource.owner
      group new_resource.group
      mode new_resource.mode
      path new_resource.path
      recursive false
      action :create
    end 
    common_directory.push(current_directory.updated?)
  end
  new_resource.updated_by_last_action(common_directory.any?)
end

action :delete do
  common_directory = directory new_resource.path do
    recursive new_resource.recursive
    action :delete
  end
  new_resource.updated_by_last_action(common_directory.updated_by_last_action?)
end
