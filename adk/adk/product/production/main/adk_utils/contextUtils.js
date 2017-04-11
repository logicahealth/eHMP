define([
    'backbone',
    'underscore'
], function(
    Backbone,
    _
) {
    "use strict";

    var INHOSPITAL_SC = 'I';
    var AMBULATORY_SC = 'A';
    var DAILY_SC = 'D';
    var ANCILLARY_PACKAGE_SC = 'X';
    var TELEHEALTH_SC = 'T';
    var HISTORICAL_SC = 'E';
    var contextUtils = {};

    function getContextId(context) {
        if (context instanceof Backbone.Model) {
            return context.get('id');
        } else if (_.isObject(context)) {
            return context.id;
        }
        return context;
    }
    /**
     * Tells if source includes the given context.
     *
     * @param source A string or an array with string elements
     * @param context A string, an object with id property, or a backbone model with id attribute
     * @returns boolean
     */
    contextUtils.includesContext = function(source, context) {
        if (_.isEmpty(source)) return null;
        context = getContextId(context || ADK.WorkspaceContextRepository.currentContext);
        if (_.isString(source)) return source === context;
        return _.some(source, function(appletContext) {
            return appletContext === context;
        });
    };
    /**
     * Filters applets in the given context. If each applet's context is not set, it relies on AppletManifest's.
     *
     * @param applets An array w/ context object
     * @param context A target context. Optional. By default ADK.WorkspaceContextRepository.currentContext.
     * @returns an array of applets in given context
     */
    contextUtils.filterAppletsGivenContext = function(applets, context) {
        if (_.isEmpty(applets)) return null;
        context = getContextId(context || ADK.WorkspaceContextRepository.currentContext);
        if (_.isEmpty(applets[0].context)) {
            var AppletsManifest = ADK.Messaging.request('AppletsManifest');
            var appletsInContext = _.filter(AppletsManifest.applets, function(applet) {
                return this.includesContext(applet.context, context);
            }, this);
            return _.filter(applets, function(applet) {
                return _.some(appletsInContext, function(contextApplet) {
                    return contextApplet.id === applet.id;
                });
            });
        } else {
            return _.filter(applets, function(applet) {
                return _.includes(applet.context, context);
            });
        }
    };
    /**
     * Gets service Category for the visit
     *
     * @param locName Name of the Location 
     * @param locType where c for clinics and w for wards.
     * @param isInpatient if a patient is admitted is is set to true else to false.
     * @param isHistorical value is true if a visit is historical
     * @returns Service Category to set on the Object  
     */
    contextUtils.getServiceCategory = function(locName, locType, isInpatient, isHistorical) {
        var result;
        if (isHistorical) {
            return HISTORICAL_SC;
        }
        if (locName.toUpperCase().indexOf('TELE') > -1) {
            return TELEHEALTH_SC;
        }
        if (locType === 'c') {
            if (isInpatient) {
                return INHOSPITAL_SC;
            } else {
                return AMBULATORY_SC;
            }
        } else if (locType === 'w') {
            if (isInpatient) {
                return DAILY_SC;
            } else {
                return ANCILLARY_PACKAGE_SC;
            }
        }
    };
    return contextUtils;
});