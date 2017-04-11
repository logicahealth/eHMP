#
# Cookbook Name:: vista
# Recipe:: import_kodak
#

vista_mumps_block "Run MUMPS commands on Kodak" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "S FDA(1,2,\"227,\",.09)=987654321",
    "D UPDATE^DIE(,\"FDA(1)\")",
    "S ^LR(140,\"CY\",7059588,1.1,1,0)=\"NO MALIGNANCY FOUND\"",
    "K FDA",
    "S FDA(1,52,\"401106,\",6)=151",
    "S FDA(1,52,\"401106,\",26)=3150101",
    "D FILE^DIE(,\"FDA(1)\")",
    "S $P(^LR(184,\"CH\",6949681.966382,0),\"^\",3)=\"3050318.043728\"",
    "S $P(^LR(184,\"CH\",6949681.966382,430),\"^\",1)=\"15.9\"",
    "F I=1:1:3 S ^RARPT(535,\"I\",I,0)=\"New impression \"_I_\": \"_^RARPT(535,\"I\",I,0)",
    "F R=1:1:3 S ^RARPT(535,\"R\",R,0)=\"New report \"_R_\": \"_^RARPT(535,\"R\",R,0)",
    "K FDA",
    "S FDA(1,200,\"10000000227,\",9)=983493891",
    "D FILE^DIE(,\"FDA(1)\")",
    "S $P(^LR(184,\"MI\",7048982.848075,1),\"^\",3)=11247",
    "S $P(^LR(184,\"MI\",7048982.848075,1),\"^\")=2951027",
    "K FDA S FDA(1,100,\"10629,\",4)=2991002.0801",
    "D FILE^DIE(,\"FDA(1)\")",
    "K FDA",
    "S FDA(1,52,\"401710,\",4)=940",
    "D FILE^DIE(,\"FDA(1)\")",
    # Radiology Data Staging, change CARDIAC MYOPERFUSION SCAN DRUG STRESS to CARDIAC MYOPERFUSION SCAN DRUG STRESS
    # In the Radiology lookup for id 730
    "K FDA S FDA(1,71,\"730,\",.01)=\"CARDIAC MYOPERFUSION SCAN DRUG STRESS\"",
    "D FILE^DIE(,\"FDA(1)\")",
    # Inpatient Medications
    "S ^OR(100,10629,.1,1,0)=1671",
    "K ^OR(100,10629,.1,\"B\",1393,1)",
    "S ^OR(100,10629,.1,\"B\",1671,1)=\"\"",
    "S ^OR(100,10629,4.5,1,1)=1671",
    "S ^OR(100,10629,8,1,.1,1,0)=\"IBUPROFEN TAB\"",
    "K FDA",
    "S FDA(1,53.79,\"1,\",.11)=\"7U\"",
    "D UPDATE^DIE(,\"FDA(1)\")"
  ]
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

vista_mumps_block "MUMPS commands to assign an ICN to patient with DFN=18 on Kodak" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "S ^DPT(18,\"MPI\")=5123456789",
    "S ^DPT(\"AICN\",5123456789,18)=\"\""
  ]
  log node[:vista][:chef_log]
end

vista_mumps_block "MUMPS commands to set patient with DFN=18 to non-sensitive status on Kodak" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "K FDA",
    "S FDA(1,38.1,\"18,\",2)=0",
    "S FDA(1,2,\"18,\",.361)=7",
    "D UPDATE^DIE(,\"FDA(1)\")"
  ]
  log node[:vista][:chef_log]
end

vista_mumps_block "MUMPS commands to assign an ICN to patient with DFN=100033 on Kodak" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "S ^DPT(100033,\"MPI\")=100031",
    "S ^DPT(\"AICN\",100031,100033)=\"\""
  ]
  log node[:vista][:chef_log]
end

# Install patient test data for development purposes only
vista_load_global "vista-kodak_test_data" do
  patch_list "vista-kodak_test_data"
  manifest_path "#{Chef::Config[:file_cache_path]}/kids-manifest.json"
  log node[:vista][:chef_log]
end

vista_mumps_block "Update patient TWOHUNDREDNINE,PATIENT's problems to have one originate in Panorama and one in Kodak" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "K FDA",
    "S FDA(9000011,\"971,\",.02)=100865",
    "S FDA(9000011,\"971,\",.06)=507",
    "S FDA(9000011.11,\"1,971,\",.01)=507",
    "S FDA(9000011,\"975,\",.02)=100155",
    "S FDA(9000011,\"975,\",.06)=507",
    "S FDA(9000011.11,\"1,975,\",.01)=507",
    "D FILE^DIE(,\"FDA\")"
  ]
  log node[:vista][:chef_log]
end

vista_mumps_block "Move EHMP,SEVEN's problems to TRASH,SCOTT" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "S IEN=0 F  S IEN=$O(^AUPNPROB(\"AC\",100895,IEN)) Q:IEN=\"\"  S DA=IEN,DIE=\"^AUPNPROB(\",DR=\".02///100865\" D ^DIE"
  ]
  log node[:vista][:chef_log]
end

vista_mumps_block "Move EHMP,SEVEN's vitals to TRASH,SCOTT" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "S IEN=0 F  S IEN=$O(^GMR(120.5,\"C\",100895,IEN)) Q:IEN=\"\"  S DA=IEN,DIE=\"^GMR(120.5,\",DR=\".02///100865\" D ^DIE"
  ]
  log node[:vista][:chef_log]
end

vista_mumps_block "Delete EHMP,SEVEN's lab results" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "S LRDFN=693 F SUB=\"CH\",\"MI\",\"SP\",\"BB\",\"EM\",\"CY\",\"AY\" S LABID=0 F  S LABID=$O(^LR(LRDFN,SUB,LABID)) Q:+LABID'=LABID  S DA(1)=LRDFN,DA=LABID,DIK=\"^LR(\"_DA(1)_\",\"\"\"_SUB_\"\"\",\" D ^DIK"
  ]
  log node[:vista][:chef_log]
end

vista_mumps_block "Delete EHMP,SEVEN's medications" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    "S DFN=100895 S RXID=0 F  S RXID=$O(^PS(55,DFN,\"P\",RXID)) Q:+RXID'=RXID  S RX=$G(^PS(55,DFN,\"P\",RXID,0)),DA=RX,DIK=\"^PSRX(\" D ^DIK S DA(1)=DFN,DA=RXID,DIK=\"^PS(55,DFN,\"\"P\"\",\" D ^DIK",
    "S DFN=100895 S RXID=0 F  S RXID=$O(^PS(55,DFN,\"IV\",RXID)) Q:+RXID'=RXID  S DA(1)=DFN,DA=RXID,DIK=\"^PS(55,DFN,\"\"IV\"\",\" D ^DIK",
    "S DFN=100895 S RXID=0 F  S RXID=$O(^PS(55,DFN,\"IVBCMA\",RXID)) Q:+RXID'=RXID  S DA(1)=DFN,DA=RXID,DIK=\"^PS(55,DFN,\"\"IVBCMA\"\",\" D ^DIK"
  ]
  log node[:vista][:chef_log]
end

vista_mumps_block "Reset all subscriptions on deploy" do
  namespace node[:vista][:namespace]
  command [
    # Reset subscription
    "S ARGS(\"server\")=\"hmp-development-box\"",
    "S ARGS(\"command\")=\"resetAllSubscriptions\"",
    "D API^HMPDJFS(.OUT,.ARGS)",
    # Print the results
    "ZW @OUT",
    # Clean up
    "K OUT,ARGS"
  ]
  log node[:vista][:chef_log]
  not_if { node[:vista][:no_reset] }
end

vista_mumps_block "Modify picklist values in Kodak only" do
  duz       1
  programmer_mode true
  namespace node[:vista][:namespace]
  command [
    # Remove Inactive flag for "VOODOO SHOT (HISTORICAL)"
    "S DA=500001,DIE=\"^AUTTIMM(\",DR=\".07///@\" D ^DIE"
  ]
  log node[:vista][:chef_log]
end

26.times do |i|
  alph = ("a".."z").to_a

  number = alph[i]
  vista_patient "Create a patient" do
    name "KODAK,#{number}"
    sex "FEMALE"
    dob "01/01/1955"
    not_if { node[:vista][:no_reset] }
  end
end
