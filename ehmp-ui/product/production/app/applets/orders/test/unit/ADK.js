define([
    'backbone'
], function(Backbone) {
    'use strict';

    //===========================RESOURCE MODEL MOCK===========================
    var ResourceModel = Backbone.Model.extend({
        initialize: function() {
            this.user = new Backbone.Model({
                site: '9E7A',
                duz: {
                    '9E7A': '55555'
                }
            });
            this.patient = new Backbone.Model({
                pid: '1234567890',
                uid: '1234567890',
                visit: {
                    serviceCategory: 'PSB',
                    dateTime: '201603290000',
                    location: '0987654321'
                }
            });
            this.errorModel = new Backbone.Model();
        }
    });

    var ResourceCollection = Backbone.Collection.extend({
        initialize: function() {
            this.user = new Backbone.Model({
                site: '9E7A',
                duz: {
                    '9E7A': '55555'
                }
            });
            this.patient = new Backbone.Model({
                pid: '1234567890',
                uid: '1234567890',
                visit: {
                    serviceCategory: 'PSB',
                    dateTime: '201603290000',
                    location: '0987654321'
                }
            });
            this.errorModel = new Backbone.Model();
        }
    });

    //============================DRAFT MODEL MOCK=============================
    var DraftModel = Backbone.Model.extend({
        getPayload: jasmine.createSpy('getPayload'),
        setPayload: jasmine.createSpy('setPayload'),
        extractPayload: jasmine.createSpy('extractPayload'),
        saveDraft: jasmine.createSpy('saveDraft'),
        getDraft: jasmine.createSpy('getDraft'),
        deleteDraft: jasmine.createSpy('deleteDraft'),
        setUid: jasmine.createSpy('setUid'),
        resetDraft: jasmine.createSpy('resetDraft')
    });

    //============================NOTIFICATION MOCK============================
    var Notification = function() {};
    Notification.prototype = {
        show: jasmine.createSpy('show')
    };

    //================================== ADK ==================================
    var ADK = {};

    ADK.Resources = {
        Writeback: {
            Model: ResourceModel,
            Collection: ResourceCollection
        },
        Picklist: {
            Model: ResourceModel,
            Collection: ResourceCollection
        }
    };

    ADK.UserService = {
        getUserSession: function() {
            return new Backbone.Model({
                site: '9E7A'
            });
        }
    };

    ADK.UI = {
        Notification: Notification
    };

    ADK.UIResources = {
        Writeback: {
            Orders: {
                Draft: {
                    Model: DraftModel
                }
            }
        }
    };

    return ADK;
});