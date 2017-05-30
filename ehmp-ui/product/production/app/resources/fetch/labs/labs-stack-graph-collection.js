/* global ADK */
define([
    'underscore',
    'backbone',
    'app/resources/fetch/labs/modal/lab-modal-collection'
], function(_, Backbone, Collection) {
    'use strict';

    return Collection.extend({
        fetchOptions: {
            resourceTitle: 'patient-record-searchbytype-lab',
            pageable: true,
            cache: false,
            collectionConfig: {}
        }
    });
});