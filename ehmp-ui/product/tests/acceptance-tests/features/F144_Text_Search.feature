#POC: Team Jupiter

@f144_text_search @reg1 @F1135 @F1205

Feature: F144-eHMP Viewer GUI - Text Search
#User shall type a set of words into the search text box
#After the user types 3 characters, the user shall be presented with a list of suggested search items/types
#Once the user clicks the search button or selects the search item/type,
#The system shall return a list of results for a previously selected patient, grouped by item type
#Each item in the search results shall activate a detail area for the item clicked

@f144_1_text_search_group_result @US2226 
Scenario: Search results displays as a group

  Given user searches for and selects "EIGHT,PATIENT"
  Then Summary View is active
  When user searches for "vital"
  Then text search results are grouped

@f144_2_text_search_filtered_by_time @US2227 @DE841
Scenario: User is able to filter the search based on time

  Given user searches for and selects "Eight, Patient"
  Then Summary View is active
  And user searches for "vital"
  Then text search results are grouped
  And the following choices should be displayed for the Text Search Date Filter
   | All | 2yr | 1yr | 3mo | 1mo | 7d | 72hr | 24hr |
  And text search results are grouped
  And the user expands all result groups
  When user filters the text search results by predefined time frame 2yr
  Then the the text search results only display results from the last 2yrs ( or Unknown )

  When user filters the text search results by predefined time frame 1yr
  Then the the text search results only display results from the last 1yr ( or Unknown )

  When user filters the text search results by predefined time frame 3mo
  Then the the text search results only display results from the last 3mos ( or Unknown )

@f144_3_med_search_result_view_detail @US2374 @DE832 @DE2337 @DE3798 @DE6757
Scenario: Verify user is able to view the detail medication search results

  And user searches for and selects "eight,patient"
  Then Summary View is active
  Then user searches for "med"
  Then text search results are grouped
  And the user expands the main group "MedicationOutpatient"
  And the user views details of the first "Medication"
  Then the modal is displayed
  And the modal's title is "MEDICATION - No Data"

@f144_4_immunization_search_result_view_detail @US2364 @vimm  @DE5248
Scenario: User is able to view the detail immunization search results

  And user searches for and selects "eight,patient"
  Then Summary View is active
  Then user searches for "immunization"
  Then text search results are grouped
  And the user expands the main group "Immunization"
  And the user views details of the first "Immunization"
  Then the modal is displayed
  And the modal's title is "Vaccine - Adenovirus Type 4"

@f144_5_Allergy_search_result_view_detail @US2241 @DE2337 @DE5484
Scenario: User is able to view the detail allergy search results

  And user searches for and selects "Eight,PATIENT"
  Then Summary View is active
  Then user searches for "allergy"
  Then text search results are grouped
  And the user expands the main group "AllergyAdverseReaction"
  And the user views details of the first "Allergy"
  Then the modal is displayed
  And the modal's title is "Allergen - CHOCOLATE"
  And the Allergy Detail modal displays
      | symptoms            |
      | drug classes        |
      | nature of reaction  |
      | entered by          |
      | originated          |
      | verified            |
      | observed/historical |
      | observed date       |
      
@f144_6_Problem_list_search_result_view_detail @US2251 @US2792 @DE2657 @DE5921 @DE6552 @DE6758 @DE6989
Scenario: User is able to view the detail of problem list search results

  Given user searches for and selects "Four,PATIENT"
  Then Summary View is active
  Then user searches for "headache"
  Then text search results are grouped
  And the user expands the main group "Problem"
  And the user expands the subgroup "Headache"
  And the user views details of the first subgroup "Headache"
  And the modal is displayed
  And the modal's title is "Headache"
  And the modal dialog contains data labels

@f144_7_lab_report_search_result_view_detail @US2242 @DE865 @DE910 @DE2067 @DE4207 @DE5715 @DE6759
Scenario: User is able to view the detail of Lab result search results

  Given user searches for and selects "Four,PATIENT"
  Then Summary View is active
  Then user searches for "hdl - serum"
  Then text search results are grouped
  And the user expands the main group "Laboratory"
  And the user views details of the first "Lab HDL-Serum"
  Then the modal is displayed
  And the modal's title is "HDL (SERUM) 58 MG/DL" 
  And the Lab Detail table contains headers
    | Date | Lab Test | Flag | Result | Unit  | Ref Range | Facility |
  
@f144_8_lab_order_search_result_view_detail @US2250 @DE2432 @DE3413 @DE5126 @DE5165 @DE6759 @DE6912 @DE7010
Scenario: User is able to view the detail of lab order search results

  And user searches for and selects "Four,PATIENT"
  Then Summary View is active
  Then user searches for "Urinalysis" 
  And text search results are grouped 
  And the user expands the main group "Laboratory" 
  And the user views details of the first "Urinalysis"
  And the modal is displayed
  And the modal's title is "URINALYSIS URINE WC LB #579"
  And Current Status for Lab is ACTIVE
    
#defect DE7011 still exists for the last line
@f144_9_radiology_order_search_result_view_detail @US2256 @DE2337 @DE2432 @DE4555 @DE6814 @DE7011
Scenario: User is able to view the detail of radiology/Imaging orders search results

  And user searches for and selects "Four,PATIENT"
  Then Summary View is active
  Then user searches for "Radiology"
  And text search results are grouped   
  And the user expands the main group "RadiologyReport" 
  And the user expands the subgroup "Hip2OrMoreViews"
  And the user views details of the first subgroup "Hip2OrMoreViews"
  And the modal's title is "HIP 2 OR MORE VIEWS"
#  And Current Status for Radiology is "COMPLETE" 

@f144_10_radiology_order_search_result_view_detail @US2256 @DE2337 @DE2432 @DE4555
Scenario: User is able to view the detail of radiology/Imaging orders search results

  Given user searches for and selects "Four,PATIENT"
  Then Summary View is active
  Then user searches for "Radiology"
  And text search results are grouped 
  And the user expands the main group "Imaging"
  And the user views details of the first "Radiology Imaging"
  And the modal is displayed
  And the modal's title is "Radiologic Examination, abdomen; anteroposterior and additional oblique and cone views" 
  And the modal dialog contains data labels
  And Current Status for Radiology is "COMPLETE"
  
@f144_11_radiology_report_search_result_view_detail @US2363
Scenario: User is able to view the detail of radiology report search results

  Given user searches for and selects "TEN,PATIENT"
  Then Summary View is active
  Then user searches for "Radiology Report"
  Then text search results are grouped
  And the user expands the main group "RadiologyReport"
  And the user expands the subgroup "Cordotomy"  
  And the user views details of the first subgroup "Cordotomy"
  And the modal is displayed
  And the modal's title is "CORDOTOMY" 
  And the modal dialog contains data labels

@f144_12_display_text_snippest_and_searched_text_is_highlighted @US2906 @DE2337 @DE2657
Scenario: Text snippets should display when the requested text is found in the search result and the selected word should be highlighted.

  Given user searches for and selects "Four,PATIENT"
  Then Summary View is active
  Then user searches for "blood"
  And text search results are grouped
  And the user expands the main group "ProgressNote"
  And the sub group returns data
  And the user expands the subgroup "Diabetes"
  And the search results containing search term "blood" are highlighted 
  
@f144_13_data_for_subgroup_not_loaded_until_clicked @US2791 @DE2337 @DE2767
 Scenario: Data under subgroup is not loaded until the User expands the sub group.
 
  Given user searches for and selects "Four,PATIENT"
  Then Summary View is active
  Then user searches for "Progress Notes"
  Then text search results are grouped
  And the user expands the main group "ProgressNote"
  And the sub group returns data
  And no subgroup data rows are loaded
  And the user expands the subgroup "GeneralMedicineNote" 
  And subgroup data rows are loaded
  And the user expands the subgroup "AnneLab" 
  And more subgroup data rows are loaded
 
@f144_14_subgrouping_view_of_progress_notes @US2376 @DE1575 @DE2767 @document_text_search
Scenario:Text Search: Document data drill down "Progress Notes(Documents)" in Text Search
 
  And user searches for and selects "Four,PATIENT"
  Then Summary View is active
  Then user searches for "Progress Notes"
  Then text search results are grouped
  And the user expands the main group "ProgressNote"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "ProgressNote" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
@f144_15_subgrouping_view_of_Administrative_notes @US2792 @DE2337 @DE2657 @document_text_search
Scenario:Text Search: Document data drill down "Administrative Notes(Documents)" in Text Search

  And user searches for and selects "Ten,PATIENT"
  Then Summary View is active
  Then user searches for "Administrative"
  Then text search results are grouped
  And the user expands the main group "AdministrativeNote"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "AdministrativeNote" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
 
@f144_16_subgrouping_view_of_Advancedirective @US2792 @DE2337 @DE2657 @document_text_search
Scenario:Text Search: Document data drill down "Advancedirective (Documents)"

  And user searches for and selects "Ten,PATIENT"
  Then Summary View is active
  Then user searches for "directive"
  Then text search results are grouped
  And the user expands the main group "AdvanceDirective"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "AdvanceDirective" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
@f144_17_subgrouping_view_of_Clinical_Procedcure @US2792 @DE2337 @DE2657 @document_text_search
Scenario:Text Search: Document data drill down "Clinical Procedure (Documents)"

  Given user searches for and selects "Ten,PATIENT"
  Then Summary View is active
  Then user searches for "clinical procedure"
  Then text search results are grouped
  And the user expands the main group "ClinicalProcedure"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "ClinicalProcedure" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
  
@f144_18_subgrouping_view_of_Consult_Report @US2792 @DE2337 @DE2657 @document_text_search
Scenario:Text Search: Document data drill down "Consult Report"

  And user searches for and selects "Ten,PATIENT"
  Then Summary View is active
  Then user searches for "consult report"
  Then text search results are grouped
  And the user expands the main group "ConsultReport"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "ConsultReport" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
           
@f144_19_subgrouping_view_of_Consultation_Note_Document @US2792 @DE2337 @DE2657 @document_text_search
Scenario:Text Search: Document data drill down "Consultation Note (Provider) Document"

  And user searches for and selects "eight,PATIENT"
  Then Summary View is active
  Then user searches for "consultation note (provider) document"
  Then text search results are grouped
  And the user expands the main group "ConsultationNoteProviderDocument"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "ConsultationNoteProviderDocument" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
@f144_20_subgrouping_view_of_Crisis_Note_Document @US2792 @DE2337 @DE2657
Scenario:Text Search: Document data drill down "Crisis Note"

  And user searches for and selects "four,PATIENT"
  Then Summary View is active
  Then user searches for "crisis note"
  Then text search results are grouped
  And the user expands the main group "CrisisNote"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "CrisisNote" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
@f144_21_subgrouping_view_of_Discharge_Summary_Document @US2792 @DE2337 @DE2657
Scenario:Text Search: Document data drill down "Discharge Summary"

  And user searches for and selects "four,PATIENT"
  Then Summary View is active
  Then user searches for "Discharge Summary"
  Then text search results are grouped
  And the user expands the main group "DischargeSummary"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "DischargeSummary" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
      
@f144_22_subgrouping_view_of_Laboratory_Report_Document @US2792 @DE2337 @DE2657 @DE5288
Scenario:Text Search: Document data drill down "Laboratory Report"

  And user searches for and selects "ten,PATIENT"
  Then Summary View is active
  Then user searches for "Laboratory Report"
  Then text search results are grouped
  And the user expands the main group "LaboratoryReport"
  And the sub group returns data
  And the user expands the subgroup "LrElectronMicroscopyReport"   
  And the sub group returns data
      
@f144_23_subgrouping_view_of_Radiology_Report_Document @US2792 @DE2337 @DE2657
Scenario:Text Search: Document data drill down "Radiology Report"

  And user searches for and selects "ten,PATIENT"
  Then Summary View is active
  Then user searches for "Radiology Report"
  Then text search results are grouped
  And the user expands the main group "RadiologyReport"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "RadiologyReport" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |
        
@f144_24_subgrouping_view_of_Surgery_Report_Document @US2792 @DE2337 @DE2657
Scenario:Text Search: Document data drill down "Surgery Report"

  And user searches for and selects "ten,PATIENT"
  Then Summary View is active
  Then user searches for "Surgery Report"
  Then text search results are grouped
  And the user expands the main group "SurgeryReport"
  And the sub group returns data
  And the user expands all result groups
  And the text search subgroup "SurgeryReport" results display
     | field    | Sub_group_search_results        |
     | date     | is in valid format (mm/dd/yyyy) |
     | facility | is valid facility               |


