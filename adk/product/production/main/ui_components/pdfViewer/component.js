define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'handlebars',
    'api/Messaging',
    'pdf'
], function(Backbone, Marionette, $, _, Handlebars, Messaging, pdf) {
    'use strict';

    var HeaderView = Marionette.ItemView.extend({
        className: 'pdf-header pdf-toolbar text-center',
        modelEvents: {
            'change:page': 'render togglePageButtons toggleZoomButtons',
            'change:pages': 'render togglePageButtons toggleZoomButtons',
            'change:scale': 'toggleZoomButtons'
        },
        template: Handlebars.compile(
            '<button class="zoom-out btn btn-default"><i class="fa fa-search-minus"></i></button>' +
            '<button class="zoom-in btn btn-default"><i class="fa fa-search-plus"></i></button>' +
            '<span class="pages">{{page}}/{{pages}}</span>' +
            '<button class="previous-page btn btn-default"><i class="fa fa-chevron-left"></i></button>' +
            '<button class="next-page btn btn-default"><i class="fa fa-chevron-right"></i></button>'
        ),
        toggleZoomButtons: function() {
            var scale = this.model.get('scale');
            this.$('.zoom-in').attr('disabled', scale == this.getOption('zoomMax'));
            this.$('.zoom-out').attr('disabled', scale == this.getOption('zoomMin'));
        },
        togglePageButtons: function() {
            var page = this.model.get('page');
            var pages = this.model.get('pages');
            this.$('.next-page').attr('disabled', page === pages);
            this.$('.previous-page').attr('disabled', page === 1);
        }
    });

    var BodyView = Marionette.ItemView.extend({
        className: 'pdf-content text-center',
        template: Handlebars.compile('<span class="sr-only pdf-508"></span><canvas class="pdf-body"></canvas>'),
        ui: {
            'canvas': 'canvas'
        },
        initialize: function(options) {
            this.pdfModel = this.getOption('pdfModel');
        },
        onShow: function() {
            this.fetchPdf();
        },
        fetchPdf: function(documentModel) {
            if (!this.ui.canvas.length) throw new Error('Pdf BodyView has not yet been rendered.');

            var model = documentModel || this.getOption('model');
            var uid = _.isString(documentModel) ? documentModel : model.get('uid');

            if (this.model.get('rawPdfDocument')) { //we've already loaded the pdf
                this.loadPdf(this.model.get('rawPdfDocument'));
                return;
            }

            if (!uid) throw new Error('No model with `uid` or uid provided to fetch pdf.');

            var url = ADK.PatientRecordService.buildUrl(this.getOption('resource'), {
                'uid': uid
            });

            this.xhr = new XMLHttpRequest();
            this.xhr.open('GET', url, true);
            this.xhr.responseType = 'arraybuffer';
            this.xhr.setRequestHeader('Authorization', 'Bearer ' + ADK.SessionStorage.get.sessionModel('X-Set-JWT').get('jwt'));
            this.xhr.onload = _.bind(function(response) {
                var pdfArrayBuffer = response.target.response;
                //cache it!
                this.model.set('rawPdfDocument', pdfArrayBuffer);
                this.loadPdf(pdfArrayBuffer);
                delete this.xhr;
            }, this);
            this.xhr.send();
        },
        loadPdf: function(pdfDocument) {
            pdf.getDocument(pdfDocument).then(_.bind(this.pdfLoaded, this));
        },
        pdfLoaded: function(pdfDocument) {
            this.pdfModel.set({
                'pdfDocument': pdfDocument,
                'pages': pdfDocument.numPages
            });
            this.loadPage(this.pdfModel.get('page') || 1, this.pdfModel.get('scale') || 1, pdfDocument);
        },
        loadPage: function(pageNum, scale, pdfDocument) {
            var setter = {
                page: pageNum || 1
            };
            if (scale) {
                setter.scale = scale;
            } else if (!this.pdfModel.get('scale')) {
                setter.scale = 1;
            }
            this.pdfModel.set(setter);
            var pdf = pdfDocument || this.pdfModel.get('pdfDocument');
            pdf.getPage(this.pdfModel.get('page')).then(_.bind(this.renderPage, this, this.pdfModel.get('scale')));
        },
        scalePage: function(scale) {
            this.loadPage(this.pdfModel.get('page'), scale);
        },
        refreshPage: function() {
            this.loadPage(this.pdfModel.get('page'), this.pdfModel.get('scale'));
        },
        renderPage: function(scale, page) {
            this.pdfModel.set('scale', scale * 1.0, {
                silent: true
            });
            var viewport = page.getViewport(scale);
            var $canvas = this.ui.canvas;
            var canvas = $canvas.get(0);
            var context = canvas.getContext('2d');

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            page.render(renderContext);
            this.render508(page);
        },
        render508: function(page) {
            page.getTextContent().then(_.bind(function(textContent) {
                var str = '';
                _.each(textContent.items, function(item) {
                    str += item.str;
                });
                this.pdfModel.set('508_string', str);
                this.$('.pdf-508').html(str);
            }, this));
        },
        onBeforeDestroy: function() {
            if (this.xhr) this.xhr.abort();
        }
    });

    var FooterView = HeaderView.extend({
        className: 'pdf-footer pdf-toolbar text-center'
    });

    var PdfViewer = Marionette.LayoutView.extend({
        resource: 'patient-record-complexnote-pdf',
        template: Handlebars.compile('<div class="pdf-viewer-header"></div><div class="pdf-viewer-body"></div><div class="pdf-viewer-footer"></div>'),
        className: 'pdf-viewer',
        regions: {
            'Header': '.pdf-viewer-header',
            'Body': '.pdf-viewer-body',
            'Footer': '.pdf-viewer-footer'
        },
        events: {
            'click .previous-page': 'previousPage',
            'click .next-page': 'nextPage',
            'click .zoom-in': 'zoomIn',
            'click .zoom-out': 'zoomOut'
        },
        showHeader: true,
        showFooter: true,
        zoomMax: 2,
        zoomMin: 0.5,
        zoomScalar: 0.1,
        PdfModel: Backbone.Model.extend({
            defaults: {
                scale: 1,
                page: 1,
                pages: 0
            }
        }),
        initialize: function(options) {
            this.pdfModel = new this.PdfModel(_.omit(options, 'pages'));
        },
        onBeforeShow: function() {
            var HeaderView = this.getOption('HeaderView');
            var BodyView = this.getOption('BodyView');
            var FooterView = this.getOption('FooterView');

            if (this.getOption('showHeader')) this.getRegion('Header').show(new HeaderView({
                model: this.pdfModel,
                zoomMax: this.getOption('zoomMax'),
                zoomMin: this.getOption('zoomMin'),
                zoomScalar: this.getOption('zoomScalar')
            }));

            this.getRegion('Body').show(new BodyView({
                model: this.getOption('model'),
                resource: this.getOption('resource'),
                pdfModel: this.getOption('pdfModel')
            }));

            if (this.getOption('showFooter')) this.getRegion('Footer').show(new FooterView({
                model: this.pdfModel,
                zoomMax: this.getOption('zoomMax'),
                zoomMin: this.getOption('zoomMin'),
                zoomScalar: this.getOption('zoomScalar')
            }));
        },
        HeaderView: HeaderView,
        BodyView: BodyView,
        FooterView: FooterView,
        fetchPdf: function(documentModel) {
            this.getRegion('Body').currentView.fetchPdf(documentModel);
        },
        nextPage: function() {
            var page = this.pdfModel.get('page');
            var pages = this.pdfModel.get('pages');
            if (this.getRegion('Body').hasView() && pages && ++page <= pages) {
                this.getRegion('Body').currentView.loadPage(page);
            }
        },
        previousPage: function() {
            var page = this.pdfModel.get('page');
            var pages = this.pdfModel.get('pages');
            if (this.getRegion('Body').hasView() && pages && --page > 0) {
                this.getRegion('Body').currentView.loadPage(page);
            }
        },
        zoomIn: function() {
            var scale = this.pdfModel.get('scale');
            var zoomMax = this.getOption('zoomMax');
            var zoomScalar = this.getOption('zoomScalar');
            scale = parseFloat(scale + zoomScalar).toFixed(2);
            if (scale <= zoomMax) {
                this.getRegion('Body').currentView.scalePage(scale);
            }
        },
        zoomOut: function() {
            var scale = this.pdfModel.get('scale');
            var zoomMin = this.getOption('zoomMin');
            var zoomScalar = this.getOption('zoomScalar');
            scale = parseFloat(scale - zoomScalar).toFixed(2);
            if (scale >= zoomMin) {
                this.getRegion('Body').currentView.scalePage(scale);
            }
        }
    });

    return PdfViewer;
});