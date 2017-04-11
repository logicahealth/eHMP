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
    var loadingViewTemplate = '<p><i class="fa fa-spinner fa-spin"></i> Loading...</p>';
    var formView = ADK.UI.Form.extend({

        onInitialize: function() {
            this.model = this.options.model;
            this.model.set('alertMessage', '');
            this.parentCollection = this.options.parentCollection;
            this.rootView = this.options.parentView;
            var self = this;
            this.parentCollection.on('checkResultsCount', function() {
                if (self.parentCollection.length !== self.model.get('resultCount')) {
                    self.setPaging();
                }
            });
            this.parentCollection.on('showAlert', function(model) {
                self.showAlert(model.get('icon'), model.get('type'), model.get('title'), model.get('message'));
            });
        },
        setPaging: function() {
            if (this.parentCollection.models.length > 0) {
                var paging_data = this.parentCollection.where({
                    has_paging_data: true
                })[0].get('paging_data');
                if (!_.isUndefined(paging_data)) {
                    this.model.set('resultCount', paging_data.message);
                    this.model.set('resultCountLabel', paging_data.message.replace('-', 'through'));
                    this.currentStartIndex = paging_data.currentStart;
                    this.nextPageStartIndex = paging_data.nextStart;
                    this.previousPageStartIndex = paging_data.previousStart;
                    if (paging_data.nextStart === 0 && paging_data.previousStart === 0 && this.currentStartIndex === 0) {
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
            this.ui.nextPageButton = this.$el.find('.next-page-button');
            this.ui.previousPageButton = this.$el.find('.previous-page-button');
            this.ui.nextPageButton.trigger('control:disabled', true);
            this.ui.previousPageButton.trigger('control:disabled', true);
        },
        enablePagingButtons: function() {
            this.ui.nextPageButton = this.$el.find('.next-page-button');
            this.ui.previousPageButton = this.$el.find('.previous-page-button');
            this.ui.nextPageButton.trigger('control:disabled', false);
            this.ui.previousPageButton.trigger('control:disabled', false);
        },
        onRender: function() {
            var self = this;
            appletUtil.getPermissionSets(function(permissionSets, errorMessage) {
                if (errorMessage) {
                    appletUtil.appletAlert.warning(self.parentCollection, 'Error Retrieving Permission Sets', errorMessage);
                } else {
                    self.ui.permissionSetsPicklistControl.trigger('control:picklist:set', permissionSets);
                }
            });
            this.enableSearchForm();
            if (appletUtil.getStorageModel('inResultsView') === true) {
                this.hideSearchView();
            }
            this.listenTo(ADK.Messaging, 'users-applet:launch-bulk-edit', function() {
                self.showMultiEditView();
            });
        },
        ui: {
            "searchButton": ".search-btn",
            "searchButtonControl": ".search-btn-container .button-control",
            "allControls": ".control",
            "mainSearchFormControls": ".mainSearchForm",
            "resultsViewFormControls": ".resultsViewForm",
            "loadingViewControl": ".loadingView",
            "permissionSetsPicklistControl": ".permissionSetsPicklist",
            "bulkEditControl": ".bulk-edit-btn",
            "alertBannerControl": "div.control.alertBanner-control",
            "nextPageButton": ".next-page-button",
            "previousPageButton": ".previous-page-button",
        },
        enableForm: function(e) {
            this.$el.find(this.ui.allControls).trigger('control:disabled', false);
            this.setPaging();
        },
        disableForm: function(e) {
            this.$el.find(this.ui.allControls).trigger('control:disabled', true);
        },
        showSearchView: function() {
            this.ui.resultsViewFormControls.trigger('control:hidden', true);
            this.ui.mainSearchFormControls.trigger('control:hidden', false);
            appletUtil.setStorageModel('inResultsView', false);
            appletUtil.setStorageModel('formModel', this.model.attributes);
        },
        hideSearchView: function() {
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
            dismissible: true
        }, {
            name: "searchForm",
            control: "container",
            extraClasses: ["searchForm", "row", "background-color-pure-white", "left-margin-no", "right-margin-no"],
            items: [{
                control: "container",
                extraClasses: ["col-md-12", "mainSearchForm"],
                template: '<p><strong>Fill in at least one field to search for users</strong></p>'
            }, {
                control: "container",
                extraClasses: ["col-md-12", "mainSearchForm"],
                items: [{
                    control: "input",
                    name: "lastNameValue",
                    label: "Last Name",
                    extraClasses: ["col-md-6"],
                    srOnlyLabel: false,
                    title: "Please enter the Last Name of the user"
                }, {
                    control: "input",
                    name: "firstNameValue",
                    label: "First Name",
                    extraClasses: ["col-md-6"],
                    srOnlyLabel: false,
                    title: "Please enter the First Name of the user"
                }]
            }, {
                control: "container",
                extraClasses: ["col-md-12", "mainSearchForm"],
                items: [{
                    control: "select",
                    name: "permissionSetValue",
                    extraClasses: ["col-md-6", "permissionSetsPicklist"],
                    pickList: appletUtil.permissionSets,
                    srOnlyLabel: false,
                    label: "Select Permission Set",
                    title: "To select an option, use the up and down arrow keys then press enter to select",
                }, {
                    control: "input",
                    name: "duzValue",
                    label: "DUZ",
                    extraClasses: ["col-md-6"],
                    srOnlyLabel: false,
                    title: "Please enter the DUZ of the user"
                }]
            }, {
                name: "checkboxForm",
                control: "container",
                items: [{
                    control: "container",
                    items: [{
                        control: "container",
                        extraClasses: ["col-md-12", "mainSearchForm", "right-padding-lg"],
                        template: '<p>Default search results will return only users that are active in both eHMP and VistA.</p>'
                    }, {
                        control: "container",
                        extraClasses: ["col-md-3", "top-margin-xs", "resultsViewForm", "left-padding-xs"],
                        items: [{
                            control: "button",
                            extraClasses: ["btn-link", "search-return-link", "left-padding-xs"],
                            name: "searchreturnlink",
                            label: "Back to Search",
                            disabled: false,
                            icon: "fa-angle-double-left",
                            title: "Press enter to return to user search form"
                        }],
                        hidden: true
                    }, {
                        control: "container",
                        extraClasses: ["col-md-7"],
                        items: [{
                            control: "container",
                            extraClasses: ["col-md-6"],
                            items: [{
                                control: "checkbox",
                                label: "Include Inactive VistA Users",
                                name: "vistaCheckboxValue",
                                title: "To select this checkbox, press the spacebar",
                            }]
                        }, {
                            control: "container",
                            extraClasses: ["col-md-6"],
                            items: [{
                                control: "checkbox",
                                label: "Include Inactive eHMP Users",
                                name: "ehmpCheckboxValue",
                                title: "To select this checkbox, press the spacebar",
                            }]
                        }]
                    }]
                }, {
                    control: "container",
                    extraClasses: ["resultsViewForm", "col-md-12"],
                    items: [{
                        control: "container",
                        extraClasses: ["col-md-9", "results-count-container", "bold-font", "bottom-padding-sm", "left-padding-no"],
                        template: '<span id="resultcountlabel" aria-label="Table is now {{resultCountLabel}}">{{resultCount}}</span>'
                    }, {
                        control: "container",
                        extraClasses: ["col-md-3", "text-right"],
                        items: [{
                            control: "button",
                            extraClasses: ["btn-primary", "btn-sm", "pixel-width-25"],
                            name: "previous-page-button",
                            label: "Previous Page",
                            srOnlyLabel: true,
                            icon: "fa-caret-left",
                            disabled: false,
                            title: "Previous Page",
                            id: "previous-page-button",
                            type: "button"
                        }, {
                            control: "button",
                            extraClasses: ["btn-primary", "btn-sm", "pixel-width-25"],
                            name: "next-page-button",
                            label: "Next Page",
                            srOnlyLabel: true,
                            icon: "fa-caret-right",
                            disabled: false,
                            title: "Next Page",
                            id: "next-page-button",
                            type: "button"
                        }]
                    }],
                    hidden: true
                }]
            }, {
                control: "container",
                extraClasses: ["col-md-12", "search-btn-container", "mainSearchForm"],
                items: [{
                    control: "button",
                    extraClasses: ["btn-primary", "btn-sm", "search-btn"],
                    name: "Search",
                    label: "Search",
                    disabled: true,
                    title: "Press enter to search",
                    id: "search-btn",
                    type: "submit"
                }]
            }, {
                control: "container",
                extraClasses: ["col-md-12", "loadingView"],
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
                this.searchUsers(e);
            },
            'click .search-return-link': function(e) {
                e.preventDefault();
                this.clearAlert();
                this.showSearchView();
            },
            'click .next-page-button button': function(e) {
                e.preventDefault();
                this.disableFormAndSearch(this.nextPageStartIndex);
            },
            'click .previous-page-button button': function(e) {
                e.preventDefault();
                this.disableFormAndSearch(this.previousPageStartIndex);
            }
        },
        clearAlert: function() {
            appletUtil.appletAlert.warning(this.parentCollection, '', '');
        },
        showMultiEditView: function() {
            var resetCollection = new Backbone.Collection(this.parentCollection.originalModels);
            var deepClonedCollection = new Backbone.Collection(resetCollection.toJSON());
            UserManagementMultiUserEditModalView.showModal({
                initialUsersCollection: deepClonedCollection
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
            this.$el.find('#resultcountlabel').text(newCount);
            this.$el.find('#resultcountlabel').attr('title', 'Table is now ' + newCount + '');
            appletUtil.setStorageModel('formModel', this.model.attributes);
        },
        showAlert: function(icon, type, title, message) {
            this.ui.alertBannerControl.trigger('control:hidden', false);
            this.ui.alertBannerControl.trigger('control:icon', icon).trigger('control:type', type).trigger('control:title', title);
            this.model.set('alertMessage', message);
        },
        disableFormAndSearch: function(startIndex) {
            var start = startIndex || 0;
            if (!_.isNumber(start)) {
                start = 0;
            }
            if (appletUtil.getStorageModel('inResultsView') === true) {
                this.disableForm();
                this.clearAlert();
                this.searchUsers(null, start);
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
        searchUsers: function(e, startIndex) {
            var start = startIndex || 0;
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
            var query = appletUtil.createUserSearchFilter(filterParameters, start);
            appletUtil.setStorageModel('lastQueryParams', query);
            eventHandler.createUserList(false, query, null, this.parentCollection, this);
        },


        onBeforeDestroy: function() {
            this.parentCollection.off('reset');
            this.parentCollection.off('checkResultsCount');
        }
    });

    return formView;
});