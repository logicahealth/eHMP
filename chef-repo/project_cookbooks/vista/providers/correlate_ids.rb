#
# Cookbook Name:: vista
# Resource:: correlate_ids
#
# This provider uses greenletters and PTY to automate install prompts. This can cause odd character output to :log.
#

require 'json'

action :execute do
  correlated_ids = read_json(new_resource.json)
  commands =[]

  vista_stations = data_bag_item("vista_sites", "vista_station_number").to_hash

  correlated_ids.each do |patient_ids|
    stations = []
    vista_stations.each_pair do |name, number|
      if patient_ids.has_key?(number.to_s)
        stations.push(number.to_s)
      end
    end
    
    stations.push("icn")
    stations.push("VHIC")

    update_command = "D CORRIDS^HMPZPI(\""
    stations.each {|station_number|
      update_command << "#{station_number}"+";"+"#{patient_ids[station_number]}"+"^"
    }
    update_command.slice!(update_command.length-1,update_command.length)
    update_command << "\")"

    commands.push(update_command)
  end

  vista_mumps_block "Correlate patient ids" do
    duz new_resource.duz
    programmer_mode new_resource.programmer_mode
    namespace new_resource.namespace
    command lazy {
        commands
    }
    log new_resource.log
  end

end

def read_json(json_file)
  JSON.parse(::File.read(json_file))
end
