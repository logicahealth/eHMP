@PO_F926_Notes_Write_Back @DE4560 @future @debug @DE7370

Feature: F926 : Enter Plain Text Basic Progress Notes  (TIU), Move Notes Modal to Tray

@f926_notes_applet_form_validation
Scenario: Validate Notes Applet form fields.

  When user searches for and selects "eighteen,inpatient"
  Then Overview is active
  #And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  And POB user opens the Notes applet
  And POB Notes applet displays the following headings
  | headings		|
  | Unsigned		|
  | Uncosigned		|
  | My Signed Notes	|
  And POB Notes applet has "NEW NOTE" button
  
@f926_notes_applet_new_note_form_validation
Scenario: Validate New Notes form field fields.

  When user searches for and selects "eighteen,inpatient"
  Then Overview is active
  #And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  When POB user opens the Notes applet
  And POB user opens New Note to create a note
  Then POB New Notes form displays the heading "NEW NOTE"
  And POB New Notes form displays the "Note Title *" with drop down list
  And POB New Notes form displays the date field "Date *"
  And POB New Notes form displays the time field "Time *"
  And POB New Notes form displays the note body "Note *"
  And POB New Notes displays buttons
  | buttons			|
  | Delete			|
  | Preview			|
  | Draft			|
  | Sign			|
  And POB New Notes displays sidebar-subtray
  | obj				|
  | Note Objects	|
  | Open Consults	|
  
@f926_notes_applet_create_new_note
Scenario: Create new note.

  When user searches for and selects "eighteen,inpatient"
  Then Overview is active
  #And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  When POB user opens the Notes applet
  And POB user opens New Note to create a note
  And POB user creates New Note "ADVANCE DIRECTIVE"
  And POB user saves the note "ADVANCE DIRECTIVE"
  Then POB user sees the new note "ADVANCE DIRECTIVE" under unsigned notes header

@f926_notes_applet_signs_new_note 
Scenario: Sign a note.

  Given POB user is logged into EHMP-UI with facility as  "PANORAMA" accesscode as  "USER  " verifycode as  "PW      "
  Then staff view screen is displayed
  When user searches for and selects "eighteen,inpatient"
  Then Overview is active
  #And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  When POB user opens the Notes applet
  And POB user opens New Note to create a note
  And POB user creates New Note "ADHC SOCIAL WORK"
  And POB user signs the note "ADHC SOCIAL WORK" as "PW      "
  Then POB user sees the new note "ADHC SOCIAL WORK" under recently signed notes header
  
@f926_notes_applet_edit_and_preview_note
Scenario: Edit and preview note.

  When user searches for and selects "eighteen,inpatient"
  Then Overview is active
  #And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  Then POB user opens the Notes applet
  And POB user opens New Note to create a note
  And POB user creates New Note "ADVANCE DIRECTIVE COMPLETED"
  And POB user saves the note "ADVANCE DIRECTIVE COMPLETED"
  And POB user sees the new note "ADVANCE DIRECTIVE COMPLETED" under unsigned notes header
  And POB user opens note "ADVANCE DIRECTIVE COMPLETED" and edits
  And POB user previews note "ADVANCE DIRECTIVE COMPLETED"
  And POB user saves the note "ADVANCE DIRECTIVE COMPLETED"
  
@f926_notes_applet_delete_note
Scenario: Delete all notes.

  When user searches for and selects "eighteen,inpatient"
  Then Overview is active
  #And POB user selects and sets new encounter with location "Cardiology" and provider "Audiologist,One"
  And POB user opens the Notes applet
  And POB user deletes all unsigned notes created
  
  
 
