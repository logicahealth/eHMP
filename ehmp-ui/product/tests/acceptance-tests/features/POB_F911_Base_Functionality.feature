Feature: Converted Existing Cucumber Tests to Cucumber/PageObjects

# POC: Team EnterPrise
# Updated by Saikat Barua on Oct, 25th 2015

@TC405 @TC406 @TC407 @TC409 @TC411 @TC412 @TC414 @TC415 @regression
Scenario: The cover sheet screen should load without issue
  Given POB user is logged into EHMP-UI successfully
  And POB user searches for "BCMA, EIGHT" and confirms selection
  When POB Cover Sheet is active
  Then POB the "Active & Recent Medications" Coversheet applet is displayed
  And POB the "Allergies" Coversheet applet is displayed
  And POB the "Appointments & Visits" Coversheet applet is displayed
  And POB the "Immunizations" Coversheet applet is displayed
  And POB the "Numeric Lab Results" Coversheet applet is displayed
  And POB the "Orders" Coversheet applet is displayed
  And POB the "Conditions" Coversheet applet is displayed
  And POB the "Vitals" Coversheet applet is displayed
  And POB the "Community Health Summaries" Coversheet applet is displayed
  And POB the error "An error has occured" is not displayed in any Coversheet applets

@TC416 @TC417 @TC418 @TC419 @TC420 @TC421 @TC422 @TC423 @future
Scenario: The overview screen should load without issue
  Given POB user is logged into EHMP-UI successfully
  And POB user searches for "BCMA, EIGHT" and confirms selection
  When POB Overview is active
  Then POB the "Numeric Lab Results" Overview applet is displayed
  And POB the "Vitals" Overview applet is displayed
  And POB the "Immunizations" Overview applet is displayed
  And POB the "Clinical Reminders" Overview applet is displayed
  And POB the "Encounters" Overview applet is displayed
  And POB the "Reports" Overview applet is displayed
  And POB the "Conditions" Overview applet is displayed
  And POB the "Active & Recent Medications" Overview applet is displayed
  And POB the error "An error has occured" is not displayed in any Overview applets

@TC408 @DE1786 @future
Scenario: The document screen should load without issue
  Given POB user is logged into EHMP-UI successfully
  And POB user searches for "BCMA, EIGHT" and confirms selection
  When POB user navigates to Documents Applet
  Then POB the Documents Expanded applet is displayed

@TC410 @future
Scenario: The timeline screen should load without issue
  Given POB user is logged into EHMP-UI successfully
  And POB user searches for "BCMA, EIGHT" and confirms selection
  When POB user navigates to Timeline Applet
  Then POB the Timeline Summary applet is displayed

@TC413 @future
Scenario: The user should be able to perform a text search
  Given POB user is logged into EHMP-UI successfully
  And POB user searches for "BCMA, EIGHT" and confirms selection
  When POB Overview is active
  Then POB user searches for "pulse" in Overview
  Then POB Text Search results are displayed

@TC486 @future
Scenario: The med review screen should load without issue
  Given POB user is logged into EHMP-UI successfully
  And POB user searches for "BCMA, EIGHT" and confirms selection
  When POB user navigates to Meds Review Applet
  Then POB the Med Review applet is displayed
