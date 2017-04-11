/**
 * Created by alexluong on 6/17/15.
 */

/*jslint node: true, nomen: true, unparam: true */
/*global jquery, $, _, define, Marionette, describe, it, expect, beforeEach, spyOn */

'use strict';

// Jasmine Unit Testing Suite
define(['jquery', 'handlebars', 'backbone', 'marionette', 'main/ui_components/components', 'api/UIComponents', 'jasminejquery'],
    function($, Handlebars, Backbone, Marionette, UI) {
        var $workflowTestPage,
            workflowTestPage;

        var formView1 = UI.Form.extend({
            fields: [{
                label: 'Input 1',
                control: 'input',
                name: 'input1'
            }, {
                label: 'Button',
                control: 'button',
                type: 'button',
                id: 'form1-previous'
            }, {
                label: 'Button',
                control: 'button',
                type: 'button',
                id: 'form1-next'
            }, {
                label: 'Button',
                control: 'button',
                type: 'button',
                id: 'form1-goToIndex1'
            }, {
                label: 'Button',
                control: 'button',
                type: 'button',
                id: 'form1-goToIndex0'
            }],
            events: {
                'click #form1-next': function(e) {
                    this.workflow.goToNext();
                },
                'click #form1-goToIndex1': function(e) {
                    this.workflow.goToIndex(1);
                },
                'click #form1-goToIndex0': function(e) {
                    this.workflow.goToIndex(0);
                }
            }
        });
        var formView2 = UI.Form.extend({
            fields: [{
                label: 'Input 2',
                control: 'input',
                name: 'input2'
            }, {
                label: 'Button',
                control: 'button',
                type: 'button',
                id: 'form2-previous'
            }, {
                label: 'Button',
                control: 'button',
                type: 'button',
                id: 'form2-next'
            }],
            events: {
                'click #form2-previous': function(e) {
                    this.workflow.goToPrevious();
                }
            }
        });
        var formModel = new Backbone.Model({
            input1: ''
        });
        var workflowOptions = {
            title: 'Workflow Title',
            showProgress: true,
            steps: [{
                view: formView1,
                viewModel: formModel,
                stepTitle: 'Step 1'
            }, {
                view: formView2,
                viewModel: formModel,
                stepTitle: 'Step 2'
            }]
        };
        var TestView = Backbone.Marionette.LayoutView.extend({
            template: Handlebars.compile([
                '<div class="test-region"></div>'
            ].join('\n')),
            ui: {
                'TestRegion': '.test-region'
            },
            regions: {
                'TestRegion': '@ui.TestRegion'
            },
            initialize: function(options) {
                this.ViewToTest = options.view;
                if (!_.isFunction(this.ViewToTest.initialize)) {
                    this.ViewToTest = new this.ViewToTest();
                }
            },
            onRender: function() {
                this.showChildView('TestRegion', this.ViewToTest);
            }
        });

        describe('A workflow component', function() {
            var $form1, $form2, testWorkflow;

            afterEach(function() {
                workflowTestPage.remove();
                testWorkflow = null;
            });
            describe('basic', function() {
                var mockClick = null;
                beforeEach(function() {
                    mockClick = jasmine.createSpy('mockClick');
                    testWorkflow = new UI.Workflow(workflowOptions);
                    testWorkflow.show();

                    workflowTestPage = new TestView({
                        view: testWorkflow
                    });
                    workflowTestPage = workflowTestPage.render();
                    $workflowTestPage = workflowTestPage.$el;
                    $('body').append($workflowTestPage);

                    $form1 = $workflowTestPage.find('.workflow-controller form')[0];
                    $form2 = $workflowTestPage.find('.workflow-controller form')[1];
                });

                it('header exists', function() {
                    expect($workflowTestPage.find('.workflow-header')).toBeInDOM();
                });
                it('header contains correct title', function() {
                    expect($('[id^="main-workflow-label-"]')).toContainText(workflowOptions.title);
                });

                it('progress indicator exists', function() {
                    expect($workflowTestPage.find('.progress-indicator')).toBeInDOM();
                });
                it('progress indicator contains correct number of indicators', function() {
                    expect($workflowTestPage.find('.progress-indicator li').length).toBe(workflowOptions.steps.length);
                });
                it('progress indicator adjusts on step navigation', function() {
                    expect($workflowTestPage.find('.progress-indicator li div')[0]).toHaveClass('completed');
                    expect($workflowTestPage.find('.progress-indicator li div')[1]).not.toHaveClass('completed');
                    $('#form1-next').click();
                    expect($workflowTestPage.find('.progress-indicator li div')[0]).toHaveClass('completed');
                    expect($workflowTestPage.find('.progress-indicator li div')[1]).toHaveClass('completed');
                    $('#form2-previous').click();
                });

                it('controller exists', function() {
                    expect($workflowTestPage.find('.workflow-controller')).toBeInDOM();
                });
                it('controller contains correct number of step forms', function() {
                    expect($workflowTestPage.find('.workflow-controller form').length).toBe(workflowOptions.steps.length);
                });

                it('navigates between steps', function() {
                    expect($form1).not.toHaveClass('hidden');
                    expect($form2).toHaveClass('hidden');

                    $('#form1-next').click();
                    expect($form1).toHaveClass('hidden');
                    expect($form2).not.toHaveClass('hidden');

                    $('#form2-previous').click();
                    expect($form1).not.toHaveClass('hidden');
                    expect($form2).toHaveClass('hidden');

                    $('#form1-goToIndex1').click();
                    expect($form1).toHaveClass('hidden');
                    expect($form2).not.toHaveClass('hidden');

                    $('#form1-goToIndex1').click();
                    expect($form1).toHaveClass('hidden');
                    expect($form2).not.toHaveClass('hidden');
                });

                it('persists data between steps', function() {
                    var $input1 = $('#input1');
                    $input1.attr('value', 'new input1 value');
                    expect($input1).toHaveAttr('value', 'new input1 value');
                    $('#form1-next').click();
                    expect($input1).toHaveAttr('value', 'new input1 value');
                    $('#form2-previous').click();
                    expect($input1).toHaveAttr('value', 'new input1 value');
                });

                it('getFormView returns correct form view', function() {
                    testWorkflow.getFormView(0).render();
                    var $testFormView = testWorkflow.getFormView(0).$el;

                    expect($testFormView).toEqual($form1);
                    expect($testFormView).not.toEqual($form2);
                });

                it('calling changeHeaderTitle updates the workflows header', function() {
                    expect($workflowTestPage.find('[id^="main-workflow-label-"]')).toHaveText('Workflow Title');
                    testWorkflow.changeHeaderTitle('New Workflow Title');
                    expect($workflowTestPage.find('[id^="main-workflow-label-"]')).toHaveText('New Workflow Title');
                });

                it('calling changeHeaderCloseButtonOptions updates the headerCloseButtonOptions', function() {
                    expect(mockClick).not.toHaveBeenCalled();
                    expect($workflowTestPage.find('button.close')).toHaveAttr('title', 'Press enter to close.');
                    expect($workflowTestPage.find('button.close')).not.toHaveClass('custom-on-close-method');
                    testWorkflow.changeHeaderCloseButtonOptions({
                        title: 'Hello Close Button for Step 2',
                        onClick: mockClick
                    });
                    $workflowTestPage.find('button.close').click();
                    expect(mockClick).toHaveBeenCalled();
                    expect($workflowTestPage.find('button.close')).toHaveAttr('title', 'Hello Close Button for Step 2');
                    expect($workflowTestPage.find('button.close')).toHaveClass('custom-on-close-method');
                });
            });
            describe('with startAtStep option', function() {
                var mockClick = null;
                beforeEach(function() {
                    mockClick = jasmine.createSpy('mockClick');
                    testWorkflow = new UI.Workflow(_.defaults({startAtStep: 1},workflowOptions));
                    testWorkflow.show();

                    workflowTestPage = new TestView({
                        view: testWorkflow
                    });
                    workflowTestPage = workflowTestPage.render();
                    $workflowTestPage = workflowTestPage.$el;
                    $('body').append($workflowTestPage);

                    $form1 = $workflowTestPage.find('.workflow-controller form')[0];
                    $form2 = $workflowTestPage.find('.workflow-controller form')[1];
                });

                it('header exists', function() {
                    expect($workflowTestPage.find('.workflow-header')).toBeInDOM();
                });
                it('header contains correct title', function() {
                    expect($('[id^="main-workflow-label-"]')).toContainText(workflowOptions.title);
                });

                it('progress indicator exists', function() {
                    expect($workflowTestPage.find('.progress-indicator')).toBeInDOM();
                });
                it('progress indicator contains correct number of indicators', function() {
                    expect($workflowTestPage.find('.progress-indicator li').length).toBe(workflowOptions.steps.length);
                });

                it('controller exists', function() {
                    expect($workflowTestPage.find('.workflow-controller')).toBeInDOM();
                });
                it('controller contains correct number of step forms', function() {
                    expect($workflowTestPage.find('.workflow-controller form').length).toBe(workflowOptions.steps.length);
                });

                it('navigates between steps', function() {
                    expect($form2).not.toHaveClass('hidden');
                    expect($form1).toHaveClass('hidden');

                    $('#form2-previous').click();
                    expect($form1).not.toHaveClass('hidden');
                    expect($form2).toHaveClass('hidden');

                    $('#form1-goToIndex1').click();
                    expect($form1).toHaveClass('hidden');
                    expect($form2).not.toHaveClass('hidden');

                    $('#form1-goToIndex1').click();
                    expect($form1).toHaveClass('hidden');
                    expect($form2).not.toHaveClass('hidden');
                });

                it('persists data between steps', function() {
                    var $input1 = $('#input1');
                    $input1.attr('value', 'new input1 value');
                    expect($input1).toHaveAttr('value', 'new input1 value');
                    $('#form1-next').click();
                    expect($input1).toHaveAttr('value', 'new input1 value');
                    $('#form2-previous').click();
                    expect($input1).toHaveAttr('value', 'new input1 value');
                });

                it('getFormView returns correct form view', function() {
                    testWorkflow.getFormView(0).render();
                    var $testFormView = testWorkflow.getFormView(0).$el;

                    expect($testFormView).toEqual($form1);
                    expect($testFormView).not.toEqual($form2);
                });

                it('calling changeHeaderTitle updates the workflows header', function() {
                    expect($workflowTestPage.find('[id^="main-workflow-label-"]')).toHaveText('Workflow Title');
                    testWorkflow.changeHeaderTitle('New Workflow Title');
                    expect($workflowTestPage.find('[id^="main-workflow-label-"]')).toHaveText('New Workflow Title');
                });

                it('calling changeHeaderCloseButtonOptions updates the headerCloseButtonOptions', function() {
                    expect(mockClick).not.toHaveBeenCalled();
                    expect($workflowTestPage.find('button.close')).toHaveAttr('title', 'Press enter to close.');
                    expect($workflowTestPage.find('button.close')).not.toHaveClass('custom-on-close-method');
                    testWorkflow.changeHeaderCloseButtonOptions({
                        title: 'Hello Close Button for Step 2',
                        onClick: mockClick
                    });
                    $workflowTestPage.find('button.close').click();
                    expect(mockClick).toHaveBeenCalled();
                    expect($workflowTestPage.find('button.close')).toHaveAttr('title', 'Hello Close Button for Step 2');
                    expect($workflowTestPage.find('button.close')).toHaveClass('custom-on-close-method');
                });
            });
            describe('with action items', function() {
                var mockClick = null;
                var mockClick2 = null;
                beforeEach(function() {
                    mockClick = jasmine.createSpy('mockClick');
                    mockClick2 = jasmine.createSpy('mockClick2');
                    testWorkflow = new UI.Workflow({
                        title: 'Workflow Title',
                        showProgress: true,
                        steps: [{
                            view: formView1,
                            viewModel: formModel,
                            stepTitle: 'Step 1'
                        }],
                        headerOptions: {
                            actionItems: [{
                                label: 'Close',
                                onClick: mockClick
                            }]
                        }
                    });
                    testWorkflow.show();

                    workflowTestPage = new TestView({
                        view: testWorkflow
                    });
                    workflowTestPage = workflowTestPage.render();
                    $workflowTestPage = workflowTestPage.$el;
                    $('body').append($workflowTestPage);
                    $form1 = $workflowTestPage.find('.workflow-controller form')[0];
                });

                it('action item dropdown icon exists', function() {
                    expect($workflowTestPage.find('.modal-header .header-btns .dropdown')).toBeInDOM();
                    expect($workflowTestPage.find('.modal-header button.btn.btn-icon.dropdown-toggle')).toBeInDOM();
                    expect($workflowTestPage.find('.modal-header button.btn.btn-icon.dropdown-toggle')).toHaveId('action-items-dropdown');
                    expect($workflowTestPage.find('.modal-header i.fa')).toBeInDOM();
                    expect($workflowTestPage.find('.modal-header ul.dropdown-menu.dropdown-menu-right')).toBeInDOM();
                    expect($workflowTestPage.find('.modal-header ul.dropdown-menu.dropdown-menu-right')).toHaveAttr('aria-labelledby', 'action-items-dropdown');
                    expect($workflowTestPage.find('.modal-header ul.dropdown-menu.dropdown-menu-right')).toHaveAttr('role', 'menu');
                });
                it('correct action items appear in dropdown', function() {
                    expect($workflowTestPage.find('.modal-header ul li').length).toBe(1);
                    expect($workflowTestPage.find('.modal-header ul li')).toHaveAttr('role', 'presentation');
                    expect($workflowTestPage.find('.modal-header ul li a')).toHaveAttr('role', 'menuitem');
                    expect($workflowTestPage.find('.modal-header ul li a')).toHaveAttr('href', '#');
                    expect($workflowTestPage.find('.modal-header ul li a')).toContainText('Close');
                });
                it('correct event gets fired when clicking an action item', function() {
                    expect(mockClick).not.toHaveBeenCalled();
                    $workflowTestPage.find('.modal-header ul li a').click();
                    expect(mockClick).toHaveBeenCalled();
                    expect(mockClick.calls.count()).toEqual(1);
                });
                it('calling changeHeaderActionItems updates the actionItems', function() {
                    expect(mockClick).not.toHaveBeenCalled();
                    expect($workflowTestPage.find('.header-btns ul.dropdown-menu.dropdown-menu-right')).toBeInDOM();
                    expect($workflowTestPage.find('.header-btns ul.dropdown-menu.dropdown-menu-right li a')).toHaveText('Close');
                    testWorkflow.changeHeaderActionItems([{
                        label: 'action Item 1',
                        onClick: mockClick2
                    }]);
                    $workflowTestPage.find('.header-btns ul.dropdown-menu.dropdown-menu-right li a').click();
                    expect(mockClick2).toHaveBeenCalled();
                    expect($workflowTestPage.find('.header-btns ul.dropdown-menu.dropdown-menu-right')).toBeInDOM();
                    expect($workflowTestPage.find('.header-btns ul.dropdown-menu.dropdown-menu-right li a').text()).toBe('action Item 1');
                });
            });

            describe('with onBeforeShow functions', function() {
                var mockClick = null;
                afterEach(function() {
                    $('body p.step-1-before-show-message, body p.step-2-before-show-message').remove();
                });
                beforeEach(function() {
                    mockClick = jasmine.createSpy('mockClick');
                    testWorkflow = new UI.Workflow({
                        title: 'Workflow Title',
                        showProgress: true,
                        steps: [{
                            view: formView1,
                            viewModel: formModel,
                            stepTitle: 'Step 1',
                            onBeforeShow: function() {
                                $('body').append('<p class="step-1-before-show-message">Step 1 has been shown!</p>');
                            }
                        }, {
                            view: formView2,
                            viewModel: formModel,
                            stepTitle: 'Step 2',
                            onBeforeShow: function() {
                                $('body').append('<p class="step-2-before-show-message">Step 2 has been shown!</p>');
                            }
                        }]
                    });
                    testWorkflow.show();

                    workflowTestPage = new TestView({
                        view: testWorkflow
                    });
                    workflowTestPage = workflowTestPage.render();
                    $workflowTestPage = workflowTestPage.$el;
                    $('body').append($workflowTestPage);
                    $form1 = $workflowTestPage.find('.workflow-controller form')[0];
                });

                it('onBeforeShow of first step is called upon initial show', function() {
                    expect($('body p.step-1-before-show-message')).toHaveLength(1);
                    expect($('body p.step-1-before-show-message')).toHaveText('Step 1 has been shown!');
                });
                it('onBeforeShow of second step is called after clicking the step 2 button', function() {
                    expect($('body p.step-2-before-show-message')).toHaveLength(0);
                    $workflowTestPage.find('#form1-next').click();
                    expect($('body p.step-2-before-show-message')).toHaveLength(1);
                    expect($('body p.step-2-before-show-message')).toHaveText('Step 2 has been shown!');
                });
                it('onBeforeShow of first step is called after clicking on the goToIndex0 button', function() {
                    expect($('body p.step-1-before-show-message')).toHaveLength(1);
                    $workflowTestPage.find('#form1-goToIndex0').click();
                    expect($('body p.step-1-before-show-message')).toHaveLength(2);
                    expect($('body p.step-1-before-show-message:nth-of-type(2)')).toHaveText('Step 1 has been shown!');
                });
            });
        });
    });
