ZZCPDATA ; SEB - Copy clinical data from one IEN to another
         ;;1.0;VistA Data Support;;DECEMBER 18, 2015;Build 1
ALLDATA(MYDFN) ; Clone all data for a patient
         K MAPARR,CLONE
         D PATIENT
         D APPT
         D VISIT
         D ENC
         D PTF
         D ADT
         D VITALS
         D PROBLEMS
         D ALLERGY
         D NKA
         D SURGERY
         D CONSULTS
         D NOTES
         D ORDERS
         D RADS
         D INPATMED
         D DIET
         D LABRSLT
         D LABSPC
         D FLAGS
         Q
         ;
PATIENT  ; Clone patient demographics
         S CLONE(2,MYDFN)=""
         Q
         ;
APPT     ; Clone patient's appointments
         S APPTDT=0
         F  S APPTDT=$O(^DPT(MYDFN,"S",APPTDT)) Q:+APPTDT'=APPTDT  D
         . S CLINICID=+$G(^DPT(MYDFN,"S",APPTDT,0)),APPTID=0
         . F  S APPTID=$O(^SC(CLINICID,"S",APPTDT,1,APPTID)) Q:+APPTID'=APPTID  D
         . . I +$G(^SC(CLINICID,"S",APPTDT,1,APPTID,0))=MYDFN S CLONE(44.003,CLINICID_"^"_APPTDT_"^"_APPTID)=""
         . . Q
         . Q
         Q
         ;
VISIT    ; Clone visit data
         S VISITID=0
         F  S VISITID=$O(^AUPNVSIT("C",MYDFN,VISITID)) Q:+VISITID'=VISITID  S CLONE(9000010,VISITID)=""
         Q
         ;
ENC      ; Clone encounter data
         S ENCID=0
         F  S ENCID=$O(^SCE("C",MYDFN,ENCID)) Q:+ENCID'=ENCID  S CLONE(409.68,ENCID)=""
         Q
         ;
PTF      ; Clone patient's PTF records
         S PTFID=0
         F  S PTFID=$O(^DGPT("B",MYDFN,PTFID)) Q:+PTFID'=PTFID  S CLONE(45,PTFID)=""
         Q
         ;
ADT      ; Clone A/D/T data
         S ADTID=0 K UPDARR,ERRARR
         F  S ADTID=$O(^DGPM("C",MYDFN,ADTID)) Q:+ADTID'=ADTID  S CLONE(405,ADTID)=""
         Q
         ;
VITALS   ; Clone vitals data
         S VITALID=0
         F  S VITALID=$O(^GMR(120.5,"C",MYDFN,VITALID)) Q:+VITALID'=VITALID  S CLONE(120.5,VITALID)=""
         Q
         ;
PROBLEMS ; Clone patient's problems
         S PROBID=0
         F  S PROBID=$O(^AUPNPROB("AC",MYDFN,PROBID)) Q:+PROBID'=PROBID  S CLONE(9000011,PROBID)=""
         Q
         ;
ALLERGY  ; Clone patient's allergies
         S ALLERGID=0
         F  S ALLERGID=$O(^GMR(120.8,"B",MYDFN,ALLERGID)) Q:+ALLERGID'=ALLERGID  S CLONE(120.8,ALLERGID)=""
         Q
         ;
NKA      ; Clone patient's NKA flag
         S CLONE(120.86,MYDFN)=""
         Q
         ;
SURGERY  ; Clone patient's surgery records
         S SURGID=0 F  S SURGID=$O(^SRF("B",MYDFN,SURGID)) Q:SURGID=""  S CLONE(130,SURGID)=""
         Q
         ;
CONSULTS ; Clone patient's consults
         S CONSID=0 F  S CONSID=$O(^GMR(123,"F",MYDFN,CONSID)) Q:CONSID=""  S CLONE(123,CONSID)=""
         Q
         ;
NOTES    ; Clone patient's notes
         S NOTEID=0 F  S NOTEID=$O(^TIU(8925,"C",MYDFN,NOTEID)) Q:NOTEID=""  S CLONE(8925,NOTEID)=""
         Q
         ;
RADS     ; Clone patient's radiology orders and reports
         S RAOID=0 F  S RAOID=$O(^RAO(75.1,"B",MYDFN,RAOID)) Q:+RAOID'=RAOID  S CLONE(75.1,RAOID)=""
         S RARPTID=0 F  S RARPTID=$O(^RARPT("C",MYDFN,RARPTID)) Q:+RARPTID'=RARPTID  S CLONE(74,RARPTID)=""
         S CLONE(70,MYDFN)=""
         Q
         ;
INPATMED ; Clone patient's inpatient meds
         S CLONE(55,MYDFN)=""
         Q
         ;
DIET     ; Clone patient's diet orders
         S DIETDFN="P"_MYDFN,DIETID=$O(^FHPT("B",DIETDFN,"")) I DIETID="" Q
         S CLONE(115,DIETID)=""
         Q
         ;
ORDERS   ; Clone patient's orders
         S ORDFN=MYDFN_";DPT(",ORTYPE=0
         F  S ORTYPE=$O(^OR(100,"AW",ORDFN,ORTYPE)) Q:ORTYPE=""  D
         . S ORDATE=0 F  S ORDATE=$O(^OR(100,"AW",ORDFN,ORTYPE,ORDATE)) Q:ORDATE=""  D
         . . S ORDERID=0 F  S ORDERID=$O(^OR(100,"AW",ORDFN,ORTYPE,ORDATE,ORDERID)) Q:ORDERID=""  D
         . . . I '$D(MAPARR(100,ORDERID)) D
         . . . . S CLONE(100,ORDERID)=""
         . . . . S PACKREF=$G(^OR(100,ORDERID,4))
         . . . . I ORTYPE=4,$D(^PSRX(PACKREF,0)) S CLONE(52,PACKREF)=""
         . . . . Q
         . . . Q
         . . Q
         . Q
         Q
         ;
LABRSLT  ; Clone lab results
         S LRDFN=$G(^DPT(MYDFN,"LR")) I LRDFN="" Q
         S CLONE(63,LRDFN)=""
         Q
         ;
LABSPC   ; Clone specimen data
         S LRDFN=$G(^DPT(MYDFN,"LR")) I LRDFN="" Q
         S SPCDT=0 F  S SPCDT=$O(^LRO(69,"D",LRDFN,SPCDT)) Q:+SPCDT'=SPCDT  D
         . S SPCIEN=0 F  S SPCIEN=$O(^LRO(69,"D",LRDFN,SPCDT,SPCIEN)) Q:+SPCIEN'=SPCIEN  D
         . . S CLONE(69.01,SPCIEN_"^"_SPCDT)=""
         . . Q
         . Q
         Q
         ;
FLAGS    ; Clone patient flags
         S FLAGID=0 F  S FLAGID=$O(^DGPF(26.13,"B",MYDFN,FLAGID)) Q:FLAGID=""  D
         . S CLONE(26.13,FLAGID)=""
         . S HISTID=0 F  S HISTID=$O(^DGPF(26.14,"B",FLAGID,HISTID)) Q:HISTID=""  S CLONE(26.14,HISTID)=""
         . Q
         Q
         ;
DANS(COUNT,SRCIEN,SRCNAME) ; Generate "DAN" patients
         S ROMAN="I;II;III;IV;V;VI;VII;VIII;IX;X;XI;XII;XIII;XIV;XV;XVI;XVII;XVIII;XIX;XX;"
         S:$G(SRCNAME)="" SRCNAME=$P(^DPT(SRCIEN,0),"^") S MIDDLE=$P(SRCNAME," ",2)
         F START=1:1:$L(ROMAN,";") I MIDDLE=$P(ROMAN,";",START) Q
         I $P(ROMAN,";",START)="" S START=0
         I START+COUNT>20 W !,"No more patients available from the block of 20... Nothing added!" Q
         F NUM=START+1:1:START+COUNT D
         . S DESTNAME="PATIENT,DAN "_$P(ROMAN,";",NUM) W !,"Creating patient ",DESTNAME,"..."
         . D ALLDATA(SRCIEN,DESTNAME)
         . Q
         Q
         ;
COPD     ; Clone COPD,PATIENT MALE
         D ALLDATA(100882,"COPD,CHRISTMAS ONE")
         Q
         ;
DEPR     ; Clone DEPRESSION,PATIENT FEMALE
         D ALLDATA(100880,"DEPRESSION,PATIENT LADY")
         Q
         ;
