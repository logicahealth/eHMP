ZZADDICN ; SEB - locate patients with no ICN & create MPI request for one
 ;;1.2;Prescription Practices Extract;;MAY 1,1996;Build 6
 ;
EN N DFN,ICN,RET
LOOPDFN S DFN=0 F  S DFN=$O(^DPT(DFN)) Q:+DFN=0  D REQICN(DFN)
 Q
 ;
REQICN(DFN) S ICN=$$GET1^DIQ(2,DFN,991.01)
 I ICN="" S RET=$$A28^MPIFA28(DFN) W !,DFN,": ",RET
 Q
 ;
DELICNS ; Delete ICNs
 K ^ZZSEB("MPI")
 S DFN=0 F  S DFN=$O(^DPT(DFN)) Q:+DFN=0  S MPI=$G(^DPT(DFN,"MPI")) I $P(MPI,"^",3)=500,$P(MPI,"^",7)="" D DEL1(DFN)
 Q
 ;
DEL1(DFN) ; Delete ICN info for one patient
 W !,DFN,": ",^DPT(DFN,"MPI")
 S ^ZZSEB("MPI",DFN)=^DPT(DFN,"MPI")
 S ICN=$P(^DPT(DFN,"MPI"),"^"),FICN=$P(^DPT(DFN,"MPI"),"^",10)
 S DR="991.01///@;991.02///@;991.03///@;991.04///@;991.1///@"
 S DIE="^DPT(",DA=DFN D ^DIE
 K ^DPT("AICN",ICN,DFN),^DPT("AFICN",FICN,DFN)
 Q
