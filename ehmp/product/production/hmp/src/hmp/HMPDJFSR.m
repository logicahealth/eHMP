HMPDJFSR ;AFS/CPC -- Reservation model for freshness stream;Jan 24, 2017 10:35:07
 ;;2.0;ENTERPRISE HEALTH MANAGEMENT PLATFORM;**4**;May 15, 2016;Build 11
 ;Per VA Directive 6402, this routine should not be modified.
 ;
 ;
 Q
 ; --- manage subscription model for parallel pollers
 ;---- note start point is always last updated point so next record will be the first processed
 ;
INIT ;get last update position and set up additional variables
 N NOW,TENBILL
 I 'HMPRMODE D  Q  ;Run in pre-allocation mode for backward compatibility
 . I HMPFDT<$$FMADD^XLFDT($$DT^XLFDT,-8) S HMPFDT=$$HTFM^XLFDT($H-8),HMPFSEQ=0
 . S HMPFLAST=HMPFDT_"-"_HMPFSEQ
 . D LASTUPD(HMPFHMP,HMPFLAST)
 ;
 S TENBILL=1E10
 S HMPFLAST=$$GETLAST(),HMPFDT=$P(HMPFLAST,"-"),HMPFSEQ=+$P(HMPFLAST,"-",2)
 S HMPALLTK=$G(ARGS("allocationToken"))
 S HMPALLSZ=$G(ARGS("allocationSize"),1000)
 S HMPALLST=$G(ARGS("allocationStatus"))
 I '$D(^XTMP(HMPALLOQ)) D NEWXTMP^HMPDJFS(HMPALLOQ,8,"HMP Allocation Table") S ^XTMP(HMPALLOQ,"last")=0
 S $P(^XTMP(HMPALLOQ,0),U,1)=$$HTFM^XLFDT($H+8) ;reset file deletion date to keep for 8 days
 S NOW=$P($H,",",2)
 I HMPALLST="resumeProcessing" D CLEARBLK Q
 I HMPALLST="overrideProtection" D RESETMOD Q
 I $D(^XTMP(HMPALLOQ,"blocked")),HMPALLST'="rejected",HMPALLST'="replay",HMPALLST'="list",HMPALLST'="getDetails" D ERRLIST Q
 I HMPALLST="list" D ERRLIST Q
 I HMPALLST="getDetails" D DETAILS Q
 I 'HMPALLTK D NEWALLOC Q
 I HMPALLTK,HMPALLST'="" D UPDALLOC(HMPALLOQ,HMPALLTK,HMPALLST,HMPALLSZ),NEWALLOC Q
 S HMPALLTK="" ;DE7857 handle token passed without status - will result in null return
 Q
UPDALLOC(HMPALLOQ,TK,ST,NS) ;update allocation table
 Q:'$D(^XTMP(HMPALLOQ,"current",TK))
 S $P(^XTMP(HMPALLOQ,"current",TK),U,4)=ST
 I ST="reduce",+$G(NS) S $P(^XTMP(HMPALLOQ,"current",TK),U,6)=NS ;track requested new size
 Q
SPLITSIX(Z,TB) ;retrieve true value from formatted index
 Q $P(Z,"-",1)_"-"_($P(Z,"-",2)-TB)
 ;
PACKSIX(Z,TB) ;format index value for numeric collation
 Q $P(Z,"-",1)_"-"_($P(Z,"-",2)+TB)
 ;
RESETMOD ;Reset from multiple poller mode to single
 L +^XTMP(HMPALLOQ):60  ELSE  G RESETMOD ;TIMEOUT AND ELSE ONLY HERE FOR SACC COMPLIANCE
 D LOGERR(HMPALLOQ,"","RESETTING AWAY FROM MULTIPLE POLLER MODE ")
 D ERRLIST
 K ^XTMP(HMPALLOQ)
 L -^XTMP(HMPALLOQ)
 Q
LOCKDOWN ;set lockdown mode and return error
 S ^XTMP(HMPALLOQ,"blocked")="true"
 D LOGERR(HMPALLOQ,"","ALLOCATION LOCKDOWN INITIATED ")
 D ERRLIST
 Q
ERRLIST ; Return blocked error with allocation list
 N ERRLST,TK,COUNT,ALLREC,ALLERR
 S HMPALLTK="",COUNT=0
 S ERRLST("message")=$S($D(^XTMP(HMPALLOQ,"blocked")):"VistA Allocations Locked",$G(HMPALLST)="resumeProcessing":"Vista Allocation lock cleared",$G(HMPALLST)="overrideProtection":"multiple mode protection overriden",1:"Allocation status normal")
 S TK=0 F  S TK=$O(^XTMP(HMPALLOQ,"current",TK)) Q:TK=""  D
 . S COUNT=COUNT+1,ALLREC=^XTMP(HMPALLOQ,"current",TK)
 . S ERRLST("allocations",COUNT,"allocationToken")=TK
 . S ERRLST("allocations",COUNT,"allocationToken","\s")="" ;Force to string
 . S ERRLST("allocations",COUNT,"status")=$P(ALLREC,U,4)
 . S ERRLST("allocations",COUNT,"start")=$P(ALLREC,U,2)
 . S ERRLST("allocations",COUNT,"end")=$P(ALLREC,U,3)
 . S ERRLST("allocations",COUNT,"timeoutCount")=+$P(ALLREC,U,5)
 . S ERRLST("allocations",COUNT,"timeAllocated")=$$FMTHL7^HMPSTMP($$HTFM^XLFDT($P(ALLREC,U,1)))
 D ENCODE^HMPJSON("ERRLST","ALLERR","ALLERR")
 S ^TMP("HMPF",$J,.5)=$$APIHDR^HMPDJFS1(0,HMPFLAST)_"],""error"":"_ALLERR(1)_"}}"
 S HMPERR=1
 Q
DETAILS ; Return details for single allocation
 ;This code loops down the freshness queue for an allocation and formats and returns the information
 N COUNT,DETAILS,DETARR,FROM,HMPSTRM,ID,IX,REC,STATUS,TIMEALL,TO,TK,UID,X
 S TK=$G(HMPALLTK),HMPALLTK=""
 I TK="" S ^TMP("HMPF",$J,.5)=$$APIHDR^HMPDJFS1(0,HMPFLAST)_"],""error"":{""message"":""Invalid token passed to getDetails""}"_"}}" S HMPERR=1 Q
 I '$D(^XTMP(HMPALLOQ,"current",TK)) S ^TMP("HMPF",$J,.5)=$$APIHDR^HMPDJFS1(0,HMPFLAST)_"],""error"":{""message"":""Allocation not found""}"_"}}" S HMPERR=1 Q
 S ALLREC=^XTMP(HMPALLOQ,"current",TK),STATUS=$P(ALLREC,U,4),FROM=$P(ALLREC,U,2),TO=$P(ALLREC,U,3),TIMEALL=$$FMTHL7^HMPSTMP($$HTFM^XLFDT($P(ALLREC,U,1)))
 S HMPSTRM="HMPFS~"_$P(HMPALLOQ,"~",2)_"~"_$P(FROM,"-",1)
 ;set up allocation header
 S DETAILS("allocation","allocationToken")=TK
 S DETAILS("allocation","allocationToken","\s")=""
 S DETAILS("allocation","status")=STATUS
 S DETAILS("allocation","start")=FROM
 S DETAILS("allocation","end")=TO
 S DETAILS("allocation","timeAllocated")=TIMEALL
 ;
 S IX=$P(FROM,"-",2)
 F COUNT=1:1 S IX=$O(^XTMP(HMPSTRM,IX)) Q:'IX  D  Q:IX'<$P(TO,"-",2)
 . S REC=^XTMP(HMPSTRM,IX)
 . S DETAILS("details",COUNT,"queueIndex")=IX
 . S DETAILS("details",COUNT,"DFN")=$P(REC,U)
 . S X=$P(REC,U,2) I $E(X,1,4)="sync" D  Q
 .. ;list domain and control entries
 .. S DETAILS("details",COUNT,"type")=$P(REC,U,2)
 .. S X=$P(REC,U,3)
 .. S DETAILS("details",COUNT,"domain")=$P(X,":")
 .. I $L(X,":")>1 D
 ...  S DETAILS("details",COUNT,"task")=$P(X,":",2)
 ...  S DETAILS("details",COUNT,"sectionCount")=$P(X,":",3)
 ...  S DETAILS("details",COUNT,"domainSize")=$P(X,":",4)
 ...  S DETAILS("details",COUNT,"sectionSize")=$P(X,":",5)
 .. I IX>$P(TO,"-",2) S DETAILS("details",COUNT,"warning")="Only part of this domain in results"
 . ;unsolicited updated formatted differently
 . S DETAILS("details",COUNT,"type")="unsolicitedUpdate"
 . S DETAILS("details",COUNT,"domain")=$P(REC,U,2)
 . S DETAILS("details",COUNT,"deleted")=$S($P(REC,U,4)="@":"true",1:"false")
 . S ID=$P(REC,U,3),UID=$$SETUID^HMPUTILS($P(REC,U,2),$P(REC,U),ID)
 . S DETAILS("details",COUNT,"uid")=UID
 D ENCODE^HMPJSON("DETAILS","DETARR","DETARR")
 S ^TMP("HMPF",$J,.5)=$$APIHDR^HMPDJFS1(0,HMPFLAST)_"],""allocationDetails"":"_DETARR(1)_"}}"
 S HMPERR=1
 Q
NEWALLOC ;check for new allocation - US18599
 N ALLOC,DONE,END,FOUND,IX,SIX,SIXT,ALLREC,STATUS,RTIME,RDTIME,TIMEOUT,PREV,FIRST
 S HMPALLTK=""
 S TIMEOUT=$$GETIMOUT(HMPFHMP)
 I $D(^XTMP(HMPALLOQ,"blocked")) D ERRLIST Q
 L +^XTMP(HMPALLOQ):5 E  Q
 ;check oldest allocations to see if pointer can be moved if none FOUND then move on
 S DONE=0,FIRST=1,SIXT="" F  S SIXT=$O(^XTMP(HMPALLOQ,"byRecord",SIXT)) Q:SIXT=""  S FOUND=0 D  Q:'FOUND  Q:DONE  S FIRST=0
 . S IX=$P(^XTMP(HMPALLOQ,"byRecord",SIXT),U,2)
 . S ALLREC=^XTMP(HMPALLOQ,"current",IX),STATUS=$P(ALLREC,U,4)
 . I STATUS="timeoutError" D LOCKDOWN S DONE=1 Q
 . S SIX=$$SPLITSIX(SIXT,TENBILL)
 . I STATUS="complete",SIX=HMPFLAST S HMPFLAST=$P(ALLREC,U,3) D LASTCHK,LASTUPD(HMPFHMP,HMPFLAST),KILLALOC(HMPALLOQ,IX) S FOUND=1 Q
 . ;Next line self repairs allocation table if things have got out of step
 . I STATUS="complete",$P(ALLREC,U,3)=HMPFLAST D LOGERR(HMPALLOQ,IX,"ALLOCATION PRIOR TO LASTUPDATE "_HMPFLAST_" "),KILLALOC(HMPALLOQ,IX) S FOUND=1 Q
 . I STATUS="rejected",SIX=HMPFLAST S HMPFLAST=$P(ALLREC,U,3) D LASTCHK,LASTUPD(HMPFHMP,HMPFLAST),LOGERR(HMPALLOQ,IX,"ALLOCATION REJECTED "),KILLALOC(HMPALLOQ,IX) S FOUND=1 Q
 . I 'FIRST Q  ;Special cases to handle first allocation of the day
 . I STATUS="complete",$P(SIX,"-",2)=0 S HMPFLAST=$P(ALLREC,U,3) D LASTUPD(HMPFHMP,HMPFLAST),KILLALOC(HMPALLOQ,IX) S FOUND=1 Q
 . I STATUS="rejected",$P(SIX,"-",2)=0 S HMPFLAST=$P(ALLREC,U,3) D LASTUPD(HMPFHMP,HMPFLAST),LOGERR(HMPALLOQ,IX,"ALLOCATION REJECTED "),KILLALOC(HMPALLOQ,IX) S FOUND=1 Q
 ;now go through them all to update based on status
 I 'DONE S IX="" F  S IX=$O(^XTMP(HMPALLOQ,"current",IX)) Q:IX=""  D  Q:DONE  ;will end on first timeout found
 . S ALLREC=^XTMP(HMPALLOQ,"current",IX),STATUS=$P(ALLREC,U,4)
 . I STATUS="" D TIMEOUT(IX,ALLREC) Q
 . I STATUS="timeout" D UPDTMOUT(IX,ALLREC) Q  ;force timeout on request
 . I STATUS="timeoutError" D LOCKDOWN S DONE=1 Q
 . I STATUS="complete"!(STATUS="rejected") Q  ;only process if first
 . I STATUS="replay" D KILLALOC(HMPALLOQ,IX) Q
 . I STATUS="reduce" Q:$G(HMPFLIM)=0  D KILLALOC(HMPALLOQ,IX),ALLOC(HMPALLOQ,$P(ALLREC,U,6),$P(ALLREC,U,2),$P(ALLREC,U,3)) S DONE=1 Q  ;cannot reduce if not returning new allocation
 ;now create new allocation
 I 'DONE S END="",SIXT="",LAST=HMPFLAST F  S SIXT=$O(^XTMP(HMPALLOQ,"byRecord",SIXT)) Q:SIXT=""  D  Q:DONE
 . S END=$P(^XTMP(HMPALLOQ,"byRecord",SIXT),U,1)
 . S SIX=$$SPLITSIX(SIXT,TENBILL)
 . I SIX=HMPFLAST S LAST=END Q  ;Start matches last update
 . I SIX=LAST S LAST=END Q  ;start matches previous end
 . D ALLOC(HMPALLOQ,HMPALLSZ,LAST,SIX)   ;gap between last end/lastupdate and start so fill
 I 'DONE D ALLOC(HMPALLOQ,HMPALLSZ,LAST) ;allocate from last update
 L -^XTMP(HMPALLOQ)
 Q
LASTCHK ;Rollover date if complete
 N ZQ,ZQN
 S ZQ="HMPFS~"_HMPFHMP_"~"_$P(HMPFLAST,"-")
 S ZQN=$O(^XTMP(ZQ)) Q:ZQN=""  Q:$P(ZQ,"~",1,2)'=$P(ZQN,"~",1,2)  Q:'$P(ZQN,"~",3)
 I $P(HMPFLAST,"-",1)=$P(ZQ,"~",3),$P(HMPFLAST,"-",2)=$O(^XTMP(ZQ,99999999999),-1) S HMPFLAST=$P(ZQN,"~",3)_"-0"
 Q
ALLOC(HMPALLOQ,SIZE,PREV,NEXT,TIMECNT) ;determine actual allocation
 I $G(HMPFLIM)=0 Q  ;never return an allocation if HMPFLIM (max) = 0
 N ASIZE,ZNEXT,ZPREV,ZEND,END,ZQ,HMPFSTRM
 S ZQ="HMPFS~"_HMPFHMP_"~"_$P(HMPFLAST,"-")
 S ZNEXT=$P($G(NEXT,"-"_999999999),"-",2),ZPREV=$P(PREV,"-",2)
 I ZNEXT'>ZPREV Q  ;can't allocate if to < from
 S ZEND=$O(^XTMP(ZQ,999999999),-1) ;check current end of queue
 I PREV=HMPFLAST,ZNEXT=999999999 I ZPREV=ZEND!(ZEND="") D  Q:DONE  ;Previous = last updated and end of queue and all complete so check if next day
 . S DONE=1 I $$DT^XLFDT>$P(HMPFLAST,"-",1) D
 ..  S HMPFSTRM=ZQ D NXTSTRM^HMPDJFSG
 ..  Q:HMPFSTRM=""  Q:$O(^XTMP(HMPALLOQ,"byRecord",""))'=""  ;only do this if all allocations complete
 ..  S DONE=0,ZQ=HMPFSTRM,(PREV,HMPFLAST)=HMPFDT_"-"_0,ZPREV=0,ZNEXT=SIZE,ZEND=$O(^XTMP(ZQ,999999999),-1)
 ..  ;Must now update last updated to prevent duplicates
 ..  D LASTUPD(HMPFHMP,HMPFLAST)
 S ASIZE=ZNEXT-ZPREV I ASIZE>SIZE S ASIZE=SIZE ; reduce allocation size to actual
 S:'ZEND ZEND=0
 I $P(PREV,"-",1)=$P(HMPFLAST,"-"),$P(PREV,"-",2)'<ZEND Q  ;last after end of queue - Can't allocate
 S END=$P(PREV,"-",2)+ASIZE
 I END>ZEND S END=ZEND ;reduce end of allocation to physical end of queue if overlap
 S HMPALEND=END
 S END=($P(PREV,"-",1)_"-"_END)
 I END=PREV Q  ;nothing new to return so do not create new token
 S DONE=1 ; Moved here to only mark done when new allocation allocated
 S HMPALLTK=$$NEWTOKEN(HMPALLOQ,HMPFLAST)
 S ^XTMP(HMPALLOQ,"current",HMPALLTK)=$H_U_PREV_U_END_U_U_+$G(TIMECNT)
 S ^XTMP(HMPALLOQ,"byRecord",$$PACKSIX(PREV,TENBILL))=END_U_HMPALLTK
 S HMPFDT=$P(PREV,"-"),HMPFSEQ=+$P(PREV,"-",2)
 Q
LOGERR(LOQ,IX,MESS) ;Log errors to HMP error log
 N B,B2,C,H,J,X,TXT
 S C=1,TXT(C)=" Allocation error: "_MESS_", in ALLOCATION: "_$G(IX)
 I $G(LOQ)'="",$G(IX)'="" D
 . S J=$G(^XTMP(LOQ,"current",IX))
 . S C=C+1,TXT(C)=" Allocation details: "_J
 . S H=$P(LOQ,"~",2)
 . S B=$P(J,"^",3) Q:B=""  Q:'$P(B,"-",1)  S B2=$P(B,"-",2) Q:'B2  Q:'$D(^XTMP("HMPFS~"_H_"~"_$P(B,"-",1)))
 . I '$D(^XTMP("HMPFS~"_$p(LOQ,"~",2)_"~"_$P(B,"-",1),B2)) S B2=$O(^XTMP("HMPFS~"_H_"~"_$P(B,"-",1),B2)) Q:'B2
 . S C=C+1,TXT(C)=" Queue data: ("_B2_") "_$G(^XTMP("HMPFS~"_H_"~"_$P(B,"-",1),B2))
 S C=C+1,TXT(C)=" "  ; blank line following word-processing text, $$NWNTRY^HMPLOG appends to end
 S J=$$NWNTRY^HMPLOG($$NOW^XLFDT,"",.TXT)  ; log event
 Q
NEWTOKEN(HMPALLOQ,HMPFLAST) ;create new token
 N LAST
 S LAST=^XTMP(HMPALLOQ,"last")+1 I LAST>TENBILL S LAST=1
 S ^XTMP(HMPALLOQ,"last")=LAST
 Q $P(HMPFLAST,"-",1)*TENBILL+LAST
 ;
TIMEOUT(IX,ALLREC) ;check timeout
 N RDTIME,RTIME
 S RDTIME=$P(ALLREC,U,1),RTIME=$P(RDTIME,",",2)
 I (NOW-RTIME)>TIMEOUT!(NOW>TIMEOUT&((NOW-RTIME)<0)) D UPDTMOUT(IX,ALLREC)
 Q
UPDTMOUT(IX,ALLREC) ;Update allocation for timeout
 ;timeout kill processsing here
 I $G(HMPFLIM)=0 Q  ;Can't update allocations if max=0
 N HMPALLSZ
 S DONE=1 ;prevent further processing as this will create new allocation
 S HMPALLSZ=$P($P(ALLREC,U,3),"-",2)-$P($P(ALLREC,U,2),"-",2)
 I HMPALLSZ>1 S HMPALLSZ=HMPALLSZ/2\1 D KILLALOC(HMPALLOQ,IX),ALLOC(HMPALLOQ,HMPALLSZ,$P(ALLREC,U,2),$P(ALLREC,U,3)) Q  ;Halve size, remove and reallocate
 I $P(ALLREC,U,5)<$$TIMOUTLM(HMPFHMP) D KILLALOC(HMPALLOQ,IX),ALLOC(HMPALLOQ,1,$P(ALLREC,U,2),$P(ALLREC,U,3),$P(ALLREC,U,5)+1) Q  ;Redo but increase timeout count
 D UPDALLOC(HMPALLOQ,IX,"timeoutError")
 Q
CLEARBLK ;remove allocation lockdown
 N IX,ALLREC
 L +^XTMP(HMPALLOQ):5 E  Q
 S IX="" F  S IX=$O(^XTMP(HMPALLOQ,"current",IX)) Q:IX=""  D   ;reset any timeouts
 . S ALLREC=^XTMP(HMPALLOQ,"current",IX)
 . S:$P(ALLREC,U,4)="timeoutError" $P(ALLREC,U,4)=""
 . S $P(ALLREC,U,5)=0
 . S ^XTMP(HMPALLOQ,"current",IX)=ALLREC
 D LOGERR(HMPALLOQ,"","ALLOCATION LOCKDOWN CLEARED ")
 K ^XTMP(HMPALLOQ,"blocked")
 D ERRLIST
 L -^XTMP(HMPALLOQ)
 Q
GETLAST() ;get last update from file
 N IEN,X
 S IEN=$O(^HMP(800000,"B",HMPFHMP,0)) Q:'IEN ""
 S X=$P(^HMP(800000,IEN,0),"^",2)
 I X="" S X=$$HTFM^XLFDT($H-8)_"-"_0 ;cater for what should be impossible situation
 Q X
 ;
GETIMOUT(HMPFHMP) ;get configured timeout (default to 300 (seconds) if not found)
 N IEN,X
 S IEN=$O(^HMP(800000,"B",HMPFHMP,0)) Q:'IEN 300
 S X=$P(^HMP(800000,IEN,0),"^",8) S:'X X=300
 Q X
 ;
TIMOUTLM(HMPFHMP) ;get configured timeout limit (default to 5)
 N IEN,X
 S IEN=$O(^HMP(800000,"B",HMPFHMP,0)) Q:'IEN 5
 S X=$P(^HMP(800000,IEN,0),"^",9) S:'X X=5
 Q X
 ;
KILLALOC(HMPALLOQ,IX) ;delete allocation
 Q:'$D(^XTMP(HMPALLOQ,"current",IX))
 N SIXT
 S SIXT=$$PACKSIX($P(^XTMP(HMPALLOQ,"current",IX),U,2),TENBILL)
 K ^XTMP(HMPALLOQ,"current",IX),^XTMP(HMPALLOQ,"byRecord",SIXT)
 Q
LASTUPD(HMPSRV,LASTUPD) ;save last update
 ; TODO: change this to use Fileman call
 Q:LASTUPD["^"  ;Historic code - cannot trace back reason - safer to leave
 N IEN,CURRUPD,REPEAT
 S IEN=$O(^HMP(800000,"B",HMPSRV,0)) I 'IEN D  Q
 . N J,TXT
 . S TXT(1)="Unknown server "_HMPSRV_" in LASTUPD",TXT(2)=" "
 . S J=$$NWNTRY^HMPLOG($$NOW^XLFDT,"",.TXT)
 S CURRUPD=$P(^HMP(800000,IEN,0),"^",2),REPEAT=$P(^HMP(800000,IEN,0),"^",4)
 I LASTUPD=CURRUPD S $P(^HMP(800000,IEN,0),"^",4)=REPEAT+1 QUIT
 S $P(^HMP(800000,IEN,0),"^",2)=LASTUPD,$P(^HMP(800000,IEN,0),"^",4)=0
 Q
