@F1238 @F1238_Medication_Review @Medication_Review_applet @regression @reg2
Feature: Implement Tile Row Component - Medication Review

#Team Application
   
Background:

  Given user searches for and selects "fourteen,Patient"

@US18320_Medication_Review_Quick_Menu_Icon
Scenario: User can view the Quick Menu Icon in Medication Review applet
  And the user has selected All within the global date picker
  Then user navigates to Meds Review Applet
  And the Meds Review applet displays at least 1 outpatient medication
  And user hovers over the medication review applet row
  And user can view the Quick Menu Icon in medication review applet
  And Quick Menu Icon is collapsed in medication review applet
  When Quick Menu Icon is selected in medication review applet
  Then user can see the options in the medication review applet
      | options          | 
      | details          |
      | more information |  
  
@US18320_Medication_Review_details_view_from_quick_menu
Scenario: User can view details if details icon is selected from the quick view menu toolbar in Medication Review applet
  And the user has selected All within the global date picker
  Then user navigates to Meds Review Applet
  And the Meds Review applet displays at least 1 outpatient medication
  And user hovers over the medication review applet row
  And user can view the Quick Menu Icon in medication review applet
  And user selects the detail view from Quick Menu Icon of medication review applet
  Then the detail view displays
      | header             |
      | Order History      |
      | Links              |
      | Patient Education  |

