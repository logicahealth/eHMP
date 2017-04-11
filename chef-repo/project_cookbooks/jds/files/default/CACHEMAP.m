CACHEMAP(NAMESPACE,GLOBAL,ROUTINE) ; Map specified Globals and Routines to specified Namespace
 ; Get current namespace
 N NMSP,PROP
 I $P($P($ZV,") ",2),"(")<2012 S NMSP=$ZU(5)
 I $P($P($ZV,") ",2),"(")>2011 S NMSP=$NAMESPACE
 ;
 ; Only applicable to VistA configuration
 ; Fix this later to use a generic error trap
 N $ET S $ET="ZN NMSP D ERROR^CACHEMAP S $EC="""""
 ;
 ; Go to SYS Namespace
 ZN "%SYS"
 ; Get all namespace properties
 N STATUS S STATUS=##Class(Config.Namespaces).Get(NMSP,.PROP)
 I 'STATUS W !,"Error="_$SYSTEM.Status.GetErrorText(%) S $EC=",U-CONFIG-FAIL," QUIT
 ;
 ; get the database globals location
 N DBG S DBG=NAMESPACE
 ; get the database routines location
 N DBR S DBR=NAMESPACE
 ;
 ; Map %ut globals away from %SYS
 I $G(GLOBAL)'="" D
 . N STATUS S STATUS=##class(Config.Configuration).GetGlobalMapping(NMSP,GLOBAL,"",DBG,DBG)
 . I 'STATUS S STATUS=##class(Config.Configuration).AddGlobalMapping(NMSP,GLOBAL,"",DBG,DBG)
 . I 'STATUS W !,"Error="_$SYSTEM.Status.GetErrorText(%) S $EC=",U-CONFIG-FAIL," QUIT
 ;
 ; Stop processing if we had an error
 I $G(ERROR) ZN NMSP Q
 ;
 ; Map routines away from namespace
 I $G(ROUTINE)'="" D
 . N PROPRTN S PROPRTN("Database")=DBR
 . N STATUS S STATUS=##Class(Config.MapRoutines).Get(NMSP,ROUTINE,.PROPRTN)
 . N PROPRTN S PROPRTN("Database")=DBR  ; Cache seems to like deleting this
 . I 'STATUS S STATUS=##Class(Config.MapRoutines).Create(NMSP,ROUTINE,.PROPRTN)
 . ; No need to set an error to control processing we want to move back to the namespace anyway
 . I 'STATUS W !,"Error="_$SYSTEM.Status.GetErrorText(%) S $EC=",U-CONFIG-FAIL," QUIT
 ;
 ZN NMSP ; Go back to original namespace
 Q
 ;
ERROR
 W !,"Error processing Cache database mapping",!,"Error "_$SYSTEM.Status.GetErrorText($G(STATUS)),!
 Q
