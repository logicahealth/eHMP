#
# Cookbook Name:: packages
# Recipe:: correct_ruby
#

# set path at the very start of the chef run

ENV['PATH'] = "/opt/chef/embedded/bin:#{ENV['PATH']}"
