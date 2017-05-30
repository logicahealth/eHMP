define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/problems/util',
    'hbs!app/applets/problems/modalView/modalTemplate',
    'app/applets/problems/modalView/modalHeaderView',
    'app/applets/problems/modalView/modalFooterView'

], function(Backbone, Marionette, _, Util, modalTemplate, modalHeader, modalFooter) {
    'use strict';

    var ModalView = Backbone.Marionette.ItemView.extend({
        template: modalTemplate,
        initialize: function(options) {
            this.dataCollection = this.getOption('collection');
        },
        collectionEvents: {
            'fetch:success': function(collection, resp) {
                this.model.set(collection.first().attributes);
            }
        },
        modelEvents: {
            'change': 'render'
        },
        onBeforeShow: function() {
            if(!this.collection) return;
            if (!this.collection.isEmpty()) {
                this.getModals();
            } else {
                _.set(this.collection, 'fetchOptions.resourceTitle', 'patient-record-problem');
                if (_.isUndefined(this.collection.fetchCollection)) {
                    return ADK.PatientRecordService.fetchCollection(this.collection.fetchOptions, this.collection);
                }
                return this.collection.fetchCollection();
            }
        },
        serializeModel: function(model) {
            var data = model.toJSON();
            var code = _.get(data, 'codes[0]') || {};
            var problem = _.get(model, 'probs[0]', new Backbone.Model());

            return _.defaults({
                icdCode: code.code
            }, data);
        },
        templateHelpers: function() {
            return {
                'icd10': function() {
                    var code = _.get(this, 'codes[0]') || {};
                    return _.isPlainObject(code) && !_.isEmpty(code) && code.system === 'urn:oid:2.16.840.1.113883.6.3';
                },
                'icd9': function() {
                    var code = _.get(this, 'codes[0]') || {};
                    return _.isPlainObject(code) && !_.isEmpty(code) && code.system === 'urn:oid:2.16.840.1.113883.6.42';
                }
            };
        },
        events: {
            'click .ccdNext': 'getNextModal',
            'click .ccdPrev': 'getPrevModal'
        },
        onAttach: function() {
            if (!this.collection.isEmpty()) {
                this.checkIfModalIsEnd();
            }
        },
        checkIfModalIsEnd: function() {
            var next = _.indexOf(this.modals, this.model) + 1;
            if (next >= this.modals.length) {
                this.$el.closest('.modal').find('#ccdNext').attr('disabled', true);
            }
            next = _.indexOf(this.modals, this.model) - 1;
            if (next < 0) {
                this.$el.closest('.modal').find('#ccdPrevious').attr('disabled', true);
            }
        },
        getNextModal: function() {
            var next = _.indexOf(this.modals, this.model) + 1;
            var model = this.modals[next];
            this.setNextPrevModal(model);

        },
        getPrevModal: function() {
            var next = _.indexOf(this.modals, this.model) - 1;
            var model = this.modals[next];
            this.setNextPrevModal(model);
        },
        getModals: function() {
            this.modals = this.dataCollection.models;
        },
        setNextPrevModal: function(model) {
            if (this.showNavHeader) {
                model.attributes.navHeader = true;
            }

            var view = new ModalView({
                model: model,
                collection: this.dataCollection
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
                'footerView': modalFooter.extend({
                    model: model
                })
            };


            var modal = new ADK.UI.Modal({
                view: view,
                options: modalOptions
            });
            modal.show();
            modal.$el.closest('.modal').focus();
        }
    });

    return ModalView;
});