VPRJCONV ;V4W/DLW,KRM/CJE -- Conversion routine to make conversions to JDS data that has changed
 ;
 QUIT  ; Should not be called from the top
 ;
 ; This routine should be run at every site that was running JDS before the conversion to the new metastamp
 ; This routine makes extensive use of ^TMP. This is used as a temprory work place for conversions to happen
 ; If this process needs to be re-ran (due to a crash, etc). The data stored in ^TMP is important to keep around.
 ; This cannot be moved to process private globals.
 ;
SYNCSTS ; Entry point for sync status metastamp conversion
 ; Convert the old sync status metastamp to the new one
 N STARTOD,STARTPAT,ENDTIME,TOTALTIME,ODTIME,ODAVG,PATTIME,PATAVG,I,J,PID,SITE,SOURCESTAMP,DOMAIN
 ;
 I $D(^VPRJSAVD) W "^VPRJSAVD is not empty, aborting!",! QUIT
 I $D(^VPRJSAVP) W "^VPRJSAVP is not empty, aborting!",! QUIT
 I $D(^VPRJSTMP) W "^VPRJSTMP is not empty, aborting!",! QUIT
 I '$D(^VPRSTATUSOD) W "^VPRSTATUSOD appears to be empty, aborting!",! QUIT
 I '$D(^VPRSTATUS) W "^VPRSTATUS appears to be empty, aborting!",! QUIT
 ;
 S STARTOD=$$SEC^XLFDT($H)
 ; Start conversion for operational data
 L +^VPRSTATUSOD:$G(^VPRCONFIG("timeout","odconvert"),5) E  W "Could not obtain lock on ^VPRSTATUSOD, aborting!",! QUIT
 ;
 M ^VPRJSAVD=^VPRSTATUSOD
 W "Saved ^VPRSTATUSOD as ^VPRJSAVD",!
 ;
 S I=0
 S (SITE,SOURCESTAMP,DOMAIN)=""
 ;
 F  S SITE=$O(^VPRSTATUSOD(SITE)) Q:SITE=""  D
 . S (SOURCESTAMP,DOMAIN)=""
 . W "Converting Site: "_SITE,!
 . TS
 . ;
 . S SOURCESTAMP=$O(^VPRSTATUSOD(SITE,SOURCESTAMP),-1) ; Get the newest source stamp
 . ; Check to make sure the source stamp is a 14 digit integer, otherwise quit this iteration
 . I SOURCESTAMP?14N S I=I+1
 . E  TRO  D  Q
 . . W "Site: "_SITE_" Invalid Sourcestamp found: ",SOURCESTAMP,!
 . . S ^VPRJCONV(SITE,"operational")="Invalid Sourcestamp found: "_SOURCESTAMP
 . ;
 . F  S DOMAIN=$O(^VPRSTATUSOD(SITE,SOURCESTAMP,DOMAIN)) Q:DOMAIN=""  D
 . . ; Delete the domain stored node
 . . K:$D(^VPRSTATUSOD(SITE,SOURCESTAMP,DOMAIN,SOURCESTAMP,"stored")) ^VPRSTATUSOD(SITE,SOURCESTAMP,DOMAIN,SOURCESTAMP,"stored")
 . ;
 . ZK:$D(^VPRSTATUSOD(SITE,SOURCESTAMP))#10 ^VPRSTATUSOD(SITE,SOURCESTAMP) ; Delete the data, but not the descendants
 . ; Save off newest metastamp to a temp global
 . M ^VPRJSTMP("VPRSTATUSOD",SITE)=^VPRSTATUSOD(SITE,SOURCESTAMP)
 . S ^VPRJSTMP("VPRSTATUSOD",SITE,"stampTime")=SOURCESTAMP
 . K:$D(^VPRSTATUSOD(SITE)) ^VPRSTATUSOD(SITE)
 . M ^VPRSTATUSOD(SITE)=^VPRJSTMP("VPRSTATUSOD",SITE)
 . ;
 . TC
 ;
 K:$D(^VPRJSTMP("VPRSTATUSOD")) ^VPRJSTMP("VPRSTATUSOD")
 ;
 L -^VPRSTATUSOD
 ;
 S STARTPAT=$$SEC^XLFDT($H)
 ; Start conversion for patient data
 L +^VPRSTATUS:$G(^VPRCONFIG("timeout","ptconvert"),5) E  W "Could not obtain lock on ^VPRSTATUS, aborting!",! QUIT
 ;
 M ^VPRJSAVP=^VPRSTATUS
 W "Saved ^VPRSTATUS as ^VPRJSAVP",!
 ;
 S J=0
 S (PID,SITE,SOURCESTAMP,DOMAIN)=""
 ;
 F  S PID=$O(^VPRSTATUS(PID)) Q:PID=""  D
 . S SITE=$P(PID,";")
 . S (SOURCESTAMP,DOMAIN)=""
 . ;
 . TS
 . ;
 . S SOURCESTAMP=$O(^VPRSTATUS(PID,SITE,SOURCESTAMP),-1) ; Get the newest source stamp
 . I SOURCESTAMP?14N S J=J+1
 . E  TRO  D  Q
 . . W "Site: "_SITE_" PID: "_PID_" Invalid Sourcestamp found: ",SOURCESTAMP,!
 . . S ^VPRJCONV(SITE,"patient",PID)="Invalid Sourcestamp found: "_SOURCESTAMP
 . ;
 . F  S DOMAIN=$O(^VPRSTATUS(PID,SITE,SOURCESTAMP,DOMAIN)) Q:DOMAIN=""  D
 . . ; Delete the domain stored node
 . . K:$D(^VPRSTATUS(PID,SITE,SOURCESTAMP,DOMAIN,SOURCESTAMP,"stored")) ^VPRSTATUS(PID,SITE,SOURCESTAMP,DOMAIN,SOURCESTAMP,"stored")
 . ;
 . ZK:$D(^VPRSTATUS(PID,SITE,SOURCESTAMP))#10 ^VPRSTATUS(PID,SITE,SOURCESTAMP) ; Delete the data, but not the descendants
 . ; Save off newest metastamp to a temp global
 . M ^VPRJSTMP("VPRSTATUS",PID,SITE)=^VPRSTATUS(PID,SITE,SOURCESTAMP)
 . S ^VPRJSTMP("VPRSTATUS",PID,SITE,"stampTime")=SOURCESTAMP
 . K:$D(^VPRSTATUS(PID,SITE)) ^VPRSTATUS(PID,SITE)
 . M ^VPRSTATUS(PID,SITE)=^VPRJSTMP("VPRSTATUS",PID,SITE)
 . ;
 . TC
 ;
 K:$D(^VPRJSTMP("VPRSTATUS")) ^VPRJSTMP("VPRSTATUS")
 ;
 L -^VPRSTATUS
 ;
 S ENDTIME=$$SEC^XLFDT($H)
 ;
 ; Calculate elapsed time for operational and patient sync metastamp conversions
 S TOTALTIME=ENDTIME-STARTOD
 D DISPTIME(TOTALTIME,"Total time:")
 ;
 W !,"Total sites: "_I,!
 ;
 S ODTIME=STARTPAT-STARTOD
 D DISPTIME(ODTIME,"Total time for operational data:")
 ;
 I I>1 D  ; Only need an average if there is more than one site
 . S ODAVG=STARTPAT-STARTOD/I ; Calculate average time per site
 . D DISPTIME(ODAVG,"Average time per site:")
 ;
 ;
 W !,"Total patients: "_J,!
 ;
 S PATTIME=ENDTIME-STARTPAT
 D DISPTIME(PATTIME,"Total time for patient data:")
 ;
 I J>1 D  ; Only need an average if there is more than one patient
 . S PATAVG=ENDTIME-STARTPAT/J ; Calculate average time per patient
 . D DISPTIME(PATAVG,"Average time per patient:")
 ;
 W !,"Check ^VPRSTATUSOD and ^VPRSTATUS, original versions in ^VPRJSAVD and ^VPRJSAVP",!
 ;
 QUIT
 ;
JPIDSHRD(SAVE) ; Entry point for JPID restructure for sharding conversion
 ; SAVE specifies whether to save the original global trees before conversion
 ; Pass a 1 to save to disk explicitly, or pass a 2, to save to a global
 ; mapped to memory, or pass a 0 to NOT save
 N STARTARY,STARTJSN,STARTIDX,STARTTPL,STARTSTS,ENDTIME,TOTALTIME,ARYTIME,ARYAVG
 N JSNTIME,JSNAVG,IDXTIME,IDXAVG,TPLTIME,TPLAVG,STSTIME,STSAVG,I,J,K,L,M,JPID,PID
 ;
 ; Default to saving all original data to disk be able to rollback conversion
 S SAVE=$G(SAVE,1)
 ;
 I SAVE=1,$D(^VPRJSAVA) W "^VPRJSAVA is not empty, aborting!",! QUIT
 I SAVE=1,$D(^VPRJSAVJ) W "^VPRJSAVJ is not empty, aborting!",! QUIT
 I SAVE=1,$D(^VPRJSAVI) W "^VPRJSAVI is not empty, aborting!",! QUIT
 I SAVE=1,$D(^VPRJSAVT) W "^VPRJSAVT is not empty, aborting!",! QUIT
 I SAVE=1,$D(^VPRJSAVS) W "^VPRJSAVS is not empty, aborting!",! QUIT
 ;
 I SAVE=2,$D(^TMP("VPRJSAVA")) W "^TMP(""VPRJSAVA"") is not empty, aborting!",! QUIT
 I SAVE=2,$D(^TMP("VPRJSAVJ")) W "^TMP(""VPRJSAVJ"") is not empty, aborting!",! QUIT
 I SAVE=2,$D(^TMP("VPRJSAVI")) W "^TMP(""VPRJSAVI"") is not empty, aborting!",! QUIT
 I SAVE=2,$D(^TMP("VPRJSAVT")) W "^TMP(""VPRJSAVT"") is not empty, aborting!",! QUIT
 I SAVE=2,$D(^TMP("VPRJSAVS")) W "^TMP(""VPRJSAVS"") is not empty, aborting!",! QUIT
 ;
 I $D(^TMP("VPRJSVPT")) W "^TMP(""VPRJSVPT"") is not empty, aborting!",! QUIT
 I '$D(^VPRPT) W "^VPRPT appears to be empty, aborting!",! QUIT
 I '$D(^VPRPTJ("JSON")) W "^VPRPTJ appears to be empty, aborting!",! QUIT
 I '$D(^VPRPTI) W "^VPRPTI appears to be empty, aborting!",! QUIT
 I '$D(^VPRPTJ("TEMPLATE")) W "^VPRPTJ appears to be empty, aborting!",! QUIT
 I '$D(^VPRSTATUS) W "^VPRSTATUS appears to be empty, aborting!",! QUIT
 ;
 S STARTARY=$$SEC^XLFDT($H)
 ;
 ; Start conversion for patient data array
 L +^VPRPT:$G(^VPRCONFIG("timeout","arrayconvert"),5) E  W "Could not obtain lock on ^VPRPT, aborting!",! QUIT
 ;
 W:SAVE "All original data will be saved during conversion",!!
 ;
 S I=0
 S (PID,JPID)=""
 ;
 F  S PID=$O(^VPRPT(PID)) Q:PID=""  D
 . I '$$ISPID^VPRJPR(PID) W PID_" is not a PID, skipping",! Q
 . ;
 . W "Converting patient data array for PID: "_PID,!
 . ;
 . TS
 . S JPID=$$JPID4PID^VPRJPR(PID)
 . ;
 . I $$ISJPID^VPRJPR(JPID) S I=I+1
 . E  TRO  D  Q
 . . W "No JPID found for patient: "_PID,!
 . . S ^VPRJCONV("ARRAY",PID)="No JPID found for patient"
 . ;
 . ; Save off patient to a temp global
 . ; Merge patient under its JPID
 . M ^TMP("VPRJSVPT","ARRAY",JPID,PID)=^VPRPT(PID)
 . ; Save to disk mode, back up the original node to a disk-backed global
 . I SAVE=1 M ^VPRJSAVA(PID)=^VPRPT(PID)
 . ; Save to cache mode, back up the original node to a memory-backed global
 . E  I SAVE=2 M ^TMP("VPRJSAVA",PID)=^VPRPT(PID)
 . ; Kill original patient array node
 . K:$D(^VPRPT(PID)) ^VPRPT(PID)
 . ;
 . TC
 ; Merge all patients back in to ^VPRPT
 W "Merging ^TMP(""VPRJSVPT"",""ARRAY"") back in to ^VPRPT",!
 M ^VPRPT=^TMP("VPRJSVPT","ARRAY")
 K:$D(^TMP("VPRJSVPT","ARRAY")) ^TMP("VPRJSVPT","ARRAY")
 W "Merged ^TMP(""VPRJSVPT"",""ARRAY"") back in to ^VPRPT",!
 ;
 L -^VPRPT
 ;
 W !
 ;
 S STARTJSN=$$SEC^XLFDT($H)
 ;
 ; Start conversion for patient data JSON
 L +^VPRPTJ("JSON"):$G(^VPRCONFIG("timeout","jsonconvert"),5) E  W "Could not obtain lock on ^VPRPTJ(""JSON""), aborting!",! QUIT
 ;
 S J=0
 S (PID,JPID)=""
 ;
 F  S PID=$O(^VPRPTJ("JSON",PID)) Q:PID=""  D
 . I '$$ISPID^VPRJPR(PID) W PID_" is not a PID, skipping",! Q
 . ;
 . W "Converting patient data JSON for PID: "_PID,!
 . ;
 . TS
 . S JPID=$$JPID4PID^VPRJPR(PID)
 . ;
 . I $$ISJPID^VPRJPR(JPID) S J=J+1
 . E  TRO  D  Q
 . . W "No JPID found for patient: "_PID,!
 . . S ^VPRJCONV("JSON",PID)="No JPID found for patient"
 . ;
 . ; Save off patient to a temp global
 . ; Merge patient under its JPID
 . M ^TMP("VPRJSVPT","JSON",JPID,PID)=^VPRPTJ("JSON",PID)
 . ; Save to disk mode, back up the original node to a disk-backed global
 . I SAVE=1 M ^VPRJSAVJ(PID)=^VPRPTJ("JSON",PID)
 . ; Save to cache mode, back up the original node to a memory-backed global
 . E  I SAVE=2 M ^TMP("VPRJSAVJ",PID)=^VPRPTJ("JSON",PID)
 . ; Kill original patient JSON node
 . K:$D(^VPRPTJ("JSON",PID)) ^VPRPTJ("JSON",PID)
 . ;
 . TC
 ; Merge all patients back in to ^VPRPTJ("JSON")
 W "Merging ^TMP(""VPRJSVPT"",""JSON"") back in to ^VPRPTJ(""JSON"")",!
 M ^VPRPTJ("JSON")=^TMP("VPRJSVPT","JSON")
 K:$D(^TMP("VPRJSVPT","JSON")) ^TMP("VPRJSVPT","JSON")
 W "Merged ^TMP(""VPRJSVPT"",""JSON"") back in to ^VPRPTJ(""JSON"")",!
 ;
 L -^VPRPTJ("JSON")
 ;
 W !
 ;
 S STARTIDX=$$SEC^XLFDT($H)
 ;
 ; Start conversion for patient data INDEX
 L +^VPRPTI:$G(^VPRCONFIG("timeout","indexconvert"),5) E  W "Could not obtain lock on ^VPRPTI, aborting!",! QUIT
 ;
 S K=0
 S (PID,JPID)=""
 ;
 F  S PID=$O(^VPRPTI(PID)) Q:PID=""  D
 . I '$$ISPID^VPRJPR(PID) W PID_" is not a PID, skipping",! Q
 . ;
 . W "Converting patient data index for PID: "_PID,!
 . ;
 . TS
 . S JPID=$$JPID4PID^VPRJPR(PID)
 . ;
 . I $$ISJPID^VPRJPR(JPID) S K=K+1
 . E  TRO  D  Q
 . . W "No JPID found for patient: "_PID,!
 . . S ^VPRJCONV("INDEX",PID)="No JPID found for patient"
 . ;
 . ; Save off patient to a temp global
 . ; Merge patient under its JPID
 . M ^TMP("VPRJSVPT","INDEX",JPID,PID)=^VPRPTI(PID)
 . ; Save to disk mode, back up the original node to a disk-backed global
 . I SAVE=1 M ^VPRJSAVI(PID)=^VPRPTI(PID)
 . ; Save to cache mode, back up the original node to a memory-backed global
 . E  I SAVE=2 M ^TMP("VPRJSAVI",PID)=^VPRPTI(PID)
 . ; Kill original patient index node
 . K:$D(^VPRPTI(PID)) ^VPRPTI(PID)
 . ;
 . TC
 ; Merge all patients back in to ^VPRPTI
 W "Merging ^TMP(""VPRJSVPT"",""INDEX"") back in to ^VPRPTI",!
 M ^VPRPTI=^TMP("VPRJSVPT","INDEX")
 K:$D(^TMP("VPRJSVPT","INDEX")) ^TMP("VPRJSVPT","INDEX")
 W "Merged ^TMP(""VPRJSVPT"",""INDEX"") back in to ^VPRPTI",!
 ;
 L -^VPRPTI
 ;
 W !
 ;
 S STARTTPL=$$SEC^XLFDT($H)
 ;
 ; Start conversion for patient data TEMPLATE
 L +^VPRPTJ("TEMPLATE"):$G(^VPRCONFIG("timeout","templateconvert"),5) E  W "Could not obtain lock on ^VPRPTJ(""TEMPLATE""), aborting!",! QUIT
 ;
 S L=0
 S (PID,JPID)=""
 ;
 F  S PID=$O(^VPRPTJ("TEMPLATE",PID)) Q:PID=""  D
 . I '$$ISPID^VPRJPR(PID) W PID_" is not a PID, skipping",! Q
 . ;
 . W "Converting patient data template for PID: "_PID,!
 . ;
 . TS
 . S JPID=$$JPID4PID^VPRJPR(PID)
 . ;
 . I $$ISJPID^VPRJPR(JPID) S L=L+1
 . E  TRO  D  Q
 . . W "No JPID found for patient: "_PID,!
 . . S ^VPRJCONV("TEMPLATE",PID)="No JPID found for patient"
 . ;
 . ; Save off patient to a temp global
 . ; Merge patient under its JPID
 . M ^TMP("VPRJSVPT","TEMPLATE",JPID,PID)=^VPRPTJ("TEMPLATE",PID)
 . ; If in save mode, back up the original node
 . M:SAVE ^VPRJSAVT(PID)=^VPRPTJ("TEMPLATE",PID)
 . ; Save to disk mode, back up the original node to a disk-backed global
 . I SAVE=1 M ^VPRJSAVT(PID)=^VPRPTJ("TEMPLATE",PID)
 . ; Save to cache mode, back up the original node to a memory-backed global
 . E  I SAVE=2 M ^TMP("VPRJSAVT",PID)=^VPRPTJ("TEMPLATE",PID)
 . ; Kill original patient template node
 . K:$D(^VPRPTJ("TEMPLATE",PID)) ^VPRPTJ("TEMPLATE",PID)
 . ;
 . TC
 ; Merge all patients back in to ^VPRPTJ("TEMPLATE")
 W "Merging ^TMP(""VPRJSVPT"",""TEMPLATE"") back in to ^VPRPTJ(""TEMPLATE"")",!
 M ^VPRPTJ("TEMPLATE")=^TMP("VPRJSVPT","TEMPLATE")
 K:$D(^TMP("VPRJSVPT","TEMPLATE")) ^TMP("VPRJSVPT","TEMPLATE")
 W "Merged ^TMP(""VPRJSVPT"",""TEMPLATE"") back in to ^VPRPTJ(""TEMPLATE"")",!
 ;
 L -^VPRPTJ("TEMPLATE")
 ;
 W !
 ;
 S STARTSTS=$$SEC^XLFDT($H)
 ;
 ; Start conversion for patient data sync status
 L +^VPRSTATUS:$G(^VPRCONFIG("timeout","statusconvert"),5) E  W "Could not obtain lock on ^VPRSTATUS, aborting!",! QUIT
 ;
 S M=0
 S (PID,JPID)=""
 ;
 F  S PID=$O(^VPRSTATUS(PID)) Q:PID=""  D
 . I '$$ISPID^VPRJPR(PID) W PID_" is not a PID, skipping",! Q
 . ;
 . W "Converting patient sync status for PID: "_PID,!
 . ;
 . TS
 . S JPID=$$JPID4PID^VPRJPR(PID)
 . ;
 . I $$ISJPID^VPRJPR(JPID) S M=M+1
 . E  TRO  D  Q
 . . W "No JPID found for patient: "_PID,!
 . . S ^VPRJCONV("STATUS",PID)="No JPID found for patient"
 . ;
 . ; Save off patient to a temp global
 . ; Merge patient under its JPID
 . M ^TMP("VPRJSVPT","STATUS",JPID,PID)=^VPRSTATUS(PID)
 . ; Save to disk mode, back up the original node to a disk-backed global
 . I SAVE=1 M ^VPRJSAVS(PID)=^VPRSTATUS(PID)
 . ; Save to cache mode, back up the original node to a memory-backed global
 . E  I SAVE=2 M ^TMP("VPRJSAVS",PID)=^VPRSTATUS(PID)
 . ; Kill original patient sync status node
 . K:$D(^VPRSTATUS(PID)) ^VPRSTATUS(PID)
 . ;
 . TC
 ; Merge all patients back in to ^VPRSTATUS
 W "Merging ^TMP(""VPRJSVPT"",""STATUS"") back in to ^VPRSTATUS",!
 M ^VPRSTATUS=^TMP("VPRJSVPT","STATUS")
 K:$D(^TMP("VPRJSVPT","STATUS")) ^TMP("VPRJSVPT","STATUS")
 W "Merged ^TMP(""VPRJSVPT"",""STATUS"") back in to ^VPRSTATUS",!
 ;
 L -^VPRSTATUS
 ;
 W !
 ;
 S ENDTIME=$$SEC^XLFDT($H)
 ;
 ; Calculate elapsed time for patient array, json, index, and template conversions
 S TOTALTIME=ENDTIME-STARTARY
 D DISPTIME(TOTALTIME,"Total time:")
 ;
 W !,"Total PIDs in ^VPRPT: "_I,!
 ;
 S ARYTIME=STARTJSN-STARTARY
 D DISPTIME(ARYTIME,"Total time for patient array data:")
 ;
 I I>1 D  ; Only need an average if there is more than one PID
 . S ARYAVG=STARTJSN-STARTARY/I ; Calculate average time per PID
 . D DISPTIME(ARYAVG,"Average time per PID:")
 ;
 W !,"Total PIDs in ^VPRPTJ(""JSON""): "_J,!
 ;
 S JSNTIME=STARTIDX-STARTJSN
 D DISPTIME(JSNTIME,"Total time for patient JSON data:")
 ;
 I J>1 D  ; Only need an average if there is more than one PID
 . S JSNAVG=STARTIDX-STARTJSN/J ; Calculate average time per PID
 . D DISPTIME(JSNAVG,"Average time per PID:")
 ;
 W !,"Total PIDs in ^VPRPTI: "_K,!
 ;
 S IDXTIME=STARTTPL-STARTIDX
 D DISPTIME(IDXTIME,"Total time for patient index data:")
 ;
 I K>1 D  ; Only need an average if there is more than one PID
 . S IDXAVG=STARTTPL-STARTIDX/K ; Calculate average time per PID
 . D DISPTIME(IDXAVG,"Average time per PID:")
 ;
 W !,"Total PIDs in ^VPRPTJ(""TEMPLATE""): "_L,!
 ;
 S TPLTIME=STARTSTS-STARTTPL
 D DISPTIME(TPLTIME,"Total time for patient template data:")
 ;
 I L>1 D  ; Only need an average if there is more than one PID
 . S TPLAVG=STARTSTS-STARTTPL/L ; Calculate average time per PID
 . D DISPTIME(TPLAVG,"Average time per PID:")
 ;
 W !,"Total PIDs in ^VPRSTATUS: "_M,!
 ;
 S STSTIME=ENDTIME-STARTSTS
 D DISPTIME(STSTIME,"Total time for patient sync status data:")
 ;
 I M>1 D  ; Only need an average if there is more than one PID
 . S STSAVG=ENDTIME-STARTSTS/M ; Calculate average time per PID
 . D DISPTIME(STSAVG,"Average time per PID:")
 ;
 W !,"Check ^VPRPT, ^VPRPTJ(""JSON""), ^VPRPTI, ^VPRPTJ(""TEMPLATE""), and ^VPRSTATUS",!
 W !,"Errors can be found in ^VPRJCONV",!
 I SAVE=1 D
 . W !,"Original versions in ^VPRJSAVA, ^VPRJSAVJ, ^VPRJSAVI, ^VPRJSAVT, and ^VPRJSAVS"
 . W !!,"You can recover the old structure by running these five commands:"
 . W !,?4,"K ^VPRPT M ^VPRPT=^VPRJSAVA"
 . W !,?4,"K ^VPRPTJ(""JSON"") M ^VPRPTJ(""JSON"")=^VPRJSAVJ"
 . W !,?4,"K ^VPRPTI M ^VPRPTI=^VPRJSAVI"
 . W !,?4,"K ^VPRPTJ(""TEMPLATE"") M ^VPRPTJ(""TEMPLATE"")=^VPRJSAVT"
 . W !,?4,"K ^VPRSTATUS M ^VPRSTATUS=^VPRJSAVS"
 . W !!,"You will have to remove them if you need to run the conversion again:"
 . W !,?4,"K ^VPRJSAVA,^VPRJSAVJ,^VPRJSAVI,^VPRJSAVT,^VPRJSAVS"
 E  I SAVE=2 D
 . W !,"Original versions in ^TMP(""VPRJSAVA""), ^TMP(""VPRJSAVJ""),"
 . W !,"^TMP(""VPRJSAVI""), ^TMP(""VPRJSAVT""), and ^TMP(""VPRJSAVS"")"
 . W !!,"You can recover the old structure by running these five commands:"
 . W !,?4,"K ^VPRPT M ^VPRPT=^TMP(""VPRJSAVA"")"
 . W !,?4,"K ^VPRPTJ(""JSON"") M ^VPRPTJ(""JSON"")=^TMP(""VPRJSAVJ"")"
 . W !,?4,"K ^VPRPTI M ^VPRPTI=^TMP(""VPRJSAVI"")"
 . W !,?4,"K ^VPRPTJ(""TEMPLATE"") M ^VPRPTJ(""TEMPLATE"")=^TMP(""VPRJSAVT"")"
 . W !,?4,"K ^VPRSTATUS M ^VPRSTATUS=^TMP(""VPRJSAVS"")"
 . W !!,"You will have to remove them if you need to run the conversion again:"
 . W !,?4,"K ^TMP(""VPRJSAVA""),^TMP(""VPRJSAVJ""),^TMP(""VPRJSAVI"")"
 . W !,?4,"K ^TMP(""VPRJSAVT""),^TMP(""VPRJSAVS"")"
 ;
 QUIT
 ;
DISPTIME(TIME,MSG) ; Display the elapsed time the conversion routine took to run
 ; Parameters:
 ;   TIME = elapsed time in seconds
 ;   MSG  = message to display before human readable time is displayed
 ;
 I TIME'?.N1(1"."1.N,.N) W "First argument must be number of seconds elapsed",! QUIT
 ;
 N DAYS,HOURS,MINUTES,SECONDS
 ; Convert elapsed seconds to a more human readable format
 I TIME["." S TIME=$DECIMAL(TIME,3)
 S DAYS=TIME\86400
 S HOURS=TIME-(DAYS*86400)\3600
 S MINUTES=TIME-(DAYS*86400)-(HOURS*3600)\60
 S SECONDS=TIME-(DAYS*86400)-(HOURS*3600)#60
 ;
 I $E($RE($G(MSG)))'=" " S MSG=$G(MSG)_" " ; Add a space for nicer formatting
 ;
 W !,MSG_DAYS_" Day"_$S(DAYS'=1:"s",1:"")_", "_HOURS_" Hour"_$S(HOURS'=1:"s",1:"")
 W ", "_MINUTES_" Minute"_$S(MINUTES'=1:"s",1:"")_", "_SECONDS_" Second"_$S(SECONDS'=1:"s",1:"")
 W !,?$L(MSG),"("_TIME_" Total Seconds)",!
 ;
 QUIT
 ;
DELERROR ; Delete the old JDS error store data and URL mappings
 N URL,NUM
 ;
 F URL="error/set/this","error/get/{id}","error/get","error/length/this","error/destroy/{id}","error/clear/this" D
 . S NUM=0
 . F  S NUM=$O(^VPRCONFIG("urlmap","url-index",URL,NUM)) Q:NUM=""  D
 . . K:$D(^VPRCONFIG("urlmap",NUM)) ^VPRCONFIG("urlmap",NUM)
 . K:$D(^VPRCONFIG("urlmap","url-index",URL)) ^VPRCONFIG("urlmap","url-index",URL)
 K:$D(^VPRJERR) ^VPRJERR
 ;
 I ($D(^VPRJERR))!($O(^VPRCONFIG("urlmap","url-index","err"))["error") W "Old JDS error store was not completely deleted..",!
 E  W "Old JDS error store is successfully deleted..",!
 ;
 QUIT
