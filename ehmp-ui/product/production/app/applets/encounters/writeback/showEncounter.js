define([
    "handlebars",
    "underscore",
    "backbone",
    "marionette",
    'app/applets/encounters/writeback/modelUtil'
], function(Handlebars, _, Backbone, Marionette, formUtil) {
    'use strict';

    var ENCOUNTER_FORM_ERROR_MSG = '<p><strong>There was an error retrieving the encounter form. Try again in a couple of minutes.</strong></p>';
    var ENCOUNTER_FORM_ERROR_TITLE = 'Encounter Form Error';
    var ENCOUNTER_FORM_ERROR_ICON = 'fa fa-exclamation-triangle font-size-18 color-red';
    var OTHER_DIAGNOSES = 'OTHER DIAGNOSES';
    var OTHER_PROCEDURES = 'OTHER PROCEDURES';

    var fetchEncounterData = {
        EncounterLoader: Backbone.Marionette.Object.extend({
            _PromiseModel: Backbone.Model.extend({
                initialize: function() {
                    this.get('fetch').done(_.bind(this._onResolve, this)).fail(_.bind(this._onReject, this));
                    this.get('complete').done(_.bind(this._onResolve, this)).fail(_.bind(this._onReject, this));
                },
                _onResolve: function() {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(this.get('resolveEventString'));
                    this.trigger.apply(this, args);
                },
                _onReject: function() {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(this.get('rejectEventString'));
                    this.trigger.apply(this, args);
                },
                resolve: function(attribute, options) {
                    if (this.get(attribute) && this.get(attribute).state() === 'pending') {
                        this.get(attribute).resolve(options);
                    }
                },
                idAttribute: 'id',
                defaults: function() {
                    return {
                        fetch: new $.Deferred(),
                        complete: new $.Deferred(),
                        id: null,
                        resolveEventString: 'promise:resolved',
                        rejectEventString: 'promise:rejected'
                    };
                }
            }),
            _PromiseCollection: Backbone.Collection.extend({
                initialize: function() {
                    this.allResolved = new $.Deferred();
                    this.listenTo(this, 'add', function(model, collection, options) {
                        this.listenTo(model, model.get('resolveEventString'), function() {
                            if (this._allPromisesResolved()) {
                                this.allResolved.resolve.apply(this, arguments);
                            }
                        });
                        this.listenTo(model, model.get('rejectEventString'), function() {
                            this.allResolved.reject.apply(this, arguments);
                        });
                    });
                },
                _allPromisesResolved: function(changedModel, promise) {
                    return _.all(this.models, function(model) {
                        return model.get('fetch').state() === 'resolved' && model.get('complete').state() === 'resolved';
                    }, this);
                },
                rejectPending: function(options) {
                    this.each(function(model) {
                        if (model.get('fetch').state() === 'pending') {
                            model.get('fetch').reject(options);
                        }
                        if (model.get('complete').state() === 'pending') {
                            model.get('complete').reject(options);
                        }
                    });
                }
            }),
            initialize: function() {
                this.model = this.getOption('model');
                this.workflow = this.getOption('workflow');
                this.visit = this.getOption('visit');
                this.promiseCollection = new this._PromiseCollection();
                this.fetchData();
                this.setupListeners();
            },
            fetchData: function() {
                this.promiseCollection.add(new this._PromiseModel({
                    fetch: formUtil.retrieveEncounterData(this.model, this.workflow),
                    id: 'encounters-data'
                }));
                this.promiseCollection.add(new this._PromiseModel({ id: 'related-disabilities' }));
                this.promiseCollection.add(new this._PromiseModel({
                    fetch: this.model.get('DiagnosisCollection').fetch({
                        dateTime: this.visit.dateTime,
                        locationUid: this.visit.locationUid
                    }),
                    id: 'diagnoses'
                }));
                this.promiseCollection.add(new this._PromiseModel({
                    fetch: this.model.get('providerList').fetch({
                        dateTime: this.visit.dateTime
                    }),
                    id: 'providers'
                }));
                this.promiseCollection.add(new this._PromiseModel({
                    fetch: this.model.get('visitCollection').fetch({
                        dateTime: this.visit.dateTime,
                        locationUid: this.visit.locationUid
                    }),
                    id: 'visits'
                }));
                this.promiseCollection.add(new this._PromiseModel({
                    fetch: this.model.get('ProcedureCollection').fetch({
                        dateTime: this.visit.dateTime,
                        locationUid: this.visit.locationUid
                    }),
                    id: 'procedures'
                }));
            },
            setupListeners: function() {
                // listener for encounter data fetch
                this.promiseCollection.get('encounters-data').get('fetch').done(_.bind(function() {
                    ADK.Messaging.getChannel('encountersWritebackTray').trigger('encounter:fetch');
                    var result = this.model.get('encounterResults');
                    this.promiseCollection.get('encounters-data').resolve('complete', { result: result });
                }, this));
                this.listenToOnce(this.model.get('DiagnosisCollection'), 'read:success', function(collection, response) {
                    collection.add({
                        categoryName: OTHER_DIAGNOSES
                    });
                    //Clear Local storage collection for other Diagnosis
                    if (!_.isUndefined(collection.get(OTHER_DIAGNOSES).get('values'))) {
                        this.clearCollections(collection.get(OTHER_DIAGNOSES).get('values'));
                    }
                    this.promiseCollection.get('encounters-data').get('complete').done(_.bind(function(options) {
                        formUtil.parseEncounterDataDiagnosis(options.result, this.model);
                        if (this.model.get('DiagnosisCollection').length > 0) {
                            this.model.set('diagnosesSection', this.model.get('DiagnosisCollection').models[0].get('categoryName'));
                        }
                        this.promiseCollection.get('diagnoses').resolve('complete');
                    }, this));
                });
                this.listenToOnce(this.model.get('providerList'), 'read:success', function(collection, response) {
                    this.promiseCollection.get('encounters-data').get('complete').done(_.bind(function(options) {
                        formUtil.parseEncounterDataProvider(options.result, this.model);
                        this.promiseCollection.get('providers').resolve('complete');
                    }, this));
                });
                this.listenToOnce(this.model.get('visitCollection'), 'read:success', function(collection, response) {
                    this.promiseCollection.get('encounters-data').get('complete').done(_.bind(function(options) {
                        var relatedParsingPromise = new $.Deferred();
                        var proceduresParsingPromise = new $.Deferred();
                        $.when(relatedParsingPromise, proceduresParsingPromise).done(_.bind(function() {
                            if (this.model.get('visitCollection').length > 0 && _.isEmpty(this.model.get('visitTypeSelection'))) {
                                this.model.set('visitTypeSelection', this.model.get('visitCollection').models[0].get('categoryName'));
                            }
                            // not sure if it can go in the read:success for ProcedureCollection or not
                            // depends on the parseEncounterDataVisitAndProcedures function
                            if (this.model.get('ProcedureCollection').length > 0) {
                                this.model.set('procedureSection', this.model.get('ProcedureCollection').models[0].get('categoryName'));
                            }
                            this.promiseCollection.get('visits').resolve('complete');
                        }, this));
                        this.promiseCollection.get('procedures').get('complete').done(_.bind(function() {
                            formUtil.parseEncounterDataVisitAndProcedures(options.result, this.model);
                            proceduresParsingPromise.resolve();
                        }, this));
                        this.promiseCollection.get('related-disabilities').get('complete').done(_.bind(function() {
                            formUtil.parseEncounterDataVisitRelated(options.result, this.model);
                            relatedParsingPromise.resolve();
                        }, this));
                    }, this));
                });
                this.listenToOnce(this.model.get('ProcedureCollection'), 'read:success', function(collection, response) {
                    collection.add({
                        categoryName: OTHER_PROCEDURES
                    });
                    //Clear Local storage collection  for other procedures
                    if (!_.isUndefined(collection.get(OTHER_PROCEDURES).get('cptCodes'))) {
                        this.clearCollections(collection.get(OTHER_PROCEDURES).get('cptCodes'));
                    }
                    this.promiseCollection.get('procedures').resolve('complete');
                });
                $.when(formUtil.retrieveRatedDisabilties(this.model)).done(_.bind(function() {
                    this.promiseCollection.get('related-disabilities').resolve('fetch');
                    this.promiseCollection.get('related-disabilities').resolve('complete');
                }, this));
                // the encounter billing form will only get loaded once all prefetching is complete
                // any fetch failures will cause the error modal to display
                this.promiseCollection.allResolved.done(function() {
                    ADK.Messaging.getChannel('encountersWritebackTray').trigger('encounter:done');
                }).fail(_.bind(function() {
                    // the arguments are not assigned because they can be rejected due to:
                    // - fetch error (args: collection, response, errorMessage)
                    // - interruption: new encounter location, should not display modal (args: none)
                    var fetchFailed = arguments.length > 1 && arguments[0] instanceof Backbone.Collection && _.isObject(arguments[1]);
                    if (fetchFailed) {
                        var response = arguments[1];
                        formUtil.encounterTrayErrorHandler(response, this.workflow);
                        console.error('Error retrieving encounter form:', response);
                        this.rejectAllPendingPromises();
                    }
                }, this)).always(_.bind(function() {
                    this.destroy();
                }, this));
            },
            clearCollections: function(collection) {
                var modelToRemove;
                while (collection.first()) {
                    modelToRemove = collection.first();
                    modelToRemove.trigger('destroy', modelToRemove, modelToRemove.collection);
                }
            },
            rejectAllPendingPromises: function(options) {
                this.promiseCollection.rejectPending(options);
            },
            onDestroy: function() {
                fetchEncounterData.existingLoaderInProgress = null;
            }
        }),
        existingLoaderInProgress: null,
        handleEncounterWorkflow: function(workflow, formModel, visit) {
            if (!_.isNull(fetchEncounterData.existingLoaderInProgress)) {
                fetchEncounterData.existingLoaderInProgress.rejectAllPendingPromises();
                fetchEncounterData.existingLoaderInProgress = null;
            }
            var encounterLoader = new fetchEncounterData.EncounterLoader({ model: formModel, workflow: workflow, visit: visit });
            fetchEncounterData.existingLoaderInProgress = encounterLoader;
        }
    };
    return fetchEncounterData;
});
