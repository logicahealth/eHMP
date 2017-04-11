@F280_Scope_Item @regression
Feature: F280 - Numeric Lab Results Applet
# Apply gist view type as an option against applet domains. "As an eHMP  user, I need to view a complete operation gist view to include the Labs domain that displays all defined panels and data; so that I can access Labs information for a given patient."

#POC: Team Venus

@F280_0_LabResultGist_View @US4258
Scenario: Verify Numeric Lab Results Gist applet
  # Given user is logged into eHMP-UI
  And user searches for and selects "Five,Patient"
  And Overview is active
  Then verify the Numeric Lab Results Gist title is "LAB RESULTS"
  And verify the Numeric Lab Results Gist applet has the following applet buttons
      | button  |
      | refresh |
      | info    |
      | filter  |
      | expand  |
  And verify the Numeric Lab Results Gist applet has the following headers
      | header   |
      | LAB TEST |
      | RESULT   |
      | LAST     |

@F280_3_LabResultsGist_View  @US4258 @DE2903 @DE2969
Scenario: Verify Numeric Lab Results Gist data display follows format
  # Given user is logged into eHMP-UI
  And user searches for and selects "Five,Patient"
  And Overview is active
  When the user has selected All within the global date picker
  Then the Numeric Lab Results Gist applet displays data
  And the Lab Test column contains data
  And the Result column contains data
  And the Last (Age) column in in the correct format
  And the Lab Test has a chart

@F280_1_LabResultsGist_View  @US4258 @DE2476
Scenario: Verfy numeric lab results for patient using Overview Sheet
	# Given user is logged into eHMP-UI
  And user searches for and selects "Five,Patient"
  Then Overview is active
  And the user has selected All within the global date picker
  And user sees Numeric Lab Results Gist
  Then the Numeric Lab Results Gist Applet contains data rows

@F280_2_LabResultsGist_View @US4258 @future
Scenario: Verfy numeric lab results for patient using Overview Sheet
	# Given user is logged into eHMP-UI
	And user searches for and selects "Ten,Patient"
  Then Overview is active
	And the user has selected All within the global date picker
  And user sees Numeric Lab Results Gist
  And the Numeric Lab Results Gist Applet contains data rows

  		
@f280_labresults_gist_refresh @DE2903 @DE2969
Scenario: Lab Results Gist displays all of the same details after applet is refreshed
  # Given user is logged into eHMP-UI
  And user searches for and selects "Five,patient"
  Then Overview is active
  And user sees Numeric Lab Results Gist
  And the user has selected All within the global date picker
  And the Numeric Lab Results Gist Applet contains data rows
  When user refreshes Numeric Lab Results Gist Applet
  Then the message on the Numeric Lab Results Gist Applet does not say "An error has occurred"
  
@f144_labresults_gist_exapnd_view_refresh 
Scenario: Lab Results Gist displays all of the same details after applet is refreshed
  And user searches for and selects "Five,patient"
  Then Overview is active
  And user sees Numeric Lab Results Gist
  And the user has selected All within the global date picker
  When the user clicks the control "Expand View" in the "numeric lab results applet"
  Given the user is viewing the expanded view of the Numeric Lab Results Applet
  And the Lab Results Applet contains data rows
  When user refreshes Lab Results Applet
  Then the message on the Lab Results Applet does not say "An error has occurred"

@f280_labresults_gist_sort
Scenario: User sorts lab results gist
  When user searches for and selects "Five,patient"
  And Overview is active
  And the user has selected All within the global date picker
  And user sees Numeric Lab Results Gist
  And the user sorts the Lab Results Gist by "Lab Test"
  Then the Lab Results Gist is sorted in alphabetic order based on Lab Test
  And the user sorts the Lab Results Gist by "Lab Test"
  And the Lab Results Gist is sorted in reverse alphabetic order based on Lab Test

@f280_labresults_gist_quicklook_button @debug @DE6842
Scenario: User views quicklook through toolbar
  Given user searches for and selects "Five,patient"
  And Overview is active
  And the user has selected All within the global date picker
  And user sees Numeric Lab Results Gist
  And the Numeric Lab Results Gist Applet contains data rows
  When the user views the first Numeric Lab Result Gist quick look via the toolbar
  Then a quickview displays a numeric lab table with expected headers
      | header     |
      | VALUE      |
      | REF. RANGE |
      | OBSERVED   |
      | FACILITY   |

@f280_labresults_gist_quicklook_result_column @debug @DE6842
Scenario: User views quicklook through results column
  Given user searches for and selects "Five,patient"
  And Overview is active
  And the user has selected All within the global date picker
  And user sees Numeric Lab Results Gist
  And the Numeric Lab Results Gist Applet contains data rows
  When the user views the first Numeric Lab Result Gist quick look via the results column
  Then a quickview displays a numeric lab table with expected headers
      | header     |
      | VALUE      |
      | REF. RANGE |
      | OBSERVED   |
      | FACILITY   |

@F280_LabResultsGist_detail_view @DE2903
Scenario: Verfy details for numeric lab results for patient using Gist view applet
  Given user searches for and selects "Five,Patient"
  And Overview is active
  And the user has selected All within the global date picker
  And user sees Numeric Lab Results Gist
  When the user views the first Numeric Lab Result Gist detail view
  Then the modal's title is displayed
  And the modal's title contains first Numeric Lab Result name
    
@F280_LabResultsGist_detail_from_expand_view
Scenario: Verfy details for numeric lab results for patient using expand view applet
	# Given user is logged into eHMP-UI
	And user searches for and selects "Five,Patient"
	Then Overview is active
	And the user has selected All within the global date picker
	And user sees Numeric Lab Results Gist
	When the user clicks the control "Expand View" in the "numeric lab results applet"
	Given the user is viewing the expanded view of the Numeric Lab Results Applet
	When the user views the "First Numeric Lab Result Row" lab result in a modal
  Then the modal's title is displayed
