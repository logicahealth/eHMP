define([
    'backbone',
    'marionette',
    'underscore',
    'handlebars',
    'app/extensions/ui/form/controls/assign_to/fields',
    'app/extensions/ui/form/controls/assign_to/model'
], function(
    Backbone,
    Marionette,
    _,
    Handlebars,
    Fields,
    AssignToModel
) {
    "use strict";

    var AssignToControl = ADK.UI.Form.Controls.ContainerControl.extend({
        requiredFields: ['name'],
        _picklists: {},
        defaults: {
            items: Fields,
            required: true,
            extraClasses: [],
            options: {
                me: true,
                person: true,
                myTeams: true,
                patientsTeams: true,
                anyTeam: true
            },
            radioListOptions: {
                me: {
                    label: 'Me',
                    value: 'opt_me'
                },
                person: {
                    label: 'Person',
                    value: 'opt_person'
                },
                myTeams: {
                    label: 'My Teams',
                    value: 'opt_myteams'
                },
                patientsTeams: {
                    label: 'Patient\'s Teams',
                    value: 'opt_patientteams'
                },
                anyTeam: {
                    label: 'Any Team',
                    value: 'opt_anyteam'
                }
            }
        },
        behaviors: _.defaults({
            DefaultClasses: {
                behaviorClass: ADK.UI.Form.ControlService.Behaviors.DefaultClasses
            }
        }, ADK.UI.Form.Controls.ContainerControl.prototype.behaviors),
        template: Handlebars.compile(''),
        _setAssignTo: function(radioListOptions) {
            var items = _.get(this, 'defaults.items');
            items = items.call(this, this.field.get('name'), this.field.toJSON());
            _.set(items, '[0].items[0].options', radioListOptions);
            return items;
        },
        _getRadioListOptions: function() {
            return _.values(_.omit(_.get(this, 'defaults.radioListOptions'), _.keys(_.omit(this.field.get('options'), function(value) {
                return !!value;
            }))));
        },
        initialize: function(options) {
            this.field.set('options', _.extend({}, _.get(this, 'defaults.options', {}), (this.field.get('options') || {})), { silent: true });
            var radioListOptions = this._getRadioListOptions();
            this.field.unset('tagName', { silent: true });
            this.field.set('items', this._setAssignTo(radioListOptions), { silent: true });
            ADK.UI.Form.Controls.ContainerControl.prototype.initialize.apply(this, arguments);
            this.listenToFieldName();
            var defaultType = _.get(radioListOptions, '[0].value', '');
            this.model = new AssignToModel(_.extend({ type: defaultType }, this.formModel.get(this.modelName)), { prefix: this.modelName, parse: true });
            this.model.errorModel = new Backbone.Model();
            this.updateFormModel();
            this.bindEntityEvents(this.model, _.result(this, 'assignToModelEvents'));
        },
        onShow: function() {
            this.$el.trigger('register:control:validate:method', _.bind(this.validateModel, this));
        },
        validateModel: function(formErrorMessage, options) {
            var controlError = this.model.validate(this.model.attributes, options || { silent: true });
            var typeError = this.model.errorModel.get(this.model.addPrefix('type'));
            if (typeError) this.formModel.errorModel.set(this.modelName, typeError);
            return formErrorMessage || (!!this.field.get('required') ? controlError : formErrorMessage);
        },
        onBeforeDestroy: function() {
            this.unbindEntityEvents(this.model, _.result(this, 'assignToModelEvents'));
        },
        fieldChangeListener: function(fieldModel, options) {
            if (_.has(_.result(fieldModel, 'changedAttributes', {}), 'required')) {
                this.ui.allFields.trigger('control:required', !!fieldModel.get('required'));
            } else {
                this.render();
            }
        },
        // Change to form model's attribute
        modelChangeListener: function(model, value, options) {
            this.updateFieldsAfterFormModelChange(model, value);
        },
        // Overwritting to allow access to modelName elsewhere
        listenToFieldName: function() {
            this.modelName = this.getComponentInstanceName();
            this.listenTo(this.formModel, "change:" + this.modelName, this.onModelChange);
        },
        stopListeningToFieldName: function() {
            this.stopListening(this.formModel, "change:" + this.modelName, this.onModelChange);
        },
        assignToModelEvents: function() {
            var eventsHash = {};
            eventsHash['change:' + this.modelName + '-type'] = 'changeToType';
            eventsHash['change:' + this.modelName + '-facility'] = 'changeToFacility';
            eventsHash['change:' + this.modelName + '-team'] = 'changeToTeam';
            eventsHash['change:' + this.modelName + '-roles'] = 'changeToRoles';
            eventsHash['change:' + this.modelName + '-person'] = 'changeToPerson';
            return eventsHash;
        },
        ui: {
            'typeField': '.control[class*="-type"]',
            'facilityField': '.control[class*="-facility"]',
            'personField': '.control[class*="-person"]',
            'teamField': '.control[class*="-team"]',
            'rolesField': '.control[class*="-roles"]',
            'allFields': '.control'
        },
        resetFieldProperties: function() {
            this.ui.personField.trigger('control:update:config', {
                hidden: true,
                disabled: true,
                pickList: []
            });
            this.ui.facilityField.trigger('control:update:config', {
                hidden: true,
                disabled: true,
                pickList: []
            });
            this.ui.teamField.trigger('control:update:config', {
                hidden: true,
                disabled: true,
                pickList: []
            });

            this.ui.rolesField.trigger('control:update:config', {
                hidden: true,
                disabled: true,
                pickList: []
            });
        },
        onRender: function() {
            this.bindUIElements();
            this.updateFieldsAfterFormModelChange(this.formModel, this.formModel.get(this.modelName));
        },
        updateFieldsAfterFormModelChange: function(model, value) {
            this.showLoader();
            this.unbindEntityEvents(this.model, _.result(this, 'assignToModelEvents'));
            var type = _.get(value, 'type');
            var attributesToClear = _.omit({ person: null, facility: null, team: null, roles: null }, _.keys(value));

            this.model.setValues(_.extend({ type: null }, attributesToClear), { unset: true });

            this.resetFieldProperties();

            var draftPromises = [];
            var fetchSettings = {
                shouldShowTrayLoader: false,
                shouldHideTrayLoader: false,
                setDefaultValue: false
            };
            if (!_.isEmpty(type)) {
                switch (type) {
                    case 'opt_person':
                        _.set(value, 'facility', ADK.UserService.getUserSession().get('division'));
                        draftPromises.push(this.fetchFacilities(fetchSettings));
                        this.ui.facilityField.trigger('control:hidden', false);
                        break;
                    case 'opt_anyteam':
                        draftPromises.push(this.fetchFacilities(fetchSettings));
                        this.ui.facilityField.trigger('control:hidden', false);
                        break;
                    case 'opt_myteams':
                        draftPromises.push(this.fetchMyTeams(fetchSettings));
                        this.ui.teamField.trigger('control:hidden', false);
                        break;
                    case 'opt_patientteams':
                        draftPromises.push(this.fetchPatientTeams(fetchSettings));
                        this.ui.teamField.trigger('control:hidden', false);
                        break;
                }
                var facility = _.get(value, 'facility');
                if (!_.isEmpty(facility)) {
                    switch (type) {
                        case 'opt_person':
                            draftPromises.push(this.fetchFacilityPersonnel(facility, fetchSettings));
                            this.ui.personField.trigger('control:update:config', {
                                'hidden': false,
                                'disabled': true
                            });
                            break;
                        case 'opt_anyteam':
                            draftPromises.push(this.fetchFacilityTeams(facility, fetchSettings));
                            this.ui.teamField.trigger('control:update:config', {
                                'hidden': false,
                                'disabled': true
                            });
                            break;
                    }
                    this.ui.rolesField.trigger('control:update:config', {
                        'hidden': true,
                        'disabled': true
                    });
                }
                var team = _.get(value, 'team');
                if (!_.isEmpty(team)) {
                    draftPromises.push(this.fetchTeamRoles(team, fetchSettings));
                    this.ui.rolesField.trigger('control:update:config', {
                        'hidden': false,
                        'disabled': true
                    });
                }
            }
            value = _.omit(value, '_labelsForSelectedValues');

            if (!_.isEmpty(draftPromises)) {
                $.when.apply(null, draftPromises).then(_.bind(function() {
                    this.model.setValues(value);
                }, this), _.bind(function() {
                    this.resetFieldProperties();
                    this.ui.typeField.trigger('control:disabled', true);
                    this.model.setValues({ type: null, person: null, facility: null, team: null, roles: null }, { unset: true });
                    this.validateModel(null, { loadingDraft: true });
                }, this)).always(_.bind(function() {
                    this.updateFormModel();
                    this.bindEntityEvents(this.model, _.result(this, 'assignToModelEvents'));
                    this.hideLoader();
                }, this));
            } else {
                this.model.setValues(value);
                this.updateFormModel();
                this.bindEntityEvents(this.model, _.result(this, 'assignToModelEvents'));
                this.hideLoader();
            }

        },
        updateFields: function(formModelValue) {
            var type = _.get(formModelValue, 'type') || _.get(this.formModel.get(this.modelName), 'type');
            if (!_.isEmpty(type)) {
                switch (type) {
                    case 'opt_person':
                    case 'opt_anyteam':
                        this.fetchFacilities();
                        this.ui.facilityField.trigger('control:hidden', false);
                        break;
                    case 'opt_myteams':
                        this.fetchMyTeams();
                        this.ui.teamField.trigger('control:hidden', false);
                        break;
                    case 'opt_patientteams':
                        this.fetchPatientTeams();
                        this.ui.teamField.trigger('control:hidden', false);
                        break;
                }
                var facility = _.get(formModelValue, 'facility') || _.get(this.formModel.get(this.modelName), 'facility');
                this.changeToFacility(null, facility);

                var team = _.get(formModelValue, 'team') || _.get(this.formModel.get(this.modelName), 'team');
                this.changeToTeam(null, team);
            }

        },
        changeToFacility: function(model, value) {
            if (!_.isEmpty(value)) {
                switch (_.get(this.formModel.get(this.modelName), 'type')) {
                    case 'opt_person':
                        this.fetchFacilityPersonnel(value);
                        this.ui.personField.trigger('control:update:config', {
                            'hidden': false,
                            'disabled': true,
                            'pickList': []
                        });
                        break;
                    case 'opt_anyteam':
                        this.fetchFacilityTeams(value);
                        this.ui.teamField.trigger('control:update:config', {
                            'hidden': false,
                            'disabled': true,
                            'pickList': []
                        });
                        break;
                }
                this.unbindEntityEvents(this.model, _.result(this, 'assignToModelEvents'));
                this.model.setValues({ 'person': null, 'team': null, 'roles': null }, { unset: true });
                this.bindEntityEvents(this.model, _.result(this, 'assignToModelEvents'));
                this.ui.rolesField.trigger('control:update:config', {
                    'hidden': true,
                    'disabled': true,
                    'pickList': []
                });
                this.updateFormModel();
            }
        },
        changeToTeam: function(model, value) {
            if (!_.isEmpty(value)) {
                this.fetchTeamRoles(value);
                this.ui.rolesField.trigger('control:update:config', {
                    'hidden': false,
                    'disabled': true,
                    'pickList': []
                });
                this.unbindEntityEvents(this.model, _.result(this, 'assignToModelEvents'));
                this.model.setValues({ 'roles': null }, { unset: true });
                this.bindEntityEvents(this.model, _.result(this, 'assignToModelEvents'));
                this.updateFormModel();
            }
        },
        changeToRoles: function(model, value) {
            var previous = _.get(model, '_previousAttributes.' + this.modelName + '-roles');
            if ((!_.isEmpty(value) && !(_.isArray(value) && _.isEmpty(_.get(value, '[0]')))) ||
                (_.isArray(previous) && (!_.isEmpty(previous) || !_.isEmpty(_.get(previous, '[0]'))))) {
                this.updateFormModel();
            }
        },
        changeToPerson: function(model, value) {
            if (!_.isEmpty(value)) {
                this.updateFormModel();
            }
        },
        changeToType: function(model, value, options) {
            this.unbindEntityEvents(this.model, _.result(this, 'assignToModelEvents'));
            this.model.setValues({ 'person': null, 'facility': null, 'team': null, 'roles': null }, { unset: true });
            this.bindEntityEvents(this.model, _.result(this, 'assignToModelEvents'));
            this.ui.personField.trigger('control:update:config', {
                'hidden': true,
                'disabled': true,
                'pickList': []
            });
            this.ui.facilityField.trigger('control:update:config', {
                'hidden': true,
                'disabled': true,
                'pickList': []
            });
            this.ui.teamField.trigger('control:update:config', {
                'hidden': true,
                'disabled': true,
                'pickList': []
            });
            this.ui.rolesField.trigger('control:update:config', {
                'hidden': true,
                'disabled': true,
                'pickList': []
            });
            this.updateFormModel();
            this.updateFields();
        },
        onUserInput: function() {
            this.formModel.trigger('change.inputted', this.formModel, this.formModel.changedAttributes());
            this.formModel.trigger('change.inputted:' + this.modelName, this.formModel, _.get(_.result(this, 'fieldModel.changedAttributes', {}), this.modelName, this.formModel.get(this.modelName)));
        },
        updateFormModel: function(model, options) {
            //Create new object from model to save to the form's model
            this.stopListeningToFieldName();
            var value = _.isPlainObject(model) ? model : this.model.toJSON({ stripPrefix: true, omitEmpty: true });
            this.formModel.set(this.modelName, value);
            this.onUserInput();
            this.listenToFieldName();
        },
        showLoader: function() {
            this.$('select.select2-hidden-accessible').select2('close');
            this.$el.trigger('tray.loaderShow', { loadingString: 'Loading additional fields' });
        },
        hideLoader: function() {
            this.$el.trigger('tray.loaderHide');
        },
        fetchPicklist: function(Collection, fetchOptions, callback, draftPromise, settings) {
            fetchOptions = _.extend({
                cache: true,
                expires: 600
            }, fetchOptions);
            settings = _.extend({
                shouldShowTrayLoader: true,
                shouldHideTrayLoader: true,
                shouldRetryFetch: false,
                fieldName: '',
                errorCallback: _.noop
            }, settings);
            if (!!_.get(settings, 'shouldShowTrayLoader')) {
                this.showLoader();
            }
            this.model.errorModel.clear();
            var picklist = Collection instanceof Backbone.Collection ? Collection : new Collection();
            this.listenToOnce(picklist, 'read:success', function(collection, response, options) {
                this.stopListening(picklist);
                var responseHeader = _.get(options, 'xhr.getResponseHeader');
                if (!!_.get(settings, 'shouldRetryFetch') && !_.get(response, 'data') && _.isFunction(responseHeader)) {
                    var MIN_TIMEOUT_SECONDS = 10;
                    var MIN_TIMEOUT_MILLISECONDS = 10000;
                    var retrySeconds = responseHeader('Retry-After');
                    var seconds = parseInt(retrySeconds);
                    var retryMilliseconds = (_.isNumber(seconds) && seconds > MIN_TIMEOUT_SECONDS) ? seconds * 1000 : MIN_TIMEOUT_MILLISECONDS;
                    setTimeout(_.bind(function() {
                        ADK.ResourceService.clearCacheByResourceTitle(_.get(collection, 'resource'));
                        this.fetchPicklist(collection, fetchOptions, callback, false);
                    }, this), retryMilliseconds);
                } else {
                    _.compose(function() {
                        if (!!_.get(settings, 'shouldHideTrayLoader')) {
                            this.hideLoader();
                        }
                    }, function() {
                        _.result(draftPromise, 'resolve');
                    }, callback).apply(this, arguments);
                }
            });
            this.listenToOnce(picklist, 'read:error', function(collection, response, options) {
                this.stopListening(picklist);
                ADK.Errors.collection.add({
                    message: 'Assign To: Error retrieving list of options.',
                    details: {
                        url: collection.url,
                        response: response
                    }
                });

                var fieldName = _.get(settings, 'fieldName');
                if (!_.isEmpty(fieldName)) {
                    this.model.errorModel.set(fieldName, 'Error retrieving list. Try changing previous selection(s).');
                }
                _.compose(function() {
                    if (!!_.get(settings, 'shouldHideTrayLoader')) {
                        this.hideLoader();
                    }
                }, function() {
                    _.result(draftPromise, 'reject');
                }, _.get(settings, 'errorCallback')).apply(this, arguments);
            });
            picklist.fetch(fetchOptions);
            return picklist;
        },
        fetchFacilities: function(settings) {
            settings = _.extend({
                shouldShowTrayLoader: true,
                shouldHideTrayLoader: true,
                fieldName: this.model.addPrefix('facility'),
                setDefaultValue: true
            }, settings);
            var callback = function(collection, response) {
                var picklist = collection.toPicklist();
                var hasItems = picklist.length > 0;
                this.ui.facilityField.trigger('control:update:config', {
                    'disabled': false,
                    'pickList': picklist
                });
                if (!hasItems) this.model.errorModel.set(this.model.addPrefix('facility'), 'No facilities. Try changing previous selection(s).');
                if (_.isEqual(this.model.getValue('type'), 'opt_person')) {
                    if (!!_.get(settings, 'setDefaultValue') && _.isEmpty(this.model.getValue('person'))) {
                        var userFacilityModel = collection.findWhere({ name: collection.user.get('facility') });
                        if (_.isUndefined(userFacilityModel) || !userFacilityModel.has('division')) return;
                        this.model.setValues('facility', userFacilityModel.get('division'));
                    }
                }
            };
            var picklist = _.get(this, '_picklists.facilities', ADK.UIResources.Picklist.Locations.Facilities);
            var draftPromise = $.Deferred();
            this._picklists.facilities = this.fetchPicklist(picklist, {}, callback, draftPromise, settings);
            return draftPromise;
        },
        fetchFacilityPersonnel: function(facility, settings) {
            settings = _.extend({
                shouldShowTrayLoader: true,
                shouldHideTrayLoader: true,
                fieldName: this.model.addPrefix('person')
            }, settings);
            var callback = function(collection, response) {
                var picklist = collection.toPicklist();
                var hasItems = picklist.length > 0;
                this.ui.personField.trigger('control:update:config', {
                    'disabled': false,
                    'pickList': picklist
                });
                if (!hasItems) this.model.errorModel.set(this.model.addPrefix('person'), 'No eHMP users at this facility. Try changing previous selection(s).');
            };
            var picklist = _.get(this, '_picklists.facilityPersonnel', ADK.UIResources.Picklist.Team_Management.PeopleAtAFacility);
            var draftPromise = $.Deferred();
            this._picklists.facilityPersonnel = this.fetchPicklist(picklist, {
                facilityID: facility,
                site: this.getFacilitySiteCode(facility)
            }, callback, draftPromise, settings);
            return draftPromise;
        },
        fetchFacilityTeams: function(facility, settings) {
            settings = _.extend({
                shouldShowTrayLoader: true,
                shouldHideTrayLoader: true,
                shouldRetryFetch: true,
                fieldName: this.model.addPrefix('team')
            }, settings);
            var callback = function(collection, response) {
                var picklist = collection.toPicklist();
                var hasItems = _.reduce(picklist, function(total, item) {
                    return total + item.pickList.length;
                }, 0) > 0;
                if (!hasItems) picklist = [];
                this.ui.teamField.trigger('control:update:config', {
                    'disabled': false,
                    'pickList': picklist
                });
                if (!hasItems) this.model.errorModel.set(this.model.addPrefix('team'), 'No teams with eHMP users at this facility. Try changing previous selection(s).');
            };
            var picklist = _.get(this, '_picklists.facilityTeams', ADK.UIResources.Picklist.Team_Management.Teams.ForAFacility);
            var draftPromise = $.Deferred();
            this._picklists.facilityTeams = this.fetchPicklist(picklist, {
                facilityID: facility,
                site: this.getFacilitySiteCode(facility)
            }, callback, draftPromise, settings);
            return draftPromise;
        },
        fetchMyTeams: function(settings) {
            settings = _.extend({
                shouldShowTrayLoader: true,
                shouldHideTrayLoader: true
            }, settings);
            var UserResultsLoaded = $.Deferred();
            var PatientRelatedResultsLoaded = $.Deferred();

            var userResultsSuccessCallback = function(collection, response) {
                var items = _.get(response, 'data');
                items = _.isArray(items) && !_.isEmpty(items) ? collection.toPicklist() : [];
                UserResultsLoaded.resolve(items);
            };
            var patientRelatedResultsSuccessCallback = function(collection, response) {
                var items = _.get(response, 'data');
                items = _.isArray(items) && !_.isEmpty(items) ? collection.toPicklist() : [];
                PatientRelatedResultsLoaded.resolve(items);
            };

            var userResultsErrorCallback = function(collection, response) {
                UserResultsLoaded.resolve([]);
            };
            var patientRelatedResultsErrorCallback = function(collection, response) {
                PatientRelatedResultsLoaded.resolve([]);
            };

            var userModel = ADK.UserService.getUserSession();
            var userIEN = userModel.get('duz')[userModel.get('site')];

            var picklist = _.get(this, '_picklists.teamsForAUser', ADK.UIResources.Picklist.Team_Management.Teams.ForAUser);
            this._picklists.teamsForAUser = this.fetchPicklist(picklist, {
                staffIEN: userIEN
            }, userResultsSuccessCallback, null, _.extend({
                errorCallback: userResultsErrorCallback
            }, settings, { shouldHideTrayLoader: false }));

            picklist = _.get(this, '_picklists.teamsPatientRealtedForAUser', ADK.UIResources.Picklist.Team_Management.Teams.PatientRelatedForAUser);
            this._picklists.teamsPatientRealtedForAUser = this.fetchPicklist(picklist, {
                staffIEN: userIEN,
                patientID: ADK.PatientRecordService.getCurrentPatient().get('icn')
            }, patientRelatedResultsSuccessCallback, null, _.extend({
                errorCallback: patientRelatedResultsErrorCallback
            }, settings, { shouldHideTrayLoader: false }));
            var draftPromise = $.Deferred();
            $.when(
                UserResultsLoaded,
                PatientRelatedResultsLoaded
            ).then(_.bind(function(userItems, patientRelatedItems) {
                var picklist = [].concat(patientRelatedItems, userItems);
                var hasItems = _.reduce(picklist, function(total, item) {
                    return total + item.pickList.length;
                }, 0) > 0;
                if (!hasItems) picklist = [];
                this.ui.teamField.trigger('control:update:config', {
                    'disabled': false,
                    'pickList': picklist
                });
                if (!hasItems) this.model.errorModel.set(this.model.addPrefix('team'), 'No teams with eHMP users. Try changing previous selection(s).');
                if (_.isEmpty(picklist)) {
                    draftPromise.reject();
                } else {
                    draftPromise.resolve();
                }
                if (!!_.get(settings, 'shouldHideTrayLoader')) {
                    this.hideLoader();
                }
            }, this));
            return draftPromise;
        },
        fetchPatientTeams: function(settings) {
            settings = _.extend({
                shouldShowTrayLoader: true,
                shouldHideTrayLoader: true,
                fieldName: this.model.addPrefix('team')
            }, settings);
            var callback = function(collection, response) {
                var picklist = collection.toPicklist();
                var hasItems = _.reduce(picklist, function(total, item) {
                    return total + item.pickList.length;
                }, 0) > 0;
                if (!hasItems) picklist = [];
                this.ui.teamField.trigger('control:update:config', {
                    'disabled': false,
                    'pickList': picklist
                });
                if (!hasItems) this.model.errorModel.set(this.model.addPrefix('team'), 'No teams with eHMP users for this patient. Try changing previous selection(s).');
            };
            var picklist = _.get(this, '_picklists.patientTeams', ADK.UIResources.Picklist.Team_Management.Teams.ForAPatient);
            var draftPromise = $.Deferred();
            this._picklists.patientTeams = this.fetchPicklist(picklist, {
                patientID: ADK.PatientRecordService.getCurrentPatient().get('icn')
            }, callback, draftPromise, settings);
            return draftPromise;
        },
        fetchTeamRoles: function(team, settings) {
            settings = _.extend({
                shouldShowTrayLoader: true,
                shouldHideTrayLoader: true,
                fieldName: this.model.addPrefix('roles')
            }, settings);
            var callback = function(collection, response) {
                var picklist = collection.toPicklist();
                var hasItems = picklist.length > 0;
                this.ui.rolesField.trigger('control:update:config', {
                    'disabled': false,
                    'pickList': collection.toPicklist()
                });
                if (!hasItems) this.model.errorModel.set(this.model.addPrefix('roles'), 'No roles with eHMP users for this team. Try changing previous selection(s).');
            };
            var draftPromise = $.Deferred();
            this.fetchPicklist(ADK.UIResources.Picklist.Team_Management.Roles.ForATeam, {
                teamID: team
            }, callback, draftPromise, settings);
            return draftPromise;
        },
        getFacilitySiteCode: function(facility) {
            var facilities = _.get(this, '_picklists.facilities');
            if (!(facilities instanceof Backbone.Collection)) return null;
            var siteModel = facilities.findWhere({
                division: facility
            });
            if (!_.isUndefined(siteModel)) {
                return siteModel.get('siteCode');
            }
            return null;
        },
        childViewOptions: function(model, index) {
            return {
                field: model,
                model: this.model
            };
        },
        events: _.defaults({
            "control:required": function(event, booleanValue) {
                if (_.isBoolean(booleanValue)) {
                    this.field.set('required', booleanValue);
                }
                event.stopPropagation();
            }
        }, ADK.UI.Form.ControlService.CompositeViewControl.prototype.events)
    });

    return AssignToControl;
});
