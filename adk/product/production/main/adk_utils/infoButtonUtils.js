/*jshint multistr: true */
define([
    'backbone',
    'jquery',
    'moment',
    'api/Messaging'
], function(Backbone, $, moment, Messaging) {
    'use strict';

    var infoButtonUtils = {};

    function getAge(dob, sourceFormat) {

        if ($.isPlainObject(sourceFormat)) {
            sourceFormat = "YYYYMMDDHHmmssSSS";
        }

        if (dob) {
            var dobString = moment(dob, sourceFormat);
            return moment().diff(dobString, 'years');
        } else {
            return '';
        }

    }

    function getParams(info, session) {

        // mainSearchCriteria
        // taskContext
        // subTopic
        // age
        // ageGroup
        // administrativeGenderCode
        // informationRecipient
        // performer
        // encounter

        //Task context - taskContext.c.c - value list:
        // PROBLISTREV    - Problem list review (DEFAULT)
        // OE             - laboratory test order entry
        // LABOE          - laboratory test order entry
        // MEDOE          - medication order entry
        // PATDOC         - patient documentation
        // CLINNOTEE      - clinical note entry
        // DIAGLISTE      - diagnosis list entry
        // DISCHSUME      - discharge summary entry
        // PATREPE        - pathology report entry
        // PROBLISTE      - problem list entry
        // RADREPE        - radiology report entry
        // PATINFO        - patient information review
        // CLINNOTEREV    - clinical note review
        // DISCHSUMREV    - discharge summary review
        // DIAGLISTREV    - diagnosis list review
        // LABRREV        - Laboratory results!!!!!!
        // MICRORREV      - microbiology results review
        // MICROORGRREV   - microbiology organisms results review
        // MICROSENSRREV  - microbiology sensitivity test results review
        // MLREV          - Medication list!!!!
        // MARWLREV       - medication administration record work list review
        // OREV           - orders review
        // PATREPREV      - pathology report review
        // RADREPREV      - radiology report review
        // RISKASSESS     - risk assessment instrument
        // FALLRISK       - falls risk assessment instrument


        var params = {};

        params.mainSearchCriteria = {};

        var oid = session.get("infobutton-oid");
        params.oid = oid ? oid : '1.3.6.1.4.1.3768';

        var qualifiedName = info.model.get('qualifiedName');
        if (qualifiedName) {
            params.mainSearchCriteria.Dn = qualifiedName;
        } else {
            var problemText = info.model.get('problemText');
            if (problemText) {
                params.mainSearchCriteria.Dn = problemText;
            } else {
                var subKind = info.model.get('subKind');
                if (subKind) {
                    params.mainSearchCriteria.Dn = subKind;
                } else {
                    var normalizedName = info.model.get('normalizedName');
                    if (normalizedName) {
                        params.mainSearchCriteria.Dn = normalizedName;
                    } else {
                        params.mainSearchCriteria.Dn = info.model.get('displayName');
                    }
                }
            }
        }

        params.taskContext = info.model.get('infobuttonContext');

        if (!params.taskContext) {
            params.taskContext = 'PROBLISTREV';
        }

        params.age = getAge(info.patient.get('birthDate'), 'YYYYMMDD');

        var genderCode = info.patient.get('genderCode');
        if (genderCode) {
            if (genderCode.length > 2) {
                var genderParts = genderCode.split(':');
                params.gender = genderParts[genderParts.length - 1];
            }
        }

        params.performer = 'PROV';

        params.informationRecipient = 'PROV';

        params.xsltTransform = 'Infobutton_UI_VA'; //???

        return params;
    }

    function buildUrlParams(params) {
        var urlParams = '';

        if (!params)
            return urlParams;

        if (params.oid)
            urlParams += '&representedOrganization.id.root=' + params.oid;

        if (params.gender)
            urlParams += '&patientPerson.administrativeGenderCode.c=' + params.gender;

        if (params.age)
            urlParams += '&age.v.v=' + params.age + '&age.v.u=a';

        //mandatory
        urlParams += '&taskContext.c.c=' + params.taskContext;

        if (params.mainSearchCriteria) {
            if (params.mainSearchCriteria.Code)
                urlParams += '&mainSearchCriteria.v.c=' + params.mainSearchCriteria.Code;
            if (params.mainSearchCriteria.Cs)
                urlParams += '&mainSearchCriteria.v.cs=' + params.mainSearchCriteria.Cs;
            if (params.mainSearchCriteria.Dn)
                urlParams += '&mainSearchCriteria.v.dn=' + params.mainSearchCriteria.Dn;
        }

        if (params.performer)
            urlParams += '&performer=' + params.performer;

        if (params.informationRecipient)
            urlParams += '&informationRecipient=' + params.informationRecipient;

        if (params.xsltTransform)
            urlParams += '&xsltTransform=Infobutton_UI_VA';

        //cut the first &
        if (urlParams.substring(0, 1) === '&')
            urlParams = urlParams.substring(1);

        return urlParams;
    }

    infoButtonUtils.callProvider = function(info) {
        var session = ADK.UserService.getUserSession();

        var baseUrl = session.get('infobutton-site');

        var params = getParams(info, session);

        var urlParams = buildUrlParams(params);

        var url = baseUrl + urlParams;

        var winRef = window.open(url, 'infoButtonUniqueWindow', 'width=970, height=670, status=no, location=no, toolbar=no, scrollbars=no, resizable=yes');
    };

    return infoButtonUtils;
});