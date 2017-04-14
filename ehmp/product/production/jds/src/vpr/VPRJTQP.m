VPRJTQP ;V4W/DLW -- Integration tests for POST queries
 ;
STARTUP  ; Run once before all tests
 N I,TAGS
 F I=1:1:5 S TAGS(I)="MED"_I_"^VPRJTP02"
 D BLDPT^VPRJTX(.TAGS)
 QUIT
 ;
SHUTDOWN ; Run once after all tests
 D CLRPT^VPRJTX
 K ^VPRPTJ
 K ^VPRPT
 K ^VPRMETA("JPID")
 K ^||TMP
 QUIT
 ;
SETUP    ; Run before each test
 K HTTPREQ,HTTPERR,HTTPRSP,^||TMP
 QUIT
 ;
TEARDOWN ; Run after each test
 K HTTPREQ,HTTPERR,HTTPRSP,^||TMP
 QUIT
 ;
ASSERT(EXPECT,ACTUAL,MSG) ; convenience
 D EQ^VPRJT(EXPECT,ACTUAL,$G(MSG))
 QUIT
 ;
POSTQUERY ;; @TEST POST query with a big (1004 chars) filter on an index
 ; filter just over the 1000 character limit some browsers and proxies have
 N HTTPERR,JSON,VPRJPID
 S VPRJPID=$$JPID4PID^VPRJPR("93EF;-7")
 D ASSERT(1,$G(VPRJPID)'="","JPID doesn't exist for this patient")
 I $G(VPRJPID)="" QUIT
 D SETPOST^VPRJTX("/vpr/"_VPRJTPID_"/index/med-time/?query=true","POSTFILTER","VPRJTP04")
 D RESPOND^VPRJRSP
 D ASSERT(0,$G(HTTPERR))
 D DATA2ARY^VPRJTX(.JSON)
 D ASSERT(4,$G(JSON("data","totalItems")))
 D ASSERT("PHARMACIST,ONE",$G(JSON("data","items",1,"orders",1,"pharmacist","name")))
 D ASSERT("TAB,SA",$G(JSON("data","items",2,"productFormName")))
 D ASSERT("WARFARIN",$G(JSON("data","items",3,"products",1,"ingredientName")))
 D ASSERT("NON-OPIOID ANALGESICS",$G(JSON("data","items",4,"products",1,"drugClassName")))
 QUIT
 ;
POSTQUERY2 ;; @TEST POST query with a large (2090 chars) filter on an index
 ; filter just over the 2083 character limit some browsers and proxies have
 N HTTPERR,JSON,VPRJPID,I,J,K,L,LAST,DATA
 S VPRJPID=$$JPID4PID^VPRJPR("93EF;-7")
 D ASSERT(1,$G(VPRJPID)'="","JPID doesn't exist for this patient")
 I $G(VPRJPID)="" QUIT
 D SETPOST^VPRJTX("/vpr/"_VPRJTPID_"/index/med-time/?query=true","POSTFILTER","VPRJTP04")
 S LAST=$O(HTTPREQ("body",""),-1)
 S HTTPREQ("body",LAST)=$E(HTTPREQ("body",LAST),1,$L(HTTPREQ("body",LAST))-2)_","
 F I=LAST:1:12 D
 . K DATA
 . D GETDATA^VPRJTX("POSTFILTER","VPRJTP04",.DATA)
 . S DATA(1)=$E(DATA(1),12,$L(DATA(1)))
 . S L=$O(DATA(""),-1)
 . S DATA(L)=$E(DATA(L),1,$L(DATA(L))-2)_","
 . S J=0
 . F K=I+1:1 S J=$O(DATA(J)) Q:J=""  D
 . . S HTTPREQ("body",K)=DATA(J)
 S LAST=$O(HTTPREQ("body",""),-1)
 S HTTPREQ("body",LAST)=$E(HTTPREQ("body",LAST),1,$L(HTTPREQ("body",LAST))-1)_"""}"
 D RESPOND^VPRJRSP
 D ASSERT(0,$G(HTTPERR))
 D DATA2ARY^VPRJTX(.JSON)
 D ASSERT(4,$G(JSON("data","totalItems")))
 D ASSERT("PHARMACIST,ONE",$G(JSON("data","items",1,"orders",1,"pharmacist","name")))
 D ASSERT("TAB,SA",$G(JSON("data","items",2,"productFormName")))
 D ASSERT("WARFARIN",$G(JSON("data","items",3,"products",1,"ingredientName")))
 D ASSERT("NON-OPIOID ANALGESICS",$G(JSON("data","items",4,"products",1,"drugClassName")))
 QUIT
 ;
POSTQUERY3 ;; @TEST POST query with a massive (3640934 chars) filter on an index
 ; filter just under the limit (3641000) on a string in the POST query processor (set lower than a string limit in Cache - 3641144)
 N HTTPERR,JSON,VPRJPID,I,J,K,L,LAST,DATA
 S VPRJPID=$$JPID4PID^VPRJPR("93EF;-7")
 D ASSERT(1,$G(VPRJPID)'="","JPID doesn't exist for this patient")
 I $G(VPRJPID)="" QUIT
 D SETPOST^VPRJTX("/vpr/"_VPRJTPID_"/index/med-time/?query=true","POSTFILTER","VPRJTP04")
 S LAST=$O(HTTPREQ("body",""),-1)
 S HTTPREQ("body",LAST)=$E(HTTPREQ("body",LAST),1,$L(HTTPREQ("body",LAST))-2)_","
 F I=LAST:1:44936 D
 . K DATA
 . D GETDATA^VPRJTX("POSTFILTER","VPRJTP04",.DATA)
 . S DATA(1)=$E(DATA(1),12,$L(DATA(1)))
 . S L=$O(DATA(""),-1)
 . S DATA(L)=$E(DATA(L),1,$L(DATA(L))-2)_","
 . S J=0
 . F K=I+1:1 S J=$O(DATA(J)) Q:J=""  D
 . . S HTTPREQ("body",K)=DATA(J)
 S LAST=$O(HTTPREQ("body",""),-1)
 S HTTPREQ("body",LAST)=$E(HTTPREQ("body",LAST),1,$L(HTTPREQ("body",LAST))-1)_"""}"
 D RESPOND^VPRJRSP
 D ASSERT(0,$G(HTTPERR))
 D DATA2ARY^VPRJTX(.JSON)
 D ASSERT(4,$G(JSON("data","totalItems")))
 D ASSERT("PHARMACIST,ONE",$G(JSON("data","items",1,"orders",1,"pharmacist","name")))
 D ASSERT("TAB,SA",$G(JSON("data","items",2,"productFormName")))
 D ASSERT("WARFARIN",$G(JSON("data","items",3,"products",1,"ingredientName")))
 D ASSERT("NON-OPIOID ANALGESICS",$G(JSON("data","items",4,"products",1,"drugClassName")))
 QUIT
 ;
POSTQUERY4 ;; @TEST POST query with a massive (3640934 chars) filter on an index with start and limit set
 ; filter just under the limit (3641000) on a string in the POST query processor (set lower than a string limit in Cache - 3641144)
 ; then test the start and limit parameters
 N HTTPERR,JSON,VPRJPID,I,J,K,L,LAST,DATA
 S VPRJPID=$$JPID4PID^VPRJPR("93EF;-7")
 D ASSERT(1,$G(VPRJPID)'="","JPID doesn't exist for this patient")
 I $G(VPRJPID)="" QUIT
 D SETPOST^VPRJTX("/vpr/"_VPRJTPID_"/index/med-time/?query=true","POSTFILTER","VPRJTP04")
 S LAST=$O(HTTPREQ("body",""),-1)
 S HTTPREQ("body",LAST)=$E(HTTPREQ("body",LAST),1,$L(HTTPREQ("body",LAST))-2)_","
 F I=LAST:1:44936 D
 . K DATA
 . D GETDATA^VPRJTX("POSTFILTER","VPRJTP04",.DATA)
 . S DATA(1)=$E(DATA(1),12,$L(DATA(1)))
 . S L=$O(DATA(""),-1)
 . S DATA(L)=$E(DATA(L),1,$L(DATA(L))-2)_","
 . S J=0
 . F K=I+1:1 S J=$O(DATA(J)) Q:J=""  D
 . . S HTTPREQ("body",K)=DATA(J)
 S LAST=$O(HTTPREQ("body",""),-1)
 S HTTPREQ("body",LAST)=$E(HTTPREQ("body",LAST),1,$L(HTTPREQ("body",LAST))-1)_""","
 S HTTPREQ("body",LAST)=HTTPREQ("body",LAST)_"""start"":1,""limit"":2}"
 D RESPOND^VPRJRSP
 D ASSERT(0,$G(HTTPERR))
 D DATA2ARY^VPRJTX(.JSON)
 D ASSERT(2,$G(JSON("data","currentItemCount")))
 D ASSERT(4,$G(JSON("data","totalItems")))
 D ASSERT("PHARMACIST,THIRTY",$G(JSON("data","items",1,"orders",1,"pharmacist","name")))
 D ASSERT("METFORMIN",$G(JSON("data","items",1,"products",1,"ingredientName")))
 D ASSERT("TAB,SA",$G(JSON("data","items",1,"productFormName")))
 D ASSERT("ORAL HYPOGLYCEMIC AGENTS,ORAL",$G(JSON("data","items",1,"products",1,"drugClassName")))
 D ASSERT("not active",$G(JSON("data","items",2,"medStatusName")))
 D ASSERT("urn:sct:73639000",$G(JSON("data","items",2,"medType")))
 D ASSERT("VEHU,ONEHUNDRED",$G(JSON("data","items",2,"orders",1,"provider","name")))
 D ASSERT("DISCONTINUED",$G(JSON("data","items",2,"orders",1,"vaOrderStatus")))
 QUIT
 ;
POSTQUERY5 ;; @TEST POST query with a massive (3640953 chars) filter on an index
 ; filter just over the limit (3641000) on a string in the POST query processor (set lower than a string limit in Cache - 3641144)
 N HTTPERR,JSON,VPRJPID,I,J,K,L,LAST,DATA
 S VPRJPID=$$JPID4PID^VPRJPR("93EF;-7")
 D ASSERT(1,$G(VPRJPID)'="","JPID doesn't exist for this patient")
 I $G(VPRJPID)="" QUIT
 D SETPOST^VPRJTX("/vpr/"_VPRJTPID_"/index/med-time/?query=true","POSTFILTER","VPRJTP04")
 S LAST=$O(HTTPREQ("body",""),-1)
 S HTTPREQ("body",LAST)=$E(HTTPREQ("body",LAST),1,$L(HTTPREQ("body",LAST))-2)_","
 F I=LAST:1:44937 D
 . K DATA
 . D GETDATA^VPRJTX("POSTFILTER","VPRJTP04",.DATA)
 . S DATA(1)=$E(DATA(1),12,$L(DATA(1)))
 . S L=$O(DATA(""),-1)
 . S DATA(L)=$E(DATA(L),1,$L(DATA(L))-2)_","
 . S J=0
 . F K=I+1:1 S J=$O(DATA(J)) Q:J=""  D
 . . S HTTPREQ("body",K)=DATA(J)
 S LAST=$O(HTTPREQ("body",""),-1)
 S HTTPREQ("body",LAST)=$E(HTTPREQ("body",LAST),1,$L(HTTPREQ("body",LAST))-1)_"""}"
 D RESPOND^VPRJRSP
 D ASSERT(413,^||TMP("HTTPERR",$J,1,"error","code"),"Should be HTTP 413 error, but it is not")
 D DATA2ARY^VPRJTX(.JSON)
 D ASSERT(0,$D(JSON("data")))
 D ASSERT("POST query parameters exceed argument length limit",^||TMP("HTTPERR",$J,1,"error","errors",1,"domain"))
 D ASSERT("Parameter length limit exceeded",^||TMP("HTTPERR",$J,1,"error","errors",1,"message"))
 D ASSERT(114,^||TMP("HTTPERR",$J,1,"error","errors",1,"reason"),"Should be JDS 114 error reason, but it is not")
 D ASSERT("Request entity too large",^||TMP("HTTPERR",$J,1,"error","message"))
 QUIT
 ;
POSTQUERY6 ;; @TEST POST query with a massive (3640934 chars) filter on an index, with other parameters go over the limit (3641013)
 ; filter just under the limit (3641000) on a string in the POST query processor (set lower than a string limit in Cache - 3641144)
 ; then add start, limit, and order parameters to put it over the limit
 N HTTPERR,JSON,VPRJPID,I,J,K,L,LAST,DATA
 S VPRJPID=$$JPID4PID^VPRJPR("93EF;-7")
 D ASSERT(1,$G(VPRJPID)'="","JPID doesn't exist for this patient")
 I $G(VPRJPID)="" QUIT
 D SETPOST^VPRJTX("/vpr/"_VPRJTPID_"/index/med-time/?query=true","POSTFILTER","VPRJTP04")
 S LAST=$O(HTTPREQ("body",""),-1)
 S HTTPREQ("body",LAST)=$E(HTTPREQ("body",LAST),1,$L(HTTPREQ("body",LAST))-2)_","
 F I=LAST:1:44936 D
 . K DATA
 . D GETDATA^VPRJTX("POSTFILTER","VPRJTP04",.DATA)
 . S DATA(1)=$E(DATA(1),12,$L(DATA(1)))
 . S L=$O(DATA(""),-1)
 . S DATA(L)=$E(DATA(L),1,$L(DATA(L))-2)_","
 . S J=0
 . F K=I+1:1 S J=$O(DATA(J)) Q:J=""  D
 . . S HTTPREQ("body",K)=DATA(J)
 S LAST=$O(HTTPREQ("body",""),-1)
 S HTTPREQ("body",LAST)=$E(HTTPREQ("body",LAST),1,$L(HTTPREQ("body",LAST))-1)_""","
 S HTTPREQ("body",LAST)=HTTPREQ("body",LAST)_"""start"":0,""limit"":1000000000000000000000000000000000000000,"
 S HTTPREQ("body",LAST)=HTTPREQ("body",LAST)_"""order"":""sig asc, kind desc, overallStop""}"
 D RESPOND^VPRJRSP
 D ASSERT(413,^||TMP("HTTPERR",$J,1,"error","code"),"Should be HTTP 413 error, but it is not")
 D DATA2ARY^VPRJTX(.JSON)
 D ASSERT(0,$D(JSON("data")))
 D ASSERT("POST query parameters exceed argument length limit",^||TMP("HTTPERR",$J,1,"error","errors",1,"domain"))
 D ASSERT("Parameter length limit exceeded",^||TMP("HTTPERR",$J,1,"error","errors",1,"message"))
 D ASSERT(114,^||TMP("HTTPERR",$J,1,"error","errors",1,"reason"),"Should be JDS 114 error reason, but it is not")
 D ASSERT("Request entity too large",^||TMP("HTTPERR",$J,1,"error","message"))
 QUIT
