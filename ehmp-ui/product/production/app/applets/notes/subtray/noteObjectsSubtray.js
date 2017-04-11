define([
    'backbone',
    'marionette',
    'jquery',
    'handlebars',
    'moment',
    'hbs!app/applets/notes/subtray/noteObjectTemplate',
    'hbs!app/applets/notes/subtray/noteObjectSubtrayTemplate'
], function(Backbone, Marionette, $, Handlebars, moment, NoteObjectTemplate, NoteSubtrayTemplate) {
    'use strict';
    var LINE_LENGTH = 90;
    var noteObjectChannel = ADK.Messaging.getChannel('note-subtray');

    var formatNoteObjectString = function(text) {
        text = Handlebars.Utils.escapeExpression(text).replace(/\n/g, "<br />");
        return new Handlebars.SafeString(text);
    };

    var LoadingView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<h5 class="loading"><i class="fa fa-spinner fa-spin"></i> Loading...</h5>')
    });

    var NoResultsView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<div aria-live="assertive"><p class="error-message padding" role="alert">No note objects found.</p></div>'),
        tagName: "p"
    });
    var ErrorView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile('<div aria-live="assertive"><p class="error-message padding" role="alert">{{errorMessage}}</p></div>'),
        initialize: function(options) {
            this.model.set('errorMessage', options.errorMessage);
        },
        tagName: "p"
    });
    var NoteObjectDetailView = Backbone.Marionette.ItemView.extend({
        template: Handlebars.compile("<p>{{formatText}}</p>"),
        templateHelpers: function() {
            return {
                formatText: function() {
                    var text = this.data.noteObjectString;
                    return formatNoteObjectString(text);
                }
            };
        }
    });
    var NoteObjectModel = Backbone.Model.extend({
        defaults: {
            creationDateTime: '',
            data: {}
        }
    });
    var NoteObjectCollection = Backbone.Collection.extend({
        model: NoteObjectModel,
        comparator: function(a, b) {
            var adate = moment(a.get('creationDateTime'), 'YYYYMMDDHHmmss+SSSS').valueOf();
            var bdate = moment(b.get('creationDateTime'), 'YYYYMMDDHHmmss+SSSS').valueOf();
            if (adate === bdate) {
                return 0;
            }
            else {
                return adate > bdate ? -1 : 1;
            }
        },
    });
    var NoteObjectView = Backbone.Marionette.ItemView.extend({
        template: NoteObjectTemplate,
        className: "well well-sm bottom-margin-xs",
        ui: {
            viewNoteObjectButton: '#view-note-object-btn',
            addNoteObjectButton: '#add-note-object-btn'
        },
        events: {
            'click @ui.viewNoteObjectButton': 'launchNoteObjectModal',
            'click @ui.addNoteObjectButton': 'addNoteObjectToTextArea'
        },
        onBeforeShow:function () {
            this.listenTo(noteObjectChannel, 'note:disabled', function() {
                this.$el.find('button.add-note-object').attr('disabled', true).addClass('disabled');
            });
            this.listenTo(noteObjectChannel, 'note:enabled', function() {
                this.$el.find('button.add-note-object').attr('disabled', false).removeClass('disabled');
            });
        },
        onRender: function() {
            var enabled = noteObjectChannel.request('note:ready');
            if(!enabled) {
                this.$el.find('button.add-note-object').attr('disabled', true).addClass('disabled');
            } else {
                this.$el.find('button.add-note-object').attr('disabled', false).removeClass('disabled');
            }
        },
        templateHelpers: function() {
            return {
                formatText: function() {
                    var text = this.data.noteObjectString.replace(/\r/g, '');
                    if (text.length > LINE_LENGTH) {
                        var newAry = [];
                        var currentSize = 0;
                        var toAdd;
                        _.each(text.split('\n'), function(sub) {
                            toAdd = currentSize + sub.length <= LINE_LENGTH ? sub.length : LINE_LENGTH - currentSize;
                            currentSize += toAdd;
                            newAry.push(sub.substring(0, toAdd));
                            if (currentSize == LINE_LENGTH) {
                                return;
                            }
                        });
                        text = newAry.join('\n').trim() + '...';
                    }
                    return formatNoteObjectString(text);
                },
                formatTime: function() {
                    var date = this.creationDateTime;
                    var fmtDate = moment(date, 'YYYYMMDDHHmmssZ').format('MM/DD/YYYY | HH:mm');
                    return fmtDate;
                }
            };
        },
        launchNoteObjectModal: function(event) {
            event.preventDefault();
            var view = new NoteObjectDetailView();
            view.model = this.model;

            var modalOptions = {
                'title': 'Note Object',
                'size': "medium",
                'backdrop': false
            };

            var modalView = new ADK.UI.Modal({view: view, options: modalOptions});
            modalView.show();
        },
        addNoteObjectToTextArea: function(event) {
            event.preventDefault();
            ADK.Messaging.getChannel('notes').trigger('insert:text', this.model.get('data').noteObjectString);
        }
    });

    var NoteObjectCollectionView = Backbone.Marionette.CompositeView.extend({
        behaviors: {
            HelpLink: {
                mapping: 'note_objects_subtray',
                container: '.note-objects-help-button-container',
                buttonOptions: {
                    colorClass: 'bgc-primary-dark'
                }
            },
            FlexContainer: {
                container: '.modal-header',
                direction: 'row',
                alignItems: 'flex-start'
            }
        },
        template: NoteSubtrayTemplate,
        childView: NoteObjectView,
        emptyView: LoadingView,
        collectionEvents: {
            'notes-object-get:success': function(collection, response) {
                this.collection.reset(collection.toJSON());
                if (collection.length < 1){
                    this.emptyView = NoResultsView;
                }
            },
            'notes-object-get:error': function(collection, resp) {
                if (resp.responseText.toLowerCase().indexOf('not found') > -1){
                    this.emptyView = NoResultsView;
                } else {
                    this.emptyViewOptions.errorCode = resp.status;
                    this.emptyViewOptions.errorMessage = 'There was an error fetching your Note Objects. Error code: ' +resp.status;
                    this.emptyView = ErrorView;
                }
                this.render();
                //this.showTestData();
            }
        },
        childViewContainer: '.note-object-container',
        className: "modal-content",
        initialize: function() {
            this.collection = new NoteObjectCollection();
            this.emptyViewOptions = {
                errorMessage: 'There was an error fetching your Note Objects.'
            };
            this.listenTo(noteObjectChannel, 'subTray:opened', function() {
                this.updateSubtray();
            });
            this.listenTo(noteObjectChannel, 'subTray:closed', function() {
                this.emptyView = LoadingView;
                this.collection.reset();
            });
        },
        updateSubtray: function() {
            var note = noteObjectChannel.request('note:model');
            if (!note.get('locationUid')) {
                this.emptyViewOptions.errorMessage = 'Note encounter has no visit location. Unable to fetch Note objects.';
                this.emptyView = ErrorView;
                this.render();
            } else {
                this.fetchNoteObjects(note);
            }
        },
        fetchNoteObjects: function(note) {
            var self = this;
            var site = note.get('siteHash') || ADK.UserService.getUserSession().get('site');
            var fetchOptions = {
                resourceTitle: 'notes-objects-get',
                fetchType: 'GET',
                cache: false,
                patient : ADK.PatientRecordService.getCurrentPatient(),
                criteria: {
                    visitLocation: note.get('locationUid'),
                    visitDateTime: note.get('encounterDateTime'),
                    visitServiceCategory:note.get('encounterServiceCategory')
                },
            };
            fetchOptions.onError = function(model, resp) {
                self.collection.trigger('notes-object-get:error', model, resp);
            };
            fetchOptions.onSuccess = function(coll) {
                self.collection.trigger('notes-object-get:success', coll);
            };
            ADK.PatientRecordService.fetchCollection(fetchOptions);
        },
        showTestData : function () {
            var testData = [{
                'creationDateTime': '20160101092500+0000',
                'data': {
                    noteObjectString:'DIABETES MELLI W/O COMP TYP II\nOrdered >> Discontinue Pneumovax 0.5 cc IM once\r\n<Requesting Physician Cancelled>\r\n\nTest annotation text',
                    problemText: 'HYPERTENSION NOS',
                }
                },{
                    'creationDateTime': '20160101080000+0005',
                    'data': {
                        noteObjectString:'COMPARE PLUS 5',
                    }
                }, {
                    'creationDateTime': '20160201080000+0000',
                    'data': {
                        noteObjectString:'DIABETES TEST DATA: It\'s a test of \"stuff\".Test annotation that is more than 80 characters long. This needs to be long so I can cut it off and add ellipses.',
                        problemText: 'DIABETES TEST DATA',
                    }
                }, {
                    'creationDateTime': '20160301080000+0000',
                    'data': {
                        noteObjectString:'DIABETES TEST DATA: Test annotation that is more than 80 characters long. This needs to be long so I can cut it off and add ellipses.',
                        problemText: 'DIABETES TEST DATA',
                    }
                }, {
                    'creationDateTime': '20160101080000+0020',
                    'data': {
                        noteObjectString:'COMPARE PLUS 20',
                    }
                }, {
                    'creationDateTime': '20160205080000+0000',
                    'data': {
                        noteObjectString:'DIABETES TEST DATA: Test annotation that is more than 80 characters long. This needs to be long so I can cut it off and add ellipses.',
                        problemText: 'DIABETES TEST DATA',
                    }
                }, {
                    'creationDateTime': '20150101080000+0000',
                    'data': {
                        noteObjectString:'DIABETES TEST DATA: Test annotation that is more than 80 characters long. This needs to be long so I can cut it off and add ellipses.',
                        problemText: 'DIABETES TEST DATA',
                    }
                } ,{
                    'creationDateTime': '20160101080000+0010',
                    'data': {
                        noteObjectString:'COMPARE PLUS 10',
                    }
                }, {
                    'creationDateTime': '20160101080000+0000',
                    'data': {
                        noteObjectString:'COMPARE',
                    }
                }];

                var testCollection = new NoteObjectCollection(testData).sort();
                this.collection.reset(testCollection.toJSON());
        }
    });

    return NoteObjectCollectionView;
});
