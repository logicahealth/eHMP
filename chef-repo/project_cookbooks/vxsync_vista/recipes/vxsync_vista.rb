#
# Cookbook Name:: vxsync
# Recipe:: vxsync_vista
#


vxsync_vista_sites = find_multiple_nodes_by_role("vista-.*", node[:stack])
if !node[:vxsync][:polled_vistas].nil?
  # if we are specifying which vistas to poll, remove all found vistas that aren't specified
  vxsync_vista_sites = vxsync_vista_sites.delete_if { |site| !node[:vxsync][:polled_vistas].include?(site['vista']['site_id']) }
  raise "Couldn't find every vista defined in polled_vistas attribute" if vxsync_vista_sites.length < node[:vxsync][:polled_vistas].length
else
  node.normal[:vxsync][:polled_vistas] = []
  vxsync_vista_sites.each { |site|
    node.normal[:vxsync][:polled_vistas].push(site['vista']['site_id'])
  }
end

vxsync_vista_sites.each do |site|
  poller_count = site['vista']['multiple_mode'] ? (site['vista']['poller_process_count'] || 1) : 1
  1.upto(poller_count) do |index|
    if index==1 then suffix = "" else suffix = "-#{index}" end
    node.default[:vxsync_vista][:processes]["pollerHost-#{site['vista']['site_id']}#{suffix}".to_sym] = {
        :template => "poller_host.sh.erb",
        :config => {
          :site => site['vista']['site_id'],
          :multiplemode => site['vista']['multiple_mode']
        }
    }
  end
end

vxsync_instance "vista" do
  vista_sites vxsync_vista_sites
  processes node[:vxsync_vista][:processes]
end
