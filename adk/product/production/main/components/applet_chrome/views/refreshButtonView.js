define('main/components/applet_chrome/views/refreshButtonView', [
    'backbone',
    'marionette',
    'hbs!main/components/applet_chrome/templates/refreshButtonTemplate'
], function(Backbone,Marionette, RefreshButtonTemplate) {
    'use strict';
    var RefreshButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'span',
        template: RefreshButtonTemplate,
        attributes: function() {
            return{
                'class': 'grid-' + this.model.get('id')
            };
        },
        behaviors: {
            Tooltip: {}
        }
    });
    return RefreshButtonView;
});
