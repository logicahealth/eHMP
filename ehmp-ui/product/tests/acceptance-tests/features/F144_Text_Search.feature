#POC: Team Jupiter

@f144_text_search @regression @triage

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


@f144_5_med_search_result_view_detail @US2374 @DE832 @DE2337 @DE3798
Scenario: Verify user is able to view the detail medication search results
  # Given user is logged into eHMP-UI
  And user searches for and selects "TEN,PATIENT"
  Then user searches for "med"
  Then the user clicks one of the search result "Medication, Outpatient" 
  Then the user clicks one of the search result "Ascorbic Acid" 
  Then the modal is displayed
  And the modal's title is "Medication - ascorbic acid tab"

@f144_6_immunization_search_result_view_detail @US2364 @vimm @triage @DE5248
Scenario: User is able to view the detail immunization search results
  # Given user is logged into eHMP-UI
  And user searches for and selects "TEN,PATIENT"
  Then user searches for "immunization"
  Then the user clicks one of the search result "Immunization" 
  Then the user clicks one of the search result "Cholera"
  Then the modal is displayed
  And the modal's title is "Vaccine - CHOLERA, ORAL (HISTORICAL)"

@f144_7_Allergy_search_result_view_detail @US2241 @DE2337 @debug @DE5484
Scenario: User is able to view the detail allergy search results
  # Given user is logged into eHMP-UI
  And user searches for and selects "Four,PATIENT"
  Then user searches for "allergy"
  Then the user clicks one of the search result "Allergy/Adverse Reaction" 
  Then the user clicks one of the search result "Penicillin"
  Then the modal is displayed
  And the modal's title is "Allergen - PENICILLIN"
  And the Allergy Detail modal displays 
      | field               |
      | title               |
      | close button        |
      | Symptoms            |
      | Severity            |
      | Drug Classes        |
      | Nature of Reaction  |
      | Entered By          |
      | Originated          |
      | Verified            |
      | Observed/Historical |
      | Observed Date       |
      | Site                |

 
@f144_8_Problem_list_search_result_view_detail @US2251 @US2792 @DE2657
Scenario: User is able to view the detail of problem list search results
  Given user searches for and selects "Four,PATIENT"
  Then user searches for "headache"
  Then text search result contains
  
  |Grouped_search_results|
  |Problem|
  When the user clicks one of the search result "Problem" 
  Then the sub group for "Problem" displays
  When the user expands the Problem headache subgroup
  And the sub group for "Problem" contains a row for "Headache"
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | status   | Inactive                        |
     | facility | is valid facility               |
  When the user displays the details for search result "Problem" subgroup "Headache"
  Then the modal is displayed
  And the modal's title is "Headache"
  And the "Headache details" modal dialog contains data

@f144_10_lab_report_search_result_view_detail @US2242 @DE865 @DE910 @DE2067 @debug @DE4207
Scenario: User is able to view the detail of Lab result search results

  Given user searches for and selects "Four,PATIENT"
  When user searches for "hdl - serum"
  Then text search result contains
  
  |Grouped_search_results|
  |Laboratory|
  
  Then the user clicks one of the search result "Laboratory" 
  Then the user clicks one of the search result "HDL"
  Then the modal is displayed
  And the modal's title is "HDL - SERUM" 
  And the "Lab Detail" table contains headers
    | Date       | Lab Test          | Flag | Result | Unit  | Ref Range | Facility |
  And the "Lab Detail" row is
    | Date       | Lab Test          | Flag | Result | Unit  | Ref Range | 
    | 03/05/2010 | HDL - SERUM       |      | 58     | MG/DL | 40-60     | 

 
@f144_11_lab_order_search_result_view_detail @US2250 @DE2432 @DE3413 @DE5126 @debug @DE5165
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
  And Current Status for "Lab" is "ACTIVE"
  And the user clicks the modal "Close Button"
  And the modal is closed
    
@f144_12a_radiology_order_search_result_view_detail @US2256 @DE2337 @DE2432 @DE4555 @debug
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
  And the modal's title is "radiologic examination, hip, unilateral; complete, minimum of 2 views"
  And Current Status for "Rad" is "COMPLETE" 


@f144_12b_radiology_order_search_result_view_detail @US2256 @DE2337 @DE2432 @DE4555 @debug
Scenario: User is able to view the detail of radiology/Imaging orders search results
  # Given user is logged into eHMP-UI
  And user searches for and selects "Four,PATIENT"
  Then user searches for "Radiology"
  Then text search result contains
  
  |Grouped_search_results|
  |Imaging|
  
  Then the user clicks one of the search result "Imaging" 
  Then the user clicks one of the search result "RADIOLOGIC EXAMINATION, KNEE; 1 OR 2 VIEWS" 
  And the modal's title is "radiologic examination, knee; 1 or 2 views"
  And Current Status for "Rad" is "COMPLETE" 

    
@f144_13_display_text_snippest_and_searched_text_is_highlighted @US2906 @DE2337 @DE2657
Scenario: Text snippets should display when the requested text is found in the search result and the selected word should be highlighted.
  Given user searches for and selects "Four,PATIENT"
  When user searches for "blood" 
  Then text search result contains
  	  | Grouped_search_results |
      | Discharge Summary      |
      | Laboratory             |
      | Problem                |
      | Progress Note          |
      | Surgery Report         |
      | Vital Sign             |

  When the user clicks one of the search result "Progress Note"
  Then the sub group for "Progress Note" displays
  When the user expands the Progress Note subgroup
  And the sub group for "Progress Note" contains a row for "Diabetes"
     | field    | Sub_group_search_results |
     | date     | is valid date format     |
     | facility | is valid facility        |
     | snippet  | blood                    |
  And the text search snippet "blood" is highlighted 
  
  
 @f144_14_data_for_subgroup_not_loaded_until_clicked @US2791 @DE2337 @debug @DE2767
 Scenario: Data under subgroup is not loaded until the User expands the sub group.
 # Given user is logged into eHMP-UI
  And user searches for and selects "Four,PATIENT"
  Then user searches for "Progress Notes"
  Then text search result contains
  
  	  | Grouped_search_results |
      | Advance Directive      |
      | Consult Report         |
      | Progress Note          |
      | Crisis Note            |
      
  Then the user clicks one of the search result "Progress Note"
  Then text search result contains subgroups
      | sub_grouped_results   |
      | GENERAL MEDICINE NOTE |
      | DIABETES              |
      | CAMPER84              |
      | CAMPER02              |
   Then the user clicks one of the search result "General Medicine Note" 
   And the following subgroups data are not loaded
      | sub_grouped_results   |
      | CAMPER84              |
      | CAMPER02              |
   

 @f144_15_subgrouping_view_of_progress_notes @US2376 @DE1575 @DE2767 @document_text_search
 Scenario:Text Search: Document data drill down "Progress Notes(Documents)" in Text Search
  And user searches for and selects "Four,PATIENT"
  Then user searches for "Progress Notes"

  Then text search result contains
  	  | Grouped_search_results |
      | Progress Note          |
  Then the user clicks one of the search result "Progress Note"
  Then the text search results contain document sub groups
  And the user expands all result groups
  And the text search subgroup "ProgressNote" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
@f144_16_subgrouping_view_of_Administrative_notes @US2792 @DE2337 @DE2657 @document_text_search
Scenario:Text Search: Document data drill down "Administrative Notes(Documents)" in Text Search
# Given user is logged into eHMP-UI
  And user searches for and selects "Ten,PATIENT"
  Then user searches for "Administrative"
  Then text search result contains
  
  	  | Grouped_search_results |
      | Administrative Note      |
    
  Then the user clicks one of the search result "Administrative Note"
  Then the text search results contain document sub groups
  And the user expands all result groups
  And the text search subgroup "AdministrativeNote" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
 
@f144_17_subgrouping_view_of_Advancedirective @US2792 @DE2337 @DE2657 @document_text_search
Scenario:Text Search: Document data drill down "Advancedirective (Documents)"
# Given user is logged into eHMP-UI
  And user searches for and selects "Ten,PATIENT"
  Then user searches for "directive"
  Then text search result contains
  
  	  | Grouped_search_results |
      | Advance Directive      |
    
  Then the user clicks one of the search result "Advance Directive"
  Then the text search results contain document sub groups
  And the user expands all result groups
  And the text search subgroup "AdvanceDirective" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
 @f144_18_subgrouping_view_of_Clinical_Procedcure @US2792 @DE2337 @DE2657 @document_text_search
Scenario:Text Search: Document data drill down "Clinical Procedure (Documents)"
# Given user is logged into eHMP-UI
  And user searches for and selects "Ten,PATIENT"
  Then user searches for "clinical procedure"
  Then text search result contains
  
  	  | Grouped_search_results |
      | Clinical Procedure      |
      
    
  Then the user clicks one of the search result "Clinical Procedure"
  Then the text search results contain document sub groups
  And the user expands all result groups
  And the text search subgroup "ClinicalProcedure" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
      
   
@f144_19_subgrouping_view_of_Consult_Report @US2792 @DE2337 @DE2657 @document_text_search
Scenario:Text Search: Document data drill down "Consult Report"
# Given user is logged into eHMP-UI
  And user searches for and selects "Ten,PATIENT"
  Then user searches for "consult report"
  Then text search result contains
  
  	  | Grouped_search_results |
      | Consult Report         |
      
    
  Then the user clicks one of the search result "Consult Report"
  Then the text search results contain document sub groups
  And the user expands all result groups
  And the text search subgroup "ConsultReport" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
      
@f144_20_subgrouping_view_of_Consultation_Note_Document @US2792 @DE2337 @DE2657 @document_text_search
Scenario:Text Search: Document data drill down "Consultation Note (Provider) Document"
# Given user is logged into eHMP-UI
  And user searches for and selects "eight,PATIENT"
  Then user searches for "consultation note (provider) document"
  Then text search result contains
  
  	  | Grouped_search_results                     |
      | consultation note (provider) document      |
      
    
  Then the user clicks one of the search result "Consultation Note"
  Then the text search results contain document sub groups
  And the user expands all result groups
  And the text search subgroup "ConsultationNoteProviderDocument" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
@f144_21_subgrouping_view_of_Crisis_Note_Document @US2792 @DE2337 @DE2657
Scenario:Text Search: Document data drill down "Crisis Note"
# Given user is logged into eHMP-UI
  And user searches for and selects "four,PATIENT"
  Then user searches for "crisis note"
  Then text search result contains
  
  	  | Grouped_search_results |
      | Crisis Note            |
      
    
  Then the user clicks one of the search result "Crisis Note"
  Then the text search results contain document sub groups
  And the user expands all result groups
  And the text search subgroup "CrisisNote" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
@f144_22_subgrouping_view_of_Discharge_Summary_Document @US2792 @DE2337 @DE2657
Scenario:Text Search: Document data drill down "Discharge Summary"
# Given user is logged into eHMP-UI
  And user searches for and selects "four,PATIENT"
  Then user searches for "Discharge Summary"
  Then text search result contains
  
  	  | Grouped_search_results |
      |Discharge Summary       |
      
    
  Then the user clicks one of the search result "Discharge Summary"
  Then the text search results contain document sub groups
  And the user expands all result groups
  And the text search subgroup "DischargeSummary" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
@f144_23_subgrouping_view_of_Laboratory_Report_Document @US2792 @DE2337 @DE2657 @DE5288
Scenario:Text Search: Document data drill down "Laboratory Report"
# Given user is logged into eHMP-UI
  And user searches for and selects "ten,PATIENT"
  Then user searches for "Laboratory Report"
  Then text search result contains
  
  	  | Grouped_search_results |
      | Laboratory Report      |
      
    
  Then the user clicks one of the search result "Laboratory Report"
  Then text search result contains
      | sub_grouped_results            |
      | LR ELECTRON MICROSCOPY REPORT  |
      | LR MICROBIOLOGY REPORT         |
      | LR SURGICAL PATHOLOGY REPORT   |
      
     
  Then the user clicks one of the search result "LR ELECTRON MICROSCOPY REPORT" 
  Then sub grouped search result for "LR ELECTRON MICROSCOPY REPORT" contains
      | field    | Sub_group_search_results |
      | date     | 10/23/1997               |
      | facility | CAMP BEE                 |
      
@f144_24_subgrouping_view_of_Radiology_Report_Document @US2792 @DE2337 @DE2657
Scenario:Text Search: Document data drill down "Radiology Report"
# Given user is logged into eHMP-UI
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
  
      
 @f144_25_subgrouping_view_of_Surgery_Report_Document @US2792 @DE2337 @DE2657
Scenario:Text Search: Document data drill down "Surgery Report"
# Given user is logged into eHMP-UI
  And user searches for and selects "ten,PATIENT"
  Then user searches for "Surgery Report"
  Then text search result contains
  	  | Grouped_search_results |
      | Surgery Report         |
  Then the user clicks one of the search result "Surgery Report"
  Then the text search results contain document sub groups
  And the user expands all result groups
  And the text search subgroup "SurgeryReport" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
      
@f144_26_Radiology_Report_detail_view_from_tex_search @US2363 @DE2337 @DE2657 @DE5290
Scenario:User is able to view Radiology/Imaging Report detail from Text Search 
# Given user is logged into eHMP-UI
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



  
