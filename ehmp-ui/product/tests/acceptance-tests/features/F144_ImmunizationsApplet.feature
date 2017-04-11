@US2171 @regression @triage
Feature: F144 - eHMP viewer GUI - Immunizations
#Team Neptune

Background:
	Given user is logged into eHMP-UI
	And user searches for and selects "Eight,Patient"
	Then Cover Sheet is active
  Then the Immunizations applet displays 



@US2171 @immunization_coversheet_sort
Scenario: User uses the Immunizations coversheet to sort
    When the user sorts the Immunizations grid by "Vaccine Name" 
    Then the Immunizations grid is sorted in alphabetic order based on Vaccine Name
    When the user sorts the Immunizations grid by "Facility"
    Then the Immunizations grid is sorted in alphabetic order based on Facility

@US2171 @immunization_coversheet_filter
Scenario: User uses the Immunizations coversheet to filter
    When the user clicks the "Immunizations Filter Button"
	And the user filters the Immunizations Applet by text "pne"
	Then the immunizations table only diplays rows including text "pne"

@US2171 @immunization_coversheet_detail @debug @DE3709
Scenario: User views the details of an Immunization
    Given the immunization applet displays at least 1 immunization
    When the user views the details for the first immunization
    Then the modal is displayed
    And the Immunization Detail modal displays 
      | modal item      |
      | Name Label |
      | Name |
      | Reaction Label |
      | Reaction |
      | Series Label |
      | Series |
      | Repeat Label |
      | Repeat |
      | Date Label |
      | Date |
      | Facility Label |
      | Facility |
      | Site Label |
      | Site |
      | next button     |
      | previous button |
      | close button    |


@US2171 @immunization_expanded_sort
Scenario: User uses the Expanded Immunizations to sort
    When the user clicks the Immunizations Expand Button
    And the user is viewing the Immunizations expanded view
    When the user sorts the Immunizations grid by "Vaccine Name" 
    Then the Immunizations grid is sorted in alphabetic order based on Vaccine Name

@US2171 @immunization_expanded_filter
Scenario: User uses the Expanded Immunizations to filter
    When the user clicks the Immunizations Expand Button
    And the user is viewing the Immunizations expanded view
    And the user clicks the "Immunizations Filter Button"
	And the user filters the Immunizations Applet by text "Ant"
	Then the immunizations table only diplays rows including text "Ant"
	
@f144_immunization_applet_summary_view_refresh 
Scenario: Immunization Summary applet displays all of the same details after applet is refreshed
  And the Immunization Applet contains data rows
  When user refreshes Immunization Applet
  Then the message on the Immunization Applet does not say "An error has occurred"
  
@f144_immunization_applet_expand_view_refresh 
Scenario: Immunization expand view applet displays all of the same details after applet is refreshed 
  When the user clicks the Immunizations Expand Button
  And the user is viewing the Immunizations expanded view
  And the Immunization Applet contains data rows
  When user refreshes Immunization Applet
  Then the message on the Immunization Applet does not say "An error has occurred"
