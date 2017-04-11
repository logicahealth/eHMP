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
            this.getModelUids();

            if(options.initCount === 0) {
                options.initCount++;

                var modelUid = this.model.get('uid');

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
                    ADK.UI.Modal.hide();
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
        showErrorModal: function(model, modelUid){
          var modalModel = this.collection.find({'uid': modelUid});

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
        getNextModal: function() {
            var next = _.indexOf(this.modelUids, this.model.get('uid')) + 1;
            var modelUid = this.modelUids[next];

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

        },
        getPrevModal: function() {
            var prev = _.indexOf(this.modelUids, this.model.get('uid')) - 1;
            var modelUid = this.modelUids[prev];

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

                    });
                } else {
                    this.modelUids.push(m.get('uid'));
                }

            }, this));
        }
    });

    return ModalView;
});
