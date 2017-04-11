define([
    'underscore',
    'backbone',
    'marionette',
    'hbs!app/applets/addApplets/list/appletSlider'
], function(_, Backbone, Marionette, appletSlider) {
    'use strict';

    var AppletsManifest = ADK.Messaging.request('AppletsManifest');
    var AppletSliderLayoutView = Backbone.Marionette.LayoutView.extend({
        template: appletSlider,
        initialize: function(options) {
            var appletsInContext = ADK.utils.contextUtils.filterAppletsGivenContext(AppletsManifest.applets);
            this.collection = new Backbone.Collection(_.filter(appletsInContext, function(applet) {
                var permissions = applet.permissions || [];
                var hasPermission = true;
                _.each(permissions, function(permission) {
                    if (!ADK.UserService.hasPermission(permission)) {
                        hasPermission = false;
                        return false;
                    }
                });
                return applet.showInUDWSelection && hasPermission;
            }));
            this.collection.comparator = 'title';
            this.collection.sort();
            this.collectionOrig = this.collection.clone();
            this.model = new Backbone.Model({});
            this.setModel();
            var self = this;
            $(window).on("resize.appletSelectionSlider",(function() {
                if (self.isDestroyed) return;
                self.setModel();
                self.render();
            }));
        },

        onBeforeDestroy: function(){
            $(window).off('resize.appletSelectionSlider');
        },

        getNumberPerSlides: function() {
            var windowWidth = $(window).width();
            return Math.ceil((windowWidth - 400) / 90);
        },
        setModel: function() {
            var appletsPerSlide = this.getNumberPerSlides();
            var slides = Math.ceil(this.collection.length / appletsPerSlide);

            if (this.collection.length === 0) {
                this.model.set({
                    'appletItemsHtml': '<div class="item active"><p class="color-pure-white">No Applets Found</p></div>'
                });
            } else {
                this.model.set({
                    'appletItemsHtml': this.getAppletItemsHtml(this.collection, appletsPerSlide)
                });
            }
        },
        onRender: function() {
            var addAppletsChannel = ADK.Messaging.getChannel('addApplets');

            var carousel = this.$el.find('.carousel').carousel({
                interval: false,
                wrap: true
            });

            var $el = this.$el;
            //add key listening
            $el.find('.fa-arrow-right').parent().on('keydown', function(evt) {
                if (evt.which === 13) {
                    /* after slide, put focus on first item */
                    carousel.on('slid.bs.carousel', function() {
                        $el.find('.active').find('.applet-thumbnail').first().focus();
                        carousel.off('slid.bs.carousel');
                    });
                }
            });
            $el.find('.fa-arrow-left').parent().on('keydown', function(evt) {
                if (evt.which === 13) {
                    /* after slide, put focus on first item */
                    carousel.on('slid.bs.carousel', function() {
                        $el.find('.active').find('.applet-thumbnail').first().focus();
                        carousel.off('slid.bs.carousel');
                    });
                }
            });

            //fix display issue when changing win size
            this.$el.find('.carousel-inner').width($(window).width() - 300);

            //enable drag
            var dragObj = this.$el.find('.item').drag({
                items: '.applet-thumbnail',
                helper: 'clone',
                start: function(e) {
                    var $helper = $el.find('.helper');
                    $helper.css('position', 'fixed');
                    $helper.hide();
                    setTimeout(function() {
                        $helper.show();
                    }, 200);
                },
                drag: function(e) {
                    var $helper = $el.find('.helper');
                    $helper.css('position', 'fixed');
                    $helper.css('left', e.pageX - $helper.width() / 2 + 'px');
                    $helper.css('top', e.pageY - $helper.height() / 2 + 'px');

                    if ($helper.hover()) {
                        var y = e.pageY - $('#gridster2').offset().top - 10;
                        var row = Math.ceil(y / 25);
                        if (row < 1) row = 1;
                        addAppletsChannel.request('addAppletPlaceholder', {
                            hoverOverRow: row
                        });
                    }
                },
                stop: function(evt, ui) {
                    var x = evt.pageX - $('#gridster2').offset().left - 50;
                    var y = evt.pageY - $('#gridster2').offset().top - 10;

                    addAppletsChannel.request('addAppletToGridster', {
                        appletId: $(this).attr('data-appletid'),
                        appletTitle: $(this).find('.applet-thumbnail-title').text(),
                        sizeX: 4,
                        sizeY: 4,
                        xPos: x,
                        yPos: y
                    });

                }
            });

            // cleanup drag object upon view destruction to clear leak
            this.listenTo(this, 'destroy', function() {
                dragObj.destroy();
            });
        },
        getAppletItemsHtml: function(collection, numberPerSlide) {
            var html = '';
            var i = 1,
                j = 1;
            if (collection.length > 0) html = '<div class="item active">';
            _.each(collection.models, function(model) {
                if (i % numberPerSlide === 1 && i !== 1) {
                    html += '<div class="item">';
                }
                var left = (j % (numberPerSlide + 1) * 87 - 50) + 'px';
                html += '<div class="applet-thumbnail" tabindex=0 data-appletid="' + model.get('id') + '" style="left: ' + left + ';"><span class="applet-thumbnail-title">' + model.get('title') + '</span><span class="sr-only">Press enter to add this applet to the workspace.</span></div>';
                if (i % numberPerSlide === 0 && i !== collection.length) {
                    html += '</div>';
                    j = 0;
                }
                i++;
                j++;
            });
            html += '</div>';
            return html;

        },
        filterApplets: function(filterText) {
            this.collection.reset(_.filter(this.collectionOrig.models, function(model) {
                return model.get('title').toLowerCase().indexOf(filterText.toLowerCase()) >= 0;
            }));
            this.setModel();
            this.render();
        }

    });

    return AppletSliderLayoutView;
});
