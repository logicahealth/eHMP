define([
    'backbone',
    'marionette',
    'underscore',
], function (Backbone, Marionette, _) {
    'use strict';

    var footerView = Backbone.Marionette.ItemView.extend({
        initialize: function() {
            this.authorUid = 'urn:va:user:' + ADK.UserService.getUserSession().get('site') + ':' + ADK.UserService.getUserSession().get('duz')[ADK.UserService.getUserSession().get('site')];
            this.listenTo(ADK.Messaging.getChannel('notes'), 'addendum:added', function(model) {
                if (model.get('parentUid') === this.model.get('uid')) {
                    if (!this.model.get('addenda')) {
                        this.model.set('addenda', []);
                    }
                    this.model.get('addenda').push(model.attributes);
                    this.toggleAddAddendumButton();
                }
            });

            this.listenTo(ADK.Messaging.getChannel('notes'), 'addendum:deleted', function(model) {
                if (model.get('parentUid') === this.model.get('uid')) {
                    _.remove(this.model.get('addenda'), function(addendum) {
                        return addendum.uid === model.get('uid');
                    });
                    this.toggleAddAddendumButton();
                }
            });

            this.listenTo(ADK.Messaging.getChannel('notes'), 'addendum:signed', function(model) {

                model.data.successes.each(function(item) {
                    if (item.get('isAddendum') && item.get('parentUid') === this.model.get('uid')) {
                        _.remove(this.model.get('addenda'), function(addendum) {
                            return addendum.uid === item.get('oldUid');
                        });

                        this.toggleAddAddendumButton();
                        return false;
                    }
                }, this);
            });
        },
        onRender: function() {
            this.toggleAddAddendumButton();
        },
        template: Handlebars.compile('<button type="button" id="btn-note-preview-add-addendum" title="Press enter to add an addendum" class="btn btn-primary">Add Addendum</button> <button type="button" title="Press enter to close" class="btn btn-default" data-dismiss="modal">Close</button> '),
        tagName: 'span',
        toggleAddAddendumButton: function () {
            var existingAddendum = _.find(this.model.get('addenda'), {
                'authorUid': this.authorUid,
                'status': 'UNSIGNED'
            });

            if (existingAddendum) {
                this.$('#btn-note-preview-add-addendum').attr('disabled', 'disabled');
            } else {
                this.$('#btn-note-preview-add-addendum').removeAttr('disabled');
            }
        }
    });

    return footerView;
});