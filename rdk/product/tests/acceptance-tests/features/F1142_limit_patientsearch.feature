@F1142
Feature: 

@US17390_1
Scenario: Verify search results contain wildcard results without a comma
  When the client requests full name patient search with name "Eight"
  Then the results contain wildcard variations on "Eight"

@US17390_2
Scenario: Verify search results contain exact match when search for specific last name
  When the client requests full name patient search with name "Eight,"
  Then the results only contain exact last name match results for "Eight"
