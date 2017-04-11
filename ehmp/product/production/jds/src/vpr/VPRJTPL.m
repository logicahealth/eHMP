VPRJTPL ;V4W/DLW -- Integration tests for RESTful patient list queries
 ;;1.0;JSON DATA STORE;;Sep 01, 2012
 ;
STARTUP  ; Run once before all tests
 ; Kill global that might be left around from other test routines and might mess this one up
 K ^VPRMETA("JPID")
 ;
 D KILLIDS
 D PATIDS
 Q
 ;
SHUTDOWN ; Run once after all tests
 D KILLIDS
 Q
 ;
SETUP    ; Run before each test
 K HTTPREQ,HTTPERR,HTTPRSP
 Q
TEARDOWN ; Run after each test
 K HTTPREQ,HTTPERR,HTTPRSP
 Q
ASSERT(EXPECT,ACTUAL,MSG) ; for convenience
 D EQ^VPRJT(EXPECT,ACTUAL,$G(MSG))
 Q
 ;
PATIDS ; Setup patient identifiers
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","ZZUT;3")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","ZZUT1;3")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","1234V4321")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","1234;3")=""
 S ^VPRPTJ("JPID","ZZUT;3")="52833885-af7c-4899-90be-b3a6630b2369"
 S ^VPRPTJ("JPID","ZZUT1;3")="52833885-af7c-4899-90be-b3a6630b2369"
 S ^VPRPTJ("JPID","1234V4321")="52833885-af7c-4899-90be-b3a6630b2369"
 S ^VPRPTJ("JPID","1234;3")="52833885-af7c-4899-90be-b3a6630b2369"
 S ^VPRMETA("JPID","52833885-af7c-4899-90be-b3a6630b2369","lastAccessTime")=20151021141030
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2370")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2370","ZZUT;5")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2370","ZZUT1;5")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2370","1235V5321")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2370","1235;5")=""
 S ^VPRPTJ("JPID","ZZUT;5")="52833885-af7c-4899-90be-b3a6630b2370"
 S ^VPRPTJ("JPID","ZZUT1;5")="52833885-af7c-4899-90be-b3a6630b2370"
 S ^VPRPTJ("JPID","1235V5321")="52833885-af7c-4899-90be-b3a6630b2370"
 S ^VPRPTJ("JPID","1235;5")="52833885-af7c-4899-90be-b3a6630b2370"
 S ^VPRMETA("JPID","52833885-af7c-4899-90be-b3a6630b2370","lastAccessTime")=20151021151500
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2371")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2371","ZZUT;6")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2371","ZZUT1;6")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2371","1236V6321")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2371","1236;6")=""
 S ^VPRPTJ("JPID","ZZUT;6")="52833885-af7c-4899-90be-b3a6630b2371"
 S ^VPRPTJ("JPID","ZZUT1;6")="52833885-af7c-4899-90be-b3a6630b2371"
 S ^VPRPTJ("JPID","1236V6321")="52833885-af7c-4899-90be-b3a6630b2371"
 S ^VPRPTJ("JPID","1236;6")="52833885-af7c-4899-90be-b3a6630b2371"
 S ^VPRMETA("JPID","52833885-af7c-4899-90be-b3a6630b2371","lastAccessTime")=20151021161520
 Q
 ;
KILLIDS
 K ^TMP("HTTPERR",$J)
 K ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2369","ZZUT;3")
 K ^VPRPTJ("JPID","ZZUT;3")
 K ^VPRPTJ("JPID","ZZUT1;3")
 K ^VPRPTJ("JPID","1234V4321")
 K ^VPRPTJ("JPID","1234;3")
 K ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")
 K ^VPRMETA("JPID","52833885-af7c-4899-90be-b3a6630b2369","lastAccessTime")
 K ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2370","ZZUT;5")
 K ^VPRPTJ("JPID","ZZUT;5")
 K ^VPRPTJ("JPID","ZZUT1;5")
 K ^VPRPTJ("JPID","1235V5321")
 K ^VPRPTJ("JPID","1235;5")
 K ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2370")
 K ^VPRMETA("JPID","52833885-af7c-4899-90be-b3a6630b2370","lastAccessTime")
 K ^VPRSTATUS("52833885-af7c-4899-90be-b3a6630b2371","ZZUT;6")
 K ^VPRPTJ("JPID","ZZUT;6")
 K ^VPRPTJ("JPID","ZZUT1;6")
 K ^VPRPTJ("JPID","1236V6321")
 K ^VPRPTJ("JPID","1236;6")
 K ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2371")
 K ^VPRMETA("JPID","52833885-af7c-4899-90be-b3a6630b2371","lastAccessTime")
 Q
 ;
GETPTS ;; @TEST getting a full patient list
 N JSON
 ;
 D SETGET^VPRJTX("/vpr/all/patientlist")
 D RESPOND^VPRJRSP
 D ASSERT(0,$G(HTTPERR))
 ;
 D DATA2ARY^VPRJTX(.JSON)
 ;
 D ASSERT(1,$D(JSON("items",1,"jpid")))
 D ASSERT(1,$D(JSON("items",2,"jpid")))
 D ASSERT(1,$D(JSON("items",3,"jpid")))
 D ASSERT("52833885-af7c-4899-90be-b3a6630b2369",$G(JSON("items",1,"jpid")))
 D ASSERT("52833885-af7c-4899-90be-b3a6630b2370",$G(JSON("items",2,"jpid")))
 D ASSERT("52833885-af7c-4899-90be-b3a6630b2371",$G(JSON("items",3,"jpid")))
 ;
 Q
 ;
FILTERLT ;; @TEST filtering patients less than the lastAccessTime
 N JSON
 ;
 D SETGET^VPRJTX("/vpr/all/patientlist?filter=lt(""lastAccessTime"",20151021141030)")
 D RESPOND^VPRJRSP
 D ASSERT(0,$G(HTTPERR))
 ;
 D DATA2ARY^VPRJTX(.JSON)
 ;
 D ASSERT(0,$D(JSON("items",1,"jpid")))
 D ASSERT(0,$D(JSON("items",2,"jpid")))
 D ASSERT(0,$D(JSON("items",3,"jpid")))
 ;
 K JSON
 ;
 D SETGET^VPRJTX("/vpr/all/patientlist?filter=lt(""lastAccessTime"",20151021151500)")
 D RESPOND^VPRJRSP
 D ASSERT(0,$G(HTTPERR))
 ;
 D DATA2ARY^VPRJTX(.JSON)
 ;
 D ASSERT(1,$D(JSON("items",1,"jpid")))
 D ASSERT(0,$D(JSON("items",2,"jpid")))
 D ASSERT(0,$D(JSON("items",3,"jpid")))
 D ASSERT("52833885-af7c-4899-90be-b3a6630b2369",$G(JSON("items",1,"jpid")))
 ;
 K JSON
 ;
 D SETGET^VPRJTX("/vpr/all/patientlist?filter=lt(""lastAccessTime"",20151021161520)")
 D RESPOND^VPRJRSP
 D ASSERT(0,$G(HTTPERR))
 ;
 D DATA2ARY^VPRJTX(.JSON)
 ;
 D ASSERT(1,$D(JSON("items",1,"jpid")))
 D ASSERT(1,$D(JSON("items",2,"jpid")))
 D ASSERT(0,$D(JSON("items",3,"jpid")))
 D ASSERT("52833885-af7c-4899-90be-b3a6630b2369",$G(JSON("items",1,"jpid")))
 D ASSERT("52833885-af7c-4899-90be-b3a6630b2370",$G(JSON("items",2,"jpid")))
 ;
 Q
 ;
FILTEREQ ;; @TEST filtering patients that are equal to the lastAccessTime
 N JSON
 ;
 D SETGET^VPRJTX("/vpr/all/patientlist?filter=eq(""lastAccessTime"",20151021141030)")
 D RESPOND^VPRJRSP
 D ASSERT(0,$G(HTTPERR))
 ;
 D DATA2ARY^VPRJTX(.JSON)
 ;
 D ASSERT(1,$D(JSON("items",1,"jpid")))
 D ASSERT(0,$D(JSON("items",2,"jpid")))
 D ASSERT(0,$D(JSON("items",3,"jpid")))
 D ASSERT("52833885-af7c-4899-90be-b3a6630b2369",$G(JSON("items",1,"jpid")))
 ;
 K JSON
 ;
 D SETGET^VPRJTX("/vpr/all/patientlist?filter=eq(""lastAccessTime"",20151021151500)")
 D RESPOND^VPRJRSP
 D ASSERT(0,$G(HTTPERR))
 ;
 D DATA2ARY^VPRJTX(.JSON)
 ;
 D ASSERT(1,$D(JSON("items",1,"jpid")))
 D ASSERT(0,$D(JSON("items",2,"jpid")))
 D ASSERT(0,$D(JSON("items",3,"jpid")))
 D ASSERT("52833885-af7c-4899-90be-b3a6630b2370",$G(JSON("items",1,"jpid")))
 ;
 K JSON
 ;
 D SETGET^VPRJTX("/vpr/all/patientlist?filter=eq(""lastAccessTime"",20151021161520)")
 D RESPOND^VPRJRSP
 D ASSERT(0,$G(HTTPERR))
 ;
 D DATA2ARY^VPRJTX(.JSON)
 ;
 D ASSERT(1,$D(JSON("items",1,"jpid")))
 D ASSERT(0,$D(JSON("items",2,"jpid")))
 D ASSERT(0,$D(JSON("items",3,"jpid")))
 D ASSERT("52833885-af7c-4899-90be-b3a6630b2371",$G(JSON("items",1,"jpid")))
 ;
 Q
 ;
FILTERGT ;; @TEST filtering patients greater than the lastAccessTime
 N JSON
 ;
 D SETGET^VPRJTX("/vpr/all/patientlist?filter=gt(""lastAccessTime"",20151021141030)")
 D RESPOND^VPRJRSP
 D ASSERT(0,$G(HTTPERR))
 ;
 D DATA2ARY^VPRJTX(.JSON)
 ;
 D ASSERT(1,$D(JSON("items",1,"jpid")))
 D ASSERT(1,$D(JSON("items",2,"jpid")))
 D ASSERT(0,$D(JSON("items",3,"jpid")))
 D ASSERT("52833885-af7c-4899-90be-b3a6630b2370",$G(JSON("items",1,"jpid")))
 D ASSERT("52833885-af7c-4899-90be-b3a6630b2371",$G(JSON("items",2,"jpid")))
 ;
 K JSON
 ;
 D SETGET^VPRJTX("/vpr/all/patientlist?filter=gt(""lastAccessTime"",20151021151500)")
 D RESPOND^VPRJRSP
 D ASSERT(0,$G(HTTPERR))
 ;
 D DATA2ARY^VPRJTX(.JSON)
 ;
 D ASSERT(1,$D(JSON("items",1,"jpid")))
 D ASSERT(0,$D(JSON("items",2,"jpid")))
 D ASSERT(0,$D(JSON("items",3,"jpid")))
 D ASSERT("52833885-af7c-4899-90be-b3a6630b2371",$G(JSON("items",1,"jpid")))
 ;
 K JSON
 ;
 D SETGET^VPRJTX("/vpr/all/patientlist?filter=gt(""lastAccessTime"",20151021161520)")
 D RESPOND^VPRJRSP
 D ASSERT(0,$G(HTTPERR))
 ;
 D DATA2ARY^VPRJTX(.JSON)
 ;
 D ASSERT(0,$D(JSON("items",1,"jpid")))
 D ASSERT(0,$D(JSON("items",2,"jpid")))
 D ASSERT(0,$D(JSON("items",3,"jpid")))
 ;
 Q
 ;
