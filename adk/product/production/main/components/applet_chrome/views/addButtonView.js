define('main/components/applet_chrome/views/addButtonView', [
    'backbone',
    'marionette',
    'hbs!main/components/applet_chrome/templates/addButtonTemplate'
], function(Backbone, Marionette, AddButtonTemplate) {
    'use strict';
    var AddButtonView = Backbone.Marionette.ItemView.extend({
        tagName: 'span',
        template: AddButtonTemplate,
        attributes: function() {
            return{
                'class': 'grid-' + this.model.get('id')
            };
        },
        behaviors: {
            Tooltip: {}
        }
    });
    return AddButtonView;
});
