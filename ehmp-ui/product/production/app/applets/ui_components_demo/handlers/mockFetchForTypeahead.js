define(['jquery',
        'handlebars',
        'moment'],
    function($, Handlebars, moment) {
        'use strict';

        var newStatesArray = [{
            'description': 'Alabama',
            'code': 'AL'
        }, {
            'description': 'Alaska',
            'code': 'AK'
        }, {
            'description': 'American Samoa',
            'code': 'AS'
        }, {
            'description': 'Arizona',
            'code': 'AZ'
        }, {
            'description': 'Arkansas',
            'code': 'AR'
        }, {
            'description': 'California',
            'code': 'CA'
        }, {
            'description': 'Colorado',
            'code': 'CO'
        }, {
            'description': 'Connecticut',
            'code': 'CT'
        }, {
            'description': 'Delaware',
            'code': 'DE'
        }, {
            'description': 'District Of Columbia',
            'code': 'DC'
        }, {
            'description': 'Federated States Of Micronesia',
            'code': 'FM'
        }, {
            'description': 'Florida',
            'code': 'FL'
        }, {
            'description': 'Georgia',
            'code': 'GA'
        }, {
            'description': 'Guam',
            'code': 'GU'
        }, {
            'description': 'Hawaii',
            'code': 'HI'
        }, {
            'description': 'Idaho',
            'code': 'ID'
        }, {
            'description': 'Illinois',
            'code': 'IL'
        }, {
            'description': 'Indiana',
            'code': 'IN'
        }, {
            'description': 'Iowa',
            'code': 'IA'
        }, {
            'description': 'Kansas',
            'code': 'KS'
        }, {
            'description': 'Kentucky',
            'code': 'KY'
        }, {
            'description': 'Louisiana',
            'code': 'LA'
        }, {
            'description': 'Maine',
            'code': 'ME'
        }, {
            'description': 'Marshall Islands',
            'code': 'MH'
        }, {
            'description': 'Maryland',
            'code': 'MD'
        }, {
            'description': 'Massachusetts',
            'code': 'MA'
        }, {
            'description': 'Michigan',
            'code': 'MI'
        }, {
            'description': 'Minnesota',
            'code': 'MN'
        }, {
            'description': 'Mississippi',
            'code': 'MS'
        }, {
            'description': 'Missouri',
            'code': 'MO'
        }, {
            'description': 'Montana',
            'code': 'MT'
        }, {
            'description': 'Nebraska',
            'code': 'NE'
        }, {
            'description': 'Nevada',
            'code': 'NV'
        }, {
            'description': 'New Hampshire',
            'code': 'NH'
        }, {
            'description': 'New Jersey',
            'code': 'NJ'
        }, {
            'description': 'New Mexico',
            'code': 'NM'
        }, {
            'description': 'New York',
            'code': 'NY'
        }, {
            'description': 'North Carolina',
            'code': 'NC'
        }, {
            'description': 'North Dakota',
            'code': 'ND'
        }, {
            'description': 'Northern Mariana Islands',
            'code': 'MP'
        }, {
            'description': 'Ohio',
            'code': 'OH'
        }, {
            'description': 'Oklahoma',
            'code': 'OK'
        }, {
            'description': 'Oregon',
            'code': 'OR'
        }, {
            'description': 'Palau',
            'code': 'PW'
        }, {
            'description': 'Pennsylvania',
            'code': 'PA'
        }, {
            'description': 'Puerto Rico',
            'code': 'PR'
        }, {
            'description': 'Rhode Island',
            'code': 'RI'
        }, {
            'description': 'South Carolina',
            'code': 'SC'
        }, {
            'description': 'South Dakota',
            'code': 'SD'
        }, {
            'description': 'Tennessee',
            'code': 'TN'
        }, {
            'description': 'Texas',
            'code': 'TX'
        }, {
            'description': 'Utah',
            'code': 'UT'
        }, {
            'description': 'Vermont',
            'code': 'VT'
        }, {
            'description': 'Virgin Islands',
            'code': 'VI'
        }, {
            'description': 'Virginia',
            'code': 'VA'
        }, {
            'description': 'Washington',
            'code': 'WA'
        }, {
            'description': 'West Virginia',
            'code': 'WV'
        }, {
            'description': 'Wisconsin',
            'code': 'WI'
        }, {
            'description': 'Wyoming',
            'code': 'WY'
        }];

        // Simulate asynchronous callbackk
        function doAsync() {
            var deferredObject = $.Deferred();

            setTimeout(function() {
                deferredObject.resolve();
            }, 1000);

            return deferredObject.promise();
        }

        return function (input, setPickList, needMoreInput, onFetchError) {
            var promise = doAsync();

            promise.done(function () {
                if (input.length < 0) {
                    needMoreInput(input);
                } else {
                    setPickList({pickList: newStatesArray, input: input});
                }
            });

            promise.fail(function () {
                onFetchError(input);
            });
        };
    });
