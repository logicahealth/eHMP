ZZCPDAT1 ; SEB - Copy clinical data from one IEN to another continued
         ;;1.0;VistA Data Support;;SEP 13 2016;Build 1
CLONE(MYDFN,NAME) ; Run clone selections in CLONE()
         S FILEID=""
         F  S FILEID=$O(CLONE(FILEID)) Q:FILEID=""  D
         . S MYIEN="" F  S MYIEN=$O(CLONE(FILEID,MYIEN)) Q:MYIEN=""  D
         . . I FILEID=2 S MYDFN=MYIEN D PATIENT(MYIEN)
         . . I FILEID=44.003 D APPT($P(MYIEN,"^"),$P(MYIEN,"^",2),$P(MYIEN,"^",3))
         . . I FILEID=9000010 D VISIT(MYIEN)
         . . I FILEID=409.68 D ENC(MYIEN)
         . . I FILEID=45 D ENC(MYIEN)
         . . I FILEID=405 D ADT(MYIEN)
         . . I FILEID=120.5 D VITALS(MYIEN)
         . . I FILEID=9000011 D PROBLEMS(MYIEN)
         . . I FILEID=120.8 D ALLERGY(MYIEN)
         . . I FILEID=120.86 D NKA(MYIEN)
         . . I FILEID=130 D SURGERY(MYIEN)
         . . I FILEID=123 D CONSULTS(MYIEN)
         . . I FILEID=8925 D NOTES(MYIEN)
         . . I FILEID=75.1 D RAO(MYIEN)
         . . I FILEID=74 D RARPT(MYIEN)
         . . I FILEID=70 D RADPT(MYIEN)
         . . I FILEID=55 D INPATMED(MYIEN)
         . . I FILEID=115 D DIET(MYIEN)
         . . I FILEID=100 D ORDERS(MYIEN)
         . . I FILEID=52 D MEDS(MYIEN)
         . . I FILEID=63 D LABRSLT(MYIEN)
         . . I FILEID=69.01 D LABSPC($P(MYIEN,"^"),$P(MYIEN,"^",2))
         . . I FILEID=26.13 D FLAGS(MYIEN)
         . . I FILEID=26.14 D FLGHIST(MYIEN)
         . . Q
         . Q
         D FIXADT,FIXPACK,FIXCONS
         Q
         ;
PATIENT(MYDFN) ; Clone patient demographics
         D XREFOFF(2,.14112,1),XREFOFF(2,.14105,2)
         S OVERARR(2,.01)=NAME
         S OVERARR(2,.09)=$$GETSSN(MYDFN)
         D COPY(2,MYDFN,.OVERARR,.MAPARR)
         D DEL1^ZZADDICN(MAPARR(2,MYDFN)),REQICN^ZZADDICN(MAPARR(2,MYDFN))
         D XREFON(2,.14112,1),XREFON(2,.14105,2)
         Q
         ;
APPT(CLINICID,APPTDT,APPTID) ; Clone appointment data
         D COPY(44.003,APPTID_","_APPTDT_","_CLINICID,.OVERARR,.MAPARR)
         Q
         ;
VISIT(VISITID) ; Clone visit data
         D COPY(9000010,VISITID,.OVERARR,.MAPARR)
         Q
         ;
ENC(ENCID) ; Clone encounter data
         D COPY(409.68,ENCID,.OVERARR,.MAPARR)
         Q
         ;
PTF(PTFID) ; Clone patient's PTF records
         D COPY(45,PTFID,.OVERARR,.MAPARR)
         Q
         ;
ADT(ADTID) ; Clone A/D/T data
         D COPY(405,ADTID,.OVERARR,.MAPARR)
         Q
         ;
FIXADT   ; Fix pointers to associated A/D/T transactions
         S ADTID=0 F  S ADTID=$O(^DGPM("C",MAPARR(2,MYDFN),ADTID)) Q:+ADTID'=ADTID  D
         . F FLD=.14,.15,.17,.21,.24 S VALUE=$P(^DGPM(ADTID,0),"^",FLD*100) I VALUE]"" S NEWVAL=$G(MAPARR(405,VALUE)) I NEWVAL]"" S UPDARR(405,ADTID_",",FLD)=NEWVAL
         . Q
         D FILE^DIE("S","UPDARR","ERRARR")
         Q
         ;
VITALS(VITALID) ; Clone vitals data
         D COPY(120.5,VITALID,.OVERARR,.MAPARR)
         Q
         ;
PROBLEMS(PROBID) ; Clone patient's problems
         D COPY(9000011,PROBID,.OVERARR,.MAPARR)
         Q
         ;
ALLERGY(ALLERGID) ; Clone patient's allergies
         D COPY(120.8,ALLERGID,.OVERARR,.MAPARR)
         Q
         ;
NKA(MYDFN) ; Clone patient's NKA flag
         D COPY(120.86,MYDFN,.OVERARR,.MAPARR)
         Q
         ;
SURGERY(SURGID) ; Clone patient's surgery records
         D XREFOFF(130,27,2),XREFOFF(130,.205,3),XREFOFF(130,506,1)
         D COPY(130,SURGID,.OVERARR,.MAPARR)
         D XREFON(130,27,2),XREFON(130,.205,3),XREFON(130,506,1)
         Q
         ;
CONSULTS(CONSID) ; Clone patient's consults
         D COPY(123,CONSID,.OVERARR,.MAPARR)
         Q
         ;
NOTES(NOTEID) ; Clone patient's notes
         D COPY(8925,NOTEID,.OVERARR,.MAPARR)
         Q
         ;
RAO(RAOID) ; Clone patient's radiology orders
         D COPY(75.1,RAOID,.OVERARR,.MAPARR)
         Q
         ;
RARPT(RARPTID) ; Clone patient's radiology reports
         D COPY(74,RARPTID,.OVERARR,.MAPARR)
         Q
         ;
RADPT(MYDFN) ; Clone radiology patient data
         S OVERARR(70,.01)=MAPARR(2,MYDFN)
         D COPY(70,MYDFN,.OVERARR,.MAPARR)
         Q
         ;
INPATMED(MYDFN) ; Clone patient's inpatient meds
         S PSIVACT=1
         S OVERARR(55,.01)=MAPARR(2,MYDFN)
         D COPY(55,MYDFN,.OVERARR,.MAPARR)
         Q
         ;
DIET(DIETID) ; Clone patient's diet orders
         S OVERARR(115,.01)="P"_MAPARR(2,MYDFN),OVERARR(115,14)=MAPARR(2,MYDFN)
         D COPY(115,DIETID,.OVERARR,.MAPARR)
         Q
         ;
ORDERS(ORDERID) ; Clone patient's orders
         D XREFOFF(100,.01,1),XREFOFF(100,.02,2)
         D COPY(100,ORDERID,.OVERARR,.MAPARR)
         D XREFON(100,.01,1),XREFON(100,.02,2)
         Q
         ;
MEDS(RXID) ; Clone one prescription
         D XREFOFF(52.1,.01,5),XREFOFF(52,6,1),XREFOFF(52,6,2)
         S OVERARR(52,.01)=$P(^PSRX(RXID,0),"^"),$P(OVERARR(52,.01),"-",2)=MAPARR(2,MYDFN)
         D COPY(52,RXID,.OVERARR,.MAPARR)
         D XREFON(52.1,.01,5),XREFON(52,6,1),XREFON(52,6,2)
         Q
         ;
LABRSLT(LRDFN) ; Clone lab results
         S OVERARR(63,.01)=$P(^LR(0),"^",3)+1
         S OVERARR(63,.03)=MAPARR(2,MYDFN)
         D COPY(63,LRDFN,.OVERARR,.MAPARR)
         Q
         ;
LABSPC(SPCIEN,SPCDT) ; Clone specimen data
         D COPY(69.01,SPCIEN_","_SPCDT,.OVERARR,.MAPARR)
         Q
         ;
FLAGS(FLAGID) ; Clone patient flags
         D COPY(26.13,FLAGID,.OVERARR,.MAPARR)
         Q
         ;
FLGHIST(HISTID) ; Clone patient flag history
         S OVERARR(26.14,.01)=MAPARR(26.13,+$G(^DGPF(26.14,HISTID,0)))
         D COPY(26.14,HISTID,.OVERARR,.MAPARR)
         Q
         ;
FIXPACK  ; Update PACKAGE REFERENCE field and order pointers
         S NEWDFN=MAPARR(2,MYDFN)_";DPT(",ORTYPE=0
         F  S ORTYPE=$O(^OR(100,"AW",NEWDFN,ORTYPE)) Q:ORTYPE=""  D
         . S ORDATE=0 F  S ORDATE=$O(^OR(100,"AW",NEWDFN,ORTYPE,ORDATE)) Q:ORDATE=""  D
         . . S ORDERID=0 F  S ORDERID=$O(^OR(100,"AW",NEWDFN,ORTYPE,ORDATE,ORDERID)) Q:ORDERID=""  K UPDARR D
         . . . S UPDARR(100,ORDERID_",",.01)=MAPARR(100,$P(^OR(100,ORDERID,0),"^"))
         . . . S RBY=$P(^OR(100,ORDERID,3),"^",5)
         . . . I RBY]"",$D(MAPARR(100,RBY)) S UPDARR(100,ORDERID_",",9)=MAPARR(100,RBY)
         . . . S RPM=$P(^OR(100,ORDERID,3),"^",6)
         . . . I RPM]"",$D(MAPARR(100,RPM)) S UPDARR(100,ORDERID_",",9.1)=MAPARR(100,RPM)
         . . . S PACKREF=$G(^OR(100,ORDERID,4)) I PACKREF="" Q
         . . . I ORTYPE=4,$G(MAPARR(52,PACKREF))]"" S UPDARR(100,ORDERID_",",33)=MAPARR(52,PACKREF)
         . . . I ORTYPE=11 D
         . . . . S CONSID=$P(PACKREF,";")
         . . . . I $G(MAPARR(123,CONSID))]"" S UPDARR(100,ORDERID_",",33)=MAPARR(123,CONSID)_";GMRC"
         . . . . Q
         . . . I ",9,35,36,37,39,40,41,42,"[(","_ORTYPE_",") S UPDARR(100,ORDERID_",",33)=MAPARR(75.1,PACKREF)
         . . . I ORTYPE=6 D
         . . . . S EXTORDID=$P(PACKREF,";"),$P(EXTORDID,"-",2)=LRDFN,$P(PACKREF,";")=EXTORDID
         . . . . S LABID=$P(PACKREF,";",3)_","_$P(PACKREF,";",2)
         . . . . I $G(MAPARR(69.01,LABID))]"" S $P(PACKREF,";",3)=MAPARR(69.01,LABID)
         . . . . E  S $P(PACKREF,";",2,3)=""
         . . . . S UPDARR(100,LABID_",",33)=PACKREF
         . . . . Q
         . . . I $D(MAPARR(100,PACKREF)) S PACKREF=MAPARR(100,PACKREF)
         . . . D FILE^DIE("S","UPDARR","ERRARR")
         . . . S DIK="^OR(100,",DA=ORDERID D IX^DIK
         . . . Q
         . . Q
         . Q
         Q
         ;
FIXCONS  ; Update TIU note pointers in Consults file
         K UPDARR
         S NEWDFN=MAPARR(2,MYDFN),CONSID=0 F  S CONSID=$O(^GMR(123,"F",NEWDFN,CO
NSID)) Q:+CONSID'=CONSID  D
         . S RECID=0 F  S RECID=$O(^GMR(123,CONSID,40,RECID)) Q:+RECID'=RECID  D
         . . S ORIGTIU=+$P(^GMR(123,CONSID,40,RECID,0),"^",9) I ORIGTIU=0 Q
         . . S NEWTIU=$G(MAPARR(8925,ORIGTIU)) I NEWTIU]"" S UPDARR(123.02,RECID_","_CONSID_",",9)=NEWTIU_";TIU(8925,"
         . . Q
         . S RECID=0 F  S RECID=$O(^GMR(123,CONSID,50,RECID)) Q:+RECID'=RECID  D
         . . S ORIGTIU=+$P(^GMR(123,CONSID,50,RECID,0),"^") I ORIGTIU=0 Q
         . . S NEWTIU=$G(MAPARR(8925,ORIGTIU)) I NEWTIU]"" S UPDARR(123.03,RECID_","_CONSID_",",.01)=NEWTIU_";TIU(8925,"
         . . Q
         . Q
         D FILE^DIE("S","UPDARR","ERRARR")
         Q
         ;
COPY(MAINDA,IEN,OVERARR,MAPARR,TODFN) 
         S TODFN=$G(TODFN)
         K NEWARR
         D GENFDA(MAINDA,IEN,.OVERARR,.MAPARR,.NEWARR,TODFN)
         I MAINDA=52 D
         . I '$D(NEWARR(52,"+1,",108)) S NEWARR(52,"+1,",108)=" "
         . I $G(NEWARR(52,"+1,",12))["RENEWED " S $P(NEWARR(52,"+1,",12),"-",2)=$P(NEWARR(52,"+1,",.01),"-",2)
         . I $D(NEWARR(52.052311,"+5,+1,")),'$D(NEWARR(52.052311,"+5,+1,",.01)) S NEWARR(52.052311,"+5,+1,",.01)=1
         . Q
         I MAINDA=63 D
         . S SUBFDA="" F  S SUBFDA=$O(NEWARR(63.02,SUBFDA)) Q:SUBFDA=""  D
         . . I $G(NEWARR(63.02,SUBFDA,.01))="" S IENID=$E($P(SUBFDA,","),2,999),
NEWARR(63.02,SUBFDA,.01)=IENSARR(IENID)
         . . Q
         . Q
         . S SUBFDA="" F  S SUBFDA=$O(NEWARR(63.04,SUBFDA)) Q:SUBFDA=""  D
         . . I $G(NEWARR(63.04,SUBFDA,.06))]"" S $P(NEWARR(63.04,SUBFDA,.06),"-",2)=NEWARR(63,"+1,",.03)
         . . Q
         . Q
         I MAINDA=69.01 D
         . S SUBFDA="" F  S SUBFDA=$O(NEWARR(69.01,SUBFDA)) Q:SUBFDA=""  D
         . . S NEWARR(69.01,SUBFDA,.01)=$G(OVERARR(63,.01))
         . . I $G(NEWARR(69.01,SUBFDA,.11))]"" S NEWARR(69.01,SUBFDA,.11)=$G(MAPARR(100,NEWARR(69.01,SUBFDA,.11)))
         . . I $G(NEWARR(69.01,SUBFDA,9.5))]"" S $P(NEWARR(69.01,SUBFDA,9.5),"-",2)=$G(NEWARR(69.01,SUBFDA,.01))
         . . Q
         . Q
         I MAINDA=70 D
         . I '$D(NEWARR(70,"+1,",.04)) S NEWARR(70,"+1,",.04)="O"
         . S SUBFDA="" F  S SUBFDA=$O(NEWARR(70.03,SUBFDA)) Q:SUBFDA=""  D
         . . I $G(NEWARR(70.03,SUBFDA,81))]"" S $P(NEWARR(70.03,SUBFDA,81),"-",2)=NEWARR(70,"+1,",.01)
         . . Q
         . Q
         I MAINDA=74 S $P(NEWARR(74,"+1,",.01),"-",3)=MAPARR(2,MYDFN)
         I MAINDA=409.68,$G(NEWARR(409.68,"+1,",.2))]"" S $P(NEWARR(409.68,"+1,",.2),"-",2)=NEWARR(409.68,"+1,",.02)
         I MAINDA=8925,$G(NEWARR(8925,"+1,",1405))]"" D
         . S VALUE=NEWARR(8925,"+1,",1405) I $P(VALUE,";")="" Q
         . I $P(VALUE,";",2)="GMR(123," S $P(VALUE,";")=MAPARR(123,$P(VALUE,";"))
         . I $P(VALUE,";",2)="SRF(" S $P(VALUE,";")=MAPARR(130,$P(VALUE,";"))
         . S NEWARR(8925,"+1,",1405)=VALUE
         D COPYFDA(MAINDA,IEN,.OVERARR,.MAPARR,.NEWARR)
         Q
         ;
GENFDA(MAINDA,IEN,OVERARR,MAPARR,NEWARR,TODFN) 
         S TODFN=$G(TODFN)
         K ORIGARR,ERRARR
         D GETS^DIQ(MAINDA,IEN,"**","IN","ORIGARR","ERRARR")
         I '$D(ORIGARR) W !,MAINDA," / ",IEN,": This IEN does not exist!" Q
         S DA=0,SEQ=0 K SEQARR,NEWARR,IENSARR
         F  S DA=$O(ORIGARR(DA)) Q:DA=""  D
         . S IENS=""
         . F  S IENS=$O(ORIGARR(DA,IENS))  Q:IENS=""  D
         . . S SEQ=SEQ+1,SEQARR(DA,IENS)=SEQ,FIELDID=""
         . . I SEQ>1 S IENSARR(SEQ)=$P(IENS,",")
         . . E  S IENSARR(1)=""
         . . S CURRDA=DA,TOTIENS=$$GETLVL(CURRDA)
         . . S NEWIENS="" F IENCT=1:1:TOTIENS D
         . . . I '$D(ORIGARR(CURRDA)) S $P(NEWIENS,",",IENCT)=$S(TODFN="":$P(IEN,",",IENCT-(TOTIENS-$L(IEN,","))),1:TODFN) ; for subfiles
         . . . E  S $P(NEWIENS,",",IENCT)="+"_SEQARR(CURRDA,$P(IENS,",",IENCT,TOTIENS)_",")
         . . . S CURRDA=$G(^DD(CURRDA,0,"UP"))
         . . . Q
         . . S NEWIENS=NEWIENS_","
         . . F  S FIELDID=$O(ORIGARR(DA,IENS,FIELDID)) Q:FIELDID=""  D
         . . . I FIELDID=.001 Q ; Skip .001 fields
         . . . S FIELDTYP=$P(^DD(DA,FIELDID,0),"^",2)
         . . . I FIELDTYP["C" Q ; No computed fields!
         . . . S VALUE=ORIGARR(DA,IENS,FIELDID,"I")
         . . . I FIELDTYP["P" D
         . . . . S PTDA=""
         . . . . F FINDDA=1:1:$L(FIELDTYP) I $E(FIELDTYP,FINDDA)?1N S PTDA=+$E(FIELDTYP,FINDDA,$L(FIELDTYP)) Q
         . . . . I PTDA]"",VALUE]"",$G(MAPARR(PTDA,VALUE)) S VALUE=$G(MAPARR(PTDA,VALUE))
         . . . I $D(OVERARR(DA,FIELDID)) S VALUE=OVERARR(DA,FIELDID)
         . . . S NEWARR(DA,NEWIENS,FIELDID)=VALUE
         . . . Q
         . . Q
         . Q
         Q
COPYFDA(MAINDA,IEN,OVERARR,MAPARR,NEWARR) 
         I MAINDA=55 S FDA="" F  S FDA=$O(NEWARR(55.09,FDA)) Q:FDA=""  D
         . S UPFDA=$P(FDA,",",2,$L(FDA,","))
         . I '$D(NEWARR(55.06,UPFDA)) S NEWARR(55.06,UPFDA,.01)=0,NEWARR(55.06,UPFDA,.5)=MAPARR(2,MYDFN)
         I MAINDA=120.86 S IENSARR(1)=MAPARR(2,MYDFN)
         ;I MAINDA=130 S IENSARR(1)=MAPARR(2,MYDFN)
         I MAINDA=55 S IENSARR(1)=MAPARR(2,MYDFN)
         I MAINDA=70 S IENSARR(1)=MAPARR(2,MYDFN)
         K ERRARR D UPDATE^DIE("US","NEWARR","IENSARR","ERRARR")
         I $G(DEBUG)=1 W !!,"***",MAINDA,?12,IEN,! ZW NEWARR W !,"-----",! ZW IE
NSARR
         I $D(ERRARR) ZW ERRARR Q
         S MAPARR(MAINDA,IEN)=IENSARR(1)
         I MAINDA=2 S MAPARR(9000001,IEN)=IENSARR(1),OVERARR(100,.02)=IENSARR(1)_";DPT("
         Q
         ;
GETSSN(DFN) ; Return an unused SSN starting at the patient's current SSN
         S SSN=$P($G(^DPT(DFN,0)),"^",9) I SSN="" W !,"Patient has no SSN!" S RETURN=-1 G GETSSNQ
         I SSN'?9N!($E(SSN,1,3)'="666") S SSN="REDCATED"
         S NEWSSN=SSN F  S NEWSSN=NEWSSN+1 Q:'$D(^DPT("SSN",NEWSSN))!($E(SSN,1,3)'="666")
         I NEWSSN?9N,$E(NEWSSN,1,3)="666" S RETURN=NEWSSN G GETSSNQ
         E  S RETURN=-1
GETSSNQ  Q NEWSSN
         ;
GETLVL(FILENUM) ; Return the level of a file number in the ^DD hierarchy
         F LVL=1:1 S FILENUM=$G(^DD(FILENUM,0,"UP")) Q:FILENUM=""
         Q LVL
         ;
XREFOFF(FILEID,FIELDID,XREFID) ; Deactivate a cross-reference
         S SXREF=$G(^DD(FILEID,FIELDID,1,XREFID,1))
         I $E(SXREF)'=";" S ^DD(FILEID,FIELDID,1,XREFID,1)=";"_SXREF
         S KXREF=$G(^DD(FILEID,FIELDID,1,XREFID,2))
         I $E(KXREF)'=";" S ^DD(FILEID,FIELDID,1,XREFID,2)=";"_KXREF
         Q
         ;
XREFON(FILEID,FIELDID,XREFID) ; Activate a cross-reference
         S SXREF=$G(^DD(FILEID,FIELDID,1,XREFID,1))
         I $E(SXREF)=";" S ^DD(FILEID,FIELDID,1,XREFID,1)=$E(SXREF,2,999)
         S KXREF=$G(^DD(FILEID,FIELDID,1,XREFID,2))
         I $E(KXREF)=";" S ^DD(FILEID,FIELDID,1,XREFID,2)=$E(KXREF,2,999)
         Q
         ;
