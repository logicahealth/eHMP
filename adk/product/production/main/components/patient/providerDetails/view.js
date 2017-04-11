define([
    "backbone",
    "marionette",
    "underscore",
    "handlebars",
    "api/Messaging",
    "api/ResourceService",
    "api/SessionStorage",
    "hbs!main/components/patient/providerDetails/template",
    "main/components/patient/util/modelUtil",
    "hbs!main/components/patient/providerDetails/patientCareOtherSiteTemplate",
    "hbs!main/components/patient/providerDetails/patientCareOtherSiteRow"
], function(Backbone, Marionette, _, Handlebars, Messaging, ResourceService, SessionStorage, Template, modelUtil, CareOtherSites, CareOtherRow) {
    "use strict";

    var VisitContextView = Backbone.Marionette.LayoutView.extend({
        template: Template,
        templateHelpers: function() {
            return {
                'isInpatient': this.model.isInpatient,
                hasMhInfo: function() {
                    var mhInfo = this.teamInfo && this.teamInfo.mhCoordinator;
                    return mhInfo && ((mhInfo.mhTeam && mhInfo.mhTeam.toLowerCase() !== 'unassigned') ||
                        (mhInfo.name && mhInfo.name !== 'unassigned'));
                }
            };
        },
        events: {},
        modelEvents: {
            "change": "render"
        },
        onRender: function(){
            this.demoRows = new Backbone.Model();
            this.configureDemoRows();
        },
        configureDemoRows: function() {
            //need data to do this
            var primaryProviderRow = '.primary-provider',
                primaryAssocProviderRow = '.primary-assoc-provider',
                mhTreatmentTeamRow = '.mh-treatment-team',
                mhCoordinatorRow = '.mh-coordinator',
                inpatientAttendingProviderRow = '.inpatient-attending-provider',
                inpatientProviderRow = '.inpatient-provider',
                pid = ResourceService.patientRecordService.getCurrentPatient().get('pid'),
                sites = SessionStorage.get.sessionModel('patient-domain').get('data'),
                currentSiteCode = SessionStorage.get.sessionModel('user').get('site'),
                self = this,
                popopts = {
                    'halign': 'right',
                    'placement': 'bottom'
                    //'trigger': 'focus' //can't use focus until the global problems are fixed with popovers
                },
                RowView = Marionette.ItemView.extend({
                    tagName: 'tr',
                    template: CareOtherRow
                }),
                PopUpView = Marionette.CompositeView.extend({
                    childView: RowView,
                    template: CareOtherSites,
                    childViewContainer: 'tbody'
                });

            //each row is a view with model containing an array of demographic history data
            _.each(sites, function(site) {
                var teamInfo = site.teamInfo,
                    siteCode = site.pid.split(';')[0];

                // Skip if there is no team info or if it's the same site.
                if (!teamInfo || siteCode.toLowerCase() === currentSiteCode.toLowerCase()) {
                    return;
                }

                if (teamInfo.primaryProvider && teamInfo.primaryProvider.name !== 'unassigned') {
                    if (!self.demoRows.get(primaryProviderRow)) {
                        self.demoRows.set(primaryProviderRow, new PopUpView({
                            collection: new Backbone.Collection()
                        }));
                    }
                    self.demoRows.get(primaryProviderRow).collection.add(
                        modelUtil.addFacilityName(site.pid, new Backbone.Model(teamInfo.primaryProvider))
                    );
                }
                if (teamInfo.associateProvider && teamInfo.associateProvider.name !== 'unassigned') {
                    if (!self.demoRows.get(primaryAssocProviderRow)) {
                        self.demoRows.set(primaryAssocProviderRow, new PopUpView({
                            collection: new Backbone.Collection()
                        }));
                    }
                    self.demoRows.get(primaryAssocProviderRow).collection.add(
                        modelUtil.addFacilityName(site.pid, new Backbone.Model(teamInfo.associateProvider))
                    );
                }
                if (teamInfo.attendingProvider && teamInfo.attendingProvider.name !== 'unassigned') {
                    if (!self.demoRows.get(inpatientAttendingProviderRow)) {
                        self.demoRows.set(inpatientAttendingProviderRow, new PopUpView({
                            collection: new Backbone.Collection()
                        }));
                    }
                    self.demoRows.get(inpatientAttendingProviderRow).collection.add(
                        modelUtil.addFacilityName(site.pid, new Backbone.Model(teamInfo.attendingProvider))
                    );
                }
                if (teamInfo.inpatientProvider && teamInfo.inpatientProvider.name !== 'unassigned') {
                    if (!self.demoRows.get(inpatientProviderRow)) {
                        self.demoRows.set(inpatientProviderRow, new PopUpView({
                            collection: new Backbone.Collection()
                        }));
                    }
                    self.demoRows.get(inpatientProviderRow).collection.add(
                        modelUtil.addFacilityName(site.pid, new Backbone.Model(teamInfo.inpatientProvider))
                    );
                }
                if (teamInfo.mhCoordinator && teamInfo.mhCoordinator.mhTeam && teamInfo.mhCoordinator.mhTeam !== 'unassigned') {
                    if (!self.demoRows.get(mhTreatmentTeamRow)) {
                        self.demoRows.set(mhTreatmentTeamRow, new PopUpView({
                            collection: new Backbone.Collection()
                        }));
                    }
                    var newModel = new Backbone.Model(teamInfo.mhCoordinator);
                    newModel.set('name', teamInfo.mhCoordinator.mhTeam);
                    newModel.set('officePhone', teamInfo.mhCoordinator.mhTeamOfficePhone);
                    // MH teams don't have pagers.
                    newModel.set('analogPager', undefined);
                    newModel.set('digitalPager', undefined);
                    self.demoRows.get(mhTreatmentTeamRow).collection.add(
                        modelUtil.addFacilityName(site.pid, newModel)
                    );
                }
                if (teamInfo.mhCoordinator && teamInfo.mhCoordinator.name !== 'unassigned') {
                    if (!self.demoRows.get(mhCoordinatorRow)) {
                        self.demoRows.set(mhCoordinatorRow, new PopUpView({
                            collection: new Backbone.Collection()
                        }));
                    }
                    self.demoRows.get(mhCoordinatorRow).collection.add(
                        modelUtil.addFacilityName(site.pid, new Backbone.Model(teamInfo.mhCoordinator))
                    );
                }
            });

            _.each(this.demoRows.attributes, function(row, key) {
                row.render();
                self.addAttributes(key);
                var me = self.$(key);
                me.popup(_.extend(popopts, {
                    content: row.$el
                }));
                //this is a hack to make up for the fact we can't rely on built in events due to a conflict elsewhere in the app
                //when this gets fixed go back to the template and make them data-toggle="popover"
                me.on('show.bs.popover', function(e) {
                    self.$('[data-toggle="popup"]').not(this).popup('hide');
                });
                me.on('hide.bs.popover', function(e) {
                    me.removeClass('toolbarActive');
                });
                me.on('focusin', function() {
                    me.addClass('toolbarActive');
                });
            });

            this.$('[data-toggle=popup]').on('keydown', function(e) {
                var k = e.which || e.keydode;
                if (!/(13|32)/.test(k)) return;
                $(this).trigger('click');
                e.preventDefault();
                e.stopPropagation();
            });
        },
        addAttributes: function(selector) {
            var el = this.$(selector);
            el.attr('tabindex', '0');
            el.attr('data-toggle', 'popup');
            el.attr('role', 'button');
            el.attr('aria-haspopup', true);
            el.attr('aria-expanded', false);
            el.on('shown.bs.popover', function(e) {
                el.attr('aria-expanded', true);
            });
            el.on('hidden.bs.popover', function(e) {
                el.attr('aria-expanded', false);
            });
            el.addClass('selectable');
        },
        onDestroy: function() {
            _.each(this.demoRows.attributes, function(row) {
                row.destroy();
            });
            this.demoRows.destroy();
        }
    });

    return VisitContextView;
});