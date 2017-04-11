#
# Cookbook Name:: rubygems_wrapper
# Recipe:: remove_defaults
#

# gem_package sources
if node['rubygems']['gem_disable_default'] then
  execute "gem sources --remove https://rubygems.org" do
    only_if "gem sources --list | grep 'https://rubygems.org'"
  end.run_action(:run)
end

# chef_gem sources
if node['rubygems']['chef_gem_disable_default'] then
  execute "/opt/chef/embedded/bin/gem sources --remove https://rubygems.org/" do
    only_if "gem sources --list | grep 'https://rubygems.org'"
  end.run_action(:run)
end
