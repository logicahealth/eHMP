define([], function() {
    'use strict';

    var CONFIG = {
        // Switch ON/OFF debug info
        debug:  false,
        // Switch ON/OFF error log
        errorLog: true,
        // Switch ON/OFF server site filter
        serverDateFilter: true,
        // Default view GroupBy(true), GridView(false)
        GroupByView: true,
        // List of kinds for complex views
        complexViews: ['consult', 'procedure', 'imaging', 'surgery', 'radiology report', 'surgery report']
    };
    return CONFIG;
});
