define([
	'backbone',
    'underscore',
    'marionette',
    'backgrid'
], function(
	Backbone,
	_,
	Marionette,
	Backgrid
) {
    "use strict";
    var ThumbnailView = Backbone.Marionette.ItemView.extend({
        events: {
            'click': 'onClick'
        },
        template: Handlebars.compile([
            '<div class="all-margin-xs right-padding-xs">',
            '<a href="#"><img alt="Thumbnail of Medical Record" class="percent-width-80" src={{thumbnailUrl}}/></a>',
            '<span class="badge">{{imageCount}}</span> Images</div>'
        ].join('\n')),
        tagName: 'div',
        className: 'col-xs-2 all-padding-md',
        onClick: function(event) {
            event.preventDefault();
            event.stopPropagation();
            ADK.Messaging.getChannel('image_viewer').request('viewer-tab', {
                viewerUrl: this.model.get('viewerUrl')
            });
        }
    });
    return ThumbnailView;
});
