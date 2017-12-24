@documentation
Feature: Verify documentation

@home_links
Scenario: Verify documentation home page
  When user navigates to documentation home page
  Then the documentation home page displays a title "eHMP Software Development Kit (SDK)"
  And the documentation home page displays a link for eHMP UI and developer guide
  And the documentation home page displays a link for ADK and developer guide
  And the documentation home page displays a link for RDK and developer guide
  And the documentation home page displays a link for Fetch UI and api documentation guide
  And the documentation home page displays a link for Write Back and api documentation guide
  And the documentation home page displays a link for Pick List and api documentation guide
  And the documentation home page displays a link for JDS and api documentation guide

@ehmpui_link
Scenario: Verify eHMP UI link directs to correct communication
  Given user has navigated to the documentation home page
  When the user selects the eHMP UI link
  Then the ui applets page is displayed

@ehmpui_devguide
Scenario: Verify eHMP UI developer guide link directs to correct communication
  Given user has navigated to the documentation home page
  When the user selects the eHMP UI developer guide
  Then the ui applets page is displayed

@adk_link
Scenario: Verify ADK link directs to correct communication
  Given user has navigated to the documentation home page
  When the user selects the ADK link
  Then the ADK page is displayed


@adk_devguide
Scenario: Verify ADK developer guide link directs to correct communication
  Given user has navigated to the documentation home page
  When the user selects the AKD developer guide
  Then the ADK page is displayed

@rdk_link
Scenario:  Verify RDK link directs to correct communication
  Given user has navigated to the documentation home page
  When the user selects the RDK link
  Then the RDK page is displayed

@rdk_devguide
Scenario: Verify RDK developer guide link directs to correct communication
  Given user has navigated to the documentation home page
  When the user selects the RDK developer guide
  Then the RDK page is displayed

@fetch_link
Scenario:  Verify Fetch link directs to correct communication
  Given user has navigated to the documentation home page
  When the user selects the Fetch link
  Then the Fetch page is displayed

@fetch_devguide
Scenario: Verify Fetch API documentation link directs to correct communication
  Given user has navigated to the documentation home page
  When the user selects the Fetch API documentation
  Then the Fetch page is displayed

@writeback_link
Scenario:  Verify Write Back link directs to correct communication
  Given user has navigated to the documentation home page
  When the user selects the Write Back link
  Then the Write Back page is displayed

@writeback_devguide
Scenario: Verify Write Back API documentation link directs to correct communication
  Given user has navigated to the documentation home page
  When the user selects the Write Back API documentation
  Then the Write Back page is displayed

@picklist_link
Scenario:  Verify Pick list link directs to correct communication
  Given user has navigated to the documentation home page
  When the user selects the Pick List link
  Then the Pick List page is displayed

@picklist_devguide
Scenario: Verify Pick List API documentation link directs to correct communication
  Given user has navigated to the documentation home page
  When the user selects the Pick List API documentation
  Then the Pick List page is displayed

@jds_link
Scenario:  Verify JDS link directs to correct communication
  Given user has navigated to the documentation home page
  When the user selects the JDS link
  Then the JDS page is displayed

@jds_devguide
Scenario: Verify JDS API documentation link directs to correct communication
  Given user has navigated to the documentation home page
  When the user selects the JDS API documentation
  Then the JDS page is displayed
