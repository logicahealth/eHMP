#
# Cookbook Name:: mocks
# Attributes:: hdr
#
#

default[:hdr][:req_res][:port] = 8896
default[:hdr][:req_res][:protocol] = "http"


default[:hdr][:pub_sub][:port] = 8999
default[:hdr][:pub_sub][:protocol] = "http"
default[:hdr][:pub_sub][:timeout] = 60000
