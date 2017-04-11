VPRJCONV ;V4W/DLW,KRM/CJE -- Conversion routine to convert the old sync status metastamp to the new one
 ;;1.0;JSON DATA STORE;;Nov 04, 2015
 ;
 QUIT  ; Should not be called from the top
 ;
 ; This routine should be run at every site that was running JDS before the conversion to the new metastamp
 ;
SYNCSTS ; Entry point for sync status metastamp conversion
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
 . . K ^VPRSTATUSOD(SITE,SOURCESTAMP,DOMAIN,SOURCESTAMP,"stored")
 . ;
 . ZK ^VPRSTATUSOD(SITE,SOURCESTAMP) ; Delete the data, but not the descendants
 . ; Save off newest metastamp to a temp global
 . M ^VPRJSTMP("VPRSTATUSOD",SITE)=^VPRSTATUSOD(SITE,SOURCESTAMP)
 . S ^VPRJSTMP("VPRSTATUSOD",SITE,"stampTime")=SOURCESTAMP
 . K ^VPRSTATUSOD(SITE)
 . M ^VPRSTATUSOD(SITE)=^VPRJSTMP("VPRSTATUSOD",SITE)
 . ;
 . TC
 ;
 K ^VPRJSTMP("VPRSTATUSOD")
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
 . . K ^VPRSTATUS(PID,SITE,SOURCESTAMP,DOMAIN,SOURCESTAMP,"stored")
 . ;
 . ZK ^VPRSTATUS(PID,SITE,SOURCESTAMP) ; Delete the data, but not the descendants
 . ; Save off newest metastamp to a temp global
 . M ^VPRJSTMP("VPRSTATUS",PID,SITE)=^VPRSTATUS(PID,SITE,SOURCESTAMP)
 . S ^VPRJSTMP("VPRSTATUS",PID,SITE,"stampTime")=SOURCESTAMP
 . K ^VPRSTATUS(PID,SITE)
 . M ^VPRSTATUS(PID,SITE)=^VPRJSTMP("VPRSTATUS",PID,SITE)
 . ;
 . TC
 ;
 K ^VPRJSTMP("VPRSTATUS")
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
