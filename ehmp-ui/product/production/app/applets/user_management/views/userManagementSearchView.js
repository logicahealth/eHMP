define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'app/applets/user_management/appletUtil',
    'app/applets/user_management/eventHandler',
    'app/applets/user_management/views/userManagementPermissionSetSelectionView',
    'app/applets/user_management/views/userManagementMultiUserEditModalView',
], function(Backbone, Marionette, $, Handlebars, appletUtil, eventHandler, UserManagementPermissionSetSelectionView, UserManagementMultiUserEditModalView) {
    "use strict";
    var UMA_CHANNEL = ADK.Messaging.getChannel('user-management-applet');
    var loadingViewTemplate = '<p><i class="fa fa-spinner fa-spin"></i> Loading...</p>';
    var formView = ADK.UI.Form.extend({
        className: 'auto-overflow-y',
        parentCollectionEvents: {
            checkResultsCount: function() {
                if (this.parentCollection.length !== this.model.get('resultCount')) {
                    this.setPaging();
                }
            },
            showAlert: function(model) {
                this.showAlert(model.get('icon'), model.get('type'), model.get('title'), model.get('message'));
            }
        },
        onDestroy: function() {
            this.unbindEntityEvents(this.parentCollection, this.parentCollectionEvents);
            if (_.isFunction(ADK.UI.Form.prototype.onDestroy)) {
                ADK.UI.Form.prototype.onDestroy.apply(this, arguments);
            }
        },
        onInitialize: function() {
            this.model = this.options.model;
            this.model.set('alertMessage', '');
            this.parentCollection = this.options.parentCollection;
            this.rootView = this.options.parentView;

            this.bindEntityEvents(this.parentCollection, this.parentCollectionEvents);
            this.sharedModel = ADK.UIResources.Fetch.Permission.SharedModel(this);
        },
        setPaging: function() {
            if (this.parentCollection.models.length > 0) {
                var paging_data = this.parentCollection.where({
                    has_paging_data: true
                })[0].get('paging_data');
                if (!_.isUndefined(paging_data)) {
                    this.model.set('resultCount', paging_data.message);
                    this.model.set('resultCountLabel', paging_data.message.replace('-', 'through'));
                    this.currentPage = paging_data.currentPage;
                    this.nextPage = paging_data.nextPage;
                    this.previousPage = paging_data.previousPage;
                    if (paging_data.nextPage === 1 && paging_data.previousPage === 1 && paging_data.currentPage === 1) {
                        this.disablePagingButtons();
                    } else {
                        this.enablePagingButtons();
                    }
                }
            } else {
                this.disablePagingButtons();
                this.model.set('resultCount', 'Showing 0 results');
            }
        },
        disablePagingButtons: function() {
            this.footerView.disablePagingButtons();
        },
        enablePagingButtons: function() {
            this.footerView.enablePagingButtons();
        },
        onShow: function() {
            /** Check shared model in onShow since select component 
             * checks for the picklist form value on render
             **/
            if (this.sharedModel.isReady) {
                var basePermissionSetsCollection = new ADK.UIResources.Fetch.Permission.UMAPermissionSetsCollection(this.sharedModel.get('permissionSets').originalModels, {
                    parse: true
                });
                this.ui.permissionSetsPicklistControl.trigger('control:picklist:set', basePermissionSetsCollection.toPicklist());
            } else {
                this.listenToOnce(this.sharedModel, 'fetch:success', function() {
                    if (this.sharedModel.isReady) {
                        var basePermissionSetsCollection = new ADK.UIResources.Fetch.Permission.UMAPermissionSetsCollection(this.sharedModel.get('permissionSets').originalModels, {
                            parse: true
                        });
                        this.ui.permissionSetsPicklistControl.trigger('control:picklist:set', basePermissionSetsCollection.toPicklist());
                    }
                });
            }
        },
        onRender: function() {
            this.footerView.hideFooterContent();
            this.enableSearchForm();
            if (appletUtil.getStorageModel('inResultsView') === true) {
                this.hideSearchView();
            }
            this.listenTo(UMA_CHANNEL, 'users-applet:launch-bulk-edit', function(triggerElement) {
                this.showMultiEditView(triggerElement);
            });
            this.clearAlert();
        },
        ui: {
            "searchButton": ".search-btn",
            "searchButtonControl": ".search-btn-container .button-control",
            "allControls": ".control",
            "mainSearchFormControls": ".main-search-form",
            "resultsViewFormControls": ".resultsViewForm",
            "loadingViewControl": ".loading-view",
            "permissionSetsPicklistControl": ".permission-sets-picklist",
            "bulkEditControl": ".bulk-edit-btn",
            "alertBannerControl": "div.control.alertBanner-control"
        },
        enableForm: function(e) {
            this.$el.find(this.ui.allControls).trigger('control:disabled', false);
            this.setPaging();
        },
        disableForm: function(e) {
            this.disablePagingButtons();
            this.$el.find(this.ui.allControls).trigger('control:disabled', true);
        },
        showSearchView: function() {
            this.footerView.hideFooterContent();
            this.ui.resultsViewFormControls.trigger('control:hidden', true);
            this.ui.mainSearchFormControls.trigger('control:hidden', false);
            this.$el.find('.lastNameValue input').focus();
            appletUtil.setStorageModel('inResultsView', false);
            appletUtil.setStorageModel('formModel', this.model.attributes);
        },
        hideSearchView: function() {
            this.footerView.showFooterContent();
            this.setPaging();
            this.ui.resultsViewFormControls.trigger('control:hidden', false);
            this.ui.mainSearchFormControls.trigger('control:hidden', true);
            appletUtil.setStorageModel('inResultsView', true);
            appletUtil.setStorageModel('formModel', this.model.attributes);
        },
        showLoadingView: function() {
            this.ui.loadingViewControl.trigger('control:hidden', false);
        },
        hideLoadingView: function() {
            this.ui.loadingViewControl.trigger('control:hidden', true);
        },
        resetResultsView: function() {
            var previousFilterParameters = appletUtil.getStorageModel('previousFilterParameters');
            if (!_.isUndefined(previousFilterParameters)) {
                this.model.set('vistaCheckboxValue', previousFilterParameters.showVistaInactive || false);
                this.model.set('ehmpCheckboxValue', previousFilterParameters.showEhmpInactive || false);
            }
        },
        fields: [{
            control: "alertBanner",
            name: "alertMessage",
            dismissible: true,
            extraClasses: ["left-margin-md", "right-margin-md", "top-margin-md"]
        }, {
            name: "searchForm",
            control: "container",
            extraClasses: ["search-form", "row", "background-color-pure-white", "left-margin-no", "right-margin-no"],
            items: [{
                control: "container",
                extraClasses: ["col-xs-12", "main-search-form", "top-padding-sm", "bototm-padding-sm"],
                template: '<p>Fill in at least one field to search for users</p>'
            }, {
                control: "container",
                extraClasses: ["col-xs-12", "main-search-form", "left-padding-no"],
                items: [{
                    control: "input",
                    name: "lastNameValue",
                    label: "Last name",
                    extraClasses: ["col-xs-6"],
                    srOnlyLabel: false,
                    title: "Enter at least three letters of the user's Last Name"
                }, {
                    control: "input",
                    name: "firstNameValue",
                    label: "First name",
                    extraClasses: ["col-xs-6"],
                    srOnlyLabel: false,
                    title: "Enter at least three letters of the user's First Name"
                }]
            }, {
                control: "container",
                extraClasses: ["col-xs-12", "main-search-form", "left-padding-no"],
                items: [{
                    control: "select",
                    name: "permissionSetValue",
                    extraClasses: ["col-xs-6", "permission-sets-picklist"],
                    pickList: [],
                    srOnlyLabel: false,
                    label: "Select permission set"
                }, {
                    control: "input",
                    name: "duzValue",
                    label: "DUZ",
                    extraClasses: ["col-xs-6"],
                    srOnlyLabel: false,
                    title: "Enter the D U Z of the user"
                }]
            }, {
                name: "checkboxForm",
                control: "container",
                items: [{
                    control: "container",
                    items: [{
                        control: "container",
                        extraClasses: ["col-xs-12", "main-search-form", "top-padding-sm"],
                        template: '<p>Default search results will return only users that are active in both eHMP and VistA.</p>'
                    }, {
                        control: "container",
                        extraClasses: ["col-xs-3", "top-margin-xs", "resultsViewForm", "left-padding-xs"],
                        items: [{
                            control: "button",
                            extraClasses: ["btn-link", "search-return-link", "left-padding-xs"],
                            name: "searchreturnlink",
                            label: "Back to Search",
                            disabled: false,
                            icon: "fa-angle-double-left"
                        }],
                        hidden: true
                    }, {
                        control: "container",
                        extraClasses: ["col-xs-9", "left-padding-no"],
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-6"],
                            items: [{
                                control: "checkbox",
                                label: "Include inactive VistA users",
                                name: "vistaCheckboxValue",
                                title: "Press spacebar to toggle checkbox.",
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["col-xs-6"],
                            items: [{
                                control: "checkbox",
                                label: "Include inactive eHMP users",
                                name: "ehmpCheckboxValue",
                                title: "Press spacebar to toggle checkbox.",
                            }]
                        }]
                    }]
                }, {
                    control: "container",
                    extraClasses: ["resultsViewForm", "col-xs-12"],
                    items: [{
                        control: "container",
                        extraClasses: ["col-xs-9", "results-count-container", "bold-font", "bottom-padding-sm", "left-padding-no"],
                        template: '<span id="resultCountLabel" aria-label="Table is now {{resultCountLabel}}">{{resultCount}}</span>'
                    }],
                    hidden: true
                }]
            }, {
                control: "container",
                extraClasses: ["col-xs-12", "search-btn-container", "main-search-form", "bottom-padding-sm"],
                items: [{
                    control: "button",
                    extraClasses: ["btn-primary", "btn-sm", "search-btn"],
                    name: "Search",
                    label: "Search",
                    disabled: true,
                    id: "search-btn",
                    type: "submit"
                }]
            }, {
                control: "container",
                extraClasses: ["col-xs-12", "loading-view"],
                template: loadingViewTemplate,
                hidden: true
            }]
        }],

        events: {
            'submit': function(e) {
                e.preventDefault();
                e.stopPropagation();
                this.clearAlert();
                this.disableForm(e);
                this.showLoadingView();
                this.ui.alertBannerControl.trigger('control:hidden', true);
                this.searchUsers(e, null, '.search-return-link');
            },
            'click .search-return-link': function(e) {
                e.preventDefault();
                this.clearAlert();
                this.showSearchView();
            },
            'click .next-page-button button': function(e) {
                e.preventDefault();
                this.disableFormAndSearch(this.nextPage, '.next-page-button button');
            },
            'click .previous-page-button button': function(e) {
                e.preventDefault();
                this.disableFormAndSearch(this.previousPage, '.previous-page-button button');
            }
        },
        clearAlert: function() {
            this.ui.alertBannerControl.trigger('control:hidden', true);
        },
        showMultiEditView: function(triggerElement) {
            var initialUsersCollection = new Backbone.Collection();
            if (appletUtil.getStorageModel('inResultsView') === true) {
                var resetCollection = new Backbone.Collection(this.parentCollection.originalModels);
                initialUsersCollection = new Backbone.Collection(resetCollection.toJSON());
            }
            UserManagementMultiUserEditModalView.showModal({
                initialUsersCollection: initialUsersCollection,
                basePermissionSetsCollection: new ADK.UIResources.Fetch.Permission.UMAPermissionSetsCollection(this.sharedModel.get('permissionSets').originalModels, {
                    parse: true
                }),
                triggerElement: triggerElement
            });
        },
        enableSearchForm: function() {
            this.enableForm();
            this.enableSearchButton();
        },
        onShowGridTable: function() {
            this.enableSearchForm();
            this.model.set('inResultsView', true);
        },
        modelEvents: {
            'change:resultCount': 'updateResultCount',
            'change:vistaCheckboxValue': 'disableFormAndSearch',
            'change:ehmpCheckboxValue': 'disableFormAndSearch',
            'change:firstNameValue': 'enableSearchButton',
            'change:lastNameValue': 'enableSearchButton',
            'change:permissionSetValue': 'enableSearchButton',
            'change:duzValue': 'enableSearchButton'
        },
        updateResultCount: function() {
            var newCount = this.model.get('resultCount');
            appletUtil.setStorageModel('resultCount', newCount);
            this.$el.find('#resultCountLabel').text(newCount);
            this.$el.find('#resultCountLabel').attr('title', 'Table is now ' + newCount + '');
            appletUtil.setStorageModel('formModel', this.model.attributes);
        },
        showAlert: function(icon, type, title, message) {
            this.ui.alertBannerControl.trigger('control:hidden', false);
            this.ui.alertBannerControl.trigger('control:update:config', {
                icon: icon,
                type: type,
                title: title
            });
            this.model.set('alertMessage', message);
        },
        disableFormAndSearch: function(startPage, elementTarget) {
            var target = elementTarget;
            var page = startPage || 1;
            if (!_.isNumber(page)) {
                page = 1;
            }
            if (appletUtil.getStorageModel('inResultsView') === true) {
                this.disableForm();
                this.clearAlert();

                if (this.model.hasChanged('vistaCheckboxValue')) {
                    elementTarget = '.vistaCheckboxValue input';
                } else if (this.model.hasChanged('ehmpCheckboxValue')) {
                    elementTarget = '.ehmpCheckboxValue input';
                }
                this.searchUsers(null, page, elementTarget);
            } else {
                appletUtil.setStorageModel('formModel', this.model.attributes);
            }
        },
        enableSearchButton: function(e) {
            var filterParameters = appletUtil.getFormFieldsValues(this.model);
            appletUtil.setStorageModel('filterParameters', filterParameters);
            appletUtil.setStorageModel('formModel', this.model.attributes);
            this.ui.searchButtonControl = this.$el.find(".search-btn-container .button-control");
            if (this.model.isValid() === true) {
                this.ui.searchButtonControl.trigger('control:disabled', false);
            } else {
                this.ui.searchButtonControl.trigger('control:disabled', true);
            }
        },
        searchUsers: function(e, startPage, elementTarget) {
            var page = startPage || 1;
            if (this.parentCollection.originalModels) {
                this.parentCollection.reset(this.parentCollection.originalModels);
            }
            //get the form fields
            var filterParameters = appletUtil.getStorageModel('filterParameters');
            appletUtil.setStorageModel('previousFilterParameters', filterParameters);
            filterParameters = appletUtil.getFormFieldsValues(this.model);
            appletUtil.setStorageModel('filterParameters', filterParameters);
            var previousLastQueryParams = appletUtil.getStorageModel('lastQueryParams');
            appletUtil.setStorageModel('previousLastQueryParams', previousLastQueryParams);
            appletUtil.setStorageModel('formModel', this.model.attributes);
            var query = appletUtil.createUserSearchFilter(filterParameters, page);
            appletUtil.setStorageModel('lastQueryParams', query);
            eventHandler.createUserList(false, query, null, this.parentCollection, this, elementTarget);
        }
    });

    return formView;
});