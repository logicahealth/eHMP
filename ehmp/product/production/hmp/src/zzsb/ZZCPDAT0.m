ZZCPDAT0 ; SEB - Copy clinical data from one IEN to another - prompts for ZZCPDA
TA
         ;;1.0;VistA Data Support;;JUL 15 2016;Build 1
         Q
         ;
CLONE    ; Entry point for "RISA CLONE A PATIENT" menu option
         S MYDFN=$$GETDFN^ZZCPDAT0()
         I MYDFN="-1" Q
         S NAME=$$GETNAME^ZZCPDAT0()
         I NAME="" Q
         S DEBUG=$$GETDEBUG^ZZCPDAT0()
         D ALLDATA^ZZCPDATA(MYDFN)
         D CLONE^ZZCPDAT1(MYDFN,NAME)
         Q
         ;
GETINFO  ; Entry point for "RISA GET PATIENT INFO" menu option
         S MYDFN=$$GETDFN^ZZCPDAT0()
         I MYDFN="-1" Q
         D ALLDATA^ZZCPDATA(MYDFN)
         S FILENUM=0 F  S FILENUM=$O(CLONE(FILENUM)) Q:FILENUM=""  D
         . S DFN=0 F  S DFN=$O(CLONE(FILENUM,DFN)) Q:DFN=""  W !,FILENUM,"^",DFN
         . Q
         Q
         ;
GETDFN() S DIC="^DPT(",DIC(0)="QEAMZ",DIC("A")="Select a patient: " D ^DIC
         Q +Y
         ;
GETNAME() S NAME=""
NAME     R !,"Enter the name of the new patient: ",NAME
         I NAME="" Q ""
         I $E(NAME)="?" W !,"Select the name of the new patient. It should be in the format LAST,FIRST MIDDLE." G NAME
         S X=NAME X $P(^DD(2,.01,0),"^",5,99) I '$D(X) W !,"Invalid name format! Please try again." G NAME
         Q NAME
         ;
GETDEBUG() S DEBUG=""
DEBUG    R !,"Show debug messages? ",DEBUG
         I DEBUG="" Q ""
         I $E(DEBUG)="?" W !,"Answer YES or NO. If YES is selected, then information about each entry cloned will be displayed." G DEBUG
         I "YN01"'[$E(DEBUG) W !,"Please answer YES or NO." G DEBUG
         S DEBUG=$E(DEBUG),DEBUG=$S("N0"[DEBUG:0,1:1)
         Q DEBUG
         ;
