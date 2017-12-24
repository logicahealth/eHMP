@F1286 @reg3
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
  And the Video Visit Applet displays appointments scheduled for the next 90 days

@video_sort
Scenario: Sort
Given the Video Visit Applet displays
And the Video Visit Applet displays at least 2 rows
When the user sorts the Video Visit Applet on Column Date
And the Video Visit Applet is sorted by Date/Time ascending
When the user sorts the Video Visit Applet on Column Date
Then the Video Visit Applet is sorted by Date/Time descending

@video_filter
Scenario: Filter
Given the Video Visit Applet displays
And the Video Visit Applet displays at least 2 rows
When the user filters the Video Visit applet
Then the Video Visit applet is filtered

@video_quickmenu
Scenario: Quick Menu
Given the Video Visit Applet displays
And the Video Visit Applet displays at least 1 rows
Given user hovers over the Video Visit row                      
And user can view the Quick Menu Icon in Video Visit applet
And Quick Menu Icon is collapsed in Video Visit applet                       
When Quick Menu Icon is selected in Video Visit applet                       
Then user can see the options in the Video Visit applet                      
      | options |
      | details |

@view_details
Scenario: View Details
Given the Video Visit Applet displays
And the Video Visit Applet displays at least 1 rows
When the user selects the first Video Vist applet row
Then the Video Visit detail modal displays


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

@video_action_tray
Scenario: Telehealth Appointment avaiable via Action Tray
Given the Actions button is displayed
When the user selects the Actions button
Then the New Action tray is displayed
And the New Action tray displays an option for Telehealth Appointment
