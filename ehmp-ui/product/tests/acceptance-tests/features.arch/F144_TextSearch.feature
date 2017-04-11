@f144_text_search @regression @triage

Feature: F144-eHMP Viewer GUI - Text Search
#User shall type a set of words into the search text box
#After the user types 3 characters, the user shall be presented with a list of suggested search items/types
#Once the user clicks the search button or selects the search item/type,
#The system shall return a list of results for a previously selected patient, grouped by item type
#Each item in the search results shall activate a detail area for the item clicked

	
@f144_1_text_search @US2226  @debug
Scenario: User can conduct text search
  # Given user is logged into eHMP-UI
  And user searches for and selects "TEN,PATIENT"
  And the coversheet is displayed
  #Then from the coversheet the user clicks on "Record Search"
  Then user searches for "lab"
  And user type text term and the page contains total items and search results
      | text           | total_items |
      | lab            | 375         |
      | med            | 305         |
      | fever          | 2           |
      | yellow fever   | 1           |
      #| progress notes | 51          |

#Debug tag because test works fine in firefox, but fails in Phantom JS
@f144_4_text_search_filter_by_custom_from_to @US2375 @US2617 @debug
  Scenario: Filter search result by providing custom to and from date
  # Given user is logged into eHMP-UI
    And user searches for and selects "TEN,PATIENT"
  Then user type text term "vital" in the search text box
  And the user inputs "04/11/2013" in the "From Date" control in the "Text Search"
  #And the user enters "10252010" in the "From Date" control
  And the user inputs "04/11/2013" in the "To Date" control in the "Text Search"
  #And the user enters "12312011" in the "To Date" control
  And the user clicks the control "Apply" in the "Text Search"
  Then search result displays "5" search results

  @f144_9_text_search_suggestion @debug
Scenario: When user types text in search text box search suggestions are displayed
    # Given user is logged into eHMP-UI
    And user searches for and selects "Four,PATIENT"
  Then user type <text> term and the page displays total no of suggestions "<total_suggestions>"
      | text             | total_suggestions |
      | med              | 11                 |
      | patient movement | 2                 |
      | diagnosis        | 2                 |
      | problems       | 3                 |
      | Allergy          | 3                 |
      | Ad liv           | 2                 |

@f144_27_text_search_using_clicking_searchbutton
Scenario: User is able to search by clicking on search button
  # Given user is logged into eHMP-UI
  And user searches for and selects "TEN,PATIENT"
  And user type text term "vital" in the search text box
  Then text search result contains
  |Grouped_search_results|
  |Discharge Summarization Note|
  |Vital Sign|