VPRJTCONV ;V4W/DLW -- Unit tests for sync status migration script (VPRJCONV)
 ;;1.0;JSON DATA STORE;;Nov 11, 2015
 ;
STARTUP  ; Run once before all tests
 K ^VPRSTATUSOD,^VPRSTATUS
 K ^VPRJSAVD,^VPRJSAVP
 D VPRSTATUSOD,VPRSTATUS
 D SYNCSTS^VPRJCONV ; Run conversion script
 QUIT
 ;
SHUTDOWN ; Run once after all tests
 K ^VPRSTATUSOD,^VPRSTATUS
 K ^VPRJSAVD,^VPRJSAVP
 QUIT
 ;
ASSERT(EXPECT,ACTUAL,MSG) ; for convenience
 D EQ^VPRJT(EXPECT,ACTUAL,$G(MSG))
 QUIT
 ;
VPRSTATUSOD ; Old sync status metastamp format for ODS data
 S ^VPRSTATUSOD("1ZZUT",20151111222500)=""
 S ^VPRSTATUSOD("1ZZUT",20151111222500,"asu-class",20151111222500)=""
 S ^VPRSTATUSOD("1ZZUT",20151111222500,"asu-class",20151111222500,"stored")=1
 S ^VPRSTATUSOD("1ZZUT",20151111222500,"asu-class","urn:va:asu-class:1ZZUT:10",20151111222440)=""
 S ^VPRSTATUSOD("1ZZUT",20151111222500,"asu-class","urn:va:asu-class:1ZZUT:10",20151111222440,"stored")=1
 S ^VPRSTATUSOD("1ZZUT",20151111222500,"asu-rule",20151111222500)=""
 S ^VPRSTATUSOD("1ZZUT",20151111222500,"asu-rule",20151111222500,"stored")=1
 S ^VPRSTATUSOD("1ZZUT",20151111222500,"asu-rule","urn:va:asu-rule:1ZZUT:10",20151111222440)=""
 S ^VPRSTATUSOD("1ZZUT",20151111222500,"asu-rule","urn:va:asu-rule:1ZZUT:10",20151111222440,"stored")=1
 S ^VPRSTATUSOD("1ZZUT",20151111222500,"doc-def",20151111222500)=""
 S ^VPRSTATUSOD("1ZZUT",20151111222500,"doc-def",20151111222500,"stored")=1
 S ^VPRSTATUSOD("1ZZUT",20151111222500,"doc-def","urn:va:doc-def:1ZZUT:10",20151111222440)=""
 S ^VPRSTATUSOD("1ZZUT",20151111222500,"doc-def","urn:va:doc-def:1ZZUT:10",20151111222440,"stored")=1
 S ^VPRSTATUSOD("1ZZUT",20151111222500,"immunization",20151111222500)=""
 S ^VPRSTATUSOD("1ZZUT",20151111222500,"immunization",20151111222500,"stored")=1
 S ^VPRSTATUSOD("1ZZUT",20151111222500,"immunization","urn:va:immunization:1ZZUT:10",20151111222440)=""
 S ^VPRSTATUSOD("1ZZUT",20151111222500,"immunization","urn:va:immunization:1ZZUT:10",20151111222440,"stored")=1
 QUIT
 ;
VPRSTATUS ; Old sync status metastamp format for PAT data
 S ^VPRSTATUS("1ZZUT;3","1ZZUT",20151111223500)=""
 S ^VPRSTATUS("1ZZUT;3","1ZZUT",20151111223500,"allergy",20151111223500)=""
 S ^VPRSTATUS("1ZZUT;3","1ZZUT",20151111223500,"allergy","urn:va:allergy:1ZZUT:3:751",20050904181032)=""
 S ^VPRSTATUS("1ZZUT;3","1ZZUT",20151111223500,"allergy","urn:va:allergy:1ZZUT:3:751",20050904181032,"stored")=1
 S ^VPRSTATUS("1ZZUT;3","1ZZUT",20151111223500,"appointment",20151111223500)=""
 S ^VPRSTATUS("1ZZUT;3","1ZZUT",20151111223500,"appointment","urn:va:appointment:1ZZUT:3:751",20050904181032)=""
 S ^VPRSTATUS("1ZZUT;3","1ZZUT",20151111223500,"appointment","urn:va:appointment:1ZZUT:3:751",20050904181032,"stored")=1
 S ^VPRSTATUS("1ZZUT;3","1ZZUT",20151111223500,"consult",20151111223500)=""
 S ^VPRSTATUS("1ZZUT;3","1ZZUT",20151111223500,"consult","urn:va:consult:1ZZUT:3:751",20050904181032)=""
 S ^VPRSTATUS("1ZZUT;3","1ZZUT",20151111223500,"consult","urn:va:consult:1ZZUT:3:751",20050904181032,"stored")=1
 S ^VPRSTATUS("1ZZUT;3","1ZZUT",20151111223500,"cpt",20151111223500)=""
 S ^VPRSTATUS("1ZZUT;3","1ZZUT",20151111223500,"cpt","urn:va:cpt:1ZZUT:3:751",20050904181032)=""
 S ^VPRSTATUS("1ZZUT;3","1ZZUT",20151111223500,"cpt","urn:va:cpt:1ZZUT:3:751",20050904181032,"stored")=1
 QUIT
 ;
CONVERTOD ;; @TEST Metastamp conversion script for operational data
 D ASSERT(0,$D(^VPRSTATUSOD("1ZZUT",20151111222500)),"A sync status timestamp for operational data exists and there should not be")
 D ASSERT(20151111222500,$G(^VPRSTATUSOD("1ZZUT","stampTime")))
 ;
 D ASSERT(11,$D(^VPRSTATUSOD("1ZZUT","asu-class",20151111222500)),"An asu-class sync status timestamp doesn't exist and there should be")
 D ASSERT(1,$D(^VPRSTATUSOD("1ZZUT","asu-class",20151111222500,"stored")),"An asu-class sync status stored stamp doesn't exist and there should be")
 D ASSERT(11,$D(^VPRSTATUSOD("1ZZUT","asu-class","urn:va:asu-class:1ZZUT:10",20151111222440)),"An asu-class domain sync status timestamp doesn't exist and there should be")
 D ASSERT(1,$D(^VPRSTATUSOD("1ZZUT","asu-class","urn:va:asu-class:1ZZUT:10",20151111222440,"stored")),"An asu-class domain sync status stored stamp doesn't exist and there should be")
 D ASSERT(11,$D(^VPRSTATUSOD("1ZZUT","asu-rule",20151111222500)),"An asu-rule sync status timestamp doesn't exist and there should be")
 D ASSERT(1,$D(^VPRSTATUSOD("1ZZUT","asu-rule",20151111222500,"stored")),"An asu-rule sync status stored stamp doesn't exist and there should be")
 D ASSERT(11,$D(^VPRSTATUSOD("1ZZUT","asu-rule","urn:va:asu-rule:1ZZUT:10",20151111222440)),"An asu-rule domain sync status timestamp doesn't exist and there should be")
 D ASSERT(1,$D(^VPRSTATUSOD("1ZZUT","asu-rule","urn:va:asu-rule:1ZZUT:10",20151111222440,"stored")),"An asu-rule domain sync status stored stamp doesn't exist and there should be")
 D ASSERT(11,$D(^VPRSTATUSOD("1ZZUT","doc-def",20151111222500)),"An doc-def sync status timestamp doesn't exist and there should be")
 D ASSERT(1,$D(^VPRSTATUSOD("1ZZUT","doc-def",20151111222500,"stored")),"An doc-def sync status stored stamp doesn't exist and there should be")
 D ASSERT(11,$D(^VPRSTATUSOD("1ZZUT","doc-def","urn:va:doc-def:1ZZUT:10",20151111222440)),"An doc-def domain sync status timestamp doesn't exist and there should be")
 D ASSERT(1,$D(^VPRSTATUSOD("1ZZUT","doc-def","urn:va:doc-def:1ZZUT:10",20151111222440,"stored")),"An doc-def domain sync status stored stamp doesn't exist and there should be")
 D ASSERT(11,$D(^VPRSTATUSOD("1ZZUT","immunization",20151111222500)),"An immunization sync status timestamp doesn't exist and there should be")
 D ASSERT(1,$D(^VPRSTATUSOD("1ZZUT","immunization",20151111222500,"stored")),"An immunization sync status stored stamp doesn't exist and there should be")
 D ASSERT(11,$D(^VPRSTATUSOD("1ZZUT","immunization","urn:va:immunization:1ZZUT:10",20151111222440)),"An immunization domain sync status timestamp doesn't exist and there should be")
 D ASSERT(1,$D(^VPRSTATUSOD("1ZZUT","immunization","urn:va:immunization:1ZZUT:10",20151111222440,"stored")),"An immunization domain sync status stored stamp doesn't exist and there should be")
 QUIT
 ;
CONVERTPAT ;; @TEST Metastamp conversion script for patient data
 D ASSERT(0,$D(^VPRSTATUS("1ZZUT;3","1ZZUT",20151111223500)),"A sync status timestamp for patient data exists and there should not be")
 D ASSERT(20151111223500,$G(^VPRSTATUS("1ZZUT;3","1ZZUT","stampTime")))
 ;
 D ASSERT(11,$D(^VPRSTATUS("1ZZUT;3","1ZZUT","allergy",20151111223500)),"An allergy sync status timestamp doesn't exist and there should be")
 D ASSERT(1,$D(^VPRSTATUS("1ZZUT;3","1ZZUT","allergy",20151111223500,"stored")),"An allergy sync status stored stamp doesn't exist and there should be")
 D ASSERT(11,$D(^VPRSTATUS("1ZZUT;3","1ZZUT","allergy","urn:va:allergy:1ZZUT:751",20050904181032)),"An allergy domain sync status timestamp doesn't exist and there should be")
 D ASSERT(1,$D(^VPRSTATUS("1ZZUT;3","1ZZUT","allergy","urn:va:allergy:1ZZUT:751",20050904181032,"stored")),"An allergy domain sync status stored stamp doesn't exist and there should be")
 D ASSERT(11,$D(^VPRSTATUS("1ZZUT;3","1ZZUT","appointment",20151111223500)),"An appointment sync status timestamp doesn't exist and there should be")
 D ASSERT(1,$D(^VPRSTATUS("1ZZUT;3","1ZZUT","appointment",20151111223500,"stored")),"An appointment sync status stored stamp doesn't exist and there should be")
 D ASSERT(11,$D(^VPRSTATUS("1ZZUT;3","1ZZUT","appointment","urn:va:appointment:1ZZUT:751",20050904181032)),"An appointment domain sync status timestamp doesn't exist and there should be")
 D ASSERT(1,$D(^VPRSTATUS("1ZZUT;3","1ZZUT","appointment","urn:va:appointment:1ZZUT:751",20050904181032,"stored")),"An appointment domain sync status stored stamp doesn't exist and there should be")
 D ASSERT(11,$D(^VPRSTATUS("1ZZUT;3","1ZZUT","consult",20151111223500)),"An consult sync status timestamp doesn't exist and there should be")
 D ASSERT(1,$D(^VPRSTATUS("1ZZUT;3","1ZZUT","consult",20151111223500,"stored")),"An consult sync status stored stamp doesn't exist and there should be")
 D ASSERT(11,$D(^VPRSTATUS("1ZZUT;3","1ZZUT","consult","urn:va:consult:1ZZUT:751",20050904181032)),"An consult domain sync status timestamp doesn't exist and there should be")
 D ASSERT(1,$D(^VPRSTATUS("1ZZUT;3","1ZZUT","consult","urn:va:consult:1ZZUT:751",20050904181032,"stored")),"An consult domain sync status stored stamp doesn't exist and there should be")
 D ASSERT(11,$D(^VPRSTATUS("1ZZUT;3","1ZZUT","cpt",20151111223500)),"An cpt sync status timestamp doesn't exist and there should be")
 D ASSERT(1,$D(^VPRSTATUS("1ZZUT;3","1ZZUT","cpt",20151111223500,"stored")),"An cpt sync status stored stamp doesn't exist and there should be")
 D ASSERT(11,$D(^VPRSTATUS("1ZZUT;3","1ZZUT","cpt","urn:va:cpt:1ZZUT:751",20050904181032)),"An cpt domain sync status timestamp doesn't exist and there should be")
 D ASSERT(1,$D(^VPRSTATUS("1ZZUT;3","1ZZUT","cpt","urn:va:cpt:1ZZUT:751",20050904181032,"stored")),"An cpt domain sync status stored stamp doesn't exist and there should be")
 QUIT
