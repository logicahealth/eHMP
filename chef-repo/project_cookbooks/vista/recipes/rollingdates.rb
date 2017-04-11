#
# Cookbook Name:: vista
# Recipe:: rollingdates
#

vista_mumps_block "Move appointments identified in ^ZZEHMP('ZZMOVDT'" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    # try to move appointments for patient APPOINTMENT,INPATIENT
    "D ALLAPPT^ZZMOVDT(.ZZZ,100861)"
  ]
  log node[:vista][:chef_log]
end

vista_mumps_block "Move appointments for patients on PROVIDER EIGHT's MyCPRS List" do
  duz       1
  programmer_mode true
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
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "D LRODAY^ZZMOVDT2(3151111,\"TODAY-1\")"
  ]
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

vista_mumps_block "Clean up ONEHUNDREDNINETYFIVE,PATIENT's lab results" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "D DELLRES^ZZMOVDT2(691,\"CH\",6848886.999446)"
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

vista_global_import_utility "import_surgery_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/Surgery.txt"
  dik_da_pairs [ ["^AUPNVSIT(", "11806"], ["^TIU(8925,", "11679"], ["^TIU(8925,", "11680"], ["^TIU(8925,", "11681"] ]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_discharge_summary_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/DischargeSummary.txt"
  dik_da_pairs [ ["^TIU(8925,", "11682"], ["^AUPNVSIT(", "11806"] ]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_ehmpSix_vitals_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/ehmpSix/ehmpSix-Vitals.txt"
  dik_da_pairs [ ["^GMR(120.5,", "29073"], ["^GMR(120.5,", "29074"], ["^GMR(120.5,", "29075"], ["^GMR(120.5,", "29076"], ["^GMR(120.5,", "29077"], ["^GMR(120.5,", "29078"],
    ["^GMR(120.5,", "29079"], ["^GMR(120.5,", "29080"], ["^GMR(120.5,", "29081"], ["^GMR(120.5,", "29082"], ["^GMR(120.5,", "29083"], ["^GMR(120.5,", "29084"], ["^GMR(120.5,", "29085"],
    ["^GMR(120.5,", "29086"], ["^GMR(120.5,", "29106"], ["^GMR(120.5,", "29107"], ["^GMR(120.5,", "29108"], ["^GMR(120.5,", "29109"], ["^GMR(120.5,", "29110"], ["^GMR(120.5,", "29111"] ]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_ehmpSix_orders_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/ehmpSix/ehmpSix-Orders.txt"
  dik_da_pairs [ ["^OR(100,", "38440"], ["^OR(100,", "38441"], ["^OR(100,", "38449"], ["^OR(100,", "38450"], ["^OR(100,", "38483"], ["^OR(100,", "38484"], ["^OR(100,", "38485"], ["^OR(100,", "38486"], ["^OR(100,", "38487"], ["^OR(100,", "38488"], ["^OR(100,", "38489"], ["^OR(100,", "38556"], ["^OR(100,", "38557"], ["^OR(100,", "38558"], ["^OR(100,", "38559"], ["^OR(100,", "38560"], ["^OR(100,", "38561"], ["^OR(100,", "38562"], ["^OR(100,", "38598"], ["^OR(100,", "38599"], ["^OR(100,", "38600"], ["^OR(100,", "38601"], ["^OR(100,", "38602"], ["^OR(100,", "38603"], ["^OR(100,", "38604"] ]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_ehmpSix_outpatientMeds_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/ehmpSix/ehmpSix-Meds.txt"
  dik_da_pairs [ ["^PS(55,", "100863"], ["^PSRX(", "404240"], ["^PSRX(", "404263"], ["^PSRX(", "404297"] ]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_ehmpSix_lab_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/ehmpSix/ehmpSix-LabResults.txt"
  dik_da_pairs [ ["^OR(100,", "38486"], ["^OR(100,", "38487"], ["^OR(100,", "38488"], ["^OR(100,", "38489"], ["^OR(100,", "38557"], ["^OR(100,", "38560"], ["^OR(100,", "38602"], ["^OR(100,", "38603"], ["^OR(100,", "38604"] ]
  not_if { node[:vista][:no_reset] }
end

vista_mumps_block "Move ^LRO entries for EHMP,SIX" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "D LROPAT^ZZMOVDT2(666,\"TODAY-1\")"
  ]
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

vista_mumps_block "Clean up EHMP,SIX's lab results" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "D DELLRES^ZZMOVDT2(666,\"CH\",6858783.884899)",
    "D DELLRES^ZZMOVDT2(666,\"CH\",6858783.8849)",
    "D DELLRES^ZZMOVDT2(666,\"CH\",6858886.904799)",
    "D DELLRES^ZZMOVDT2(666,\"CH\",6858886.9048)",
    "D DELLRES^ZZMOVDT2(666,\"CH\",6858886.906699)",
    "D DELLRES^ZZMOVDT2(666,\"CH\",6858886.9067)",
    "D DELLRES^ZZMOVDT2(666,\"CH\",6868991.897097)",
    "D DELLRES^ZZMOVDT2(666,\"CH\",6868991.897098)",
    "D DELLRES^ZZMOVDT2(666,\"CH\",6868991.897099)",
    "D DELLRES^ZZMOVDT2(666,\"CH\",6868991.8971)",
    "D DELLRES^ZZMOVDT2(666,\"MI\",6858783.8842)",
    "D DELLRES^ZZMOVDT2(666,\"MI\",6858783.8849)",
    "D DELLRES^ZZMOVDT2(666,\"MI\",6868991.897099)",
    "D DELLRES^ZZMOVDT2(666,\"MI\",6868991.8971)"
  ]
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_ehmpSix_TIUNotes_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/ehmpSix/ehmpSix-TIUNotes.txt"
  dik_da_pairs [ ["^TIU(8925,", "11458"], ["^TIU(8925,", "11460"], ["^TIU(8925,", "11481"], ["^TIU(8925,", "11503"], ["^TIU(8925,", "11504"], ["^TIU(8925,", "11517"], ["^TIU(8925,", "11518"], ["^TIU(8925,", "11519"], ["^TIU(8925,", "11521"], ["^TIU(8925,", "11522"], ["^TIU(8925,", "11523"], ["^TIU(8925,", "11524"] ]
  not_if { node[:vista][:no_reset] }
end

vista_mumps_block "Correct signature blocks for EHMP,SIX's notes" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "D FIXSIG^ZZMOVDT2(11458,307534744)",
    "D FIXSIG^ZZMOVDT2(11460,54200112)",
    "D FIXSIG^ZZMOVDT2(11481,439710232)",
    "D FIXSIG^ZZMOVDT2(11503,92554140)",
    "D FIXSIG^ZZMOVDT2(11504,1546900703)",
    "D FIXSIG^ZZMOVDT2(11517,210893765)",
    "D FIXSIG^ZZMOVDT2(11518,187748)",
    "D FIXSIG^ZZMOVDT2(11519,21395039307)",
    "D FIXSIG^ZZMOVDT2(11521,16301973)",
    "D FIXSIG^ZZMOVDT2(11522,323138)",
    "D FIXSIG^ZZMOVDT2(11523,64391556)",
    "D FIXSIG^ZZMOVDT2(11524,835640733)"
  ]
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

vista_mumps_block "Move appointments for EHMP,SIX" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "D APPT^ZZMOVDT(.RETURN,100863,3131007.09,32,\"TODAY-451\")",
    "D APPT^ZZMOVDT(.RETURN,100863,3131206.103,64,\"TODAY-391\")",
    "D APPT^ZZMOVDT(.RETURN,100863,3131230.1445,431,\"TODAY-367\")",
    "D APPT^ZZMOVDT(.RETURN,100863,3141215.113,32,\"TODAY-17\")",
    "D APPT^ZZMOVDT(.RETURN,100863,3141222.143,432,\"TODAY-10\")",
    "D APPT^ZZMOVDT(.RETURN,100863,3141230.113,433,\"TODAY-2\")"
  ]
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_ehmpSix_Visits_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/ehmpSix/ehmpSix-Visits.txt"
  dik_da_pairs [ ["^AUPNVSIT(", "11454"], ["^AUPNVSIT(", "11456"], ["^AUPNVSIT(", "11457"], ["^AUPNVSIT(", "11483"], ["^AUPNVSIT(", "11484"], ["^AUPNVSIT(", "11494"], ["^AUPNVSIT(", "11502"], ["^AUPNVSIT(", "11511"], ["^AUPNVSIT(", "11512"], ["^AUPNVSIT(", "11513"], ["^AUPNVSIT(", "11516"], ["^AUPNVSIT(", "11517"], ["^AUPNVSIT(", "11518"], ["^AUPNVSIT(", "11519"], ["^AUPNVSIT(", "11520"], ["^AUPNVSIT(", "11521"], ["^AUPNVSIT(", "11522"], ["^AUPNVSIT(", "11528"], ["^AUPNVSIT(", "11529"], ["^SCE(", "12506"], ["^SCE(", "12507"], ["^SCE(", "12508"], ["^SCE(", "12531"], ["^SCE(", "12532"], ["^SCE(", "12536"], ["^SCE(", "12540"], ["^SCE(", "12541"], ["^SCE(", "12542"], ["^SCE(", "12543"], ["^SCE(", "12546"], ["^SCE(", "12547"], ["^SCE(", "12548"], ["^SCE(", "12549"], ["^SCE(", "12550"], ["^SCE(", "12554"], ["^SCE(", "12555"] ]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_ehmpSix_Imaging_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/ehmpSix/ehmpSix-RadOrders.txt"
  dik_da_pairs [ ["^RADPT(", "100863"], ["^RAO(75.1,", "2777"], ["^RAO(75.1,", "2778"], ["^RAO(75.1,", "2779"], ["^RAO(75.1,", "2780"], ["^RAO(75.1,", "2781"], ["^RARPT(", "591"], ["^RARPT(", "592"], ["^RARPT(", "593"], ["^RARPT(", "594"], ["^RARPT(", "595"] ]
  not_if { node[:vista][:no_reset] }
end

vista_mumps_block "Clean up EHMP,SIX's radiology reports" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "D DELRRPT^ZZMOVDT2(100863,6858777.889)",
    "D DELRRPT^ZZMOVDT2(100863,6858887.9046)",
    "D DELRRPT^ZZMOVDT2(100863,6858887.9047)",
    "D DELRRPT^ZZMOVDT2(100863,6868879.8345)"
  ]
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_ehmpSix_Consults_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/ehmpSix/ehmpSix-Consults.txt"
  dik_da_pairs [ ["^GMR(123,", "648"], ["^GMR(123,", "649"], ["^GMR(123,", "672"], ["^GMR(123,", "673"] ]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_ehmpSix_Allergy_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/ehmpSix/ehmpSix-Allergies.txt"
  dik_da_pairs [ ["^GMR(120.8,", "974"], ["^GMR(120.8,", "975"], ["^GMR(120.8,", "977"], ["^GMR(120.8,", "978"] ]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_ehmpSix_Problems_data" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/ehmpSix/ehmpSix-Problems.txt"
  dik_da_pairs [ ["^AUPNPROB(", "901"], ["^AUPNPROB(", "902"], ["^AUPNPROB(", "922"], ["^AUPNPROB(", "923"] ]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_lab_data_US14365" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/US14365-LabData.txt"
  dik_da_pairs [ ["^OR(100,", "40985"], ["^OR(100,", "40986"], ["^OR(100,", "41009"], ["^OR(100,", "41010"], ["^OR(100,", "41209"], ["^OR(100,", "41210"] ]
  not_if { node[:vista][:no_reset] }
end

vista_mumps_block "Clean up TWOHUNDREDFOURTEEN,PATIENT's lab results" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "D DELLRES^ZZMOVDT2(699,\"CH\",6839479.984091)",
    "D DELLRES^ZZMOVDT2(699,\"CH\",6839576.876853)",
    "D DELLRES^ZZMOVDT2(699,\"CH\",6839576.876854)"
  ]
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

vista_mumps_block "Move ^LRO entry for 04/08/2016 for US14365 - part of Lab Data rolling dates" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "D LRODAY^ZZMOVDT2(3160408,\"TODAY-65\",431)",
    "D LRODAY^ZZMOVDT2(3160422,\"TODAY-5\",699)",
    "D LRODAY^ZZMOVDT2(3160519,\"TODAY-65\",431)",
    "D LRODAY^ZZMOVDT2(3160519,\"TODAY-5\",699)"
  ]
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

vista_global_import_utility "import_lab_data_US15200" do
  duz       1
  programmer_mode true

  log node[:vista][:chef_log]
  action :create
  import_file "/var/chef/cache/cookbooks/vista/files/default/rollingdates/US15200-LabData.txt"
  dik_da_pairs [ ["^OR(100,", "44241"], ["^OR(100,", "44242"], ["^OR(100,", "44243"], ["^OR(100,", "44244"], ["^OR(100,", "44245"], ["^OR(100,", "44246"], ["^OR(100,", "44247"], ["^OR(100,", "44248"], ["^OR(100,", "44249"] ]
  not_if { node[:vista][:no_reset] }
end

vista_mumps_block "Clean up TWOHUNDREDTEN,PATIENT's lab results" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "D DELLRES^ZZMOVDT2(698,\"CH\",6839467.845343)",
    "D DELLRES^ZZMOVDT2(698,\"CH\",6839467.845344)",
    "D DELLRES^ZZMOVDT2(698,\"CH\",6839467.845345)",
    "D DELLRES^ZZMOVDT2(698,\"CH\",6839467.84599)",
    "D DELLRES^ZZMOVDT2(698,\"CH\",6839467.845991)",
    "D DELLRES^ZZMOVDT2(698,\"CH\",6839467.845992)",
    "D DELLRES^ZZMOVDT2(698,\"CH\",6839467.846581)",
    "D DELLRES^ZZMOVDT2(698,\"CH\",6839467.846582)",
    "D DELLRES^ZZMOVDT2(698,\"CH\",6839467.846583)"
  ]
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

vista_mumps_block "Move ^LRO entries for 05/31/2016 for US15200" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "D LROSPEC^ZZMOVDT2(3160531,\"TODAY-63\",1)",
    "D LROSPEC^ZZMOVDT2(3160531,\"TODAY-63\",2)",
    "D LROSPEC^ZZMOVDT2(3160531,\"TODAY-63\",3)",
    "D LROSPEC^ZZMOVDT2(3160531,\"TODAY-32\",4)",
    "D LROSPEC^ZZMOVDT2(3160531,\"TODAY-32\",5)",
    "D LROSPEC^ZZMOVDT2(3160531,\"TODAY-32\",6)",
    "D LROSPEC^ZZMOVDT2(3160531,\"TODAY-1\",7)",
    "D LROSPEC^ZZMOVDT2(3160531,\"TODAY-1\",8)",
    "D LROSPEC^ZZMOVDT2(3160531,\"TODAY-1\",9)"
  ]
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end
