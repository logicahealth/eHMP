define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/notes/subtray/noteSubtrayTemplate',
    'app/applets/notes/writeback/formUtil',
    'app/applets/notes/writeback/modelUtil',
    'app/applets/notes/asuUtil'
], function(Backbone, Marionette, _, noteSubtrayTemplate, formUtil, modelUtil, asuUtil) {
    'use strict';

    var noteView = Backbone.Marionette.ItemView.extend({
        template: noteSubtrayTemplate,
        initialize: function() {
            var addendumModel = ADK.Messaging.getChannel('note-addendum').request('model');
            this.model = addendumModel.get('noteModel');

            // remove current addendum
            this.model.set('addenda', _.filter(this.model.get('addenda'), function(item) {
                return item.uid !== addendumModel.get('uid');
            }));

            if (!this.model.has('addenda') || _.isEmpty(this.model.get('addenda'))) {
                var addenda = [];

                _.each(this.model.get('text'), function(text, index) {
                    if (index === 0) {
                        return;
                    }
                    var addendum = {'text': []};
                    addendum.text.push(_.clone(text));
                    addenda.push(addendum);
                }, this);

                this.model.set('addenda', addenda);
            }


            modelUtil.formatTextContent(this.model);
            modelUtil.formatSignatureContent(this.model);
            modelUtil.previewAddendaAddWarningBanner(this.model);
            modelUtil.setEncounterDisplayName(this.model);
            modelUtil.detectCosigner(this.model);

            this.listenTo(ADK.Messaging.getChannel('notes'), 'show.subTray', function(model) {
                this.$el.trigger('subTray.show');
            });
        }
    });

    return noteView;
});