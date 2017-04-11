/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['api/Messaging', 'jquery', 'handlebars', 'backbone', 'marionette', 'main/ui_components/components', 'api/UIComponents', 'jasminejquery'],
    function(Messaging, $, Handlebars, Backbone, Marionette, UI) {
        var testLayoutView,
            $testLayoutView,
            alertView;

        var bodyViewTemplate = ['<p>Example Message Text</p>'].join('\n');

        var alertConfig = {
            title: "Example Alert",
            icon: "fa-info",
            messageView: Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile(bodyViewTemplate)
            }),
            footerView: Backbone.Marionette.ItemView.extend({
                template: Handlebars.compile([
                    '<button class="cancel-button" type="button">Cancel</button>',
                    '{{ui-button "Continue" classes="continue-button" type="button"}}'
                ].join('\n')),
                events: {
                    'click .cancel-button': function(e) {
                        UI.Alert.hide();
                    },
                    'click .continue-button': function(e) {
                        UI.Alert.hide();
                    }
                }
            })
        };

        var TestLayoutView = Backbone.Marionette.LayoutView.extend({
            template: Handlebars.compile('<test id="alert-region"></test>'),
            regions: {
                'alertRegion': '#alert-region'
            },
            initialize: function() {
                var self = this;
                Messaging.reply('get:adkApp:region', function() {  // component show() expects a region handed back
                    return self.getRegion('alertRegion');
                });
            },
            onRender: function() {
                $('body').append(this.$el);  // for component view to be inserted here on show()
            }
        });

        describe('An alert component', function() {
            afterAll(function() {
                Messaging.reset('get:adkApp:region');  // prevent listener from persisting throughout remaining unit tests
            });
            afterEach(function () {
                UI.Alert.hide();
                $testLayoutView.remove();  // remove #alert-region
            });
            describe('basic', function () {
                beforeEach(function () {
                    testLayoutView = new TestLayoutView();
                    testLayoutView.render();

                    alertView = new UI.Alert(alertConfig);
                    alertView.show();  // inserted into alertRegion of rendered testLayoutView

                    $testLayoutView = testLayoutView.$el;
                });

                it('calling hide removes the alert from view', function() {
                    expect($testLayoutView.find('.alert-container')).toHaveLength(1);
                    UI.Alert.hide();
                    expect($testLayoutView.find('#alert-region')).toBeEmpty();
                });

                it('show() creates correct modal-related classes', function() {
                    expect($testLayoutView.find('.modal .alert-container.modal-dialog .modal-content')).toHaveLength(1);
                });

                it('header contains correct title from config', function() {
                    expect($testLayoutView.find('.alert-container h4.modal-title')).toHaveLength(1);
                    expect($testLayoutView.find('.alert-container h4.modal-title')).toContainText(alertConfig.title);
                });

                it('header contains correct icon from config', function() {
                    expect($testLayoutView.find('.alert-container h4.modal-title i')).toHaveLength(1);
                    expect($testLayoutView.find('.alert-container h4.modal-title i')).toHaveClass(alertConfig.icon);
                });

                it('body contains message from config', function() {
                    expect($testLayoutView.find('.alert-container .modal-content .modal-body')).toHaveLength(1);
                    expect($testLayoutView.find('.alert-container .modal-content .modal-body')).toContainHtml(bodyViewTemplate);
                });
            });
        });
    });