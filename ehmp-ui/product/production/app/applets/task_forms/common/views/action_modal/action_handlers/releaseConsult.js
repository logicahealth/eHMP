define([
    'underscore',
    'app/applets/task_forms/common/views/action_modal/currentAppointment'
], function(_, CurrentAppointment) {
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
        var currentAppt = _.last(_.get(model.get('clinicalObject'), 'data.appointments'));
        return _.get(currentAppt, 'type.id');
    }

    function isEConsult(model) {
        return getAppointmentTypeId(model) === appointmentTypesMap.ECONSULT;
    }

    function createTitle(model) {
        return isEConsult(model) ? 'Release eConsult' : 'Disassociate Note from Consult';
    }

    function getConsultTypeName(model) {
        return isEConsult(model) ? 'eConsult' : 'consult';
    }

    function getAssociateTitle(model) {
        var title = _.get(model.get('clinicalObject'), 'data.completion.noteTitle');
        if (_.isUndefined(title)) {
            title = "";
        }
        return title;
    }

    function createBodyView(model) {
        var template = model.get('signalName') === 'RELEASE.ECONSULT' ?
            '<p>Do you want to release this eConsult back to Triage?</p>' :
            '<p>Do you want to disassociate the note, ' + getAssociateTitle(model) + ' from this ' + getConsultTypeName(model) + '?</p>';

        var CommentTitle = {
            control: 'container',
            extraClasses: ['col-xs-12', 'top-margin-sm', 'bottom-margin-sm'],
            modelListeners: [''],
            template: template
        };
        var Comment = {
            control: 'container',
            extraClasses: ['col-xs-12', 'top-margin-xs', 'bottom-margin-md'],
            items: [{
                control: 'textarea',
                name: 'comment',
                title: 'Enter a comment',
                label: 'Comment',
                rows: 3,
                required: false,
                maxlength: 200
            }]
        };
        var BodyView = {
            control: "container",
            extraClasses: ['row'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-12'],
                modelListeners: [''],
                template: Handlebars.compile('<h5 class="top-margin-xs bottom-margin-xs bottom-padding-xs font-size-18">{{clinicalObject.displayName}}</h5>')
            }]
        };

        //SETTING CURRENT APPOINTMENT INFO
        var currentAppt = _.last(_.get(model.get('clinicalObject'), 'data.appointments'));
        if (_.get(currentAppt, 'status.id') === '2' /*scheduled*/ ) {
            BodyView.items.push(CurrentAppointment.createView(model));
        }

        BodyView.items.push(CommentTitle);
        BodyView.items.push(Comment);

        return BodyView;
    }

    return {
        getBodyView: createBodyView,
        getTitle: createTitle,
        onAccept: function(model) {
            model.set('signalBody', {
                noteClinicalObjectUid: isEConsult(model) ? '' : model.get('clinicalObject').data.completion.noteClinicalObjectUid,
                executionUserId: util.getUserId(),
                executionUserName: util.getUserName(),
                comment: model.get('comment')
            });
        }
    };

});
