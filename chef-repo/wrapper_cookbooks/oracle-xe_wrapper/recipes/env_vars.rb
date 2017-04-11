#
# Cookbook Name:: oracle-xe_wrapper
# Recipe:: env_vars
#

# set env variables for the chef run, so sqlplus runs properly later in the run
ruby_block "oracle env variables" do
  block do
    ENV['ORACLE_HOME'] = "/u01/app/oracle/product/11.2.0/xe"
    ENV['ORACLE_SID'] = "XE"
    ENV['NLS_LANG'] = `#{ENV['ORACLE_HOME']}/bin/nls_lang.sh`
    ENV['PATH'] = "#{ENV['ORACLE_HOME']}/bin:#{ENV['PATH']}"
  end
end
