define([

], function() {
    'use strict';

    var actionTextMap = {
        1: 'Completed, by Note',
        2: 'Completed, eConsult',
        3: 'Completed, Admin',
        4: 'Completed, Community Care'
    };

    return {
        getBodyView: function(model) {
            var isCommunityCare = model.get('state').toUpperCase() === 'COMMUNITY CARE';

            var actionItemComponent;
            if (isCommunityCare) {
                actionItemComponent = {
                    control: 'container',
                    extraClasses: ['col-xs-12', 'top-margin-sm', 'bottom-margin-sm'],
                    template: 'This consult was completed external to VA'
                };
            } else {
                actionItemComponent = {
                    control: "container",
                    extraClasses: ["col-xs-6", "top-margin-sm"],
                    items: [{
                        control: 'select',
                        name: 'actionId',
                        label: 'Complete Action',
                        required: true,
                        disabled: false,
                        title: 'Use up and down arrow keys to view options and press enter to select',
                        pickList: [{
                            value: '1',
                            label: 'Completed, by Note'
                        }, {
                            value: '2',
                            label: 'Completed, eConsult'
                        }, {
                            value: '3',
                            label: 'Completed, Admin'

                        }]
                    }]
                };
            }
            var CompleteActionBody = {
                control: "container",
                extraClasses: ["row"],
                items: [{
                    control: 'container',
                    extraClasses: ['col-xs-12'],
                    modelListeners: [''],
                    template: Handlebars.compile('<h5 class="top-margin-xs bottom-margin-xs bottom-padding-xs font-size-18">{{clinicalObject.displayName}}</h5>')
                }, actionItemComponent, {
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
            return CompleteActionBody;
        },
        onAccept: function(model) {
            var isCommunityCare = model.get('state').toUpperCase() === 'COMMUNITY CARE';
            model.set('signalBody', {
                actionId: isCommunityCare ? '4' : model.get('actionId'),
                comment: model.get('comment'),
                actionText: actionTextMap[model.get('actionId')]
            });
        }
    };
});