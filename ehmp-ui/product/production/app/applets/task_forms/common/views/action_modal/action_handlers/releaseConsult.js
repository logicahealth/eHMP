define([], function() {
    'use strict';

    var appointmentTypesMap = {
        'NOTASSIGNED': '0',
        'VA': '1',
        'CHOICE': '2',
        'DOD': '3',
        'GEC': '4',
        'NON-VACARE': '5',
        'SHARINGAGREEMENT': '6',
        'ECONSULT': '7'
    };


    var util = {
        getUser: function() {
            var site = ADK.UserService.getUserSession().get('site');
            return ADK.UserService.getUserSession().get('duz')[site];
        },
        getUserId: function() {
            return ADK.UserService.getUserSession().get('site') + ';' + this.getUser();
        },
        getUserName: function() {
            return ADK.UserService.getUserSession().get('lastname') + ',' + ADK.UserService.getUserSession().get('firstname');
        }
    };

    /**
     * Get the Appointment type id
     */
    function getAppointmentTypeId(model) {
        var currentAppt = _.last(dd(model.get('clinicalObject'))('data')('appointments').val);
        return dd(currentAppt)('type')('id').val;
    }

    function createTitle(model) {
        return getAppointmentTypeId(model) === appointmentTypesMap.ECONSULT ? 'Disassociate Note from eConsult' : 'Disassociate Note from Consult';
    }

    function getConsultTypeName(model) {
        return getAppointmentTypeId(model) === appointmentTypesMap.ECONSULT ? 'eConsult' : 'consult';
    }

    function getAssociateTitle(model) {
        var title = dd(model.get('clinicalObject'))('data')('completion')('noteTitle').val;
        if (_.isUndefined(title)) {
            title = "";
        }
        return title;
    }

    function createBodyView(model) {

        var BodyView = {
            control: "container",
            extraClasses: ['row'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-12'],
                modelListeners: [''],
                template: '<h5 class="top-margin-xs bottom-margin-xs bottom-padding-xs font-size-18">{{clinicalObject.displayName}}</h5>'
            }, {
                control: 'container',
                extraClasses: ['col-xs-12', 'top-margin-sm', 'bottom-margin-sm'],
                modelListeners: [''],
                template: '<p>Do you want to disassociate the note, ' + getAssociateTitle(model) + ' from this ' + getConsultTypeName(model) + '?</p>'
            }, {
                control: "container",
                extraClasses: ["col-xs-12"],
                items: [{
                    control: "textarea",
                    name: 'comment',
                    title: "Enter a comment",
                    label: "Comment",
                    rows: 3,
                    required: false,
                    maxlength: 200
                }]
            }]
        };
        return BodyView;
    }

    return {
        getBodyView: createBodyView,
        getTitle: createTitle,
        onAccept: function(model) {
            model.set('signalBody', {
                noteClinicalObjectUid: model.get('clinicalObject').data.completion.noteClinicalObjectUid,
                executionUserId: util.getUserId(),
                executionUserName: util.getUserName(),
                comment: model.get('comment')
            });
        }
    };

});