define([], function() {
    return {
        requireConfig: function(appversion) {
            require.config({
                urlArgs: "ver=" + appversion,
            });
        }
    };
});
