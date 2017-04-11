#
# Cookbook Name:: vista
# Recipe:: rollingdates
#

vista_mumps_block "Move appointments identified in ^ZZEHMP('ZZMOVDT'" do
  namespace node[:vista][:namespace]
  command [
    # try to move appointments for patient APPOINTMENT,INPATIENT
    "D ALLAPPT^ZZMOVDT(.ZZZ,100861)"
  ]
  log node[:vista][:chef_log]
end

vista_mumps_block "Move appointments for patients on PROVIDER EIGHT's MyCPRS List" do
  namespace node[:vista][:namespace]
  command [
    "D APPT^ZZMOVDT(.RETURN,148,3150922.13,195,\"TODAY-14\")",
    "D APPT^ZZMOVDT(.RETURN,148,3150922.14,64,\"TODAY+14\")",
    "D APPT^ZZMOVDT(.RETURN,181,3150922.13,64,\"TODAY-14\")",
    "D APPT^ZZMOVDT(.RETURN,181,3150922.14,195,\"TODAY+14\")",
    "D APPT^ZZMOVDT(.RETURN,215,3150922.13,195,\"TODAY-14\")",
    "D APPT^ZZMOVDT(.RETURN,215,3150922.14,64,\"TODAY+14\")",
    "D APPT^ZZMOVDT(.RETURN,100846,3150922.13,64,\"TODAY-14\")",
    "D APPT^ZZMOVDT(.RETURN,100846,3150923.14,195,\"TODAY+14\")"
  ]
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_medication_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/MedsData.txt"
  dik_da_pairs [ ["^PSRX(", "404408"], ["^OR(100,", "38953"] ]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_notes_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/TIUData.txt"
  dik_da_pairs [ ["^AUPNVSIT(", "11540"], ["^TIU(8925,", "11532"], ["^SCE(", "12565"] ]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_adt_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/ADTData.txt"
  dik_da_pairs [ ["^DGPM(", "4715"], ["^DGPM(", "4716"], ["^DGPM(", "4717"], ["^DGPM(", "4718"], ["^DGPM(", "4719"] ]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_inpatient_meds_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/InpatMeds.txt"
  dik_da_pairs [ ["^OR(100,", "39093"], ["^OR(100,", "39094"] ]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_vitals_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/Vitals.txt"
  dik_da_pairs [ ["^GMR(120.5,", "29401"], ["^GMR(120.5,", "29402"], ["^GMR(120.5,", "29403"], ["^GMR(120.5,", "29404"], ["^GMR(120.5,", "29405"], ["^GMR(120.5,", "29406"], ["^GMR(120.5,", "29407"], ["^GMR(120.5,", "29408"] ]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_lab_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/LabData.txt"
  dik_da_pairs [ ["^OR(100,", "39146"] ]
  not_if { node[:vista][:no_reset] }
end

vista_mumps_block "Move ^LRO entry for 11/11/2015 - part of Lab Data rolling dates" do
  namespace node[:vista][:namespace]
  command [
    "D LRO^ZZMOVDT(3151111,\"TODAY-1\")"
  ]
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_imaging_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/RadOrders.txt"
  dik_da_pairs [ ["^OR(100,", "39184"], ["^OR(100,", "39185"], ["^OR(100,", "39197"], ["^OR(100,", "39198"], ["^PSRX(", "404434"], ["^RARPT(", "606"], ["^RARPT(", "607"], ["^OR(100,", "39198"] ]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_procedure_consults_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/Consults.txt"
  dik_da_pairs [ ["^OR(100,", "39206"], ["^OR(100,", "39207"], ["^GMR(123,", "692"], ["^GMR(123,", "693"], ["^TIU(8925", "11673"], ["^TIU(8925", "11674"], ["^AUPNVSIT(", "11799"] ]
  not_if { node[:vista][:no_reset] }
end
