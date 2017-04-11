define([], function() {

    var serverPath = "http://DNS  DNS       .DNS   /pm/iehr/vista_evolution/eHMP/Help_Wiki/Wiki%20Page%20Library/";
    var serverLogonPath = "http://DNS  DNS       .DNS   /pm/iehr/vista_evolution/eHMP/Help_Wiki/Wiki%20Page%20Library/Accessing%20the%20eHMP%20Application.aspx";
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
        "myCPRSList": {
            "url": serverPath + "Patient%20Selection%20Screen.aspx",
            "tooltip": "Help"
        },
        "mySite": {
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
        }
    };

    return helpLinks;
});
