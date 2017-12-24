define([], function() {

    var serverPath = "http://URL                   /pm/iehr/vista_evolution/eHMP/Help_Wiki/Wiki%20Page%20Library/";
    var serverLogonPath = "http://URL                   /pm/iehr/vista_evolution/eHMP/Help_Wiki/Wiki%20Page%20Library/Accessing%20the%20eHMP%20Application.aspx";
    var pageNotFoundPath = "help/eHMP_Page Not Found.htm";
    var helpNotAvailablePath = "help/eHMP_Help Content Not Available.htm";
    var pdfVersionPath = "eHMP_User Guide for Release 2 0_v1 2_09132016.pdf";

    var helpLinks = {
        "html_version": {
            "url": serverPath
        },
        "pdf_version": {
            "url": pdfVersionPath
        },
        "page_not_found": {
            "url": pageNotFoundPath
        },
        "help_unavailable": {
            "url": helpNotAvailablePath,
            "tooltip": "Help"
        },

        /****************************************
        Logon page
        ****************************************/
        "logon": {
            "url": serverLogonPath,
            "tooltip": "Help"
        },
        //FUTURE-TODO: SSOi add "#_TOC" when the user manual includes section about Supported VistAs
        "suported_vistas": {
            "url": serverPath,
            "tooltip": "Help"
        },

        /****************************************
        Patient Search
        ****************************************/
        "patient_search": {
            "url": serverPath + "Patient%20Selection%20Screen.aspx",
            "tooltip": "Help",
            "tooltip_placement": "bottom"
        },
        "patient_search_myCPRSList": {
            "url": serverPath + "Patient%20Selection%20Screen.aspx",
            "tooltip": "Help"
        },
        "patient_search_mySite": {
            "url": serverPath + "Patient%20Selection%20Screen.aspx",
            "tooltip": "Help"
        },
        "patient_search_recentPatients": {
            "url": serverPath + "Patient%20Selection%20Screen.aspx",
            "tooltip": "Help"
        },
        "patient_search_clinics": {
            "url": serverPath + "Patient%20Selection%20Screen.aspx",
            "tooltip": "Help"
        },
        "patient_search_wards": {
            "url": serverPath + "Patient%20Selection%20Screen.aspx",
            "tooltip": "Help"
        },
        "patient_search_nationwide": {
            "url": serverPath + "Patient%20Selection%20Screen.aspx",
            "tooltip": "Help"
        },
        "patient_search_confirm": {
            "url": serverPath + "Patient%20Confirmation.aspx",
            "tooltip": "Help"
        },
        "patient_search_restricted": {
            "url": serverPath + "Patient%20Selection%20Screen.aspx",
            "tooltip": "Help"
        },

        /****************************************
        The eHMP Header
        ****************************************/
        "ehmp_header": {
            "url": serverPath + "Global%20Navigation.aspx",
            "tooltip": "Help"
        },
        "patient_search_button": {
            "url": serverPath + "Global%20Navigation.aspx",
            "tooltip": "Help"
        },
        "user_info": {
            "url": serverPath + "Global%20Navigation.aspx",
            "tooltip": "Help"
        },

        /****************************************
        The Patient Demographic Bar
        ****************************************/
        "patient_demographic": {
            "url": serverPath + "Patient%20Information%20Bar.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Active & Recent Medications
        ****************************************/
        "activeMeds_gist": {
            "url": serverPath + "Active%20and%20Recent%20Meds%20Applet.aspx",
            "tooltip": "Help"
        },
        "activeMeds_standard": {
            "url": serverPath + "Active%20and%20Recent%20Meds%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Activities
        ****************************************/
        "activities_standard": {
            "url": serverPath + "Activities%20Applet.aspx",
            "tooltip": "Help"
        },
        "activities_expanded": {
            "url": serverPath + "Activities%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Allergies
        ****************************************/
        "allergy_grid_gist": {
            "url": serverPath + "Allergies%20Applet.aspx",
            "tooltip": "Help"
        },
        "allergy_grid_standard": {
            "url": serverPath + "Allergies%20Applet.aspx",
            "tooltip": "Help"
        },
        "allergy_grid_expanded": {
            "url": serverPath + "Allergies%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Appointments & Visits
        ****************************************/
        "appointments_standard": {
            "url": serverPath + "Appointments%20and%20Visits%20Applet.aspx",
            "tooltip": "Help"
        },
        "appointments_expanded": {
            "url": serverPath + "Appointments%20and%20Visits%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Clinical Reminders
        ****************************************/
        "clinical_reminders": {
            "url": serverPath + "Clinical%20Reminders%20Applet.aspx",
            "tooltip": "Help"
        },
        "cds_advice_standard": {
            "url": serverPath + "Clinical%20Reminders%20Applet.aspx",
            "tooltip": "Help"
        },
        "cds_advice_expanded": {
            "url": serverPath + "Clinical%20Reminders%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Community Health Summaries
        ****************************************/
        "ccd_grid_standard": {
            "url": serverPath + "Community%20Health%20Summaries%20Applet.aspx",
            "tooltip": "Help"
        },
        "ccd_grid_expanded": {
            "url": serverPath + "Community%20Health%20Summaries%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Conditions
        ****************************************/
        "problems": {
            "url": serverPath + "Problems%20Applet.aspx",
            "tooltip": "Help"
        },
        "problems_gist": {
            "url": serverPath + "Problems%20Applet.aspx",
            "tooltip": "Help"
        },
        "problems_standard": {
            "url": serverPath + "Problems%20Applet.aspx",
            "tooltip": "Help"
        },
        "problems_expanded": {
            "url": serverPath + "Problems%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Documents
        ****************************************/
        "documents_standard": {
            "url": serverPath + "Documents%20Applet.aspx",
            "tooltip": "Help"
        },
        "documents_expanded": {
            "url": serverPath + "Documents%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Encounters
        ****************************************/
        "encounters_gist": {
            "url": serverPath + "Encounters%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Immunizations
        ****************************************/
        "immunizations_gist": {
            "url": serverPath + "Immunizations%20Applet.aspx",
            "tooltip": "Help"
        },
        "immunizations_standard": {
            "url": serverPath + "Immunizations%20Applet.aspx",
            "tooltip": "Help"
        },
        "immunizations_expanded": {
            "url": serverPath + "Immunizations%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Medications Review
        ****************************************/
        "medication_review_expanded": {
            "url": serverPath + "Medications%20Review%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Narrative Lab Results
        ****************************************/
        "narrative_lab_results_grid_standard": {
            "url": serverPath + "Narrative%20Lab%20Results%20Applet.aspx",
            "tooltip": "Help"
        },
        "narrative_lab_results_grid_expanded": {
            "url": serverPath + "Narrative%20Lab%20Results%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Numeric Lab Results
        ****************************************/
        "lab_results_grid_standard": {
            "url": serverPath + "Numeric%20Lab%20Results%20Applet.aspx",
            "tooltip": "Help"
        },
        "lab_results_grid_expanded": {
            "url": serverPath + "Numeric%20Lab%20Results%20Applet.aspx",
            "tooltip": "Help"
        },
        "lab_results_grid_gist": {
            "url": serverPath + "Numeric%20Lab%20Results%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Orders
        ****************************************/
        "orders_standard": {
            "url": serverPath + "Orders%20Applet.aspx",
            "tooltip": "Help"
        },
        "orders_expanded": {
            "url": serverPath + "Orders%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Reports
        ****************************************/
        "reports_standard": {
            "url": serverPath + "Reports%20Applet.aspx",
            "tooltip": "Help"
        },
        "reports_expanded": {
            "url": serverPath + "Reports%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Stacked Graph
        ****************************************/
        "stackedGraph_expanded": {
            "url": serverPath + "Stacked%20Graphs%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Tasks
        ****************************************/
        "todo_list_standard": {
            "url": serverPath + "Tasks%20Applet.aspx",
            "tooltip": "Help"
        },
        "todo_list_expanded": {
            "url": serverPath + "Tasks%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Timeline
        ****************************************/
        "newsfeed_standard": {
            "url": serverPath + "Timeline%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Timeline Summary in GDT
        ****************************************/
        "newsfeed_expanded": {
            "url": serverPath + "Timeline%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        VistA Health Summaries
        ****************************************/
        "vista_health_summaries_standard": {
            "url": serverPath + "VistA%20Health%20Summaries%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Vitals
        ****************************************/
        "vitals_gist": {
            "url": serverPath + "Vitals%20Applet.aspx",
            "tooltip": "Help"
        },
        "vitals_standard": {
            "url": serverPath + "Vitals%20Applet.aspx",
            "tooltip": "Help"
        },
        "vitals_expanded": {
            "url": serverPath + "Vitals%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Military History
        ****************************************/
        "military_hist_standard": {
            "url": serverPath + "Military%20History%20Applet.aspx",
            "tooltip": "Help"
        },
        "military_hist_expanded": {
            "url": serverPath + "Military%20History%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Applet Features
        ****************************************/
        "coversheet": {
            "url": serverPath + "Workspaces.aspx",
            "tooltip": "Help",
            "tooltip_placement": "bottom"
        },

        /****************************************
        Workspace Manager
        ****************************************/
        "workspace_manager": {
            "url": serverPath + "Workspace%20Manager.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Workspace Editor
        ****************************************/
        "workspace_editor": {
            "url": serverPath + "Workspace%20Editor.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Record Search
        ****************************************/
        "record_search": {
            "url": serverPath + "Record%20Search.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Global Date Filter
        ****************************************/
        "gdf": {
            "url": serverPath + "Global%20Date%20Filter.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Other eHMP Features
        ****************************************/
        "status_bar": {
            "url": serverPath + "Footer.aspx",
            "tooltip": "Help"
        },

        /****************************************
        User Management
        ****************************************/
        "user_management_standard": {
            "url": serverPath + "Access%20Control.aspx",
            "tooltip": "Help"
        },
        "user_management_expanded": {
            "url": serverPath + "Access%20Control.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Video Visits
        ****************************************/
        "video_visits_standard": {
            "url": serverPath + "Video%20Visits%20Applet.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Trays (Write Backs)
        ****************************************/

        // "notes_esig_form": {
        //     "url": serverPath + "Esignature%20Write%20Back.aspx",
        //     "tooltip": "Help"
        // },

        /****************************************
        Encounters Tray
        ****************************************/
        "visit_form": {
            "url": serverPath + "Encounter%20Write%20Back.aspx",
            "tooltip": "Help"
        },
        "encounters_form": {
            "url": serverPath + "Encounter%20Write%20Back.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Observations Tray
        ****************************************/
        "observations_tray": {
            "url": serverPath + "Observation%20Tray.aspx",
            "tooltip": "Help"
        },
        "allergies_form": {
            "url": serverPath + "Observation%20Tray%20-%20Allergy.aspx",
            "tooltip": "Help"
        },
        "allergies_eie_form": {
            "url": serverPath + "Observation%20Tray%20-%20Allergy.aspx",
            "tooltip": "Help"
        },
        "immunizations_form": {
            "url": serverPath + "Observation%20Tray%20-%20Immunization.aspx",
            "tooltip": "Help"
        },
        "problems_form": {
            "url": serverPath + "Observation%20Tray%20-%20Problem.aspx",
            "tooltip": "Help"
        },
        "vitals_form": {
            "url": serverPath + "Observation%20Tray%20-%20Vital.aspx",
            "tooltip": "Help"
        },
        "vitals_eie_form": {
            "url": serverPath + "Observation%20Tray%20-%20Vital.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Actions Tray
        ****************************************/
        "actions_tray": {
            "url": serverPath + "Action%20Tray.aspx",
            "tooltip": "Help"
        },
        "lab_order_discontinue_form": {
            "url": serverPath + "Action%20Tray%20-%20Lab%20Order.aspx",
            "tooltip": "Help"
        },
        "lab_order_esig_form": {
            "url": serverPath + "Action%20Tray%20-%20Lab%20Order.aspx",
            "tooltip": "Help"
        },
        "lab_order_form": {
            "url": serverPath + "Action%20Tray%20-%20Lab%20Order.aspx",
            "tooltip": "Help"
        },
        "consult_order_form": {
            "url": serverPath + "Action%20Tray%20-%20Consult%20Order.aspx",
            "tooltip": "Help"
        },
        "consult_select_form": {
            "url": serverPath + "Action%20Tray%20-%20Consult%20Order.aspx",
            "tooltip": "Help"
        },
        "consult_triage_form": {
            "url": serverPath + "Action%20Tray%20-%20Consult%20Order.aspx",
            "tooltip": "Help"
        },
        "consult_scheduling_form": {
            "url": serverPath + "Action%20Tray%20-%20Consult%20Order.aspx",
            "tooltip": "Help"
        },
        "consult_esig_form": {
            "url": serverPath + "Action%20Tray%20-%20Consult%20Order.aspx",
            "tooltip": "Help"
        },
        "request_order_form": {
            "url": serverPath + "Action%20Tray%20-%20Request.aspx",
            "tooltip": "Help"
        },
        "response_order_form": {
            "url": serverPath + "Action%20Tray%20-%20Request.aspx",
            "tooltip": "Help"
        },
        "discharge_followup_expanded": {
            "url": serverPath + "Inpatient%20Discharge%20Follow%20Up%20Applet.aspx",
            "tooltip": "Help"
        },
        "discharge_followup_response_form": {
            "url": serverPath + "Action%20Tray%20-%20Discharge%20Follow%20Up.aspx",
            "tooltip": "Help"
        },
        "order_search_tray": {
            "url": serverPath + "Action%20Tray.aspx",
            "tooltip": "Help"
        },
        "video_visit_appointment_form": {
            "url": serverPath + "Action%20Tray%20-%20Video%20Visit.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Notes Tray
        ****************************************/
        "notes_tray": {
            "url": serverPath + "Notes%20Tray.aspx",
            "tooltip": "Help"
        },
        "notes_preview_form": {
            "url": serverPath + "Notes%20Tray%20-%20New%20Note.aspx",
            "tooltip": "Help"
        },
        "consults_subtray": {
            "url": serverPath + "Notes%20Tray%20-%20Open%20Consults.aspx",
            "tooltip": "Help"
        },
        "note_objects_subtray": {
            "url": serverPath + "Notes%20Tray%20-%20New%20Objects.aspx",
            "tooltip": "Help"
        },
        "notes_form": {
            "url": serverPath + "Notes%20Tray%20-%20New%20Note.aspx",
            "tooltip": "Help"
        },

        /****************************************
        Patient Info Tray
        ****************************************/
        "patient_demographics_tray": {
            "url": serverPath + "Patient%20Information%20Bar.aspx",
            "tooltip": "Help"
        },
        "crisis_notes_cwadf_tray": {
            "url": serverPath + "Crisis%20Notes.aspx",
            "tooltip": "Help"
        },
        "warnings_cwadf_tray": {
            "url": serverPath + "Warnings.aspx",
            "tooltip": "Help"
        },
        "allergies_cwadf_tray": {
            "url": serverPath + "Allergies.aspx",
            "tooltip": "Help"
        },
        "directives_cwadf_tray": {
            "url": serverPath + "Directives.aspx",
            "tooltip": "Help"
        },
        "flags_cwadf_tray": {
            "url": serverPath + "Patient%20Flags.aspx",
            "tooltip": "Help"
        },
        "provider_information_tray": {
            "url": serverPath + "Provider%20Information.aspx",
            "tooltip": "Help"
        }
    };

    return helpLinks;
});