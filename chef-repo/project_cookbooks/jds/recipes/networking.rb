#
# Cookbook Name:: jds
# Recipe:: networking
#
# This recipe is used to do basic server configurations
#

ruby_block "Set Max Connection Requests - Upon Restart" do
  block do
    file = Chef::Util::FileEdit.new("/etc/sysctl.conf")
    file.insert_line_if_no_match(/^net.ipv4.tcp_max_syn_backlog\s*=/, "net.ipv4.tcp_max_syn_backlog = 4096")
    file.write_file
  end
  not_if { File.read('/proc/sys/net/ipv4/tcp_max_syn_backlog') == '4096' }
end

execute "Set Max Connection Requests - Immediate" do
  command "echo 4096 > /proc/sys/net/ipv4/tcp_max_syn_backlog"
  not_if { File.read('/proc/sys/net/ipv4/tcp_max_syn_backlog') == '4096' }
end

ruby_block "Set Socket Listen Backlog - Upon Restart" do
  block do
    file = Chef::Util::FileEdit.new("/etc/sysctl.conf")
    file.insert_line_if_no_match(/^net.core.somaxconn\s*=/, "net.core.somaxconn = 4096")
    file.write_file
  end
  not_if { File.read('/proc/sys/net/core/somaxconn') == '4096' }
end

execute "Set Socket Listen Backlog - Immediate" do
  command "echo 4096 > /proc/sys/net/core/somaxconn"
  not_if { File.read('/proc/sys/net/core/somaxconn') == '4096' }
end
