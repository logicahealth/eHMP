define([], function() {
    'use strict';

    function createBodyView(model) {

        var BodyView = {
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
                template: '<p>Do you want to remove this consult from Community Care?</p>'
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

        return BodyView;
    }

    return {
        getBodyView: createBodyView,
        onAccept: function(model) {
            model.set('signalBody', {
                comment: model.get('comment')
            });
        }
    };
});