define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/ccd_grid/modal/modalFullHtmlTemplate',
    'app/applets/ccd_grid/modal/modalHeaderView',
    'app/applets/ccd_grid/util'
], function(Backbone, Marionette, _, modalFullHtmlTemplate, ModalHeader, Util) {
    'use strict';

    function writeCcdIframe(fullHtml) {
        var ccdContent = $('.ccd-content');
        if (ccdContent.size() > 0) {
            var iframeCcd = ccdContent[0].contentWindow.document;
            var content = fullHtml;
            iframeCcd.open();
            iframeCcd.write(content);
            iframeCcd.close();
        }
    }

    function showCcdContent(modalModel) {
        var fullHtml = modalModel.get('fullHtml') ? modalModel.get('fullHtml') : '';

        var $iframe = $('iframe.dodContent');
        if ($iframe.size() === 0) {
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {

                        $iframe = $(mutation.addedNodes[i]).find('iframe.ccd-content');
                        if ($iframe.size() > 0) {
                            observer.disconnect();
                            writeCcdIframe(fullHtml);
                        }
                    }
                });
            });
            observer.observe($('#modal-region')[0], {
                childList: true,
                attributes: false,
                characterData: true,
                subtree: true
            });
        }
    }

    var ModalView = Backbone.Marionette.ItemView.extend({
        getTemplate: function() {
                return modalFullHtmlTemplate;
        },
        initialize: function(options) {
            this.getModelUids();

            if (options.initCount === 0) {
                options.initCount++;
                var modelUid = this.model.get('uid');
                this.getModal(modelUid);
            }
            if (!_.isUndefined(this.model)) {
                var currentPatient = ADK.PatientRecordService.getCurrentPatient();
                this.model.set({
                    'fullName': currentPatient.get('fullName'),
                    'birthDate': currentPatient.get('birthDate'),
                    'genderName': currentPatient.get('genderName'),
                    'ssn': currentPatient.get('ssn')
                });
            }
        },
        serializeModel: function() {
            if (!this.model) {
                return {};
            }
            var modelJSON = _.cloneDeep(this.model.attributes);
            modelJSON = Util.serializeObject(modelJSON);
            return modelJSON;
        },
        showModal: function(modalModel) {
            var view = new ModalView({
                model: modalModel,
                collection: this.collection
            });

            var modalOptions = {
                'size': 'xlarge',
                'headerView': ModalHeader.extend({
                    model: modalModel,
                    theView: view
                })
            };

            if (modalModel.get('fullHtml')) {
                showCcdContent.call(this, modalModel);
            }

            var modal = new ADK.UI.Modal({
                view: view,
                options: modalOptions
            });
            modal.show();
            modal.$el.closest('.modal').focus();
        },
        showErrorModal: function(model, modelUid) {
            var modalModel = this.collection.find({ 'uid': modelUid });

            var view = new ModalView({
                model: modalModel,
                collection: this.collection
            });

            var errorView = ADK.Views.Error.create({
                model: modalModel
            });

            var modalOptions = {
                'size': 'xlarge',
                'headerView': ModalHeader.extend({
                    model: modalModel,
                    theView: view
                })
            };

            var modal = new ADK.UI.Modal({
                view: errorView,
                options: modalOptions
            });

            modal.show();
        },
        onAttach: function() {
            this.checkIfModalIsEnd();
        },
        checkIfModalIsEnd: function() {
            var next = _.indexOf(this.modelUids, this.model.get('uid')) + 1;
            if (next >= this.modelUids.length) {
                this.$el.closest('.modal').find('#ccdNext').attr('disabled', true);
            }

            next = _.indexOf(this.modelUids, this.model.get('uid')) - 1;
            if (next < 0) {
                this.$el.closest('.modal').find('#ccdPrevious').attr('disabled', true);
            }
        },
        getModal: function(modelUid) {
            var fetchOptionsConfig = {
                criteria: {
                    callType: 'vler_modal',
                    vler_uid: modelUid
                }
            };

            var modalCollection = new ADK.UIResources.Fetch.CommunityHealthSummaries.Collection();
            
            this.listenToOnce(modalCollection, 'fetch:success', function() {
                var modalModel = _.find(modalCollection.models, function(model) {
                    return model.get('uid') === modelUid;
                });
                ADK.UI.Modal.hide();
                this.showModal(modalModel);
            });

            this.listenToOnce(modalCollection, 'fetch:error', function() {
                this.showErrorModal(this.model, modelUid);
            });

            modalCollection.fetchCollection(fetchOptionsConfig);
        },
        getNextModal: function() {
            var next = _.indexOf(this.modelUids, this.model.get('uid')) + 1;
            var modelUid = this.modelUids[next];
            this.getModal(modelUid);
        },
        getPrevModal: function() {
            var prev = _.indexOf(this.modelUids, this.model.get('uid')) - 1;
            var modelUid = this.modelUids[prev];
            this.getModal(modelUid);
        },
        getModelUids: function() {
            this.modelUids = [];
            this.collection.each(_.bind(function(m) {

                if (m.get('vlerdocument')) {
                    var outterIndex = this.collection.indexOf(m);
                    _.each(m.get('vlerdocument').models, function(m2) {
                        m2.set({
                            'inAPanel': true,
                            'parentIndex': outterIndex,
                            'parentModel': m
                        });
                        this.modelUids.push(m2.get('uid'));

                    }, this);
                } else {
                    this.modelUids.push(m.get('uid'));
                }
            }, this));
        }
    });

    return ModalView;
});
