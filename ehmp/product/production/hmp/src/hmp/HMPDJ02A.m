HMPDJ02A ;ASMR/MKB/JD,CK,CPC,PB,BL - Problems,Allergies,Vitals ;Jan 17, 2107 09:56:26
 ;;2.0;ENTERPRISE HEALTH MANAGEMENT PLATFORM;**3,4**;Jan 17, 2017;Build 7
 ;Per VA Directive 6402, this routine should not be modified.
 ;
 ; External References          DBIA#
 ; -------------------          ----- 
 ; ^AUPNVSIT(                    2028
 ;
 Q
GETVIEN(DFNN,VISITDT)  ;JL; get the Visit IEN from VISIT file based on patient ID and Datetime
 Q:'+$G(DFNN)!'$L(VISITDT) -1  ;return -1 if bad parameter
 N REVDT,VISITIEN
 S REVDT=9999999-$P(VISITDT,".",1)_$S($P(VISITDT,".",2)'="":"."_$P(VISITDT,".",2),1:"")
 S VISITIEN=$O(^AUPNVSIT("AA",DFNN,REVDT,""))  ; using "AA" cross-reference
 Q:VISITIEN="" -1
 Q VISITIEN
 ;
VSTIEN(VSTIEN) ; Jan 17, 2017 - PB - DE6877 - Function to check for the visit and the patient to exist for the visit in the Visit File
 ; INPUT - VSTIEN the IEN for the visit in the Visit File
 ; OUTPUT - 1 = missing required data element, 0 = required data elements are present
 N VSTDATA
 S VSTDATA=$G(^AUPNVSIT(VSTIEN,0))  ;ICR 2028
 Q:$P(VSTDATA,U)="" 1  ; if the .01 field is null quit and return 1
 Q:$P(VSTDATA,U,5)="" 1  ; if field .05 is null quit and return 1
 Q 0
GMV1(ID) ; -- vital/measurement ^UTILITY($J,"GMRVD",HMPIDT,HMPTYP,ID)
 N VIT,HMPY,X0,TYPE,LOC,FAC,X,Y,MRES,MUNT,HIGH,LOW,I
 D GETREC^GMVUTL(.HMPY,ID,1) S X0=$G(HMPY(0))
 ; GMRVUT0 returns CLiO data with a pseudo-ID >> get real ID
 I X0="",$G(HMPIDT),$D(HMPTYP) D  ;[from HMPDJ0]
 . N GMRVD S GMRVD=$G(^UTILITY($J,"GMRVD",HMPIDT,HMPTYP,ID))
 . S ID=$O(^PXRMINDX(120.5,"PI",DFN,$P(GMRVD,U,3),+GMRVD,""))
 . I $L(ID) D GETREC^GMVUTL(.HMPY,ID,1) S X0=$G(HMPY(0))
 Q:X0=""
 ;
 N $ES,$ET,ERRPAT,ERRMSG
 S $ET="D ERRHDLR^HMPDERRH",ERRPAT=DFN
 S ERRMSG="A problem occurred converting record "_ID_" for the vitals domain"
 S VIT("localId")=ID,VIT("kind")="Vital Sign"
 S VIT("uid")=$$SETUID^HMPUTILS("vital",DFN,ID)
 S VIT("observed")=$$JSONDT^HMPUTILS(+X0)
 S VIT("resulted")=$$JSONDT^HMPUTILS(+$P(X0,U,4))
 S TYPE=$$FIELD^GMVGETVT(+$P(X0,U,3),2)
 S VIT("displayName")=TYPE
 S VIT("typeName")=$$FIELD^GMVGETVT($P(X0,U,3),1)
 S VIT("typeCode")="urn:va:vuid:"_$$FIELD^GMVGETVT($P(X0,U,3),4)
 S X=$P(X0,U,8),VIT("result")=X
 S VIT("units")=$$UNIT^HMPDGMV(TYPE),(MRES,MUNT)=""
 I TYPE="T"  S:X=+X MUNT="C",MRES=$J(X-32*5/9,0,1) ;EN1^GMRVUTL
 I TYPE="HT" S MUNT="cm",MRES=$J(2.54*X,0,2)  ;EN2^GMRVUTL
 I TYPE="WT" S MUNT="kg",MRES=$J(X/2.2,0,2)   ;EN3^GMRVUTL
 I TYPE="CG" S MUNT="cm",MRES=$J(2.54*X,0,2)
 S:MRES VIT("metricResult")=MRES,VIT("metricUnits")=MUNT
 S X=$$RANGE^HMPDGMV(TYPE) I $L(X) S VIT("high")=$P(X,U),VIT("low")=$P(X,U,2)
 S VIT("summary")=VIT("typeName")_" "_VIT("result")_" "_VIT("units")
 F I=1:1:$L(HMPY(5),U) S X=$P(HMPY(5),U,I) I X D
 . S VIT("qualifiers",I,"name")=$$FIELD^GMVGETQL(X,1)
 . S VIT("qualifiers",I,"vuid")=$$FIELD^GMVGETQL(X,3)
 ;US4338 - add pulse ox qualifier if it exists. name component is required. vuid is not per Thomas Loth
 I $P(X0,U,10) S VIT("qualifiers",I+1,"name")=$P(X0,U,10)
 I $G(HMPY(2)) D
 . S VIT("removed")="true"        ;entered in error
 . S X=$$GET1^DIQ(120.506,"1,"_ID_",",.01,"E") S:X VIT("reasonEnteredInError")=X
 . S X=$$GET1^DIQ(120.506,"1,"_ID_",",.02,"I") S:X VIT("dateEnteredInError")=$$JSONDT^HMPUTILS(X)
 S LOC=+$P(X0,U,5),FAC=$$FAC^HMPD(LOC)
 S VIT("locationUid")=$$SETUID^HMPUTILS("location",,LOC)
 S VIT("locationName")=$S(LOC:$P($G(^SC(LOC,0)),U),1:"unknown")
 N USERID S USERID=$P(HMPY(0),U,6)
 I $G(USERID) D
 . S VIT("enteredByUid")=$$SETUID^HMPUTILS("user",,USERID)
 . S VIT("enteredByName")=$P($G(^VA(200,USERID,0)),U,1)
 D FACILITY^HMPUTILS(FAC,"VIT")
 S VIT("lastUpdateTime")=$$EN^HMPSTMP("vital")
 S VIT("stampTime")=VIT("lastUpdateTime") ; RHL 20141231
 ;US6734 - pre-compile metastamp
 I $G(HMPMETA) D ADD^HMPMETA("vital",VIT("uid"),VIT("stampTime")) Q:HMPMETA=1  ;US11019/US6734
 D ADD^HMPDJ("VIT","vital")
 Q
 ;
HMP(COLL) ; -- HMP Patient Objects
 N ID I $L($G(HMPID)) D  Q
 . S ID=+HMPID I 'ID S ID=+$O(^HMP(800000.1,"B",HMPID,0)) ;IEN or UID
 . D:ID HMP1(800000.1,ID)
 Q:$G(COLL)=""  ;error
 S ID=0 F  S ID=$O(^HMP(800000.1,"C",DFN,COLL,ID)) Q:ID<1  D HMP1(800000.1,ID)
 Q
HMP1(FNUM,ID) ; -- [patient] object
 N I,X,HMPY
 N $ES,$ET,ERRPAT,ERRMSG
 S $ET="D ERRHDLR^HMPDERRH",ERRPAT=$G(DFN)
 S ERRMSG="A problem occurred retreiving record "_ID_" for the HMP domain"
 S I=0 F  S I=$O(^HMP(FNUM,ID,1,I)) Q:I<1  S X=$G(^(I,0)),HMPY(I)=X
 I $D(HMPY) D  ;already encoded JSON
 . S HMPI=HMPI+1 S:HMPI>1 @HMP@(HMPI,.3)=","
 . M @HMP@(HMPI)=HMPY
 . ; -- chunk data if from DQINIT^HMPDJFSP ; i.e. HMPCHNK defined ;*S68-JCH*
 . D CHNKCHK^HMPDJFSP(.HMP,.HMPI) ;*S68-JCH*
 Q
