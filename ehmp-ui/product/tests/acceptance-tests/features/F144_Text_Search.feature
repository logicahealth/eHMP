#POC: Team Jupiter

@f144_text_search   @reg1
Feature: F144-eHMP Viewer GUI - Text Search
#User shall type a set of words into the search text box
#After the user types 3 characters, the user shall be presented with a list of suggested search items/types
#Once the user clicks the search button or selects the search item/type,
#The system shall return a list of results for a previously selected patient, grouped by item type
#Each item in the search results shall activate a detail area for the item clicked


@f144_2_text_search_group_result @US2226 
Scenario: Search results displays as a group
  Given user searches for and selects "EIGHT,PATIENT"
  When user searches for "vital"
  Then text search results are grouped
  


# div.search-result-item
# has date attribute
# has style attribute ( display: block; or display: none;)
@f144_3_text_search_filtered_by_time @US2227 @DE841
Scenario: User is able to filter the search based on time

  Given user searches for and selects "Eight, Patient"
  And user searches for "vital"
  And the following choices should be displayed for the "Text Search" Date Filter
   | All | 2yr | 1yr | 3mo | 1mo | 7d | 72hr | 24hr |
  And text search results are grouped
  And the user expands all result groups
  When user filters the text search results by predefined time frame 2yr
  Then the the text search results only display results from the last 2yrs ( or Unknown )

  When user filters the text search results by predefined time frame 1yr
  Then the the text search results only display results from the last 1yr ( or Unknown )

  When user filters the text search results by predefined time frame 3mo
  Then the the text search results only display results from the last 3mos ( or Unknown )


@f144_5_med_search_result_view_detail @US2374 @DE832 @DE2337 @DE3798 @DE6757
Scenario: Verify user is able to view the detail medication search results
  # Given user is logged into eHMP-UI
  And user searches for and selects "TEN,PATIENT"
  Then user searches for "med"
  Then the user clicks one of the search result "Medication, Outpatient" 
  Then the user clicks one of the search result "Ascorbic Acid" 
  Then the modal is displayed
  And the modal's title is "Medication - ascorbic acid"

@f144_6_immunization_search_result_view_detail @US2364 @vimm  @DE5248
Scenario: User is able to view the detail immunization search results
  # Given user is logged into eHMP-UI
  And user searches for and selects "TEN,PATIENT"
  Then user searches for "immunization"
  Then the user clicks one of the search result "Immunization" 
  Then the user clicks one of the search result "Cholera"
  Then the modal is displayed
  And the modal's title is "Vaccine - CHOLERA, ORAL (HISTORICAL)"

@f144_7_Allergy_search_result_view_detail @US2241 @DE2337 @DE5484
Scenario: User is able to view the detail allergy search results
  # Given user is logged into eHMP-UI
  And user searches for and selects "Four,PATIENT"
  Then user searches for "allergy"
  Then the user clicks one of the search result "Allergy/Adverse Reaction" 
  Then the user clicks one of the search result "Penicillin"
  Then the modal is displayed
  And the modal's title is "Allergen - PENICILLIN"
  And the Allergy Detail modal displays
      | symptoms            |
      | severity            |
      | drug classes        |
      | nature of reaction  |
      | entered by          |
      | originated          |
      | verified            |
      | observed/historical |
      | observed date       |
      
@f144_8_Problem_list_search_result_view_detail @US2251 @US2792 @DE2657 @DE5921 @DE6552 @DE6758 @DE6989
Scenario: User is able to view the detail of problem list search results
  Given user searches for and selects "Four,PATIENT"
  When user enters the search term "headache" in the search record input field
  Then text search returns data
  And the user expands the main group "Problem"
  And the user expands the subgroup "Headache"
  And the user views details of the first "problem headache"
  And the modal is displayed
  And the modal's title is "Headache"
  And the modal dialog contains data labels

@f144_10_lab_report_search_result_view_detail @US2242 @DE865 @DE910 @DE2067 @DE4207 @DE5715 @DE6759
Scenario: User is able to view the detail of Lab result search results

  Given user searches for and selects "Four,PATIENT"
  When user enters the search term "hdl - serum" in the search record input field
  Then text search returns data
  And the user expands the main group "Laboratory"
  And the user views details of the first "Lab HDL-Serum"
  Then the modal is displayed
  And the modal's title is "HDL (SERUM) 58 MG/DL" 
  And the modal dialog contains data
  And the "Lab Detail" table contains headers
    | Date | Lab Test | Flag | Result | Unit  | Ref Range | Facility |

  
@f144_11_lab_order_search_result_view_detail @US2250 @DE2432 @DE3413 @DE5126 @DE5165 @DE6759 @DE6912 @debug @DE7010
Scenario: User is able to view the detail of lab order search results
  # Given user is logged into eHMP-UI
  And user searches for and selects "Four,PATIENT"
  Then user searches for "Urinalysis"
  Then text search result contains
  
  |Grouped_search_results|
  |Laboratory|
  
  Then the user clicks one of the search result "Laboratory" 
  Then the user clicks one of the search result "Urinalysis"
  And the modal is displayed
  And the modal's title is "URINALYSIS URINE WC LB #579"
  And Current Status for Lab is ACTIVE
    
@f144_12a_radiology_order_search_result_view_detail @US2256 @DE2337 @DE2432 @DE4555 @DE6814 @debug @DE7011
Scenario: User is able to view the detail of radiology/Imaging orders search results
  # Given user is logged into eHMP-UI
  And user searches for and selects "Four,PATIENT"
  Then user searches for "Radiology"
  Then text search result contains
  
  |Grouped_search_results|
  |Radiology Report|
  
  Then the user clicks one of the search result "Radiology Report" 
  When the user expands the Radiology Hip 2 or more views headache subgroup
  Then the user clicks one of the search result "HIP 2 OR MORE VIEWS" 
  And the modal's title is "HIP 2 OR MORE VIEWS"
  And Current Status for "Rad" is "COMPLETE" 


@f144_12b_radiology_order_search_result_view_detail @US2256 @DE2337 @DE2432 @DE4555
Scenario: User is able to view the detail of radiology/Imaging orders search results

  Given user searches for and selects "Four,PATIENT"
  When user enters the search term "Radiology" in the search record input field
  Then text search returns data
  And the user expands the main group "Imaging"
  And the user views details of the first "Radiology Imaging"
  And the modal is displayed
  And the modal's title is "Radiologic Examination, Abdomen; Anteroposterior And Additional Oblique And Cone Views" 
  And the modal dialog contains data labels
  And modal detail status field has a value of "Completed"

@f144_13_display_text_snippest_and_searched_text_is_highlighted @US2906 @DE2337 @DE2657
Scenario: Text snippets should display when the requested text is found in the search result and the selected word should be highlighted.
  Given user searches for and selects "Four,PATIENT"
  When user enters the search term "blood" in the search record input field
  Then text search returns data
  And the user expands the main group "ProgressNote"
  And the sub group returns data
  And the user expands the subgroup "DIABETES"
  And the search results containing search term "blood" are highlighted 
  
@f144_14_data_for_subgroup_not_loaded_until_clicked @US2791 @DE2337 @DE2767
 Scenario: Data under subgroup is not loaded until the User expands the sub group.
  Given user searches for and selects "Four,PATIENT"
  When user enters the search term "Progress Notes" in the search record input field
  Then text search returns data
  And the user expands the main group "ProgressNote"
  And the sub group returns data
  And no subgroup data rows are loaded
  And the user expands the subgroup "GENERALMEDICINENOTE" 
  And subgroup data rows are loaded
  And the user expands the subgroup "ANNELAB" 
  And more subgroup data rows are loaded
 
 @f144_15_subgrouping_view_of_progress_notes @US2376 @DE1575 @DE2767 @document_text_search
 Scenario:Text Search: Document data drill down "Progress Notes(Documents)" in Text Search
  And user searches for and selects "Four,PATIENT"
  When user enters the search term "Progress Notes" in the search record input field
  Then text search returns data
  And the user expands the main group "ProgressNote"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "ProgressNote" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
@f144_16_subgrouping_view_of_Administrative_notes @US2792 @DE2337 @DE2657 @document_text_search
Scenario:Text Search: Document data drill down "Administrative Notes(Documents)" in Text Search
  And user searches for and selects "Ten,PATIENT"
  When user enters the search term "Administrative" in the search record input field
  Then text search returns data
  And the user expands the main group "AdministrativeNote"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "AdministrativeNote" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
 
@f144_17_subgrouping_view_of_Advancedirective @US2792 @DE2337 @DE2657 @document_text_search
Scenario:Text Search: Document data drill down "Advancedirective (Documents)"
  And user searches for and selects "Ten,PATIENT"
  When user enters the search term "directive" in the search record input field
  Then text search returns data
  And the user expands the main group "AdvanceDirective"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "AdvanceDirective" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
@f144_18_subgrouping_view_of_Clinical_Procedcure @US2792 @DE2337 @DE2657 @document_text_search
Scenario:Text Search: Document data drill down "Clinical Procedure (Documents)"
  Given user searches for and selects "Ten,PATIENT"
  When user enters the search term "clinical procedure" in the search record input field
  Then text search returns data
  And the user expands the main group "ClinicalProcedure"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "ClinicalProcedure" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
  
@f144_19_subgrouping_view_of_Consult_Report @US2792 @DE2337 @DE2657 @document_text_search
Scenario:Text Search: Document data drill down "Consult Report"
  And user searches for and selects "Ten,PATIENT"
  When user enters the search term "consult report" in the search record input field
  Then text search returns data
  And the user expands the main group "ConsultReport"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "ConsultReport" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
      
@f144_20_subgrouping_view_of_Consultation_Note_Document @US2792 @DE2337 @DE2657 @document_text_search
Scenario:Text Search: Document data drill down "Consultation Note (Provider) Document"
  And user searches for and selects "eight,PATIENT"
  When user enters the search term "consultation note (provider) document" in the search record input field
  Then text search returns data
  And the user expands the main group "ConsultationNoteProviderDocument"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "ConsultationNoteProviderDocument" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
@f144_21_subgrouping_view_of_Crisis_Note_Document @US2792 @DE2337 @DE2657
Scenario:Text Search: Document data drill down "Crisis Note"
  And user searches for and selects "four,PATIENT"
  When user enters the search term "crisis note" in the search record input field
  Then text search returns data
  And the user expands the main group "CrisisNote"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "CrisisNote" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
@f144_22_subgrouping_view_of_Discharge_Summary_Document @US2792 @DE2337 @DE2657
Scenario:Text Search: Document data drill down "Discharge Summary"
  And user searches for and selects "four,PATIENT"
  When user enters the search term "Discharge Summary" in the search record input field
  Then text search returns data
  And the user expands the main group "DischargeSummary"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "DischargeSummary" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
@f144_23_subgrouping_view_of_Laboratory_Report_Document @US2792 @DE2337 @DE2657 @DE5288
Scenario:Text Search: Document data drill down "Laboratory Report"
  And user searches for and selects "ten,PATIENT"
  When user enters the search term "Laboratory Report" in the search record input field
  Then text search returns data
  And the user expands the main group "LaboratoryReport"
  And the sub group returns data
  And the user expands the subgroup "LRELECTRONMICROSCOPYREPORT"   
  And the sub group returns data
      
@f144_24_subgrouping_view_of_Radiology_Report_Document @US2792 @DE2337 @DE2657
Scenario:Text Search: Document data drill down "Radiology Report"
  And user searches for and selects "ten,PATIENT"
  When user enters the search term "Radiology Report" in the search record input field
  Then text search returns data
  And the user expands the main group "RadiologyReport"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "RadiologyReport" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
  
      
@f144_25_subgrouping_view_of_Surgery_Report_Document @US2792 @DE2337 @DE2657
Scenario:Text Search: Document data drill down "Surgery Report"
  And user searches for and selects "ten,PATIENT"
  When user enters the search term "Surgery Report" in the search record input field
  Then text search returns data
  And the user expands the main group "SurgeryReport"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "SurgeryReport" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
 
@f144_26_details_view_of_radiology_report @US2363 @DE2337 @DE2657 @DE5290 @DE6814 @debug @DE7013 
Scenario:Text Search: Details view for  "Radiology Report"  
     Given user is logged into eHMP-UI
  And user searches for and selects "ten,PATIENT"
  Then user searches for "Radiology Report"
  Then text search result contains 
   | Grouped_search_results |
      | Radiology Report       |
  Then the user clicks one of the search result "Radiology Report"
  Then the text search results contain document sub groups
  And the user expands all result groups
  And the text search subgroup "RadiologyReport" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
  When the user selects a result from "RadiologyReport" subgroup
  Then a the Radiology Report modal displays

  
