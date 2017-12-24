HMPDJFSG ;SLC/KCM,ASMR/RRB,CPC,JD,ASF,CK,CPC -- GET for Extract and Freshness Stream;Aug 11, 2016 10:35:07
 ;;2.0;ENTERPRISE HEALTH MANAGEMENT PLATFORM;**1,2,3,4**;May 15, 2016;Build 13
 ;Per VA Directive 6402, this routine should not be modified.
 ;
 ; US3907 - Allow for jobId and rootJobId to be retrieved from ^XTMP. JD 1/20/15
 ; DE2818 - SQA findings. Newed ERRCNT in BLDSERR+2. RRB 10/24/2015
 ; DE3869 - Remove the freshness stream entries with undefined DFNs. JD 3/4/16
 ; US18104 - introduction of allocation mode CPC 1/24/17
 ; US18005 - Add passthrough fields 2017-01-12 AFS/CPC
 ;
 Q
 ; --- retrieve updates for an HMP server's subscriptions
 ;
GETSUB(HMPFRSP,ARGS) ; retrieve items from stream
 ; GET from: /hmp/subscription/{hmpSrvId}/{last}?limit={limit}
 ; ARGS("lastUpdate") : date-seq of last item retrieved (ex. 3131206-27) - DEPRECATED US18104
 ; ARGS("max")  : maximum number of items to return (default 99999) *S68-JCH*
 ; ARGS("maxSize"): approximate number bytes to return *S68-JCH*
 ; ARGS("allocationSize") :requested size of allocation
 ; ARGS("allocationToken") :returned token
 ; ARGS("allocationStatus") :status of allocation
 ;
 ; HMPFSYS : the id (hash) of the VistA system
 ; HMPFHMP : the name of the HMP server 
 ; HMPFSEQ : final sequence (becomes next LASTSEQ)
 ; HMPFIDX : index to iterate from LASTSEQ to final sequence
 ; HMPFLAST: used to clean up extracts prior to this
 ; HMPFSTRM: the freshness stream (HMPFS~hmpSrvId~fmDate) 
 ;
 K ^TMP("HMPF",$J)
 N HMPFSYS,HMPFSTRM,HMPFLAST,HMPFDT,HMPFLIM,HMPFMAX,HMPFSIZE,HMPCLFLG
 N HMPFSEQ,HMPFIDX,HMPFCNT,SNODE,STYPE,HMPFERR,HMPDEL,HMPERR,HMPSTGET,HMPLITEM ;*S68-JCH*,DE3502
 N HMPALLSZ,HMPALLTK,HMPALLST,HMPRMODE,HMPALEND,HMPALLOQ
 S HMPFRSP=$NA(^TMP("HMPF",$J))
 ;Next line added US6734 - Make sure OPD metastamp data has been completed before fetching.
 I '$$OPD^HMPMETA(HMPFHMP) S @HMPFRSP@(1)="{""warning"":""Staging is not complete yet!""}" Q
 ;
 S HMPFSYS=$$SYS^HMPUTILS
 S HMPFHMP("ien")=$O(^HMP(800000,"B",HMPFHMP,0))
 S HMPFDT=$P($G(ARGS("lastUpdate")),"-")
 S HMPFSEQ=+$P($G(ARGS("lastUpdate")),"-",2)
 S HMPSTGET=$G(ARGS("getStatus"))
 S HMPLITEM="" ;DE3502 initialise tracking of last item type
 S HMPALLOQ="HMPFA~"_HMPFHMP
 S HMPRMODE=0 I HMPFDT="" S HMPRMODE=1 ;US18104 If in reservation mode last update not passed
 I HMPFDT'="",$D(^XTMP(HMPALLOQ)) S @HMPFRSP@(.5)=$$APIHDR^HMPDJFS1(0,ARGS("lastUpdate"))_"],""error"":{""message"":""Last update not allowed in multiple mode""}"_"}}" Q  ;US18433
 D SETLIMIT(.ARGS) ; set HMPFLIM, HMPFMAX, HMPFSIZE;*S68-PJH*
 S HMPFLIM=$G(ARGS("max"),99999)
 D INIT^HMPDJFSR ;set up reservation variables and update lastupdate
 S HMPFSTRM="HMPFS~"_HMPFHMP_"~"_HMPFDT ; stream identifier
 I HMPRMODE,HMPALLTK="" Q:$D(HMPERR)  D NOOP(HMPFLAST) Q
 I '$D(^XTMP(HMPFSTRM,"job",$J)) S ^XTMP(HMPFSTRM,"job",$J,"start")=$H
 S ^XTMP(HMPFSTRM,"job",$J)=$H ; record connection info
 I '$$VERMATCH^HMPDJFS1(HMPFHMP("ien"),$G(ARGS("extractSchema"))) D NOOP(HMPFLAST) Q
 S HMPFCNT=0,HMPFIDX=HMPFSEQ
 ;Loops stream contents and move to the next stream on completion and continue but only if max conditions still unmet
 ; check size constraint, check number of records constraint and in multi-poller mode (HMPRMODE) check end point for allocation
 ; after moving to new stream finish if in multi-poller mode as allocation cannot cross streams
 F  D  Q:HMPFSIZE'<HMPFMAX  Q:HMPFCNT'<HMPFLIM  Q:(HMPRMODE&(+$G(HMPALEND)&(HMPFIDX'<$G(HMPALEND))))  D NXTSTRM Q:HMPFSTRM=""  I HMPRMODE,+$G(HMPALEND) Q:(HMPFIDX=0)  ;*S68-JCH*
 . F  S HMPFIDX=$O(^XTMP(HMPFSTRM,HMPFIDX)) Q:'HMPFIDX  D  Q:HMPFCNT'<HMPFLIM  I HMPRMODE,+$G(HMPALEND) Q:HMPFIDX'<HMPALEND
 ..  S SNODE=^XTMP(HMPFSTRM,HMPFIDX),STYPE=$P(SNODE,U,2)
 ..  K FILTER("freshnessDateTime")
 ..  K ARGS("hmp-fst") I $P(SNODE,U,4)="@" S ARGS("hmp-fst")=$P(SNODE,U,5)
 ..  S $P(^XTMP(HMPFSTRM,HMPFIDX),U,6)=$P($H,",",2) ;timestamp when sent
 ..  I STYPE="syncNoop" Q  ;skip, patient was unsubscribed
 ..  I STYPE="syncDomain" D DOMITMS Q  ;add multiple extract items
 ..  S HMPFSEQ=HMPFIDX
 ..  I STYPE="syncError" D SYNCERR(SNODE,.HMPERR) S HMPLITEM="SYNC" Q  ;US18180 treat errors as sync as they close object
 ..  I STYPE="syncStart" D SYNCSTRT(SNODE) S HMPLITEM="SYNC" Q  ; begin initial extraction ;DE3502
 ..  I STYPE="syncMeta" D SYNCMETA(SNODE) S HMPLITEM="SYNC" Q  ; US11019 - Build replacement syncstart ;DE3502
 ..  I STYPE="syncDone" D SYNCDONE(SNODE) S HMPLITEM="SYNC" Q  ; end of initial extraction ;DE3502
 ..  D FRESHITM(SNODE,.HMPDEL,.HMPERR) S:'$D(HMPERR) HMPLITEM="FRESH" ; otherwise, freshness item ;DE3502
 Q:$G(HMPFERR)
 D FINISH(.HMPDEL,.HMPERR)
 ;Check if mail message is required -US8228
 D CHECK^HMPUTILS(HMPFHMP) ;US8228
 Q
DOMITMS ;loop thru extract items, OFFSET is last sent
 ;expects HMPFSTRM,HMPFIDX,HMPFHMP,HMPFSYS
 ;changes HMPFSEQ,HMPFCNT,HMPFSIZE as each item added ;*S68-JCH*
 N X,OFFSET,DFN,PIDS,DOMAIN,TASK,BATCH,COUNT,ITEMNUM,DOMSIZE,SECSIZE
 S X=^XTMP(HMPFSTRM,HMPFIDX),DFN=$P(X,U),X=$P(X,U,3)
 S PIDS=$S(DFN:$$PIDS^HMPDJFS(DFN),1:"")
 S DOMAIN=$P(X,":") ;domain{#sectionNumber}
 S TASK=$P(X,":",2) ;task number in ^XTMP
 S COUNT=$P(X,":",3) ;count in this section
 S DOMSIZE=$P(X,":",4) ;estimated total for the domain
 S SECSIZE=$P(X,":",5) ;section size (for operational)
 S BATCH="HMPFX~"_HMPFHMP_"~"_DFN ;extract node in ^XTMP
 S OFFSET=COUNT-(HMPFIDX-HMPFSEQ)
 F  S OFFSET=$O(^XTMP(BATCH,TASK,DOMAIN,OFFSET)) Q:'OFFSET  D  Q:HMPFCNT'<HMPFLIM  I HMPRMODE,+$G(HMPALEND) Q:HMPFSEQ'<HMPALEND
 . S HMPFSEQ=HMPFSEQ+1 ;increment the sequence number in the stream
 . S HMPFSIZE=$$INCITEM($P(DOMAIN,"#")) ;*S68-JCH*
 . S ITEMNUM=OFFSET+($P(DOMAIN,"#",2)*SECSIZE)
 . M ^TMP("HMPF",$J,HMPFCNT)=^XTMP(BATCH,TASK,DOMAIN,OFFSET)
 . S ^TMP("HMPF",$J,HMPFCNT,.3)=$$WRAPPER(DOMAIN,PIDS,$S('COUNT:0,1:ITEMNUM),+DOMSIZE,1)  ;*S68-JCH*
 . S HMPLITEM="SYNC",HMPCLFLG=0 ;DE3502
 Q
NXTSTRM ; Reset variables for next date in this HMP stream
 ; from GETSUB expects HMPFSTRM,HMPFDT,HMPFIDX
 ; HMPFSTRM set to "" if no next stream
 ; HMPFIDX  set to 0 if next stream, or left as is
 ; HMPFDT   set to last date actually used
 N NEXTDT,DONE
 S NEXTDT=HMPFDT,DONE=0
 F  D  Q:DONE
 . S NEXTDT=$$FMADD^XLFDT(NEXTDT,1)
 . I NEXTDT>$$DT^XLFDT S HMPFSTRM="" S DONE=1 Q
 . S $P(HMPFSTRM,"~",3)=NEXTDT
 . I '+$O(^XTMP(HMPFSTRM,0)) Q  ; nothing here, try next date
 . S HMPFDT=NEXTDT,HMPFIDX=0,HMPFSEQ=0,DONE=1
 Q
SETLIMIT(ARGS) ; sets HMPFLIM, HMPFMAX, HMPFSIZE variables *S68-JCH*
 I $G(ARGS("maxSize")) D  Q
 . S HMPFLIM="s"
 . S HMPFMAX=ARGS("maxSize")
 . D GETLST^XPAR(.HMPFSIZE,"PKG","HMP DOMAIN SIZES","I")
 . S HMPFSIZE=0
 ; otherwise
 S HMPFLIM="c"
 S HMPFMAX=$G(ARGS("max"),99999)
 S HMPFSIZE=0
 Q
INCITEM(DOMAIN) ; increment counters as item added *S68-JCH*
 S HMPFCNT=HMPFCNT+1
 I HMPFLIM="s" Q HMPFSIZE+$G(HMPFSIZE(DOMAIN),1200)
 I HMPFLIM="c" Q HMPFCNT
 Q 0
FINISH(HMPDEL,HMPERR) ;reset the FIRST object delimiter, add header and tail
 ; expects HMPFCNT,HMPFDT,HMPFSEQ,HMPFHMP,HMPFLAST
 N CLOSE,I,START,TEXT,UID,X,II
 S X=$G(^TMP("HMPF",$J,1,.3))
 I $E(X,1,2)="}," S X=$E(X,3,$L(X)),^TMP("HMPF",$J,1,.3)=X
 S ^TMP("HMPF",$J,.5)=$$APIHDR^HMPDJFS1(HMPFCNT,HMPFDT_"-"_HMPFSEQ)
 I $D(HMPERR) D
 .S CLOSE=$S(HMPFCNT&($G(HMPLITEM)="SYNC"):"},",HMPFCNT:",",1:""),START=1 ;us18180 don't close if previous was freshness
 .S HMPFCNT=HMPFCNT+1,^TMP("HMPF",$J,HMPFCNT)=CLOSE_"{""error"":["
 .S I=0 F  S I=$O(HMPERR(I)) Q:I'>0  D
 ..S TEXT=HMPERR(I)
 ..S HMPFCNT=HMPFCNT+1,^TMP("HMPF",$J,HMPFCNT)=$S(START:"",1:",")_TEXT S START=0
 .S HMPFCNT=HMPFCNT+1,^TMP("HMPF",$J,HMPFCNT)="]}" ;US18180 close object
 .S HMPCLFLG=1 ;US18180 Mark object as closed
 ; operational sync item or patient
 ; Check for closing flag & HMPFCNT and if it doesn't exist add a closing brace, always close array
 S ^TMP("HMPF",$J,HMPFCNT+1)=$S(HMPFCNT&('$G(HMPCLFLG)):"}",1:"")_"]",HMPFCNT=HMPFCNT+1
 I $G(HMPSTGET)="true" D  ; true if "getStatus" argument passed in
 . S HMPFCNT=HMPFCNT+1,^TMP("HMPF",$J,HMPFCNT)=",""syncStatii"":[",START=1
 . S I=0 F  S I=$O(^HMP(800000,I)) Q:+I=0  D
 .. I $P($G(^HMP(800000,I,0)),"^",1)=HMPFHMP D
 ... S II=0 F  S II=$O(^HMP(800000,I,1,II)) Q:+II=0  D
 .... S TEXT="{""pid"":"_II_",""status"":"_$P(^HMP(800000,I,1,II,0),"^",2)_"}"
 .... S HMPFCNT=HMPFCNT+1,^TMP("HMPF",$J,HMPFCNT)=$S(START:"",1:",")_TEXT S START=0
 . S HMPFCNT=HMPFCNT+1,^TMP("HMPF",$J,HMPFCNT)="]"
 S ^TMP("HMPF",$J,HMPFCNT+1)="}}"
 ; remove any ^XTMP nodes that have been successfully sent based on LAST
 N DATE,SEQ,LASTDT,LASTSEQ,STRM,LSTRM,RSTRM
 S LASTDT=+$P(HMPFLAST,"-"),LASTSEQ=+$P(HMPFLAST,"-",2)
 S RSTRM="HMPFS~"_HMPFHMP_"~",LSTRM=$L(RSTRM),STRM=RSTRM
 F  S STRM=$O(^XTMP(STRM)) Q:'$L(STRM)  Q:$E(STRM,1,LSTRM)'=RSTRM  D
 . S DATE=$P(STRM,"~",3) Q:DATE>LASTDT
 . S SEQ=0 F  S SEQ=$O(^XTMP(STRM,"tidy",SEQ)) Q:'SEQ  Q:(DATE=LASTDT)&(SEQ>LASTSEQ)  D TIDYX(STRM,SEQ)
 Q
TIDYX(STREAM,SEQ) ; clean up extracts after they have been retrieved
 ; from FINISH ;DE6047 make resilient
 N BATCH,DOMAIN,TASK
 Q:$G(STREAM)=""  Q:$G(SEQ)=""
 S BATCH=$G(^XTMP(STREAM,"tidy",SEQ,"batch"))
 S DOMAIN=$G(^XTMP(STREAM,"tidy",SEQ,"domain"))
 S TASK=$G(^XTMP(STREAM,"tidy",SEQ,"task"))
 I BATCH=""!(DOMAIN="")!(TASK="") D
 . N C,J,TXT
 . S C=1,TXT(C)=" Freshness Stream: "_STREAM_", missing TIDY elements in SEQ: "_SEQ
 . S C=C+1,TXT(C)=" "  ; blank line following word-processing text, $$NWNTRY^HMPLOG appends to end
 . S J=$$NWNTRY^HMPLOG($$NOW^XLFDT,"M",.TXT)  ; log event as type "missing"
 I BATCH'="" D
 . I DOMAIN="<done>" I '$O(^XTMP(BATCH,0)) K ^XTMP(BATCH) Q  ;Prevent cleardown if another request already running DE7406
 . I TASK'="",DOMAIN'="" K ^XTMP(BATCH,TASK,DOMAIN)
 K ^XTMP(STREAM,"tidy",SEQ)
 Q
SYNCSTRT(SEQNODE) ;Build syncStart object with demograhics
 ;expects HMPFSYS, HMPFHMP, HMPFCNT, HMPFSIZE *S68-JCH*
 S HMPFSIZE=$$INCITEM("patient")  ;*S68-JCH*
 N DFN,FILTER,DFN,WRAP
 S DFN=$P($P(SEQNODE,U,3),"~",3) ; HMPFX~hmpSrvId~dfn
 I DFN D
 . N RSLT ;cpc 2015/10/01
 . S FILTER("patientId")=DFN,FILTER("domain")="patient"
 . D GET^HMPDJ(.RSLT,.FILTER)
 . M ^TMP("HMPF",$J,HMPFCNT)=^TMP("HMP",$J,1)
 S ^TMP("HMPF",$J,HMPFCNT,.3)=$$WRAPPER("syncStart",$$PIDS^HMPDJFS(DFN),$S(DFN:1,1:-1),$S(DFN:1,1:-1)) ; for OPD there is no object, so 4th argument is 0
 Q
SYNCDONE(SEQNODE) ; Build syncStatus object and stick in ^TMP
 ;expects: HMPFSYS, HMPFCNT, HMPFHMP, HMPFSIZE  *S68-JCH*
 N HMPBATCH,DFN,STS,STSJSON,X,ERR
 S HMPBATCH=$P(SEQNODE,U,3) ; HMPFX~hmpSrvId~dfn
 S DFN=$P(HMPBATCH,"~",3)
 S STS("uid")="urn:va:syncStatus:"_HMPFSYS_":"_DFN
 S STS("initialized")="true"
 I DFN S STS("localId")=DFN
 S X="" F  S X=$O(^XTMP(HMPBATCH,0,"count",X)) Q:'$L(X)  D
 . S STS("domainTotals",X)=^XTMP(HMPBATCH,0,"count",X)
 ;If resubscribing a patient, just send demographics
 I DFN'="OPD",$D(^HMP(800000,"AITEM",DFN)) D
 . N HMP99
 . S HMP99=""
 . F  S HMP99=$O(STS("domainTotals",HMP99)) Q:'HMP99  I HMP99'="patient" S STS("domainTotals",HMP99)=0 ;Reset all domain counts to zero except for demographics
 D ENCODE^HMPJSON("STS","STSJSON","ERR")
 I $D(ERR) S $EC=",UJSON encode error," Q
 S HMPFSIZE=$$INCITEM("syncstatus") ; *S68-JCH*
 M ^TMP("HMPF",$J,HMPFCNT)=STSJSON
 S ^TMP("HMPF",$J,HMPFCNT,.3)=$$WRAPPER("syncStatus",$$PIDS^HMPDJFS(DFN),1,1)
 Q
SYNCMETA(SNODE) ;US11019 Build NEW syncStart object
 ;expects HMPFSYS, HMPFHMP, HMPFCNT ;need to rebuild SNODE because WRAPPER expects it to fall in
 N BATCH,DFN,WRAP,METADOM
 S DFN=$P(SNODE,U,1)
 S METADOM=$P(SNODE,U,3)
 S BATCH="HMPFX~"_HMPFHMP_"~"_DFN
 S $P(SNODE,U,3)=BATCH
 S HMPFSIZE=$$INCITEM("syncmeta") ;need to increment count
 S ^TMP("HMPF",$J,HMPFCNT,.3)=$$WRAPPER("syncStart"_"#"_METADOM,$$PIDS^HMPDJFS(DFN),$S(DFN:1,1:-1),$S(DFN:1,1:-1))
 S ^TMP("HMPF",$J,HMPFCNT,1)="null" ;always null object with this record
 S HMPCLFLG=0 ; DE3502
 Q
SYNCERR(SNODE,HMPERR) ;
 N BATCH,CNT,DFN,NUM,OFFSET,PIDS,TASK,TOTAL,X
 S DFN=$P(SNODE,U),X=$P(SNODE,U,3)
 S PIDS=$$PIDS^HMPDJFS(DFN)
 S TASK=$P(X,":",2),TOTAL=$P(X,":",4)
 S BATCH="HMPFX~"_HMPFHMP_"~"_DFN ; extract node in ^XTMP
 S CNT=$O(HMPERR(""),-1)
 S NUM=0 F  S NUM=$O(^XTMP(BATCH,TASK,"error",NUM)) Q:NUM'>0  D
 .S CNT=CNT+1 S HMPERR(CNT)=$G(^XTMP(BATCH,TASK,"error",NUM,1))
 Q
FRESHITM(SEQNODE,DELETE,ERROR) ;Get freshness item and stick in ^TMP
 ; expects HMPFSYS, HMPFHMP
 N ACT,DFN,DOMAIN,ECNT,FILTER,ID,RSLT,UID,HMP97,HMPI,WRAP,HMPPAT7,HMPPAT8
 S FILTER("noHead")=1
 S DFN=$P(SEQNODE,U),DOMAIN=$P(SEQNODE,U,2),ID=$P(SEQNODE,U,3),ACT=$P(SEQNODE,U,4)
 ;Next 2 IFs added to prevent <UNDEF> in LKUP^HMPDJ00. JD - 3/4/16. DE3869
 ;HMPFSTRM and HMPFIDX are defined in the GETSUB section above.
 ;For "pt-select", which is an operational data domain, ID=patient IEN and DFN="OPD". For ptient domains ID=DFN
 ;We want the checks to be for all patient domains and pt-select of the operational data domain
 ;Kill the freshness stream entry with the bad patient IEN
 I ACT'="@",DFN=+DFN,'$D(^DPT(DFN,0)) K ^XTMP(HMPFSTRM,HMPFIDX) Q  ;For patient domains
 I ACT'="@",DOMAIN="pt-select",ID=+ID,'$D(^DPT(ID,0)) K ^XTMP(HMPFSTRM,HMPFIDX) Q
 ;
 ;Create a phantom "patient" if visit is the domain
 I DOMAIN="visit" D
 .S HMPPAT7=HMPFIDX_".99",HMPPAT8=^XTMP(HMPFSTRM,HMPFIDX),$P(HMPPAT8,U,2)="patient" ;BL;DE2280
 .S ^XTMP(HMPFSTRM,HMPPAT7)=HMPPAT8
 ;==JD END
 D  ; DE3691, add date/time with seconds to FILTER parameters, Feb 29 2016 ;moved 2/9/2017 so always available
 . N DAY,SECS,TM S SECS=$P($G(^XTMP(HMPFSTRM,HMPFIDX)),U,5),DAY=$P(HMPFSTRM,"~",3)
 . Q:('DAY)!('$L(SECS))  ; must have date and seconds, could be zero seconds (midnight)
 . S TM=$S(SECS:SECS#60/100+(SECS#3600\60)/100+(SECS\3600)/100,SECS=0:".000001",1:"")  ; if zero (midnight) push to 1 second after
 . Q:'$L(TM)  ; couldn't compute time
 . S FILTER("freshnessDateTime")=DAY+TM
 I ACT'="@" D
 . S FILTER("id")=ID
 . S FILTER("domain")=DOMAIN
 . I DFN="OPD" D GET^HMPEF(.RSLT,.FILTER)
 . I +DFN>0 D
 ..  S FILTER("patientId")=DFN
 ..  D GET^HMPDJ(.RSLT,.FILTER)
 I '$D(ACT) S ACT=$P(SEQNODE,U,4)  ;BL;DE7719 ACT becomes undefined
 I ACT'="@",$L($G(^TMP("HMP",$J,"error")))>0 D BLDSERR(DFN,.ERROR)  Q
 I '$D(^TMP("HMP",$J,1)) S ACT="@"
 I ACT="@" D
 . S UID=$$SETUID^HMPUTILS(DOMAIN,$S(+DFN>0:DFN,1:""),ID)
 . S HMP97=UID
 . K ^TMP("HMP",$J) S ^TMP("HMP",$J,1)="" ; Need to dummy this up or it will never get set later
 ;Add syncstart, data and syncstatus to JSON for unsolicited updates - US4588 & US3682
 I (DOMAIN="pt-select")!(DOMAIN="user")!(DOMAIN["asu-")!(DOMAIN="doc-def")!(DFN=+DFN) D  Q
 .D ADHOC^HMPUTIL1(DOMAIN,.HMPFCNT,DFN)
 .I $P(HMPFIDX,".",2)=99 K ^XTMP(HMPFSTRM,HMPFIDX) ;Remove the phantom "patient"; JD
 .S HMPLITEM="FRESH" ;DE3502
 ;
 S WRAP=$$WRAPPER(DOMAIN,$$PIDS^HMPDJFS(DFN),1,1) ;N.B. this updates the .3 node on this HMPFCNT
 F HMPI=1:1 Q:'$D(^TMP("HMP",$J,HMPI))  D
 . S HMPFCNT=HMPFCNT+1
 . M ^TMP("HMPF",$J,HMPFCNT)=^TMP("HMP",$J,HMPI)
 . I HMPLITEM="SYNC" S HMPLITEM="FRESH" I WRAP="," S ^TMP("HMPF",$J,HMPFCNT,.3)="}," Q  ;DE3502 add closing
 . S ^TMP("HMPF",$J,HMPFCNT,.3)=WRAP
 Q
BLDSERR(DFN,ERROR,ID,DOMAIN) ;Create syncError object in ERRJSON
 ;expects: HMPBATCH, HMPFSYS, HMPFZTSK
 N COUNT,ERRVAL,ERROBJ,ERR,ERRCNT,ERRMSG,SYNCERR
 M ERRVAL=^TMP("HMP",$J,"error")
 I $G(ERRVAL)="" Q
 S ERRVAL="{"_ERRVAL_"}"
 D DECODE^HMPJSON("ERRVAL","ERROBJ","ERR")
 I $D(ERR) S $EC=",UJSON decode error,"
 S ERRMSG=ERROBJ("error","message")
 Q:'$L(ERRMSG)
 S SYNCERR("uid")="urn:va:"_$S($G(DOMAIN)'="":DOMAIN,1:"syncError")_":"_HMPFSYS_":"_DFN_":"_$S($G(ID)'="":ID,1:"FRESHNESS") ;include proper id if available
 S SYNCERR("collection")=$G(DOMAIN)
 S SYNCERR("error")=ERRMSG
 D ENCODE^HMPJSON("SYNCERR","ERRJSON","ERR") I $D(ERR) S $EC=",UJSON encode error," Q
 S COUNT=$O(ERROR(""),-1)  ;*BEGIN*S68-JCH*
 S ERRCNT=0 F  S ERRCNT=$O(ERRJSON(ERRCNT)) Q:ERRCNT'>0  D
 . S COUNT=COUNT+1 M ERROR(COUNT)=ERRJSON(ERRCNT)  ;*END*S68-JCH*
 Q
WRAPPER(DOMAIN,PIDS,OFFSET,DOMSIZE,FROMXTR) ;return JSON wrapper for each item *S68-JCH*
 ;add object tag if extract total not zero or total passed as -1
 ;seq and total tags only added if non-zero
 ;DOMAIN = "syncStart"_"#"_METADOM if this is being called from syncMeta
 N X,Y,FIRST,THISBTCH,HMPSVERS ;US11019
 ;Ensure that X exists
 S X=""
 S THISBTCH=$P(SNODE,U,3) ;US18005
 S HMPSVERS=$G(^XTMP(THISBTCH,"HMPSVERS")) ;US11019 If HMPSVERS=0 then running in previous mode
 ;S HMPSTMP=$G(^XTMP(THISBTCH,"HMPSTMP")) ;PJH - THIS USED ONLY FOR OPD COMPILE IN PRIOR VERSION - NEEDS REMOVING US6734
 ;This was working for operational data, not patient data
 ;DFN will be OPD if this is operational data
 I DFN="OPD" D
 . S:$P($G(DOMAIN),"#")'="syncStart" X="},{""collection"":"""_$P(DOMAIN,"#")_""""_PIDS ;US11019
 E  S X="},{""collection"":"""_$P(DOMAIN,"#")_""""_PIDS  ; If ONLY patient data exists
 I HMPLITEM="FRESH" I $E(X)="}" S X=$E(X,2,$L(X)) ; DE3502 - remove closing when coming from Fresh
 ;
 I $P(DOMAIN,"#")'="syncStart" S THISBTCH="HMPFX~"_HMPFHMP_"~"_DFN
 I THISBTCH'="",$O(^XTMP(THISBTCH,"refInfo",""))'="" D  ;US18005
 . N ZDOMAIN
 . S ZDOMAIN=$S($P(DOMAIN,"#")="syncStart":$P(DOMAIN,"#",2),1:$P(DOMAIN,"#"))
 . S FIRST=1
 . S X=X_",""referenceInfo"":{"
 . S Y="" F  S Y=$O(^XTMP(THISBTCH,"refInfo",Y)) Q:Y=""  S:'FIRST X=X_"," S FIRST=0 S X=X_""""_Y_""":"""_^(Y)_""""
 . S Y=$S(ZDOMAIN="":$G(^XTMP(THISBTCH,"JOBID")),1:$G(^XTMP(THISBTCH,"JOBID",ZDOMAIN)))
 . I Y'="" S:'FIRST X=X_"," S X=X_"""jobId"":"""_Y_""""
 . S X=X_"}"
 I '($P(DOMAIN,"#")="syncStart"&(DFN="OPD")) S X=X_",""unsolicitedUpdate"":"_$S($G(FILTER("freshnessDateTime")):"true",1:"false") ;US18245
 I $P(DOMAIN,"#")="syncStart" D  Q X  ;DE7827 generate metastamp even if no entry
 .;--- Start US3907 ---
 .;Pass JobId and RootJobId back in the response if we were given them
 .;This bridges the gap between Job status and Sync Status (since VistA will be giving the syncStatus)
 .;US11019 use domain specific Job id
 .S Y=$S($P(DOMAIN,"#",2)="":$G(^XTMP(THISBTCH,"JOBID")),1:$G(^XTMP(THISBTCH,"JOBID",$P(DOMAIN,"#",2)))) ;US11019
 .I Y]"" S X=X_",""jobId"":"""_Y_""""
 .S Y=$G(^XTMP(THISBTCH,"ROOTJOBID"))
 .I Y]"" S X=X_",""rootJobId"":"""_Y_""""
 .;--- End US3907 ---
 .I DFN'="OPD" D METAPT^HMPMETA(SNODE,$P(DOMAIN,"#",2)) Q  ;US11019 extra para ;Collect Patient metastamp data from XTMP - US6734 - DE7827 piece 2 will have domain or be null
 .D METAOP^HMPMETA(SNODE) ; Collect OPD metastamp data from XTMP - US6734
 ;
 S X=X_","
 ;if batched by extract  *S68-JCH*
 I $G(OFFSET)>-1 S X=X_"""seq"":"_OFFSET_","
 I $G(DOMSIZE)>-1 S X=X_"""total"":"_DOMSIZE_","
 I $G(OFFSET)>-1 S X=X_"""object"":"
 Q X
NOOP(LASTITM) ;No-op, don't return any items
 S ^TMP("HMPF",$J,.5)=$$APIHDR^HMPDJFS1(0,LASTITM)_"]}}"
 Q
