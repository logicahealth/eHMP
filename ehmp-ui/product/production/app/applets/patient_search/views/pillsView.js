define([
    'backbone',
    'marionette',
    'hbs!app/applets/patient_search/templates/mySitePillsTemplate',
    'hbs!app/applets/patient_search/templates/common/blankTemplate'
], function(Backbone, Marionette, mySitePillsTemplate, blankTemplate) {
    "use strict";

    // constants
    var MY_SITE = 'mySite';
    var MY_CPRS_LIST_TAB = 'myCprsList';
    var NO_TAB = 'none';
    var DATE_FORMAT = 'MM/DD/YYYY';
    var SEARCHTYPE = '';

    var PillsModel = Backbone.Model.extend({
        defaults: {
            'template': mySitePillsTemplate,
            'pillsType': MY_CPRS_LIST_TAB
        }
    });
    var PillsView = Backbone.Marionette.ItemView.extend({
        tagName: 'ul',
        className: 'nav nav-pills',
        events : {
            'click li' : 'changePillType'
        },
        initialize: function() {
            this.model = new PillsModel();
            this.listenTo(this.model, 'change:template', this.render);
        },
        getTemplate: function() {
            return this.model.get('template');
        },
        onRender: function() {
            $(this.el).find('#' + this.model.get('pillsType')).addClass('active');
        },
        changePillType: function(event){
            // Set the model
            this.model.set({
                'pillsType': $(event.currentTarget).attr('id')
            });
            this.render();

            // Reset the left panel search type
            $('.patient-search-output').removeClass(SEARCHTYPE);
            SEARCHTYPE = this.model.get('pillsType');
            $('.patient-search-output').addClass(SEARCHTYPE);

            $(this.el).find('#' + this.model.get('pillsType') + ' a').focus();
        },
        changeTemplate: function(searchType) {
            if (searchType == MY_SITE) {
                this.model.set({
                    'template': mySitePillsTemplate,
                    'pillsType': NO_TAB
                });
            } else {
                this.model.set({
                    'template': blankTemplate
                });
            }
        },
        clearAllTabs: function() {
            $(this.el).find('#' + this.model.get('pillsType')).removeClass('active');
        },
        resetModels: function() {
            this.model.set({
                'pillsType': NO_TAB
            });
        },
        getTabType: function() {
            return this.model.get('pillsType');
        }
    });

    return PillsView;
});
