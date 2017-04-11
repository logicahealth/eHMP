/**
 * This file includes the required ext-all js and css files based upon "theme" and "direction"
 * url parameters.  It first searches for these parameters on the page url, and if they
 * are not found there, it looks for them on the script tag src query string.
 * For example, to include the neptune flavor of ext from an index page in a subdirectory
 * of extjs/examples/:
 * <script type="text/javascript" src="../../examples/shared/include-ext.js?theme=neptune"></script>
 */
(function() {
    function getQueryParam(name) {
        var regex = RegExp('[?&]' + name + '=([^&]*)');

        var match = regex.exec(location.search) || regex.exec(path);
        return match && decodeURIComponent(match[1]);
    }

    var scriptEls = document.getElementsByTagName('script'),
        path = scriptEls[scriptEls.length - 1].src,
        theme = getQueryParam('theme'),
        suffix = [],
        i = 3;
    while (i--) {
        path = path.substring(0, path.lastIndexOf('/'));
    }

    if (theme && theme !== 'classic') {
        suffix.push(theme);
    }
    suffix = (suffix.length) ? ('-' + suffix.join('-')) : '';
    if (theme === 'hmp') {
        document.write('<script type="text/javascript" src="' + path + '/lib/ext-4.2.2.1144/ext-all-debug.js"></script>');
        document.write('<link rel="stylesheet" type="text/css" href="' + path + '/css/hmp-theme-base.css"/>');
        document.write('<link rel="stylesheet" type="text/css" href="' + path + '/css/hmp-dk-blue.css"/>');
        document.write('<script type="text/javascript" src="/js/ext-theme-hmp.js" defer></script>');
    } else if (theme === 'neptune') {
        document.write('<script type="text/javascript" src="' + path + '/lib/ext-4.2.2.1144/ext-all-debug.js"></script>');
        document.write('<link rel="stylesheet" type="text/css" href="' + path + '/lib/ext-4.2.2.1144/resources/css/ext-all-neptune.css"/>');
        document.write('<script type="text/javascript" src="' + path + '/lib/ext-4.2.2.1144/ext-theme-neptune.js" defer></script>');
    } else if (theme && theme.indexOf('hi2') != -1) {
        document.write('<script type="text/javascript" src="' + path + '/lib/ext-4.2.2.1144/ext-all-debug.js"></script>');
        suffix = suffix.substring(1);
        document.write('<link rel="stylesheet" type="text/css" href="' + path + '/css/' + suffix + '.css"/>');
    } else {
        document.write('<script type="text/javascript" src="' + path + '/lib/ext-4.2.2.1144/ext-all-debug.js"></script>');
        document.write('<link rel="stylesheet" type="text/css" href="' + path + '/lib/ext-4.2.2.1144/resources/css/ext-all' + suffix + '.css"/>');
    }

})();
