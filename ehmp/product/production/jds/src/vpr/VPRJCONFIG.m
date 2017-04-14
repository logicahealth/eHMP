VPRJCONFIG ;KRM/CJE -- Set up JDS configuration
 ;;1.0;JSON DATA STORE;;Aug 5, 2015
 ;
SETUP ;
 ; Add default route/url map and default generic data stores
 N SEQ,STORE,DONE,URLMAP
 ; Set default timeouts
 ; Global timeout
 S:'$G(^VPRCONFIG("timeout")) ^VPRCONFIG("timeout")=30
 ; Section specific timeouts
 ;
 ; Operational Data
 S:'$G(^VPRCONFIG("timeout","odindex")) ^VPRCONFIG("timeout","odindex")=30
 S:'$G(^VPRCONFIG("timeout","odbuild")) ^VPRCONFIG("timeout","odbuild")=30
 S:'$G(^VPRCONFIG("timeout","odclear")) ^VPRCONFIG("timeout","odclear")=30
 S:'$G(^VPRCONFIG("timeout","odconvert")) ^VPRCONFIG("timeout","odconvert")=30
 S:'$G(^VPRCONFIG("timeout","odstore")) ^VPRCONFIG("timeout","odstore")=30
 S:'$G(^VPRCONFIG("timeout","oddelete")) ^VPRCONFIG("timeout","oddelete")=30
 S:'$G(^VPRCONFIG("timeout","odhash")) ^VPRCONFIG("timeout","odhash")=1
 ;
 ; Patient Data
 S:'$G(^VPRCONFIG("timeout","ptindex")) ^VPRCONFIG("timeout","ptindex")=30
 S:'$G(^VPRCONFIG("timeout","ptbuild")) ^VPRCONFIG("timeout","ptbuild")=30
 S:'$G(^VPRCONFIG("timeout","ptclear")) ^VPRCONFIG("timeout","ptclear")=30
 S:'$G(^VPRCONFIG("timeout","ptconvert")) ^VPRCONFIG("timeout","ptconvert")=30
 S:'$G(^VPRCONFIG("timeout","ptstore")) ^VPRCONFIG("timeout","ptstore")=30
 S:'$G(^VPRCONFIG("timeout","ptdelete")) ^VPRCONFIG("timeout","ptdelete")=30
 S:'$G(^VPRCONFIG("timeout","pthash")) ^VPRCONFIG("timeout","pthash")=1
 S:'$G(^VPRCONFIG("timeout","jpid")) ^VPRCONFIG("timeout","jpid")=30
 ;
 ; String size limit for POST query parameters
 S:'$G(^VPRCONFIG("maxStringLimit")) ^VPRCONFIG("maxStringLimit")=3641000
 ; Garbage Collector
 S:'$G(^VPRCONFIG("timeout","gc")) ^VPRCONFIG("timeout","gc")=30
 ; Generic Data Store
 S:'$G(^VPRCONFIG("timeout","gds")) ^VPRCONFIG("timeout","gds")=30
 ;
 ; Add default generic data stores
 F SEQ=1:1 S STORE=$P($T(DEFAULTSTORE+SEQ),";;",2) Q:STORE="zzzzz"  D
 . D ADDSTORE($P(STORE,";",1),$P(STORE,";",2))
 N SEQ
 ; Add default route/url map
 F SEQ=1:1 S URLMAP=$P($T(URLMAP+SEQ),";;",2) Q:URLMAP="zzzzz"  D
 . D ADDURL($P(URLMAP,";",1),$P(URLMAP,";",2),$P(URLMAP,";",3))
 Q
CREATEDB(ARGS,BODY)
 ; Wrapper for ADDSTORE to be a REST endpoint
 ;
 ; Arguments:
 ; ARGS = query Parameters
 ; BODY = POST body - unused
 ; make sure we have no unknown arguments
 I $$UNKARGS^VPRJCU(.ARGS,"store") Q ""
 ;
 D ADDSTORE(ARGS("store"))
 I $G(HTTPERR) Q ""
 ; ensure 201 status code
 ; this should return {"ok":true}
 ; current HTTP responder can't handle this on a POST
 Q "/"_ARGS("store")
ADDSTORE(DB,GLOBAL,VER)
 ; Parameters:
 ;
 ; DB = database name
 ; GLOBAL = (optional) Global location
 ; VER = (optional) disk version of store
 ;
 ; Variable names:
 ;
 ; UDB = uppercase database name
 ;
 N UDB
 ; Ensure we have a usable name
 ; DB has to be longer than 0
 ; DB is shorter than 10
 ; DB is up to 10 Alphanumerics
 I $L(DB)=0!($L(DB)>10)!(DB'?1.10AN) D SETERROR^VPRJRER(252) Q
 S DB=$$LOW^VPRJRUT(DB)
 S UDB=$$UP^VPRJRUT(DB)
 S VER=$G(VER,1) ; Default version to 1 unless specified
 ; ensure DB isn't created
 I $D(^VPRCONFIG("store",DB)) D SETERROR^VPRJRER(254) Q
 S ^VPRCONFIG("store",DB)=""
 S ^VPRCONFIG("store",DB,"global")=$S($L($G(GLOBAL))>1:GLOBAL,1:"VPRJ"_UDB)
 S ^VPRCONFIG("store",DB,"version")=VER
 ; CRUD Operations
 D ADDURL("GET",DB_"/{uid}","GET^VPRJGDS",DB) ; Return given document
 D ADDURL("PUT",DB_"/{uid}","SET^VPRJGDS",DB) ; Set given document - UID provided
 D ADDURL("PATCH",DB_"/{uid}","SET^VPRJGDS",DB) ; update a given document - UID provided
 D ADDURL("DELETE",DB_"/{uid}","DEL^VPRJGDS",DB) ; Delete given document
 ; Index Operations
 D ADDURL("GET",DB_"/index/{indexName}","INDEX^VPRJGDS",DB) ; Retrieve using index
 D ADDURL("POST",DB_"/index","CINDEX^VPRJGDS",DB) ; Create Index
 ; DB Operations
 ;
 ; PUT creates new database - not store specific
 ; this is implemented in the URLMAP below
 ;
 D ADDURL("GET",DB,"INFO^VPRJGDS",DB) ; Return basic db info
 D ADDURL("POST",DB,"SET^VPRJGDS",DB) ; Set new document - no UID
 D ADDURL("DELETE",DB,"CLR^VPRJGDS",DB) ; remove the db
 Q
ADDURL(METHOD,URL,ROUTINE,STORE)
 ; Parameters:
 ;
 ; METHOD = HTTP method (POST,PUT,DELETE,GET)
 ; URL = The URL Pattern to match
 ; ROUTINE = TAG^ROUTINE to execute to handle the URL
 ; STORE = Store name for deletion index
 N SEQ,URLMAPNUM,DONE
 ; Ensure url config doesn't exist
 S URLMAPNUM=""
 S DONE=0
 F  S URLMAPNUM=$O(^VPRCONFIG("urlmap","url-index",URL,URLMAPNUM)) Q:URLMAPNUM=""  D  Q:DONE
 . I URL=$G(^VPRCONFIG("urlmap",URLMAPNUM,"url"))&(METHOD=$G(^VPRCONFIG("urlmap",URLMAPNUM,"method"))) S DONE=1
 I DONE Q
 S SEQ=$I(^VPRCONFIG("urlmap"))
 S ^VPRCONFIG("urlmap",SEQ,"method")=$G(METHOD)
 S ^VPRCONFIG("urlmap",SEQ,"url")=$G(URL)
 S ^VPRCONFIG("urlmap",SEQ,"routine")=$G(ROUTINE)
 S ^VPRCONFIG("urlmap",SEQ,"store")=$G(STORE)
 ; Create indexes
 ; Index for the entire store
 I $G(STORE)'="" S ^VPRCONFIG("urlmap","store-index",STORE,SEQ)=""
 ; Index for each url
 S ^VPRCONFIG("urlmap","url-index",URL,SEQ)=""
 Q
DEFAULTSTORE
 ;;zzzzz
 Q
URLMAP ; map URLs to entry points (HTTP methods handled within entry point)
 ;;POST;vpr;PUTPT^VPRJPR
 ;;PUT;vpr;PUTPT^VPRJPR
 ;;DELETE;vpr;DELALL^VPRJPR
 ;;GET;vpr/all/patientlist;GETPTS^VPRJPR
 ;;GET;vpr/all/count/{countName};ALLCOUNT^VPRJPR
 ;;GET;vpr/all/index/pid/pid;ALLPID^VPRJPR
 ;;GET;vpr/all/index/{indexName};ALLINDEX^VPRJPR
 ;;GET;vpr/all/index/{indexName}/{template};ALLINDEX^VPRJPR
 ;;GET;vpr/all/find/{collection};ALLFIND^VPRJPR
 ;;GET;vpr/all/find/{collection}/{template};ALLFIND^VPRJPR
 ;;DELETE;vpr/all/collection/{collectionName};ALLDELC^VPRJPR
 ;;GET;vpr/uid/{uid?1"urn:".E};GETUID^VPRJPR
 ;;GET;vpr/uid/{uid?1"urn:".E}/{template};GETUID^VPRJPR
 ;;DELETE;vpr/uid/{uid?1"urn:".E};DELUID^VPRJPR
 ;;GET;vpr/pid/{icndfn};GETPT^VPRJPR
 ;;POST;vpr/{pid};PUTOBJ^VPRJPR
 ;;PUT;vpr/{pid};PUTOBJ^VPRJPR
 ;;GET;vpr/{pid}/index/{indexName};INDEX^VPRJPR
 ;;GET;vpr/{pid}/index/{indexName}/{template};INDEX^VPRJPR
 ;;GET;vpr/{pid}/last/{indexName};LAST^VPRJPR
 ;;GET;vpr/{pid}/last/{indexName}/{template};LAST^VPRJPR
 ;;GET;vpr/{pid}/find/{collection};FIND^VPRJPR
 ;;GET;vpr/{pid}/find/{collection}/{template};FIND^VPRJPR
 ;;GET;vpr/{pid}/{uid?1"urn:".E};GETOBJ^VPRJPR
 ;;GET;vpr/{pid}/{uid?1"urn:".E}/{template};GETOBJ^VPRJPR
 ;;GET;vpr/{pid}/count/{countName};COUNT^VPRJPR
 ;;GET;vpr/{pid};GETPT^VPRJPR
 ;;GET;vpr/{pid}/checksum/{system};CHKSUM^VPRJPR
 ;;DELETE;vpr/{pid}/{uid?1"urn:".E};DELUID^VPRJPR
 ;;DELETE;vpr/{pid};DELPT^VPRJPR
 ;;DELETE;vpr/{pid}/collection/{collectionName};DELCLTN^VPRJPR
 ;;DELETE;vpr/site/{site};DELSITE^VPRJPR
 ;;POST;data;PUTOBJ^VPRJDR
 ;;PUT;data;PUTOBJ^VPRJDR
 ;;PUT;data/{collectionName};NEWOBJ^VPRJDR
 ;;POST;data/{collectionName};NEWOBJ^VPRJDR
 ;;GET;data/{uid?1"urn:".E};GETOBJ^VPRJDR
 ;;GET;data/{uid?1"urn:".E}/{template};GETOBJ^VPRJDR
 ;;GET;data/index/{indexName};INDEX^VPRJDR
 ;;GET;data/index/{indexName}/{template};INDEX^VPRJDR
 ;;GET;data/last/{indexName};LAST^VPRJDR
 ;;GET;data/count/{countName};COUNT^VPRJDR
 ;;GET;data/find/{collection};FIND^VPRJDR
 ;;GET;data/find/{collection}/{template};FIND^VPRJDR
 ;;GET;data/all/count/{countName};ALLCOUNT^VPRJDR
 ;;DELETE;data/{uid?1"urn:".E};DELUID^VPRJDR
 ;;DELETE;data/collection/{collectionName};DELCTN^VPRJDR
 ;;DELETE;data/site/{site};DELSITE^VPRJDR
 ;;DELETE;data;DELALL^VPRJDR
 ;;GET;ping;PING^VPRJRSP
 ;;GET;version;VERSION^VPRJRSP
 ;;GET;jds/logger/this;GETLOG^VPRJRSP
 ;;PUT;jds/logger/this;PUTLOG^VPRJRSP
 ;;POST;jds/logger/this;PUTLOG^VPRJRSP
 ;;GET;vpr/mpid/{icndfn};GETPT^VPRJPR
 ;;GET;vpr/jpid/{jpid};PIDS^VPRJPR
 ;;PUT;vpr/jpid/{jpid};ASSOCIATE^VPRJPR
 ;;POST;vpr/jpid/{jpid};ASSOCIATE^VPRJPR
 ;;PUT;vpr/jpid;ASSOCIATE^VPRJPR
 ;;POST;vpr/jpid;ASSOCIATE^VPRJPR
 ;;DELETE;vpr/jpid/{jpid};DISASSOCIATE^VPRJPR
 ;;DELETE;vpr/jpid/clear;CLEAR^VPRJPR
 ;;POST;vpr/jpid/query/;JPIDQUERY^VPRJPR
 ;;POST;session/set/this;SET^VPRJSES
 ;;PUT;session/set/this;SET^VPRJSES
 ;;GET;session/get/{_id};GET^VPRJSES
 ;;GET;session/length/this;LEN^VPRJSES
 ;;DELETE;session/destroy/{_id};DEL^VPRJSES
 ;;DELETE;session/clear/this;CLR^VPRJSES
 ;;GET;session/destroy/{_id};DEL^VPRJSES
 ;;GET;session/clear/this;CLR^VPRJSES
 ;;GET;session/destroy/_id/{_id};DEL^VPRJSES
 ;;POST;job;SET^VPRJOB
 ;;PUT;job;SET^VPRJOB
 ;;GET;job/{jpid}/{rootJobId}/{jobId};GET^VPRJOB
 ;;GET;job/{jpid}/{rootJobId};GET^VPRJOB
 ;;GET;job/{jpid};GET^VPRJOB
 ;;DELETE;job;CLEAR^VPRJOB
 ;;DELETE;job/{id};DELETE^VPRJOB
 ;;DELETE;job/jobid/{jobid};DELJID^VPRJOB
 ;;GET;status/{id};GET^VPRJPSTATUS
 ;;PUT;status/{id};SET^VPRJPSTATUS
 ;;POST;status/{id};SET^VPRJPSTATUS
 ;;DELETE;status;CLEAR^VPRJPSTATUS
 ;;DELETE;status/{pid};CLEAR^VPRJPSTATUS
 ;;POST;status/{pid}/store;STORERECORD^VPRJPSTATUS
 ;;GET;statusod/{id};GET^VPRJDSTATUS
 ;;PUT;statusod/{id};SET^VPRJDSTATUS
 ;;POST;statusod/{id};SET^VPRJDSTATUS
 ;;DELETE;statusod/{id};DEL^VPRJDSTATUS
 ;;DELETE;statusod;DEL^VPRJDSTATUS
 ;;POST;recordod;STORERECORD^VPRJDSTATUS
 ;;POST;odmutable/set/this;SET^VPRJODM
 ;;PUT;odmutable/set/this;SET^VPRJODM
 ;;GET;odmutable/get/{_id};GET^VPRJODM
 ;;GET;odmutable/length/this;LEN^VPRJODM
 ;;DELETE;odmutable/destroy/{_id};DEL^VPRJODM
 ;;DELETE;odmutable/clear/this;CLR^VPRJODM
 ;;POST;siteod/set/this;SET^VPRJODM
 ;;PUT;siteod/set/this;SET^VPRJODM
 ;;GET;siteod/get/{_id};GET^VPRJODM
 ;;GET;siteod/length/this;LEN^VPRJODM
 ;;DELETE;siteod/destroy/{_id};DEL^VPRJODM
 ;;DELETE;siteod/clear/this;CLR^VPRJODM
 ;;POST;user/set/this;SET^VPRJUSR
 ;;PUT;user/set/this;SET^VPRJUSR
 ;;GET;user/get/{_id};GET^VPRJUSR
 ;;GET;user/length/this;LEN^VPRJUSR
 ;;DELETE;user/destroy/{_id};DEL^VPRJUSR
 ;;DELETE;user/clear/this;CLR^VPRJUSR
 ;;GET;user/destroy/{_id};DEL^VPRJUSR
 ;;GET;user/clear/this;CLR^VPRJUSR
 ;;GET;user/destroy/_id/{_id};DEL^VPRJUSR
 ;;GET;tasks/gc/patient/{id};PAT^VPRJGC
 ;;GET;tasks/gc/patient;PAT^VPRJGC
 ;;GET;tasks/gc/data/{site};DATA^VPRJGC
 ;;GET;tasks/gc/data;DATA^VPRJGC
 ;;GET;tasks/gc/job/{id};JOB^VPRJGC
 ;;GET;tasks/gc/job;JOB^VPRJGC
 ;;POST;error/set/this;SET^VPRJERR
 ;;PUT;error/set/this;SET^VPRJERR
 ;;GET;error/get/{id};GET^VPRJERR
 ;;GET;error/get;GET^VPRJERR
 ;;GET;error/length/this;LEN^VPRJERR
 ;;DELETE;error/destroy/{id};DEL^VPRJERR
 ;;GET;error/destroy/{id};DEL^VPRJERR
 ;;DELETE;error/clear/this;CLR^VPRJERR
 ;;GET;error/clear/this;CLR^VPRJERR
 ;;PUT;{store};CREATEDB^VPRJCONFIG
 ;;GET;documentation;DATA^VPRJDOCS
 ;;GET;documentation/index;INDEX^VPRJDOCS
 ;;GET;documentation/parameters/{parameter};PARAMETERS^VPRJDOCS
 ;;GET;sync/combinedstat/{icnpidjpid};COMBINED^VPRJPSTATUS
 ;;zzzzz
 Q
