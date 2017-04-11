#
# Cookbook Name:: ehmp-ui
# Recipe:: default
#

include_recipe "adk::default"

dest_file = "#{Chef::Config['file_cache_path']}/ehmp-ui.zip"
dest_dir = "#{node[:ehmp_ui][:home_dir]}"
app_config = "#{dest_dir}/../app.json"

yum_package "unzip"

remote_file dest_file do
  source node[:ehmp_ui][:source]
  mode "0755"
  #checksum open("#{node[:ehmp_ui][:source]}.sha1", { ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE }).string
  use_conditional_get true
  notifies :delete, "directory[#{dest_dir}]", :immediately
  not_if ("mountpoint -q #{dest_dir}")
end

directory dest_dir do
  owner  "root"
  group  "root"
  mode "0755"
  recursive true
  action :create
end

execute "extract from ZIP" do
  cwd dest_dir
  command "unzip #{Chef::Config['file_cache_path']}/ehmp-ui.zip"
  action :run
  notifies :run, "execute[Move app.json to app directory]", :immediately
  only_if { (Dir.entries(dest_dir) - %w{ . .. }).empty? }
end

execute "Move app.json to app directory" do
  cwd dest_dir
  command "mv -f app.json #{dest_dir}/../"
  action :nothing
end

file 'copy manifest.json' do
  path "#{dest_dir}/../manifest.json"
  content IO.read(node[:ehmp_ui][:manifest_path])
  action :create
  notifies :delete, "file[#{node[:ehmp_ui][:manifest_path]}]", :immediately
end

file node[:ehmp_ui][:manifest_path] do
  action :nothing
end

# update AppCache manifest with timestamp and .js, .html, .css files under whitelisted paths
ruby_block "Create appcache file list" do
  block do
    whitelist_paths = [ 'app/**/*.{css,js,html}', '_assets/**/*.css', 'main/adk_utils/**/*.{css,js,html}', 'main/layouts/**/*.{css,js,html}' ]
    whitelist_paths.each do |path|
      Dir["/var/www/#{node[:adk][:dir]}/#{path}"].select { |e|
        if File.file?(e)
          node.default[:ehmp_ui][:appcache_list] = [node[:ehmp_ui][:appcache_list], e.split("/var/www/#{node[:adk][:dir]}")[1]].join("\n")
        end
      }
    end
  end
end
timestamp = Time.now.to_s

template "#{node[:adk][:home_dir]}/cache.appcache" do
  source "cache.appcache.erb"
  mode 0755
    variables(
      :timestamp => timestamp
  )
  action :create
  not_if ("mountpoint -q #{dest_dir}")
end
