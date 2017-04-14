VPRJTPDI ;AFS/MBS -- Integration tests for document indexes
 ;
STARTUP  ; Run once before all tests
 N I,TAGS
 F I=1:1:5 S TAGS(I)="MED"_I_"^VPRJTP02"
 D BLDPT^VPRJTX(.TAGS)
 K TAGS
 F I=1:1:3 S TAGS(I)="UTST"_I_"^VPRJTP01"
 D ADDDATA^VPRJTX(.TAGS,VPRJTPID)
 K TAGS
 F I=1:1:10 S TAGS(I)="EHMPDOCS"_I_"^VPRJTP01"
 D ADDDATA^VPRJTX(.TAGS,VPRJTPID)
 Q
SHUTDOWN ; Run once after all tests
 D CLRPT^VPRJTX
 Q
ASSERT(EXPECT,ACTUAL,MSG) ; for convenience
 D EQ^VPRJT(EXPECT,ACTUAL,$G(MSG))
 Q
 ;
TMP2ARY(ARY) ; convert JSON object in ^||TMP($J) to array
 ; ARY must be passed by reference
 N SIZE,PREAMBLE
 S HTTPREQ("store")="vpr" ; normally this gets set in RESPOND^VPRJRSP
 D PAGE^VPRJRUT("^||TMP($J)",0,999,.SIZE,.PREAMBLE)
 N SRC,N,I,J
 S N=0,SRC(N)="{""data"":{""totalItems"":"_^||TMP($J,"total")_",""items"":["
 S I="" F  S I=$O(^||TMP($J,$J,I)) Q:I=""  D
 . I I S SRC(N)=SRC(N)_","
 . S J=0 F  S J=$O(^||TMP($J,$J,I,J)) Q:'J  D
 . . S N=N+1,SRC(N)=^||TMP($J,$J,I,J)
 S N=N+1,SRC(N)="]}}"
 D DECODE^VPRJSON("SRC","ARY","ERR")
 D ASSERT(0,$G(ERR(0),0),"JSON conversion error")
 Q
EHMPSETIF ;; @TEST unit test setif condition for ehmp-documents index
 N HTTPERR,JSON,OBJ
 S HTTPREQ("store")="vpr"
 D GETDATA^VPRJTX("EHMPDOCS1","VPRJTP01",.JSON)
 D DECODE^VPRJSON("JSON","OBJ")
 D ASSERT(1,$$EHMPDOC^VPRJFPS(.OBJ),"ehmp-documents setif failed to pass good consult data")
 K JSON,OBJ
 D GETDATA^VPRJTX("EHMPDOCS2","VPRJTP01",.JSON)
 D DECODE^VPRJSON("JSON","OBJ")
 D ASSERT(0,$$EHMPDOC^VPRJFPS(.OBJ),"ehmp-documents setif failed to filter bad consult data")
 K JSON,OBJ
 D GETDATA^VPRJTX("EHMPDOCS9","VPRJTP01",.JSON)
 D DECODE^VPRJSON("JSON","OBJ")
 D ASSERT(1,$$EHMPDOC^VPRJFPS(.OBJ),"ehmp-documents setif failed to pass good document data")
 K JSON,OBJ
 D GETDATA^VPRJTX("EHMPDOCS10","VPRJTP01",.JSON)
 D DECODE^VPRJSON("JSON","OBJ")
 D ASSERT(1,$$EHMPDOC^VPRJFPS(.OBJ),"ehmp-documents setif failed to pass good incomplete document data")
 Q
 ;
EHMPDOCS ;; @TEST integration test ehmp-documents
 N HTTPERR,ARGS,RET,EHMP,DOCS,MATCH
 K ^||TMP($J)
 S ARGS("pid")="93EF;-7",ARGS("indexName")="docs-view",ARGS("filter")="not(and(in(""kind"",[""Consult"",""Imaging"",""Procedure""]),ne(""statusName"",""COMPLETE"")))"
 D INDEX^VPRJPR(.RET,.ARGS)
 D TMP2ARY(.DOCS)
 K ARGS S ARGS("pid")="93EF;-7",ARGS("indexName")="ehmp-documents"
 K ^||TMP($J) D INDEX^VPRJPR(.RET,.ARGS)
 D TMP2ARY(.EHMP)
 D ASSERT($G(DOCS("data","totalItems")),$G(EHMP("data","totalItems")))
 S MATCH=1
 F I=1:1:$G(DOCS("data","totalItems")) D
 . I $G(EHMP("data","items",I,"uid"))'=$G(DOCS("data","items",I,"uid")) D
 . . S MATCH=0
 D ASSERT(1,MATCH,"ehmp-documents return does not match docs-view return with filter")
 Q
 ;
1 ; do one test
 D STARTUP,SORTSTOP,SHUTDOWN
 Q
