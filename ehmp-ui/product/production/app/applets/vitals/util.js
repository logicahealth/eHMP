define([], function() {
    'use strict';
    var Util = {};

    Util.getVitalLongName = function(typeName) {
        var type = typeName.toLowerCase();
        var modalTitleName;
        switch (type) {
            case 'bp':
                modalTitleName = 'Blood Pressure';
                break;
            case 'p':
                modalTitleName= 'Pulse';
                break;
            case 'rr':
            case 'r':
                modalTitleName = 'Respiration';
                break;
            case 't':
                modalTitleName = 'Temperature';
                break;
            case 'po2':
                modalTitleName = 'Pulse Oximetry';
                break;
            case 'pn':
                modalTitleName = 'Pain';
                break;
            case 'wt':
                modalTitleName = 'Weight';
                break;
            case 'ht':
                modalTitleName = 'Height';
                break;
            case 'bmi':
                modalTitleName = 'Body Mass Index';
                break;
            default:
                modalTitleName = typeName;
                break;
        }
        return modalTitleName;
    };

    return Util;
});
