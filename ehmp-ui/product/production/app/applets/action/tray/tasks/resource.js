define([
    'moment'
], function(moment) {
    'use strict';

    // ============================== Constants ===============================
    var FETCH_ATTRIBUTES_MAP = {
        TASKID: 'taskId',
        TASKNAME: 'taskName',
        DESCRIPTION: 'description',
        PRIORITY: 'priority',
        ASSIGNEDTO: 'assignedTo',
        PATIENTICN: 'patientId',
        PATIENTNAME: 'patientName',
        DUE: 'dueDate',
        PASTDUE: 'pastDueDate',
        ACTIVITYDOMAIN: 'activityDomain',
        ACTIVITYNAME: 'activityName',
        NAVIGATION: 'navigation',
        DEFINITIONID: 'taskDefinitionId',
        CLINICALOBJECTUID: 'clinicalObjectUid',
        INSTANCENAME: 'instanceName',
        PERMISSION: 'permission',
        BEFOREEARLIESTDATE: 'beforeEarliestDate',
        hasPermissions: 'hasPermissions'
    };
    var FIND_ATTRIBUTES_MAP = {
        id: 'taskId',
        name: 'taskName',
        description: 'description',
        priority: 'priority',
        variables: 'variables',
        navigation: 'navigation'
    };

    var FETCH_CONTEXT = 'patient';
    var FETCH_SUBCONTEXT = 'teamroles';
    var FETCH_STATUS = 'Created,Ready,Reserved,InProgress';

    var DEFAULT_OPTIONS = {
        pageable: false,
        cache: false,
    };

    var DEFAULT_ATTRIBUTES = {
        taskName: 'Unknown',
        description: 'Unknown',
        dueDate: '',
        pastDueDate: '',
        priority: -1
    };

    var PRIORITY_MAP = ['High', 'High', 'High', 'High', 'Medium', 'Medium', 'Medium', 'Low', 'Low', 'Low', 'Low'];

    // ============================== Utilities ===============================
    var onSuccess = function(type, collection) {
        this.reset(collection.models);
        this.trigger(type + ':success', collection);
    };

    var onError = function(type) {
        this.reset();
        this.trigger(type + ':error');
    };

    var mapAttributes = function(resp, attributeMap) {
        var attributes = _(resp)
            .pick(_.keys(attributeMap))
            .mapKeys(function(value, key) {
                return attributeMap[key];
            })
            .value();

        return _.defaults(attributes, DEFAULT_ATTRIBUTES);
    };

    // =========================== FETCH Functions ============================
    var parseFetch = function(resp) {
        var today = moment.utc();
        var attributes = mapAttributes(resp, FETCH_ATTRIBUTES_MAP);

        _.extend(attributes, {
            isDue: today.isSameOrAfter(attributes.dueDate, 'day') && (today.isSameOrBefore(attributes.pastDueDate, 'day') || !moment(attributes.pastDueDate).isValid()),
            isPastDue: today.isAfter(attributes.pastDueDate, 'day'),
            priorityText: PRIORITY_MAP[attributes.priority] || 'Unknown',
            domain: 'ehmp-task'
        });

        if (!_.isObject(attributes.navigation)) {
            var navigation = _.attempt(_.partial(JSON.parse, attributes.navigation));
            attributes.navigation = (!_.isError(navigation) ? navigation : {});
        }

        return attributes;
    };

    // ============================ FIND Functions ============================
    var parseFind = function(resp) {
        var attributes = mapAttributes(resp, FIND_ATTRIBUTES_MAP);

        // Extract the 'variables' array values back into the attributes object
        _.each(attributes.variables, function(val) {
            if (!_.isEmpty(val.name)) {
                attributes[val.name] = val.value;
            }
        });

        return attributes;
    };

    // ========================== TaskResource Class ==========================
    var TaskResource = Backbone.Collection.extend({

        initialize: function() {
            var patient = ADK.PatientRecordService.getCurrentPatient();
            if (!_.isUndefined(patient)) {
                this.patientId = patient.getIdentifier();
            }
        },
        fetch: function() {
            if (_.isUndefined(this.patientId)) {
                return (onError.call(this, 'fetch'));
            }

            var options = _.extend({}, DEFAULT_OPTIONS, {
                resourceTitle: 'tasks-tasks',
                fetchType: 'POST',
                onSuccess: _.bind(onSuccess, this, 'fetch'),
                onError: _.bind(onError, this, 'fetch'),
                viewModel: {
                    parse: parseFetch
                },
                criteria: {
                    pid: this.patientId,
                    context: FETCH_CONTEXT,
                    subContext: FETCH_SUBCONTEXT,
                    status: FETCH_STATUS
                }
            });
            ADK.ResourceService.fetchCollection(options);
        },
        find: function(taskId) {
            if (_.isUndefined(this.patientId)) {
                return (onError.call(this, 'find'));
            }

            var options = _.extend({}, DEFAULT_OPTIONS, {
                resourceTitle: 'tasks-gettask',
                fetchType: 'GET',
                onSuccess: _.bind(onSuccess, this, 'find'),
                onError: _.bind(onError, this, 'find'),
                viewModel: {
                    parse: parseFind
                },
                criteria: {
                    taskid: taskId
                }
            });
            ADK.ResourceService.fetchCollection(options);
        }
    });

    return TaskResource;
});