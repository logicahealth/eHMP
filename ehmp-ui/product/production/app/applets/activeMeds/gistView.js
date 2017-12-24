/* global ADK */
define([
    'backbone',
    'marionette',
    'underscore'
], function (Backbone, Marionette, _) {
    'use strict';

    var GistView = ADK.AppletViews.InterventionsGistView.extend({
        appletOptions: {
            gistHeaders: {
                name: {
                    title: 'Medication',
                    sortable: true,
                    sortType: 'alphabetical',
                    key: 'normalizedName'
                },
                description: {
                    title: '',
                    sortable: false
                },
                count: {
                    title: 'Refills',
                    sortable: true,
                    sortType: 'numeric',
                    key: 'totalFillsRemaining'
                },
                fillableStatus: {
                    title: 'Status/Fillable',
                    sortable: true,
                    sortType: 'alphabetical',
                    key: 'fillableStatus'
                }
            },
            gistModel: [{
                id: 'id',
                field: 'groupName'
            }, {
                id: 'name',
                field: 'normalizedName'
            }, {
                id: 'description',
                field: 'sig'
            }, {
                id: 'age',
                field: 'age'
            }, {
                id: 'ageReadText',
                field: 'ageReadText'
            }, {
                id: 'count',
                field: 'totalFillsRemaining'
            }, {
                id: 'fillableStatus',
                field: 'fillableStatus'
            }],
            filterFields: ['normalizedName', 'age', 'totalFillsRemaining', 'sig', 'drugClassName', 'fillableStatus'],
            enableTileSorting: true,
            tileOptions: {
                quickLooks: {
                    enabled: true
                },
                quickMenu: {
                    enabled: true,
                    buttons: [{
                        type: 'infobutton',
                        shouldShow: function() {
                            return this.getOption('showInfoButton') !== false;
                        }
                    }, {
                        type: 'detailsviewbutton'
                    }, {
                        type: 'tilesortbutton',
                        shouldShow: function() {
                            return !ADK.Messaging.request('get:current:screen').config.predefined;
                        }
                    }]
                },
                primaryAction: {
                    enabled: true,
                    onClick: function(event, med) {
                        ADK.Messaging.getChannel('activeMeds').trigger('detailView', {
                            model: med,
                            collection: med.collection,
                            triggerElement: this.$('.dropdown--quickmenu > button')
                        });
                    }
                }
            }
        },

        initialize: function () {
            _.set(this.appletOptions, 'onClickRow', this._onClickRow);
            _.set(this.appletOptions, 'serializeData', this._serializeData);
            _.set(this.appletOptions, 'refresh', this._refresh);
            _.set(this.appletOptions, 'showInfoButton', true);

            this._resource = new ADK.UIResources.Fetch.ActiveMeds.ResourceCollection();
            this.collection = this.appletOptions.collection = new ADK.UIResources.Fetch.ActiveMeds.NonPageable([], {collection: this._resource});

            this.listenTo(this._resource, 'fetch:success', this._updateCollection);
            this.listenTo(this.appletOptions.collection, 'customfilter', this.onCustomFilter);
            this.listenTo(this.appletOptions.collection, 'clear_customfilter', this.onClearCustomFilter);
            this._resource.fetchCollection();
            GistView.__super__.initialize.apply(this, arguments);
        },

        _refresh: function refresh(view) {
            view._resource.reset();
            view._resource.comparator = null;
            ADK.ResourceService.clearCache(view._resource.url);
            view._resource.fetchCollection();
        },

        _updateCollection: function updateCollection(collection, response) {
            this.collection.reset(collection.models);
            this.collection.originalModels = collection.originalModels;
            this.setAppletView();
            this.collection.trigger('fetch:success', collection, response);
        },

        _onClickRow: function onClickRow(model) {
            var uid = model.get('uid');
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            ADK.Messaging.getChannel('activeMeds').trigger('detailView', {
                uid: uid,
                patient: {
                    icn: currentPatient.attributes.icn,
                    pid: currentPatient.attributes.pid
                }
            });
        },

        _serializeData: function serializeData() {
            var model = this.model;
            var medsData = model.toJSON();

            medsData.fillableDays = model.getFillableData(medsData.fillableStatus);
            medsData.fillableStatus = model.getFullFillableStatus(medsData.fillableDays);
            medsData.totalFillsRemaining = model.getFillsRemaining();

            _.each(this.appletOptions.gistModel, function (object) {
                medsData[object.id] = medsData[object.field];
            });

            return medsData;
        },

        onCustomFilter: function(search) {
            var filters = this.appletOptions.filterFields;
            this.appletOptions.collection.customFilter(search, filters);
        },

        onClearCustomFilter: function(search) {
            var filters = this.appletOptions.filterFields;
            this.appletOptions.collection.clearFilter(search, filters);
        }

    });

    return GistView;
})
;