/* global ADK */
define([
    'moment',
    'underscore',
    'app/applets/lab_results_grid/modal/noteViewFields',
    'app/applets/lab_results_grid/resources/note'
], function (moment, _, NoteViewFields, LabResultNote) {
    "use strict";

    var NOTE_ATTRIBUTES = ['typeName', 'specimen', 'observed', 'interpretationName', 'result', 'units'];
    var INTERPRETATION_MAP = {
        'High': 'High',
        'High alert': 'Critically High',
        'Low': 'Low',
        'Low alert': 'Critically Low'
    };

    var generateNotePreview = function (model) {
        var noteValues = model.pick(NOTE_ATTRIBUTES);
        noteValues = _.chain(noteValues)
        .extend({
            observed: moment(noteValues.observed).format('MM/DD/YYYY'),
            result: noteValues.result + (' ' + noteValues.units),
            interpretationName: INTERPRETATION_MAP[noteValues.interpretationName] || ''
        })
        .omit(['units'])
        .value();

        var notePreview = _.reduce(NOTE_ATTRIBUTES, function (result, key) {
            var value = noteValues[key];
            return ((!_.isEmpty(value)) ? (result + ', ' + value) : result);
        }, '');

        return _.trim(notePreview, ', ');
    };

    //noinspection UnnecessaryLocalVariableJS
    var NoteView = ADK.UI.Form.extend({
        ui: {
            problemRelationship: '.problemRelationship',
            accept: '.accept',
            cancel: '.closeModal'
        },
        events: {
            submit: 'onSubmit',
            'click @ui.cancel': 'onCancel'
        },
        fields: NoteViewFields,
        onInitialize: function () {
            this.model.set('notePreview', generateNotePreview(this.model), {silent: true});
        },
        onBeforeRender: function () {
            this.retrieveProblemRelationships();
        },
        retrieveProblemRelationships: function () {
            var problemRelationships = new ADK.UIResources.Picklist.Notes.Problems();
            this.listenTo(problemRelationships, 'read:success', function (collection) {
                this.ui.problemRelationship.trigger('control:picklist:set', [collection.toPicklist()]);
                this.ui.problemRelationship.trigger('control:disabled', false);
                this.enableButtons(true);
            });
            this.listenTo(problemRelationships, 'read:error', function (collection, resp) {
                this.onError(resp);
            });

            problemRelationships.fetch();
        },
        enableButtons: function (isEnabled) {
            this.ui.accept.trigger('control:disabled', !isEnabled);
            this.ui.cancel.trigger('control:disabled', !isEnabled);
        },
        showErrorMessage: function (errorMessage) {
            return !_.isEmpty(errorMessage) ? this.model.set('error-message', errorMessage) : this.model.unset('error-message');
        },
        onCancel: function () {
            ADK.UI.Workflow.hide();
        },
        onSubmit: function (e) {
            e.preventDefault();
            this.showErrorMessage(null);
            this.enableButtons(false);

            var note = new LabResultNote({
                referenceId: this.model.get('uid'),
                data: this.model.pick(['annotation', 'problemRelationship'])
            });
            this.listenTo(note, 'create:success', this.onSaveSuccess);
            this.listenTo(note, 'create:error', this.onSaveError);
            note.save();
        },
        onError: function (resp) {
            var respJSON = _.get(resp, 'responseJSON', {});
            var errorMessage = (!_.isEmpty(respJSON.data) ? respJSON.data.join(', ') : (respJSON.message || 'Invalid Server Response'));
            this.showErrorMessage(errorMessage);
        },
        onSaveSuccess: function () {
            ADK.UI.Workflow.hide();
            var successGrowl = new ADK.UI.Notification({
                title: 'Success',
                message: 'Numeric lab result note created',
                type: "success"
            });
            successGrowl.show();
        },
        onSaveError: function (model, resp) {
            this.onError(resp);
            this.enableButtons(true);
        }
    });

    return NoteView;
});
