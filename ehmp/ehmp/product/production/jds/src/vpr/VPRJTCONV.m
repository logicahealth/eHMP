VPRJTCONV ;V4W/DLW -- Unit tests for sync status migration script (VPRJCONV)
 ;;1.0;JSON DATA STORE;;Nov 11, 2015
 ;
STARTUP  ; Run once before all tests
 W !
 ; Next 4 lines - deprecated and should be obsolete once conversion finished
 ;K ^VPRSTATUSOD,^VPRSTATUS
 ;K ^VPRJSAVD,^VPRJSAVP
 ;D VPRSTATUSOD,VPRSTATUS
 ;D SYNCSTS^VPRJCONV ; Run conversion script for sync metastamp restructure
 K ^VPRPT,^VPRPTJ("JSON"),^VPRPTI,^VPRPTJ("TEMPLATE"),^VPRSTATUS
 D JPIDINIT,JPIDARY,JPIDJSN,JPIDIDX,JPIDTPL,JPIDSTS
 D JPIDSHRD^VPRJCONV(0) ; Run conversion script for JPID sharding restructure
 QUIT
 ;
SHUTDOWN ; Run once after all tests
 ; Next 2 lines - deprecated and should be obsolete once conversion finished
 ;K ^VPRSTATUSOD,^VPRSTATUS
 ;K ^VPRJSAVD,^VPRJSAVP
 K ^VPRPT,^VPRPTJ("JSON"),^VPRPTI,^VPRPTJ("TEMPLATE"),^VPRSTATUS
 K ^VPRPTJ("JPID")
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
JPIDINIT ; Initialize JPID associations for JPID restructure tests
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","ZZUT;1")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","1ZZUT;1")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","1234V4321")=""
 S ^VPRPTJ("JPID","ZZUT;1")="52833885-af7c-4899-90be-b3a6630b2369"
 S ^VPRPTJ("JPID","1ZZUT;1")="52833885-af7c-4899-90be-b3a6630b2369"
 S ^VPRPTJ("JPID","1234V4321")="52833885-af7c-4899-90be-b3a6630b2369"
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2370")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2370","ZZUT;2")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2370","1ZZUT;2")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2370","2345V5432")=""
 S ^VPRPTJ("JPID","ZZUT;2")="52833885-af7c-4899-90be-b3a6630b2370"
 S ^VPRPTJ("JPID","1ZZUT;2")="52833885-af7c-4899-90be-b3a6630b2370"
 S ^VPRPTJ("JPID","2345V5432")="52833885-af7c-4899-90be-b3a6630b2370"
 QUIT
 ;
JPIDARY ; Old patient array data format
 S ^VPRPT("1ZZUT;1","urn:va:order:1ZZUT:1:31875",20100323112428,"stampTime")=20100323112428
 S ^VPRPT("1ZZUT;1","urn:va:order:1ZZUT:1:31875",20100323112428,"stampTime","\s")=""
 S ^VPRPT("1ZZUT;1","urn:va:order:1ZZUT:1:31875",20100323112428,"start")=200904171000
 S ^VPRPT("1ZZUT;1","urn:va:order:1ZZUT:1:31875",20100323112428,"start","\s")=""
 S ^VPRPT("1ZZUT;1","urn:va:order:1ZZUT:1:31875",20100323112428,"statusCode")="urn:va:order-status:comp"
 S ^VPRPT("1ZZUT;2","urn:va:order:1ZZUT:2:31875",20100323112430,"stampTime")=20100323112430
 S ^VPRPT("1ZZUT;2","urn:va:order:1ZZUT:2:31875",20100323112430,"stampTime","\s")=""
 S ^VPRPT("1ZZUT;2","urn:va:order:1ZZUT:2:31875",20100323112430,"start")=200904171002
 S ^VPRPT("1ZZUT;2","urn:va:order:1ZZUT:2:31875",20100323112430,"start","\s")=""
 S ^VPRPT("1ZZUT;2","urn:va:order:1ZZUT:2:31875",20100323112430,"statusCode")="urn:va:order-status:comp"
 S ^VPRPT("ZZUT;1","urn:va:order:ZZUT:1:31875",20100323112428,"stampTime")=20100323112428
 S ^VPRPT("ZZUT;1","urn:va:order:ZZUT:1:31875",20100323112428,"stampTime","\s")=""
 S ^VPRPT("ZZUT;1","urn:va:order:ZZUT:1:31875",20100323112428,"start")=200904171000
 S ^VPRPT("ZZUT;1","urn:va:order:ZZUT:1:31875",20100323112428,"start","\s")=""
 S ^VPRPT("ZZUT;1","urn:va:order:ZZUT:1:31875",20100323112428,"statusCode")="urn:va:order-status:comp"
 S ^VPRPT("ZZUT;2","urn:va:order:ZZUT:2:31875",20100323112430,"stampTime")=20100323112430
 S ^VPRPT("ZZUT;2","urn:va:order:ZZUT:2:31875",20100323112430,"stampTime","\s")=""
 S ^VPRPT("ZZUT;2","urn:va:order:ZZUT:2:31875",20100323112430,"start")=200904171002
 S ^VPRPT("ZZUT;2","urn:va:order:ZZUT:2:31875",20100323112430,"start","\s")=""
 S ^VPRPT("ZZUT;2","urn:va:order:ZZUT:2:31875",20100323112430,"statusCode")="urn:va:order-status:comp"
 QUIT
 ;
JPIDJSN ; Old patient JSON data format
 S ^VPRPTJ("JSON","1ZZUT;1","urn:va:order:1ZZUT:1:31875",20100323112428,1)="{""stampTime"":""20100323112428"",""start"":""200904171000"",""statusCode"":""urn:va:order-status:comp""}"
 S ^VPRPTJ("JSON","1ZZUT;2","urn:va:order:1ZZUT:2:31875",20100323112430,1)="{""stampTime"":""20100323112430"",""start"":""200904171002"",""statusCode"":""urn:va:order-status:comp""}"
 S ^VPRPTJ("JSON","ZZUT;1","urn:va:order:ZZUT:1:31875",20100323112428,1)="{""stampTime"":""20100323112428"",""start"":""200904171000"",""statusCode"":""urn:va:order-status:comp""}"
 S ^VPRPTJ("JSON","ZZUT;2","urn:va:order:ZZUT:2:31875",20100323112430,1)="{""stampTime"":""20100323112430"",""start"":""200904171002"",""statusCode"":""urn:va:order-status:comp""}"
 QUIT
 ;
JPIDIDX ; Old patient index data format
 S ^VPRPTI("1ZZUT;1","attr","order")="62022,33224"
 S ^VPRPTI("1ZZUT;1","attr","order","79899676874=","urn:va:order:1ZZUT:1:31875",1)=""
 S ^VPRPTI("1ZZUT;2","attr","order")="62022,33230"
 S ^VPRPTI("1ZZUT;2","attr","order","79899676875=","urn:va:order:1ZZUT:2:31875",1)=""
 S ^VPRPTI("ZZUT;1","attr","order")="62022,33236"
 S ^VPRPTI("ZZUT;1","attr","order","798996768474=","urn:va:order:ZZUT:1:31875",1)=""
 S ^VPRPTI("ZZUT;2","attr","order")="62022,33230"
 S ^VPRPTI("ZZUT;2","attr","order","798996768475=","urn:va:order:ZZUT:2:31875",1)=""
 QUIT
 ;
JPIDTPL ; Old patient template data format
 S ^VPRPTJ("TEMPLATE","1ZZUT;1","attr","order")="62022,33224"
 S ^VPRPTJ("TEMPLATE","1ZZUT;1","attr","order","79899676874489=","urn:va:order:1ZZUT:1:31875",1)=""
 S ^VPRPTJ("TEMPLATE","1ZZUT;2","attr","order")="62022,33230"
 S ^VPRPTJ("TEMPLATE","1ZZUT;2","attr","order","79899676874498=","urn:va:order:1ZZUT:2:31875",1)=""
 S ^VPRPTJ("TEMPLATE","ZZUT;1","attr","order")="62022,33236"
 S ^VPRPTJ("TEMPLATE","ZZUT;1","attr","order","79899676847489=","urn:va:order:ZZUT:1:31875",1)=""
 S ^VPRPTJ("TEMPLATE","ZZUT;2","attr","order")="62022,33230"
 S ^VPRPTJ("TEMPLATE","ZZUT;2","attr","order","79899676847498=","urn:va:order:ZZUT:2:31875",1)=""
 QUIT
 ;
JPIDSTS ; Old patient array data format
 S ^VPRSTATUS("1ZZUT;1","1ZZUT","order","urn:va:order:1ZZUT:1:31875",20150203122443)=""
 S ^VPRSTATUS("1ZZUT;1","1ZZUT","order","urn:va:order:1ZZUT:1:31875",20150203122443,"stored")=1
 S ^VPRSTATUS("1ZZUT;2","1ZZUT","order","urn:va:order:1ZZUT:2:31875",20150203164100)=""
 S ^VPRSTATUS("1ZZUT;2","1ZZUT","order","urn:va:order:1ZZUT:2:31875",20150203164100,"stored")=1
 S ^VPRSTATUS("ZZUT;1","ZZUT","order","urn:va:order:ZZUT:1:31875",20150203122443)=""
 S ^VPRSTATUS("ZZUT;1","ZZUT","order","urn:va:order:ZZUT:1:31875",20150203122443,"stored")=1
 S ^VPRSTATUS("ZZUT;2","ZZUT","order","urn:va:order:ZZUT:2:31875",20150203164100)=""
 S ^VPRSTATUS("ZZUT;2","ZZUT","order","urn:va:order:ZZUT:2:31875",20150203164100,"stored")=1
 QUIT
 ;
CONVERTOD ;; @DEPRECATE Metastamp conversion script for operational data
 ; One-off test - deprecated and should be obsolete once conversion finished
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
CONVERTPAT ;; @DEPRECATE Metastamp conversion script for patient data
 ; One-off test - deprecated and should be obsolete once conversion finished
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
 ;
CONVERTSHARD ;; @TEST JPID restructure conversion script for patient data
 D ASSERT(0,$D(^VPRPT("1ZZUT;1")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRPT("52833885-af7c-4899-90be-b3a6630b2369","1ZZUT;1")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRPTJ("JSON","1ZZUT;1")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRPTJ("JSON","52833885-af7c-4899-90be-b3a6630b2369","1ZZUT;1")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRPTI("1ZZUT;1")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRPTI("52833885-af7c-4899-90be-b3a6630b2369","1ZZUT;1")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRPTJ("TEMPLATE","1ZZUT;1")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRPTJ("TEMPLATE","52833885-af7c-4899-90be-b3a6630b2369","1ZZUT;1")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRSTATUS("1ZZUT;1")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","1ZZUT;1")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRPT("1ZZUT;2")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRPT("52833885-af7c-4899-90be-b3a6630b2370","1ZZUT;2")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRPTJ("JSON","1ZZUT;2")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRPTJ("JSON","52833885-af7c-4899-90be-b3a6630b2370","1ZZUT;2")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRPTI("1ZZUT;2")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRPTI("52833885-af7c-4899-90be-b3a6630b2370","1ZZUT;2")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRPTJ("TEMPLATE","1ZZUT;2")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRPTJ("TEMPLATE","52833885-af7c-4899-90be-b3a6630b2370","1ZZUT;2")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRSTATUS("1ZZUT;2")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2370","1ZZUT;2")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRPT("ZZUT;1")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRPT("52833885-af7c-4899-90be-b3a6630b2369","ZZUT;1")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRPTJ("JSON","ZZUT;1")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRPTJ("JSON","52833885-af7c-4899-90be-b3a6630b2369","ZZUT;1")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRPTI("ZZUT;1")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRPTI("52833885-af7c-4899-90be-b3a6630b2369","ZZUT;1")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRPTJ("TEMPLATE","ZZUT;1")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRPTJ("TEMPLATE","52833885-af7c-4899-90be-b3a6630b2369","ZZUT;1")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRSTATUS("ZZUT;1")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","ZZUT;1")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRPT("ZZUT;2")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRPT("52833885-af7c-4899-90be-b3a6630b2370","ZZUT;2")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRPTJ("JSON","ZZUT;2")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRPTJ("JSON","52833885-af7c-4899-90be-b3a6630b2370","ZZUT;2")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRPTI("ZZUT;2")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRPTI("52833885-af7c-4899-90be-b3a6630b2370","ZZUT;2")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRPTJ("TEMPLATE","ZZUT;2")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRPTJ("TEMPLATE","52833885-af7c-4899-90be-b3a6630b2370","ZZUT;2")),"A PID sorted under its JPID does not exist and it should")
 D ASSERT(0,$D(^VPRSTATUS("ZZUT;2")),"A PID not sorted under its JPID exists and it should not")
 D ASSERT(10,$D(^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2370","ZZUT;2")),"A PID sorted under its JPID does not exist and it should")
 QUIT
