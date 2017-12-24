define([
    'backbone',
    'marionette',
    'underscore',
    'app/applets/global_datepicker/views/gdrSelectorView',
    'app/applets/global_datepicker/views/spikeLineView',
    'app/applets/global_datepicker/views/trendHistoryView',
    'hbs!app/applets/global_datepicker/templates/layoutTemplate',
    'hbs!app/applets/global_datepicker/templates/gdrHeaderMinimizedTemplate',
    'app/applets/global_datepicker/utils/parseEvents'
], function(
    Backbone,
    Marionette,
    _,
    GdrSelector,
    SpikeLineView,
    TrendHistoryView,
    LayoutTemplate,
    GdrMinimizedHeader,
    parseEvents
) {
    "use strict";

    var GdrMinimizedHeaderView = Marionette.ItemView.extend({
        template: GdrMinimizedHeader,
        modelEvents: {
            'change': 'render'
        },
        initialize: function() {
            this.model = ADK.SessionStorage.get.sessionModel('globalDate');
        }
    });
    var GlobalDateLayoutView = Backbone.Marionette.LayoutView.extend({
        behaviors: {
            Tooltip: {}
        },
        ui: {
            'NavigationBarContainer':'.context-navigation-bar',
            'Button': '.global-date-picker-open-popover--button',
            'Spikeline': '#gdr-spikeline',
            'Compact': '#globalDatePicker-compact',
            'GlobalDateContainer': '.global-date-picker-popover-region',
            'DateRegionMinimized': '#date-region-minimized',
            'HiddenDiv': '.global-date-picker-popover-container'
        },
        template: LayoutTemplate,
        className: 'global-date-picker left-padding-xs percent-height-100',
        regions: {
            gdrSpikeline: '@ui.Spikeline',
            globalDateRegion: '@ui.GlobalDateContainer',
            dateRegionMinimized: '@ui.DateRegionMinimized'
        },
        events: {
            'click @ui.Button': 'togglePopover',
            'click .global-date-picker-popover-container:not(".hidden")': 'closePopover',
            'keydown @ui.Compact': 'handleEnterOrSpaceBar',
            'click @ui.Spikeline': 'togglePopover',
            'keydown @ui.Spikeline': 'handleEnterOrSpaceBar'
        },
        initialize: function() {
            this.timelineSummaryHasBeenInitialized = false;

            this.timelineCollection = ADK.PatientRecordService.createEmptyCollection();

            this.globalDatePicker = new GdrSelector({
                sharedCollection: this.timelineCollection
            });
            this.gdrMinimizedHeader = new GdrMinimizedHeaderView({
                dateModel: this.globalDatePicker.model
            });
            this.spikeLineView = new SpikeLineView({
                sharedCollection: this.timelineCollection
            });

            this.currentWorkspaceModel = ADK.WorkspaceContextRepository.currentWorkspaceAndContext;
            this.listenTo(this.currentWorkspaceModel, 'change:workspace', this.determineIfGlobalDatePickerIsShown);
        },
        childEvents: {
            'close:expanded:gdt': function() {
                this.$('.global-date-picker-popover-container').toggleClass('hidden');
                this.$('#date-region-minimized').focus();
            }
        },
        determineIfGlobalDatePickerIsShown: function(){
            var currentScreenModel = ADK.WorkspaceContextRepository.currentWorkspace;
            var showGlobalDatepicker = currentScreenModel.get('globalDatepicker');
            showGlobalDatepicker = _.isBoolean(showGlobalDatepicker) ? showGlobalDatepicker : true;
            this.toggleGlobalDate(showGlobalDatepicker);
        },
        toggleGlobalDate: function(boolean) {
            if (boolean) {
                this.gdrMinimizedHeader.$el.show();
                this.spikeLineView.$el.show();
                this.ui.DateRegionMinimized.removeClass('hidden').tooltip();
            } else {
                this.gdrMinimizedHeader.$el.hide();
                this.spikeLineView.$el.hide();
                this.ui.DateRegionMinimized.addClass('hidden');
                this.ui.HiddenDiv.addClass('hidden');
            }
        },
        onBeforeShow: function() {
            var fetchOptions = {
                resourceTitle: 'global-timeline-getTimeline',
                pageable: false,
                cache: true,
                viewModel: {
                    parse: parseEvents
                }
            };
            ADK.PatientRecordService.fetchCollection(fetchOptions, this.timelineCollection);
        },
        onShow: function() {
            this.dateRegionMinimized.show(this.gdrMinimizedHeader);
            this.globalDateRegion.show(this.globalDatePicker);
            this.gdrSpikeline.show(this.spikeLineView);
            this.determineIfGlobalDatePickerIsShown();
        },
        handleEnterOrSpaceBar: function(event) {
            var keyCode = event ? (event.which ? event.which : event.keyCode) : event.keyCode;

            if (keyCode == 13 || keyCode == 32) {
                this.togglePopover();
            }
        },
        closePopover: function(e){
            var orinialEventTraget = e.originalEvent.target;
            if ($(orinialEventTraget).hasClass('global-date-picker-popover-container') && !$(orinialEventTraget).hasClass('hidden')){
                this.togglePopover();
            }
        },
        togglePopover: function() {
            this.globalDatePicker.getTimelineSummaryView();

            var hiddenDiv = this.ui.HiddenDiv;
            hiddenDiv.toggleClass('hidden');

            if (hiddenDiv.hasClass('hidden')) {
                $('.cover-sheet .datepicker').hide();
            } else {
                if (this.globalDatePicker !== undefined && this.globalDatePicker !== null) {
                    this.globalDatePicker.resetToCurrentGlbalDate();
                }
                this.$el.find('#allRangeGlobal').focus();
            }

            $('body').on('mousedown.nav-view', _.bind(this.bodyMousedown, this));
            hiddenDiv.on('mousedown.nav-view', _.bind(this.hiddenDivMousedown, this));
        },
        hiddenDivMousedown: function(evt) {
            var globalFromDate = this.$('.input-group.date#customDateFromGlobal');
            var globalToDate = this.$('.input-group.date#customDateToGlobal');

            if (globalFromDate !== undefined && globalFromDate !== null) {
                globalFromDate.datepicker('hide');
            }

            if (globalToDate !== undefined && globalToDate !== null) {
                globalToDate.datepicker('hide');
            }

            evt.stopPropagation();
        },
        bodyMousedown: function(evt) {
            if ($('#mainModal').length === 0) {
                if (!(this.ui.HiddenDiv.hasClass('hidden'))) {
                    this.ui.HiddenDiv.toggleClass('hidden');
                    $('body').off('mousedown', this.bodyMousedown);
                }
            }
        },
        onBeforeDestroy: function() {
            $('body').off('mousedown.nav-view');
            this.ui.HiddenDiv.off('mousedown.nav-view', this.hiddenDivMousedown);
        }
    });

    ADK.Messaging.trigger('register:component', {
        type: "contextHeaderItem",
        group: ["patient", "patient-right"],
        key: "globalDatePicker",
        view: GlobalDateLayoutView,
        orderIndex: 3
    });


    var applet = {
        id: "global_datepicker",
        viewTypes: [{
            type: 'selector',
            view: GlobalDateLayoutView,
            chromeEnabled: false
        }, {
            type: 'spikeLine',
            view: SpikeLineView,
            chromeEnabled: false
        }, {
            type: 'trendHistory',
            view: TrendHistoryView,
            chromeEnabled: false
        }],
        defaultViewType: 'selector'
    };

    return applet;
});