VPRJ2D ;SLC/KCM -- Management utilities for JSON objects
 ;
RIDX ; Re-index all operational data, giving an option to re-index all indexes, or a list of possible indexes
 D SETUP^VPRJPMD ; Rebuild the meta data to pick up new indexes from VPRJDMX
 N YESNO
 R !,"Would you like to re-index every index? (Y/N - defaults to N): ",YESNO
 S YESNO=$TR(YESNO,"yesno","YESNO")
 W !!
 I YESNO'="","YES"[YESNO W !,"Re-indexing operational data for all indexes...",! D RIDXALL QUIT
 E  D
 . N CNT,KEY,COLL,IDX,IDXLIST,INDEX,INDEXES,LABEL,I,LINE,DESC,LN
 . S INDEX=""
 . W !
 . F LABEL="IDXTALLY","IDXATTR" D
 . . F I=1:1 S LINE=$P($T(@LABEL+I^VPRJDMX),";;",2,99) Q:LINE["zzzzz"  I $E(LINE)'=" " S INDEXES(LINE)=""
 . . S CNT=0,(IDX,LN)="",DESC=$P($T(@LABEL^VPRJDMX),";",2,99)
 . . W DESC,! S $P(LN,"-",$L(DESC))="" W LN_"--",!
 . . F  S IDX=$O(INDEXES(IDX)) Q:IDX=""  W $J(IDX,25) S CNT=CNT+1 W:CNT#3=0 !
 . . W:CNT#3'=0 !
 . . W !
 . . K INDEXES
 . W !,"Select the names of the indexes that you want to re-index, then hit <enter>",!
 . W "Hit <enter> again when you are finished, or Q <enter> if you want to quit without running",!
 . F  R !,"Enter index name: ",IDXLIST Q:(IDXLIST="")!($TR(IDXLIST,"q","Q")="Q")  D
 . . S INDEX=INDEX_","_IDXLIST
 . I $TR(IDXLIST,"q","Q")="Q" W ! Q
 . S $E(INDEX)=""
 . I INDEX="" W !,"Nothing to re-index, quitting...",! Q
 . E  W !,"Re-indexing operational data for the chosen index(es): "_$TR(INDEX,","," "),!
 . D RIDXALL(INDEX)
 QUIT
 ;
RIDXALL(INDEX) ; Re-index all operational data
 ; @param {string} [INDEX=""] - A list of one or more comma-delimited index names to re-index, or if omitted or empty, re-index all
 N OK,KEY,NUM,FLG
 K:$D(^XTMP("VPRJVUP","odc")) ^XTMP("VPRJVUP","odc")
 S ^XTMP("VPRJVUP","odc","total")=$$TOTCTNI()
 D LOGMSG^VPRJ("odc","Re-indexing all non-patient data")
 ; Disabling global lock (cf. WRC 880083)
 ; L +^VPRJD:$G(^VPRCONFIG("timeout","odindex"),5) E  D LOGMSG^VPRJ("odc","Unable to lock all operational data") QUIT
 D SUSPEND^VPRJ
 S NUM=0,FLG=0
 F  S NUM=$O(^VPRHTTP(NUM)) Q:(NUM'=+NUM)!FLG  D
 . I (($D(^VPRHTTP(NUM,"listener"))#2)&(^VPRHTTP(NUM,"listener")'="stopped"))!($D(^VPRHTTP(0,"child"))'=0) D
 . . W "Unable to re-index operational data at this time.."
 . . D RESUME^VPRJ
 . . ; Disabling global lock (cf. WRC 880083)
 . . ; L -^VPRJD
 . . S FLG=1
 I FLG QUIT
 D CLRINDEX(.OK,$G(INDEX)) QUIT:'OK
 ;
 S KEY="" F  S KEY=$O(^VPRJD(KEY)) Q:KEY=""  D
 . D RIDXOBJ(KEY,$G(INDEX))
 . D LOGCNT^VPRJ("odc")
 D RESUME^VPRJ
 ; Disabling global lock (cf. WRC 880083)
 ; L -^VPRJD
 S ^XTMP("VPRJVUP","odc","complete")=1
 QUIT
 ;
RIDXCTN(CTN) ; Re-index a collection
 ; Can't re-index an object at a time without corrupting the tallys
 ; We don't know which tallies to kill.
 Q
RBLDALL ; Rebuild all objects (includes templates)
 N OK,KEY
 K:$D(^XTMP("VPRJVUP","odc")) ^XTMP("VPRJVUP","odc")
 S ^XTMP("VPRJVUP","odc","total")=$$TOTCTNI()
 D LOGMSG^VPRJ("odc","Rebuild ALL non-patient data (including templates)")
 ; Disabling global lock (cf. WRC 880083)
 ; L +^VPRJD:$G(^VPRCONFIG("timeout","odbuild"),5) E  D LOGMSG^VPRJ("odc","Unable to lock ALL operational data")
 D SUSPEND^VPRJ
 D CLRINDEX(.OK) Q:'OK  ; clears VPRJDX,VPRTMP
 D CLRDATA(.OK) Q:'OK   ; clears VPRJD,VPRJDJ except VPRJDJ("JSON")
 S KEY="" F  S KEY=$O(^VPRJDJ("JSON",KEY)) Q:KEY=""  D
 . D RBLDOBJ(KEY)
 . D LOGCNT^VPRJ("odc")
 D RESUME^VPRJ
 ; Disabling global lock (cf. WRC 880083)
 ; L -^VPRJD
 D LOGMSG^VPRJ("odc","ODC rebuild complete")
 S ^XTMP("VPRJVUP","odc","complete")=1
 Q
RBLDCTN(CTN) ; Rebuild single collection (includes templates)
 ; Can't re-buld an object at a time without corrupting the tallys
 ; We don't know which tallies to kill.
 Q
RIDXOBJ(KEY,INDEX) ; Re-index a single object
 ; @param {string} KEY - The identifier (UID) of the operational data item
 ; @param {string} [INDEX=""] - A list of one or more comma-delimited index names to re-index, or if omitted or empty, re-index all
 N OBJECT,STAMP,LTP
 ; Using ECP with a lot of data, locking and using transactions around the re-indexing code might have a performance penalty
 ; Check to see if we should wrap this with a lock and a transaction in this environment
 S LTP=$G(^VPRCONFIG("reindexLockTransactions"),0)
 I LTP L +^VPRJD(KEY):$G(^VPRCONFIG("timeout","odindex"),5) E  D LOGMSG^VPRJ("odc","Unable to obtain lock for "_KEY) QUIT
 S STAMP=$O(^VPRJD(KEY,""),-1)
 I STAMP="" W "KEY: "_KEY_" HAS NO EVENTSTAMP",! L:LTP -^VPRJD(KEY) QUIT
 M OBJECT=^VPRJD(KEY,STAMP)
 I LTP TSTART
 D INDEX^VPRJDX(KEY,"",.OBJECT,$G(INDEX))
 I LTP TCOMMIT
 I LTP L -^VPRJD(KEY)
 QUIT
 ;
RBLDOBJ(KEY) ; Re-build a single object
 L +^VPRJD(KEY):$G(^VPRCONFIG("timeout","odbuild"),5) E  D LOGMSG^VPRJ("odc","Unable to obtain lock for "_KEY) QUIT
 N LINE,JSON,STAMP
 S STAMP=$O(^VPRJDJ("JSON",KEY,""),-1)
 ; get the original JSON object without the templates
 S LINE=0 F  S LINE=$O(^VPRJDJ("JSON",KEY,STAMP,LINE)) Q:'LINE  S JSON(LINE)=^VPRJDJ("JSON",KEY,STAMP,LINE)
 ; indexes have been killed for whole patient, so remove the original object
 K:$D(^VPRJD(KEY)) ^VPRJD(KEY)
 K:$D(^VPRJDJ("JSON",KEY)) ^VPRJDJ("JSON",KEY)
 K:$D(^VPRJDJ("TEMPLATE",KEY)) ^VPRJDJ("TEMPLATE",KEY)
 ; call save the replace the object & reset indexes
 D SAVE^VPRJDS(.JSON)
 L -^VPRJD(KEY)
 Q
 ;
CLRINDEX(OK,INDEX) ; Clear all the indexes
 ; @param {string} {required} OK (passed by reference) - A return flag that signals whether indexes were cleared of data
 ; @param {string} {optional} INDEX - A list of one or more comma-delimited index names to clear from the indexes
 ;        If not passed, or the empty string, all indexes defined in VPRJPDX will be cleared
 ; Disabling global lock (cf. WRC 880083)
 ; L +^VPRJD:$G(^VPRCONFIG("timeout","odindex"),5) E  D LOGMSG^VPRJ("odc","Unable to get lock for indexes.") S OK=0 QUIT
 I $G(INDEX)'="" D
 . N IDX
 . S IDX="" F  S IDX=$O(^VPRJDX("attr",IDX)) Q:IDX=""  I (","_INDEX_",")[IDX D
 . . K:$D(^VPRJDX("attr",IDX)) ^VPRJDX("attr",IDX)
 . K:$D(^VPRJDX("count","collection")) ^VPRJDX("count","collection") K:$D(^VPRJDX("tally","collection")) ^VPRJDX("tally","collection") K:$D(^VPRTMP) ^VPRTMP
 E  K:$D(^VPRJDX) ^VPRJDX K:$D(^VPRTMP) ^VPRTMP
 ; Disabling global lock (cf. WRC 880083)
 ; L -^VPRJD
 D SETUP^VPRJPMD
 S OK=1
 QUIT
 ;
CLRDATA(OK) ; Clear data except for original JSON
 ; Disabling global lock (cf. WRC 880083)
 ; L +^VPRJD:$G(^VPRCONFIG("timeout","odclear"),5) E  D LOGMSG^VPRJ("odc","Unable to get lock for data.") S OK=0 Q
 K:$D(^VPRJD) ^VPRJD K:$D(^VPRJDJ("TEMPLATE")) ^VPRJDJ("TEMPLATE")
 ; Disabling global lock (cf. WRC 880083)
 ; L -^VPRJD
 S OK=1
 Q
LSTCTN ; List collections
 N CTN
 W !,"Collections   Items     (UIDs) --"
 S CTN="" F  S CTN=$O(^VPRJDX("count","collection",CTN)) Q:CTN=""  D
 . W !,?2,CTN,?14,$G(^VPRJDX("count","collection",CTN)),?24,"(",$$OBJCTN(CTN),")"
 Q
STATUS ; Show statistics for non-patient data
 W !,"Statistics for non-patient data --"
 W !,?4," Data Nodes: ",$$NODECNT^VPRJ2P("^VPRJD")
 W !,?4,"Index Nodes: ",$$NODECNT^VPRJ2P("^VPRJDX")
 W !,?4,"Collections: ",$$TOTCTN()
 W !,?4,"Total Items: ",$$TOTCTNI()
 W !,?4,"Unique ID's: ",$$OBJCNT()
 Q
TOTCTN() ; Return the number of collections
 N CTN,COUNT
 S COUNT=0,CTN=""
 F  S CTN=$O(^VPRJDX("count","collection",CTN)) Q:CTN=""  D
 . I $G(^VPRJDX("count","collection",CTN)) S COUNT=COUNT+1
 Q COUNT
 ;
TOTCTNI() ; Return the total number of items in all collections
 N CTN,COUNT
 S COUNT=0,CTN=""
 F  S CTN=$O(^VPRJDX("count","collection",CTN)) Q:CTN=""  D
 . S COUNT=COUNT+$G(^VPRJDX("count","collection",CTN))
 Q COUNT
 ;
OBJCNT() ; Return a count of objects by UID
 N COUNT,UID
 S COUNT=0,UID="urn:" ; to skip "JSON" and "TEMPLATE" nodes
 F  S UID=$O(^VPRJD(UID)) Q:UID=""  S COUNT=COUNT+1
 Q COUNT
 ;
OBJCTN(CTN) ; Return a count of objects by UID for a collection
 N COUNT,PREFIX,UID
 S COUNT=0,PREFIX="urn:va:"_CTN_":",UID=PREFIX
 F  S UID=$O(^VPRJD(UID)) Q:$E(UID,1,$L(PREFIX))'=PREFIX  S COUNT=COUNT+1
 Q COUNT
DELCTN ; Delete a collection
 N HTTPERR,CTN
 S CTN=$$PROMPT^VPRJ1("Collection","","S","Enter string that identifies collection in the UID.")
 Q:CTN=""
 I '$D(^VPRJDX("count","collection",CTN)) W !,"Collection not found." Q
 D DELCTN^VPRJDS(CTN)
 I $G(HTTPERR) W !,"Error while deleting collection: ",HTTPERR
 Q
RESET ; Reset the non-patient data store (kill the data and re-initialize)
 N X
 W !,"Are you sure you want to delete the database? "
 R X:300 E  Q
 I $$UP^XLFSTR($E(X))'="Y" Q
 D SUSPEND^VPRJ
 D KILLDB
 D RESUME^VPRJ
 Q
KILLDB ; -- Delete and reset the globals for the database
 K:$D(^VPRJD) ^VPRJD
 K:$D(^VPRJDJ) ^VPRJDJ
 K:$D(^VPRJDX) ^VPRJDX
 K:$D(^VPRTMP) ^VPRTMP
 K:$D(^VPRSTATUSOD) ^VPRSTATUSOD
 K:$D(^VPRJSES) ^VPRJSES
 K:$D(^VPRJODM) ^VPRJODM
 D SETUP^VPRJPMD
 Q
