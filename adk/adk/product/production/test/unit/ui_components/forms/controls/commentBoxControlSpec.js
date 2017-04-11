'use strict';
define([
    'jquery',
    'backbone',
    'marionette',
    'handlebars',
    'underscore',
    'api/Messaging',
    'main/ui_components/components',
    'api/UIComponents',
    'jasminejquery'
], function($, Backbone, Marionette, Handlebars, _, Messaging, UI) {
    var testPage, $testPage;

    var commentCollection1 = new Backbone.Collection([{
        commentString: "This is probably the primary cause of the patients pain",
        author: {
            name: "USER,PANORAMA",
            duz: {
                "9E7A": "10000000255"
            }
        },
        timeStamp: "12/14/2014 11:15PM"
    }, {
        commentString: "Some additional thoughts: this cause is so weird",
        author: {
            name: "USER,OTHER",
            duz: {
                "9E7A": "10000000238"
            }
        },
        timeStamp: "12/13/2014 11:17PM"
    }]);
    var commentCollection2 = new Backbone.Collection([{
        commentString: "This is probably the primary cause of the patients pain",
        author: {
            name: "USER,PANORAMA",
            duz: {
                "9E7A": "10000000255"
            }
        },
        timeStamp: "12/14/2014 11:15PM"
    }, {
        commentString: "Some additional thoughts: this cause is so weird",
        author: {
            name: "USER,OTHER",
            duz: {
                "9E7A": "10000000238"
            }
        },
        timeStamp: "12/13/2014 11:17PM"
    }]);
    var commentBoxControlDefinitionBasic = {
        control: "commentBox",
        name: "commentCollection1",
        attributeMapping: {
            comment: "commentString",
            author: "author",
            timeStamp: "timeStamp"
        }
    };
    var commentBoxControlDefinitionInitialValueField = {
        control: "commentBox",
        name: "commentCollection2",
        collection: commentCollection1,
        attributeMapping: {
            comment: "commentString",
            author: "author",
            timeStamp: "timeStamp"
        }
    };
    var commentBoxControlDefinitionInitialValueModel = {
        control: "commentBox",
        name: "commentCollection3",
        attributeMapping: {
            comment: "commentString",
            author: "author",
            timeStamp: "timeStamp"
        }
    };
    var FormModel = Backbone.Model.extend();
    var formModelInitialValue = new Backbone.Model({
        commentCollection3: commentCollection2
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
    var addNewComment = function(testOptions) {
        var options = testOptions || {};
        var maxLength = options.inputMaxlength || 60;
        var newText = options.commentText || 'New comment';
        var intitialCollectionLength = options.startingCommentCollectionLength || 0;
        expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row').length).toBe(intitialCollectionLength);
        expect($testPage.find('.control.comment-box .enter-comment-region span.input-char-count')).toHaveText(maxLength);
        $testPage.find('.control.comment-box .enter-comment-region input').val(newText).trigger('input');
        expect($testPage.find('.control.comment-box .enter-comment-region span.input-char-count')).toHaveText(maxLength - newText.length);
        expect($testPage.find('.control.comment-box .enter-comment-region button.add-comment-button')).toHaveLength(1);
        expect($testPage.find('.control.comment-box .enter-comment-region button.add-comment-button')).not.toBeDisabled();
        $testPage.find('.control.comment-box .enter-comment-region button.add-comment-button').click();
        expect($testPage.find('.control.comment-box .enter-comment-region input').val()).toBe('');
        expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row').length).toBe(intitialCollectionLength + 1);
        expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-text-region')).toContainText(newText);
        expect(testPage.ViewToTest.model.get(testPage.ViewToTest.fields.models[0].get('name')).models[intitialCollectionLength].get('commentString')).toBe(newText);
    };

    describe('A commentBox control', function() {
        afterEach(function() {
            testPage.remove();
        });

        describe('basic', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new UI.Form({
                        model: new FormModel(),
                        fields: [commentBoxControlDefinitionBasic]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });

            it('contains correct number of correct wrapping classes with default position', function() {
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body')).toHaveLength(1);
                expect($testPage.find('.control.comment-box .comment.enter-comment-region')).toHaveLength(1);
                expect($testPage.find('.control > div:last-of-type')).toHaveClass('enter-comment-region');
                expect($testPage.find('.control > div:first-of-type')).toHaveClass('comments-container');
            });
            it('contains an input field', function() {
                expect($testPage.find('.control.comment-box .enter-comment-region input')).toHaveLength(1);
            });
            it('with no values in add comment input has the add button disabled', function() {
                expect($testPage.find('.control.comment-box .enter-comment-region button')).toHaveLength(1);
                expect($testPage.find('.control.comment-box .enter-comment-region button')).toBeDisabled();
            });
            it('contains no comments with no initial value', function() {
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row')).toHaveLength(0);
            });
            it('adds a comment to comment region correctly', function() {
                addNewComment();
            });
            it('displays edit and delete buttons by default and contains correct title text', function() {
                // requires addNewComment() to have been called once on this model
                addNewComment();
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type button.comment-edit-button')).toHaveLength(1);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type button.comment-delete-button')).toHaveLength(1);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type button.comment-edit-button').attr('title')).toContain('Press enter to edit comment: New comment');
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type button.comment-delete-button').attr('title')).toContain('Press enter to delete comment: New comment');
            });
            it('edits correctly', function() {
                // edit is inline, val of input is comment, all other comments buttons are disabled, and updating the text
                addNewComment({
                    commentText: 'new comment 1'
                });
                addNewComment({
                    commentText: 'new comment 2',
                    startingCommentCollectionLength: 1
                });
                addNewComment({
                    commentText: 'new comment 3',
                    startingCommentCollectionLength: 2
                });
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row')).toHaveLength(3);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type button.comment-edit-button')).toHaveLength(1);
                // triggers edit mode
                $testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type button.comment-edit-button').click();
                // row should be set up correctly with input and edit buttons replacing text, edit, and delete buttons
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-text-region')).toHaveLength(0);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-edit-region')).toHaveLength(1);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-edit-region .input-region input')).toHaveLength(1);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-edit-region .button-region button.cancel-edit-comment-button')).toHaveLength(1);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-edit-region .button-region button.edit-comment-button')).toHaveLength(1);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-edit-region .button-region button.edit-comment-button')).toBeDisabled();
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-edit-region .input-region input')).toHaveValue('new comment 3');
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-edit-region span.input-char-count')).toHaveText('47');
                // edit text
                $testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-edit-region .input-region input').val('new comment 3 -- edited').trigger('input');
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-edit-region span.input-char-count')).toHaveText('37');
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-edit-region .button-region button.edit-comment-button')).not.toBeDisabled();
                // other elements should be disabled
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row button.comment-edit-button')).toHaveLength(2);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row button.comment-delete-button')).toHaveLength(2);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row button.comment-edit-button')).toBeDisabled();
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row button.comment-delete-button')).toBeDisabled();
                expect($testPage.find('.control.comment-box .muted')).toHaveLength(3);
                expect($testPage.find('.control.comment-box .enter-comment-region input')).toBeDisabled();
                expect($testPage.find('.control.comment-box .enter-comment-region button.add-comment-button')).toBeDisabled();
                // save change -- should reset to the read only view, save the change to the model, and enable all of the other elements in the control
                $testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-edit-region .button-region button.edit-comment-button').click();
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-text-region')).toHaveLength(1);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-edit-region')).toHaveLength(0);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-edit-region .input-region input')).toHaveLength(0);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-edit-region .button-region button.cancel-edit-comment-button')).toHaveLength(0);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-edit-region .button-region button.edit-comment-button')).toHaveLength(0);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-text-region')).toContainText('new comment 3 -- edited');
                expect(testPage.ViewToTest.model.get(testPage.ViewToTest.fields.models[0].get('name')).models[2].get('commentString')).toBe('new comment 3 -- edited');
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row button.comment-edit-button')).toHaveLength(3);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row button.comment-delete-button')).toHaveLength(3);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row button.comment-edit-button')).not.toBeDisabled();
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row button.comment-delete-button')).not.toBeDisabled();
                expect($testPage.find('.control.comment-box .enter-comment-region input')).not.toBeDisabled();
                expect($testPage.find('.control.comment-box .enter-comment-region button.add-comment-button')).toBeDisabled();
                expect($testPage.find('.control.comment-box .muted')).toHaveLength(0);
                // cancels edit correctly
                $testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type button.comment-edit-button').click();
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type .comment-text-region')).toHaveLength(0);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type .comment-edit-region .button-region button.cancel-edit-comment-button')).toHaveLength(1);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type .comment-edit-region .input-region input')).toHaveValue('new comment 1');
                $testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type .comment-edit-region .input-region input').val('new comment 1 -- edited').trigger('input');
                $testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type .comment-edit-region .button-region button.cancel-edit-comment-button').click();
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type .comment-text-region')).toHaveLength(1);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type .comment-edit-region')).toHaveLength(0);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type .comment-edit-region .input-region input')).toHaveLength(0);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type .comment-edit-region .button-region button.cancel-edit-comment-button')).toHaveLength(0);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type .comment-edit-region .button-region button.edit-comment-button')).toHaveLength(0);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type .comment-text-region')).toContainText('new comment 1');
                expect(testPage.ViewToTest.model.get(testPage.ViewToTest.fields.models[0].get('name')).models[0].get('commentString')).toBe('new comment 1');
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row button.comment-edit-button')).toHaveLength(3);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row button.comment-delete-button')).toHaveLength(3);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row button.comment-edit-button')).not.toBeDisabled();
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row button.comment-delete-button')).not.toBeDisabled();
                expect($testPage.find('.control.comment-box .enter-comment-region input')).not.toBeDisabled();
                expect($testPage.find('.control.comment-box .enter-comment-region button.add-comment-button')).toBeDisabled();
            });
        });

        describe('with custom input options of placeholder and maxlength', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new UI.Form({
                        model: new FormModel(),
                        fields: [_.defaults({
                            inputOptions: {
                                placeholder: "Custom Placeholder",
                                maxlength: 30
                            }
                        }, commentBoxControlDefinitionBasic)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });
            it('correctly applies the custom options', function() {
                var addCommentInputSelector = '.control.comment-box .enter-comment-region input';
                expect($testPage.find(addCommentInputSelector).attr('placeholder')).toBe("Custom Placeholder");
                addNewComment({
                    inputMaxlength: 30
                });
            });
        });
        describe('with custom commentTemplate option', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new UI.Form({
                        model: new FormModel(),
                        fields: [_.defaults({
                            commentTemplate: '{{comment}}'
                        }, commentBoxControlDefinitionBasic)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });
            it('correctly applies the commentTemplate option', function() {
                addNewComment();
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:last-of-type .comment-text-region')).toHaveText("New comment");
            });
        });
        describe('with custom disabled option', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new UI.Form({
                        model: new FormModel(),
                        fields: [_.defaults({
                            disabled: true
                        }, commentBoxControlDefinitionBasic)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });
            it('correctly applies the disabled option', function() {
                expect($testPage.find('.commentCollection1 .enter-comment-region .input-region input')).toHaveProp('disabled', true);
                expect($testPage.find('.commentCollection1 button')).toHaveProp('disabled', true);
            });
        });
        describe('with custom required option', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new UI.Form({
                        model: new FormModel(),
                        fields: [_.defaults({
                            required: true
                        }, commentBoxControlDefinitionBasic)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });
            it('correctly applies the required option', function() {
                expect($testPage.find('.commentCollection1 .comment-required')).toHaveText('Write at least one comment.');
                expect($testPage.find('.commentCollection1 .comment-required input')).toHaveValue('0');
            });
        });

        describe('with allowEdit and allowDelete options set as bool and func', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new UI.Form({
                        model: new FormModel(),
                        fields: [_.defaults({
                            allowEdit: function() {
                                return false;
                            },
                            allowDelete: false
                        }, commentBoxControlDefinitionBasic)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });
            it('displays edit and delete buttons by default', function() {
                // requires addNewComment() to have been called once on this model
                addNewComment();
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type button.comment-edit-button')).toHaveLength(0);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:first-of-type button.comment-delete-button')).toHaveLength(0);
            });
        });

        describe('with maxComments option set as 1', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new UI.Form({
                        model: new FormModel(),
                        fields: [_.defaults({
                            maxComments: 1
                        }, commentBoxControlDefinitionBasic)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });
            it('only allows 1 comment to be entered', function() {
                // requires addNewComment() to have been called once on this model
                expect($testPage.find('.control.comment-box .enter-comment-region input')).not.toBeDisabled();
                expect($testPage.find('.control.comment-box .enter-comment-region input')).not.toHaveProp('readonly', true);
                expect($testPage.find('.control.comment-box .enter-comment-region input')).not.toHaveProp('placeholder', 'Comment limit exceeded');
                expect($testPage.find('.control.comment-box .enter-comment-region input')).not.toHaveProp('title', 'The comment limit has exceeded. To enter a new comment, remove an existing comment.');
                expect($testPage.find('.control.comment-box .enter-comment-region label')).toHaveText('Comment Box');
                addNewComment();
                expect($testPage.find('.control.comment-box .enter-comment-region input')).toHaveProp('readonly', true);
                expect($testPage.find('.control.comment-box .enter-comment-region input')).toHaveProp('placeholder', 'Comment limit exceeded');
                expect($testPage.find('.control.comment-box .enter-comment-region input')).toHaveProp('title', 'The comment limit has exceeded. To enter a new comment, remove an existing comment.');
                expect($testPage.find('.control.comment-box .enter-comment-region label')).toHaveText('Comment Box Disabled');
            });
        });

        describe('with addCommentPosition option set as top', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new UI.Form({
                        model: new FormModel(),
                        fields: [_.defaults({
                            addCommentPosition: 'top'
                        }, commentBoxControlDefinitionBasic)]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });
            it('correctly positions the add comment input region', function() {
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body')).toHaveLength(1);
                expect($testPage.find('.control.comment-box .comment.enter-comment-region')).toHaveLength(1);
                expect($testPage.find('.control > div:first-of-type')).toHaveClass('enter-comment-region');
                expect($testPage.find('.control > div:last-of-type')).toHaveClass('comments-container');
            });
            it('correctly adds a comment', function() {
                addNewComment();
            });
        });

        describe('with initial value in fields', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new UI.Form({
                        model: new FormModel(),
                        fields: [commentBoxControlDefinitionInitialValueField]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });

            it('contains correct number of correct wrapping classes', function() {
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body')).toHaveLength(1);
                expect($testPage.find('.control.comment-box .comment.enter-comment-region')).toHaveLength(1);
            });
            it('contains correct number of initial comments', function() {
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row')).toHaveLength(commentBoxControlDefinitionInitialValueField.collection.length);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:nth-of-type(1)')).toContainText(commentBoxControlDefinitionInitialValueField.collection.models[0].get('commentString'));
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:nth-of-type(2)')).toContainText(commentBoxControlDefinitionInitialValueField.collection.models[1].get('commentString'));
            });
            it('adds a comment to comment region correctly', function() {
                addNewComment({
                    startingCommentCollectionLength: 2
                });
            });
        });

        describe('with initial value in model', function() {
            beforeEach(function() {
                testPage = new TestView({
                    view: new UI.Form({
                        model: formModelInitialValue,
                        fields: [commentBoxControlDefinitionInitialValueModel]
                    })
                });
                testPage = testPage.render();
                $testPage = testPage.$el;
                $('body').append($testPage);
            });
            it('contains correct number of correct wrapping classes', function() {
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body')).toHaveLength(1);
                expect($testPage.find('.control.comment-box .comment.enter-comment-region')).toHaveLength(1);
            });
            it('contains correct number of initial comments', function() {
                expect(commentBoxControlDefinitionInitialValueModel.name).toBe('commentCollection3');
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row').length).toBe(commentCollection2.length);
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:nth-of-type(1)')).toContainText(commentCollection2.models[0].get('commentString'));
                expect($testPage.find('.control.comment-box .faux-table-container.comments-container .body .table-row:nth-of-type(2)')).toContainText(commentCollection2.models[1].get('commentString'));
            });
            it('adds a comment to comment region correctly', function() {
                addNewComment({
                    startingCommentCollectionLength: 2
                });
            });
        });
        describe("using trigger to dynamically change attributes", function() {
            beforeEach(function() {
                testPage = new UI.Form({
                    model: new FormModel(),
                    fields: [commentBoxControlDefinitionBasic]
                });
                $testPage = testPage.render().$el;
                $("body").append($testPage);
            });

            it("hidden", function() {
                $testPage.find('.commentCollection1').trigger("control:hidden", true);
                expect($testPage.find('.commentCollection1')).toHaveClass('hidden');
                $testPage.find('.commentCollection1').trigger("control:hidden", false);
                expect($testPage.find('.commentCollection1')).not.toHaveClass('hidden');
            });
            it("disabled", function() {
                $testPage.find('.commentCollection1 .enter-comment-region .input-region input').val('test').trigger('input').change();
                $testPage.find('.commentCollection1').trigger("control:disabled", true);
                expect($testPage.find('.commentCollection1 .enter-comment-region .input-region input')).toHaveProp('disabled', true);
                expect($testPage.find('.commentCollection1 button')).toHaveProp('disabled', true);
                $testPage.find('.commentCollection1').trigger("control:disabled", false);
                expect($testPage.find('.commentCollection1 .enter-comment-region .input-region input')).toHaveProp('disabled', false);
                expect($testPage.find('.commentCollection1 button')).toHaveProp('disabled', false);
            });
            it("required", function() {
                $testPage.find('.commentCollection1').trigger("control:required", true);
                expect($testPage.find('.commentCollection1 .comment-required')).toHaveText('Write at least one comment.');
                expect($testPage.find('.commentCollection1 .comment-required input')).toHaveValue('0');
                $testPage.find('.commentCollection1').trigger("control:required", false);
                expect($testPage.find('.commentCollection1 .comment-required')).not.toExist();
                expect($testPage.find('.commentCollection1 .comment-required input')).not.toExist();
            });
        });
    });
});
