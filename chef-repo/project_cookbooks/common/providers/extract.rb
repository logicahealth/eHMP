#
# Cookbook Name:: common
# Provider:: extract
#

use_inline_resources

action :extract do

  dir = new_resource.directory
  extract_command = get_extract_command(new_resource.file)

  directory dir do
    owner new_resource.owner
    recursive true
  end

  file_basename = ::File.basename(new_resource.file)
  extract_success = "#{dir}/#{file_basename}.extracted"

  file extract_success do
    owner new_resource.owner
    action :nothing
  end

  extract_exec = execute "extract #{new_resource.file}" do
    cwd dir
    command "#{extract_command} #{new_resource.file}"
    user new_resource.owner
    action :run
    notifies :create, "file[#{extract_success}]", :immediately
  end

  new_resource.updated_by_last_action(true) if extract_exec.updated_by_last_action?
end

action :extract_if_missing do

  dir = new_resource.directory
  extract_command = get_extract_command(new_resource.file)

  directory dir do
    owner new_resource.owner
    recursive true
  end

  file_basename = ::File.basename(new_resource.file)
  extract_success = "#{dir}/#{file_basename}.extracted"

  file extract_success do
    owner new_resource.owner
    action :nothing
  end

  extract_exec = execute "extract if missing #{new_resource.file}" do
    cwd dir
    command "#{extract_command} #{new_resource.file}"
    user new_resource.owner
    action :run
    notifies :create, "file[#{extract_success}]", :immediately
    not_if { ::File.exist? extract_success }
  end

  new_resource.updated_by_last_action(true) if extract_exec.updated_by_last_action?
end

def get_extract_command(file)
  ext = ::File.extname(file)
  case ext
  when ".tgz", ".gz"
    extract_command = "tar -xzvf"
  when ".zip"
    extract_command = "unzip -o"
  else
    raise "#{ext} is not a supported extension for the common_extract provider"
  end
  return extract_command
end
