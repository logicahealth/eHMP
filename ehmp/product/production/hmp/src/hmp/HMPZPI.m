HMPZPI ;ASMR/MBS-Utility to load data into TREATING FACILITY (#391.91) file ; 12/11/15 11:26
 ;;2.0;Health Management Platform (HMP);1;Feb 05, 2015;Build 3
 ; This code should not be run at sites.
 Q
CORRIDS(IDLIST) ;Corrects the IDS for a patient
 N DFN,LOCAL,ID,HMPIDS,KEY,INST,TYPE,FOUND,IEN,HMPFDA,HMPERR,FDAFLDS,TMP,HMPIENA,WASERR,HMPFIND
 S LOCAL=+$$SITE^VASITE,WASERR=0
 F I=1:1:$L(IDLIST,U) D
 . S ID=$P(IDLIST,U,I)
 . I +ID=LOCAL S DFN=$P(ID,";",2)
 . S HMPIDS($$TOUPPER($P(ID,";")))=$$TOUPPER($P(ID,";",2))
 S KEY="" F  S KEY=$O(HMPIDS(KEY)) Q:KEY=""  D
 . W !
 . I KEY="ICN" D UPDTPAT(DFN,HMPIDS(KEY)) Q
 . S INST=$$KEY2INST(KEY),TYPE=$$KEY2TYP(KEY)
 . W !,"Searching for patient"_DFN_" for key "_KEY_" with inst="_INST_" and type="_TYPE
 . S IEN=0,FOUND=0 F  S IEN=$O(^DGCN(391.91,"B",DFN,IEN)) Q:'+IEN  D  Q:FOUND
 . . I $P(^DGCN(391.91,IEN,0),U,2)=INST D
 . . . W !?5,"Entry found: "_IEN
 . . . S FOUND=1
 . . . I $P(^DGCN(391.91,IEN,2),U,2)'=HMPIDS(KEY) D
 . . . . W !?5,"Needs updated value (current value: "_$P(^DGCN(391.91,IEN,2),U,2)_")"
 . . . . K HMPFDA,HMPERR S HMPFDA(391.91,IEN_",",11)=HMPIDS(KEY)
 . . . . D FILE^DIE(,"HMPFDA","HMPERR")
 . . . . I $D(HMPERR) D WERR(.HMPERR) Q
 . . . . W !?10,"Value updated successfuly"
 . I FOUND D
 . . W !?5,"Making sure entry is active"
 . . K HMPFDA,HMPERR,HMPIENA
 . . S FDAFLDS=$NA(HMPFDA(391.91,IEN_","))
 . . S @FDAFLDS@(12)="A"
 . . D UPDATE^DIE(,"HMPFDA","HMPIENA","HMPERR")
 . . I $D(HMPERR) D WERR(.HMPERR) Q
 . I 'FOUND D
 . . W !?5,"Entry not found, adding to TREATING FACILITY file"
 . . K HMPFDA,HMPERR,HMPIENA
 . . S FDAFLDS=$NA(HMPFDA(391.91,"+1,"))
 . . S @FDAFLDS@(.01)=DFN,@FDAFLDS@(.02)=INST,@FDAFLDS@(.09)=TYPE,@FDAFLDS@(11)=HMPIDS(KEY),@FDAFLDS@(12)="A"
 . . S @FDAFLDS@(10)=$S(KEY="EDIPI":"USDOD",1:"USVHA")
 . . D UPDATE^DIE(,"HMPFDA","HMPIENA","HMPERR")
 . . I $D(HMPERR) D WERR(.HMPERR) Q
 . . W !?10,"Entry added: "_$G(HMPIENA(1))
 W !,$S(WASERR>0:"ERRORS WERE REPORTED",1:"TREATING FACILITY FILE UPDATED SUCCESSFULLY")
 Q
WERR(HMPERR) ; Print error
 N I,J
 S (I,J)=0 F  S I=$O(HMPERR("DIERR",I)) Q:'+I  D
 . S J=0 F  S J=$O(HMPERR("DIERR",I,"TEXT",J)) Q:'+J  D
 . . W !,"ERROR:"_$G(HMPERR("DIERR",I,"TEXT",J))
 S WASERR=1
 Q
KEY2TYP(KEY) ;Return the ID type for a given key (stn#, ICN, or EDIPI)
 Q $S((KEY)?1"200".A:"??",+KEY:"PI",$P(ID,";")="ICN":"NI",KEY="EDIPI":"NI","VHIC":"NI",1:"")
 ;
KEY2INST(KEY) ;Return the Institution for a given key (stn#, ICN, or EDIPI)
 Q:$G(KEY)="" ""
 Q $S(KEY?1"200".A!(KEY="EDIPI"):$$FIND1^DIC(4,,,"ZZUSDOD"),+KEY:KEY,KEY="ICN":$$FIND1^DIC(4,,,"200M","D"),KEY="VHIC":$$FIND1^DIC(4,,,"742V1","D"),1:"")
 ;
UPDTPAT(DFN,ICN) ;Checks the patient file and updates ICN if necessary
 N HMPFDA,ID,CHKSM,MPI,HMPERR
 W !,"Checking if patient file needs ICN updated"
 I '$D(^DPT(DFN)) W !?5,"ERROR: Patient does not exist!" Q
 S ID=$P(ICN,"V"),CHKSM=$P(ICN,"V",2),MPI=$G(^DPT(DFN,"MPI"))
 I $P(MPI,U)'=ID S HMPFDA(2,DFN_",",991.01)=ID
 I $P(MPI,U,2)'=CHKSM S HMPFDA(2,DFN_",",991.02)=CHKSM
 I '$D(HMPFDA) W !?5,"Patient file does not need updating" Q
 W !?5,"Patient file needs updating (old ICN: "_$P(MPI,U)_"V"_$P(MPI,U,2)_")"
 D FILE^DIE(,"HMPFDA","HMPERR")
 I $D(HMPERR) D WERR(.HMPERR) Q
 W !?5,"Patient file ICN entry updated successfully"
 Q
TOUPPER(VAL) ; Convert to uppercase
 Q $TR(VAL,"abcdefghijklmnopqrstuvwxyz","ABCDEFGHIJKLMNOPQRSTUVWXYZ")
