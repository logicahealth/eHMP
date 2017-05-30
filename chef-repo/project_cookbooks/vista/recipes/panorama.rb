#
# Cookbook Name:: vista
# Recipe:: panorama
#

include_recipe "vista::vpr"

vista_mumps_block "Remove incorrect data" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    'S DIK="^AUPNVSIT(",DA=1797',
    'D ^DIK'
  ]
  log node[:vista][:chef_log]
end

# Install CDS Test Patients; e.g, "CDSONE,PATIENT A" et al.
vista_load_global "cds_data_patches" do
  patch_list "cds_data_patches"
  manifest_path "#{Chef::Config[:file_cache_path]}/kids-manifest.json"
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

# Admin user - this represents a generic super user or programmer/admin user without access to eHMP
vista_new_person "create_leipr_proxy_user" do
  log node[:vista][:chef_log]
  action :create
  access_code "REDACTED"
  verify_code "REDACTED"
  full_name "User,LEIPR"
  initial "LU"
  keys ["XUPROGMODE", "XUPROG"]
end

# See https://wiki.vistacore.us/display/DNS  E/Agilex+Sample+Personas
# These users represent clinicans and other end-users of eHMP.
persona_users = [
  # example of dynamic user
  # {
  #   # Proxy user, but also used for end-user testing
  #   :access_code => 'REDACTED',
  #   :verify_code => 'REDACTED',
  #   :full_name => 'User,Panorama',
  #   :ssn => '666441233',
  #   :initial => 'PU',
  #   :keys => ["PROVIDER", "GMV MANAGER", "GMRA-SUPERVISOR", "GMRC101", "PSB CPRS MED BUTTON", "ORES"],
  #   :cprs_tab => 'COR',
  #   :secondary_menu_options => ['HMP UI CONTEXT', 'HMP SYNCHRONIZATION CONTEXT', 'OR PARAM COORDINATOR MENU', 'VAFCTF RPC CALLS'],
  #   :allergy_eie_allowed => true
  # }
]

persona_users.each do | persona |
  vista_new_person "create_#{persona[:full_name]}" do
    log node[:vista][:chef_log]
    access_code persona[:access_code]
    verify_code persona[:verify_code]
    full_name persona[:full_name]
    ssn persona[:ssn]
    initial persona[:initial]
    keys persona[:keys]
    cprs_tab persona[:cprs_tab]
    secondary_menu_options persona[:secondary_menu_options]
    signature persona[:signature]
    signature_block_title persona[:signature_block_title]
    authorized_for_med_orders persona[:authorized_for_med_orders]
    service_section persona[:service_section]
    not_if { node[:vista][:no_reset] }
  end

  vista_allergy_eie "eie_#{persona[:full_name]}" do
    full_name persona[:full_name]
    eie_allowed persona[:allergy_eie_allowed]
    not_if { node[:vista][:no_reset] }
  end
end

include_recipe "vista::patient_ids"
