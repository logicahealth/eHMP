/**
 * Created by alexluong on 7/13/15.
 */

/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['api/Messaging', 'jquery', 'handlebars', 'backbone', 'marionette', 'main/ui_components/components', 'api/UIComponents', 'jasminejquery'],
    function(Messaging, $, Handlebars, Backbone, Marionette, UI) {
        var testLayoutView,
            $testLayoutView,
            modalShowView,
            modalView;

        var headerViewTemplate = "<h1>meatloaf</h1><button type='button' class='btn btn-default'>Previous</button><button type='button' class='btn btn-default'>Next</button>";
        var bodyViewTemplate = "'<div>lasagna</div>'";
        var footerViewTemplate = "<button type='button' class='btn btn-default' data-dismiss='modal'>Exit</button>";

        var HeaderView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile(headerViewTemplate)
        });
        var ModalShowView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile(bodyViewTemplate)
        });
        var FooterView = Backbone.Marionette.ItemView.extend({
            template: Handlebars.compile(footerViewTemplate)
        });
        var modalOptions = {
            //title: '',
            //size: 'medium',
            //backdrop: false,
            //keyboard: true,
            //callShow: true
            //headerView: false,
            //footerView: FooterView
        };

        var TestLayoutView = Backbone.Marionette.LayoutView.extend({
            template: Handlebars.compile('<test id="modal-region"></test>'),
            regions: {
                'modalRegion': '#modal-region'
            },
            initialize: function() {
                var self = this;
                Messaging.reply('get:adkApp:region', function() {  // component show() expects a region handed back
                    return self.getRegion('modalRegion');
                });
            },
            onRender: function() {
                $('body').append(this.$el);  // for component view to be inserted here on show()
            }
        });

        function showModal(modalOptions) {
            modalView = new UI.Modal({ view: modalShowView, options: modalOptions });
            modalView.show();  // inserted into modalRegion of rendered testLayoutView

            $testLayoutView = testLayoutView.$el;
            $testLayoutView.find('.modal.fade').removeClass('fade');  // don't have to wait for Modal.hide()
        }

        describe('A modal component', function() {
            afterAll(function() {
                Messaging.reset('get:adkApp:region');  // prevent listener from persisting throughout remaining unit tests
            });
            afterEach(function() {
                UI.Modal.hide();  // remove #mainModalDialog
                $testLayoutView.remove();  // remove #modal-region
                //$( "div[class|='modal'],test[id|='modal']" ).remove();  // same as two above
            });

            describe('basic', function() {
                beforeEach(function() {
                    testLayoutView = new TestLayoutView();
                    testLayoutView.render();
                    modalShowView = new ModalShowView();
                });

                it('hide() removes the modal from view', function() {
                    showModal(modalOptions);

                    var spy = spyOnEvent('#mainModal', 'hidden.bs.modal');

                    UI.Modal.hide();

                    expect(spy).toHaveBeenTriggered();
                    expect($testLayoutView.find('#modal-region')).toBeEmpty();
                });

                it('show() creates correct modal-related classes and ids', function() {
                    showModal(modalOptions);

                    expect($testLayoutView.find('.modal .modal-dialog .modal-content')).toHaveLength(1);
                    expect($testLayoutView.find('.modal-content #modal-header')).toHaveLength(1);
                    expect($testLayoutView.find('.modal-content #modal-body')).toHaveLength(1);
                });

                describe('options', function() {
                    describe('headerView', function () {
                        it('false: modal contains header built from modalOptions.title', function () {
                            modalOptions.headerView = false;
                            showModal(modalOptions);
                            expect($testLayoutView.find('.modal-title')).toContainText(modalOptions.title);

                        });
                        it('true: modal contains header built from HeaderView', function () {
                            modalOptions.headerView = HeaderView;

                            showModal(modalOptions);
                            expect($testLayoutView.find('.modal-header')).toContainHtml(headerViewTemplate);
                        });
                    });

                    describe('footerView', function() {
                        it('false: modal contains .modal-footer built from default', function () {
                            modalOptions.footerView = false;
                            showModal(modalOptions);
                            expect($testLayoutView.find('.modal-content #modal-footer')).toHaveLength(1);
                            expect($testLayoutView.find('.modal-footer')).toContainHtml('<button type="button" data-dismiss="modal" id="modal-close-button" title="Press enter to close." class="btn btn-default btn-sm">Close</button>');
                        });
                        it('true: modal contains .modal-footer built from FooterView', function () {
                            modalOptions.footerView = FooterView;
                            showModal(modalOptions);
                            expect($testLayoutView.find('.modal-content #modal-footer')).toHaveLength(1);
                            expect($testLayoutView.find('.modal-footer')).toContainHtml(footerViewTemplate);
                        });
                        it('none: modal contains no footer', function () {
                            modalOptions.footerView = 'none';
                            showModal(modalOptions);
                            expect($testLayoutView.find('#modal-footer')).toHaveClass('hidden');
                        });
                    });

                    describe('backdrop', function() {
                        it('false: modal does not contain backdrop', function () {
                            modalOptions.backdrop = false;
                            showModal(modalOptions);
                            expect($('body').find('.modal-backdrop')).toHaveLength(0);
                        });
                    });
                });
            });
        });
    });