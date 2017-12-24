define([
    'main/accessibility/notification/component',
    'main/accessibility/skip_links/component',
], function(Notification, SkipLinksDropdown) {
    'use strict';

    var Accessibility = {
        Notification: Notification,
        SkipLinkDropdown: SkipLinksDropdown,
        SkipLinks: new SkipLinksDropdown.prototype.Collection()
    };

    return Accessibility;
});

