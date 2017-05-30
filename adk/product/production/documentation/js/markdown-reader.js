/* global window,Q,Backbone,$,_,Waypoint,Prism,console */

$(function() {
    'use strict';

    var md;
    if (window.markdownit) {
        md = window.markdownit({
                html: true,
                langPrefix: 'language-',
                highlight: function(str, lang) {
                    if (lang === 'HTML') {
                        lang = 'markup';
                    }
                    try {
                        var prismLang = Prism.languages[lang.toLowerCase()];
                        if (!prismLang) {
                            return '';
                        }
                        return Prism.highlight(str, prismLang);
                    } catch (__) {}
                    return ''; // use external default escaping
                }
            })
            .use(window.markdownItAttrs)
            .use(window.markdownitContainer, 'page-description')
            .use(window.markdownitContainer, 'callout')
            .use(window.markdownitContainer, 'side-note')
            .use(window.markdownitContainer, 'definition')
            .use(window.markdownitContainer, 'note', {
                validate: function(params) {
                    return params.trim().match(/^note\s+(.*)$/);
                },

                render: function(tokens, idx) {
                    var m = tokens[idx].info.trim().match(/^note\s+(.*)$/);

                    if (tokens[idx].nesting === 1) {
                        // opening tag
                        return '<div class="note-selection ' + md.utils.escapeHtml(m[1]) + '">\n';

                    } else {
                        // closing tag
                        return '</div>\n';
                    }
                }
            })
            .use(window.markdownitContainer, 'showcode', {

                validate: function(params) {
                    return params.trim().match(/^showcode\s+(.*)$/);
                },
                render: function(tokens, idx) {
                    var m = tokens[idx].info.trim().match(/^showcode\s+(.*)$/);

                    if (tokens[idx].nesting === 1) {
                        // opening tag
                        return '<details><summary>' + m[1] + '</summary>\n';

                    } else {
                        // closing tag
                        return '</details>\n';
                    }
                }
            });
        console.log('Rendering with markdown-it');
    } else if (window.marked) {
        console.log('Rendering with marked');
    } else if (window.markdown) {
        console.log('Rendering with markdown-js');
    }

    var ReadmeApp = {};
    //ReadmeApp.sectionDelimiter = '§';
    // scrollspy doesn't support symbols on a 104-key keyboard other than _ and -
    //ReadmeApp.sectionDelimiter = '--';
    ReadmeApp.sectionDelimiter = '#'; // We have our own scroll watcher so we can use # again.

    ReadmeApp.MarkdownModel = Backbone.Model.extend({
        sync: function(method, model, options) {
            if (method === 'read') {
                // This is only a markdown reader
                Backbone.sync(method, model, options);
            }
        },
        url: function(page) {
            // Hiding .md from filename because it looks ugly in the URL
            return (page || this.get('page')) + '.md';
        },
        defaults: {
            page: '',
            html: '<h1>No markdown loaded</h1>',
            text: '# No markdown loaded',
            rewriteRules: []
        },
        /**
         * Rewrite rules let you transparently redirect one page to another URL.
         * There are 2 types of rewrite rules:
         *
         * Simple type:
         * The URL fetched from the server will be: path.replace(find, rewriter) + '.md'
         * { find: /regex(.*)/,
         *   rewriter: 'replacement$1'
         * }
         *
         * Advanced type:
         * rewriter gets passed the page string and a Q deferred.
         * If the page can be rewritten, call deferred.resolve(rewrittenPage) and return
         * If the page can't be rewritten, call deferred.reject() and return
         *
         * {
         *   find: /regex(.*)/,
         *   rewriter: function(page, deferred) {
         *     rewriteAsynchronously(page,
         *       function success(newPage) {
         *         deferred.resolve(newPage);
         *       },
         *       function error() {
         *         deferred.reject();
         *       }
         *     );
         *   }
         * }
         */
        initialize: function(props) {
            props = props || {};
            this.set('rewriteRules', props.rewriteRules || this.defaults.rewriteRules);
            this.set('page', props.page || this.defaults.page);
            this.on('error', this.handleFailedFetch);
        },
        handleFailedFetch: function() {
            this.set({
                html: '<h1>Error loading page</h1>',
                text: '# Error loading page'
            });
            this.trigger('sync');
        },
        fetch: function(options) {
            if (this.get('page') === '') {
                this.set('html', this.defaults.html);
                this.set('text', this.defaults.text);
                this.trigger('sync');
                return;
            }
            this.set({
                html: '<h1>Loading ' +
                    '<div style="display: inline-block; vertical-align: middle;">' +
                    '<div class="sk-spinner sk-spinner-cube-grid">' +
                    '<div class="sk-cube"></div>' +
                    '<div class="sk-cube"></div>' +
                    '<div class="sk-cube"></div>' +
                    '<div class="sk-cube"></div>' +
                    '<div class="sk-cube"></div>' +
                    '<div class="sk-cube"></div>' +
                    '<div class="sk-cube"></div>' +
                    '<div class="sk-cube"></div>' +
                    '<div class="sk-cube"></div>' +
                    '</div>' +
                    '</div>' +
                    '</h1>',
                text: '# Loading'
            });
            this.trigger('sync');
            var self = this;
            var rewriteRules = this.get('rewriteRules');
            var originalPage = self.get('page');
            Q.any(_.map(rewriteRules, function(rewriteRule) {
                    var deferred = Q.defer();
                    // There's some code duplication with the return lines, but
                    // I'd rather bail early and avoid a long if-else chain
                    if (!rewriteRule.find || !rewriteRule.rewriter) {
                        deferred.reject();
                        return deferred.promise;
                    }
                    if (!rewriteRule.find.test(originalPage)) {
                        deferred.reject();
                        return deferred.promise;
                    }
                    if (!_.isFunction(rewriteRule.rewriter)) {
                        var rewrittenPage = originalPage.replace(rewriteRule.find, rewriteRule.rewriter);
                        deferred.resolve(rewrittenPage);
                        return deferred.promise;
                    }
                    rewriteRule.rewriter(originalPage, deferred);
                    return deferred.promise;
                }))
                .then(function rewriteHappened(rewrittenPage) {
                    return rewrittenPage;
                }, function noRewriteHappened() {
                    return originalPage;
                })
                .then(function(page) {
                    options = _.extend(options || {}, {
                        // set both dataType and mimeType to prevent console errors
                        // when loading the page locally
                        dataType: 'text',
                        mimeType: 'text/plain; charset=utf-8',
                        cache: 'false',
                        url: self.url(page)
                    });
                    self.constructor.__super__.fetch.call(self, options);
                });
        },
        parse: function(response) {
            response = {
                html: this.processCompiledMarkdown(
                    (window.markdownit && md.render(response)) ||
                    (window.marked && window.marked(response)) ||
                    (window.markdown && window.markdown.toHTML(response))
                ),
                text: response
            };
            return response;
        },
        processCompiledMarkdown: function(unprocessedCompiledMarkdown) {
            var self = this;
            var processingCompiledMarkdown = $('<div />').append($(unprocessedCompiledMarkdown));
            var d = ReadmeApp.sectionDelimiter;
            var ids = [];
            processingCompiledMarkdown.find('*').each(function() {
                var $tag = $(this);
                addIdToHeadingIfMissing($tag);
                prefixPageToHeadingId($tag);
                prefixPageToSectionLink($tag);
                transformGithubStyleMarkdownPageLinks($tag);
            });
            var processedCompiledMarkdown = processingCompiledMarkdown.html();
            return processedCompiledMarkdown;

            function addIdToHeadingIfMissing($tag) {
                // Add ids manually for convenience of switching between markdown renderers
                if ($tag.is('h1,h2,h3,h4,h5,h6') && !$tag.attr('id')) {
                    var headingLevelToStopAt = null;
                    var previousHeadingLevel = null;
                    $tag.attr('id', $tag.text().trim().replace(/[^a-zA-Z0-9]/g, '-'));

                    if ($tag.is('h3')) {
                        headingLevelToStopAt = 'h1';
                        previousHeadingLevel = 'h2';
                    } else if ($tag.is('h4')) {
                        headingLevelToStopAt = 'h2';
                        previousHeadingLevel = 'h3';
                    } else if ($tag.is('h5')) {
                        headingLevelToStopAt = 'h3';
                        previousHeadingLevel = 'h4';
                    } else if ($tag.is('h6')) {
                        headingLevelToStopAt = 'h4';
                        previousHeadingLevel = 'h5';
                    }

                    if (headingLevelToStopAt && previousHeadingLevel) {
                        var previousHeadings = $tag.prevUntil(headingLevelToStopAt, previousHeadingLevel);
                        if (previousHeadings.length > 0) {
                            $tag.attr('id', previousHeadings[0].id.split('#')[1] + '-' + $tag.attr('id'));
                        } else {
                            var specialTags = $tag.closest('blockquote, .side-note, .callout, .page-description, .definition,  .note');
                            if (specialTags.length > 0) {
                                previousHeadings = $(specialTags[0]).prevUntil(headingLevelToStopAt, previousHeadingLevel);
                                if (previousHeadings.length > 0) {
                                    $tag.attr('id', previousHeadings[0].id.split('#')[1] + '-' + $tag.attr('id'));
                                }
                            }
                        }
                    }

                    for (var i = 1; _.contains(ids, $tag.attr('id')); i++) {
                        $tag.attr('id', $tag.attr('id') + '-' + i);
                    }
                    ids.push($tag.attr('id'));

                    if ($tag.hasClass('copy-link')) {
                        $tag.append('<a class="click-to-copy" data-clipboard-text="' + window.location.href.split('#')[0] + '#/' + self.get('page') + d + $tag.attr('id') + '" data-toggle="tooltip" data-placement="bottom" title="Copy to Clipboard"><i class="fa fa-link" aria-hidden="true"></i></a>');
                    }
                }
            }

            function prefixPageToHeadingId($tag) {
                if ($tag.attr('id')) {
                    $tag.attr('id', '/' + self.get('page') + d + $tag.attr('id'));
                }
            }

            function prefixPageToSectionLink($tag) {
                var isSectionLink = /^#.+/.test($tag.attr('href'));
                if (isSectionLink) {
                    $tag.attr('href', '#/' + self.get('page') + d + $tag.attr('href').slice(1));
                }
            }

            function transformGithubStyleMarkdownPageLinks($tag) {
                var targetLocation = $tag.prop('href') || $tag.prop('src') || '';
                var path = $tag.attr('href') || $tag.attr('src') || '';
                var basename = (window.location.pathname.match(/(.*)\/[^\/]*$/) || [])[1] || '';
                var currentLocation = window.location.protocol + '//' + window.location.host + basename;
                var isRelativePath = targetLocation.indexOf(currentLocation) !== -1;
                var containsDotDotSlash = path.indexOf('../') !== -1;
                var pageBasename = (self.get('page').match(/(.*)\/[^\/]*$/) || [])[1];
                if ($tag.is('a') && (isRelativePath || containsDotDotSlash) && path.match(/.+\.md/)) {
                    var cleanedUrlParts = $tag.attr('href').match(new RegExp('^(.+)\\.md(?:(#|' + d + ')(.*))?'));
                    var cleanedUrl = cleanedUrlParts[1];
                    var delimiter = cleanedUrlParts[2];
                    var section = cleanedUrlParts[3];
                    if (delimiter && section) {
                        cleanedUrl += d + section;
                    }
                    var numberOfDirectoriesToStrip = (cleanedUrl.match(/\.\.\//g) || []).length;
                    if (numberOfDirectoriesToStrip > 0) {
                        cleanedUrl = cleanedUrl.replace('../', '');
                        while (numberOfDirectoriesToStrip) {
                            pageBasename = (pageBasename.match(/(.*)\/[^\/]*$/) || [])[1];
                            numberOfDirectoriesToStrip--;
                        }
                    }
                    $tag.attr('href', _.compact(['#', pageBasename, cleanedUrl]).join('/'));
                }
                if ($tag.is('img') && isRelativePath) {
                    var page = ReadmeApp.markdownModel.get('page');
                    var folder = page.match(/^[^\/]*/)[0];
                    if (folder === 'rdk') {
                        // we have inevitably already saved the rdk path by this point
                        var rdkPath = ReadmeApp.mainModel.get('rdkPath');
                        $tag.attr('src', rdkPath + path);
                    } else {
                        $tag.attr('src', _.compact([pageBasename, path]).join('/'));
                    }
                }
            }
        }
    });

    ReadmeApp.MarkdownView = Backbone.View.extend({
        initialize: function() {
            ReadmeApp.markdownModel.on('sync', this.render, this);
        },
        render: function() {
            this.$el.html(this.model.get('html'));
            this.$el.find('table').addClass('table table-striped table-bordered');
            // avoid race conditions when setting up waypoints
            ReadmeApp.markdownModel.trigger('markdownViewRendered', this.$el);
            this.enableClipboard();
            this.scrollIntoView();
        },
        enableClipboard: function() {
            this.clipboard = new Clipboard('a.click-to-copy');
            this.$el.find('a.click-to-copy').tooltip();
            this.clipboard.on('success', function(e) {
                e.clearSelection();
                $(e.trigger).attr('data-original-title', 'Copied!').tooltip('show');
                setTimeout(function() {
                    $(e.trigger).attr('data-original-title', 'Copy to Clipboard');
                }, 1000);
            });
            this.clipboard.on('error', function(e) {
                $(e.trigger).attr('data-original-title', 'Error when trying to copy').tooltip('show');
                setTimeout(function() {
                    $(e.trigger).attr('data-original-title', 'Copy to Clipboard');
                }, 1000);
            });
        },
        scrollIntoView: function() {
            var id = ReadmeApp.id;
            var loadedDelimiter = ReadmeApp.loadedDelimiter;
            if (loadedDelimiter === ReadmeApp.sectionDelimiter && id === '') {
                window.scrollTo(0, 0);
            } else if (id.length > 0) {
                var idMatch = document.getElementById(ReadmeApp.fragment);
                if (idMatch) {
                    idMatch.scrollIntoView(true);
                }
            }
        }
    });

    ReadmeApp.WaypointView = Backbone.View.extend({
        headingSelector: _.map(['h1', 'h2', 'h3'], function(heading) {
            var excludedParentSelectors = [
                // Exclude headings from within our custom classes
                'blockquote',
                '.side-note',
                '.callout',
                '.page-description',
                '.definition',
                '.note'
            ];
            var excludedParentsSelector = excludedParentSelectors.map(function(selector) {
                return selector + ' *';
            }).join(',');
            var headingSelector = heading + '[id]' + ':not(' + excludedParentsSelector + ')';
            return headingSelector;
        }).join(','),
        initialize: function() {
            _.bindAll(this, 'makeToc');
            ReadmeApp.markdownModel.on('markdownViewRendered', this.refreshWaypoints, this);
        },
        render: function() {
            var self = this;
            var toc = self.makeToc(self.model.get('html'));
            var backToTop2 = $('<a onclick="window.scrollTo(0, 0)"/>')
                .attr('href', '#/' + ReadmeApp.markdownModel.get('page') + '#')
                .addClass('back-to-top')
                .html('Back to top &uarr;');
            var container = $('<div />');
            container.append(toc);
            if ($(toc).find('li').length) {
                container.append(backToTop2);
            }
            this.$el.html(container);

            var $li = this.$('li');
            $li.addClass('active activechild');
            var liWidth = $li.outerWidth(true) + 5;
            var titleWidth = this.$('a.nav-page-title:first').width();
            var width = Math.max(liWidth, titleWidth);
            $li.removeClass('active activechild');
            this.$el.find('ul').outerWidth(width);
            self.$el.affix({
                offset: {
                    top: 0,
                    bottom: function() {
                        var scrollHelperHeight = 235;
                        return -$(document).height() + $('body').height() + scrollHelperHeight;
                    }
                }
            });
            this.$el.css('position', 'fixed');
        },
        refreshWaypoints: function($markdownEl) {
            this.render();
            //this.highlightSingleHeading($markdownEl);
            this.highlightVisibleHeadings($markdownEl);
        },
        highlightSingleHeading: function($markdownEl) {
            var self = this;
            var headings = $markdownEl.find(this.headingSelector);
            headings.each(function(index, contentsElem) {
                var $contentsElem = $(contentsElem);
                var $tocElem = self.getTocElemFromContentsElem($contentsElem);
                $contentsElem.waypoint(function(direction) {
                    self.$el.find('.active').removeClass('active');
                    var $activeTocElem;
                    if (direction === 'up') {
                        $activeTocElem = $tocElem.prev().find('li:last-child').addBack();
                        if ($activeTocElem.length === 0) {
                            $activeTocElem = $tocElem.parentsUntil(self.$el, 'li').first();
                        }
                    }
                    if (direction === 'down') {
                        $activeTocElem = $tocElem;
                    }
                    $activeTocElem.addClass('active');
                    $activeTocElem.parentsUntil(self.$el, 'li').addClass('active');
                }, {
                    offset: '20'
                });
            });
        },
        highlightVisibleHeadings: function($markdownEl) {
            var self = this;
            var headings = $markdownEl.find(this.headingSelector);
            headings.each(function(index, contentsElem) {
                var nextHeading = headings[index + 1];
                var $contentsElem = $(contentsElem);
                var $tocElem = self.getTocElemFromContentsElem($contentsElem);
                var $parents = $tocElem.parentsUntil(self.$el, 'li');
                var $siblings = $tocElem.siblings();
                $contentsElem.waypoint(function(direction) {
                    if (direction === 'down') {
                        $tocElem.addClass('active');
                        $parents.addClass('activechild');
                    }
                }, {
                    offset: 0
                });
                $contentsElem.waypoint(function(direction) {
                    if (direction === 'up') {
                        $tocElem.removeClass('active');
                        $tocElem.removeClass('activechild');
                    }
                    if (direction === 'down') {
                        $tocElem.addClass('active');
                        $parents.addClass('activechild');
                    }
                }, {
                    offset: 'bottom-in-view'
                });
                if (nextHeading) {
                    var $nextHeading = $(nextHeading);
                    $nextHeading.waypoint(function(direction) {
                        if (direction === 'up') {
                            $tocElem.addClass('active');
                            $parents.addClass('activechild');
                        }
                        if (direction === 'down') {
                            $tocElem.removeClass('active');
                            if (!$siblings.hasClass('active')) {
                                $parents.removeClass('activechild');
                            }
                        }
                    }, {
                        offset: 1
                    });
                } else {
                    $contentsElem.waypoint(function(direction) {
                        if (direction === 'up') {
                            $tocElem.removeClass('active');
                        }
                    }, {
                        offset: 'bottom-in-view'
                    });
                }
            });
        },
        getTocElemFromContentsElem: function($contentsElem) {
            if (!$contentsElem.attr('id')) {
                return $(null);
            }
            // Special selector characters taken from http://api.jquery.com/category/selectors/
            var escapedSizzleTarget = '#' + $contentsElem.attr('id').replace(
                /[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '\\$&');
            var $tocElem = this.$('a[href="' + escapedSizzleTarget + '"]').parents('li').first();
            return $tocElem;
        },
        makeToc: function(body) {
            var parent = $('<ul class="nav" data-heading-ref="H1">');
            var depth = 1;
            var headingSelector = this.headingSelector;
            var $body = $('<div />').append(body);
            $body.find(headingSelector).each(
                function(index, elem) {
                    var $elem = $(elem);
                    var $lastItem = parent.children().last();
                    var $link = $('<a>')
                        .attr('href', '#' + $elem.attr('id'))
                        .text($elem.text());
                    if ($elem.prop('tagName') > parent.attr('data-heading-ref')) {
                        var newParent = $('<ul class="nav">').attr('data-heading-ref', $elem.prop('tagName'));
                        if ($lastItem.length) {
                            $lastItem.append(newParent);
                            parent = newParent;
                        } else {
                            parent.attr('data-heading-ref', $elem.prop('tagName'));
                        }
                    }
                    while ($elem.prop('tagName') < parent.attr('data-heading-ref')) {
                        if (parent.parent().parent().length > 0) {
                            parent = parent.parent().parent();
                        } else {
                            parent.attr('data-heading-ref', $elem.prop('tagName'));
                        }
                    }
                    parent.append(
                        $('<li>').append($link)
                    );
                }
            );
            while (parent.parent().length > 0) {
                parent = parent.parent();
            }
            var pageTitle = $body.find('.page-description h1:first').first();
            if (pageTitle.length) {
                var backToTop1 = $('<a onclick="window.scrollTo(0, 0)"/>')
                    .attr('href', '#/' + ReadmeApp.markdownModel.get('page') + '#')
                    .addClass('nav-page-title')
                    .text(pageTitle.text().trim());
                parent.prepend(backToTop1);
            }
            return $('<div />').append(parent).html();
        }
    });
    ReadmeApp.HeaderModel = Backbone.Model.extend({
        defaults: {
            currentConfig: {},
            rdk: {},
            adk: {},
            sdk: {},
            ui: {}
        },
        initialize: function(props) {
            if (_.isObject(props)) {
                this.set(props);
            }
        },
        updateNavigationConfig: function updateNavigationConfig() {
            var self = this;
            var page = ReadmeApp.markdownModel.get('page');
            var folder = page.match(/^[^\/]*/)[0];
            if (!_.isEmpty(this.get(folder))) {
                this.set('currentConfig', this.get(folder));
                return;
            }
            Q.fcall(function() {
                    if (folder === 'adk') {
                        return './adk/';
                    } else if (folder === 'ui') {
                        return '/app/';
                    } else if (folder === 'rdk') {
                        return fetchRdkPath();
                    } else {
                        return './';
                    }
                })
                .then(self.getNavConfig)
                .then(function(data) {
                    if (folder === 'ui') {
                        return self.addDocumentedAppletsToHeader(data);
                    } else {
                        return data;
                    }
                })
                .then(function(data) {
                    self.set(folder, data);
                    return updateNavigationConfig.bind(self)();
                });
        },
        getNavConfig: function(path) {
            var deferred = Q.defer();
            $.ajax({
                    url: path + 'navigation-config.json',
                    dataType: 'json',
                    mimeType: 'application/json; charset=utf-8'
                })
                .done(function(data) {
                    deferred.resolve(data);
                })
                .fail(function() {
                    return deferred.reject();
                });
            return deferred.promise;
        },
        getAppletManifest: function() {
            var deferred = Q.defer();
            $.ajax({
                    url: '/app/applets/appletsManifest.js',
                    dataType: 'script',
                })
                .done(function(data) {
                    deferred.resolve(data);
                })
                .fail(function() {
                    return deferred.reject();
                });
            return deferred.promise;
        },
        addDocumentedAppletsToHeader: function(navigationConfig) {
            var deferred = Q.defer();
            Q.fcall(this.getAppletManifest)
                .then(function() {
                    var appletsArray = window.AppletsManifest.applets || [];
                    var documentedApplets = _.filter(appletsArray, {}); //documentation: true });
                    if (!_.isEmpty(documentedApplets)) {
                        documentedApplets = _.map(_.sortBy(documentedApplets, 'title'), function(appletObject) {
                            return {
                                name: appletObject.title,
                                url: './#/ui/applets/' + appletObject.id + '/',
                                documentation: !!appletObject.documentation
                            };
                        });
                        var rightNavItems = navigationConfig.right_nav_items || [];
                        var appletNavDropdown = _.findWhere(rightNavItems, { name: 'Applets' });
                        if (appletNavDropdown) {
                            rightNavItems = _.without(rightNavItems, appletNavDropdown);
                            _.extend(appletNavDropdown, {
                                id: 'search-applets',
                                subItems: documentedApplets,
                                type: 'searchable-list'
                            });
                        } else {
                            appletNavDropdown = {
                                id: 'search-applets',
                                name: 'Applets',
                                subItems: documentedApplets,
                                type: 'searchable-list'
                            };
                        }

                        _.extend({}, navigationConfig, {
                            'right_nav_items': rightNavItems.push(appletNavDropdown)
                        });
                    }
                    deferred.resolve(navigationConfig);
                });
            return deferred.promise;
        }
    });

    ReadmeApp.FilterModel = Backbone.Model.extend({
        defaults: {
            what: '',
            where: 'all',
            label: 'Items'
        },
        initialize: function(opts) {
            this.collection = opts.collection;
            this.filtered = new Backbone.Collection(opts.collection.models);
            this.on('change:what change:where', this.filter);
        },
        filter: function() {
            var what = this.get('what').trim(),
                where = this.get('where'),
                models;

            models = this.collection.filter(function(model) {
                if (where === 'documented' && !model.get('documentation')) return false;
                return ~model.get('name').toLowerCase().indexOf(what.toLowerCase());
            });

            this.filtered.reset(models);
        }
    });

    ReadmeApp.SearchItemsCollectionView = Backbone.View.extend({
        initialize: function(opts) {
            this.template = opts.template;
            this.listenTo(this.collection, 'reset', this.render);
            this.model = opts.model;
        },
        html: function() {
            return this.template({
                models: this.collection.toJSON(),
                label: this.model.get('label')
            });
        },
        render: function() {
            var html, $oldel = this.$el,
                $newel;

            html = this.html();
            $newel = $(html);

            this.setElement($newel);
            $oldel.replaceWith($newel);

            return this;
        }
    });

    ReadmeApp.FormView = Backbone.View.extend({
        template: _.template(
            '<div class="form-group"><input type="text" name="what" value="<%= what %>" class="form-control" placeholder="Search <%= label %>"/></div>' +
            '<div class="form-group pull-right">' +
            '<label class="radio-inline"><input type="radio" name="where" value="all" <% if (_.isEqual(where,"all")) { %> checked <% } %> > All</label>' +
            '<label class="radio-inline"><input type="radio" name="where" value="documented" <% if (_.isEqual(where,"documented")) { %> checked <% } %> > Documented</label>' +
            '</div>'
        ),
        events: {
            'input input[name="what"]': function(e) {
                this.model.set('what', e.currentTarget.value);
                if (e.keyCode === 13) e.preventDefault();
            },
            'click input[name="where"]': function(e) {
                this.model.set('where', e.currentTarget.value);
            }
        },
        render: function() {
            this.$el.html(this.template(this.model.attributes));
            this.delegateEvents(this.events);
            return this;
        }
    });

    ReadmeApp.SearchableListView = Backbone.View.extend({
        template: _.template('<form class="form-inline modal-header" autocomplete="off"></form><div class="modal-body"><div class="list-of-applets"></div></div>'),
        initialize: function(opts) {
            this.model = opts.model;
            this.model.set('where', 'all');
            this.formView = new ReadmeApp.FormView({ model: this.model });
            this.collectionView = new ReadmeApp.SearchItemsCollectionView({
                template: _.template('<div class="container-fluid"><ul class="list-inline row"><% _(models).each(function(model) { %> <li class="col-xs-12 col-sm-6 col-md-4 col-lg-3">' +
                    '<% if(!!model.documentation) { %> <a title="Click to view documentation" href="<%= model.url %>"><strong class="text-primary"><%= model.name %></strong></a> <% } else { %> <span class="text-muted" title="Not Documented"><%= model.name %></span> <% } %>' +
                    '</li> <% }); %>'+
                    '<% if (_(models).isEmpty()) { %> <li class="text-muted">No <%= label %> found.</li> <% } %>'+
                    '</ul></div>'),
                collection: this.model.filtered,
                model: this.model
            });
        },
        clearSearch: function(){
            this.model.set('what', '');
            this.$('input[name="what"]').val('');
        },
        render: function() {
            this.$el.html(this.template());
            this.formView.$el = this.$el.find('form');
            this.collectionView.$el = this.$el.find('.list-of-applets');
            this.formView.render();
            this.collectionView.render();
            this.delegateEvents(this.events);
            return this;
        },
        events: {
            'click :not("strong"):not("a")': function(e){
                if(e.target.tagName === "STRONG") return;
                e.stopPropagation();
            }
        }
    });

    ReadmeApp.HeaderView = Backbone.View.extend({
        el: $('#header'),
        initialize: function() {
            this.searchableLists = {};
            this.model = new ReadmeApp.HeaderModel();
            ReadmeApp.markdownModel.on('change:page', this.updateHeader, this);
            this.model.on('change:currentConfig', this.render, this);
        },
        render: function() {
            _.each(this.searchableLists, function(view, key) {
                delete this.searchableLists[key];
            }, this);
            var className = ReadmeApp.markdownModel.get('page').match(/^[^\/]*/)[0];
            $('body').removeClass('adk ui rdk sdk').addClass(className);
            var htmlString = "";
            htmlString += (this.model.get('currentConfig').showHomeButton) ? '<a alt="back to SDK Documentation" href="./" class="home-button"><i class="fa fa-home"></i></a>' : '';
            htmlString += '<div class="navbar-header">' +
                '<a id="headline" href="' + this.model.get('currentConfig').titleLink + '" class="navbar-brand">' +
                this.model.get('currentConfig').title + '</a>' +
                '<div class="navbar-collapse bs-navbar-collapse collapse" id="main-navbar">' +
                '<ul class="nav navbar-nav">';
            _.each(this.model.get('currentConfig').left_nav_items, function(navItem) {
                if (_.isArray(navItem.subItems) && navItem.subItems.length > 0) {
                    htmlString += '<li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">' + navItem.name + '<span class="caret"></span></a>';
                    htmlString += '<ul class="dropdown-menu">';
                    if (_.isString(navItem.url)) {
                        htmlString += '<li><a href="' + navItem.url + '"' + (navItem.newTab ? ' target="_blank"' : '') + '>' + navItem.name + '</a></li>';
                        htmlString += '<li role="separator" class="divider"></li>';
                    }
                    _.each(navItem.subItems, function(subItem) {
                        htmlString += '<li class="sub-item"><a href="' + subItem.url + '"' + (subItem.newTab ? ' target="_blank"' : '') + '>' + subItem.name + '</a></li>';
                    });
                    htmlString += '</ul></li>';
                } else {
                    htmlString += '<li><a href="' + navItem.url + '"' + (navItem.newTab ? 'target="_blank"' : '') + '>' + navItem.name + '</a></li>';
                }
            });
            htmlString += '</ul><ul class="nav navbar-nav navbar-right">';
            _.each(this.model.get('currentConfig').right_nav_items, function(navItem) {
                if (_.isArray(navItem.subItems) && navItem.subItems.length > 0) {
                    if (!_.isUndefined(navItem.type) && _.isEqual(navItem.type, 'searchable-list') && !_.isUndefined(navItem.id)) {
                        htmlString += '<li class="dropdown dropdown--full-width"><a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">' + navItem.name + '<span class="caret"></span></a>';
                        htmlString += '<div class="dropdown-menu">';
                        this.searchableLists[navItem.id] = new ReadmeApp.SearchableListView({ model: new ReadmeApp.FilterModel({ collection: new Backbone.Collection(navItem.subItems), label: navItem.name }) });
                        htmlString += '<div class="searchable-list-container-' + navItem.id + '"></div>';
                        if (_.isString(navItem.url)) {
                            htmlString += '<div class="modal-footer"><a class="btn btn-default pull-right" href="' + navItem.url + '"' + (navItem.newTab ? ' target="_blank"' : '') + '>Read about: ' + navItem.name + '</a></div>';
                        }
                        htmlString += '</div></li>';
                    } else {
                        htmlString += '<li class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">' + navItem.name + '<span class="caret"></span></a>';
                        htmlString += '<ul class="dropdown-menu">';
                        if (_.isString(navItem.url)) {
                            htmlString += '<li><a href="' + navItem.url + '"' + (navItem.newTab ? ' target="_blank"' : '') + '>' + navItem.name + '</a></li>';
                            htmlString += '<li role="separator" class="divider"></li>';
                        }
                        _.each(navItem.subItems, function(subItem) {
                            htmlString += '<li class="sub-item"><a href="' + subItem.url + '"' + (subItem.newTab ? ' target="_blank"' : '') + '>' + subItem.name + '</a></li>';
                        });
                        htmlString += '</ul></li>';
                    }
                } else {
                    htmlString += '<li><a href="' + navItem.url + '"' + (navItem.newTab ? ' target="_blank"' : '') + '>' + navItem.name + '</a></li>';
                }
            }, this);
            htmlString += '</ul></div></div>';
            this.$el.html(htmlString);
            _.each(this.searchableLists, function(view, key) {
                view.$el = this.$el.find('.searchable-list-container-' + key);
                view.render();
            }, this);
            this.renderFooterView();
        },
        updateHeader: function() {
            this.model.updateNavigationConfig();
            _.each(this.searchableLists, function(view, key) {
                if(_.isFunction(view.clearSearch)) {
                    view.clearSearch.call(view);
                }
            }, this);
        },
        renderFooterView: function() {
            var htmlString = "";
            _.each(this.model.get('currentConfig').footer_nav_items, function(navItem) {
                htmlString += '<li><a href="' + navItem.url + '">' + navItem.name + '</a></li>';
            });
            $('footer .nav').html(htmlString);
        }
    });

    ReadmeApp.MainModel = Backbone.Model.extend({
        defaults: {
            indexPage: 'index'
        },
        initialize: function(props) {
            if (_.isObject(props)) {
                this.set(props);
            }
        }
    });
    ReadmeApp.mainModel = new ReadmeApp.MainModel();

    ReadmeApp.MainView = Backbone.View.extend({
        el: $('#container'),
        initialize: function() {
            //_.bindAll(this, '_render');
            this.markdownView = new ReadmeApp.MarkdownView({
                model: ReadmeApp.markdownModel
            });
            this.waypointView = new ReadmeApp.WaypointView({
                model: ReadmeApp.markdownModel
            });
            ReadmeApp.markdownModel.on('change:page', this.render, this);
        },
        render: function() {
            var isIndexPage = ReadmeApp.mainModel.get('indexPage') === ReadmeApp.markdownModel.get('page');
            if (isIndexPage) {
                this.$el.html(
                    '<div class="bump-header bump-footer container">' +
                    '<div class="row">' +
                    '<div id="markdown" class="col-md-12"></div>' +
                    '</div>' +
                    '</div>'
                );
                this.markdownView.$el = this.$('#markdown');
                return;
            }
            this.$el.html(
                '<div id="mainContent" class="container">' +
                '<div class="row">' +
                '<div id="markdown" class="col-md-8"></div>' +
                '<div class="col-md-4">' +
                '<div id="toc"></div>' +
                '</div>' +
                '<div class="row" id="bottom-row">' +
                '<img class="img-responsive center-block hidden very-special" src="dist/image/manatee_watches_you_scroll.png" style="position: fixed;top: 0;right: ' + (document.body.clientWidth - 350) + 'px;" />' +
                '<div class="specialButton" onClick="$(\'.very-special\').toggleClass(\'hidden\')" style="position:fixed;bottom:30px;right:0;background-color:transparent;height:20px;width:20px;"></div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div id="bottomImage"></div>'
            );

            //this.$el.parent().append(scrollyFooter);
            this.markdownView.$el = this.$('#markdown');
            this.waypointView.$el = this.$('#toc');
        }
    });

    function fetchRdkPath() {
        var server = _.first(arguments);
        server = _.isString(server) ? server : '';
        var deferred = _.last(arguments);
        deferred = _.isObject(deferred) ? deferred : Q.defer();
        var savedRdkPath = ReadmeApp.mainModel.get('rdkPath' + server);
        if (savedRdkPath) {
            deferred.resolve(savedRdkPath);
            return deferred.promise;
        }
        $.ajax({
                url: '../app.json',
                dataType: 'json',
                mimeType: 'application/json; charset=utf-8'
            })
            .done(function(data) {
                var rdkPath = data.resourceDirectoryPathFetch;
                rdkPath = rdkPath.match(/(.*)resourcedirectory$/)[1] || '';
                if (!/resource/.test(rdkPath)) {
                    rdkPath += 'resource/';
                }
                if (server) {
                    rdkPath += server + '/';
                }
                rdkPath += 'docs/';
                ReadmeApp.mainModel.set('rdkPath' + server, rdkPath);
                fetchRdkPath(server, deferred);
            })
            .fail(function() {
                return deferred.reject();
            });
        return deferred.promise;
    }

    ReadmeApp.markdownModel = new ReadmeApp.MarkdownModel({
        rewriteRules: [{
            find: /^rdk\/(.*)/,
            rewriter: function rewriter(page, deferred) {
                var self = this;
                fetchRdkPath()
                    .then(function(rdkPath) {
                        var newPath = rdkPath + page.replace(self.find, '$1');
                        return deferred.resolve(newPath);
                    })
                    .fail(function() {
                        return deferred.reject();
                    });
            }
        }, {
            find: /^ui\/(.*)/,
            rewriter: function rewriter(page, deferred) {
                var self = this;
                var newPath = '/app/' + page.replace(self.find, '$1');
                if (newPath.endsWith('/')) {
                    newPath += 'README';
                }
                return deferred.resolve(newPath);
            }
        }]
    });
    ReadmeApp.Router = Backbone.Router.extend({
        initialize: function() {
            ReadmeApp.mainModel.set('indexPage', 'sdk');
            this.lastFile = '';
            this.header = new ReadmeApp.HeaderView();
            this.container = new ReadmeApp.MainView();
        },
        routes: {
            '': 'index',
            '/vx-api/:server': 'vxApi',
            '*markdownFile': 'markdownFile'
        },
        index: function() {
            this.navigate('/' + ReadmeApp.mainModel.get('indexPage'), {
                replace: true,
                trigger: true
            });
        },
        vxApi: function vxApiRoute(server) {
            var postfix = (server === 'jds') ? '/jds' : '';
            if (server === 'jds' || server === 'fetch') {
                server = false;
            }
            fetchRdkPath(server)
                .then(function(rdkPath) {
                    var vxApiPath = rdkPath + 'vx-api' + postfix;
                    window.location.replace(vxApiPath);
                });
        },
        markdownFile: function(fragment) {
            var fileHeading = fragment.match(new RegExp('/?(.+?)(' + ReadmeApp.sectionDelimiter + '|$)(.*$)'));
            var file = fileHeading[1];
            var delimiter = fileHeading[2];
            var id = fileHeading[3];
            ReadmeApp.id = id;
            ReadmeApp.loadedDelimiter = delimiter;
            ReadmeApp.fragment = fragment;
            if (this.lastFile !== file) {
                this.lastFile = file;
                ReadmeApp.markdownModel.set('page', file);
                ReadmeApp.markdownModel.fetch();
            }
        }
    });

    _.extend(Backbone.History.prototype, {
        // Put leading slashes in the URL with the fragment for cosmetics
        getFragment: function(fragment, forcePushState) {
            var routeStripper = /^#|\s+$/g;
            if (fragment == null) { // jshint ignore:line
                if (this._hasPushState || !this._wantsHashChange || forcePushState) {
                    fragment = decodeURI(this.location.pathname + this.location.search);
                    var trailingSlash = /\/$/;
                    var root = this.root.replace(trailingSlash, '');
                    if (!fragment.indexOf(root)) {
                        fragment = fragment.slice(root.length);
                    }
                } else {
                    fragment = this.getHash();
                }
            }
            return fragment.replace(routeStripper, '');
        }
    });
    ReadmeApp.router = new ReadmeApp.Router();
    Backbone.history.start();
    window.ReadmeApp = ReadmeApp;
});
