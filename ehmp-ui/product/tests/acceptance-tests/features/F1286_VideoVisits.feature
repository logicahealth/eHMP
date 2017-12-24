@F1286 @reg4
Feature:

Background:
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "USER  " verifycode as  "PW      "
  And staff view screen is displayed
  Given user searches for and selects "Eight,Patient"
  When the user clicks the Workspace Manager
  And the Workspace Manager lists a user defined workspace "automatedvideovisit"
  When the user navigates to "#/patient/automatedvideovisit"
  Then the "automatedvideovisit" screen is active

@video_display
Scenario: Verify Video Visit Applet display
  Given the Video Visit Applet displays
  Then the Video Visit Applet title is "VIDEO VISITS - NEXT 90 DAYS"
  And the Video Visit Applet header displays refresh, help, add, and filter buttons
  And the Video Visit Applet header does not display a min or max button
  And the Video Visit Applet table displays headers
  | header    |
  | Date/Time |
  | Facility  |
  | Location  |


@create_tray
Scenario: View Add Video Visit Tray
Given the Video Visit Applet displays
When the user selects the Add Video Visit button
Then the Create Video Visit Appointment tray displays
And the Create Video Visit Appointment tray has labels for
      | label                                         |
      | Date *                                        |
      | Time (EST) *                                  |
      | Duration *                                    |
      | Patient Email *                               |
      | Patient Phone                                 |
      | Phone Type                                    |
      | Provider Name                                 |
      | Provider Email *                              |
      | Provider Phone *                              |
      | Comment                                       |

@required_fields
Scenario: View Add Video Visit Tray
Given the Video Visit Applet displays
When the user selects the Add Video Visit button
Then the Create Video Visit Appointment tray displays
And the user fills in the fields
And the Create Video Visit Appointment tray create button enables


@add_video_instructions
Scenario: Add Video Visit - Additional Instructions
Given the Video Visit Applet displays
When the user selects the Add Video Visit button
And the Create Video Visit Appointment tray displays
And the user fills in the fields
And the user selects to include Additional Instructions
Then the Create Video Visit Appointment tray displays Additional Instructions elements
And the Create Video Visit Appointment tray create button enables

