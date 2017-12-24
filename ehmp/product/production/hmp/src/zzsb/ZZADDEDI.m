ZZADDEDI ; SEB - Add EDIPI to specified patients
 ;;1.0;VistA Data Support;;JUNE 6, 2016;Build 26
EN S DFN=0 F  S DFN=$O(^ZZADDEDI(DFN)) Q:DFN=""  D
 . D EDIPI(DFN)
 . I $G(^ZZADDEDI(DFN,1))="Y" D DELPROB(DFN)
 . Q
 Q
 ;
EDIPI(DFN)
 S IDENTS=$G(^ZZADDEDI(DFN,0))
 I IDENTS="" W !,"No identifier info for patient ",DFN,"!" Q
 D CORRIDS^HMPZPI(IDENTS)
 Q
 ;
DELPROB(DFN)
 S IEN=0 F  S IEN=$O(^AUPNPROB("AC",DFN,IEN)) Q:IEN=""  S DA=IEN,DIK="^AUPNPROB(" D ^DIK
 Q
 ;
