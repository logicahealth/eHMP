ZZADDSSN ; SEB - Add SSNs to users who have no SSN on file
 ;;1.0;VistA Data Support;;February 3, 2016;Build 1
USER S SSN=666000000,IEN=0,FLAGS="ES"
 F  S IEN=$O(^VA(200,IEN)) Q:+IEN'=IEN  I $P($G(^VA(200,IEN,1)),"^",9)="" D
 . S SSN=$$GETSSN(SSN) K FDA,ERRORS S FDA(200,IEN_",",9)=SSN
 . D FILE^DIE(FLAGS,"FDA","ERRORS")
 . I $D(ERRORS) W ! ZW ERRORS
 . E  W !,IEN," - ",$P($G(^VA(200,IEN,0)),"^"),": ",SSN
 . Q
 Q
 ;
GETSSN(SSN) F  S SSN=SSN+1 I '$D(^VA(200,"SSN",SSN)) Q
 Q SSN
