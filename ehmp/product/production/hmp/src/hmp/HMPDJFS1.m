HMPDJFS1 ;ASMR/CPC,hrubovcak,CPC - for Extract and Freshness Stream;Oct 15, 2015 18:39:51
 ;;2.0;ENTERPRISE HEALTH MANAGEMENT PLATFORM;**4**;Sep 01, 2011;Build 63
 ;Per VA Directive 6402, this routine should not be modified.
 ;
 Q
 ; continuation code for HMPDJFSP and HMPDJFSG
 ;
BACKDOM ; task patient domain to the background, called from HMPDJFSP
 N ZTDESC,ZTDTH,ZTIO,ZTRTN,ZTSAVE,ZTSK
 S ZTRTN="DQBACKDM^HMPDJFS1",ZTIO="",ZTDTH=$H
 S ZTSAVE("HMPBATCH")="",ZTSAVE("HMPFDFN")=""
 S ZTSAVE("HMPFDOMI")="",ZTSAVE("ZTQUEUED")="",ZTSAVE("HMPMETA")="",ZTSAVE("HMPFDOM(")=""
 S ZTSAVE("HMPFZTSK")=""
 S ZTSAVE("HMPENVIR(")=""  ; environment information
 S ZTSAVE("HMPSTMP")=""  ; Operational data stamptime US6734
 S ZTDESC="Build HMP subdomains for a patient"
 D ^%ZTLOAD
 I $G(ZTSK) S ^XTMP(HMPBATCH,0,"task","b",ZTSK)="" Q
 ; no task, log error
 D SETERR^HMPDJFS("Task not created")
 Q
 ;
DQBACKDM ; TaskMan entry point
 ; patient's domain has been "chunked"
 N HMPFBJ S HMPFBJ=1  ; flag, background job
 D DOMPT^HMPDJFSP(HMPFDOM(HMPFDOMI))
 K ^XTMP(HMPBATCH,0,"task","b",ZTSK)
 Q
 ;
APIHDR(COUNT,LASTITM) ;return JSON
 ;expects HMPFSYS
 I $P($G(LASTITM),".",2)="99" S LASTITM=$P(LASTITM,".") ;make sure lastUpdate is correct;JD;BL;DE2280
 I +$G(HMPRMODE),+$G(HMPALLTK) I LASTITM'=$P(^XTMP(HMPALLOQ,"current",HMPALLTK),U,3) D
 . ;override allocation if last item doesn't match but not if no items returned otherwise it loops
 . ;logic being that if no items are returned then we need to move the last update pointer anyway, as long as this is the reason we got here
 . I 'COUNT,$G(HMPFIDX)'<$G(HMPALEND) Q  ;no data but sequence went past allocation end so leave last update to reset via allocation
 . S $P(^XTMP(HMPALLOQ,"current",HMPALLTK),U,3)=LASTITM
 . S $P(^XTMP(HMPALLOQ,"byRecord",$$PACKSIX^HMPDJFSR($P(^XTMP(HMPALLOQ,"current",HMPALLTK),U,2),1E10)),U,1)=LASTITM
 N X
 S X="{"_$$APIVERS^HMPDJFS()_",""params"":{""domain"":"""_$$KSP^XUPARAM("WHERE")_"""" ;update API version
 S X=X_",""systemId"":"""_HMPFSYS_"""},""data"":{""updated"":"""_$$HL7NOW^HMPDJ_""""
 S X=X_",""totalItems"":"_COUNT_",""lastUpdate"":"""_LASTITM_""""_$$PROGRESS^HMPDJFS(LASTITM)
 I $G(HMPALLTK)'="" S X=X_",""allocationToken"":"""_HMPALLTK_""""
 S X=X_",""items"":["
 Q X
 ;
VERMATCH(HMPIEN,VERSION) ;true if middle tier HMP and VistA version match
 ;versions match, queue any patients waiting for match
 I $P($$GET^XPAR("PKG","HMP JSON SCHEMA"),".")=$P(VERSION,".") D  QUIT 1
 . Q:'$G(^XTMP("HMPFS~"_HMPIEN,"waiting"))  ; no patients awaiting queuing
 . S ^XTMP("HMPFS~"_HMPIEN,"waiting")=0
 . N DOMAINS,BATCH,HMPNAME
 . S HMPNAME=$P(^HMP(800000,HMPIEN,0),U)
 . D PTDOMS^HMPDJFSD(.DOMAINS)
 . S DFN=0 F  S DFN=$O(^XTMP("HMPFS~"_HMPIEN,"waiting",DFN)) Q:'DFN  D
 .. Q:'$D(^HMP(800000,HMPIEN,1,DFN))  ; subscription cancelled while waiting *S68-JCH*
 .. S BATCH="HMPFX~"_HMPNAME_"~"_DFN
 .. D QUINIT^HMPDJFSQ(BATCH,DFN,.DOMAINS) ;DE7954
 . K ^XTMP("HMPFS~"_HMPIEN)
 ;otherwise, hold
 D NEWXTMP^HMPDJFS("HMPFS~"_HMPIEN,8,"HMP Awaiting Version Match")
 S ^XTMP("HMPFS~"_HMPIEN,"waiting")=1
 Q 0
