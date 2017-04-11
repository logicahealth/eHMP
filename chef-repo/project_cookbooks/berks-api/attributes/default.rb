#
# Cookbook Name:: berks-api
# Attributes:: default
#

default[:'berks-api'][:berkshelf_api_url] = "http://0.0.0.0:26200"
default[:'berks-api'][:chef_server_url] = "https://chef.vaftl.us/organizations/vistacore"
default[:'berks-api'][:berks_api_install_dir] = "/opt/chefdk/embedded/bin"
