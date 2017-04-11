'use strict';

var fs = require('fs');

require('pdfjs-dist/build/pdf.combined');

function pdf2text(pdfPath, callback) {
    var pdfData = new Uint8Array(fs.readFileSync(pdfPath));

    return getPdfTxt(pdfData, callback);
}

function getPdfTxt(data, callback) {

    var pdfTxt = '';

    PDFJS.getDocument(data).then(function (doc) {
        var numPages = doc.numPages;

        var lastPromise = doc.getMetadata();

        var getPageTxtContent = function (pageNum) {
            return doc.getPage(pageNum).then(function (page) {
                return page.getTextContent().then(function (content) {
                    var strings = content.items.map(function (item) {
                        return item.str;
                    });

                    pdfTxt += strings.join(' ');
                });
            });
        };

        for (var i = 1; i <= numPages; i++) {
            lastPromise = lastPromise.then(getPageTxtContent.bind(null, i));
        }

        return lastPromise;

    }).then(function () {
        callback(null, pdfTxt);
    }, function (err) {
        callback(err);
    });
}

module.exports = pdf2text;