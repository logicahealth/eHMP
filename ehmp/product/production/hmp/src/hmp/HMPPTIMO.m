HMPPTIMO ;;AFS/MBS - HMP timeout post-install setup; ; 2/27/17 2:16pm
 ;;2.0;ENTERPRISE HEALTH MANAGEMENT PLATFORM;**4**;Feb 15, 2017;Build 3
 ;Per VA Directive 6402, this routine should not be modified
 ; External References    DBIA#
 ; -------------------    -----
 ; $$FIND1^DIC            2051
 ; MSG^DIALOG             2050
 ; FILE^DIE               2053
 ; GETS^DIQ               2056
 ; MES^XPDUTL            10141
 Q
POST ;Add initial values to timeout and retry count fields of #800000 file
 N IENS,HMPFDA,FDA,DIERR,HMPGETS,MSG,I
 D MES^XPDUTL("RUNNING POST^HMPPTIMO")
 S IENS=$$FIND1^DIC(800000,,"X","hmp-development-box")_","
 I 'IENS D  Q
 . D MES^XPDUTL("Error: could not find hmp-development-box entry in HMP SUBSCRIPTON (#800000) FILE.")
 D GETS^DIQ(800000,IENS,".08;.09",,"HMPGETS")
 ; Default value for timeout: 300
 ; Default value for retry count: 5
 S:'$G(HMPGETS(800000,IENS,.08)) FDA(800000,IENS,.08)=300
 S:'$G(HMPGETS(800000,IENS,.09)) FDA(800000,IENS,.09)=5
 I $D(FDA) D FILE^DIE(,"FDA")
 I $G(DIERR) D
 . D MES^XPDUTL("Error adding initial values to hmp-development-box:")
 . D MSG^DIALOG("AT",.MSG)
 . F I=1:1:+$G(MSG) D MES^XPDUTL($G(MSG(I)))
 Q
