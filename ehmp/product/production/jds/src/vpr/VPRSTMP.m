VPRSTMP ;KRM/CJE -- Utilities for Metastamps
 ; No entry from top
 Q
 ;
ISSTMPTM(STAMPTIME) ; Ensure passed stampTime is valid
 I STAMPTIME="" Q 0 ; Null not allowed
 I STAMPTIME["."  Q 0 ; Subsecond stampTime not allowed
 I STAMPTIME'=+STAMPTIME  Q 0 ; stampTime should be numeric
 Q 1
