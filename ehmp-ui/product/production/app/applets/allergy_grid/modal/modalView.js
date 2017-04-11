define([
	'backbone',
	'marionette',
	'underscore',
	'app/applets/allergy_grid/util',
	'hbs!app/applets/allergy_grid/modal/modalTemplate',
	'app/applets/allergy_grid/modal/modalHeaderView',
    'hbs!app/applets/allergy_grid/details/detailsFooterTemplate',
    'app/applets/allergy_grid/writeback/enteredInErrorView',
], function(Backbone, Marionette, _, Util, modalTemplate, modalHeader, detailsFooterTemplate, EnteredInErrorView) {
	'use strict';

	var modals = [],
		dataCollection;

	var ModalView = Backbone.Marionette.ItemView.extend({
		template: modalTemplate,
		initialize: function(options) {
			this.model = options.model;
			this.collection = options.collection;
			dataCollection = options.collection;
			this.getModals();
		},
		getNextModal: function(id) {
			var next = _.indexOf(modals, this.model) + 1;
			if (next >= modals.length) {

				this.getModals();
				next = 0;
			}
			var model = modals[next];
			this.setNextPrevModal(model, id);
		},
		getPrevModal: function(id) {
			var next = _.indexOf(modals, this.model) - 1;
			if (next < 0) {

				this.getModals();
				next = modals.length - 1;
			}
			var model = modals[next];

			this.setNextPrevModal(model, id);
		},
		getModals: function() {
			modals = dataCollection.models;
		},
		setNextPrevModal: function(model, id) {

			if (this.showNavHeader) {
				model.attributes.navHeader = true;
			}

			var view = new ModalView({
				model: model,
				collection: dataCollection
			});

			var siteCode = ADK.UserService.getUserSession().get('site'),
				pidSiteCode = model.get('pid') ? model.get('pid').split(';')[0] : '';

			var modalOptions;

			modalOptions = {
				'title': Util.getModalTitle(model),
				'size': 'normal',
				'headerView': modalHeader.extend({
					model: model,
					theView: view
				}),
                footerView: Backbone.Marionette.ItemView.extend({
                    template: detailsFooterTemplate,
                    onRender: function() {},
                    events: {
                        'click #error': 'enteredInError'
                    },
                    enteredInError: function(event) {
                        ADK.UI.Modal.hide();
                        EnteredInErrorView.createAndShowEieView(model);
                    },
                    templateHelpers: function() {
                        if (ADK.UserService.hasPermission('eie-allergy') && pidSiteCode === siteCode) {
                            return {
                                data: true
                            };
                        } else {
                            return {
                                data: false
                            };
                        }
                    }
                })
			};

			var modal = new ADK.UI.Modal({
                view: view,
                options: modalOptions
            });
            modal.show();
            modal.$el.closest('.modal').find('#' + id).focus();
		}
	});
	return ModalView;
});
