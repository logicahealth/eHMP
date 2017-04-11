#
# Cookbook Name:: oracle_wrapper
# Recipe:: env_vars
#

# set env variables for the chef run, so sqlplus runs properly later in the run
ruby_block "oracle env variables" do
  block do
    ENV['ORACLE_HOME'] = node[:oracle][:rdbms][:ora_home]
    ENV['ORACLE_SID'] = node[:oracle_wrapper][:dbs][0]
    ENV['PATH'] = "#{ENV['ORACLE_HOME']}/bin:#{ENV['PATH']}"
  end
end
