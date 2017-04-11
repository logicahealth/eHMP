HMPTIU ; CNP/JD/MBS/MAT - TIU Document (note) RPCs ;10/22/2015 10:45
 ;;2.0;ENTERPRISE HEALTH MANAGEMENT PLATFORM;;June 08, 2015;Build 2
 ;Per VA Directive 6402, this routine should not be modified.
 ;
 Q
 ; RPC: HMP SAVE NOTE STUB
STUB(RSLT,DATA) ;
 ;
 ;Output
 ; RSLT = Global Array of JSON formatted TIU Note data
 ;          or a message indicating why the note was NOT created.
 ;Input
 ; DATA("data") - input format - string
 ;   Piece 1: DFN - Patient IEN - ^DD(8925,.02
 ;   Piece 2: Document type - ^DD(8925,.01
 ;   Piece 3: Visit/episode date - ^DD(8925,.07
 ;   Piece 4: Hospital location - ^DD(8925,1205
 ;   Piece 5: Visit IEN - ^DD(8925,.03
 ;   Piece 6: Author/dictator - ^DD(8925,1202
 ;   Piece 7: Reference date - ^DD(8925,1301
 ;   Piece 8: Subject - ^DD(8925,1701
 ;   Piece 9: Visit string - location;date;service category
 ; DATA("text",n) - The nth line of the text of the note - Free text
 ;
 S RSLT=$NA(^TMP("DOCUMENT",$J)) K @RSLT
 N DFN,FILTER,HMP,IENTIU,TEXT,TITLE,TIUX,VDT,VLOC,VSIT,VSTR
 ;
 ; Validate required input.
 S U="^"
 N RESP S RESP=$$PARSE(.DATA) I +RESP<0 D  Q
 . S @RSLT@(1)=$$ZERRJSON("Error in routine HMPTIU: "_$P(RESP,U,2))
 ; Save document by Invoking RPC: TIU CREATE RECORD
 D MAKE^TIUSRVP(.IENTIU,DFN,TITLE,VDT,VLOC,VSIT,.TIUX,VSTR,1)
 I +IENTIU=0 D  Q
 . S @RSLT@(1)=$$ZERRJSON("Error creating note: "_$P(IENTIU,U,2))
 S HMP=$NA(^TMP("HMPDOC",$J)) K @HMP
 S FILTER("id")=IENTIU ;ien for the TIU DOCUMENT file (#8925)
 S FILTER("patientId")=DFN ;patient identifier
 S FILTER("domain")="document" ;domain name for write back and freshness stream staging
 S FILTER("noHead")=1 ;no header record required.
 D GET^HMPDJ(.RSLT,.FILTER) ;build the JSON array in the ^TMP global
 K ^TMP("DOCUMENT",$J)
 M ^TMP("DOCUMENT",$J)=@RSLT
 S RSLT=$NA(^TMP("DOCUMENT",$J))
 S HMPFCNT=0
 S HMPUID=$$SETUID^HMPUTILS("document",DFN,IENTIU)
 S HMPE=^TMP("DOCUMENT",$J,1,1)
 S STMPTM=$TR($P($P(HMPE,"lastUpdateTime",2),","),""":")
 D ADHOC^HMPUTIL2("document",HMPFCNT,DFN,HMPUID,STMPTM)
 K RSLT
 S RSLT=$$EXTRACT(HMP)
 M ^TMP("HMPDOC",$J)=RSLT
 K RSLT
 S RSLT=$NA(^TMP("HMPDOC",$J))
 ;Clear work files
 Q
 ; . ; TIUX("HDR")="<page>^<of pages>"="1^1"
 ; . S TIUX("HDR")="1^1"
 ; . ; Save document text by invoking the already existing RPC (TIU SET DOCUMENT TEXT)
 ; . I $D(TIUX("TEXT"))>0 D SETTEXT^TIUSRVPT(.TEXT,OK,.TIUX,0)
 ; S RSLT=OK
 Q
 ; RPC: HMP WRITEBACK TIU NOTE DELETE
DELETE(RET,IEN,RSN) ; Delete a TIU note
 S RET=$NA(^TMP("HMPDOC",$J)) K @RET
 I 'IEN S @RET@(1)=$$ZERRJSON("No note specified.") Q
 I '$D(^TIU(8925,IEN)) S @RET@(1)=$$ZERRJSON("Note doesn't exist.") Q
 ; 
 ; Note: CANDO^TIUSRVA implements record locking. [??? ICR]
 ; /* Below call is included in DELETE^TIUSRVP.
 ;      D CANDO^TIUSRVA(.RSLT,IEN,"DELETE RECORD")
 ;      I +RSLT=0 S RET=$$ZERRJSON($P(RSLT,U,2)) Q
 ; */
 ; K RSLT
 ; /* Below is the only %RFIND occurrence of NEEDJUST in TIU*
 ;      D NEEDJUST^TIUSRVA(.RSLT,IEN)
 ;      I +RSLT,$G(RSN)="" D  Q
 ;      . S RET=$$ZERRJSON("Deleting this note requires a justification.")
 ; */
 S RSN="" ;We don't need a justification, so don't send one if they did try to send it
 K RSLT D DELETE^TIUSRVP(.RSLT,IEN,RSN)
 I +RSLT S @RET@(1)=$$ZERRJSON($P(RSLT,U,2)) Q
 S HMPI=0
 S HMP=$NA(^TMP("HMPDOC",$J)) K @HMP
 D TIU1^HMPDJ08(IEN)
 S RTN=$NA(^TMP("HMPDOC",$J))
 Q
PARSE(INFO) ; Parses the DATA array. Also called by UPDATE^HMPWBD1.
 ; Assume input is presented as a string with DFN in piece1
 N OUT
 S INFO=$G(DATA("data"))
 S DFN=$P(INFO,U)
 I '$G(DFN) Q "-1^Missing DFN."
 I $D(^DPT(DFN))'>0 Q "-1^Invalid DFN - "_DFN
 S TITLE=$P(INFO,U,2)
 I TITLE="" Q "-1^Document TITLE undefined."
 I $D(^TIU(8925.1,TITLE))'>0 Q "-1^Document TITLE invalid."
 ; Set remaining variables for the RPC
 S VDT=$P(INFO,U,3)
 S VLOC=$P(INFO,U,4)
 S VSIT=$P(INFO,U,5)
 S VSTR=$P(INFO,U,9)
 ; Set the local array for the RPC
 S TIUX(.01)=TITLE
 S TIUX(1202)=$P(INFO,U,6)
 S TIUX(1205)=VLOC
 S TIUX(1301)=$P(INFO,U,7)
 S TIUX(1701)=$P(INFO,U,8)
 ; Build the "text" section of the local array if it exists
 I $D(DATA("text"))>0 D
 . N HMPA
 . S HMPA=0
 . F  S HMPA=$O(DATA("text",HMPA)) Q:HMPA']""  D
 . . S TIUX("TEXT",HMPA,0)=DATA("text",HMPA)
 Q 0
EXTRACT(GLOB) ; Move ^TMP("HMPF",$J) into string format
 N HMPSTOP,HMPFND,X
 S RSLT="",X=0,HMPSTOP=0,HMPFND=0
 S (I,J)=0
 F  S I=$O(^TMP("HMPF",$J,I)) Q:I=""!(HMPSTOP)  D
 . F  S J=$O(^TMP("HMPF",$J,I,J)) Q:J=""  D
 .. I $G(^TMP("HMPF",$J,I,J))["syncStatus" D
 ... Q:$P(^TMP("HMPF",$J,I,J),":",1)["domainTotals"
 ... S RSLT(X)=RSLT(X)_$P(^TMP("HMPF",$J,I,J),",",1)
 ... S HMPSTOP=1
 ... Q
 .. Q:$G(^TMP("HMPF",$J,I,J))=""
 .. Q:$P(^TMP("HMPF",$J,I,J),",",1)'["document"
 .. ;Q:$P(^TMP("HMPF",$J,I,J),",",2)'["documentDefUid"
 .. Q:$P(^TMP("HMPF",$J,I,J),":",1)["domainTotals"
 .. S X=X+1
 .. S RSLT(X)=$G(^TMP("HMPF",$J,I,J))
 .. F  S J=$O(^TMP("HMPF",$J,I,J)) Q:J=""  D
 ... Q:$P(^TMP("HMPF",$J,I,J),":",1)["domainTotals"
 ... S X=X+1
 ... S RSLT(X)=$G(^TMP("HMPF",$J,I,J))
 ... S HMPFND=1
 ... Q
 .. S I=$O(^TMP("HMPF",$J,I))
 .. Q
 . Q
 Q RSLT
 ;
 ;
ZERRJSON(INPUT) ; Wrap errmsg for JSON.
 Q "{ ""error"" : """_INPUT_""" }"
 ;
