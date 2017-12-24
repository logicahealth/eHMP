define([
    'backbone',
    'hbs!main/ui_views/gridster/gridsterItemViewTemplate',
    'hbs!main/components/applets/view_switchboard/switchTemplate'
], function(Backbone, template, editorTemplate){
    'use strict';

    var TECHNICAL_NAME = 'gist';
    var DISPLAYED_NAME = 'trend';

    return Backbone.Marionette.ItemView.extend({
        template: function(data) {
            if (data.isEditor) {
                return editorTemplate(data);
            }
            return template(data);
        },
        tagName: 'li',
        attributes: function() {
            return {
                'data-appletid': this.model.get('id'),
                'data-instanceid': this.model.get('instanceId'),
                'data-row': this.model.get('dataRow'),
                'data-col': this.model.get('dataCol'),
                'data-sizex': this.model.get('dataSizeX'),
                'data-sizey': this.model.get('dataSizeY'),
                'data-min-sizex': this.model.get('dataMinSizeX'),
                'data-max-sizex': this.model.get('dataMaxSizeX'),
                'data-min-sizey': this.model.get('dataMinSizeY'),
                'data-max-sizey': this.model.get('dataMaxSizeY'),
                'data-filter-name': this.model.get('filterName') || '',
                'data-view-type': this.model.get('viewType')
            };
        },
        serializeModel: function() {
            var data = this.model.toJSON();
            var viewType = this.model.get('viewType');
            data.displayText = viewType === TECHNICAL_NAME ? DISPLAYED_NAME : viewType;
            data.display = data.displayText;
            data.isEditor = this.getOption('isEditor') || false;
            return data;
        }
    });
});