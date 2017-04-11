define([
    "backbone",
    "marionette",
    "underscore",
    "_assets/js/helpMappings"
], function(Backbone, Marionette, _, helpMappings) {
    'use strict';

    var helpUtils = {
        mappingExist: function(key) {
            if (_.isUndefined(helpMappings[key])) {
                return false;
            }
            return true;
        },
        getTooltip: function(key) {
            if (helpMappings[key] === undefined) {
                return helpMappings.help_unavailable.tooltip;
            }
            return helpMappings[key].tooltip;
        },
        getTooltipPlacement: function(key) {
            if (helpMappings[key] === undefined) {
                return null;
            }
            return helpMappings[key].tooltip_placement;
        },
        getUrl: function(key) {
            if (helpMappings[key] === undefined) {
                return helpMappings.help_unavailable.url;
            }
            return helpMappings[key].url;
        },
        UrlExists: function(url, title, w, h, pdfLinkBool) {
            var http = new XMLHttpRequest();
            http.open('HEAD', url);
            http.onreadystatechange = function() {
                if (this.readyState == this.DONE) {
                    if (this.status != 200) {
                        helpUtils.showHelpWindow(helpMappings.page_not_found.url, title, '715', '320', false);
                    }
                }
            };
            http.send();
        },

        addPDF: function(newWindow) {
            var pdfLink = '<div class="add-pdf-container"><a id="save_as_pdf" href="' + helpMappings.pdf_version.url + '" target="_blank">PDF Version</a></div>';
            $(newWindow.document).find('body').append(pdfLink);
        },

        showHelpWindow: function(url, title, w, h, pdfLinkBool) {
            //this seems to only be used for applet header ? buttons
            var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
            var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;

            var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
            var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

            var left = ((width / 2) - (w / 2)) + dualScreenLeft;
            var top = ((height / 2) - (h / 2)) + dualScreenTop;
            var newWindow = window.open(url, title, 'location=no, menubar=no, scrollbars=yes, toolbar=no, resizable=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

            if (newWindow) {

                //newWindow.onload also causes a race condition in IE11
                //Removed it as a quick fix - added pdf link directly to the .htm page

                //dont attempt to display the download pdf button if the user is not logged in
                // if (ADK.UserService.getUserSession().get('status') === 'loggedin' && pdfLinkBool) {

                // Using an setInterval here was creating a race condition
                // This should ensure that the button is always added.
                // newWindow.onload = function() {
                //     helpUtils.addPDF(newWindow);
                // };
                // }

                if (newWindow.focus) {
                    newWindow.focus();
                }
            }
        },
        popupCenter: function(url, title, w, h) {
            //focus the window first
            helpUtils.showHelpWindow(url, title, w, h, true);
            //if we do not find the help window, display the error message
            helpUtils.UrlExists(url, title, w, h);
        }
    };

    return helpUtils;
});
