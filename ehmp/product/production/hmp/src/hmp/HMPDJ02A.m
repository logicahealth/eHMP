HMPDJ02A ;ASMR/MBS - Problems,Allergies,Vitals ;Aug 29, 2016 02:38:02
 ;;2.0;ENTERPRISE HEALTH MANAGEMENT PLATFORM;**4**;Aug 29, 2016;
 ;Per VA Directive 6402, this routine should not be modified.
 ;
 ; External References          DBIA#
 ; -------------------          -----
 ; ^TIU(8925                     6154
 ; ^TIU(8925, FIELD 1207         6488
 ; DIQ                           2056
 ; ICDCODE                       3990
 ; ICDEX                         5747
 ; $$ICDDATA^ICDXCODE            5699
 ;
 ; All tags expect DFN, ID, [HMPSTART, HMPSTOP, HMPMAX, HMPTEXT]
 ;
 Q
 ;
NOTE2ENC(IEN,ENC) ; Fill ENC array with dx codes from TIU note
 N ICDCODE,ICDSYS,POV,VIEN,VISIT,VISITDT
 ;DE5139 - Remove call to PCE4NOTE^ORWPCE3 and just call ENCEVENT^PXAPI directly
 ;Get visit for note
 S VISIT=$$GET1^DIQ(8925,IEN_",","1207","I") ; DBIA 6488 - read field #1207
 S:'VISIT VISIT=$$GET1^DIQ(8925,IEN_",",".03","I")
 Q:'VISIT
 ;Get visit data
 K ^TMP("PXKENC",$J)
 D ENCEVENT^PXAPI(VISIT)
 ;Get visit date/time
 S VISITDT=$P($G(^TMP("PXKENC",$J,VISIT,"VST",VISIT,0)),U)
 ;If Visit date/time doesn't exist, we don't have a good visit
 Q:VISITDT=""
 ;For each diagnosis...
 S POV=0 F  S POV=$O(^TMP("PXKENC",$J,VISIT,"POV",POV)) Q:'POV  D
 . ;Get diagnosis code
 . S ICDCODE=$P($G(^TMP("PXKENC",$J,VISIT,"POV",POV,0)),U)
 . Q:'ICDCODE
 . S ICDCSYS=$$SAB^ICDEX($$CSI^ICDEX(80,ICDCODE),DT)
 . S ICDCODE=$P($$ICDDATA^ICDXCODE(ICDCSYS,ICDCODE,DT),U,2)
 . ;If we don't already have this diagnosis...
 . I $D(ENC(ICDCODE,VISITDT))=0 D
 . . ;Get visit IEN
 . . S VIEN=$$GETVIEN^HMPDJ02(DFN,VISITDT)
 . . ;If IEN is valid, add diagnosis and visit information to list
 . . S:VIEN'=-1 ENC(ICDCODE,VISITDT)=VIEN_U_$G(DIAGS(LSTNUM))
 Q
