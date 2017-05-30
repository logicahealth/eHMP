#
# Cookbook Name:: vista
# Recipe:: patient_ids
#

vista_mumps_block "Add DOD test entry ZZUSDOD EDIPI TEST FACILITY to Institution file #4" do
  duz       1
  programmer_mode true
  namespace "VISTA"
  log node[:vista][:chef_log]
  command [
    's FDA(1,4,"+1,",.01)="ZZUSDOD EDIPI TEST FACILITY"',
    's FDA(1,4,"+1,",.02)="ILLINOIS"',
    's FDA(1,4,"+1,",11)="LOCAL"',
    's FDA(1,4,"+1,",13)="DOD"',
    's FDA(1,4,"+1,",99)="200DOD"',
    'd UPDATE^DIE("","FDA(1)","ERR")'
  ]
  not_if { node[:vista][:no_reset] }
end

patient_edipis = {
  "EIGHT,INPATIENT"              => "0000000001",
  "EIGHT,OUTPATIENT"             => "0000000002",
  "EIGHT,PATIENT"                => "0000000003",
  "ZZZRETIREDZERO,PATIENT"       => "0000000004",
  "ZZZRETIREDFIFTYSEVEN,PATIENT" => "0000000005",
  "ZZZRETIREDFIFTYTHREE,PATIENT" => "0000000006",
  "ZZZRETSIXTHIRTYFOUR,PATIENT"  => "0000000007",
  "TEN,PATIENT"                  => "0000000008",
  "ZZZRETFOURTHIRTYTWO,PATIENT"  => "0000000009",
  "BCMA,EIGHT"                   => "0000000010",
  "ONEHUNDREDSIXTEEN,PATIENT"    => "0000000011",
  "ZZZRETSIXTWENTYEIGHT,PATIENT" => "0000000012",
  "ZZZRETIREDFORTYEIGHT,PATIENT" => "0000000013",
  "GRAPHINGPATIENT,TWO"          => "0000000014",
  "ZZZRETIREDTWELVE,PATIENT"     => "0000000015"
}

patient_edipis.each do |patient, edipi|

  patient_edipi = {
    ".01" => patient,
    ".02" => "ZZUSDOD EDIPI TEST FACILITY",
    "11" => edipi,
    "12" => "Active",
    "10" => "USDOD"
  }

  vista_mumps_block "Add local ids and #{edipi} to #{patient}" do
    duz       1
    programmer_mode true
    namespace "VISTA"
    log node[:vista][:chef_log]
    command [
      "S dfn=$$FIND1^DIC(2,,\"MX\",\"#{patient}\",,,\"ERR\")",
      "S edipi=\"#{edipi}^NI^USDOD^200DOD\"",
      "D NEWTF^VAFCTFU2(.DATA,dfn,edipi)",
      'D FILENEW^VAFCTFU(dfn,500,"","","",.ERROR,"",dfn,"A")',
      "zw DATA"
    ]
    not_if { node[:vista][:no_reset] }
  end
end

remote_file "#{Chef::Config[:file_cache_path]}/#{node[:vista][:panorama][:correlated_ids][:artifact_name]}" do
  owner 'root'
  group 'root'
  mode "0755"
  source node[:vista][:panorama][:correlated_ids][:source]
  use_conditional_get true
end

file node[:vista][:panorama][:correlated_ids][:json] do
  owner 'root'
  group 'root'
  mode "0755"
  content lazy{ File.read("#{Chef::Config[:file_cache_path]}/#{node[:vista][:panorama][:correlated_ids][:artifact_name]}") }
end

# Correlate Ids on Kodak and panorama
vista_correlate_ids "correlate patient ids from other stations" do
  json node[:vista][:panorama][:correlated_ids][:json]
  namespace node[:vista][:namespace]
end