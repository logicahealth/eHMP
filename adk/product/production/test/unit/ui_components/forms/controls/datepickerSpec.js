define([
    'api/Messaging',
    'moment',
    'jquery',
    'backbone',
    'marionette',
    'handlebars',
    'main/ui_components/components',
    'api/UIComponents',
    'jasminejquery'
], function(Messaging, Moment, $, Backbone, Marionette, Handlebars, UI) {
    'use strict';
    var $testPage, testPage;

    var datePickerControlDefinitionBasic = {
        name: 'datePicker0',
        label: 'datepicker',
        control: 'datepicker'
    };

    var datePickerControlDefinitionFlexibleBasic = {
        name: 'datePicker0',
        label: 'datepicker',
        control: 'datepicker',
        flexible: true,
        startDate: new Date("11/02/2015")
    };

    var datePickerControlDefinitionDateRange = {
        name: 'datepickerDateRange',
        label: 'datepicker',
        control: 'datepicker',
        startDate: '11/02/2015',
        endDate: new Moment()
    };

    var datePickerControlDefinitionOutputFormat = {
        name: 'datePicker0',
        label: 'datepicker',
        control: 'datepicker',
        outputFormat: "YYYYMMDD"
    };

    var datePickerControlDefinitionFlexibleOutputFormat = {
        name: 'datePicker0',
        label: 'datepicker',
        control: 'datepicker',
        outputFormat: "YYYYMMDD",
        flexible: true
    };

    var datePickerControlDefinitionBasicSrOnlyLabel = {
        name: 'datePicker0',
        label: 'datepicker',
        control: 'datepicker',
        srOnlyLabel: true
    };

    var datePickerControlDefinitionWithMoreOptions = {
        name: 'datePicker1',
        label: 'datepicker',
        control: 'datepicker',
        options: {
            autoclose: false,
            endDate: "0d",
            startDate: new Moment('11/02/2015', 'MM/DD/YYYY')
        }
    };

    var datePickerControlDefinitionWithExtraClasses = {
        name: 'datePicker2',
        label: 'datepicker (with extra classes)',
        control: 'datepicker',
        extraClasses: ['special-class-1', 'special-class-2']
    };

    var datePickerControlDefinitionDisabled = {
        name: 'datePicker3',
        label: 'datepicker (disabled)',
        disabled: true,
        control: 'datepicker'
    };

    var datePickerControlDefinitionRequired = {
        name: 'datePicker4',
        label: 'datepicker (required)',
        required: true,
        control: 'datepicker'
    };

    var datePickerControlDefinitionReadonly = {
        name: 'datePicker5',
        label: 'datepicker (readonly)',
        readonly: true,
        control: 'datepicker'
    };

    var datePickerControlDefinitionHelpMessage = {
        name: 'datePicker6',
        label: 'datepicker (readonly)',
        control: 'datepicker',
        helpMessage: 'This is a help message.'
    };

    var FormModelCleanSlate = Backbone.Model.extend({
        errorModel: new Backbone.Model({
            'datepickerError': 'Example error'
        }),
        validate: function() {
            // console.log('in form validate function');
            return null;
        }
    });

    var FormModelWithInitialDate = Backbone.Model.extend({
        defaults: {
            datePicker0: '11/11/2000'
        }
    });

    var NotificationView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile("{{message}}"),
        modelEvents: {
            'change': 'render'
        },
        tagName: 'p'
    });

    var TestView = Backbone.Marionette.LayoutView.extend({
        template: Handlebars.compile([
            '<div class="test-region"></div>',
            '<div class="live-region"></div>'
        ].join('\n')),
        ui: {
            'TestRegion': '.test-region',
            'AriaLiveRegion': '.live-region'
        },
        regions: {
            'TestRegion': '@ui.TestRegion',
            'ariaLiveRegion': '@ui.AriaLiveRegion'
        },
        initialize: function(options) {
            this.ViewToTest = options.view;
            if (!_.isFunction(this.ViewToTest.initialize)) {
                this.ViewToTest = new this.ViewToTest();
            }
            this.NotificationView = new NotificationView({
                model: new Backbone.Model({
                    'message': ''
                })
            });
            var self = this;
            Messaging.reply('get:adkApp:region', function() { // component show() expects a region handed back
                return self.getRegion('ariaLiveRegion');
            });
        },
        onRender: function() {
            this.showChildView('TestRegion', this.ViewToTest);
            this.ariaLiveRegion.show(this.NotificationView);
        }
    });

    var SubmittableForm = UI.Form.extend({
        events: {
            'submit': function(e) {
                e.preventDefault();
                if (this.model.isValid()) {
                    // console.log('submit event and validated');
                    // return true;
                } else {
                    // console.log('submit event and inValid date!');
                    // return false;
                }
            }
        }
    });

    var extensibleDatepickerTests = function(isFlexible, inputSelector) {
        describe('with initial value', function() {
            beforeEach(function() {
                // if (isFlexible) {
                //     _.extend({
                //         flexible: true
                //     }, datePickerControlDefinitionBasic);
                //     console.log('flexible', datePickerControlDefinitionBasic.flexible);
                // }
                testPage = new TestView({
                    view: new UI.Form({
                        model: new FormModelWithInitialDate(),
                        fields: [(isFlexible ? datePickerControlDefinitionFlexibleBasic : datePickerControlDefinitionBasic)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });

            it('puts a correct initial date value', function() {
                expect($testPage.find(inputSelector).val()).toBe('11/11/2000');
            });

            it('update to a new date value', function() {
                testPage.ViewToTest.model.set('datePicker0', '12/20/2014');
                expect(_.isEqual($testPage.find(inputSelector).val(), '12/20/2014')).toBe(true);
            });

            it('when unset, correctly unsets external model and input', function() {
                expect($testPage.find(inputSelector)).toHaveValue('11/11/2000');
                expect(testPage.ViewToTest.model.get('datePicker0')).toBe('11/11/2000');
                expect(testPage.ViewToTest.model.get('datePicker0')).toBe('11/11/2000');
                testPage.ViewToTest.model.unset('datePicker0');
                expect(testPage.ViewToTest.model.get('datePicker0')).not.toBe('11/11/2000');
                expect(testPage.ViewToTest.model.get('_datePicker0')).not.toBe('11/11/2000');
                expect($testPage.find(inputSelector)).toHaveValue('');
            });
        });

        describe('with bootstrap-datepicker option', function() {
            // legacy options. No longer direct pass-through.. Only startDate and endDate are supported
            beforeEach(function() {
                testPage = new TestView({
                    view: new SubmittableForm({
                        model: new FormModelCleanSlate(),
                        fields: [(isFlexible ? _.defaults({
                            flexible: true
                        }, datePickerControlDefinitionWithMoreOptions) : datePickerControlDefinitionWithMoreOptions)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });

            it('verify startDate extra option value throws error upon if date is out of range', function() {
                // submit and then see if error model has error for this datepicker
                expect($testPage.find(inputSelector)).toHaveLength(1);
                $testPage.find(inputSelector).val('11/01/2015').change();
                $testPage.find('form').trigger('submit');
                expect($testPage.find('.datepicker-control span.help-block.error')).toContainText('Date must be between');
            });
            it('a valid date within the date range will throw no error on submit', function() {
                expect($testPage.find(inputSelector)).toHaveLength(1);
                $testPage.find(inputSelector).val('11/02/2015').change();
                $testPage.find('form').trigger('submit');
                expect($testPage.find('.datepicker-control')).not.toContainText('Date must be between');
            });
        });

        describe('with startDate and endDate option', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new SubmittableForm({
                        model: new FormModelCleanSlate(),
                        fields: [(isFlexible ? _.defaults({
                            flexible: true
                        }, datePickerControlDefinitionDateRange) : datePickerControlDefinitionDateRange)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });
            it('a date before startDate throws an error on submit', function() {
                expect($testPage.find(inputSelector)).toHaveLength(1);
                $testPage.find(inputSelector).val('11/01/2015').change();
                $testPage.find('form').trigger('submit');
                expect($testPage.find('.datepicker-control span.help-block.error')).toContainText('Date must be between');
            });
            it('a date after endDate throws an error on submit', function() {
                expect($testPage.find(inputSelector)).toHaveLength(1);
                $testPage.find(inputSelector).val(new Moment().add(1, 'days').format('MM/DD/YYYY')).change();
                $testPage.find('form').trigger('submit');
                expect($testPage.find('.datepicker-control span.help-block.error')).toContainText('Date must be between');
            });
            it('a valid date within the date range will throw no error on submit', function() {
                expect($testPage.find(inputSelector)).toHaveLength(1);
                $testPage.find(inputSelector).val('11/02/2015').change();
                $testPage.find('form').trigger('submit');
                expect($testPage.find('.datepicker-control')).not.toContainText('Date must be between');
            });
            it('dynamically changing the startDate to after the value will throw an error on submit ', function() {
                expect($testPage.find(inputSelector)).toHaveLength(1);
                $testPage.find(inputSelector).val('11/02/2015').change();
                $testPage.find(inputSelector).trigger('control:startDate', '11/03/2015');
                $testPage.find('form').trigger('submit');
                expect($testPage.find('.datepicker-control span.help-block.error')).toContainText('Date must be between');
            });
            it('dynamically changing the endDate to before the value will throw an error on submit ', function() {
                expect($testPage.find(inputSelector)).toHaveLength(1);
                $testPage.find(inputSelector).val('11/03/2015').change();
                $testPage.find(inputSelector).trigger('control:endDate', new Moment('11/02/2015'));
                $testPage.find('form').trigger('submit');
                expect($testPage.find('.datepicker-control span.help-block.error')).toContainText('Date must be between');
            });
            it('dynamically changing the startDate to before the previously out of range value will NOT throw an error on submit ', function() {
                expect($testPage.find(inputSelector)).toHaveLength(1);
                $testPage.find(inputSelector).val('11/01/2015').change();
                $testPage.find(inputSelector).trigger('control:startDate', '10/31/2015');
                $testPage.find('form').trigger('submit');
                expect($testPage.find('.datepicker-control span.help-block.error')).not.toContainText('Date must be between');
            });
            it('dynamically changing the endDate to after the previously out of range value will NOT throw an error on submit', function() {
                expect($testPage.find(inputSelector)).toHaveLength(1);
                $testPage.find(inputSelector).val(new Moment().add(1, 'days').format('MM/DD/YYYY')).change();
                $testPage.find(inputSelector).trigger('control:endDate', new Moment().add(2, 'days').format('MM/DD/YYYY'));
                $testPage.find('form').trigger('submit');
                expect($testPage.find('.datepicker-control span.help-block.error')).not.toContainText('Date must be between');
            });
        });

        describe('with outputFormat option', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new SubmittableForm({
                        model: new FormModelCleanSlate(),
                        fields: [(isFlexible ? _.defaults({
                            flexible: true
                        }, datePickerControlDefinitionOutputFormat) : datePickerControlDefinitionOutputFormat)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });
            it('has a date saved to the model in the specified format if is a full date', function() {
                expect($testPage.find(inputSelector)).toHaveLength(1);
                $testPage.find(inputSelector).val('11/02/2015').change();
                $testPage.find('form').trigger('submit');
                expect(testPage.ViewToTest.model.get('datePicker0')).toBe("20151102");
            });
        });

        describe('with extra classes', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new UI.Form({
                        model: new FormModelCleanSlate(),
                        fields: [(isFlexible ? _.defaults({
                            flexible: true
                        }, datePickerControlDefinitionWithExtraClasses) : datePickerControlDefinitionWithExtraClasses)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });

            it('has correct classes', function() {
                expect($testPage.find('div.control')).toHaveClass('special-class-1');
                expect($testPage.find('div.control')).toHaveClass('special-class-2');
            });
            it('input does not have the same classes', function() {
                expect($testPage.find(inputSelector)).not.toHaveClass('special-class-1');
                expect($testPage.find(inputSelector)).not.toHaveClass('special-class-2');
            });
        });

        describe('disabled', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new UI.Form({
                        model: new FormModelCleanSlate(),
                        fields: [(isFlexible ? _.defaults({
                            flexible: true
                        }, datePickerControlDefinitionDisabled) : datePickerControlDefinitionDisabled)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });

            it('has correct attribute', function() {
                expect($testPage.find('input.datepicker-input')).toBeDisabled();
                expect($testPage.find(inputSelector)).toBeDisabled();
                expect($testPage.find('span.input-group-addon')).toHaveClass('disabled');
            });
        });

        describe('required', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new UI.Form({
                        model: new FormModelCleanSlate(),
                        fields: [(isFlexible ? _.defaults({
                            flexible: true
                        }, datePickerControlDefinitionRequired) : datePickerControlDefinitionRequired)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });

            it('has correct attribute', function() {
                expect($testPage.find(inputSelector)).toHaveAttr('required', 'required');
            });
        });

        describe('readonly', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new UI.Form({
                        model: new FormModelCleanSlate(),
                        fields: [(isFlexible ? _.defaults({
                            flexible: true
                        }, datePickerControlDefinitionReadonly) : datePickerControlDefinitionReadonly)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });

            it('contains correct attribute', function() {
                expect($testPage.find(inputSelector)).toHaveAttr('readonly', 'readonly');
            });
        });

        describe('with help message', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new UI.Form({
                        model: new FormModelCleanSlate(),
                        fields: [(isFlexible ? _.defaults({
                            flexible: true
                        }, datePickerControlDefinitionHelpMessage) : datePickerControlDefinitionHelpMessage)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });

            it('help message is in a span with proper class', function() {
                expect($testPage.find('span:last')).toHaveClass('help-block');
            });

            it('has help message', function() {
                expect($testPage.find('span:last.help-block')).toHaveText('This is a help message.');
            });
        });
        describe('basic with sr-only label', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new UI.Form({
                        model: new FormModelCleanSlate(),
                        fields: [(isFlexible ? _.defaults({
                            flexible: true
                        }, datePickerControlDefinitionBasicSrOnlyLabel) : datePickerControlDefinitionBasicSrOnlyLabel)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });

            it('contains correct label with sr-only class', function() {
                expect($testPage.find('label')).toContainText('datepicker');
                expect($testPage.find('label').attr('for')).toBe('datePicker0');
                expect($testPage.find('label')).toHaveClass('sr-only');
            });
        });
        describe("using trigger to dynamically change attributes", function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new SubmittableForm({
                        model: new FormModelCleanSlate(),
                        fields: [(isFlexible ? _.defaults({
                            flexible: true
                        }, datePickerControlDefinitionBasic) : datePickerControlDefinitionBasic)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });

            it("required", function() {
                $testPage.find('.control.datePicker0').trigger("control:required", true);
                expect($testPage.find(inputSelector)).toHaveAttr('required');
                $testPage.find('.control.datePicker0').trigger("control:required", false);
                expect($testPage.find(inputSelector)).not.toHaveAttr('required');

            });
            it("hidden", function() {
                $testPage.find('.control.datePicker0').trigger("control:hidden", true);
                expect($testPage.find('.control.datePicker0')).toHaveClass('hidden');
                $testPage.find('.control.datePicker0').trigger("control:hidden", false);
                expect($testPage.find('.control.datePicker0')).not.toHaveClass('hidden');

            });
            it("disabled", function() {
                $testPage.find('.control.datePicker0').trigger("control:disabled", true);
                expect($testPage.find(inputSelector)).toHaveAttr('disabled');
                $testPage.find('.control.datePicker0').trigger("control:disabled", false);
                expect($testPage.find(inputSelector)).not.toHaveAttr('disabled');
            });
            it("title", function() {
                $testPage.find('.control.datePicker0').trigger("control:title", 'newTitle');
                expect($testPage.find(inputSelector)).toHaveAttr('title', 'newTitle');
                $testPage.find('.control.datePicker0').trigger("control:title", '');
                expect($testPage.find(inputSelector)).not.toHaveAttr('title');
            });
            it('dynamically changing the startDate to after the value will throw an error on submit', function() {
                expect($testPage.find(inputSelector)).toHaveLength(1);
                $testPage.find(inputSelector).trigger('control:startDate', '11/01/2015');
                $testPage.find(inputSelector).val('11/02/2015').change();
                $testPage.find(inputSelector).trigger('control:startDate', '11/03/2015');
                $testPage.find('form').trigger('submit');
                expect($testPage.find('.datepicker-control span.help-block.error')).toContainText('Date must be between');
            });
            it('dynamically changing the endDate to before the value will throw an error on submit', function() {
                expect($testPage.find(inputSelector)).toHaveLength(1);
                $testPage.find(inputSelector).val('11/03/2015').change();
                $testPage.find(inputSelector).trigger('control:endDate', new Moment('11/02/2015'));
                $testPage.find('form').trigger('submit');
                expect($testPage.find('.datepicker-control span.help-block.error')).toContainText('Date must be between');
            });
            it('dynamically changing the startDate to before the previously out of range value will NOT throw an error on submit ', function() {
                expect($testPage.find(inputSelector)).toHaveLength(1);
                $testPage.find(inputSelector).trigger('control:startDate', '11/03/2015');
                $testPage.find(inputSelector).val('11/01/2015').change();
                $testPage.find(inputSelector).trigger('control:startDate', '10/31/2015');
                $testPage.find('form').trigger('submit');
                expect($testPage.find('.datepicker-control span.help-block.error')).not.toContainText('Date must be between');
            });
            it('dynamically changing the endDate to after the previously out of range value will NOT throw an error on submit', function() {
                expect($testPage.find(inputSelector)).toHaveLength(1);
                $testPage.find(inputSelector).trigger('control:endDate', new Moment().subtract(1, 'days').format('MM/DD/YYYY'));
                $testPage.find(inputSelector).val(new Moment().add(1, 'days').format('MM/DD/YYYY')).change();
                $testPage.find(inputSelector).trigger('control:endDate', new Moment().add(2, 'days').format('MM/DD/YYYY'));
                $testPage.find('form').trigger('submit');
                expect($testPage.find('.datepicker-control span.help-block.error')).not.toContainText('Date must be between');
            });
        });
        describe("with error", function() {
            beforeEach(function() {
                var datePickerControlDefinitionwithError = {
                    name: 'datepickerError',
                    label: 'datepicker',
                    control: 'datepicker'
                };
                testPage = new TestView({
                    view: new UI.Form({
                        model: new FormModelCleanSlate(),
                        fields: [(isFlexible ? _.defaults({
                            flexible: true
                        }, datePickerControlDefinitionwithError) : datePickerControlDefinitionwithError)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });
            it("contains error", function() {
                testPage.ViewToTest.model.errorModel.set('datepickerError', 'Example error');
                expect($testPage.find('span.error')).toExist();
                expect($testPage.find('span.error')).toHaveText('Example error');
            });
            it("error is removed", function() {
                testPage.ViewToTest.model.errorModel.set('datepickerError', 'Example error');
                expect($testPage.find('span.error')).toHaveText('Example error');
                $testPage.find('span.input-group-addon').focus().click();
                $('body').find('.day').focus().click();
                expect($testPage.find('span.error')).not.toExist();
            });
        });
    };

    describe('A datepicker', function() {
        afterEach(function() {
            testPage.remove();
        });
        describe('default', function() {
            describe('basic', function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new UI.Form({
                            model: new FormModelCleanSlate(),
                            fields: [datePickerControlDefinitionBasic]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it('contains an input field', function() {
                    expect($testPage.find('input.datepicker-input').length).toBe(1);
                });

                it('does not pop up a calendar picker', function() {
                    $testPage.find('input.datepicker-input').focus();
                    expect($testPage.find('div.datepicker-dropdown').length).toBe(0);
                });

                it('closes a calendar picker', function() {
                    $testPage.find('input.datepicker-input').focusout();
                    expect($testPage.find('div.datepicker-dropdown').length).toBe(0);
                });

                it('allows valid date from being typed into a date field', function() {
                    var validDate = '12/31/2015';
                    $testPage.find('input.datepicker-input').val(validDate).change();
                    expect(_.isEqual($testPage.find('input.datepicker-input').val(), validDate)).toBe(true);
                });

                it('prevents invalid date from being typed into a date field', function() {
                    var invalidDate = '12/32/2015';
                    $testPage.find('input.datepicker-input').datepicker('update', invalidDate);
                    expect(_.isEqual($testPage.find('input.datepicker-input').val(), invalidDate)).toBe(false);
                });

                it('sets value in model when input is changed', function() {
                    $testPage.find('input.datepicker-input').val('05/12/1999').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('05/12/1999');
                });

                it('contains a title on the input field', function() {
                    expect($testPage.find('input.datepicker-input').attr('title')).toBe('Enter in a date in the following format, MM/DD/YYYY');
                });
            });
            extensibleDatepickerTests(false, 'input.datepicker-input');
        });
        describe('flexible', function() {
            var ensureCorrectHelpFormats = function(tooltipElement, minPrecision) {
                minPrecision = minPrecision || 'year';
                var helpTooltipFormats = [
                    'MM/DD/YYYY',
                    minPrecision !== 'day' ? 'MM/YYYY' : { format: 'MM/YYYY' },
                    minPrecision === 'year' ? 'YYYY' : { format: 'YYYY' },
                    'MM/DD',
                    't',
                    't+x',
                    't+ym',
                    'n',
                    'yesterday',
                    'tomorrow'
                ];
                var liIndex = 0;
                helpTooltipFormats.forEach(function(format, index) {
                    if (typeof format === 'string') {
                        expect($(tooltipElement.text()).find('li').get(liIndex)).toContainText(format);
                        liIndex++;
                    } else if (typeof format === 'object') {
                        expect($(tooltipElement.text()).find('li').get(liIndex)).not.toContainText(format);
                    }
                }, this);
            };
            describe('basic', function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new SubmittableForm({
                            model: new FormModelCleanSlate(),
                            fields: [datePickerControlDefinitionFlexibleBasic]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });

                it('contains correct input fields', function() {
                    expect($testPage.find('input.datepicker-input')).toHaveLength(1);
                    expect($testPage.find('input.flexible-input')).toHaveLength(1);
                });

                it('contains help popover with correct formats for default minPrecision', function(done) {
                    expect($testPage.find('button[data-toggle="tooltip"]')).toHaveLength(1);
                    $testPage.find('button[data-toggle="tooltip"]').tooltip('show');
                    var tooltipTimeout = setTimeout(function() {
                        $testPage.find('button[data-toggle="tooltip"]').off('inserted.bs.tooltip');
                        ensureCorrectHelpFormats($testPage.find('.tooltip-inner'), 'year');
                        done();
                    }, 300);
                    $testPage.find('button[data-toggle="tooltip"]').one('inserted.bs.tooltip', function() {
                        clearTimeout(tooltipTimeout);
                        ensureCorrectHelpFormats($testPage.find('.tooltip-inner'), 'year');
                        done();
                    });
                });

                it('does not pop up a calendar picker', function() {
                    $testPage.find('input.datepicker-input').focus();
                    expect($testPage.find('div.datepicker-dropdown')).toHaveLength(0);
                    $testPage.find('input.flexible-input').focus();
                    expect($testPage.find('div.datepicker-dropdown')).toHaveLength(0);
                });

                it('closes a calendar picker', function() {
                    $testPage.find('input.datepicker-input').focusout();
                    expect($testPage.find('div.datepicker-dropdown')).toHaveLength(0);
                    $testPage.find('input.flexible-input').focusout();
                    expect($testPage.find('div.datepicker-dropdown')).toHaveLength(0);
                });

                it('allows valid date to typed into a date field', function() {
                    var validDate = '12/31/2015';
                    $testPage.find('input.datepicker-input').datepicker('update', validDate);
                    expect(_.isEqual($testPage.find('input.datepicker-input').val(), validDate)).toBe(true);
                });

                it('contains a title on the input field which resets when value is emptied', function(done) {
                    expect($testPage.find('input.flexible-input')).toHaveProp('title', 'Enter date in text or numerical format.');
                    $testPage.find('input.flexible-input').val('11/12/2015').trigger('input');
                    var onOpenCallback = function() {
                        expect($testPage.find('.tooltip-inner')).toHaveText('11/12/2015');
                        $testPage.find('input.flexible-input').val('').trigger('input');
                        var tooltipHideTimeout = setTimeout(function() {
                            $testPage.find('input.flexible-input').off('hidden.bs.tooltip');
                            expect($testPage.find('input.flexible-input').attr('title')).toBe('Enter date in text or numerical format.');
                            done();
                        }, 400);
                        $testPage.find('input.flexible-input').one('hidden.bs.tooltip', function() {
                            clearTimeout(tooltipHideTimeout);
                            expect($testPage.find('input.flexible-input').attr('title')).toBe('Enter date in text or numerical format.');
                            done();
                        });
                    }
                    var tooltipTimeout = setTimeout(function() {
                        $testPage.find('input.flexible-input').off('inserted.bs.tooltip');
                        onOpenCallback.apply(this, arguments);
                    }, 300);
                    $testPage.find('input.flexible-input').one('inserted.bs.tooltip', function() {
                        clearTimeout(tooltipTimeout);
                        onOpenCallback.apply(this, arguments);
                    });
                });

                it('allows free text to be typed into a date field', function() {
                    var validDate = 'banana';
                    $testPage.find('input.flexible-input').val(validDate);
                    expect(_.isEqual($testPage.find('input.flexible-input').val(), validDate)).toBe(true);
                });

                it('when unset, correctly unsets flexible internal model', function() {
                    $testPage.find('input.flexible-input').val('11/12/15').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('11/12/2015');
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe('11/12/2015');
                    testPage.ViewToTest.model.unset('datePicker0');
                    expect(testPage.ViewToTest.model.get('datePicker0')).not.toBe('11/12/2015');
                    var externalModel = testPage.ViewToTest.model.get('_datePicker0') || { get: function() {} };
                    expect(externalModel.get('formattedDate')).not.toBe('11/12/2015');
                    expect($testPage.find('input.flexible-input').val()).not.toBe('11/12/2015');
                });

                it('sets value in model when input is changed by datepicker and no error is thrown on submit', function() {
                    $testPage.find('input.flexible-input').val('11/13/2015').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('11/13/2015');
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });

                it('sets value and external model in form model when input is a MM/dd/yyyy and no error is thrown on submit', function() {
                    $testPage.find('input.flexible-input').val('11/12/2015').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('11/12/2015');
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe('11/12/2015');
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });

                it('sets value and external model in model when input is a MM/dd/yy and no error is thrown on submit', function() {
                    $testPage.find('input.flexible-input').val('11/12/15').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('11/12/2015');
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe('11/12/2015');
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });

                it('sets value and external model in model when input is a M/d/yyyy and no error is thrown on submit', function() {
                    $testPage.find('input.flexible-input').val('1/2/2016').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('01/02/2016');
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe('01/02/2016');
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });

                it('sets value and external model in model when input is a M/d/yy and no error is thrown on submit', function() {
                    $testPage.find('input.flexible-input').val('1/2/16').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('01/02/2016');
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe('01/02/2016');
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });

                it('sets value in model when input is a MM/yyyy and no error is thrown on submit. External value has null for formatted date', function() {
                    $testPage.find('input.flexible-input').val('11/2015').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('11/2015');
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe(null);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('month')).toBe("11");
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('year')).toBe("2015");
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('day')).toBe(null);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('date')).toBe('11/2015');
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });

                it('sets value in model when input is a M/yyyy and no error is thrown on submit', function() {
                    $testPage.find('input.flexible-input').val('1/2016').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('01/2016');
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe(null);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('month')).toBe("01");
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('year')).toBe("2016");
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('day')).toBe(null);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('date')).toBe('01/2016');
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });

                it('sets value in model when input is a yyyy and no error is thrown on submit', function() {
                    $testPage.find('input.flexible-input').val('2015').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('2015');
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe(null);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('month')).toBe(null);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('year')).toBe("2015");
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('day')).toBe(null);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('date')).toBe('2015');
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });

                it('sets value in model when input is a MM/DD and no error is thrown on submit', function() {
                    var currentYear = new Moment().year();
                    $testPage.find('input.flexible-input').val('01/03').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('01/03/' + currentYear);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe('01/03/' + currentYear);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('month')).toBe('01');
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('year')).toBe('' + currentYear);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('day')).toBe('03');
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('date')).toBe('01/03/' + currentYear);
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });

                it('sets value in model when input is a M/D and no error is thrown on submit', function() {
                    var currentYear = new Moment().year();
                    $testPage.find('input.flexible-input').val('1/4').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('01/04/' + currentYear);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe('01/04/' + currentYear);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('month')).toBe('01');
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('year')).toBe('' + currentYear);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('day')).toBe('04');
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('date')).toBe('01/04/' + currentYear);
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });

                it('sets value in tooltip when input is a MM/dd/yyyy', function(done) {
                    $testPage.find('input.flexible-input').val('11/12/2015').trigger('input');
                    var tooltipTimeout = setTimeout(function() {
                        $testPage.find('input.flexible-input').off('inserted.bs.tooltip');
                        expect($testPage.find('.tooltip-inner')).toHaveText('11/12/2015');
                        done();
                    }, 300);
                    $testPage.find('input.flexible-input').one('inserted.bs.tooltip', function() {
                        clearTimeout(tooltipTimeout);
                        expect($testPage.find('.tooltip-inner')).toHaveText('11/12/2015');
                        done();
                    });
                });

                it('sets value in tooltip when input is a MM/yyyy', function(done) {
                    $testPage.find('input.flexible-input').val('11/2015').trigger('input');
                    var tooltipTimeout = setTimeout(function() {
                        $testPage.find('input.flexible-input').off('inserted.bs.tooltip');
                        expect($testPage.find('.tooltip-inner')).toHaveText('11/2015');
                        done();
                    }, 300);
                    $testPage.find('input.flexible-input').one('inserted.bs.tooltip', function() {
                        clearTimeout(tooltipTimeout);
                        expect($testPage.find('.tooltip-inner')).toHaveText('11/2015');
                        done();
                    });
                });

                it('sets value in tooltip when input is a yyyy', function(done) {
                    $testPage.find('input.flexible-input').val('2015').trigger('input');
                    var tooltipTimeout = setTimeout(function() {
                        $testPage.find('input.flexible-input').off('inserted.bs.tooltip');
                        expect($testPage.find('.tooltip-inner')).toHaveText('2015');
                        done();
                    }, 300);
                    $testPage.find('input.flexible-input').one('inserted.bs.tooltip', function() {
                        clearTimeout(tooltipTimeout);
                        expect($testPage.find('.tooltip-inner')).toHaveText('2015');
                        done();
                    });
                });

                it('invalid date is displayed in tooltip when input cannot be parsed by Datejs', function(done) {
                    $testPage.find('input.flexible-input').val('apple').trigger('input');
                    var tooltipTimeout = setTimeout(function() {
                        $testPage.find('input.flexible-input').off('inserted.bs.tooltip');
                        expect($testPage.find('.tooltip-inner')).toHaveText('Invalid Date');
                        done();
                    }, 300);
                    $testPage.find('input.flexible-input').one('inserted.bs.tooltip', function() {
                        clearTimeout(tooltipTimeout);
                        expect($testPage.find('.tooltip-inner')).toHaveText('Invalid Date');
                        done();
                    });
                });

                it('sets input value as model value if invalid date and on submit, error is shown', function() {
                    $testPage.find('input.flexible-input').val('apple').change();
                    expect($testPage.find('input.flexible-input')).toHaveValue('apple');
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('apple');
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).toHaveClass('has-error');
                });

                it('invalid date format is displayed in tooltip when input can be parsed but is in wrong format', function(done) {
                    $testPage.find('input.flexible-input').val('January 2016').trigger('input');
                    var tooltipTimeout = setTimeout(function() {
                        $testPage.find('input.flexible-input').off('inserted.bs.tooltip');
                        expect($testPage.find('.tooltip-inner')).toHaveText('Invalid Date Format');
                        done();
                    }, 300);
                    $testPage.find('input.flexible-input').one('inserted.bs.tooltip', function() {
                        clearTimeout(tooltipTimeout);
                        expect($testPage.find('.tooltip-inner')).toHaveText('Invalid Date Format');
                        done();
                    });
                });

                it('sets input value as model value if invalid date and on submit, error is shown', function() {
                    $testPage.find('input.flexible-input').val('January 2016').change();
                    expect($testPage.find('input.flexible-input')).toHaveValue('January 2016');
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('January 2016');
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).toHaveClass('has-error');
                });

                it('sets parsedDate as date and displays tooltip saying out of range', function(done) {
                    $testPage.find('input.flexible-input').val('11/01/2015').trigger('input');
                    var tooltipTimeout = setTimeout(function() {
                        $testPage.find('input.flexible-input').off('inserted.bs.tooltip');
                        expect($testPage.find('.tooltip-inner')).toContainText('Date must be between');
                        done();
                    }, 300);
                    $testPage.find('input.flexible-input').one('inserted.bs.tooltip', function() {
                        clearTimeout(tooltipTimeout);
                        expect($testPage.find('.tooltip-inner')).toContainText('Date must be between');
                        done();
                    });
                });

                it('sets parsed value as model value if out of range date and on submit, error is shown', function() {
                    $testPage.find('input.flexible-input').val('11/02/2015').change();
                    expect($testPage.find('input.flexible-input')).toHaveValue('11/02/2015');
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('11/02/2015');
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                    $testPage.find('input.flexible-input').val('11/01/2015').change();
                    expect($testPage.find('input.flexible-input')).toHaveValue('11/01/2015');
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('11/01/2015');
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).toHaveClass('has-error');
                });

                it('error is not thrown when input is valid', function() {
                    $testPage.find('input.flexible-input').val('05/12/2015').change();
                    expect($testPage.find('input.flexible-input')).toHaveValue('05/12/2015');
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('05/12/2015');
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.controldatepicker.-control')).not.toHaveClass('has-error');
                });

                //  testing for today, tomorrow, yesterday, now, t+, t-, month year
                it('sets value in model when input is today and no error is thrown on submit', function() {
                    var testDate = new Moment().format('MM/DD/YYYY');
                    $testPage.find('input.flexible-input').val('today').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe(testDate);
                    expect($testPage.find('input.flexible-input')).toHaveValue(testDate);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe(testDate);
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });

                // format is able to be parsed by datejs but is not allowed
                it('sets value in model when input is tomorrow and no error is thrown on submit', function() {
                    var testDate = new Moment().add(1, 'days').format('MM/DD/YYYY');
                    $testPage.find('input.flexible-input').val('tomorrow').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe(testDate);
                    expect($testPage.find('input.flexible-input')).toHaveValue(testDate);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe(testDate);
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });
                // format is able to be parsed by datejs but is not allowed
                it('sets value in model when input is yesterday and no error is thrown on submit', function() {
                    var testDate = new Moment().subtract(1, 'days').format('MM/DD/YYYY');
                    $testPage.find('input.flexible-input').val('yesterday').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe(testDate);
                    expect($testPage.find('input.flexible-input')).toHaveValue(testDate);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe(testDate);
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });

                it('sets value in model when input is now and no error is thrown on submit', function() {
                    var testDate = new Moment().format('MM/DD/YYYY');
                    $testPage.find('input.flexible-input').val('now').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe(testDate);
                    expect($testPage.find('input.flexible-input')).toHaveValue(testDate);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe(testDate);
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });

                it('sets value in model when input is n and no error is thrown on submit', function() {
                    var testDate = new Moment().format('MM/DD/YYYY');
                    $testPage.find('input.flexible-input').val('n').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe(testDate);
                    expect($testPage.find('input.flexible-input')).toHaveValue(testDate);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe(testDate);
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });

                it('sets value in model when input is t+ and no error is thrown on submit', function() {
                    var testDate = new Moment().add(5, 'days').format('MM/DD/YYYY');
                    $testPage.find('input.flexible-input').val('t+5').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe(testDate);
                    expect($testPage.find('input.flexible-input')).toHaveValue(testDate);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe(testDate);
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });

                it('sets value in model when input is t- and no error is thrown on submit', function() {
                    var testDate = new Moment().subtract(5, 'days').format('MM/DD/YYYY');
                    $testPage.find('input.flexible-input').val('t-5').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe(testDate);
                    expect($testPage.find('input.flexible-input')).toHaveValue(testDate);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe(testDate);
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });

                it('sets value in model when input is t+m and no error is thrown on submit', function() {
                    var testDate = new Moment().add(5, 'months').format('MM/DD/YYYY');
                    $testPage.find('input.flexible-input').val('t+5m').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe(testDate);
                    expect($testPage.find('input.flexible-input')).toHaveValue(testDate);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe(testDate);
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });

                it('sets value in model when input is t-m and no error is thrown on submit', function() {
                    var testDate = new Moment().subtract(1, 'months').format('MM/DD/YYYY');
                    $testPage.find('input.flexible-input').val('t-1m').change();
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe(testDate);
                    expect($testPage.find('input.flexible-input')).toHaveValue(testDate);
                    expect(testPage.ViewToTest.model.get('_datePicker0').get('formattedDate')).toBe(testDate);
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                });
            });
            describe('with minPrecision option', function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new SubmittableForm({
                            model: new FormModelCleanSlate(),
                            fields: [_.defaults({
                                minPrecision: 'day'
                            }, datePickerControlDefinitionFlexibleBasic)]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });
                it('contains help popover with correct formats for minPrecision of day', function(done) {
                    expect($testPage.find('button[data-toggle="tooltip"]')).toHaveLength(1);
                    $testPage.find('button[data-toggle="tooltip"]').tooltip('show');
                    var tooltipTimeout = setTimeout(function() {
                        $testPage.find('button[data-toggle="tooltip"]').off('inserted.bs.tooltip');
                        ensureCorrectHelpFormats($testPage.find('.tooltip-inner'), 'day');
                        done();
                    }, 300);
                    $testPage.find('button[data-toggle="tooltip"]').one('inserted.bs.tooltip', function() {
                        clearTimeout(tooltipTimeout);
                        ensureCorrectHelpFormats($testPage.find('.tooltip-inner'), 'day');
                        done();
                    });

                });
                it('sets parsed value as model value if not correct precision and on submit, error is shown', function() {
                    expect($testPage.find('input.flexible-input')).toHaveLength(1);
                    $testPage.find('input.flexible-input').val('11/02/2015').change();
                    expect($testPage.find('input.flexible-input')).toHaveValue('11/02/2015');
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('11/02/2015');
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).not.toHaveClass('has-error');
                    $testPage.find('input.flexible-input').val('11/2015').change();
                    expect($testPage.find('input.flexible-input')).toHaveValue('11/2015');
                    expect(testPage.ViewToTest.model.get('datePicker0')).toBe('11/2015');
                    $testPage.find('form').trigger('submit');
                    expect($testPage.find('.control.datepicker-control')).toHaveClass('has-error');
                    expect($testPage.find('span.help-block.error')).toContainText('Date must be in MM/DD/YYYY format');
                });
                it('sets parsedDate as date and displays tooltip saying invalid date when not correct precision', function(done) {
                    $testPage.find('input.flexible-input').val('').change();
                    $testPage.find('input.flexible-input').val('11/2015').trigger('input');
                    var tooltipTimeout = setTimeout(function() {
                        $testPage.find('input.flexible-input').off('inserted.bs.tooltip');
                        expect($testPage.find('.tooltip-inner')).toContainText('Invalid Date Format');
                        done();
                    }, 300);
                    $testPage.find('input.flexible-input').one('inserted.bs.tooltip', function() {
                        clearTimeout(tooltipTimeout);
                        expect($testPage.find('.tooltip-inner')).toContainText('Invalid Date Format');
                        done();
                    });
                });
            });
            describe('with sr-only label option', function() {
                beforeEach(function() {
                    testPage = new TestView({
                        view: new SubmittableForm({
                            model: new FormModelCleanSlate(),
                            fields: [_.defaults({
                                srOnlyLabel: true
                            }, datePickerControlDefinitionFlexibleBasic)]
                        })
                    });
                    testPage = testPage.render();
                    $testPage = testPage.$el;
                    $('body').append($testPage);
                });
                it('contains tooltip on calendar span', function() {
                    expect($testPage.find('button[data-toggle="tooltip"]')).toHaveLength(0);
                    expect($testPage.find('.calendar-container span.input-group-addon[data-toggle="tooltip"]')).toHaveLength(1);
                });
            });
            extensibleDatepickerTests(true, 'input.flexible-input');
        });
    });
});
