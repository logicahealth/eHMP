define(function() {
    'use strict';

    return {
        gistHeaders: {
            visit: {
                name: {
                    title: 'Visit Type',
                    sortable: true,
                    sortType: 'alphabetical',
                    key: 'groupName'
                },
                itemsInGraphCount: {
                    title: 'Hx Occurrence',
                    sortable: true,
                    sortType: 'numeric',
                    key: 'count'
                },
                age: {
                    title: 'Last',
                    sortable: true,
                    sortType: 'date',
                    key: 'sort_time'
                }
            },
            procedure: {
                name: {
                    title: 'Procedure name',
                    sortable: true,
                    sortType: 'alphabetical',
                    key: 'groupName'
                },
                itemsInGraphCount: {
                    title: 'Hx Occurrence',
                    sortable: true,
                    sortType: 'numeric',
                    key: 'count'
                },
                age: {
                    title: 'Last',
                    sortable: true,
                    sortType: 'date',
                    key: 'sort_time'
                }
            },
            appointment: {
                name: {
                    title: 'Appointment Type',
                    sortable: true,
                    sortType: 'alphabetical',
                    key: 'groupName'
                },
                itemsInGraphCount: {
                    title: 'Hx Occurrence',
                    sortable: true,
                    sortType: 'numeric',
                    key: 'count'
                },
                age: {
                    title: 'Last',
                    sortable: true,
                    sortType: 'date',
                    key: 'sort_time'
                }
            },
            admission: {
                name: {
                    title: 'Diagnosis',
                    sortable: true,
                    sortType: 'alphabetical',
                    key: 'groupName'
                },
                itemsInGraphCount: {
                    title: 'Hx Occurrence',
                    sortable: true,
                    sortType: 'numeric',
                    key: 'count'
                },
                age: {
                    title: 'Last',
                    sortable: true,
                    sortType: 'date',
                    key: 'sort_time'
                }
            }
        },
        filterFields: ['groupName', 'problemText', 'acuityName'],
        defaultView: 'encounters'
    };

});