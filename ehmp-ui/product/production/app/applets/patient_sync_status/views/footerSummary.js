define([
    'backbone',
    'marionette',
    'underscore',
    'moment',
    'app/applets/patient_sync_status/views/detailsModalView',
    'app/applets/patient_sync_status/views/detailsModalFooterView',
    'hbs!app/applets/patient_sync_status/templates/footerSummaryTemplate'
], function(
    Backbone,
    Marionette,
    _,
    moment,
    DetailsModalView,
    DetailsModalFooterView,
    FooterSummaryTemplate
) {
    'use strict';
    var VX_SYNC_BASIS_PATIENT_DOMAIN_STAMPTIME = 16051105010000;

    var FooterSummaryView = Backbone.Marionette.ItemView.extend({
        template: FooterSummaryTemplate,
        templateHelpers: {
            facility: function() {
                return ADK.UserService.getUserSession().get('facility');
            }
        },
        behaviors: {
            Tooltip: {},
            FlexContainer: {
                direction: 'row',
                alignItems: 'center',
                container: '> ul'
            }
        },
        ui: {
            'refreshButton': '#refresh-patient-data',
            'syncDetailsButton': '#open-sync-modal',
            'syncIcons': '.patient-status-icon'
        },
        attributes: {
            'id': 'patientSyncStatusRegion'
        },
        // According to DE1442, now the format is anything within hours are going to be displayed as one day ago
        getSecondarySiteTimeSince: function(dateString) {
            var maxTimeZoneOffset = 3; // 3 hours
            var startDate = moment(dateString, 'YYYYMMDDHHmmssSSS');
            var isDataValid = startDate.isValid();
            if (!isDataValid) {
                return '';
            }
            var endDate = moment().subtract(maxTimeZoneOffset, 'hours');
            if (startDate.isAfter(endDate)) {
                return '< 1 day';
            }

            var duration = moment.duration(endDate.diff(startDate));

            var years = parseFloat(duration.asYears());
            var days = parseFloat(duration.asDays());
            var months = parseFloat(duration.asMonths());
            var hours = parseFloat(duration.asHours());
            var min = parseFloat(duration.asMinutes());

            var lYear = 'y';
            var lMonth = 'm';
            var lDay = 'd';
            var lHour = 'h';
            var lMin = '\'';
            var finalResult = '';
            var finalResultText = '<';
            var count = 1;
            var timeUnits = 'h';
            if (months >= 24) {
                count = Math.round(years);
                timeUnits = lYear;
                finalResult = count + lYear;
                finalResultText = count.toString() + ' Year';
            } else if ((months < 24) && (days > 60)) {
                count = Math.round(months);
                timeUnits = lMonth;
                finalResult = count + lMonth;
                finalResultText = count.toString() + ' Month';
            } else if ((days >= 2) && (days <= 60)) {
                count = Math.round(days);
                timeUnits = lDay;
                finalResult = count + lDay;
                finalResultText = count.toString() + ' Day';
            } else if (days < 2) {
                finalResultText += ' 1 Day';
            }
            if (count >= 2) {
                finalResultText = finalResultText + 's';
            }
            return finalResultText;
        },
        initialize: function() {
            this.model = new Backbone.Model();
            this.initInterval = 5000; // 5 seconds
            this.syncCompInterval = 1000 * 60 * 10; // every 10 minutes after sync is completed
            this.syncCompleted = false;
            this.syncStatusDetail = undefined;
            this.diffDetail = undefined;
            this._lock = 0;
            this.currentWorkspaceAndContextModel = ADK.WorkspaceContextRepository.currentWorkspaceAndContext;
            this.listenTo(this.currentWorkspaceAndContextModel, 'change', this.changeInWorkspace);
            this.listenTo(ADK.PatientRecordService.getCurrentPatient(), 'change:pid', this.handlePatientSwitchWhileOnWorkspace);
            ADK.Messaging.getChannel('patient_sync_status').reply('get:simple:sync:status', _.bind(function() {
                return this.model.get('rawData');
            }, this));
        },
        handlePatientSwitchWhileOnWorkspace: function(){
            if(this.currentWorkspaceAndContextModel.get('context') === 'patient'){
                this.updatePatientSyncStatus(true);
                this.startAutoPolling();
            }
        },
        changeInWorkspace: function() {
            if (this.currentWorkspaceAndContextModel.get('context') === 'patient') {
                this.updatePatientSyncStatus(true);
                this.startAutoPolling();
            } else {
                this.model.set({ 'syncStatus': null, 'rawData': null }, { unset: true });
                this.stopAutoPolling();
            }
        },
        onDomRefresh: function() {
            this.ui.syncIcons.tooltip({
                'delay': {
                    'show': 500
                },
                'trigger': 'hover focus'
            });
        },
        onShow: function() {
            this.changeInWorkspace();
        },
        onDestroy: function() {
            this.stopAutoPolling();

            var dataStatusCollectionXhr = _.get(this.dataStatusCollection, 'xhr');
            if (dataStatusCollectionXhr) {
                dataStatusCollectionXhr.abort();
            }

            var syncLoadCollectionXhr = _.get(this.syncLoadCollection, 'xhr');
            if (syncLoadCollectionXhr) {
                syncLoadCollectionXhr.abort();
            }

            var syncDetailCollectionXhr = _.get(this.syncDetailCollection, 'xhr');
            if (syncDetailCollectionXhr) {
                syncDetailCollectionXhr.abort();
            }
            ADK.Messaging.getChannel('patient_sync_status').stopReplying('get:simple:sync:status');
        },
        startAutoPolling: function() {
            this.resetTimeInterval();
        },
        resetTimeInterval: function(timeInterval) {
            if (!timeInterval || timeInterval <= this.initInterval) {
                this.timeInterval = this.initInterval;
            } else {
                this.timeInterval = timeInterval;
            }
            this.stopAutoPolling();
            this.handle = setInterval(_.bind(this.updatePatientSyncStatus, this), this.timeInterval);
        },
        stopAutoPolling: function() {
            if (this.handle) {
                clearInterval(this.handle);
                this.handle = undefined;
            }
        },
        modelEvents: {
            'change:syncStatus': 'render',
            'change:latestSourceStampTime': 'refreshCurrentPatient'
        },
        events: {
            'click @ui.refreshButton': 'refreshStatus',
            'keypress @ui.refreshButton': 'refreshStatus',
            'click @ui.syncDetailsButton': 'showSyncModal'
        },
        refreshCurrentPatient: function() {
            var currentPatient = ADK.PatientRecordService.getCurrentPatient();
            if (currentPatient.has('pid') && ADK.ADKApp.currentScreen.patientRequired === true) {
                ADK.PatientRecordService.refreshCurrentPatient();
            }
        },
        showSyncModal: function(event) {
            event.preventDefault(); //prevent the page from jumping back to the top
            var self = this;
            var view = new DetailsModalView({
                parentView: self
            });
            var modalOptions = {
                'title': 'eHMP Data Sources',
                'size': 'large',
                'footerView': DetailsModalFooterView.getFooterView(view, self)
            };
            var modal = new ADK.UI.Modal({
                view: view,
                options: modalOptions
            });
            modal.show();
        },
        syncAllData: function(refresh) {
            ADK.Messaging.trigger('refresh:allData', {});

            var self = this;
            var fetchOptions = {
                resourceTitle: 'synchronization-load',
                criteria: {
                    forcedSite: true
                },
                cache: false,
                onSuccess: function(collection, resp) {
                    self.updatePatientSyncStatus(refresh);
                    return;
                },
                onError: function(collection, resp) {
                    self.updatePatientSyncStatus(refresh);
                    return;
                }
            };
            this.syncLoadCollection = ADK.PatientRecordService.fetchCollection(fetchOptions);
        },
        updatePatientSyncStatus: function(refresh) {
            var patient = ADK.PatientRecordService.getCurrentPatient();
            if (patient.get('pid') && ADK.ADKApp.currentScreen.patientRequired === true || refresh) {
                var curPatient = patient.get('icn') || patient.get('pid');

                if (curPatient !== this.curPatient) {
                    this.curPatient = curPatient;
                    this.clearCache();
                }
                this.fetchDataStatus(refresh);
            } else {
                this.model.set({ 'syncStatus': null, 'rawData': null }, { unset: true });
            }
        },
        refreshStatus: function() {
            Backbone.fetchCache._cache = {};
            this.refreshPage();
            this.syncAllData(true);
            ADK.Messaging.trigger('refresh-all-patient');
        },
        refreshPage: function() {
            ADK.ResourceService.clearAllCache();

            ADK.Navigation.displayScreen(ADK.Messaging.request('get:current:screen').id);
        },
        clearCache: function() {
            this.syncStatusDetail = undefined;
            this.diffDetail = {};
            this.syncCompleted = undefined;
        },
        fetchDataStatus: function(refresh) {
            if (this._lock > 0) {
                // Too many pending requests... let it reply before making more.
                return;
            }
            this._lock += 1;
            if (!refresh) {
                refresh = false;
            } else {
                this.clearCache();
            }
            var oldStats = this.model.get('syncStatus');
            this.model.set('syncStatus', [{
                'title': 'My Site',
                'hoverTip': ADK.utils.tooltipMappings.patientSync_mySite
            }, {
                'title': 'All VA',
                'hoverTip': ADK.utils.tooltipMappings.patientSync_allVA
            }, {
                'title': 'DoD',
                'hoverTip': ADK.utils.tooltipMappings.patientSync_DoD
            }, {
                'title': 'Communities',
                'hoverTip': ADK.utils.tooltipMappings.patientSync_community
            }]);
            var fetchOptions = {
                resourceTitle: 'synchronization-datastatus',
                cache: false
            };
            var self = this;
            fetchOptions.onError = function(collection, resp) {
                self._lock -= 1;
                Backbone.fetchCache._cache = {};
                var stats = [{
                    'title': 'My Site',
                    'completed': 'error',
                    'hoverTip': ADK.utils.tooltipMappings.patientSync_mySite
                }, {
                    'title': 'All VA',
                    'completed': 'error',
                    'hoverTip': ADK.utils.tooltipMappings.patientSync_allVA
                }, {
                    'title': 'DoD',
                    'completed': 'error',
                    'hoverTip': ADK.utils.tooltipMappings.patientSync_DoD
                }, {
                    'title': 'Communities',
                    'completed': 'error',
                    'hoverTip': ADK.utils.tooltipMappings.patientSync_community
                }];
                self.$('.tooltip').tooltip('hide');
                self.model.set('syncStatus', stats);
                self.model.unset('rawData');
            };
            fetchOptions.onSuccess = function(collection, resp) {
                self.model.set({
                    'rawData': _.get(resp, 'data'),
                    'latestSourceStampTime': _.get(resp, 'data.latestSourceStampTime', '')
                });
                self._lock -= 1;
                var currentSiteCode = ADK.UserService.getUserSession().get('site');
                var statusObject = resp.data;
                var stats = [];
                if (statusObject.VISTA) {
                    var curSite = statusObject.VISTA[currentSiteCode];
                    if (curSite) {
                        var completedStatus = curSite.hasError ? 'error' : curSite.isSyncCompleted;
                        var statInfo = {
                            id: 'MySite',
                            title: 'My Site',
                            screenReaderTitle: 'My Site',
                        };
                        statInfo.isSolrSyncCompleted = curSite.isSolrSyncCompleted || false;
                        ADK.PatientRecordService.getCurrentPatient().set('mySiteSolrSyncCompleted', statInfo.isSolrSyncCompleted);
                        statInfo.completed = completedStatus;
                        statInfo.hoverTip = ADK.utils.tooltipMappings.patientSync_mySite;
                        stats.push(statInfo);
                    }
                }
                if (statusObject.VISTA || statusObject.CDS || statusObject.HDR) {
                    var allVASite = {};
                    if (statusObject.VISTA) {
                        allVASite = _.clone(statusObject.VISTA);
                    }
                    if (statusObject.HDR) {
                        allVASite.HDR = statusObject.HDR;
                    }
                    // push All VA
                    var allVA = {
                        id: 'AllVA',
                        title: 'All VA',
                        screenReaderTitle: 'All V.A.',
                    };
                    var hasError = _.find(allVASite, function(elem) {
                        return elem.hasError && elem.hasError === true;
                    });
                    if (hasError) {
                        allVA.completed = 'error';
                        allVA.timeStamp = moment().format('MM/DD/YYYY HH:mm');
                    } else {
                        allVA.completed = _.every(_.pluck(allVASite, 'isSyncCompleted'));
                        if (allVA.completed && statusObject.HDR) {
                            allVA.timeStamp = self.setSecondarySiteLastUpdateTimeStamp(statusObject.HDR.completedStamp);
                        }
                    }
                    allVA.hoverTip = ADK.utils.tooltipMappings.patientSync_allVA;
                    stats.push(allVA);
                }
                if (statusObject.DOD) {
                    var dodStat = statusObject.DOD;
                    var isComplete = dodStat.hasError ? 'error' : dodStat.isSyncCompleted;
                    var timeStamp = self.setSecondarySiteLastUpdateTimeStamp(dodStat.completedStamp);
                    stats.push({
                        id: 'DoD',
                        title: 'DoD',
                        screenReaderTitle: 'Department of Defense',
                        completed: isComplete,
                        timeStamp: timeStamp,
                        hoverTip: ADK.utils.tooltipMappings.patientSync_DoD,
                        isSolrSyncCompleted: statusObject.DOD.isSolrSyncCompleted || false
                    });
                }
                if (statusObject.VLER) {
                    var vlerStat = statusObject.VLER;
                    var isVlerComplete = vlerStat.hasError ? 'error' : vlerStat.isSyncCompleted;
                    var vlerTimeStamp = self.setSecondarySiteLastUpdateTimeStamp(vlerStat.completedStamp);
                    stats.push({
                        id: 'Communities',
                        title: 'Communities',
                        screenReaderTitle: 'Communities',
                        completed: isVlerComplete,
                        timeStamp: vlerTimeStamp,
                        hoverTip: ADK.utils.tooltipMappings.patientSync_community,
                        isSolrSyncCompleted: statusObject.VLER.isSolrSyncCompleted || false
                    });
                }
                _.each(stats, function(check) {
                    if (check.completed === 'error') {
                        Backbone.fetchCache._cache = {};
                    }
                });

                var areAllVistasSolrSynced = _.every(statusObject.VISTA, 'isSolrSyncCompleted');
                if (statusObject.allSites !== self.syncCompleted || areAllVistasSolrSynced !== self.areAllVistasSolrSynced) {
                    var newInterval = (statusObject.allSites && areAllVistasSolrSynced) ? self.syncCompInterval : self.initInterval;
                    if (!_.isEqual(newInterval, self.timeInterval)) {
                        self.resetTimeInterval(newInterval);
                    }
                }
                self.syncCompleted = statusObject.allSites;
                self.areAllVistasSolrSynced = areAllVistasSolrSynced;
                if (statusObject.allSites) {
                    self.fetchSyncStatusDetail(refresh, stats);
                } else {
                    self.updateSyncStats(stats);
                }
                _.each(stats, function(stat) {
                    var camelId = _.camelCase('syncStatsFor' + stat.id);
                    if (stat.id === 'AllVA') {
                        stat.isSolrSyncCompleted = areAllVistasSolrSynced;
                    }
                    ADK.PatientRecordService.getCurrentPatient().set(camelId, stat);
                });
                var hasSyncError = _.find(statusObject.VISTA, {
                    'hasSyncError': true
                });
                var hasSolrError = _.find(statusObject.VISTA, {
                    'hasSolrError': true
                });
                self.setSolrErrorFlag(!_.isUndefined(hasSolrError));
                self.setSyncErrorFlag(!_.isUndefined(hasSyncError));
                self.setSolrSyncCompletedFlag(areAllVistasSolrSynced);
            };
            this.dataStatusCollection = ADK.PatientRecordService.fetchCollection(fetchOptions);
        },
        setSyncErrorFlag: function(hasSyncError) {
            ADK.PatientRecordService.getCurrentPatient().set('syncError', hasSyncError);
        },
        setSolrErrorFlag: function(hasSolrError) {
            ADK.PatientRecordService.getCurrentPatient().set('solrSyncError', hasSolrError);
        },
        setSolrSyncCompletedFlag: function(areAllVistasSolrSynced) {
            if (areAllVistasSolrSynced) {
                ADK.PatientRecordService.getCurrentPatient().set('solrSyncCompleted', true);
            } else {
                ADK.PatientRecordService.getCurrentPatient().set('solrSyncCompleted', false);
            }
        },
        /**
            This function will set the correct last update timestamp for all secondary sites.
            it will return empty if the stamptime is either undefined or equals vxsync basis timestamp.
        **/
        setSecondarySiteLastUpdateTimeStamp: function(stampTime) {
            var self = this;
            if (_.isUndefined(stampTime) ||
                stampTime === VX_SYNC_BASIS_PATIENT_DOMAIN_STAMPTIME ||
                stampTime === VX_SYNC_BASIS_PATIENT_DOMAIN_STAMPTIME.toString()) {
                return '';
            }
            return self.getSecondarySiteTimeSince(stampTime.toString());
        },
        updateSyncStats: function(stats) {
            var self = this;
            setTimeout(function() {
                if (!_.isEmpty(self.diffDetail)) {
                    self.addNewDataSince(stats);
                }
                self.model.set('syncStatus', stats);
                if (!self.isDestroyed) {
                    self.render();
                }
            }, 500);
        },
        fetchSyncStatusDetail: function(refresh, stats) {
            var fetchOptions = {
                resourceTitle: 'synchronization-status',
                cache: false
            };
            var self = this;
            fetchOptions.onError = function(collection, resp) {
                var stats = [{
                    'title': 'My Site',
                    'completed': 'error',
                    'hoverTip': ADK.utils.tooltipMappings.patientSync_mySite
                }, {
                    'title': 'All VA',
                    'completed': 'error',
                    'hoverTip': ADK.utils.tooltipMappings.patientSync_allVA
                }, {
                    'title': 'DoD',
                    'completed': 'error',
                    'hoverTip': ADK.utils.tooltipMappings.patientSync_DoD
                }, {
                    'title': 'Communities',
                    'completed': 'error',
                    'hoverTip': ADK.utils.tooltipMappings.patientSync_community
                }];
                self.model.set('syncStatus', stats);
            };
            fetchOptions.onSuccess = function(collection, resp) {
                var newSyncStatus = resp.data.syncStatus;
                if (_.isUndefined(self.syncStatusDetail)) {
                    self.syncStatusDetail = newSyncStatus;
                } else {
                    // found out the difference for VistA site only
                    self.generateSyncDetailDiff(newSyncStatus);
                }
                self.updateSyncStats(stats);
                if (refresh) {
                    self.resetTimeInterval(self.syncCompInterval);
                }
            };
            this.syncDetailCollection = ADK.PatientRecordService.fetchCollection(fetchOptions);
        },
        generateSyncDetailDiff: function(newSyncStatus) {
            // assumption, all status is sync completed
            var self = this;
            self.diffDetail = {};
            var oldSources = self.syncStatusDetail.completedStamp.sourceMetaStamp;
            var newSources = newSyncStatus.completedStamp.sourceMetaStamp;
            _.each(newSources, function(value, site) {
                // ignore all secondary sites
                if (site.toUpperCase() === 'DOD' ||
                    site.toUpperCase() === 'VLER' ||
                    site.toUpperCase() === 'HDR') {
                    return;
                }
                // check domains
                if (_.isUndefined(oldSources[site])) {
                    self.diffDetail[site] = self.diffDetail[site] || {};
                    self.diffDetail[site].newDataSince = value.domainMetaStamp.stampTime;
                    return;
                }
                var newDomains = value.domainMetaStamp;
                var oldDomains = oldSources[site].domainMetaStamp;
                _.each(newDomains, function(val, domain) {
                    if (_.isUndefined(oldDomains[domain])) {
                        self.diffDetail[site] = self.diffDetail[site] || {};
                        self.diffDetail[site].domain = self.diffDetail[site].domain || {};
                        self.diffDetail[site].domain[domain] = val.stampTime;
                        return;
                    }
                    self.compareIndividualDomain(oldDomains[domain], val, site, domain);
                });
            });
            self.updateDiffDetails();
        },
        compareIndividualDomain: function(oldDomainData, newDomainData, site, domain) {
            var self = this;
            if ((newDomainData.stampTime !== oldDomainData.stampTime) ||
                (newDomainData.storedCount !== oldDomainData.storedCount)) {
                self.diffDetail[site] = self.diffDetail[site] || {};
                self.diffDetail[site].domain = self.diffDetail[site].domain || {};
                if (_.isUndefined(self.diffDetail[site].domain[domain])) {
                    self.diffDetail[site].domain[domain] = newDomainData.stampTime;
                } else if (self.diffDetail[site].domain[domain] > newDomainData.stampTime) {
                    self.diffDetail[site].domain[domain] = newDomainData.stampTime;
                }
                return;
            }
        },
        updateDiffDetails: function() { // update the diffDetail information.
            if (this.diffDetail) {
                var self = this;
                _.each(self.diffDetail, function(siteVal, site) {
                    if (siteVal.domain) {
                        var newDataSince = _.min(_.values(siteVal.domain));
                        if (siteVal.newDataSince) {
                            siteVal.newDataSince = _.min([newDataSince, siteVal.newDataSince]);
                        } else {
                            siteVal.newDataSince = newDataSince;
                        }
                    }
                });
            }
        },
        addNewDataSince: function(stats) {
            if (_.isArray(stats) && stats.length === 0) {
                return;
            }
            if (stats[0].title !== 'My Site' && stats[0].title !== 'All VA') { //return if no VistA sites
                return;
            }

            var vistASitesDiff = _.omit(this.diffDetail, ['DOD', 'VLER', 'HDR']);
            var currentSiteCode = ADK.UserService.getUserSession().get('site');
            var allVATimeSince = _.min(_.map(vistASitesDiff, function(val, key) {
                return val.newDataSince;
            }));
            if (vistASitesDiff[currentSiteCode]) {
                stats[0].newDataSince = ADK.utils.getTimeSince(vistASitesDiff[currentSiteCode].newDataSince).timeSince;
                stats[1].newDataSince = ADK.utils.getTimeSince(allVATimeSince).timeSince;
            } else {
                stats[1].newDataSince = ADK.utils.getTimeSince(allVATimeSince).timeSince;
            }
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "applicationFooterItem",
        group: "right",
        key: "patientSyncStatus",
        view: FooterSummaryView,
        orderIndex: 1,
        shouldShow: function() {
            return (ADK.UserService.hasPermissions('read-patient-record'));
        }
    });
    ADK.Messaging.trigger('register:component', {
        type: 'applicationFooterItem',
        group: 'right',
        key: 'patientSyncStatusHelp',
        view: Backbone.Marionette.ItemView.extend({
            behaviors: {
                HelpLink: {
                    container: '.patient-sync-status-help-icon-link',
                    mapping: 'status_bar',
                    buttonOptions: {
                        icon: 'fa-question-circle',
                        paddingClass: 'all-padding-no left-margin-xs'
                    }
                }
            },
            templateHelpers: function() {
                var patient = ADK.PatientRecordService.getCurrentPatient();
                return {
                    shouldShow: patient.get('pid') && this.currentWorkspaceAndContextModel.get('context') === 'patient'
                };
            },
            template: Handlebars.compile('{{#if shouldShow}}<div class="patient-sync-status-help-icon-link"></div>{{/if}}'),
            initialize: function() {
                this.currentWorkspaceAndContextModel = ADK.WorkspaceContextRepository.currentWorkspaceAndContext;
                this.listenTo(this.currentWorkspaceAndContextModel, 'change:context', this.render);
            }
        }),
        orderIndex: 10,
        shouldShow: function() {
            return (ADK.UserService.hasPermissions('read-patient-record'));
        }
    });

    return FooterSummaryView;
});
