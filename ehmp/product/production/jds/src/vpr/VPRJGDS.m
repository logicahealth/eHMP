VPRJGDS ;KRM/CJE -- Generic Data Store
 ;
 Q
 ;
SET(ARGS,BODY)  ; Store error(s) based on the passed in uid
 N OBJECT,ERR,RESULT,GLOBAL,GLOBALJ,UID,INCR,OLDOBJ
 ; Ensure the store is setup and correct
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) Q ""
 ; Parsed JSON
 S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 ; Raw JSON
 S GLOBALJ="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"J"
 ;
 I $L(GLOBAL)<2 D SETERROR^VPRJRER(253) Q ""
 ;
 ; If the body is null just return with error
 I '$D(BODY) D SETERROR^VPRJRER(255) Q ""
 ;
 D DECODE^VPRJSON("BODY","OBJECT","ERR") ; From JSON to an array
 I $D(ERR) D SETERROR^VPRJRER(202) Q ""
 ;
 ; Are we provided a UID?
 ; UID in object is not null
 I $G(OBJECT("uid"))'="" S UID=$G(OBJECT("uid"))
 ; UID in URL is not null
 I $G(ARGS("uid"))'="" S UID=$G(ARGS("uid"))
 ; Make sure that if we are handed a UID in the URL it matches the object if it exists
 I $G(ARGS("uid"))'=""&($G(OBJECT("uid"))'="") I $G(ARGS("uid"))'=$G(OBJECT("uid")) D SETERROR^VPRJRER(256) Q ""
 ;
 ; Make sure the uid begins with what we want
 ; This has to use pattern indirection so the store can be part of the UID
 ; We don't enforce this right now.
 ;N PATTERN
 ;S PATTERN="1""urn:va:""1"""_HTTPREQ("store")_""".E"
 ;I $G(UID)'="",UID'?@PATTERN D SETERROR^VPRJRER(210) Q ""
 ;
 ; Make sure the UID exists in what we store
 I $G(UID)'="" S OBJECT("uid")=UID
 ;
 ; Increment the total count and get a non-used sequential uid
 ; only do this if it isn't a PATCH OR it is a patch with no uid (which is equivalent to a post/put)
 S:$G(HTTPREQ("method"))'="PATCH"!($G(HTTPREQ("method"))="PATCH"&($G(UID)="")) INCR=$I(@GLOBAL@(0))
 ;
 ; Ensure INCR UID doesn't contain data (it would cause a collision)
 I $G(UID)="",$D(@GLOBAL@("urn:va:"_HTTPREQ("store")_":"_INCR)) D
 . ; We have a collision
 . N DONE
 . S DONE=0
 . ; Keep looping till we find an empty place
 . F  S INCR=$I(@GLOBAL@(0)) Q:DONE  D
 . . ; Found one - quit this loop
 . . I '$D(@GLOBAL@("urn:va:"_HTTPREQ("store")_":"_INCR)) S DONE=1 Q
 ;
 ; only need to set the UID in the object if we generated it
 I $G(UID)="" D
 . S UID="urn:va:"_HTTPREQ("store")_":"_INCR
 . S OBJECT("uid")=UID
 . ; Re-encode the object so we store it correctly
 . D ENCODE^VPRJSON("OBJECT","BODY","ERR")
 ; Kill destination global before merging
 ; need to do this for updates
 L +@GLOBAL@(UID):$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502) QUIT ""
 M OLDOBJ=@GLOBAL@(UID)
 ; Merge parsed JSON
 K:$G(HTTPREQ("method"))'="PATCH" @GLOBAL@(UID)
 M @GLOBAL@(UID)=OBJECT
 ;
 ; if this is a PATCH we need to re-create the full object to continue
 I $G(HTTPREQ("method"))="PATCH" D  I $D(ERR) D SETERROR^VPRJRER(217) QUIT ""
 . M OBJECT=@GLOBAL@(UID)
 . D ENCODE^VPRJSON("OBJECT","BODY","ERR")
 ;
 ; Merge Raw JSON
 K @GLOBALJ@("JSON",UID)
 M @GLOBALJ@("JSON",UID)=BODY
 D INDEX^VPRJGDSX(UID,.OLDOBJ,.OBJECT)
 L -@GLOBAL@(UID)
 Q "/"_HTTPREQ("store")_"/"_UID
 ;
CLR(RESULT,ARGS)  ; Clear ALL objects in generic data store!!!
 ;**** This operation is IRREVERSIBLE!!!!!! ****
 N VPRJA,GLOBAL,GLOBALJ,GLOBALX,URLMAPNUM
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) Q
 ; Parsed JSON
 S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 ; Raw JSON
 S GLOBALJ="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"J"
 ; Index
 S GLOBALX="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"X"
 ;
 ; Remove the URLMAP first to make all the URLs disappear
 ; Lock VPRCONFIG to prevent access to the store while it is being deleted
 L +^VPRCONFIG("store",$G(HTTPREQ("store"))):$G(^VPRCONFIG("timeout","gds"),5)
 ; Remove indexes
 N INDEXNAME
 S INDEXNAME=""
 F  S INDEXNAME=$O(^VPRCONFIG("store",$G(HTTPREQ("store")),"index",INDEXNAME)) Q:INDEXNAME=""  D
 . K ^VPRMETA("index",INDEXNAME)
 S INDEXNAME=""
 F  S INDEXNAME=$O(^VPRMETA("collection",$G(HTTPREQ("store")),"index",INDEXNAME)) Q:INDEXNAME=""  D
 . K ^VPRMETA("index",INDEXNAME)
 K ^VPRMETA("collection",$G(HTTPREQ("store")))
 ; Remove the indicator that the database exists
 K ^VPRCONFIG("store",$G(HTTPREQ("store")))
 ; Delete the urlmap using store-index
 S URLMAPNUM=""
 F  S URLMAPNUM=$O(^VPRCONFIG("urlmap","store-index",HTTPREQ("store"),URLMAPNUM)) Q:URLMAPNUM=""  D
 . ; delete the url-index
 . K ^VPRCONFIG("urlmap","url-index",$G(^VPRCONFIG("urlmap",URLMAPNUM,"url")),URLMAPNUM)
 . ; delete it from the urlmap
 . K ^VPRCONFIG("urlmap",URLMAPNUM)
 ; Delete the store-index
 K ^VPRCONFIG("urlmap","store-index",HTTPREQ("store"))
 L -^VPRCONFIG("store",$G(HTTPREQ("store")))
 ;
 ; Lock the GLOBAL to prevent data from being added while the global is deleted
 L +@GLOBAL:$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502) Q
 ; Kill the database
 K @GLOBAL
 K @GLOBALJ
 K @GLOBALX
 L -@GLOBAL
 ;
 S RESULT="{""ok"": true}"
 Q
 ;
DEL(RESULT,ARGS)  ; Delete a given data object in generic data store
 N GLOBAL,GLOBALJ
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) Q
 S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 S GLOBALJ="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"J"
 I $L(GLOBAL)<2 D SETERROR^VPRJRER(253) Q
 I $G(ARGS("uid"))="" D SETERROR^VPRJRER(111,"uid is blank") Q
 I $D(@GLOBAL@(ARGS("uid"))) D
 . L +@GLOBAL@(ARGS("uid")):$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502) QUIT
 . N OLDOBJ,OBJECT
 . S OBJECT=""
 . M OLDOBJ=@GLOBAL@(ARGS("uid"))
 . D INDEX^VPRJGDSX(ARGS("uid"),.OLDOBJ,.OBJECT)
 . K @GLOBAL@(ARGS("uid"))
 . K @GLOBALJ@("JSON",ARGS("uid"))
 . L -@GLOBAL@(ARGS("uid"))
 S RESULT="{""ok"": true}"
 Q
 ;
INFO(RESULT,ARGS)  ; Returns basic db info
 N VPRJA,COUNT,VPRJQ,GLOBAL,RSLT
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) Q
 S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 I $L(GLOBAL)<2 D SETERROR^VPRJRER(253) Q
 S (VPRJA,COUNT)=0
 L +@GLOBAL:$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502) Q
 F  S VPRJA=$O(@GLOBAL@(VPRJA)) Q:VPRJA=""  D
 . S COUNT=COUNT+1
 L -@GLOBAL
 S RSLT("committed_update_seq")=0  ; Not supported
 S RSLT("compact_running")="false" ; Not supported
 S RSLT("data_size")=0             ; Not supported
 S RSLT("db_name")=HTTPREQ("store")
 S RSLT("disk_format_version")=^VPRCONFIG("store",HTTPREQ("store"),"version")
 S RSLT("disk_size")=0             ; Not supported
 S RSLT("doc_count")=COUNT
 S RSLT("doc_del_count")=0         ; Not supported
 S RSLT("instance_start_time")=0   ; Not supported
 S RSLT("purge_seq")=0             ; Not supported
 S RSLT("update_seq")=0            ; Not supported
 D ENCODE^VPRJSON("RSLT","RESULT","ERR") ; From an array to JSON
 I $D(ERR) D SETERROR^VPRJRER(202) Q
 Q
 ;
GET(RESULT,ARGS) ; Returns object in generic data store
 N OBJECT,FILTER,CLAUSES,CLAUSE,ERR,BODY,UID,GLOBAL,ITEMCNT,VALUE
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) Q
 S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 I $L(GLOBAL)<2 D SETERROR^VPRJRER(253) Q
 I $$UNKARGS^VPRJCU(.ARGS,"uid,filter") Q
 ; Get any filters and parse them into CLAUSES
 S FILTER=$G(ARGS("filter"))
 I $L(FILTER) D PARSE^VPRJCF(FILTER,.CLAUSES) Q:$G(HTTPERR)
 ; Set OBJECT into ^||TMP($J)
 S OBJECT=$NA(^||TMP($J,"OBJECT"))
 ; Ensure variables are cleaned out
 K @OBJECT
 ; Get single object
 I $G(ARGS("uid"))'="" D
 . L +@GLOBAL@(ARGS("uid")):$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502) Q
 . M @OBJECT=@GLOBAL@(ARGS("uid"))
 . I '$D(@OBJECT) S ERR=1
 . L -@GLOBAL@(ARGS("uid"))
 I $D(ERR) D SETERROR^VPRJRER(229,"uid "_ARGS("uid")_" doesn't exist") Q
 ; Get all objects (or run filter) if no uid passed
 I '$D(@OBJECT) D
 . N UID
 . S UID=0
 . N I
 . F I=1:1 S UID=$O(@GLOBAL@(UID)) Q:UID=""  D
 . . ; All clauses are wrapped in an implicit AND
 . . I $D(CLAUSES) Q:'$$EVALAND^VPRJGQF(.CLAUSES,$NA(@GLOBAL@(UID)))
 . . ; Merge the data (will run only if the filter is true or non-existant)
 . . L +@GLOBAL@(UID):$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502) Q
 . . M @OBJECT@("items",I)=@GLOBAL@(UID)
 . . L -@GLOBAL@(UID)
 I $G(HTTPERR) QUIT
 ; Set Result variable to global
 S RESULT=$NA(^||TMP($J,"RESULT"))
 K @RESULT
 ; Encode object into JSON return
 D ENCODE^VPRJSON(OBJECT,RESULT,"ERR") ; From an array to JSON
 ; Clean up staging variable
 K @OBJECT
 I $D(ERR) D SETERROR^VPRJRER(202) Q
 Q
 ;
CINDEX(ARGS,BODY)
 N OBJECT,ERR,RESULT,GLOBAL,GLOBALJ,UID,INCR,OLDOBJ,LINES,METADATA,METACLTN,METATYPE
 ; Ensure the store is setup and correct
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) Q ""
 S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 S GLOBALJ="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"J"
 I $L(GLOBAL)<2 D SETERROR^VPRJRER(253) Q ""
 ;
 ; If the body is null just return with error
 I '$D(BODY) D SETERROR^VPRJRER(255) Q ""
 ;
 D DECODE^VPRJSON("BODY","OBJECT","ERR") ; From JSON to an array
 I $D(ERR) D SETERROR^VPRJRER(202) Q ""
 ;
 ; Ensure all data fields exist
 I $G(OBJECT("indexName"))=""!($G(OBJECT("fields"))="")!($G(OBJECT("sort"))="")!($G(OBJECT("type"))="") D SETERROR^VPRJRER(273,"required field missing") Q ""
 ;
 ; If the index already exists stop processing and tell the user
 I $D(^VPRMETA("index",$G(OBJECT("indexName")))) D SETERROR^VPRJRER(271,"index name: "_$G(OBJECT("indexName"))) Q ""
 I $D(^VPRMETA("collection",HTTPREQ("store"),"index",$G(OBJECT("indexName")))) D SETERROR^VPRJRER(271,"index name: "_$G(OBJECT("indexName"))) Q ""
 ;
 ; Parse the JSON into format BLDSPEC needs
 S LINES(1)=$G(OBJECT("indexName"))
 S LINES(2)="collections: "_$G(HTTPREQ("store"))
 S LINES(3)="fields: "_$G(OBJECT("fields"))
 S LINES(4)="sort: "_$G(OBJECT("sort"))
 S LINES(5)="setif: "_$G(OBJECT("setif"))
 ;
 S METATYPE="index:"_$S($G(OBJECT("type"))="attr":"attr",1:"tally")
 D BLDSPEC^VPRJCD(METATYPE,.LINES,.METADATA,.METACLTN) ; build it
 K LINES ; The lines are no longer necessary
 I $D(METADATA("errors","errors")) D SETERROR^VPRJRER(270) Q ""
 M ^VPRMETA($P(METATYPE,":"))=METADATA          ; save it
 M ^VPRCONFIG("store",$G(HTTPREQ("store")),"index",$G(OBJECT("indexName")))=METADATA
 M ^VPRMETA("collection")=METACLTN              ; map collections to it
 ;
 ; re-index (and store raw JSON) data
 S UID=""
 F  S UID=$O(@GLOBAL@(UID)) Q:UID=""  Q:$D(ERR)  D
 . N OBJECT,DOCUMENT
 . M OBJECT=@GLOBAL@(UID)
 . D INDEX^VPRJGDSX(UID,"",.OBJECT)
 . D ENCODE^VPRJSON("OBJECT","DOCUMENT","ERR")
 . I $D(ERR) D SETERROR^VPRJRER(202) Q
 . ; Merge Raw JSON
 . K @GLOBALJ@("JSON",UID)
 . M @GLOBALJ@("JSON",UID)=DOCUMENT
 Q ""
 ;
INDEX(RESULT,ARGS) ; GET objects by index
 I $$UNKARGS^VPRJCU(.ARGS,"indexName,range,order,bail,filter,start") Q
 ; Ensure the store is setup and correct
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) Q ""
 N GLOBAL S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 I $L(GLOBAL)<2 D SETERROR^VPRJRER(253) Q ""
 ;
 N INDEX,RANGE,ORDER,BAIL,FILTER
 S INDEX=$G(ARGS("indexName"))
 S RANGE=$G(ARGS("range"))
 S ORDER=$G(ARGS("order"))
 S BAIL=$G(ARGS("bail"))
 S FILTER=$G(ARGS("filter"))
 I $G(INDEX)="" D SETERROR^VPRJRER(102,INDEX) Q
 I '$D(^VPRMETA("index",INDEX)) D SETERROR^VPRJRER(102,INDEX) Q
 ;
 ; Do the query
 D QINDEX^VPRJGDSQ(INDEX,RANGE,ORDER,BAIL,"",FILTER)
 S RESULT=$NA(^||TMP($J)),RESULT("pageable")=""
 Q
 ;
