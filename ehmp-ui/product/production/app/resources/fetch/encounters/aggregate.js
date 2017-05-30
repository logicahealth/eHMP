define([
    'app/resources/fetch/encounters/appointments',
    'moment',
    'underscore',
    'backbone'
], function (Appointments, moment, _, Backbone) {
    'use strict';

    var ENCOUNTER_MAP = {
        visit: {
            title: 'Visits',
            order: 0,
            sort_direction: 'past',
            applet_id: 'enc_detail_v_a'
        },
        appointment: {
            title: 'Appointments',
            order: 1,
            sort_direction: 'future',
            specialChart: true,
            applet_id: 'enc_detail_v_a'
        },
        admission: {
            title: 'Admissions',
            order: 2,
            sort_direction: 'past',
            applet_id: 'enc_detail_v_a'
        },
        procedure: {
            title: 'Procedures',
            order: 3,
            sort_direction: 'past',
            applet_id: 'enc_detail_p'
        }
    };

    var AggregateModel = ADK.Resources.Aggregate.Model.extend({
        defaults: function () {
            var ChildCollection = this.Collection.extend({
                comparator: 'dateTime'
            });
            var SubKindCollection = ADK.Resources.Aggregate.Collection.extend({
                groupId: 'custom_filter_field',
                comparator: 'dateTime',
                Model: AggregateModel.extend({
                    defaults: {
                        appletConfig: {},
                        count: 0,
                        order: 0,
                        futureTime: null, //bool
                        kind: null,
                        timeSinceLast: null
                    }
                }),
                initialize: function () {
                    this.setFullCollection(new Backbone.Collection());
                }
            });

            return {
                appletConfig: {},
                count: 0,
                order: 0,
                futureTime: null, //bool
                kind: null,
                timeSinceLast: null,
                collection: new ChildCollection(),
                subKindCollection: new SubKindCollection()
            };
        },
        update: function (model, previousModels, options) {
            var collection = this.getCollection();

            var mostRecentDateTimeModel = collection.max('dateTime');
            var kind = this.get('kind') || model.get('kind') || 'UNKNOWN';
            var order = ENCOUNTER_MAP[kind.toLowerCase()];
            var timeSinceLast;
            var futureTime;
            var recent = this.get('collection').slice(0, 5);

            if (order && order.sort_direction === "future") {
                var nearestFutureDateModel = this.getNearestFutureDateModel(collection);
                var timeSinceModel = nearestFutureDateModel || mostRecentDateTimeModel;
                timeSinceLast = ADK.utils.getTimeSince(timeSinceModel.get('dateTime')).timeSince;
                futureTime = !!nearestFutureDateModel;
            } else {
                timeSinceLast = ADK.utils.getTimeSince(mostRecentDateTimeModel.get('dateTime')).timeSince;
                futureTime = false;
            }

            var filterField = model.get('custom_filter_field');
            var result = {
                custom_filter_field: filterField,
                groupName: filterField,
                kind: kind,
                timeSinceLast: timeSinceLast,
                futureTime: futureTime,
                applet_id: order.applet_id,
                order: order.order || 0,
                count: collection.length,
                recent: recent,
                sort_time: recent[0].get('dateTime')
            };

            var subCollection = this.get('subKindCollection');
            if (subCollection) {
                subCollection.collection.add(model);
                result.custom_filter_field = model.get('custom_filter_field');
            }

            this.set(result);
        },
        getNearestFutureDateModel: function (collection) {
            var min = Infinity;
            var finalModel;
            collection.each(function (model) {
                var dateTime = model.get('dateTime');
                if (moment(dateTime).isAfter() && min > dateTime) {
                    min = dateTime;
                    finalModel = finalModel;
                }
            });
            return (finalModel instanceof Backbone.Model) ? finalModel : false;
        }
    });

    var Aggregate = ADK.Resources.Aggregate.Collection.extend({
        initialize: function () {
            this.setFullCollection(new Appointments());
        },
        groupId: 'kind',
        comparator: 'order',
        Model: AggregateModel,
        fetchCollection: function fetchCollection(timeRange) {
            this.collection.fetchCollection(timeRange);
            this.url = this.collection.url;
        }
    });

    return Aggregate;
});