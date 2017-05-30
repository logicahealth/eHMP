define([], function() {
    'use strict';

    var APPLET_ID = 'military_hist';
    var DATA_VERSION = '2.0.r01';

    var MetaModel = ADK.Resources.Model.extend({
        vpr: 'meta',
        idAttribute: 'uid',
        childParse: false,
        defaults: {
            'description': '',
            'displayName': '',
            'siteHash': '',
            'touchedBy': '',
            'touchedOn': '',
            'name': '',
            'version': DATA_VERSION,
            'appletId': APPLET_ID,
            'applet_id': APPLET_ID
        }
    });

    return MetaModel;
});