VPRJGDS ;KRM/CJE -- Generic Data Store
 ;
SET(ARGS,BODY)  ; Store error(s) based on the passed in uid
 N OBJECT,ERR,RESULT,GLOBAL,GLOBALJ,UID,INCR,OLDOBJ,TLTARY
 ; Ensure the store is setup and correct
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) Q ""
 ; Parsed JSON
 S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 ; Raw JSON
 S GLOBALJ="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"J"
 ;
 I $L(GLOBAL)<2 D SETERROR^VPRJRER(253) QUIT ""
 ;
 ; If the body is null just return with error
 I '$D(BODY) D SETERROR^VPRJRER(255) QUIT ""
 ;
 D DECODE^VPRJSON("BODY","OBJECT","ERR") ; From JSON to an array
 I $D(ERR) D SETERROR^VPRJRER(202) QUIT ""
 ;
 ; Are we provided a UID?
 ; UID in object is not null
 I $G(OBJECT("uid"))'="" S UID=$G(OBJECT("uid"))
 ; UID in URL is not null
 I $G(ARGS("uid"))'="" S UID=$G(ARGS("uid"))
 ; Make sure that if we are handed a UID in the URL it matches the object if it exists
 I $G(ARGS("uid"))'=""&($G(OBJECT("uid"))'="") I $G(ARGS("uid"))'=$G(OBJECT("uid")) D SETERROR^VPRJRER(256) QUIT ""
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
 ;
 ; Merge parsed JSON
 ; Don't kill the object if this is a patch (modify the object in-place)
 K:$G(HTTPREQ("method"))'="PATCH" @GLOBAL@(UID)
 M @GLOBAL@(UID)=OBJECT
 ;
 ; if this is a PATCH we need to re-create the full object to continue
 I $G(HTTPREQ("method"))="PATCH" D  I $D(ERR) D SETERROR^VPRJRER(217) L -@GLOBAL@(UID) QUIT ""
 . M OBJECT=@GLOBAL@(UID)
 . D ENCODE^VPRJSON("OBJECT","BODY","ERR")
 ;
 ; Merge Raw JSON
 K:$D(@GLOBALJ@("JSON",UID)) @GLOBALJ@("JSON",UID)
 M @GLOBALJ@("JSON",UID)=BODY
 ;
 ; Index the object
 D INDEX^VPRJGDSX(UID,.OLDOBJ,.OBJECT)
 ;
 ; Create any templates
 D BLDTLT^VPRJCT1(HTTPREQ("store"),.OBJECT,.TLTARY) I $G(HTTPERR) L -@GLOBAL@(UID) QUIT ""
 M @GLOBALJ@("TEMPLATE",UID)=TLTARY
 ;
 ; All done. Remove the lock and report success.
 L -@GLOBAL@(UID)
 QUIT "/"_HTTPREQ("store")_"/"_UID
 ;
CLR(RESULT,ARGS)  ; Clear ALL objects in generic data store!!!
 ;**** This operation is IRREVERSIBLE!!!!!! ****
 N VPRJA,GLOBAL,GLOBALJ,GLOBALX,GLOBALL,URLMAPNUM
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) QUIT
 ; See if the data store is already deleted if so don't continue and report success
 I $G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))="" S RESULT="{""ok"": true}" QUIT
 ; Parsed JSON
 S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 ; Raw JSON
 S GLOBALJ="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"J"
 ; Index
 S GLOBALX="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"X"
 ; Lock table
 S GLOBALL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"L"
 ;
 ; Remove the URLMAP first to make all the URLs disappear
 ; Lock VPRCONFIG to prevent access to the store while it is being deleted
 L +^VPRCONFIG("store",$G(HTTPREQ("store"))):$G(^VPRCONFIG("timeout","gds"),5)
 ; Remove indexes
 N INDEXNAME
 S INDEXNAME=""
 F  S INDEXNAME=$O(^VPRCONFIG("store",$G(HTTPREQ("store")),"index",INDEXNAME)) Q:INDEXNAME=""  D
 . K:$D(^VPRMETA("index",INDEXNAME)) ^VPRMETA("index",INDEXNAME)
 S INDEXNAME=""
 F  S INDEXNAME=$O(^VPRMETA("collection",$G(HTTPREQ("store")),"index",INDEXNAME)) Q:INDEXNAME=""  D
 . K:$D(^VPRMETA("index",INDEXNAME)) ^VPRMETA("index",INDEXNAME)
 ;
 ; Remove templates
 N TEMPLATE
 S TEMPLATE=""
 F  S TEMPLATE=$O(^VPRCONFIG("store",$G(HTTPREQ("store")),"template",TEMPLATE)) Q:TEMPLATE=""  D
 . K:$D(^VPRMETA("template",TEMPLATE)) ^VPRMETA("template",TEMPLATE)
 S TEMPLATE=""
 F  S TEMPLATE=$O(^VPRMETA("collection",$G(HTTPREQ("store")),"template",TEMPLATE)) Q:TEMPLATE=""  D
 . K:$D(^VPRMETA("template",TEMPLATE)) ^VPRMETA("template",TEMPLATE)
 ;
 ; Remove the collection indicator in VPRMETA
 K:$D(^VPRMETA("collection",$G(HTTPREQ("store")))) ^VPRMETA("collection",$G(HTTPREQ("store")))
 ; Remove the store indicator in VPRCONFIG
 K:$D(^VPRCONFIG("store",$G(HTTPREQ("store")))) ^VPRCONFIG("store",$G(HTTPREQ("store")))
 ; Delete the urlmap using store-index
 S URLMAPNUM=""
 F  S URLMAPNUM=$O(^VPRCONFIG("urlmap","store-index",HTTPREQ("store"),URLMAPNUM)) Q:URLMAPNUM=""  D
 . ; delete the url-index
 . K:$D(^VPRCONFIG("urlmap",URLMAPNUM,"url")) ^VPRCONFIG("urlmap","url-index",$G(^VPRCONFIG("urlmap",URLMAPNUM,"url")),URLMAPNUM)
 . ; delete it from the urlmap
 . K:$D(^VPRCONFIG("urlmap",URLMAPNUM)) ^VPRCONFIG("urlmap",URLMAPNUM)
 ; Delete the store-index
 K:$D(^VPRCONFIG("urlmap","store-index",HTTPREQ("store"))) ^VPRCONFIG("urlmap","store-index",HTTPREQ("store"))
 L -^VPRCONFIG("store",$G(HTTPREQ("store")))
 ;
 ; Lock the GLOBAL to prevent data from being added while the global is deleted
 L +@GLOBAL:$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502) QUIT
 ; Kill the database
 K:$D(@GLOBAL) @GLOBAL
 K:$D(@GLOBALJ) @GLOBALJ
 K:$D(@GLOBALX) @GLOBALX
 K:$D(@GLOBALL) @GLOBALL
 L -@GLOBAL
 ;
 S RESULT="{""ok"": true}"
 QUIT
 ;
DEL(RESULT,ARGS)  ; Delete a given data object in generic data store
 N GLOBAL,GLOBALJ,GLOBALL,FILTER,UID,CLAUSES
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) QUIT
 S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 S GLOBALJ="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"J"
 S GLOBALL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"L"
 I $L(GLOBAL)<2 D SETERROR^VPRJRER(253) QUIT
 I $G(ARGS("uid"))="",$G(ARGS("filter"))="",$G(ARGS("confirm"))'="true" D SETERROR^VPRJRER(111,"uid is blank") QUIT
 I $G(ARGS("uid"))'="",$D(@GLOBAL@(ARGS("uid"))) D
 . D DELOBJ(ARGS("uid"),GLOBAL,GLOBALJ,GLOBALL)
 I $G(ARGS("uid"))="",$G(ARGS("confirm"))="true"!($G(ARGS("filter"))'="") D  QUIT:$G(HTTPERR)
 . ; Get any filters and parse them into CLAUSES
 . S FILTER=$G(ARGS("filter"))
 . I $L(FILTER) D PARSE^VPRJCF(FILTER,.CLAUSES) Q:$G(HTTPERR)
 . S UID=0 F  S UID=$O(@GLOBAL@(UID)) Q:UID=""  D
 . . ; All clauses are wrapped in an implicit AND
 . . I $D(CLAUSES) Q:'$$EVALAND^VPRJGQF(.CLAUSES,$NA(@GLOBAL@(UID)))
 . . D DELOBJ(UID,GLOBAL,GLOBALJ,GLOBALL)
 . ; Either no uid and confirm=true or a filter removed all data from the store, so reset/kill the data store counter
 . I $O(@GLOBAL@(0))="" K:$D(@GLOBAL@(0)) @GLOBAL@(0)
 S RESULT="{""ok"": true}"
 QUIT
 ;
DELOBJ(UID,GLOBAL,GLOBALJ,GLOBALL) ; Deletes a data object
 L +@GLOBAL@(UID):$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502) QUIT
 L +@GLOBALL@(UID):$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502,"Error acquiring GDS locktable lock") Q
 N OLDOBJ,OBJECT
 S OBJECT=""
 M OLDOBJ=@GLOBAL@(UID)
 D INDEX^VPRJGDSX(UID,.OLDOBJ,.OBJECT)
 K:$D(@GLOBAL@(UID)) @GLOBAL@(UID)
 K:$D(@GLOBALJ@("JSON",UID)) @GLOBALJ@("JSON",UID)
 K:$D(@GLOBALL@(UID)) @GLOBALL@(UID)
 L -@GLOBALL@(UID)
 K:$D(@GLOBALJ@("TEMPLATE",UID)) @GLOBALJ@("TEMPLATE",UID)
 L -@GLOBAL@(UID)
 QUIT
 ;
INFO(RESULT,ARGS)  ; Returns basic db info
 N VPRJA,COUNT,VPRJQ,GLOBAL,RSLT
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) QUIT
 S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 I $L(GLOBAL)<2 D SETERROR^VPRJRER(253) QUIT
 S (VPRJA,COUNT)=0
 L +@GLOBAL:$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502) QUIT
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
 I $D(ERR) D SETERROR^VPRJRER(202) QUIT
 QUIT
 ;
GET(RESULT,ARGS) ; Returns object in generic data store
 N OBJECT,FILTER,CLAUSES,CLAUSE,ERR,BODY,UID,GLOBAL,ITEMCNT,VALUE,ORDER,VPRDATA,STARTID,FMNOW,TIMEOUT,FMTIMEOUT,FMLOCK,SKIPLOCK
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) QUIT
 S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 S GLOBALJ="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"J"
 S GLOBALL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"L"
 I $L(GLOBAL)<2 D SETERROR^VPRJRER(253) QUIT
 I $$UNKARGS^VPRJCU(.ARGS,"uid,filter,template,order,skiplocked,start,startid,limit,returncounts") QUIT
 S TEMPLATE=$G(ARGS("template"))
 S ORDER=$G(ARGS("order"))
 S VPRDATA=0
 S SKIPLOCK=$S($G(ARGS("skiplocked"))="true":1,1:0)
 D SETORDER^VPRJCO(.ORDER) QUIT:$G(HTTPERR)
 ; Get any filters and parse them into CLAUSES
 S FILTER=$G(ARGS("filter"))
 I $L(FILTER) D PARSE^VPRJCF(FILTER,.CLAUSES) QUIT:$G(HTTPERR)
 ;
 ; Get single object
 I $G(ARGS("uid"))'="" D  QUIT
 . L +@GLOBAL@(ARGS("uid")):$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502) Q
 . L +@GLOBALL@(ARGS("uid")):$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502,"Error acquiring GDS locktable lock") Q
 . ; Caclulate if the lock is timedout
 . S FMNOW=$$HL7TFM^XLFDT($$CURRTIME^VPRJRUT)
 . S TIMEOUT=$G(^VPRCONFIG("store",HTTPREQ("store"),"lockTimeout"))
 . S FMLOCK=$$HL7TFM^XLFDT($G(@GLOBALL@(ARGS("uid"))))
 . S FMTIMEOUT=$$FMADD^XLFDT(FMLOCK,,,,TIMEOUT)
 . ; Delete the lock if it is expired and return the data if it isn't locked.
 . I ($D(@GLOBALL@(ARGS("uid"))))&($$FMDIFF^XLFDT(FMTIMEOUT,FMNOW,2)>TIMEOUT) K @GLOBALL@(ARGS("uid"))
 . ; Always return the requested UID
 . I $L(TEMPLATE) M RESULT=@GLOBALJ@("TEMPLATE",ARGS("uid"),TEMPLATE)
 . E  M RESULT=@GLOBALJ@("JSON",ARGS("uid"))
 . L -@GLOBALL@(ARGS("uid"))
 . L -@GLOBAL@(ARGS("uid"))
 . ;
 . I '$D(RESULT) D SETERROR^VPRJRER(229,"uid "_ARGS("uid")_" doesn't exist") Q
 I $G(ARGS("startid"))'="" S STARTID=$O(@GLOBAL@(ARGS("startid")),-1),STARTID=$O(@GLOBAL@(STARTID))
 ;
 ; Get all objects (or run filter) if no uid passed
 S UID=0
 F  S UID=$O(@GLOBAL@(UID)) Q:UID=""  D ADDONE^VPRJGDSQA(UID,0,,SKIPLOCK)
 D BUILD^VPRJCB
 K:$D(^||TMP("VPRDATA",$J)) ^||TMP("VPRDATA",$J)
 S RESULT=$NA(^||TMP($J)),RESULT("pageable")="gds",RESULT("startid")=$G(STARTID)
 QUIT
 ;
CINDEX(ARGS,BODY)
 N OBJECT,ERR,RESULT,GLOBAL,GLOBALJ,UID,INCR,OLDOBJ,LINES,METADATA,METACLTN,METATYPE
 ; Ensure the store is setup and correct
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) QUIT ""
 S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 S GLOBALJ="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"J"
 I $L(GLOBAL)<2 D SETERROR^VPRJRER(253) Q ""
 ;
 ; If the body is null just return with error
 I '$D(BODY) D SETERROR^VPRJRER(255) QUIT ""
 ;
 D DECODE^VPRJSON("BODY","OBJECT","ERR") ; From JSON to an array
 I $D(ERR) D SETERROR^VPRJRER(202) QUIT ""
 ;
 ; Ensure all data fields exist
 I $G(OBJECT("indexName"))=""!($G(OBJECT("fields"))="")!($G(OBJECT("sort"))="")!($G(OBJECT("type"))="") D SETERROR^VPRJRER(273,"required field missing") QUIT ""
 ;
 ; If the index already exists stop processing and tell the user
 I $D(^VPRMETA("index",$G(OBJECT("indexName")))) D SETERROR^VPRJRER(271,"index name: "_$G(OBJECT("indexName"))) QUIT ""
 I $D(^VPRMETA("collection",HTTPREQ("store"),"index",$G(OBJECT("indexName")))) D SETERROR^VPRJRER(271,"index name: "_$G(OBJECT("indexName"))) QUIT ""
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
 I $D(METADATA("errors","errors")) D SETERROR^VPRJRER(270) QUIT ""
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
 . K:$D(@GLOBALJ@("JSON",UID)) @GLOBALJ@("JSON",UID)
 . M @GLOBALJ@("JSON",UID)=DOCUMENT
 QUIT ""
 ;
INDEX(RESULT,ARGS) ; GET objects by index
 I $$UNKARGS^VPRJCU(.ARGS,"indexName,range,order,bail,filter,start,template,startid,returncounts,skiplocked") QUIT
 ; Ensure the store is setup and correct
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) QUIT ""
 N GLOBAL S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 I $L(GLOBAL)<2 D SETERROR^VPRJRER(253) QUIT ""
 ;
 N INDEX,RANGE,ORDER,BAIL,FILTER,STARTID,SKIPLOCK
 S INDEX=$G(ARGS("indexName"))
 S RANGE=$G(ARGS("range"))
 S ORDER=$G(ARGS("order"))
 S BAIL=$G(ARGS("bail"))
 S FILTER=$G(ARGS("filter"))
 S TEMPLATE=$G(ARGS("template"))
 S SKIPLOCK=$S($G(ARGS("skiplocked"))="true":1,1:0)
 I $G(INDEX)="" D SETERROR^VPRJRER(102,INDEX) QUIT
 I '$D(^VPRMETA("index",INDEX)) D SETERROR^VPRJRER(102,INDEX) QUIT
 ;
 ; Do the query
 D QINDEX^VPRJGDSQ(INDEX,RANGE,ORDER,BAIL,TEMPLATE,FILTER,SKIPLOCK)
 I $G(ARGS("startid"))'="" S STARTID=$O(@GLOBAL@(ARGS("startid")),-1),STARTID=$O(@GLOBAL@(STARTID))
 S RESULT=$NA(^||TMP($J)),RESULT("pageable")="gds",RESULT("startid")=$G(STARTID)
 QUIT
 ;
 ; Create a template definition for a generic data store
 ; @param {array} ARGS - (passed by reference) HTTP query parameters/url parameters
 ; @param {array} BODY - (passed by reference) HTTP content body in stringified JSON
CTEMPLATE(ARGS,BODY)
 N OBJECT,ERR,RESULT,GLOBAL,GLOBALJ,UID,INCR,OLDOBJ,LINES,METATYPE,METADATA,METATYPE
 ; Ensure the store is setup and correct
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) QUIT ""
 S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 S GLOBALJ="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"J"
 I $L(GLOBAL)<2 D SETERROR^VPRJRER(253) QUIT ""
 ;
 ; If the body is null just return with error
 I '$D(BODY) D SETERROR^VPRJRER(255) QUIT ""
 ;
 D DECODE^VPRJSON("BODY","OBJECT","ERR") ; From JSON to an array
 I $D(ERR) D SETERROR^VPRJRER(202) QUIT ""
 ;
 ; Ensure all data fields exist
 I $G(OBJECT("name"))=""!($G(OBJECT("directives"))="")!($G(OBJECT("fields"))="") D SETERROR^VPRJRER(273,"required field missing") QUIT ""
 ;
 ; If the index already exists stop processing and tell the user
 I $D(^VPRMETA("template",$G(OBJECT("name")))) D SETERROR^VPRJRER(271,"template name: "_$G(OBJECT("name"))) QUIT ""
 I $D(^VPRMETA("collection",HTTPREQ("store"),"template",$G(OBJECT("name")))) D SETERROR^VPRJRER(271,"template name: "_$G(OBJECT("name"))) QUIT ""
 ;
 ; Parse the JSON into format LOADSPEC needs
 S LINES(1)=$G(OBJECT("name"))
 S LINES(2)="collections: "_$G(HTTPREQ("store"))
 S LINES(3)="directives: "_$G(OBJECT("directives"))
 S LINES(4)="fields: "_$G(OBJECT("fields"))
 ;
 ; Build the SPEC
 S METATYPE="template"
 D BLDSPEC^VPRJCD(METATYPE,.LINES,.METADATA,.METACLTN)
 ;
 ; We no longer need the lines variable
 K LINES
 ;
 ; report any errors from BLDSPEC back to the user and stop processing
 I $D(METADATA("errors","errors")) D SETERROR^VPRJRER(270) QUIT ""
 ;
 ; Save the METADATA to ^VPRMETA and ^VPRCONFIG (for when ^VPRMETA is blown away)
 M ^VPRMETA($P(METATYPE,":"))=METADATA
 M ^VPRCONFIG("store",$G(HTTPREQ("store")),"template",$G(OBJECT("name")))=METADATA
 ;
 ; tell the collection it has a template
 M ^VPRMETA("collection")=METACLTN
 ;
 ; Apply the template to existing data
 S UID=""
 F  S UID=$O(@GLOBAL@(UID)) Q:UID=""  Q:$D(ERR)  D
 . N OBJECT,DOCUMENT
 . M OBJECT=@GLOBAL@(UID)
 . D BLDTLT^VPRJCT1(HTTPREQ("store"),.OBJECT,.TLTARY)
 . ; Merge templated object
 . K:$D(@GLOBALJ@("TEMPLATE",UID)) @GLOBALJ@("TEMPLATE",UID)
 . M @GLOBALJ@("TEMPLATE",UID)=TLTARY
 QUIT ""
 ;
GETLOCK(RESULT,ARGS)
 N GLOBAL,GLOBALL,FILTER,CLAUSES,OBJECT,ERR,FMNOW,TIMEOUT,FMLOCK,FMTIMEOUT
 ; Ensure the store is setup and correct
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) QUIT
 S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 S GLOBALL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"L"
 I $L(GLOBAL)<2 D SETERROR^VPRJRER(253) QUIT
 ; Get any filters and parse them into CLAUSES
 S FILTER=$G(ARGS("filter"))
 I $L(FILTER) D PARSE^VPRJCF(FILTER,.CLAUSES) QUIT:$G(HTTPERR)
 ; Set OBJECT into ^||TMP($J)
 S OBJECT=$NA(^||TMP($J,"OBJECT"))
 ; Ensure variables are cleaned out
 K:$D(@OBJECT) @OBJECT
 ; Get single object
 I $G(ARGS("uid"))'="" D
 . L +@GLOBALL@(ARGS("uid")):$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502,"unable to get locktable lock") Q
 . ; Calculate the expiration time
 . S FMNOW=$$HL7TFM^XLFDT($$CURRTIME^VPRJRUT)
 . S TIMEOUT=$G(^VPRCONFIG("store",HTTPREQ("store"),"lockTimeout"))
 . S FMLOCK=$$HL7TFM^XLFDT($G(@GLOBALL@(ARGS("uid"))))
 . S FMTIMEOUT=$$FMADD^XLFDT(FMLOCK,,,,TIMEOUT)
 . ; If the lock is expired delete it and don't return it
 . I $$FMDIFF^XLFDT(FMNOW,FMTIMEOUT,2)>TIMEOUT K:$D(@GLOBALL@(ARGS("uid"))) @GLOBALL@(ARGS("uid"))
 . ; The lock is not expired return it
 . I $$FMDIFF^XLFDT(FMNOW,FMTIMEOUT,2)'>TIMEOUT M @OBJECT@(ARGS("uid"))=@GLOBALL@(ARGS("uid"))
 . I '$D(@OBJECT) S ERR=1
 . L -@GLOBALL@(ARGS("uid"))
 I $D(ERR) D SETERROR^VPRJRER(229,"uid "_ARGS("uid")_" doesn't exist") QUIT
 I $G(HTTPERR) QUIT
 ; Get all objects (or run filter) if no uid passed
 I '$D(@OBJECT) D
 . N UID
 . S UID=0
 . N I
 . F I=1:1 S UID=$O(@GLOBALL@(UID)) Q:UID=""  D
 . . ; All clauses are wrapped in an implicit AND
 . . I $D(CLAUSES) Q:'$$EVALAND^VPRJGQF(.CLAUSES,$NA(@GLOBAL@(UID)))
 . . ; Merge the data (will run only if the filter is true or non-existent)
 . . L +@GLOBALL@(UID):$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502) Q
 . . ; Calculate the expiration time
 . . S FMNOW=$$HL7TFM^XLFDT($$CURRTIME^VPRJRUT)
 . . S TIMEOUT=$G(^VPRCONFIG("store",HTTPREQ("store"),"lockTimeout"))
 . . S FMLOCK=$$HL7TFM^XLFDT($G(@GLOBALL@(UID)))
 . . S FMTIMEOUT=$$FMADD^XLFDT(FMLOCK,,,,TIMEOUT)
 . . ; If the lock is expired delete it and don't return it
 . . I $$FMDIFF^XLFDT(FMNOW,FMTIMEOUT,2)>TIMEOUT K:$D(@GLOBALL@(UID)) @GLOBALL@(UID)
 . . ; The lock is not expired retun it
 . . I $$FMDIFF^XLFDT(FMNOW,FMTIMEOUT,2)'>TIMEOUT M @OBJECT@("items",I,UID)=@GLOBALL@(UID)
 . . L -@GLOBALL@(UID)
 I $G(HTTPERR) QUIT
 ; Set Result variable to global
 S RESULT=$NA(^||TMP($J,"RESULT"))
 K:$D(@RESULT) @RESULT
 ; Encode object into JSON return
 D ENCODE^VPRJSON(OBJECT,RESULT,"ERR") ; From an array to JSON
 ; Clean up staging variable
 K:$D(@OBJECT) @OBJECT
 I $D(ERR) D SETERROR^VPRJRER(202) QUIT
 QUIT
 ;
SETLOCK(ARGS,BODY)
 N FMNOW,TIMEOUT,FMLOCK,TIMEOUT,FMTIMEOUT,GLOBAL,GLOBALL,UID
 ; Ensure the store is setup and correct
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) QUIT ""
 S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 S GLOBALL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"L"
 I $L(GLOBAL)<2 D SETERROR^VPRJRER(253) QUIT ""
 ; If there is no uid quit with an error
 I $G(ARGS("uid"))="" D SETERROR^VPRJRER(111,"uid is blank") QUIT ""
 S UID=ARGS("uid")
 L +@GLOBALL@(UID):$G(^VPRCONFIG("timeout","gds"),5) E  D SETERROR^VPRJRER(502,"unable to get locktable lock") QUIT ""
 ; If the uid doesn't have a lock: lock it and be done
 I '$D(@GLOBALL@(UID)) S @GLOBALL@(UID)=$$CURRTIME^VPRJRUT L -@GLOBALL@(UID) QUIT "/"_HTTPREQ("store")_"/lock/"_ARGS("uid")
 ; Calculate if the record is timedout
 S FMNOW=$$HL7TFM^XLFDT($$CURRTIME^VPRJRUT)
 S TIMEOUT=$G(^VPRCONFIG("store",HTTPREQ("store"),"lockTimeout"))
 S FMLOCK=$$HL7TFM^XLFDT($G(@GLOBALL@(UID)))
 S FMTIMEOUT=$$FMADD^XLFDT(FMLOCK,,,,TIMEOUT)
 ; If the uid is currently locked and equal to or before the configured timeout error and be done
 I $$FMDIFF^XLFDT(FMNOW,FMTIMEOUT,2)'>TIMEOUT D SETERROR^VPRJRER(272) L -@GLOBALL@(UID) QUIT ""
 ; If the uid is currently locked and is after the configured timeout lock it and be done
 I $$FMDIFF^XLFDT(FMNOW,FMTIMEOUT,2)>TIMEOUT S @GLOBALL@(UID)=$$CURRTIME^VPRJRUT L -@GLOBALL@(UID) QUIT "/"_HTTPREQ("store")_"/lock/"_ARGS("uid")
 ; Should not get to this QUIT as all cases are above
 ; This should cause a syntax error so any cases where it falls through can be caught
 L -@GLOBALL@(UID)
 QUIT
 ;
DELLOCK(RESULT,ARGS)
 N GLOBAL,GLOBALL
 ; Ensure the store is setup and correct
 I $G(HTTPREQ("store"))="" D SETERROR^VPRJRER(253) QUIT
 S GLOBAL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))
 S GLOBALL="^"_$G(^VPRCONFIG("store",$G(HTTPREQ("store")),"global"))_"L"
 I $L(GLOBAL)<2 D SETERROR^VPRJRER(253) QUIT
 ; If there is no uid quit with an error
 I $G(ARGS("uid"))="" D SETERROR^VPRJRER(111,"uid is blank") QUIT
 ; Always removed the lock with the passed uid
 I $D(@GLOBALL@(ARGS("uid"))) K @GLOBALL@(ARGS("uid"))
 S RESULT="{""ok"": true}"
 QUIT
 ;
