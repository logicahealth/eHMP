require 'open-uri'
require 'openssl'

# Firefox helper
module Firefox
  def firefox_version
    if platform_family?('windows', 'mac_os_x')
      return node['firefox']['version'] unless node['firefox']['version'] == 'latest'
      firefox_latest.match(/(-|%20)([\d|.]*).(exe|dmg|tar.bz2)/)[2] # http://rubular.com/r/thFO453EZZ
    else
      cmd = Mixlib::ShellOut.new('firefox --version')
      cmd.run_command
      cmd.error!
      cmd.stdout.match(/Mozilla Firefox (.*)/)[1]
    end
  end

  # private

  def firefox_platform
    if platform?('windows')
      'win32'
    elsif platform?('mac_os_x')
      'mac'
    end
  end

  def firefox_base_uri
    "#{node['firefox']['releases_url']}/#{node['firefox']['version']}/#{firefox_platform}/#{node['firefox']['lang']}"
  end

  def firefox_latest
    open(firefox_base_uri, ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE).read
  end

  def firefox_package(version)
    if platform?('windows')
      "Firefox%20Setup%20#{version}.exe"
    elsif platform?('mac_os_x')
      "Firefox%20#{version}.dmg"
    end
  end
end

Chef::Provider.send(:include, Firefox)
Chef::Recipe.send(:include, Firefox)
Chef::Resource.send(:include, Firefox)
