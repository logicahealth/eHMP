define([
    'underscore',
    'backbone',
    'marionette',
    'handlebars',
    'hbs!app/applets/patient_selection/templates/confirmation/patientFlag',
    'app/applets/patient_selection/views/confirmation/confirmationStep',
    'app/applets/patient_selection/views/confirmation/confirmationButton',
    'hbs!app/applets/patient_selection/views/confirmation/flagTemplate'
], function(
    _,
    Backbone,
    Marionette,
    Handlebars,
    FlagsTemplate,
    ConfirmationStep,
    ConfirmationButton,
    FlagTemplate
) {
    'use strict';

    var ScrollToTopLink = Backbone.Marionette.ItemView.extend({
        tagName: 'a',
        className: 'bottom-padding-no bottom-margin-no',
        attributes: {
            href: '#'
        },
        template: Handlebars.compile('Back to top'),
        events: {
            'click': function(e) {
                e.preventDefault();
                this.triggerMethod('scroll:to:top');
            }
        }
    });

    var Flag = Backbone.Marionette.ItemView.extend({
        behaviors: {
            FlexContainer: {
                container: '.panel-heading h4',
                direction: 'row'
            }
        },
        className: ' panel panel-default all-margin-no top-margin-md bottom-margin-md',
        template: FlagTemplate,
        templateHelpers: function() {
            return {
                getCategoryColorClass: this.model.get('category') === 'I (NATIONAL)' ? 'danger' : 'warning'
            };
        }
    });

    var FlagsBody = Backbone.Marionette.CompositeView.extend({
        template: FlagsTemplate,
        childViewContainer: '@ui.FlagsContainer',
        childView: Flag,
        ui: {
            'FlagsContainer': '.flags-wrapper'
        },
        onAttach: function() {
            this.triggerMethod('flags:body:attach');
        }
    });

    var FlagsFooter = ConfirmationButton.extend({
        className: 'confirmation-div',
        buttonText: 'Confirm',
        buttonAction: 'flags',
        buttonId: 'confirmFlaggedPatinetButton',
        onConfirmation: function() {
            this.buttonModel.set('state', 'loading');
            this.triggerMethod('action:complete');
        },
        onRender: function() {
            var buttonState = this.buttonModel.get('state');
            if (_.isEqual(buttonState, 'disabled')) {
                this.$el.removeAttr('aria-live');
            } else {
                this.$el.attr('aria-live', 'assertive');
            }
        }
    });

    var FlagsConfirmation = ConfirmationStep.extend({
        skipAttribute: 'confirmed_flags',
        currentStepTitle: 'flags',
        ui: _.extend({}, ConfirmationStep.prototype.ui, {
            'BodyContainer': '.confirmation-body-container'
        }),
        Body: FlagsBody,
        Footer: FlagsFooter,
        childEvents: _.extend(_.get(ConfirmationStep, 'prototype.childEvents', {}), {
            'flags:body:attach': '_addFlagsScrollConfirmation'
        }),
        initialize: function() {
            this.buttonModel = new ConfirmationButton.prototype.ButtonModel();
            this.collection = new Backbone.Collection();
            this.scrollRegionManager = new Backbone.Marionette.RegionManager();
        },
        initShow: function() {
            if (!!_.get(this.model.get('patientRecordFlag'), 'length')) {
                this._setFlags();
                this.showAll();
            } else {
                this.goToNextStep();
            }
        },
        _setFlags: function() {
            if (this.model.get('patientRecordFlag') instanceof Backbone.Collection) {
                this.collection.set(this.model.get('patientRecordFlag').models);
            } else {
                this.collection.set(this.model.get('patientRecordFlag'));
            }
        },
        showBody: function() {
            ConfirmationStep.prototype.showBody.call(this, { collection: this.collection });
        },
        showFooter: function() {
            ConfirmationStep.prototype.showFooter.call(this, { buttonModel: this.buttonModel });
        },
        completeStepAction: function() {
            // will complete patient selection workflow
            this.model.set(this.getOption('skipAttribute'), true);
            this.goToNextStep();
        },
        onAllFlagsScrolled: function() {
            this.buttonModel.unset('state');
        },
        onAllFlagsUnscrolled: function() {
            this.buttonModel.set('state', 'disabled');
        },
        _stopListeningToScroll: function() {
            this.ui.BodyContainer.off('scroll.' + this.cid);
        },
        _checkScrollPosition: function() {
            if ((this.ui.BodyContainer.height() + this.ui.BodyContainer[0].scrollTop) >= (this.ui.BodyContainer[0].scrollHeight - this.scrollToTopView.$el.height())) {
                this.triggerMethod('all:flags:scrolled');
                this._stopListeningToScroll();
            }
        },
        _addFlagsScrollConfirmation: function() {
            this._cleanUpScrollRegion();
            if (this.collection.length && this.ui.BodyContainer.outerHeight() < this.ui.BodyContainer[0].scrollHeight) {
                this.triggerMethod('all:flags:unscrolled');
                this.ui.BodyContainer.append('<div class="scroll-to-top-container left-padding-md"></div>');
                this.scrollRegionManager.addRegion('ScrollToTop', '.scroll-to-top-container');
                this.scrollToTopView = new ScrollToTopLink();
                this.scrollRegionManager.get('ScrollToTop').show(this.scrollToTopView);
                this.listenTo(this.scrollToTopView, 'scroll:to:top', function() {
                    this.ui.BodyContainer.scrollTop(0);
                    this.ui.BodyContainer.focus();
                });
                this.ui.BodyContainer.on('scroll.' + this.cid, _.throttle(_.bind(this._checkScrollPosition, this), 100));
            }
        },
        _cleanUpScrollRegion: function() {
            var backToTopRegion = this.scrollRegionManager.get('ScrollToTop');
            var $backTotopContainer = this.ui.BodyContainer.find('> .scroll-to-top-container');
            if (_.result(backToTopRegion, 'hasView') && !!$backTotopContainer.length) {
                this.scrollRegionManager.removeRegion('ScrollToTop');
                $backTotopContainer.remove();
            }
        },
        onBeforeDestroy: function() {
            this._stopListeningToScroll();
            if (this.scrollRegionManager) this.scrollRegionManager.destroy();
        }
    });
    return FlagsConfirmation;
});
