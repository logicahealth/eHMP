HMPDERRH ;SLC/AGP,ASMR/RRB,AFS/PB - HMP Error Handler;3/21/12 5:44pm
 ;;2.0;ENTERPRISE HEALTH MANAGEMENT PLATFORM;*4*;Sep 01, 2011;Build 63
 ;Per VA Directive 6402, this routine should not be modified.
 ;
 ; External References          DBIA#
 ; -------------------          ----- 
 ; %ZTER,UNWIND^%ZTER           1621
 ; EC^%ZOSV                     10097
 Q
 ;
ERRHDLR ; -- save errors to return in JSON [Expects ERRPAT, ERRMSG]
 N ERROR S ERROR=$$EC^%ZOSV
 ;
 ;Ignore the "errors" the unwinder creates.
 I ERROR["ZTER" D UNWIND^%ZTER
 ;
 ;Make sure we don't loop if there is an error during processing of
 ;the error handler.
 N $ET S $ET="D ^%ZTER,UNWIND^%ZTER"
 ;
 ;Save the error then put it in the error trap, this saves the correct
 ;last global reference.
 D ^%ZTER
 ;
 N CNT,MSGCNT
 S CNT=+$G(^TMP($J,"HMP ERROR","# of Errors"))
 S CNT=CNT+1,^TMP($J,"HMP ERROR","# of Errors")=CNT
 S MSGCNT=+$O(^TMP($J,"HMP ERROR","ERROR MESSAGE",""),-1)
 I $G(ERRPAT)>0,MSGCNT=0 S MSGCNT=MSGCNT+1,^TMP($J,"HMP ERROR","ERROR MESSAGE",MSGCNT)="An error occurred on patient: "_$G(ERRPAT)
 I $G(ERRMSG)'="" S MSGCNT=MSGCNT+1,^TMP($J,"HMP ERROR","ERROR MESSAGE",MSGCNT)=ERRMSG
 S:$G(ERROR)'="" MSGCNT=$G(MSGCNT)+1,^TMP($J,"HMP ERROR","ERROR MESSAGE",MSGCNT)="The error is: "_$G(ERROR) ;Log the error message into TMP
 ;I $D(ERRARRY) D
 ;.S DOMCNT=$O(^TMP($J,"HMP ERROR",ERRPAT,ERRDOM,"DATA",""))+1
 ;.I $D(ERRARRY)>0 M ^TMP($J,"HMP ERROR",ERRPAT,ERRDOM,"DATA",DOMCNT)=ERRARRY
 ;if unwind I lose the entire process, which returns incomplete data to the extract return value.
 ;D GTQ^HMPDJ
 D UNWIND^%ZTER
 Q
