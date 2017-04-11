@F304   @reg1
Feature: Health Summaries (VistA Web Health Exchange)

Background:
  # Given user is logged into eHMP-UI
  And user searches for and selects "Eight,Patient"
  Then Overview is active

@US4755 @TC81_10 @TC81_11 @DE3938
Scenario: Verify that User's primary VistA is presented at the top of the list of VistA sites containing a Health Summary Report for the selected Patient
  When the user navigates to the Vista Health Summary applet
  Then the Vista Health Summary displays a list of VistA sites
  And the user's primary vista site "TST1" is listed first


#  future: fails only in phantomjs only on jenkins
@US4755 @TC81_12 @DE3939 @future
Scenario: Verify that Health Summaries are presented in alphabetical order
  When the user navigates to the Vista Health Summary applet
  Then the reports listed under each vista are in alphabetical order
  | vistas |
  | TST1   |
  | TST2   |

@US4755 @TC81_15 @DE3942 @US5138 @F304_1_10
Scenario: Verify that by selecting the column title 'Report', the applet group reports and sort by Report Name
  When the user navigates to the Vista Health Summary applet
  And the user sorts the vista summary reports applet by column Report
  And the vista summary reports applet sorts the reports in alphabetical order


@US4755 @TC81_19 @DE5402
Scenario: Verify that a count of available Health Summary Reports is displayed adjacent to each VistA site containing patient data match with the CPRS 
  When the user navigates to the Vista Health Summary applet
  Then the user counts the number of reports listed for vista site "TST1"
  When the user minimizes vista site "TST1"
  Then the vista summary reports applet displays the correct count for the group "TST1"

@US4755 @US4755_refresh
Scenario: Verify applet is correct after refresh
  When the user navigates to the Vista Health Summary applet
  When user refreshes Vista Health Summary Applet
  Then the message on the Vista Health Summary Applet does not say "An error has occurred"

@US4755 @TC81_8
Scenario: VERIFY Vista Health Summaries can be added to a user defined workspace
  When the user clicks the Workspace Manager
  And the user deletes all user defined workspaces
  And the user creates a user defined workspace named "vistahsview"
  When the user customizes the "vistahsview" workspace
  And the user adds an summary "vista_health_summaries" applet to the user defined workspace
  And the user selects done to complete customizing the user defined workspace
  Then the "VISTAHSVIEW" screen is active
  And the active screen displays 1 applets
  And the applets are displayed are
      | applet                 |
      | VISTA HEALTH SUMMARIES |