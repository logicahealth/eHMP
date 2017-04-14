define([
    'main/ui_components/form/controls/radioList'
], function(
    RadioList
) {
    'use strict';

    var YesNoChecklistControl = RadioList.extend({
        defaults: _.defaults({
            options: [{
                label: "Yes",
                value: true
            }, {
                label: "No",
                value: false
            }, {
                label: "N/A",
                value: null
            }]
        }, RadioList.prototype.defaults)
    });

    return YesNoChecklistControl;
});