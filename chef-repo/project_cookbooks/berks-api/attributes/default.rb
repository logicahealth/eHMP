#
# Cookbook Name:: berks-api
# Attributes:: default
#

default[:'berks-api'][:berkshelf_api_url] = "http://0.0.0.0:26200"
default[:'berks-api'][:chef_server_url] = "https://pantry.vistacore.us/organizations/vistacore"
default[:'berks-api'][:berks_api_install_dir] = "/root/.chefdk/gem/ruby/2.3.0/bin"
default[:'berks-api'][:gem_binary] = "/opt/chefdk/embedded/bin/gem"
