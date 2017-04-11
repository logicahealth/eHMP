HMPTIUL ;ASMR/HM - RPC to display long list of titles; 12/24/2015 14:46
 ;;2.0;ENTERPRISE HEALTH MANAGEMENT PLATFORM;**;
 ;PER VA Directive 6402, this routine should not be modified
 Q
 ;
LONGLIST(Y) ;long list of titles
 ;.Y = Return list of dfn and title with inactive titles removed
 ;and will return all titles with restrictions e.g 831^AUDIOLOGY
 N I,X,CLASS,FROM,DA,SN,ST
 S I=0,CLASS=0,FROM=""
 F  S CLASS=$O(^TIU(8925.1,"ACL",CLASS)) Q:+CLASS'>0  D  ;ICR 5677 TIU NATIONAL TITLE LINK
 . F  S FROM=$O(^TIU(8925.1,"ACL",CLASS,FROM)) Q:FROM=""  D
 . . S DA=0
 . . F  S DA=$O(^TIU(8925.1,"ACL",CLASS,FROM,DA)) Q:+DA'>0  D
 . . . S SN=$G(^TIU(8925.1,DA,0)),ST=$P(SN,"^",7)
 . . . I ST=11 S I=I+1,Y(I)=DA_"^"_FROM ;POPULATE LIST
 Q
 ;
