define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/notes/writeback/formUtil',
    'app/applets/documents/docUtils'
], function (Backbone, Marionette, _, NotesFormUtil, DocUtils) {
    'use strict';

    var footerView = Backbone.Marionette.ItemView.extend({
        _pagingModelEvents: {
            'change': function(model, options) {
                if (_.has(model.changed, 'groupIndex') || _.has(model.changed, 'modelIndex')) {
                    this.model = model.get('currentModel');
                    this.render();
                }
            }
        },
        initialize: function() {
            this.pagingModel = this.getOption('pagingModel');
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
            this.bindEntityEvents(this.pagingModel, this._pagingModelEvents);
        },
        onRender: function() {
            this.toggleAddAddendumButton();
        },
        template: Handlebars.compile('{{#if shouldShowAdd}}<button type="button" id="btn-doc-add-addendum" class="btn btn-sm btn-primary">Add Addendum</button>{{/if}} <button type="button" class="btn btn-default" data-dismiss="modal">Close</button> '),
        templateHelpers: function() {
            return {
                shouldShowAdd: DocUtils.canAddAddendum(this.model)
            };
        },
        ui: {
            addAddendumButton: '#btn-doc-add-addendum'
        },
        events: {
            'click @ui.addAddendumButton': function() {
                var addendumFormOptions = {
                    model: this.model,
                    showVisit: false,
                    isEdit: false,
                    openTrayOnDestroy: false
                };
                NotesFormUtil.launchAddendumForm(addendumFormOptions);
                ADK.UI.Modal.hide();
            },
        },
        tagName: 'span',
        hasUnsignedAddendum: function (model) {
            var existingAddendum = _.find(model.get('addenda'), {
                'authorUid': this.authorUid,
                'status': 'UNSIGNED'
            });
            var authorUid = this.authorUid;
            var existingCprsAddendum = _.filter(model.get('addendaText'),function(item) {
                return item.authorUid === authorUid && item.status.toLowerCase() === 'unsigned';
            });
            return existingAddendum || existingCprsAddendum.length > 0;
        },
        toggleAddAddendumButton: function () {
            if (this.hasUnsignedAddendum(this.model)) {
                this.ui.addAddendumButton.attr('disabled', 'disabled');
            } else {
                this.ui.addAddendumButton.removeAttr('disabled');
            }
        },
        onDestroy: function() {
            this.unbindEntityEvents(this.pagingModel, this._pagingModelEvents);
        }
    });

    return footerView;
});