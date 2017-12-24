@F1175_activities @Activities_applet @reg1

Feature: F1175 : Use serializeData instead of collection manipulation

Background:
  Given user searches for and selects "bcma,eight"
  Then Summary View is active
  And user navigates to expanded activities applet

@US17616_add_consult_activity
Scenario: Create a consult order and review it in activities applet expanded view

  And the user takes note of number of existing activities
  And user adds a new consult
  And user selects "Physical Therapy" consult
  Then the Physical Therapy tray displays
  And user enters a request reason text "Test request reason"
  And user accepts the consult
  And user waits for Action tray to be updated with My Tasks
  Then an activity is added to the applet
  Then user makes sure there is at least one "consult" activity

@F1238 @F1238_Activities @US18302_Activities_details_from_Quick_Menu_summary_view
Scenario: User can view the details from Quick Menu Icon in Activities applet summary view
  Then user makes sure there is at least one "consult" activity
  And the user sorts the Activity applet by column Created On 
  And user hovers over the Activities applet row
  And user selects the detail view from Quick Menu Icon of Activities applet
  Then the detail modal for consult displays 

@F1238 @F1238_Activities @US18302_Activities_details_from_Quick_Menu_expand_view
Scenario: User can view the details from Quick Menu Icon in Activities applet expanded view
  And user navigates to expanded activities applet
  Then user makes sure there is at least one "consult" activity
  And the user sorts the Activity applet by column Created On 
  And user hovers over the Activities applet row
  And user selects the detail view from Quick Menu Icon of Activities applet
  Then the detail modal for consult displays 

@US17616_add_discontinue_consult_activity
Scenario: Discontinue a consult to create closed consult

  And the user takes note of number of existing activities
  And user adds a new consult
  And user selects "Physical Therapy" consult
  And user selects "Emergent (24 hours or less)" for urgency
  And user selects consult provider as "EHMP, UATEIGHT (Physician)"
  And user enters a request reason text "Test request reason 2"
  And user accepts the consult
  And user waits for Action tray to be updated with My Tasks
  Then an activity is added to the applet
  And user makes sure there is at least one "consult" activity
  And user views the details of the consult activity
  Then the detail modal for consult displays 
  And user discontinues the consult

@US17616_add_request_activity 
Scenario: F1175 : Create a request and review it in activities applet expanded view

  And the user takes note of number of existing activities
  And user adds a new request titled "Call Patient"
  And user enters a request details text "Status of medication"
  And user accepts the request
  And user waits for Action tray to be updated with My Tasks
  Then an activity is added to the applet
  And user makes sure there is at least one "Request" activity

@US17616_add_sign_note_activity @DE7370
Scenario: F1175 : Create an unsigned note and review it in activities applet expanded view

  And the user takes note of number of existing activities
  When POB user opens the Notes applet
  And POB user opens New Note to create a note
  And POB user creates New Note "ADVANCE DIRECTIVE"
  And POB user saves the note "ADVANCE DIRECTIVE"
  Then POB user sees the new note "ADVANCE DIRECTIVE" under unsigned notes header
  And user refreshes activities applet
  And an activity is added to the applet
  And user makes sure there is at least one "Note" activity

# @US17616_add_sign_order_activity @future
# Scenario: F1175 : Create an unsigned order and review it in activities applet expanded view

#   And the user takes note of number of existing activities
#   And POB user adds a new order
#   And POB user orders "24 hr urine protein" lab test
#   And POB user accepts the order
#   Then user refreshes activities applet
#   And an activity is added to the applet
#   And user makes sure there is at least one "Lab" activity

@US17616_activity_sort
Scenario: Sorts the actities applet based on column Domain

  Then activities applet has headers
  | headers          |
  | Urgency          |
  | Flag             |
  | Activity         |
  | Domain           |
  | Intended for     |
  | Assigned Facility|
  | Created by       |
  | Created at       |
  | Created on       |
  | Mode             |

  And the user sorts the Activity applet by column Domain 
  Then the Activity applet is sorted in alphabetic order based on column Domain
  And the user sorts the Activity applet by column Domain
  Then the Activities applet is sorted in reverse alphabetic order based on column Domain

@US17616_activity_filter
Scenario: User uses filters the activity appplet 

  And user filters the activity applet with text "phy"
  Then the activity table only diplays rows including text "phy"


@US17616_show_open_activities
Scenario: Display only open activities

  Then activities applet shows only activities that have are in "Open" mode
  
@US17616_show_closed_activities
Scenario: Display only closed activities

  And user selects to show only "Closed" activities
  Then activities applet shows only activities that have are in "Closed" mode
  
@US17616_show_open_and_closed_activities
Scenario: Display both open and closed activities

  And user selects to show only "Open and Closed" activities
  Then activities applet shows both Open and Closed activities

@US17616_activities_primary_filters
Scenario: Display primary filter of the activity applet

  Then user verifies activities applet primary filter contains options
  | options                       |
  | Activities Related to Me      |
  | Intended for Me or My Team(s) |
  | Created by Me                 |
  | All Activities                |
 And user selects primary filter "Created by Me"
 Then activities applet only shows activities that are created by "EHMP,UATTWO"

