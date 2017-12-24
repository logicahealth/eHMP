/* global ADK */
define([
    'backbone',
    'marionette',
    'underscore',
    'moment',
    'hbs!app/applets/problems/list/tooltip',
    'app/resources/fetch/problems/model',
    'app/resources/fetch/problems/collection'
], function(Backbone, Marionette, _, moment, tooltip, Model, Collection) {
    'use strict';

    var booleans = [
        'militarySexualTrauma',
        'persianGulfExposure',
        'radiationExposure',
        'shipboardHazard',
        'headNeckCancer',
        'agentOrangeExposure'
    ];


    /**
     * Primary Row Model, holds all the table information and grouping information.
     */
    var GroupModel = Model.extend({
        defaults: {
            applet_id: 'problems',
            crsDomain: ADK.utils.crsUtil.domain.PROBLEM
        },
        idAttribute: 'groupName',
        parse: function parse(response) {
            var problems = new GroupCollection(response.prob, {parse: true});
            var model = problems.first();
            var item = model.attributes;
            item.instanceId = _.get(response, 'instanceId');
            item.groupName = _.get(response, 'groupName');
            item.prob = problems;
            item.id = model.get('uid').replace(/[:|.]/g, '_');
            item.facNameTruncated = model.get('facilityName').substring(0, 3);
            _.each(booleans, function(val) {
                item[val + 'Bool'] = model.get(val) === 'YES';
            });
            return item;
        },
        initialize: function() {
            this.listenToOnce(this, 'add', this.group);
        },

        /**
         * Creates the grouping information
         */
        group: function group() {
            var problemsGroup = this.get('prob');
            problemsGroup.group(this);
            this.set('tooltip', tooltip(this));
        }
    });


    /**
     * A model for each item in the group, use to extract information needed by the group as a whole.
     */
    var GroupItemModel = Model.extend({
        defaults: {
            groupArray: []
        },

        /**
         * Grouping function, that extracts the dates from the models.
         * @param {Backbone.Model} groupModel The parent model that holds the display data
         * @return {Array} of string dates in YYYYMMDD format
         */
        process: function(groupModel) {
            var fullArray = [];
            if (this.get('encounters')) {
                fullArray.concat(this.processEncounters(groupModel));
            } else {
                fullArray.push(this.processNonEncounter(groupModel));
            }

            groupModel.set('allGroupedEncounters', groupModel.get('allGroupedEncounters').slice(0, 5));

            groupModel.set('graphData', {
                series: this.createGraphSeries()
            });

            return fullArray;
        },

        /**
         * Creates the graphing data.
         * @returns {Array}
         */
        createGraphSeries: function() {
            var max = 0;
            var allEncountersGroupedByDate = this.groupEncounters(this.get('groupArray'));
            return _.map(allEncountersGroupedByDate, function(encounterGroupedByDate) {
                var date = encounterGroupedByDate.date;
                var count = encounterGroupedByDate.count;

                if (max < count) {
                    max = count;
                }
                return [moment(date, 'YYYYMMDD').valueOf(), count];
            });

        },

        /**
         * Groups the encounter dates into a unique set
         * @param {Array} encounter String dates
         * @returns {Array} [{date: String, count: Number}, ..]
         */
        groupEncounters: function(encounter) {
            var encounterDateGroup = _.groupBy(encounter, function(date) {
                return date;
            });

            return _.map(encounterDateGroup, function(dateArray, dateString) {
                return {
                    date: dateString,
                    count: dateArray.length
                };
            });
        },

        /**
         * Finds dates from a non encounter based model
         * @param {Backbone.Model} groupModel The parent model that holds the display data
         * @return {String} date in YYYYMMDD format
         */
        processNonEncounter: function(groupModel) {
            var date = moment(groupModel.get('timeSinceDate'), 'YYYYMMDD');
            this.get('groupArray').push(date.format('YYYYMMDD'));

            groupModel.get('allGroupedEncounters').push({
                dateTime: date.format('MM/DD/YYYY'),
                stopCodeName: this.get('facilityName'),
                problemText: groupModel.get('problemText'),
                acuity: groupModel.get('acuityName')
            });

            return date.format('YYYYMMDD');
        },

        /**
         * Finds the dates from an encounter based model
         * @param {Backbone.Model} groupModel The parent model that holds the display data
         * @return {Array} of strings in YYYYMMDD format
         */
        processEncounters: function(groupModel) {
            return _.map(this.get('encounters'), function(encounter) {
                var date = String(encounter.dateTime).substr(0, 8);
                var slashDate = date.replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3/$1');

                this.get('groupArray').push(date);
                groupModel.get('allGroupedEncounters').push({
                    dateTime: slashDate,
                    stopCodeName: encounter.facilityName,
                    problemText: groupModel.get('problemText'),
                    acuity: groupModel.get('acuityName')
                });

                return date;
            }, this);
        }
    });


    /**
     * A collection of problems that belong to the same group type.
     */
    var GroupCollection = Collection.extend({
        model: GroupItemModel,
        comparator: function comparator(a, b) {
            return new Date(b.dateTime) - new Date(a.dateTime);
        },

        /**
         * Extracts the dates from the collection to make graph data and tooltip information.
         * @param {Backbone.Model} groupModel The model that this collection belongs too.
         */
        group: function(groupModel) {
            var fullArray = [];

            if (!groupModel.get('allGroupedEncounters')) {
                groupModel.set('allGroupedEncounters', []);
            }

            this.each(function(problemModel) {
                fullArray = fullArray.concat(problemModel.process(groupModel));
            }, this);

            var now = moment.utc().startOf('day').valueOf();
            var newDuration = moment.duration({
                'months': 6
            });

            groupModel.get('graphData').oldestDate = moment.utc(_.min(fullArray), 'YYYY').valueOf();
            groupModel.get('graphData').newestDate = moment(now).add(newDuration).valueOf();
        }
    });


    /**
     * Primary Collection for grouping.  Holds the models with the base information.
     */
    return Collection.extend({
        childParse: false,
        model: GroupModel,

        initialize: function(items, options) {
            this.instanceId = _.get(options, 'instanceId');
        },

        comparator: function comparator(a, b) {
            var statusNameA = a.get('statusName') || '';
            var statusNameB = b.get('statusName') || '';
            statusNameA = statusNameA.toLowerCase().trim();
            statusNameB = statusNameB.toLowerCase().trim();
            if (!_.isEqual(statusNameA, statusNameB)) {
                return statusNameA.localeCompare(statusNameB);
            }
            var textA = a.get('groupName') || '';
            var textB = b.get('groupName') || '';
            textA = textA.toLowerCase();
            textB = textB.toLowerCase();
            return textA.localeCompare(textB);
        },

        parse: function(response) {
            var instanceId = this.instanceId;
            var items = _.get(response, 'data.items', response);

            var grouped = _.groupBy(items, function addStandardizedDescription(value) {
                var standardizedDescription = this.getStandardizedDescription(value.codes);
                if (standardizedDescription) {
                    value.standardizedDescription = standardizedDescription;
                }
                return  standardizedDescription || _.get(value, 'problemText');
            }, this);

            return _.map(grouped, function(value, key) {
                return {
                    instanceId: instanceId,
                    prob: value,
                    groupName: key
                };
            });
        },

        /**
         * Gets the name required to create the group.
         * @param {Array} codes
         * @return {null|String}
         */
        getStandardizedDescription: function(codes) {
            var description = null;
            _.eachRight(codes, function(code) {
                if (code.system.indexOf('http://snomed.info/sct') !== -1) {
                    description = code.display;
                    return false;
                }
            });
            return description;
        }
    });
});