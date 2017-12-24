ZZADMIT1 ; SEB - Admit patients for Performance Test team
 ;;1.0;VistA Data Support;;JAN 05, 2016;Build 1
ADMIT(DFN) ; Create admission records for patient with specified DFN
 I '$D(^DPT(DFN,0)) W !,"No patient with DFN=",DFN,"!" Q
 I +$G(^DPT(DFN,.105))>0 W !,"Patient is already admitted!" Q
 ;
 K PTFDATA,PTFIENS,ERRORS
 F FLDCT=1:1 S FLDINFO=$P($T(PTFDATA+FLDCT),";",3) Q:FLDINFO=""  D ADDDATA(.PTFDATA,FLDINFO)
 D UPDATE^DIE("S","PTFDATA","PTFIENS","ERRORS")
 I $D(ERRORS) W ! ZW ERRORS Q
 ;
 K MOVDATA,MOVIENS,ERRORS
 F FLDCT=1:1 S FLDINFO=$P($T(MOVDATA+FLDCT),";",3) Q:FLDINFO=""  D ADDDATA(.MOVDATA,FLDINFO)
 D UPDATE^DIE("S","MOVDATA","MOVIENS","ERRORS")
 I $D(ERRORS) W ! ZW ERRORS Q
 ;
 K MOVFILE,ERRORS
 S MOVFILE(405,MOVIENS(1)_",",.14)=MOVIENS(1)
 S MOVFILE(2,DFN_",",.105)=MOVIENS(1)
 D FILE^DIE("S","MOVFILE","ERRORS")
 I $D(ERRORS) W ! ZW ERRORS Q
 ;
 Q
 ;
ADDDATA(ARRAY,FLDINFO) ; Add data to array
 S FILENUM=$P(FLDINFO,"^"),FDA=$P(FLDINFO,"^",2),FIELDID=$P(FLDINFO,"^",3),VALUE=$P(FLDINFO,"^",4)
 I $E(VALUE,1)="=" S @("VALUE=$$"_$E(VALUE,2,999))
 S ARRAY(FILENUM,FDA,FIELDID)=VALUE
 Q
 ;
NOW() D NOW^%DTC
 Q %
 ;
TODAY() D NOW^%DTC
 Q X
 ;
DFN() Q DFN
 ;
PTFIENS(LVL) Q PTFIENS(LVL)
 ;
PTFDATA ; Data for PTF file (#45)
 ;;45^+1,^.01^=DFN()
 ;;45^+1,^2^=NOW()
 ;;45^+1,^6^0
 ;;45^+1,^11^1
 ;;45^+1,^20^9
 ;;45^+1,^20.1^0
 ;;45.02^+2,+1,^.01^1
 ;;45.02^+2,+1,^2^15
 ;;45.02^+2,+1,^3^0
 ;;45.02^+2,+1,^4^0
 ;;45.02^+2,+1,^10^=NOW()
 ;;45.02^+2,+1,^16^1110
 ;;45.02^+2,+1,^21^M
 ;;45.02^+2,+1,^22^=TODAY()
 ;;45.02^+2,+1,^23^0
 ;;45.02^+2,+1,^24^983
 ;;45.02^+2,+1,^25^0
 ;;45.0535^+3,+1,^.01^1
 ;;45.0535^+3,+1,^2^98
 ;;45.0535^+3,+1,^3^0
 ;;45.0535^+3,+1,^4^0
 ;;45.0535^+3,+1,^6^54
 ;;45.0535^+3,+1,^7^1
 ;;45.0535^+3,+1,^16^8025
 ;;
MOVDATA ; Data for Patient Movement file (#405)
 ;;405^+1,^.01^=NOW()
 ;;405^+1,^.02^1
 ;;405^+1,^.03^=DFN()
 ;;405^+1,^.04^1
 ;;405^+1,^.06^54
 ;;405^+1,^.1^CHEST PAINS
 ;;405^+1,^.12^4
 ;;405^+1,^.14^4723
 ;;405^+1,^.16^=PTFIENS(1)
 ;;405^+1,^.18^15
 ;;405^+1,^.22^0
 ;;405^+1,^.25^0
 ;;405^+1,^41^0
 ;;405^+1,^42^=NOW()
 ;;405^+1,^43^1
 ;;405^+1,^100^1
 ;;405^+1,^101^=NOW()
 ;;405^+1,^102^1
 ;;405^+1,^103^=NOW()
 ;;
