@F144_Orders 
Feature: F144 - eHMP Viewer GUI - Orders

# Team: Andromeda

@US2338b @DE5482 @DE6912 @debug @DE6997
Scenario: Verify user can step through the orders using the next button / previous button
  Given user searches for and selects "Eight,Patient"
  And Cover Sheet is active
  When the user has selected All within the global date picker
  Then the "Orders" applet is finished loading
  When the user scrolls to the bottom of the Orders Applet
  Given the user notes the first 10 orders
  And clicks the first result in the "Orders Applet"
  Then the modal is displayed
  And the user can step through the orders using the next button
  And the user can step through the orders using the previous button


@f144_orders_single_page @US2030 @TA5915a
Scenario: Opening and closing of the Orders single page view.
  Given user searches for and selects "Eight,Patient"
  And Cover Sheet is active
  When the user maximizes the Order applet
  Then the Expanded Order applet is displayed
  When the user clicks the "Minimize" button in the Orders applet
  Then the coversheet is displayed

@f144_orders_single_page_headers @US2030 @TA5915b @US2440 @TA6894
Scenario: Opening and closing of the Orders single page view.
  Given user searches for and selects "Eight,Patient"
  And Cover Sheet is active
  When the user navigates to the expanded Orders applet
  Then the "Orders Applet" table has headers
    | Order Date | Flag | Status | Order | Type | Provider Name | Start Date | Stop Date | Facility |



@f144_orders_consult_modal @US2462 @TA7322 @modal_test @DE1232 @DE3439 @DE6912 @debug @DE7012
Scenario: Viewing modal details for Consult Order.
  Given user searches for and selects "Eight,Patient"
  And Cover Sheet is active
  And the user has selected All within the global date picker
  And the applet displays orders
  And the user selects "Consult" in the Orders applet Order Type dropdown
  And the "Orders" applet is finished loading
  When the user opens the details for an order "Consult" row
  Then an Order Details modal is displayed
  And the modal has the following fields
      | Section Header               |
      | Activity                     |
      | Current Data                 |
      | Signature                    |
      | Attending Physician          |
      | Ordering Location            |
      | Start Date/Time              |
      | Stop Date/Time               |
      | Current Status               |
      | Consult to Service/Specialty |
      | Reason for Request           |
      | Category                     |
      | Urgency                      |
      | Place of Consultation        |


@f144_orders_dietetic_modal @US2520 @TA7611 @modal_test @vimm @DE3439 @DE3385 @DE6912 @debug @DE7012
Scenario: Viewing modal details for Dietetics Order.
  Given user searches for and selects "Eight,Patient"
  And Cover Sheet is active
  And the user has selected All within the global date picker
  And the applet displays orders
  When the user selects "Diet" in the Orders applet Order Type dropdown
  And the "Orders" applet is finished loading
  When the user opens the details for an order "Dietetics Order" row
  Then an Order Details modal is displayed
  And the modal has the following fields
      | Section Header      |
      | Activity            |
      | Current Data        |
      | Ordered by          |
      | Attending Physician |
      | Ordering Location   |
      | Start Date/Time     |
      | Stop Date/Time      |
      | Current Status      |
      | Diet                |
      | Effective date/time |
      | Delivery            |
      | Order               |
    

@f144_orders_lab_modal @US2463 @TA7329 @modal_test @DE3439 @DE6912 @debug @DE7012
Scenario: Viewing modal details for Laboratory.
  Given user searches for and selects "Eight,Patient"
  And Cover Sheet is active
  And the user has selected All within the global date picker
  And the applet displays orders
  And the user selects "Laboratory" in the Orders applet Order Type dropdown
  And the "Orders" applet is finished loading
  When the user opens the details for an order "Laboratory" row
  Then an Order Details modal is displayed
  And the modal has the following fields
      | Section Header       |
      | Activity             |
      | Current Data         |
      | Order Text           |
      | Ordered by           |
      | Signature            |
      | Attending Physician  |
      | Ordering Location    |
      | Start Date/Time      |
      | Stop Date/Time       |
      | Current Status       |
      | Lab Test             |
      | Collected By         |
      | Collection Sample    |
      | Specimen             |
      | Collection Date/Time |
      | Urgency              |

@f144_orders_medication_modal @US1924 @TA5917a @modal_test @DE3439 @DE6912 @debug @DE7012
Scenario: Viewing modal details for Medication, Inpatient.
  Given user searches for and selects "Bcma,Eight"
  Then Cover Sheet is active

  And the user has selected All within the global date picker

  Then the "Orders" applet is finished loading
  When the user selects "Medication, Inpatient" in the Orders applet Order Type dropdown
  And the "Orders" applet is finished loading
  When the user opens the details for an order "Medication, Inpatient" row
  Then an Order Details modal is displayed
  And the modal has the following fields
      | Section Header      |
      | Activity            |
      | Current Data        |
      | Ordered by          |
      | Signature           |
      | Attending Physician |
      | Ordering Location   |
      | Start Date/Time     |
      | Stop Date/Time      |
      | Current Status      |
      | Instructions        |
      | Text                |
      | Priority            |

@f144_orders_medication_modal @US1924 @TA5917b @modal_test @DE3439 @DE6912 @debug @DE7012
Scenario: Viewing modal details for Medication, Non-VA.
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

  And the user has selected All within the global date picker

  Then the "Orders" applet is finished loading
  When the user selects "Medication, Non-VA" in the Orders applet Order Type dropdown
  And the "Orders" applet is finished loading
  When the user opens the details for an order "Medication, Non-VA" row
  Then an Order Details modal is displayed
  And the modal has the following fields
      | Section Header      |
      | Activity            |
      | Current Data        |
      | Signature           |
      | Attending Physician |
      | Ordering Location   |
      | Start Date/Time     |
      | Stop Date/Time      |
      | Current Status      |
      | Medication          |
      | Instructions        |
      | Sig                 |
      | Start Date/Time     |
      | Comments            |

@f144_orders_medication_modal @US1924 @TA5917c @modal_test @DE1232 @DE3439 @DE6912 @debug @DE7012
Scenario: Viewing modal details for Medication, Outpatient.
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

  And the user has selected All within the global date picker

  Then the "Orders" applet is finished loading
  When the user selects "Medication, Outpatient" in the Orders applet Order Type dropdown
  And the "Orders" applet is finished loading
  When the user opens the details for an order "Medication, Outpatient" row
  Then an Order Details modal is displayed
  And the modal has the following fields
      | Section Header      |
      | Activity            |
      | Current Data        |
      | Signature           |
      | Attending Physician |
      | Ordering Location   |
      | Start Date/Time     |
      | Stop Date/Time      |
      | Current Status      |
      | Medication          |
      | Instructions        |
      | Sig                 |
      | Days Supply         |
      | Quantity            |
      | Refills             |
      | Pick Up             |
      | Priority            |


@f144_orders_nursing_modal @US2559 @TA7852 @DE1817 @DE3439 @DE3385 @DE6912 @debug @DE7012
Scenario: Viewing modal details for Text Order.
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

  And the user has selected All within the global date picker

  Then the "Orders" applet is finished loading
  When the user selects "Nursing" in the Orders applet Order Type dropdown
  And the "Orders" applet is finished loading
  When the user opens the details for an order "Text Order" row
  Then an Order Details modal is displayed
  And the modal has the following fields
      | Section Header      |
      | Activity            |
      | Current Data        |
      | Signature           |
      | Attending Physician |
      | Ordering Location   |
      | Start Date/Time     |
      | Stop Date/Time      |
      | Current Status      |


@f144_orders_radiology_modal @US2465 @TA7342 @modal_test @DE1232 @DE3385 @DE3439 @DE6912 @debug @DE7012
Scenario: Viewing modal details for Radiology Order.
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

  And the user has selected All within the global date picker

  Then the "Orders" applet is finished loading
  When the user selects "Imaging" in the Orders applet Order Type dropdown
  And the "Orders" applet is finished loading
  When the user opens the details for an order "Radiology" row
  Then an Order Details modal is displayed
  And the modal has the following fields
      | Section Header      |
      | Current Data        |
      | Order Text          |
      | Signature           |
      | Attending Physician |
      | Ordering Location   |
      | Start Date/Time     |
      | Stop Date/Time      |
      | Current Status      |
      | Reason for Study    |
      | Clinical History    |
      | Category            |
      | Ordering Location   |
      | Date Desired        |
      | Mode of Transport   |
      | Urgency             |
      | Submit Request to   |


@f144_orders_infusion_modal @US2756 @TA8884 @modal_test @DE1452 @DE2780 @DE3119 @DE6912 @debug @DE7012
Scenario: Viewing modal details for IV Fluid Order.
  Given user searches for and selects "Ten,Patient"
  And Cover Sheet is active
  And the user has selected All within the global date picker
  Then the "Orders" applet is finished loading
  When the user selects "Medication, Infusion" in the Orders applet Order Type dropdown
  And the "Orders" applet is finished loading
  When the user opens the details for an order "Medication, Infusion" row
  Then an Order Details modal is displayed
  And the modal has the following fields
      | Section Header    |
      | Provider Comments |
      | Activity          |
      | Current Data      |
      | Order Text        |
      | Signature         |
      | Ordering Location |
      | Start Date/Time   |
      | Stop Date/Time    |
      | Current Status    |
      | Solutions         |
      | Additives         |
      | Infuse over Time  |
      | Provider Comments |

@f144_orders_default_sorting_summary @US2512 @TA7590 @US9880
Scenario: Orders should be sorted by Order Type and then by Order Date after a global date
  Given user searches for and selects "Eight,Patient"
  And Cover Sheet is active
  Then the "Orders" applet is finished loading
  When the user scrolls to the bottom of the Orders Applet
 
  Then the Orders should be sorted by Order Date

@f144_orders_default_sorting_expanded @US2512 @TA7590 @debug @DE6145
Scenario: Orders should be sorted by Order Type and then by Order Date after a global date
  #Given user searches for and selects "Eight,Patient"
  Given user searches for and selects "Onehundredsixteen,Patient"
  And Cover Sheet is active
  And the user has selected All within the global date picker
  When the user maximizes the Order applet
  Then the Expanded Order applet is displayed
  When the user scrolls to the bottom of the Orders Applet
  Then the Orders should be sorted by "Type" and then "Order Date"

@f144_orders_filter_clearingb @US2497 @TA7853 @DE1237 @DE3819 @testing_scroll
Scenario: Orders - Clear text filters when switching quick filters.
  Given user searches for and selects "Eight,Patient"
  And Cover Sheet is active
  And the user has selected All within the global date picker
  When the user scrolls to the bottom of the Orders Applet
  When the user clicks the control "Filter Toggle" in the "Orders applet"
  When the user filters the Orders Applet by text "Cardiology"
  When the user selects "Lab" in the Orders applet Order Type dropdown
  And the user clicks the control "Filter Toggle" in the "Orders applet"
  And the "Text Filter" input should have the value "" in the Orders applet
  When the user scrolls to the bottom of the Orders Applet
  Then the Orders Applet is not filtered by text "Cardiology"

@f144_orders_filter_text_persistence @US2496 @TA7984b @DE1080
Scenario: Filter text is persisted when switching Orders applet views.
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

  And the user has selected All within the global date picker

  When the user clicks the control "Filter Toggle" in the "Orders applet"
  And the user inputs "Cardiology" in the "Text Filter" control in the "Orders applet"
  When the user maximizes the Order applet
  Then the Expanded Order applet is displayed
  And the "Text Filter" input should have the value "Cardiology" in the Orders applet
  When the user clicks the "Minimize" button in the Orders applet
  Then the coversheet is displayed
  And the "Text Filter" input should have the value "Cardiology" in the Orders applet

@f144_orders_filter_button_and_text_persistence @US2496 @TA7984c @DE1080 @DE3385
Scenario: Filter text and button are both persisted when switching Orders applet views.
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

  And the user has selected All within the global date picker

  Then the "Orders" applet is finished loading
  When the user selects "Imaging" in the Orders applet Order Type dropdown
  And the user clicks the control "Filter Toggle" in the "Orders applet"
  And the user inputs "Cardiology" in the "Text Filter" control in the "Orders applet"
  When the user maximizes the Order applet
  Then the Expanded Order applet is displayed
  And the selected Order type is "Imaging"
  And the "Text Filter" input should have the value "Cardiology" in the Orders applet
  When the user clicks the "Minimize" button in the Orders applet
  Then the coversheet is displayed
  And the selected Order type is "Imaging"
  And the "Text Filter" input should have the value "Cardiology" in the Orders applet

@f144_orders_filter_button_persistence @US2496 @TA7984a @DE1080 
Scenario: Filter button is persisted when switching Orders applet views.
  Given user searches for and selects "Bcma,Eight"
  Then Cover Sheet is active

  And the user has selected All within the global date picker
  When the user scrolls to the bottom of the Orders Applet
  When the user selects "Laboratory" in the Orders applet Order Type dropdown
  Then the "Orders" applet is finished loading
  When the user maximizes the Order applet
  Then the Expanded Order applet is displayed
  Then the "Orders" applet is finished loading
  Then the Orders Applet table only contains rows with the Type "Laboratory"
  And the selected Order type is "Laboratory"
  When the user minimizes the expanded Orders Applet
  Then the coversheet is displayed
  And the selected Order type is "Laboratory"

@f144_orders_date_filter_open_close @US2926 @TA9674a 
Scenario: Date filtering - opening and closing control.
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  When the user clicks the control "Expand View" in the "Orders applet"
  Then the "Date Filter" should be "Displayed" in the "Orders applet"
  When the user clicks the control "Filter Toggle" in the "Orders applet"
  Then the "Date Filter" should be "Hidden" in the "Orders applet"
  When the user clicks the control "Filter Toggle" in the "Orders applet"
  Then the "Date Filter" should be "Displayed" in the "Orders applet"

@f144_orders_date_filter_preset_dates @US2926 @TA9674b
Scenario: Inclusion of the preset buttons.
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active
  When the user clicks the control "Expand View" in the "Orders applet"
  Then the "Date Filter" should be "Displayed" in the "Orders applet"
  And the following choices should be displayed for the "Orders applet" Date Filter
    | All | 2yr | 1yr | 3mo | 1mo | 7d | 72hr | 24hr |

@f144_orders_date_filter_preset_dates @US2926 @TA9674c @vimm @DE2251
Scenario: Date filtering using the preset buttons.
  Given user searches for and selects "Five,Patient"
  Then Cover Sheet is active
  When the user clicks the control "Expand View" in the "Orders applet"
  Then the "Date Filter" should be "Displayed" in the "Orders applet"
  When the user clicks the date control "All" in the "Orders applet"
  And the Orders Applet table contains rows
  When the user clicks the date control "2yr" in the "Orders applet"
  Then no results should be found in the "Orders applet"
  When the user clicks the date control "1yr" in the "Orders applet"
  Then no results should be found in the "Orders applet"
  When the user clicks the date control "3mo" in the "Orders applet"
  Then no results should be found in the "Orders applet"
  When the user clicks the date control "1mo" in the "Orders applet"
  Then no results should be found in the "Orders applet"
  When the user clicks the date control "7d" in the "Orders applet"
  Then no results should be found in the "Orders applet"
  When the user clicks the date control "72hr" in the "Orders applet"
  Then no results should be found in the "Orders applet"
  When the user clicks the date control "24hr" in the "Orders applet"
  Then no results should be found in the "Orders applet"

@f144_orders_date_filter_custom_from_to @US2926 @TA9674d @DE1262 @DE2251 @DE2431
Scenario: Date filtering using the Custom button.
  Given user searches for and selects "Five,Patient"
  Then Cover Sheet is active
  When the user clicks the control "Expand View" in the "Orders applet"
  Then the "Date Filter" should be "Displayed" in the "Orders applet"
  And the user inputs "01/28/2010" in the "From Date" control in the "Orders applet"
  And the user inputs "02/28/2010" in the "To Date" control in the "Orders applet"
  And the user clicks the control "Apply" in the "Orders applet"
  Then the Orders applet table displays rows with an Order Date between "01/28/2010" and "02/28/2010"

@f144_orders_modal_order_number @US1775 @DE263 @modal_test @DE3439 @DE6912 @debug @DE7012
Scenario: Ensure order number format is correct.
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

  And the user has selected All within the global date picker

  When the user selects "Consult" in the Orders applet Order Type dropdown
  And clicks the first result in the "Orders Applet"
  Then the Order num is in the correct format: all digits
  When the user clicks the control "Next Button" in the "Orders modal"
  Then the Order num is in the correct format: all digits
  When the user clicks the control "Next Button" in the "Orders modal"
  Then the Order num is in the correct format: all digits
  When the user clicks the control "Next Button" in the "Orders modal"
  Then the Order num is in the correct format: all digits
  When the user clicks the control "Next Button" in the "Orders modal"
  Then the Order num is in the correct format: all digits
  When the user clicks the control "Next Button" in the "Orders modal"
  Then the Order num is in the correct format: all digits

@f144_orders_modal_order_start_stop_date @US1775 @DE262 @modal_test @DE3439 @DE6912 @debug @DE7012
Scenario: Ensure order number format is correct.
  Given user searches for and selects "Eight,Patient"
  Then Cover Sheet is active

  And the user has selected All within the global date picker

  When the user selects "Consult" in the Orders applet Order Type dropdown
  And clicks the first result in the "Orders Applet"
  Then the modal is displayed
  Then the Start Date/Time is in the correct format: mm/dd/yyyy hh:mm
  And the Stop Date/Time is in the correct format: mm/dd/yyyy hh:mm
  When the user clicks the control "Next Button" in the "Orders modal"
  Then the Start Date/Time is in the correct format: mm/dd/yyyy hh:mm
  And the Stop Date/Time is in the correct format: mm/dd/yyyy hh:mm
  When the user clicks the control "Next Button" in the "Orders modal"
  Then the Start Date/Time is in the correct format: mm/dd/yyyy hh:mm
  And the Stop Date/Time is in the correct format: mm/dd/yyyy hh:mm
  When the user clicks the control "Next Button" in the "Orders modal"
  Then the Start Date/Time is in the correct format: mm/dd/yyyy hh:mm
  And the Stop Date/Time is in the correct format: mm/dd/yyyy hh:mm
  When the user clicks the control "Next Button" in the "Orders modal"
  Then the Start Date/Time is in the correct format: mm/dd/yyyy hh:mm
  And the Stop Date/Time is in the correct format: mm/dd/yyyy hh:mm
  When the user clicks the control "Next Button" in the "Orders modal"
  Then the Start Date/Time is in the correct format: mm/dd/yyyy hh:mm
  And the Stop Date/Time is in the correct format: mm/dd/yyyy hh:mm

@f144_order_applet_loads_new_rows @DE510 @DE599 @DE1398 @DE2902 @DE2901 @DE3448 @testing_scroll
  Scenario: Verify scrolling to the bottom of the order applet loads more records
  Given user searches for and selects "Eighteen,Patient"
  Then Cover Sheet is active

  And the user has selected All within the global date picker

  Then the "Orders" applet is finished loading
  Then the Orders Applet table contains less then 300 rows
  When the user scrolls to the bottom of the Orders Applet
  Then the Orders Applet table contains more then 300 rows
  When the user maximizes the Order applet
  Then the Expanded Order applet is displayed
  Then the "Orders" applet is finished loading
  When the user scrolls to the bottom of the expanded Orders Applet
  Then the Orders Applet table contains more then 300 rows
  When the user clicks the "Minimize" button in the Orders applet
  Then the coversheet is displayed
  Then the "Orders" applet is finished loading
  When the user scrolls to the bottom of the Orders Applet
  Then the Orders Applet table contains more then 300 rows
  
@f144_orders_applet_summary_view_refresh 
Scenario: Orders Summary applet displays all of the same details after applet is refreshed
  Given user searches for and selects "Eight,Patient"
  And Cover Sheet is active
  When the user has selected All within the global date picker
  Then the "Orders" applet is displayed
  And the Orders Applet contains data rows
  When user refreshes Orders Applet
  Then the message on the Orders Applet does not say "An error has occurred"
  
@f144_orders_applet_expand_view_refresh 
Scenario: Orders expand view applet displays all of the same details after applet is refreshed
  Given user searches for and selects "Eight,Patient"
  And Cover Sheet is active
  When the user has selected All within the global date picker
  Then the "Orders" applet is displayed
  When the user maximizes the Order applet
  Then the Expanded Order applet is displayed
  And the Orders Applet contains data rows
  When user refreshes Orders Applet
  Then the message on the Orders Applet does not say "An error has occurred"

@F144_orders @US2921 @F144_orders_filter
Scenario: User can filter Expanded Orders applet 
  Given user searches for and selects "Seven,Patient"
  And Cover Sheet is active
  When the user has selected All within the global date picker
  When the user maximizes the Order applet
  Then the Expanded Order applet is displayed
  When the user scrolls to the bottom of the Orders Applet
  When the user filters the Orders by text "CREATININE"
  Then the Orders table only diplays rows including text "CREATININE"

@f144_orders_applet_filtering_reworked @US1775 @TA5345b  @DE615 @DE1273 @DE3385
Scenario Outline: Filtering of the Orders coversheet applet.
  Given user searches for and selects "Eight,Patient"
  And Cover Sheet is active
  When the user clicks the control Expand View in the Orders applet
  And the user clicks the date control All on the Orders applet
  #And the user scrolls to the bottom of the Orders Applet

  When the user selects "<dropdown_value>" in the Orders applet Order Type dropdown
  And the user scrolls to the bottom of the Orders Applet
  Then the Orders Applet table only contains rows with the Type "<type>"

Examples:
  |  dropdown_value | type |
  | Consult | Consult |
  | Laboratory | Laboratory |
  | Medication, Inpatient | Medication, Inpatient |
  | Medication, Non-VA | Medication, Non-VA |
  | Medication, Outpatient | Medication, Outpatient|
  | Imaging | Radiology |
  | Diet | Dietetics Order |

