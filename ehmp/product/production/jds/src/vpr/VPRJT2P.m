VPRJT2P ;V4W/DLW -- Integration tests for patient utilities
 ;
STARTUP ; Run once before all tests
 N I,TAGS
 D PATIDS
 F I=1:1:5 S TAGS(I)="MED"_I_"^VPRJTP02"
 D BLDPT^VPRJTX(.TAGS)
 QUIT
 ;
SHUTDOWN ; Run once after all tests
 D CLRPT^VPRJTX
 QUIT
 ;
ASSERT(EXPECT,ACTUAL,MSG) ; for convenience
 D EQ^VPRJT(EXPECT,ACTUAL,$G(MSG))
 QUIT
 ;
PATIDS ; Setup patient identifiers
 S ^VPRPTX("count","patient","patient")=2
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","93EF;-7")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2369","-777V123777")=""
 S ^VPRPTJ("JPID","93EF;-7")="52833885-af7c-4899-90be-b3a6630b2369"
 S ^VPRPTJ("JPID","-777V123777")="52833885-af7c-4899-90be-b3a6630b2369"
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2370")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2370","93EF;-8")=""
 S ^VPRPTJ("JPID","52833885-af7c-4899-90be-b3a6630b2370","-777V123778")=""
 S ^VPRPTJ("JPID","93EF;-8")="52833885-af7c-4899-90be-b3a6630b2370"
 S ^VPRPTJ("JPID","-777V123778")="52833885-af7c-4899-90be-b3a6630b2370"
 QUIT
 ;
RIDXALL ;; @TEST reindexing all patient data indexes
 N PID,JPID
 S PID="93EF;-7"
 S JPID=$$JPID4PID^VPRJPR(PID)
 ;
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-class-code","urn:vadc:hs502 ","79939681=","urn:va:med:93EF:-7:16982","products#1")))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-provider","labtech,special ","79939681=","urn:va:med:93EF:-7:16982","orders#1")))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-qualified-name","metformin ","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","medication","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT("79939681=",^VPRPTI(JPID,PID,"time","med-time","79949682=","urn:va:med:93EF:-7:16982",1))
 D ASSERT("79949682=",^VPRPTI(JPID,PID,"stop","med-time","79939681=","urn:va:med:93EF:-7:16982",1))
 D ASSERT(4,^VPRPTI(JPID,PID,"tally","kind","medication, outpatient"))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-active-outpt","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT(5,^VPRPTX("count","collection","med"))
 D ASSERT(1,$D(^VPRMETA("JPID",JPID,"lastAccessTime")))
 ;
 D RIDXALL^VPRJ2P
 ;
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-class-code","urn:vadc:hs502 ","79939681=","urn:va:med:93EF:-7:16982","products#1")))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-provider","labtech,special ","79939681=","urn:va:med:93EF:-7:16982","orders#1")))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-qualified-name","metformin ","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","medication","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT("79939681=",^VPRPTI(JPID,PID,"time","med-time","79949682=","urn:va:med:93EF:-7:16982",1))
 D ASSERT("79949682=",^VPRPTI(JPID,PID,"stop","med-time","79939681=","urn:va:med:93EF:-7:16982",1))
 D ASSERT(4,^VPRPTI(JPID,PID,"tally","kind","medication, outpatient"))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-active-outpt","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT(5,^VPRPTX("count","collection","med"))
 D ASSERT(1,$D(^VPRMETA("JPID",JPID,"lastAccessTime")))
 ;
 QUIT
 ;
RIDXONE ;; @TEST reindexing one patient data index
 N PID,JPID
 S PID="93EF;-7"
 S JPID=$$JPID4PID^VPRJPR(PID)
 ;
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-class-code","urn:vadc:hs502 ","79939681=","urn:va:med:93EF:-7:16982","products#1")))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-provider","labtech,special ","79939681=","urn:va:med:93EF:-7:16982","orders#1")))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-qualified-name","metformin ","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","medication","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT("79939681=",^VPRPTI(JPID,PID,"time","med-time","79949682=","urn:va:med:93EF:-7:16982",1))
 D ASSERT("79949682=",^VPRPTI(JPID,PID,"stop","med-time","79939681=","urn:va:med:93EF:-7:16982",1))
 D ASSERT(4,^VPRPTI(JPID,PID,"tally","kind","medication, outpatient"))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-active-outpt","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT(5,^VPRPTX("count","collection","med"))
 D ASSERT(1,$D(^VPRMETA("JPID",JPID,"lastAccessTime")))
 ;
 D RIDXALL^VPRJ2P("med-qualified-name")
 ;
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-class-code","urn:vadc:hs502 ","79939681=","urn:va:med:93EF:-7:16982","products#1")))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-provider","labtech,special ","79939681=","urn:va:med:93EF:-7:16982","orders#1")))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-qualified-name","metformin ","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","medication","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT("79939681=",^VPRPTI(JPID,PID,"time","med-time","79949682=","urn:va:med:93EF:-7:16982",1))
 D ASSERT("79949682=",^VPRPTI(JPID,PID,"stop","med-time","79939681=","urn:va:med:93EF:-7:16982",1))
 D ASSERT(4,^VPRPTI(JPID,PID,"tally","kind","medication, outpatient"))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-active-outpt","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT(5,^VPRPTX("count","collection","med"))
 D ASSERT(1,$D(^VPRMETA("JPID",JPID,"lastAccessTime")))
 ;
 QUIT
 ;
RIDXSOME ;; @TEST reindexing some patient data indexes
 N PID,JPID
 S PID="93EF;-7"
 S JPID=$$JPID4PID^VPRJPR(PID)
 ;
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-class-code","urn:vadc:hs502 ","79939681=","urn:va:med:93EF:-7:16982","products#1")))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-provider","labtech,special ","79939681=","urn:va:med:93EF:-7:16982","orders#1")))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-qualified-name","metformin ","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","medication","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT("79939681=",^VPRPTI(JPID,PID,"time","med-time","79949682=","urn:va:med:93EF:-7:16982",1))
 D ASSERT("79949682=",^VPRPTI(JPID,PID,"stop","med-time","79939681=","urn:va:med:93EF:-7:16982",1))
 D ASSERT(4,^VPRPTI(JPID,PID,"tally","kind","medication, outpatient"))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-active-outpt","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT(5,^VPRPTX("count","collection","med"))
 D ASSERT(1,$D(^VPRMETA("JPID",JPID,"lastAccessTime")))
 ;
 D RIDXALL^VPRJ2P("med-class-code,med-qualified-name,med-provider")
 ;
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-class-code","urn:vadc:hs502 ","79939681=","urn:va:med:93EF:-7:16982","products#1")))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-provider","labtech,special ","79939681=","urn:va:med:93EF:-7:16982","orders#1")))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-qualified-name","metformin ","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","medication","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT("79939681=",^VPRPTI(JPID,PID,"time","med-time","79949682=","urn:va:med:93EF:-7:16982",1))
 D ASSERT("79949682=",^VPRPTI(JPID,PID,"stop","med-time","79939681=","urn:va:med:93EF:-7:16982",1))
 D ASSERT(4,^VPRPTI(JPID,PID,"tally","kind","medication, outpatient"))
 D ASSERT(1,$D(^VPRPTI(JPID,PID,"attr","med-active-outpt","79939681=","urn:va:med:93EF:-7:16982",1)))
 D ASSERT(5,^VPRPTX("count","collection","med"))
 D ASSERT(1,$D(^VPRMETA("JPID",JPID,"lastAccessTime")))
 ;
 QUIT
