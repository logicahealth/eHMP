HMPDJFSQ ;ASMR/CPC -- Extract Queue manager;May 05, 2016 09:56:12
 ;;2.0;ENTERPRISE HEALTH MANAGEMENT PLATFORM;*1*;Sep 01, 2011;Build 3
 ;Per VHA Directive 2004-038, this routine should not be modified.
 ;
 ;
NEWQMGR ;Start new background Q manager
 N ZTRTN,ZTDESC,ZTDTH,ZTIO,ZTSAVE,ZTSK
 S ZTRTN="QMGR^HMPDJFSQ",ZTIO="",ZTDTH=$H
 S ZTSAVE("HMPQBTCH")=""
 S ZTDESC="HMP patient QMGR"
 D ^%ZTLOAD
 I '$G(ZTSK) D SETERR^HMPDJFS("sync queue manager failed to start")
 Q
NEWTASK ;Start patient specific extract
 N ZTRTN,ZTDESC,ZTDTH,ZTIO,ZTSAVE,ZTSK
 S ZTRTN="QREJOIN^HMPDJFSP",ZTIO="",ZTDTH=$H
 S ZTSAVE("HMPQBTCH")=""
 S ZTSAVE("HMPBATCH")="",ZTSAVE("HMPFDFN")="",ZTSAVE("DOMAINS(")=""
 S ZTSAVE("HMPENVIR(")="",ZTSAVE("ARGS(")=""  ; environment information
 S ZTSAVE("HMPSTMP")="" ; Operational data stamptime US6734
 S ZTSAVE("HMPSVERS")="" ;sync version US11019
 S ZTSAVE("NEWSUB")=""
 S ZTSAVE("HMPSRV")="",ZTSAVE("HMPSRV(")=""
 S ZTSAVE("HMPQREF")="" ;US13442
 S ZTDESC="HMP patient QMGRTSK"
 D ^%ZTLOAD
 I '$G(ZTSK) D SETERR^HMPDJFS("Task MANAGER TASK not created")
 Q
QMGR ; Manage patient queues
 L +^XTMP(HMPQBTCH,0):5 E  Q  ;prove running
 S $P(^XTMP(HMPQBTCH,0),U,1)=$$HTFM^XLFDT(+$H+5) ;Update deletion times
 N HMPQRC,HMPQPC,HMPQNOW,HMPQRUN,HMPQRUNC,HMPQTOTP,HMPQDAT,HMPQUIT,HMPQI,HMPQQ,HMPQREF
 S HMPQUIT=0 F  D  H 1 Q:HMPQUIT
 . S HMPQTOTP=+$P($G(^XTMP(HMPQBTCH,0,0)),U) I 'HMPQTOTP S HMPQTOTP=2 ;max no of patients to run
 . S HMPQNOW=$P($H,",",2)
 . K HMPQRUNC S HMPQRUNC=0
 . ;de4661 First count current running
 . S HMPQQ="^XTMP("""_HMPQBTCH_""",0,0)"
 . F HMPQI=0:1 S HMPQQ=$Q(@HMPQQ) Q:HMPQQ'[HMPQBTCH  Q:HMPQQ=""  I $QL(HMPQQ)=4 D  Q:HMPQRUNC>=HMPQTOTP
 ..  S HMPQDAT=$G(@HMPQQ),HMPFDFN=$QS(HMPQQ,4)
 ..  I HMPQDAT S HMPQRUNC=HMPQRUNC+1,HMPQRUNC(HMPFDFN)=""
 . Q:HMPQRUNC>=HMPQTOTP
 . S HMPQRUN=HMPQRUNC
 . S HMPQQ="^XTMP("""_HMPQBTCH_""",0,0)"
 . F HMPQI=0:1 S HMPQQ=$Q(@HMPQQ) Q:HMPQQ'[HMPQBTCH  Q:HMPQQ=""  I $QL(HMPQQ)=4 D  Q:HMPQRUN>=HMPQTOTP
 ..  S HMPQDAT=$G(@HMPQQ)
 ..  N NEWSUB,HMMPDFN,ARGS,DOMAINS,HMPBATCH,HMPSRV,HMPPRITY,HMPQS,HMPSVERS
 ..  S HMPPRITY=$QS(HMPQQ,2),HMPQS=$QS(HMPQQ,3),HMPFDFN=$QS(HMPQQ,4)
 ..  I 'HMPQDAT D  Q  ;task job
 ...   ;restore data
 ...   S NEWSUB=1
 ...   M ARGS=^XTMP(HMPQBTCH,HMPPRITY,HMPQS,HMPFDFN,"ARGS")
 ...   M DOMAINS=^XTMP(HMPQBTCH,HMPPRITY,HMPQS,HMPFDFN,"DOMAINS")
 ...   M HMPBATCH=^XTMP(HMPQBTCH,HMPPRITY,HMPQS,HMPFDFN,"HMPBATCH")
 ...   M HMPSRV=^XTMP(HMPQBTCH,HMPPRITY,HMPQS,HMPFDFN,"HMPSRV")
 ...   S HMPSVERS=^XTMP(HMPQBTCH,HMPPRITY,HMPQS,HMPFDFN,"HMPSVERS")
 ...   S @HMPQQ=$P($H,",",2) ;set start time
 ...   S HMPQREF=HMPQQ
 ...   D NEWTASK
 ...   S HMPQRUN=HMPQRUN+1
 ..  I (HMPQNOW-HMPQDAT)>300!(HMPQNOW>300&((HMPQNOW-HMPQDAT)<0)) K @HMPQQ Q  ;job static too long go to next
 ..  I '$D(HMPQRUNC(HMPFDFN)) S HMPQRUN=HMPQRUN+1 ;de4661 - don't add already counted
 . I 'HMPQI S HMPQUIT=1 ;nothing left to process
 L -^XTMP(HMPQBTCH,0) ;clear lock when ending
 Q
SAVETASK ;save task request on job queue
 N HMPQS
 S HMPQS=$O(^XTMP(HMPQBTCH,HMPPRITY,""),-1)+1
 S ^XTMP(HMPQBTCH,HMPPRITY,HMPQS,HMPFDFN)=""
 M ^XTMP(HMPQBTCH,HMPPRITY,HMPQS,HMPFDFN,"ARGS")=ARGS
 M ^XTMP(HMPQBTCH,HMPPRITY,HMPQS,HMPFDFN,"DOMAINS")=DOMAINS
 M ^XTMP(HMPQBTCH,HMPPRITY,HMPQS,HMPFDFN,"HMPBATCH")=HMPBATCH
 M ^XTMP(HMPQBTCH,HMPPRITY,HMPQS,HMPFDFN,"HMPSRV")=HMPSRV
 S ^XTMP(HMPQBTCH,HMPPRITY,HMPQS,HMPFDFN,"HMPSVERS")=HMPSVERS
 ;check if task manager running if not start one
 L +^XTMP(HMPQBTCH,0):1 E  Q
 D NEWQMGR
 L -^XTMP(HMPQBTCH,0)
 Q
QUINIT(HMPBATCH,HMPFDFN,HMPFDOM) ; Queue the initial extracts for a patient
 ; HMPBATCH="HMPFX~hmpsrvid~dfn"
 ; HMPFDOM(n)="domainName"
 ; 
 ; ^XTMP("HMPFX~hmpsrvid~dfn",0)=expires^created^HMP Patient Extract
 ;                           ,0,"status",domain)=0:waiting;1:ready
 ;                           ,0,"task",taskIen)=""
 ;                           ,taskIen,domain,... (extract data)
 ; set up the domains to be done by this task
 N I S I=0 F  S I=$O(HMPFDOM(I)) Q:'I  D SETDOM^HMPDJFSP("status",HMPFDOM(I),0)
 ;
 ; create task for this set of domains within the batch
 N ZTRTN,ZTDESC,ZTDTH,ZTIO,ZTSAVE,ZTSK
 S ZTRTN="DQINIT^HMPDJFSP",ZTIO="HMP EXTRACT RESOURCE",ZTDTH=$H
 S ZTSAVE("HMPBATCH")="",ZTSAVE("HMPFDFN")="",ZTSAVE("HMPFDOM(")=""
 S ZTSAVE("HMPENVIR(")="" ;environment information
 S ZTSAVE("HMPSTMP")="" ;Operational data stamptime US6734
 S ZTSAVE("HMPSVERS")="" ;sync version US11019
 S ZTSAVE("HMPQREF")="" ;US13442
 S ZTDESC="Build HMP domains for a patient"
 D ^%ZTLOAD
 I $G(ZTSK) S ^XTMP(HMPBATCH,0,"task",ZTSK)="" Q
 D SETERR^HMPDJFS("Task not created")
 Q
 ;
