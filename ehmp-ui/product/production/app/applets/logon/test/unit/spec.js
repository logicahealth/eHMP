/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, afterEach, spyOn, handlebars, ADK, jasmine, document, window */

'use strict';

// Jasmine Unit Testing Suite
define(["test/stubs",
    "jquery",
    "backbone",
    "marionette",
    "jasminejquery",
    'app/applets/logon/applet'
], function(Stubs, $, Backbone, Marionette, JasmineJquery, login) {

    describe('A logon page', function() {
        var config = login;
        var View = config.getRootView();
        var regionManager = new Backbone.Marionette.RegionManager();
        var testRegion;

        beforeEach(function() {
            $('body').append('<div class="testRegion"/>');
            testRegion = regionManager.addRegion('testRegion', Backbone.Marionette.Region.extend({
                el: '.testRegion'
            }));

            //this will affect every test in this 'desribe' until explicitly set to something else
            spyOn(ADK.ResourceService, 'fetchCollection').and.callFake(function(options, coll) {
                coll.set([{
                    division: 1,
                    siteCode: 10,
                    message: 'test1'
                }, {
                    division: 2,
                    siteCode: 20,
                    message: 'test2'
                }]);
                coll.trigger('read:success', coll, {}, options);
            });
        });

        afterEach(function() { //avoid leaking into other tests
            if (regionManager.get('testRegion')) regionManager.removeRegion('testRegion');
            $('body > .testRegion').remove();
        });

        //trivial
        it('has the correct applet id', function() {
            expect(config.id).toEqual('logon');
        });

        describe('is able to create a view', function() {
            it('which will go through a full lifecycle', function() {
                var view = new View();
                testRegion.show(view);
                expect(view._isRendered).toBe(true);
                testRegion.empty();
                expect($('.testRegion')).toBeEmpty();
            });

            describe('which', function() {
                var view;
                var currentView;

                beforeEach(function() {
                    spyOn(Stubs.spies, 'messagingGet').and.callThrough();
                    spyOn(ADK.utils.helpUtils, 'getUrl').and.callThrough();
                    view = new View();
                    testRegion.show(view);
                    currentView = view.getRegion('loginFormRegion').currentView;
                });

                it('which has the Tooltip behavior', function() {
                    expect(!!view.behaviors.Tooltip).toBe(true);
                });

                it('adds a class to body to determine background image', function() {
                    var node = $('body[class*=bg]');
                    expect(node.length).toEqual(1);
                });

                it('requests data from ADK to display version and help url', function() {
                    expect(Stubs.spies.messagingGet).toHaveBeenCalled();
                    expect(ADK.utils.helpUtils.getUrl).toHaveBeenCalled();
                    expect($('.login-container-footer p.text-center').text()).toEqual('EHMP overall_version');
                    expect($('#linkHelp-logon').attr('href')).toEqual('logon');
                });

                it('has a region ', function() {
                    var region = view.getRegion('loginFormRegion');
                    expect(!!region).toBe(true);
                });
                describe('that contains a view', function() {
                    it('which is a form view', function() {
                        expect(currentView instanceof ADK.UI.Form).toBe(true);
                    });
                    it('that has a model', function() {
                        expect(currentView.model instanceof Backbone.Model).toBe(true);
                    });
                    it('is capable of a lifecycle', function() {
                        spyOn(currentView, 'onDestroy');

                        describe('with a', function() {
                            beforeEach(function() {
                                spyOn(currentView, 'updateDisabled');
                                window.localStorage.setItem('division', 'test_fetch');
                            });

                            it('successful fetch', function() {
                                currentView.onShow();
                                expect(currentView.updateDisabled).toHaveBeenCalledWith(false);
                                //verify we can read from local storage
                                expect(currentView.model.get('selectedFacility')).toEqual('test_fetch');
                            });
                            it('unsuccessful fetch', function() {
                                var status = 'some_error';
                                spyOn(ADK.ResourceService, 'fetchCollection').and.callFake(function(options, coll) {
                                    coll.trigger('read:error', coll, {
                                        status: status
                                    });
                                });
                                currentView.onShow();
                                expect(currentView.updateDisabled).toHaveBeenCalledWith(true);
                                expect(currentView.model.get('errorMessage')).toEqual('Error loading facility list. Status code: ' + status);
                            });
                        });

                        view.destroy();
                        expect(currentView.onDestroy).toHaveBeenCalled();
                    });

                    var login = function() {
                        currentView.model.set({
                            'selectedFacilityDivision': true,
                            'selectedFacilitySite': true,
                            'verifyCode': true,
                            'accessCode': true
                        });
                        currentView.$el.trigger('submit');
                    };

                    describe('who\'s model has', function() {
                        var model, errorModel, msg;
                        beforeEach(function() {
                            model = currentView.model;
                            errorModel = model.errorModel;
                            model.clear();
                            currentView.clearErrors();
                        });

                        it('validation erorr for no fields set', function() {
                            msg = model.validate(model.attributes);
                            expect(!!errorModel.get('selectedFacility') && !!errorModel.get('accessCode') && !!errorModel.get('verifyCode')).toBe(true);
                        });

                        it('validation error for only selectedFacilityDivision, selectedFacilitySite set', function() {
                            model.set({
                                'selectedFacilityDivision': true,
                                'selectedFacilitySite': true
                            });
                            msg = model.validate(model.attributes);
                            expect(!errorModel.get('selectedFacility') && !!errorModel.get('accessCode') && !!errorModel.get('verifyCode')).toBe(true);

                        });
                        it('validation error for selectedFacilityDivision, selectedFacilitySite, and accessCode set', function() {
                            model.set({
                                'selectedFacilityDivision': true,
                                'selectedFacilitySite': true,
                                'accessCode': true
                            });
                            msg = model.validate(model.attributes);
                            expect(!errorModel.get('selectedFacility') && !errorModel.get('accessCode') && !!errorModel.get('verifyCode')).toBe(true);
                        });
                        it('no validation error when selectedFacilityDivision, selectedFacilitySite, accessCode, and verifyCode set', function() {
                            errorModel.clear();
                            model.set({
                                'selectedFacilityDivision': true,
                                'selectedFacilitySite': true,
                                'verifyCode': true,
                                'accessCode': true
                            });
                            msg = model.validate(model.attributes);
                            expect(!errorModel.get('selectedFacility') && !errorModel.get('accessCode') && !errorModel.get('verifyCode')).toBe(true);
                        });
                    });

                    describe('that has DOM events', function() {
                        it('for clearing errors', function() {
                            currentView.model.errorModel.set('test', 'something');
                            currentView.$('.form-group').first().trigger('propertychange');
                            expect(!!currentView.model.errorModel.get('test')).toBe(false);

                            currentView.model.errorModel.set('something', 'something');
                            currentView.$('.control').first().trigger('input');
                            expect(!!currentView.model.errorModel.get('test')).toBe(false);
                        });
                        describe('for logging in', function() {
                            it('where the model is invalid', function() {
                                spyOn(currentView, 'setSignInButtonAuthenticating');
                                spyOn(currentView, 'resetSignInButton');
                                currentView.$el.trigger('submit');
                                expect(!!currentView.model.get('errorMessage')).toBe(true);
                                expect(currentView.setSignInButtonAuthenticating).toHaveBeenCalled();
                                expect(currentView.resetSignInButton).toHaveBeenCalled();
                            });
                            it('where the model is valid', function() {
                                spyOn(ADK.UserService, 'authenticate').and.callThrough();

                                //prevent onSuccessfulLogin for executing and emptying out the model and element class
                                currentView.onSuccessfulLogin = jasmine.createSpy('onSuccessfulLogin');

                                //validate focus by seeing what object focus was issued against
                                var $focusEls = [];
                                spyOn($.fn, 'focus').and.callFake(function() {
                                    $focusEls.push(this);
                                });
                                login();
                                expect(ADK.UserService.authenticate).toHaveBeenCalled();
                                expect(currentView.$('#screenReaderAuthenticating')).toHaveClass('sr-only');
                                expect(currentView.onSuccessfulLogin).toHaveBeenCalled();
                                expect(currentView.$('#screenReaderAuthenticating')).toEqual(_.last($focusEls));
                            });
                        });
                    });

                    describe('that has modelEvents', function() {
                        it('for clearing errors', function() {
                            currentView.model.errorModel.set('something', 'something');
                            currentView.model.set('accessCode', 'test');
                            expect(!!currentView.model.errorModel.get('something')).toBe(false);

                            currentView.model.errorModel.set('something', 'something');
                            currentView.model.set('verifyCode', 'test');
                            expect(!!currentView.model.errorModel.get('something')).toBe(false);
                        });

                        describe('for setting selected facility where division is', function() {
                            beforeEach(function() {
                                spyOn(currentView, 'clearErrors').and.callThrough();
                                currentView.model.set({
                                    selectedFacilitySite: 'test',
                                    selectedFacilityDivision: 'test'
                                });
                            });

                            it('not found', function() {
                                currentView.model.set('selectedFacility', 'no match');
                                expect(currentView.clearErrors).toHaveBeenCalled();
                                expect(!!currentView.model.get('selectedFacilityDivision') && !!currentView.model.get('selectedFacilitySite')).toBe(false);

                            });

                            it('found', function() {
                                currentView.model.set('selectedFacility', 1);
                                expect(currentView.clearErrors).toHaveBeenCalled();
                                expect(currentView.model.get('selectedFacilityDivision')).toEqual(1);
                                expect(currentView.model.get('selectedFacilitySite')).toEqual(10);
                            });
                        });
                    });

                    describe('which processes login', function() {
                        it('successfully', function() {
                            currentView.model.set('selectedFacility', 'test_login');
                            login();
                            expect(ADK.ADKApp.initAllRouters).toHaveBeenCalled();
                            expect(ADK.Navigation.navigate).toHaveBeenCalled();
                            expect(ADK.CCOWService.start).toHaveBeenCalled();
                            expect(window.localStorage.getItem('division')).toEqual('test_login');
                        });

                        it('with errors', function() {
                            spyOn(currentView, 'onFailedLogin').and.callThrough();
                            spyOn(console, 'error');
                            spyOn(currentView, 'errorOnLogin').and.callThrough();
                            spyOn(currentView, 'resetSignInButton').and.callThrough();
                            var $focusEls = [];
                            spyOn($.fn, 'focus').and.callFake(function() {
                                $focusEls.push(this);
                            });
                            ADK.UserService.authenticate = Stubs.authInvalid;
                            login();
                            expect(currentView.onFailedLogin).toHaveBeenCalled();
                            expect(console.error).toHaveBeenCalled();
                            expect(currentView.errorOnLogin).toHaveBeenCalled();
                            expect(currentView.resetSignInButton).toHaveBeenCalled();
                            expect(currentView.model.get('errorMessage')).toEqual('Authentication error.');
                            expect(currentView.$('#accessCode')).toEqual(_.last($focusEls));
                        });

                        describe('with error handling for', function() {
                            var errors = [{
                                status: 303,
                                msg: 'Authentication error.'
                            }, {
                                status: 401,
                                msg: 'Authentication error.'
                            }, {
                                status: 403,
                                msg: 'You are not an authorized user of eHMP. Contact your local access control coordinator (ACC) for assistance.'
                            }];

                            beforeEach(function() {
                                spyOn(console, 'error');
                            });

                            _.each(errors, function(error) {
                                it('error with ' + error.status + ' with "test_message" and can clear error', function() {
                                    currentView.onFailedLogin({
                                        'status': error.status,
                                        responseText: JSON.stringify({
                                            'message': 'test_message',
                                        })
                                    });
                                    expect(currentView.$('#errorMessage').html()).toEqual('test_message');
                                    currentView.clearErrors();
                                    expect(_.isEmpty(currentView.$('#errorMessage').html())).toBe(true);
                                });
                                it('error with ' + error.status + ' with "test_errorMessage"', function() {
                                    currentView.onFailedLogin({
                                        'status': error.status,
                                        responseText: JSON.stringify({
                                            'errorMessage': 'test_errorMessage',
                                        })
                                    });
                                    expect(currentView.$('#errorMessage').html()).toEqual('test_errorMessage');
                                });
                                it('error with ' + error.status + ' with no message', function() {
                                    currentView.onFailedLogin({
                                        'status': error.status
                                    });
                                    expect(currentView.$('#errorMessage').html()).toEqual(error.msg);
                                });
                            });

                            it('error with 503 with "message" and can clear error', function() {
                                currentView.onFailedLogin({
                                    'status': 503
                                });
                                expect(currentView.$('#errorMessage').html()).toEqual('SYNC NOT COMPLETE. Try again in a few minutes.');
                                currentView.clearErrors();
                                expect(_.isEmpty(currentView.$('#errorMessage').html())).toBe(true);
                            });

                        });
                    });
                });
            });
        });
    });
});