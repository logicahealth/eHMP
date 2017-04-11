define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/ccd_grid/modal/modalSectionsTemplate',
    'hbs!app/applets/ccd_grid/modal/modalFullHtmlTemplate',
    'app/applets/ccd_grid/modal/modalHeaderView'
], function(Backbone, Marionette, _, modalSectionsTemplate, modalFullHtmlTemplate, ModalHeader) {
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

    var modelUids = [],
        dataCollection;

    var viewParseModel = {
        parse: function(response) {
            if (response.name) {
                response.localTitle = response.name;
            }
            if (response.creationTime) {
                response.referenceDateTime = response.creationTime;
            } else if (response.dateTime) {
                response.referenceDateTime = response.dateTime;
            }
            response.referenceDateDisplay = ADK.utils.formatDate(response.referenceDateTime);
            if (response.referenceDateDisplay === '') {
                response.referenceDateDisplay = 'N/A';
            }

            response.referenceDateTimeDisplay = ADK.utils.formatDate(response.referenceDateTime, 'MM/DD/YYYY - HH:mm');
            if (response.referenceDateTimeDisplay === '') {
                response.referenceDateTimeDisplay = 'N/A';
            }

            if (response.authorList) {
                if (response.authorList.length > 0) {
                    if (response.authorList[0].institution) {
                        response.authorDisplayName = response.authorList[0].institution;
                    }
                } else {
                    response.authorDisplayName = "N/A";
                }
            }
            response.facilityName = "VLER";
            return response;
        }
    };

    var ModalView = Backbone.Marionette.ItemView.extend({
        getTemplate: function() {
            if(this.model.get('fullHtml')) {
                return modalFullHtmlTemplate;
            } else {
                return modalSectionsTemplate;
            }
        },
        initialize: function(options) {
            var self = this;

            self.model = options.model;

            self.collection = options.collection;
            dataCollection = options.collection;


            self.getModelUids();

            if(options.initCount === 0) {
                options.initCount++;

                var modelUid = self.model.get('uid');

                var modalFetchOptions = {
                    resourceTitle: 'patient-record-vlerdocument',
                    pageable: true,
                    viewModel: viewParseModel,
                    cache: true,
                    criteria: {
                        callType : 'vler_modal',
                        vler_uid : modelUid
                    }
                };

                var modalCollection = ADK.PatientRecordService.createEmptyCollection(modalFetchOptions);
                this.listenToOnce(modalCollection, 'fetch:success', function() {
                    var modalModel = _.find(modalCollection.models, function(model) {
                        return model.get('uid') === modelUid;
                    });

                    this.showModal(modalModel);
                });

                this.listenToOnce(modalCollection, 'fetch:error', function() {
                  this.showErrorModal(this.model, modelUid);
                });

                ADK.PatientRecordService.fetchCollection(modalFetchOptions, modalCollection);
            }

            var sections = {};
            if (!_.isUndefined(this.model)){
              sections = this.model.get('sections');
              _.each(sections, function(section) {
                section.text = section.text.replace(/\s+/g, ' ');
              });

              var currentPatient = ADK.PatientRecordService.getCurrentPatient();

              this.model.set({
                'sections': sections,
                'fullName': currentPatient.get('fullName'),
                'birthDate': currentPatient.get('birthDate'),
                'genderName': currentPatient.get('genderName'),
                'ssn': currentPatient.get('ssn')
              });
            }
        },
        showModal: function(modalModel, clickedBtn) {
            var view = new ModalView({
                model: modalModel,
                collection: dataCollection
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
            if(clickedBtn) modal.$el.closest('.modal').find('#' + clickedBtn).focus();
        },
        showErrorModal: function(model, modelUid, clickedBtn){
          var modalModel = _.find(dataCollection.models, function(model) {
            return model.get('uid') === modelUid;
          });

          var view = new ModalView({
            model: modalModel,
            collection: dataCollection
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

          if(clickedBtn) modal.$el.closest('.modal').find('#' + clickedBtn).focus();
        },
        getNextModal: function(clickedBtn) {
            var next = _.indexOf(modelUids, this.model.get('uid')) + 1;
            if (next >= modelUids.length) {

                this.getModelUids();
                next = 0;
            }
            var modelUid = modelUids[next];

            var modalFetchOptions = {
                resourceTitle: 'patient-record-vlerdocument',
                pageable: true,
                viewModel: viewParseModel,
                cache: true,
                criteria: {
                    callType : 'vler_modal',
                    vler_uid : modelUid
                }
            };
            var modalCollection = ADK.PatientRecordService.createEmptyCollection(modalFetchOptions);
            this.listenToOnce(modalCollection, 'fetch:success', function() {
              var modalModel = _.find(modalCollection.models, function(model) {
                return model.get('uid') === modelUid;
              });

              this.showModal(modalModel, clickedBtn);

            });

            this.listenToOnce(modalCollection, 'fetch:error', function() {
              this.showErrorModal(this.model, modelUid);
            });

            ADK.PatientRecordService.fetchCollection(modalFetchOptions, modalCollection);

        },
        getPrevModal: function(clickedBtn) {
            var prev = _.indexOf(modelUids, this.model.get('uid')) - 1;

            if (prev < 0) {
                this.getModelUids();
                prev = modelUids.length - 1;
            }
            var modelUid = modelUids[prev];

            var modalFetchOptions = {
                resourceTitle: 'patient-record-vlerdocument',
                pageable: true,
                viewModel: viewParseModel,
                cache: true,
                criteria: {
                    callType : 'vler_modal',
                    vler_uid : modelUid
                }
            };

            var modalCollection = ADK.PatientRecordService.createEmptyCollection(modalFetchOptions);
            this.listenToOnce(modalCollection, 'fetch:success', function() {
              var modalModel = _.find(modalCollection.models, function(model) {
                return model.get('uid') === modelUid;
              });

              this.showModal(modalModel, clickedBtn);

            });

            this.listenToOnce(modalCollection, 'fetch:error', function() {
              this.showErrorModal(this.model, modelUid);
            });

            ADK.PatientRecordService.fetchCollection(modalFetchOptions, modalCollection);
        },
        getModelUids: function() {
            modelUids = [];
            _.each(dataCollection.models, function(m, key) {

                if (m.get('vlerdocument')) {
                    var outterIndex = dataCollection.indexOf(m);
                    _.each(m.get('vlerdocument').models, function(m2, key) {
                        m2.set({
                            'inAPanel': true,
                            'parentIndex': outterIndex,
                            'parentModel': m
                        });
                        modelUids.push(m2.get('uid'));

                    });
                } else {
                    modelUids.push(m.get('uid'));
                }

            });
        }
    });

    return ModalView;
});
