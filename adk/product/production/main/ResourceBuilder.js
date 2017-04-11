define(['api/Messaging', 'main/Session', ], function(Messaging, Session) {
    "use strict";
    var ResourcesManifest = Messaging.request('ResourcesManifest');
    var loadedResources = {};
    var ResourceBuilder = {
        build: function() {
            if (_.isUndefined(this.id) || _.isUndefined(this.resources)) return;
            var resource = loadedResources[this.id] = {};
            _.each(this.resources, function(val, key) {
                resource[key] = val;
            });
        },
        buildAll: function() {
            var resources = ResourcesManifest.resources;
            var resourceCount = 0;
            var resourceLength = resources.length;
            var resolveAllUIResourcesLoadedPromise = function() {
                if (resourceCount === resourceLength) {
                    Messaging.trigger('ResourcesLoaded');
                    Session.allUIResourcesLoadedPromise.resolve();
                }
            };
            _.each(resources, function(resource) {
                require(['app/resources/' + resource.id + '/resources'], function(resource) {
                    ResourceBuilder.build.call(resource);
                    resourceCount++;
                    resolveAllUIResourcesLoadedPromise();
                }, function(err) {
                    // since resource failed to load and we aren't trying to reload the resource, we can decrement the
                    // total number of resources in order to correctly resolve the load promise
                    console.error('Error loading resource with id of: ' + resource.id + '.', err);
                    resourceLength--;
                    resolveAllUIResourcesLoadedPromise();
                });
            });
        }
    };
    Messaging.reply('UIResources', function() {
        return loadedResources;
    });

    return ResourceBuilder;
});