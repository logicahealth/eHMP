def get_password(data_bag_item_name)
  mounts_passwords = nil
  begin
    mounts_passwords = Chef::EncryptedDataBagItem.load("credentials", "#{data_bag_item_name}", 'n25q2mp#h4')
  rescue 
    Chef::Log.warn "Did not find data bag item 'credentials' '#{data_bag_item_name}'"
  end
  begin
    test =  mounts_passwords['password']
  rescue
    Chef::Log.warn "Did not find data bag item #{data_bag_item_name}"
  end
  return test
end

action :add do

  names = new_resource.name
  passph = get_password(names)
  arrayList = new_resource.list
  
  arrayList.each do |mount_dir|

    directory "#{mount_dir}" do
      recursive true
      owner "root"
      group "root"
      mode "0755"  
      action :create
    end

    yum_package "ecryptfs-utils"

    mount "#{mount_dir}" do
      options "no_sig_cache,key=passphrase:passphrase_passwd=#{passph},ecryptfs_cipher=aes,ecryptfs_key_bytes=16,ecryptfs_passthrough=n,ecryptfs_enable_filename_crypto=n"
      device "#{mount_dir}"
      fstype "ecryptfs"
      action [:mount, :enable]
    end
  end
end