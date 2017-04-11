define([
    "backbone",
    "marionette",
    "underscore",
    "handlebars",
    "hbs!main/components/patient/cwad/templates/cwadLayoutTemplate",
    "main/components/patient/cwad/cwadDeatilsView",
], function(Backbone, Marionette, _, Handlebars, cwadLayoutTemplate, CwadDetailsView) {
    "use strict";

    var CWADLayoutView = Backbone.Marionette.LayoutView.extend({
        template: cwadLayoutTemplate,
        templateHelpers: function() {
            return {
                'hasPatientFlags': this.model.hasPatientFlags,
                'hasCrisisNotes': this.model.hasCrisisNotes,
                'hasFlags': this.model.hasFlags,
                'hasAllergies': this.model.hasAllergies,
                'hasDirectives': this.model.hasDirectives
            };
        },
        behaviors: {
            Tooltip: {}
        },
        regions: {
            cwadDetails: '#cwad-details',
        },
        events: {
            'click .cwadLabel': 'showCwadDetails',
            'keypress .cwadLabel': 'showCwadDetails'
        },
        modelEvents: {
            "change": "render"
        },
        createCwadDetailView: function(options) {
            return new CwadDetailsView({
                'cwadIdentifier': options.cwadIdentifier,
                'cwadDescription': options.cwadDescription,
                'patientModel': this.model
            });
        },
        showCwadDetails: function(event) {
            var cwadLabel = $(event.target);
            var cwadContainer = this.$el.find('#cwad-details');
            if ((event.type === 'click') || ((event.type === 'keypress') && (event.which === 13 || event.which === 27))) {
                if (cwadLabel.attr('data-cwadidentifier') !== 'disabled') {
                    if (cwadContainer.attr('data-current-cwad') === cwadLabel.attr('data-cwadidentifier')) {
                        cwadContainer.toggleClass('hidden');
                        if (cwadContainer.hasClass('hidden')) {
                            $("body").off("mousedown.patient-header-view");
                        } else {
                            $('body').on('mousedown.patient-header-view', function() {
                                $('#cwad-details').addClass('hidden');
                                $("body").off("mousedown.patient-header-view");
                            });
                        }
                    } else {
                        if (cwadContainer.hasClass('hidden')) {
                            cwadContainer.removeClass('hidden');
                        }
                        cwadContainer.attr('data-current-cwad', cwadLabel.attr('data-cwadidentifier'));
                        var cwadDetailConfig = {
                            cwadIdentifier: '',
                            cwadDescription: ''
                        };
                        switch ($(event.target).attr('data-cwadidentifier')) {
                            case 'C':
                                cwadDetailConfig.cwadIdentifier = 'crisis notes';
                                this.cwadDetails.show(this.createCwadDetailView(cwadDetailConfig));
                                break;
                            case 'W':
                                cwadDetailConfig.cwadIdentifier = 'warnings';
                                this.cwadDetails.show(this.createCwadDetailView(cwadDetailConfig));
                                break;
                            case 'A':
                                cwadDetailConfig.cwadIdentifier = 'allergies';
                                this.cwadDetails.show(this.createCwadDetailView(cwadDetailConfig));
                                break;
                            case 'D':
                                cwadDetailConfig.cwadIdentifier = 'directives';
                                cwadDetailConfig.cwadDescription = 'Scanned images of Advance Directives are unavailable in this version of eHMP; please reference CPRS/VistA Imaging for Advance Directives.';
                                this.cwadDetails.show(this.createCwadDetailView(cwadDetailConfig));
                                break;
                            case 'F':
                                cwadDetailConfig.cwadIdentifier = 'patient flags';
                                this.cwadDetails.show(this.createCwadDetailView(cwadDetailConfig));
                                break;
                        }
                        var $body = $('body');
                        var $cwad = $('#cwad-details');

                        $body.on('mousedown.patient-header-view', function() {
                            if (!($cwad.hasClass('hidden'))) {
                                $cwad.addClass('hidden');
                                $body.off("mousedown.patient-header-view");
                                $body.off("keyup.patient-header-view");
                            }
                        });

                        this.$el.find(".cwadLabel").on('mousedown', function(evt) {
                            evt.stopPropagation();
                        });
                        cwadContainer.on('mousedown', function(evt) {
                            evt.stopPropagation();
                        });
                        $body.on('keyup.patient-header-view', function(evt) {
                            if (evt.which === 13 || evt.which === 27) {
                                if (!($cwad.hasClass('hidden'))) {
                                    $cwad.addClass('hidden');
                                    $body.off("mousedown.patient-header-view");
                                    $body.off("keyup.patient-header-view");
                                }
                            }
                        });
                        this.$el.find(".cwadLabel").on('keyup.patient-header-view', function(evt) {
                            if (evt.which === 13 || evt.which === 27) {
                                evt.stopPropagation();
                            }
                        });
                        cwadContainer.on('keyup.patient-header-view', function(evt) {
                            if (evt.which === 13 || evt.which === 27) {
                                evt.stopPropagation();
                            }
                        });
                    }
                }
            }
        }
    });

    return CWADLayoutView;
});