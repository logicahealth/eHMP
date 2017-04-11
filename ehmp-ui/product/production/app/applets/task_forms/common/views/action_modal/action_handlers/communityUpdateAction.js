define([
    'app/applets/task_forms/common/utils/signalNames'
], function(SignalNames) {
    'use strict';

    function createBody(model) {
        var statusText = model.get('signalName') === SignalNames.CONSULT.COMMUNITY.UPDATE.SCHEDULED ? 'scheduled' : 'pending';

        var Body = {
            control: 'container',
            extraClasses: ['row'],
            items: [{
                control: 'container',
                extraClasses: ['col-xs-12'],
                modelListeners: [''],
                template: Handlebars.compile('<h5 class="top-margin-xs bottom-margin-xs bottom-padding-xs font-size-18">{{clinicalObject.displayName}}</h5>')
            }, {
                control: 'container',
                extraClasses: ['col-xs-12', 'top-margin-sm', 'bottom-margin-sm'],
                modelListeners: [''],
                template: '<p>Do you want to update the status of this Community Care appointment to ' + statusText + '?</p>'
            }, {
                control: 'container',
                extraClasses: ['col-xs-12'],
                items: [{
                    control: 'textarea',
                    name: 'comment',
                    title: 'Enter a comment',
                    label: 'Comment',
                    rows: 3,
                    required: false,
                    maxlength: 200
                }]
            }]
        };
        return Body;
    }


    return {
        getBodyView: createBody,
        onAccept: function(model) {
            model.set('signalBody', {
                comment: model.get('comment')
            });
        }
    };
});