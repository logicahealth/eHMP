define([
    'backbone'
], function(Backbone) {
    'use strict';

    /**
     * Orderable models refers to models returned by RDK's Orderables resource, which provides a homogenous
     * data structure for enterprise orderables (e.g. consults) and lab-orderables. These follow the data structure
     * defined for enterprise-orderables.
     *
     * Reference: https://wiki.vistacore.us/display/DNS RE/Enterprise+Orderables+API
     */
    function getBaseClinicalObject(orderableModel) {
        var userSession = ADK.UserService.getUserSession();
        var patient = ADK.PatientRecordService.getCurrentPatient();
        var site = userSession.get('site');
        var user = 'urn:va:user:' + site + ':' + userSession.get('duz')[site];
        return {
            patientUid: patient.get('uid'),
            authorUid: user,
            domain: orderableModel.get('domain'),
            subDomain: orderableModel.get('subDomain'),
            displayName: orderableModel.get('name')
        };
    }

    function consultToClinicalObject(consultModel) {
        return new Backbone.Model(_.extend(getBaseClinicalObject(consultModel), {
            data: {
                consultOrders: [consultModel.toJSON()]
            }
        }));
    }

    function labOrderableToClinicalObject(labModel) {
        return new Backbone.Model(_.extend(getBaseClinicalObject(labModel), {
            data: {
                ien: labModel.get('uid')
            }
        }));
    }

    return {
        consultToClinicalObject: consultToClinicalObject,
        labOrderableToClinicalObject: labOrderableToClinicalObject
    };
});