#
# Cookbook Name:: ehmp_oracle
# Attributes:: default
#

default['ehmp_oracle']['oracle_service'] = node['ehmp_oracle']['oracle_cookbook'] == "oracle_wrapper" ? "oracle" : "oracle-xe"
default['ehmp_oracle']['mssql_database'] = "ehmp"