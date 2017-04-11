define([

], function() {
    'use strict';

    var ReleaseActionBody = {
        control: "container",
        extraClasses: ["row"],
        items: [{
            control: 'container',
            extraClasses: ['col-xs-12'],
            modelListeners: [''],
            template: Handlebars.compile('<h5 class="top-margin-xs bottom-margin-xs bottom-padding-xs font-size-18">{{clinicalObject.displayName}}</h5>')
        }, {
            control: 'container',
            extraClasses: ['col-xs-12', 'bottom-margin-md', 'top-margin-md'],
            modelListeners: [''],
            template: '<p>Do you want to remove this consult from the Electronic Wait List (EWL)?</p>'
        }, {
            control: "container",
            extraClasses: ["col-xs-12"],
            items: [{
                control: "textarea",
                name: "comment",
                title: "Enter a comment",
                label: "Comment",
                rows: 3,
                required: false,
                maxlength: 200
            }]
        }]
    };

    return {
        getBodyView: function() {
            return ReleaseActionBody;
        },
        onAccept: function(model) {
            model.set('signalBody', {
                comment: model.get('comment')
            });
        }
    };
});