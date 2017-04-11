define([
    "backbone",
    "marionette",
    "underscore",
    "handlebars",
    "main/Utils",
    "api/ResourceService",
    "hbs!main/components/patient/cwad/templates/cwadDetailContainer",
    "hbs!main/components/patient/cwad/templates/allergiesDetails",
    "hbs!main/components/patient/cwad/templates/directiveDetails",
    "hbs!main/components/patient/cwad/templates/patientFlagsDetails"
], function(Backbone, Marionette, _, Handlebars, Utils, ResourceService, cwadDetailContainer, AllergiesDetailsTemplate, DirectiveDetails, PatientFlagsDetails) {
    "use strict";

    var cwadDeatil = Backbone.Marionette.ItemView.extend({
        className: "row-layout cwad-detail bottom-margin-lg",
        initialize: function(options) {
            this.template = options.template;
        }
    });

    var LoadingView = Backbone.Marionette.ItemView.extend({
        template: _.template('<h5 class="loading"><i class="fa fa-spinner fa-spin"></i> Loading...</h5>'),
    });

    var NoResultsView = Backbone.Marionette.ItemView.extend({
        template: _.template('<div aria-live="assertive"><p class="error-message padding" role="alert">No results found.</p></div>'),
        tagName: "p"
    });
    var ErrorView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<div aria-live="assertive"><p class="error-message padding" role="alert">Error: {{errorCode}}</p></div>'),
        initialize: function(options) {
            this.model.set('errorCode', options.errorCode);
        },
        tagName: "p"
    });

    var TitleModel = Backbone.Model.extend({
        defaults: {
            'title': '',
            'description': ''
        }
    });

    var cwadContainerView = Backbone.Marionette.LayoutView.extend({
        template: cwadDetailContainer,
        regions: {
            cwadDetails: '#cwad-detail-list'
        },
        events: {
            'click .close': 'closeDetail'
        },
        initialize: function(options) {
            this.model = new TitleModel({
                title: options.cwadIdentifier,
                description: options.cwadDescription
            });
            this.detailView = new CwadDetailsView(options);
        },
        modelEvents: {
            "change": "render"
        },
        onRender: function() {
            this.cwadDetails.show(this.detailView);
        },
        closeDetail: function(event) {
            this.$el.parent().addClass('hidden');
            $("body").off("mousedown");
        }
    });

    var CwadDetailsView = Backbone.Marionette.CollectionView.extend({
        childView: cwadDeatil,
        emptyView: LoadingView,
        className: "top-margin-xs",
        initialize: function(options) {
            this.childViewOptions = {
                template: _.template('Empty')
            };
            if (options.cwadIdentifier !== 'patient flags') {
                this.emptyViewOptions = {
                    errorCode: 'undefined'
                };
                var filterString;
                var sort = function(item) {
                    var enteredDate = moment(item.get('entered'), 'YYYYMMDDHHmmss').valueOf();
                    return -enteredDate;
                };

                if (options.cwadIdentifier === 'crisis notes') {
                    filterString = 'ilike(kind,"%Crisis%")';
                    this.childViewOptions.template = DirectiveDetails;
                } else if (options.cwadIdentifier === 'warnings') {
                    filterString = 'ilike(kind,"%Warning%")';
                    this.childViewOptions.template = DirectiveDetails;
                } else if (options.cwadIdentifier === 'allergies') {
                    filterString = 'ilike(kind,"%Allergy%"),not(exists(removed),eq(removed,"false"))';
                    this.childViewOptions.template = AllergiesDetailsTemplate;
                    sort = function(a, b) {
                        var acuityNameA = a.get('severity') || '';
                        var acuityNameB = b.get('severity') || '';
                        if (acuityNameB.localeCompare(acuityNameA) !== 0) {
                            return acuityNameB.localeCompare(acuityNameA);
                        } else {
                            var enteredA = a.get('entered') || '';
                            var enteredB = b.get('entered') || '';
                            return enteredB.localeCompare(enteredA);
                        }
                    };

                } else if (options.cwadIdentifier === 'directives') {
                    filterString = 'ilike(kind,"%Directive%")';
                    this.childViewOptions.template = DirectiveDetails;
                } else {
                    filterString = '';
                    this.childViewOptions.template = _.template('Empty');
                }
                var fetchOptions = {
                    resourceTitle: 'patient-record-cwad',
                    criteria: {
                        'filter': filterString
                    },
                    cache: true,
                    collectionConfig: {
                        comparator: sort
                    },
                    viewModel: {
                        parse: function(response) {
                            if (response.observations) {
                                var observation = response.observations[0];
                                response = Utils.extract(response, observation, {
                                    severity: 'severity'
                                });
                                if (observation.date) {
                                    response.observedDate = Utils.formatDate(observation.date);
                                }
                            }
                            return response;
                        }
                    }
                };
                var self = this;
                fetchOptions.onSuccess = function(collection, resp) {
                    self.emptyView = NoResultsView;
                    self.collection = collection;
                    self.render();
                };
                fetchOptions.onError = function(collection, resp) {
                    self.emptyViewOptions.errorCode = resp.status;
                    self.emptyView = ErrorView;
                    self.render();

                };
                this.collection = ResourceService.patientRecordService.fetchCollection(fetchOptions);
            } else {
                this.childViewOptions.template = PatientFlagsDetails;
                this.collection = new Backbone.Collection(options.patientModel.get('patientRecordFlag'));
            }
        }
    });

    return cwadContainerView;
});