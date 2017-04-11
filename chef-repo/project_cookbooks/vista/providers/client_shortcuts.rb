#
# Cookbook Name:: vista
# Resource:: client_shortcuts
#
# This provider creates the vista client shortcuts to any CPRS apps downloaded in VistA
#

action :execute do

  new_resource.sites.each do |site_info|
    windows_shortcut "C:\\Users\\vagrant\\Desktop\\Vitals Manager #{site_info["ipaddress"]}.lnk" do
      arguments "S=#{site_info["ipaddress"]} P=#{node[:vista][:rpc_port]} CCOW=DISABLE"
      cwd 'C:\\Program Files (x86)\\VistA\\Vitals'
      target '"C:\\Program Files (x86)\\VistA\\Vitals\\VitalsManager.exe"'
    end

    windows_shortcut "C:\\Users\\vagrant\\Desktop\\Vitals #{site_info["ipaddress"]}.lnk" do
      arguments "S=#{site_info["ipaddress"]} P=#{node[:vista][:rpc_port]} CCOW=DISABLE"
      cwd 'C:\\Program Files (x86)\\VistA\\Vitals'
      target '"C:\\Program Files (x86)\\VistA\\Vitals\\Vitals.exe"'
    end

    Dir.glob("C:/Program Files (x86)/VistA/CPRS*/CPRSChart*.exe") { |cprs_chart_exe|
      windows_shortcut "C:\\Users\\vagrant\\Desktop\\#{::File.basename(::File.dirname(cprs_chart_exe))} #{site_info["ipaddress"]}.lnk" do
        arguments "S=#{site_info["ipaddress"]} P=#{node[:vista][:rpc_port]} CCOW=DISABLE"
        cwd 'C:\\Program Files (x86)\\VistA\\Common Files'
        target cprs_chart_exe
      end
    }
  end 

end
