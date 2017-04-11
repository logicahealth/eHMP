define(['api/Messaging'], function(Messaging) {
    "use strict";

    var loadedContextAspects = {};

    var ContextAspectBuilder = {
        build: function() {
            if (_.isEmpty(this.id) || _.isEmpty(this.contexts)) return;
            loadedContextAspects[this.id] = this;
        },
        buildAll: function(success, error){
            var self = this;
            var contextManifest = Messaging.request('ContextManifest');
            var count = 0;
            var contextLength = contextManifest.contexts.length;
            var resolveAllContextsLoadedPromise = function() {
                if (count === contextLength) {
                    success();
                }
            };
            _.each(contextManifest.contexts, function(context) {
                require(['app/contexts/' + context.id + '/contextAspect'], function(context) {
                    self.build.call(context);
                    count++;
                    resolveAllContextsLoadedPromise();
                }, function() {
                    error();
                });
            });
        }
    };

    Messaging.reply('UIContextAspects', function() {
        return loadedContextAspects;
    });
    Messaging.reply('getUIContextAspect', function(aspect) {
        return loadedContextAspects[aspect];
    });

    return ContextAspectBuilder;
});