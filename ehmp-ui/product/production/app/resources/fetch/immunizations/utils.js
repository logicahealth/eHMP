define([
], function() {
    'use strict';

    return {
		getAdministeredFormatted: function(response) {
	        response.administeredFormatted = '';
	        if (response.administeredDateTime) {
	            response.administeredFormatted = ADK.utils.formatDate(response.administeredDateTime).replace(/00\//g,"");
	        }
	        return response;
	    },
	    getStandardizedName: function(response) {
	        response.standardizedName = '';
	        if (response.codes) {
	            response.codes.forEach(function(code) {
	                if (code.system.indexOf('urn:oid:2.16.840.1.113883.12.292') !== -1) {
	                    response.standardizedName = code.display;
	                }
	            });
	        }
	        return response;
	    }
    };
});