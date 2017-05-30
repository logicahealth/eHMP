define([
    'app/resources/fetch/tasks/util',
    'app/resources/fetch/tasks/model'
], function (Util, Task){
    'use strict';

    var Tasks = ADK.ResourceService.PageableCollection.extend({
        resource: 'tasks-tasks',
        vpr: 'task',
        fetchType: 'POST',
        model: Task,
        // These properties are necessary for this PageableCollection to work correctly with the ResourceService
        // without calling createEmptyCollection. The ResourceService is not built to handle calling fetchCollection while 
        // passing in an existing PageableCollection
        state: {
            pageSize: 40
        },
        mode: 'client',
        parse: function(response) {
            return response.data.items;
        },
        fetchCollection: function(viewType, criteria) {
            var fetchOptions = {
                resourceTitle: this.resource,
                fetchType: this.fetchType,
                pageable: true,
                allowAbort: true,
                criteria: criteria,
                cache: false,
                collectionConfig: {
                    comparator: Util.taskComparator
                },
                viewType: viewType
            };
            return ADK.ResourceService.fetchCollection(fetchOptions, this);
        }
    });

    return Tasks;
});