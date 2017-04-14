define(['backbone', ], function(Backbone) {
    'use strict';
    var CRS = {};
    var CSS_TAG_NAME = 'condition-based-style';
    var CRS_TOOLBAR_BUTTON = 'crsbutton';
    var CRS_ICON_CLASS_NAME = '.icon-concept-relationship';
    var CRS_ICON_HEADER_CLASS_NAME = '.icon-crs-header';
    var CRS_COLOR = 'rgb(204, 153, 102)';

    CRS.messages = {
        ZERO_RESULTS_MESSAGE: 'No current relationships in this eHMP workspace for the ',
        ERROR_MESSAGE: 'An error occurred while fetching relationships from CRS.'
    };

    CRS.navigate = {
        CRS_508_EVENT: 'focus.crs',
        CRS_GO_BACK: '#crsgoback',
        CRS_GO_FORWARD: '#crsgoforward'
    };

    CRS.screenReaderFeedback = {
        FOUND_RELATED_CONCEPT: 'CRS found related concepts. Press the alt plus W to browse forward and the alt plus Q to browse back.',
        FOUND_NO_RELATED_CONCEPT: 'CRS returned no related concepts.',
        END_OF_LIST: 'You have reached the end of the CRS related concepts.'
    };

    CRS.domain = {
        MEDICATION: 'Medication',
        LABORATORY: 'Laboratory',
        VITAL: 'Vital',
        PROBLEM: 'Problem'
    };

    CRS.system = {
        RXNORMSYSTEM: 'urn:oid:2.16.840.1.113883.6.88',
        SNOMEDSYSTEM: 'http://snomed.info/sct',
        LOINCSYSTEM: 'http://loinc.org'
    };

    CRS.crsAttributes = {
        DATACODE: 'dataCode',
        CRSDOMAIN: 'crsDomain'
    };

    CRS.activeItems = [];
    CRS.activeItemOn = -1;


    CRS.findCurrentCRSItems = function() {
        var newActiveCrsItems = $('[data-code]').filter(function() {
            return $(this).css('border-left-color') === CRS_COLOR;
        });

        var updated = false;
        if (CRS.activeItems.length !== newActiveCrsItems.length) {
            updated = true;
        }

        CRS.activeItems = newActiveCrsItems;

        return updated;
    };

    CRS.applyConceptCodeId = function(model) {
        var dataCode = '';
        var attr = {};
        var codes = model.has('codes') ? model.get('codes') : '';
        var products = model.has('products') ? model.get('products') : '';
        var crsDomain = model.has('crsDomain') ? model.get('crsDomain') : '';

        if (crsDomain) {
            if ((products && products.length > 0) && crsDomain === CRS.domain.MEDICATION) {
                var allIngredients = '';
                var ingredientRXNCode = '';
                _.forEach(products, function(product) {
                    ingredientRXNCode = product.ingredientRXNCode;

                    if (ingredientRXNCode) {
                        ingredientRXNCode = ingredientRXNCode.substring(ingredientRXNCode.lastIndexOf(':') + 1);
                        allIngredients += ingredientRXNCode + ' ';
                    }
                });
                dataCode = allIngredients.trim();
            } else if (codes && codes.length > 0) {
                _.forEach(codes, function(code) {
                    if (crsDomain === CRS.domain.LABORATORY && CRS.system.LOINCSYSTEM === code.system) {
                        dataCode += code.code + ' ';
                    } else if (crsDomain === CRS.domain.VITAL && CRS.system.LOINCSYSTEM === code.system) {
                        dataCode = code.code;
                    } else if (crsDomain === CRS.domain.PROBLEM && CRS.system.SNOMEDSYSTEM === code.system) {
                        dataCode = code.code;
                    }
                });
                dataCode = dataCode.trim();
            }

            attr[CRS.crsAttributes.DATACODE] = dataCode;
            model.set(attr);

            return {
                dataCode: dataCode
            };
        }
    };

    CRS.removeStyle = function(view) {
        if (_.isUndefined(view)) {
            return;
        }

        $(CRS.navigate.CRS_GO_BACK).off(CRS.navigate.CRS_508_EVENT);
        $(CRS.navigate.CRS_GO_FORWARD).off(CRS.navigate.CRS_508_EVENT);
        if (!_.isUndefined(CRS.buttonContainer)) {
            $(CRS.buttonContainer).detach();
        }
        CRS.activeItems = [];
        CRS.activeItemOn = -1;

        var crsStyle = view.$el.closest('html').find('head #' + CSS_TAG_NAME);
        if (crsStyle.length > 0) {
            crsStyle.remove();
        }

        view.$el.closest('body').find('.grid-applet-heading ' + CRS_ICON_HEADER_CLASS_NAME).addClass('hide');
    };

    CRS.getCssTagName = function() {
        return CSS_TAG_NAME;
    };

    CRS.getCrsIconClassName = function() {
        return CRS_ICON_CLASS_NAME;
    };

    CRS.getCrsIconHeaderClassName = function() {
        return CRS_ICON_HEADER_CLASS_NAME;
    };

    CRS.getCrsToolBarButtonName = function() {
        return CRS_TOOLBAR_BUTTON;
    };

    return CRS;
});