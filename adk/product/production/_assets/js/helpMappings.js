define([], function() {

    var serverPath = "help/eHMP_User Guide for Release 1.3_v1.1_12012015.htm";
    var serverLogonPath = "help/eHMP_User Guide for Release 1.3_v1.1_12012015 logon.htm";
    var pageNotFoundPath = "help/eHMP_Page Not Found.htm";
    var helpNotAvailablePath = "help/eHMP_Help Content Not Available.htm";
    var pdfVersionPath = "eHMP_User Guide for Release 1.3_v1.1_12012015.pdf";

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
        //TODO: add "#_TOC" when the user manual includes section about Supported VistAs
        "suported_vistas": {
            "url": serverPath,
            "tooltip": "Help"
        },

        /****************************************
        Patient Search
        ****************************************/
        "patient_search": {
            "url": serverPath + "#_Toc435776066",
            "tooltip": "Help",
            "tooltip_placement": "bottom"
        },
        "myCPRSList": {
            "url": serverPath + "#_Toc435776067",
            "tooltip": "Help"
        },
        "mySite": {
            "url": serverPath + "#_Toc435776067",
            "tooltip": "Help"
        },
        "patient_search_confirm": {
            "url": serverPath + "#_Toc435776070",
            "tooltip": "Help"
        },
        "patient_search_restricted": {
            "url": serverPath + "#_Toc435776071",
            "tooltip": "Help"
        },

        /****************************************
        The eHMP Header
        ****************************************/
        "ehmp_header": {
            "url": serverPath + "#_Toc435776074",
            "tooltip": "Help"
        },
        "patient_search_button": {
            "url": serverPath + "#_Toc435776076",
            "tooltip": "Help"
        },
        "user_info": {
            "url": serverPath + "#_Toc435776078",
            "tooltip": "Help"
        },

        /****************************************
        Active & Recent Medications
        ****************************************/
        "activeMeds_gist": {
            "url": serverPath + "#_Toc435776094",
            "tooltip": "Help"
        },
        "activeMeds_standard": {
            "url": serverPath + "#_Toc435776095",
            "tooltip": "Help"
        },

        /****************************************
        Allergies
        ****************************************/
        "allergy_grid_gist": {
            "url": serverPath + "#_Toc435776098",
            "tooltip": "Help"
        },
        "allergy_grid_standard": {
            "url": serverPath + "#_Toc435776099",
            "tooltip": "Help"
        },
        "allergy_grid_expanded": {
            "url": serverPath + "#_Toc435776100",
            "tooltip": "Help"
        },

        /****************************************
        Appointments & Visits
        ****************************************/
        "appointments_standard": {
            "url": serverPath + "#_Toc435776103",
            "tooltip": "Help"
        },
        "appointments_expanded": {
            "url": serverPath + "#_Toc435776104",
            "tooltip": "Help"
        },

        /****************************************
        Clinical Reminders
        ****************************************/
        "clinical_reminders": {
            "url": serverPath + "#_Toc435776106",
            "tooltip": "Help"
        },
        "cds_advice_standard": {
            "url": serverPath + "#_Toc435776107",
            "tooltip": "Help"
        },
        "cds_advice_expanded": {
            "url": serverPath + "#_Toc435776108",
            "tooltip": "Help"
        },

        /****************************************
        Community Health Summaries
        ****************************************/
        "ccd_grid_standard": {
            "url": serverPath + "#_Toc435776111",
            "tooltip": "Help"
        },
        "ccd_grid_expanded": {
            "url": serverPath + "#_Toc435776112",
            "tooltip": "Help"
        },

        /****************************************
        Conditions
        ****************************************/
        "problems": {
            "url": serverPath + "#_Toc435776114",
            "tooltip": "Help"
        },
        "problems_gist": {
            "url": serverPath + "#_Toc435776115",
            "tooltip": "Help"
        },
        "problems_standard": {
            "url": serverPath + "#_Toc435776116",
            "tooltip": "Help"
        },
        "problems_expanded": {
            "url": serverPath + "#_Toc435776117",
            "tooltip": "Help"
        },

        /****************************************
        Documents
        ****************************************/
        "documents_standard": {
            "url": serverPath + "#_Toc435776120",
            "tooltip": "Help"
        },
        "documents_expanded": {
            "url": serverPath + "#_Toc435776121",
            "tooltip": "Help"
        },

        /****************************************
        Encounters
        ****************************************/
        "encounters_gist": {
            "url": serverPath + "#_Toc435776124",
            "tooltip": "Help"
        },

        /****************************************
        Immunizations
        ****************************************/
        "immunizations_gist": {
            "url": serverPath + "#_Toc435776127",
            "tooltip": "Help"
        },
        "immunizations_standard": {
            "url": serverPath + "#_Toc435776128",
            "tooltip": "Help"
        },
        "immunizations_expanded": {
            "url": serverPath + "#_Toc435776129",
            "tooltip": "Help"
        },

        /****************************************
        Medications Review
        ****************************************/
        "medication_review_expanded": {
            "url": serverPath + "#_Toc435776132",
            "tooltip": "Help"
        },

        /****************************************
        Narrative Lab Results
        ****************************************/
        "narrative_lab_results_grid_standard": {
            "url": serverPath + "#_Toc435776135",
            "tooltip": "Help"
        },
        "narrative_lab_results_grid_expanded": {
            "url": serverPath + "#_Toc435776136",
            "tooltip": "Help"
        },

        /****************************************
        Numeric Lab Results
        ****************************************/
        "lab_results_grid_standard": {
            "url": serverPath + "#_Toc435776135",
            "tooltip": "Help"
        },
        "lab_results_grid_expanded": {
            "url": serverPath + "#_Toc435776136",
            "tooltip": "Help"
        },
        "lab_results_grid_gist": {
            "url": serverPath + "#_Toc435776139",
            "tooltip": "Help"
        },

        /****************************************
        Orders
        ****************************************/
        "orders_standard": {
            "url": serverPath + "#_Toc435776144",
            "tooltip": "Help"
        },
        "orders_expanded": {
            "url": serverPath + "#_Toc435776145",
            "tooltip": "Help"
        },

        /****************************************
        Reports
        ****************************************/
        "reports_standard": {
            "url": serverPath + "#_Toc435776148",
            "tooltip": "Help"
        },
        "reports_expanded": {
            "url": serverPath + "#_Toc435776149",
            "tooltip": "Help"
        },

        /****************************************
        Stacked Graph
        ****************************************/
        "stackedGraph_expanded": {
            "url": serverPath + "#_Toc435776151",
            "tooltip": "Help"
        },

        /****************************************
        Timeline
        ****************************************/
        "newsfeed_standard": {
            "url": serverPath + "#_Toc435776153",
            "tooltip": "Help"
        },

        /****************************************
        VistA Health Summaries
        ****************************************/
        "vista_health_summaries_standard": {
            "url": serverPath + "#_Toc435776158",
            "tooltip": "Help"
        },

        /****************************************
        Vitals
        ****************************************/
        "vitals_gist": {
            "url": serverPath + "#_Toc435776161",
            "tooltip": "Help"
        },
        "vitals_standard": {
            "url": serverPath + "#_Toc435776162",
            "tooltip": "Help"
        },
        "vitals_expanded": {
            "url": serverPath + "#_Toc435776163",
            "tooltip": "Help"
        },

        /****************************************
        Applet Features
        ****************************************/
        "coversheet": {
            "url": serverPath + "#_Toc435776166",
            "tooltip": "Help",
            "tooltip_placement": "bottom"
        },

        /****************************************
        Workspace Manager
        ****************************************/
        "_standard": {
            "url": serverPath + "#_Toc435776183",
            "tooltip": "Help"
        },

        /****************************************
        Other eHMP Features
        ****************************************/
        "status_bar": {
            "url": serverPath + "#_Toc435776198",
            "tooltip": "Help"
        },

        /****************************************
        User Management
        ****************************************/
        "user_management_standard": {
            "url": serverPath + "#_Toc435776199",
            "tooltip": "Help"
        },
        "user_management_expanded": {
            "url": serverPath + "#_Toc435776199",
            "tooltip": "Help"
        }
    };

    return helpLinks;
});
