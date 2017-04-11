define([
    'backbone',
    'marionette',
    'underscore',
    'hbs!app/applets/vista_health_summaries/modal/modalTemplate'
], function (Backbone, Marionette, _, modalTemplate) {
    'use strict';

    var ModalView = Backbone.Marionette.LayoutView.extend({
        template: modalTemplate,
        modelEvents: {
            'change': 'render'
        },
        initialize: function (options) {
            this.reportDetailLoadingView = ADK.Views.Loading.create();

            if (!this.model.get('detail')) {
                this.data = new ADK.UIResources.Fetch.VistaHealthSummaries.Details({
                    'site.code': this.model.get('siteKey'),
                    'id': this.model.get('reportID') + ';' + this.model.get('hsReport')
                });
                this.bindEntityEvents(this.data, this.getOption('fetchEvents'));
                this.data.fetch();

            }
        },
        regions: {
            reportDetail: '.vhs-report-detail'
        },
        fetchEvents: {
            'sync': function (model) {
                this.model.set('detail', _.get(model, 'attributes.data.detail', ''));
            },
            'error': function(error) {
                this.model.set('detail', 'Error : unable to run report');
            }
        },
        onShow: function() {
            if(!this.model.get('detail')){
                this.reportDetail.show(this.reportDetailLoadingView);
            }
        },
        onDestroy: function () {
            if (_.get(this, 'data.xhr')) {
                this.data.xhr.abort();
            }
            this.unbindEntityEvents(this.data, this.getOption('fetchEvents'));
        }
    });
    return ModalView;
});
