define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/notes/preview/notePreviewTemplate',
    'app/applets/notes/writeback/formUtil',
    'app/applets/notes/writeback/modelUtil',
    'app/applets/notes/asuUtil'
], function(Backbone, Marionette, _, previewTemplate, formUtil, modelUtil, asuUtil) {
    'use strict';
    var channel = ADK.Messaging.getChannel('notes');

    var previewView = ADK.UI.Form.extend({
        fields: [{
                    control: "container",
                    extraClasses: ["modal-body"],
                    items: [{
                        control: "container",
                        extraClasses: ["container-fluid"],
                        template: previewTemplate,
                        modelListeners: ["contentPreview", "localTitle", "referenceDateTime", "encounterDisplayName", "author", "statusDisplayName", "hideEditButtonOnPreview"]
                    },
                    //save this in case Mercury changes its mind about using a textarea for 
                    //the preview text.
                    /*
                    {
                        control: "container",
                        extraClasses: ["container-fluid"],
                        items: [{
                            control: "container",
                            extraClasses: ["container-fluid"],
                            items: [{
                                control: "container",
                                extraClasses: ["row"],
                                items: [{
                                    control: "container",
                                    extraClasses: ["col-xs-12"],
                                    items: [{
                                        control: "textarea",
                                        id: "contentPreview",
                                        name: "contentPreview",
                                        label: undefined,
                                        srOnlyLabel: 'Note text',
                                        placeholder: "",
                                        rows: 15,
                                        disabled: true,
                                        maxlength: "1000000" // 1 Megabyte is the maximum for the RDK
                                    }]
                                }]
                            }]
                        }]
                    }
                    */
                    ]

                }, {
                    control: "container",
                    extraClasses: ["modal-footer"],
                    items: [{
                        control: "container",
                        extraClasses: ["row"],
                        items: [{
                            control: "container",
                            extraClasses: ["col-xs-5"],
                        }, {
                            control: "container",
                            extraClasses: ["col-xs-7"],
                            items: [{
                                label: "Close",
                                type: "button",
                                control: "button",
                                name: "note-preview-close",
                                id: "preview-form-close-btn",
                                title: "Press enter to close preview",
                                extraClasses: ["btn-default", "btn-sm"]
                                }]
                        }]
                    }]
                }],
        events: {
            'click #note-preview-edit-btn' : 'showEditForm',
            'click #preview-form-sign-btn' : 'showSignForm',
            'click #preview-form-close-btn' : 'triggerClose',
            'keyup': function(e) {
                if (e.keyCode === 27) {
                    this.triggerClose(e);
                }
            }
        },
        onRender: function() {
            // this.setButtonVisibility();
        },
        onBeforeShow: function() {
            if(this.model.get('status').toLowerCase() === "completed"){
                this.$el.find("#preview-form-sign-btn").addClass('hidden');
            } else {
                if (!asuUtil.canSign(this.model)) {
                    this.$el.find("#preview-form-sign-btn").addClass('hidden');
                }else{
                    this.$el.find("#preview-form-sign-btn").removeClass('hidden');
                }
            }
        },
        triggerClose: function(e) {
            e.preventDefault();
            ADK.UI.Workflow.hide();
        },
        showEditForm: function(e) {
            e.preventDefault();
            this.workflow.goToPrevious();
        },
        showSignForm: function(e) {
            e.preventDefault();
            channel.trigger('note:sign', this.model, "preview");
        },
        onDestroy: function() {
            if (this.model.openTrayOnDestroy) {
                channel.trigger('tray:open');
            }
        }
    });

    return previewView;
});