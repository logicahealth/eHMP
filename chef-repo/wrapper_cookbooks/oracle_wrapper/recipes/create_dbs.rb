#
# Cookbook Name:: oracle_wrapper
# Recipe:: create_dbs
#

# most of this recipe is taken from the createdb recipe from the third party cookbook
# changes and additions are made to support version 11.2.0.1 and make the recipe idempotent and are marked with comments
# see original recipe for original comments

directory node[:oracle][:rdbms][:dbs_root] do
  owner 'oracle'
  group 'oinstall'
  mode '0755'
end

template "#{node[:oracle][:rdbms][:ora_home]}/assistants/dbca/templates/default_template.dbt" do
  owner 'oracle'
  group 'oinstall'
  mode '0644'
  variables({
  :archiveLogMode => node[:oracle_wrapper][:archive_log_mode]
  })
end

template "#{node[:oracle][:rdbms][:ora_home]}/assistants/dbca/templates/midrange_template.dbt" do
  owner 'oracle'
  group 'oinstall'
  mode '0644'
  cookbook 'oracle'
end

ruby_block "print_empty_db_hash_warning" do
  block do
    Chef::Log.warn(":oracle[:rdbms][:dbs] is empty; no database will be created.")
  end
  action :create
  only_if {node[:oracle][:rdbms][:dbs].empty?}
end

# switch skip db conditional from database attribute to checking for the spfile[DB_NAME].ora
node[:oracle][:rdbms][:dbs].each_key do |db|
  if File.exists? "#{node[:oracle][:rdbms][:ora_home]}/dbs/spfile#{db}.ora"
    ruby_block "print_#{db}_skipped_msg" do
      block do
        Chef::Log.info("Database #{db} has already been created on this node- skipping it.")
      end
      action :create
    end

    next
  end

  # remove user and group definition and add "sudo -Eu oracle" and add path to dbca to fix "DBCA cannot be run as root." error
  bash "dbca_createdb_#{db}" do
    environment (node[:oracle][:rdbms][:env])
    code "sudo -Eu oracle #{node[:oracle][:rdbms][:ora_home]}/bin/dbca -silent -createDatabase -templateName #{node[:oracle][:rdbms][:db_create_template]} -gdbname #{db} -sid #{db} -sysPassword #{node[:oracle][:rdbms][:sys_pw]} -systemPassword #{node[:oracle][:rdbms][:system_pw]}"
  end

  ruby_block "append_#{db}_stanza_to_lsnr_conf" do
    block do
      lsnr_conf = "#{node[:oracle][:rdbms][:ora_home]}/network/admin/listener.ora"
      sid_desc_body = "(SID_DESC=(GLOBAL_DBNAME=#{db})(ORACLE_HOME=#{node[:oracle][:rdbms][:ora_home]})(SID_NAME=#{db})))"
      abort("Could not back up #{lsnr_conf}; bailing out") unless system "cp --preserve=mode,ownership #{lsnr_conf} #{lsnr_conf}.bak-$(date +%Y-%m-%d-%H%M%S)"
      File.open lsnr_conf, 'r+' do |f|
        content = f.readlines
        last_line = content[-1]
        sid_desc_header = (last_line =~ /^SID/) ? '' : 'SID_LIST_LISTENER=(SID_LIST='
        sid_desc = sid_desc_header + sid_desc_body
        content[-1] = last_line.sub(/[)\s]$/, sid_desc)
        f.rewind
        f.truncate(f.pos)
        f.write content.join
      end
    end
    action :create
  end
  
  if node[:oracle][:rdbms][:dbconsole][:emconfig]
    template "#{node[:oracle][:rdbms][:ora_home]}/em.rsp" do
      owner 'oracle'
      group 'oinstall'
      mode '0644'
      cookbook 'oracle'
    end

    bash "prepare_dbsnmp_user_#{db}" do
      user "oracle"
      group "oinstall"
      environment (node[:oracle][:rdbms][:env])
      code <<-EOH2
        export ORACLE_SID=#{db}
        sqlplus / as sysdba <<-EOL1
        ALTER USER DBSNMP ACCOUNT UNLOCK;
        ALTER USER DBSNMP IDENTIFIED BY #{node[:oracle][:rdbms][:dbsnmp_pw]};
        exit
        EOL1
      EOH2
    end

    execute "set_sid_to_em-rsp_#{db}" do
      command "sed -i '2s/.*/SID=#{db}/' #{node[:oracle][:rdbms][:ora_home]}/em.rsp"
      user 'oracle'
      group 'oinstall'
    end

    service 'restart oracle emconfig' do
      service_name 'oracle'
      action :restart
    end

    execute "conf_dbcontrol_#{db}" do
      command "export ORACLE_HOME=#{node[:oracle][:rdbms][:ora_home]}; emca -config dbcontrol db -repos create -respFile #{node[:oracle][:rdbms][:ora_home]}/em.rsp"
      user 'oracle'
      group 'oinstall'
      environment (node[:oracle][:rdbms][:env])
    end
  end
  
  yum_package "coreutils" do
    action :install
    arch 'x86_64'
  end

  execute "shred_em_rsp_#{db}" do
    command "/usr/bin/shred -zu #{node[:oracle][:rdbms][:ora_home]}/em.rsp"
    user 'root'
    group 'root'
  end

  ruby_block "set_#{db}_install_flag" do
    block do
      node.set[:oracle][:rdbms][:dbs][db] = true
    end
    action :create
  end

  execute "append_#{db}_to_tnsnames.ora" do
    command "echo '#{db} =\n  (DESCRIPTION =\n    (ADDRESS_LIST =\n      (ADDRESS = (PROTOCOL = TCP)(HOST = #{node[:fqdn]})(PORT       ))\n    )\n    (CONNECT_DATA =\n      (SERVICE_NAME = #{db})\n    )\n  )\n\n' >> #{node[:oracle][:rdbms][:ora_home]}/network/admin/tnsnames.ora"
    not_if "grep #{db} #{node[:oracle][:rdbms][:ora_home]}/network/admin/tnsnames.ora > /dev/null 2>&1"
  end

  execute "edit_oratabs_#{db}_config" do
    command "sed -i.old '/^#{db}/s/N$/Y/' /etc/oratab"
    cwd '/etc'
  end

  service 'restart oracle' do
    service_name 'oracle'
    action :restart
  end

  directory "#{node[:oracle][:rdbms][:dbs_root]}/#{db}/export" do
    owner 'oracle'
    group 'dba'
    mode '0755'
  end

  bash "block_change_tracking_#{db}" do
    user "oracle"
    group "oinstall"
    environment (node[:oracle][:rdbms][:env])
    code <<-EOH3
       export ORACLE_SID=#{db}
       sqlplus / as sysdba <<-EOL2
       ALTER DATABASE ENABLE BLOCK CHANGE TRACKING USING FILE '#{node[:oracle][:rdbms][:dbs_root]}/#{db}/data1/#{db}_block_change_tracking.trk';
       CREATE DIRECTORY "EXPORT" AS '#{node[:oracle][:rdbms][:dbs_root]}/#{db}/export';
       exit
       EOL2
    EOH3
  end

  directory "#{node[:oracle][:rdbms][:dbs_root]}/#{db}/backup1" do
    owner 'oracle'
    group 'oinstall'
    mode '0755'
  end

  execute "set_oracle_sid_to_oracle_profile_#{db}" do
    command "sed -i 's/ORACLE_SID=.*/ORACLE_SID=#{db}/g' /home/oracle/.profile"
    user 'oracle'
    group 'oinstall'
    environment (node[:oracle][:rdbms][:env])
  end

  execute "set_oracle_unqname_to_oracle_profile_#{db}" do
    command "sed -i 's/ORACLE_UNQNAME=.*/ORACLE_UNQNAME=#{db}/g' /home/oracle/.profile"
    user 'oracle'
    group 'oinstall'
    environment (node[:oracle][:rdbms][:env])
  end

end
