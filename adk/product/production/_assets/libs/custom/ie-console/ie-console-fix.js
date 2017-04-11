if ((!window.console) || (!console.log)) {
    var console = {};
    var consoleMethods = ["assert", "count", "debug", "dir", "dirxml", "error", "_exception", "group", "groupCollapsed", "groupEnd", "info", "log", "profile", "profileEnd", "table", "time", "timeEnd", "timeStamp", "trace", "warn"];
    var i, emptyFunction = function() {};
    for (i = 0; i < consoleMethods.length; i++) {
        console[consoleMethods[i]] = emptyFunction;
    }
}