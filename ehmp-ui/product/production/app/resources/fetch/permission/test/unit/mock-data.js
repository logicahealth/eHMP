define(['underscore'], function(_) {
    'use strict';


    /**
     * A single item for individual permission model.
     * @return {*}
     */
    function permissionItem() {
        return {
            'uid': 'access-general-ehmp',
            'value': 'access-general-ehmp',
            'label': 'eHMP General Access',
            'description': 'Ability to perform application specific actions as an authenticated eHMP user such as set user preferences',
            'example': 'example',
            'note': 'note',
            'version': {
                'introduced': '2.0',
                'deprecated': null,
                'startAt': '2.0.0',
                'endAt': '2.3.4'
            },
            'status': 'active',
            'nationalAccess': false,
            'createdDateTime': '20170130145959'
        };
    }


    /**
     * Array of two items for individual permission collection
     * @return {*}
     */
    function permissionCollection(forUMA) {
        var first = permissionItem();
        var second = permissionItem();
        var third = permissionItem();

        _.extend(second, {
            'uid': 'other-general-ehmp',
            'value': 'other-general-ehmp',
            'label': 'eHMP General Other',
            'description': 'Other description',
            'example': 'other example',
            'note': 'other note',
            'version': {
                'introduced': '1.0.0',
                'deprecated': null,
                'startAt': '1.0.0',
                'endAt': '1.3.4'
            }
        });
        _.extend(third, {
            'uid': 'deprecated-general-ehmp',
            'value': 'deprecated-general-ehmp',
            'label': 'eHMP General Other',
            'description': 'Other description',
            'example': 'Deprecated example',
            'note': 'Deprecated note',
            'version': {
                'introduced': '1.0.0',
                'deprecated': '1.3.4',
                'startAt': '1.0.0',
                'endAt': '1.3.4'
            },
            'status': 'deprecated'
        });
        var models = [first, second];
        if (forUMA) {
            models.push(third);
        }
        return models;
    }


    /**
     * A single item for permission set model
     * @return {*}
     */
    function setItem() {
        return {
            'uid': 'acc',
            'val': 'acc',
            'description': 'description',
            'example': 'example',
            'label': 'National Access Control Coordinator',
            'note': 'note',
            'permissions': [
                'add-permission-set',
                'edit-permission-set',
                'read-admin-screen',
                'read-permission-set',
                'deprecate-permission-set',
                'common-permission'
            ],
            'status': 'active',
            'sub-sets': [
                'Administrative'
            ],
            'version': {
                'introduced': '1.3.1',
                'deprecated': null
            },
            'authorUid': 'urn:va:user:A:1',
            'authorName': 'Doe, Jon',
            'lastUpdatedName': 'Doe, Jon',
            'createdDateTime': '20170130145959',
            'lastUpdatedUid': 'urn:va:user:9E73:1',
            'lastUpdatedDateTime': '20170130145959',
            'nationalAccess': 'true'
        };
    }


    /**
     * Array of two items for permission set collection
     * @return {*}
     */
    function setCollection(forUMA) {
        var first = setItem();
        var second = setItem();
        var third = setItem();

        _.extend(second, {
            'uid': 'other',
            'val': 'other',
            'description': 'other description',
            'example': 'other example',
            'label': 'other Access Control Coordinator',
            'note': 'other note',
            'permissions': [
                'add-other-set',
                'edit-other-set',
                'read-other-screen',
                'read-other-set',
                'deprecate-other-set',
                'common-permission'
            ],
            'version': {
                'introduced': '2.3.1',
                'deprecated': null
            },
            'authorUid': 'urn:va:user:A:2',
            'authorName': 'Doe, Jane',
            'lastUpdatedName': 'Doe, Jane'
        });
        _.extend(third, {
            'uid': 'deprecated',
            'val': 'deprecated',
            'description': 'deprecated description',
            'example': 'deprecated example',
            'label': 'deprecated Access Control Coordinator',
            'note': 'deprecated note',
            'permissions': [
                'add-deprecated-set',
                'edit-deprecated-set',
                'read-deprecated-screen',
                'read-deprecated-set',
                'deprecate-deprecated-set',
                'common-permission'
            ],
            'version': {
                'introduced': '2.3.1',
                'deprecated': '2.3.4'
            },
            'authorUid': 'urn:va:user:A:3',
            'authorName': 'Doe, Jane',
            'lastUpdatedName': 'Doe, Jane',
            'status': 'deprecated'
        });
        var models = [first, second];
        if (forUMA) {
            models.push(third);
        }
        return models;
    }


    /**
     * A single item for a feature model
     * @return {*}
     */
    function featureItem() {
        return {
            'uid': 'discharge',
            'description': 'discharge follow-up feature category',
            'label': 'discharge follow-up',
            'permissions': [
                'read-discharge-followup',
                'edit-discharge-followup',
                'discontinue-discharge-followup'
            ],
            'status': 'active'
        };
    }


    /**
     * An array of two items for a feature collection
     * @return {*}
     */
    function featureCollection() {
        var first = permissionItem();
        var second = permissionItem();

        _.extend(second, {
            'uid': 'other',
            'description': 'other',
            'label': 'other follow-up',
            'permissions': [
                'read-other-followup',
                'edit-other-followup',
                'discontinue-other-followup'
            ]
        });

        return [first, second];
    }


    return {
        permissionItem: permissionItem,
        permissionCollection: permissionCollection,
        setItem: setItem,
        setCollection: setCollection,
        featureItem: featureItem,
        featureCollection: featureCollection
    };
});