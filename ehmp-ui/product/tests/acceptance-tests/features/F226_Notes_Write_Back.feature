@PO_F226_Notes_Write_Back @regression @future

Feature: F226 : Enter Plain Text Basic Progress Notes  (TIU)

@f226_notes_applet_form_validation
Scenario: Validate Notes Applet form fields.

  # Given user is logged into eHMP-UI
  And user searches for and selects "eighteen,patient"
  And Overview is active
  And POB user selects and sets new encounter "Cardiology"
  Then POB user opens the Notes applet
  And POB Notes applet displays the following headings
  | headings		|
  | Notes		    |
  | Unsigned		|
  | Uncosigned		|
  | Recently Signed	|
  And POB Notes applet has "NEW NOTE" button
  
@f226_notes_applet_new_note_form_validation
Scenario: Validate New Notes form field fields.

  # Given user is logged into eHMP-UI
  And user searches for and selects "eighteen,patient"
  And Overview is active
  And POB user selects and sets new encounter "Cardiology"
  Then POB user opens the Notes applet
  And POB user opens New Note to create a note
  And POB New Notes form displays the heading "NEW NOTE"
  And POB New Notes form displays the "Note Title *" with drop down list
  And POB New Notes form displays the date field "Date *"
  And POB New Notes form displays the time field "Time *"
  And POB New Notes form displays the note body "Note *"
  And POB New Notes displays buttons
  | Buttons			|
  | Delete			|
  | Save and Close	|
  | Sign			|
  
@f226_notes_applet_create_new_note
Scenario: Create new note.

  # Given user is logged into eHMP-UI
  And user searches for and selects "eighteen,patient"
  And Overview is active
  And POB user selects and sets new encounter "Cardiology"
  Then POB user opens the Notes applet
  And POB user opens New Note to create a note
  And POB user creates New Note "ADVANCE DIRECTIVE"
  And POB user saves the note "ADVANCE DIRECTIVE"
  And POB user sees the new note "ADVANCE DIRECTIVE" under unsigned notes header

@f226_notes_applet_signs_new_note 
Scenario: Sign a note.

  Given user views the login screen
  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "vk1234" verifycode as  "vk1234!!"
  Then the staff view screen is displayed
  Then Navigate to Patient Search Screen
  Then the patient search screen is displayed
  And user searches for and selects "eighteen,patient"
  And Overview is active
  And POB user selects and sets new encounter "Cardiology"
  Then POB user opens the Notes applet
  And POB user opens New Note to create a note
  And POB user creates New Note "ADHC SOCIAL WORK"
  And POB user signs the note "ADHC SOCIAL WORK" as "vk1234!!"
  And POB user sees the new note "ADHC SOCIAL WORK" under recently signed notes header
  
@f226_notes_applet_edit_and_preview_note
Scenario: Edit and preview note.

  # Given user is logged into eHMP-UI
  And user searches for and selects "eighteen,patient"
  And Overview is active
  And POB user selects and sets new encounter "Cardiology"
  Then POB user opens the Notes applet
  And POB user opens New Note to create a note
  And POB user creates New Note "ADVANCE DIRECTIVE"
  And POB user saves the note "ADVANCE DIRECTIVE"
  And POB user sees the new note "ADVANCE DIRECTIVE" under unsigned notes header
  And POB user opens note "ADVANCE DIRECTIVE" for editing
  And POB user previews note "ADVANCE DIRECTIVE"
  And POB user saves the note "ADVANCE DIRECTIVE"
  
@f226_notes_applet_delete_note
Scenario: Delete all notes.

  # Given user is logged into eHMP-UI
  And user searches for and selects "eighteen,patient"
  And Overview is active
  And POB user selects and sets new encounter "Cardiology"
  Then POB user opens the Notes applet
  And POB user deletes all unsigned notes created
  
  
 
