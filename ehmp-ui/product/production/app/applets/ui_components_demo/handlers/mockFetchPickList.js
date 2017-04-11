define(['jquery',
        'handlebars',
        'moment',
        'underscore'],
function($, Handlebars, moment, _) {
    'use strict';

    var data = [{
        group: 'Alaska/Hawaiian Time Zone',
        pickList: [{
            value: 'AK',
            label: 'Alaska'
        }, {
            value: 'HI',
            label: 'Hawaii'
        }]
    }, {
        group: 'Pacific Time Zone',
        pickList: [{
            value: 'CA',
            label: 'California'
        }, {
            value: 'NV',
            label: 'Nevada'
        }, {
            value: 'OR',
            label: 'Oregon'
        }, {
            value: 'WA',
            label: 'Washington'
        }]
    }, {
        group: 'Mountain Time Zone',
        pickList: [{
            value: 'AZ',
            label: 'Arizona'
        }, {
            value: 'CO',
            label: 'Colorado'
        }, {
            value: 'ID',
            label: 'Idaho'
        }, {
            value: 'MT',
            label: 'Montana'
        }, {
            value: 'NE',
            label: 'Nebraska'
        }, {
            value: 'NM',
            label: 'New Mexico'
        }, {
            value: 'ND',
            label: 'North Dakota'
        }, {
            value: 'UT',
            label: 'Utah'
        }, {
            value: 'WY',
            label: 'Wyoming'
        }]
    }];

    // Simulate asynchronous callbackk
    function doAsync() {
        var deferredObject = $.Deferred();
        setTimeout(function () {
            deferredObject.resolve();
        }, 500);
        return deferredObject.promise();
    }

    return function (searchText, fetchSuccess, fetchFail) {
        var promise = doAsync();

        promise.done(function () {
            var filteredData = [];

            _.each(data, function(group) {
                _.each(group.pickList, function(item) {
                    var groupObj;
                    if (item.label.length >= searchText.length &&
                        item.label.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
                        if (!groupObj) {
                            groupObj = {group: group.group};
                            groupObj.pickList = [];
                        }
                        groupObj.pickList.push(item);
                    }

                    if (groupObj) filteredData.push(groupObj);
                });
            });

            fetchSuccess({
                results: filteredData
            });
        });

        promise.fail(function () {
            fetchFail();
        });
    };
});
