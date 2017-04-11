/*jslint node: true, nomen: true, unparam: true */
/*global global jquery, $, _, define, Marionette, jqm, describe, it, expect, beforeEach, afterEach, spyOn, loadFixtures, setFixtures, jasmine */

'use strict';

define(['jquery', 'underscore', 'backbone', 'marionette', 'jasminejquery', 'moment', 'app/applets/documents/imaging/helpers/thumbnailHelper'],
	function($, _, Backbone, Marionette, jasminejquery, moment, thumbnailHelper) {
		var testData = new Backbone.Model({
			"detailsUrl": "http://foo.com/",
			"viewerUrl": "http://foo.com/",
			"thumbnails": [
				"http://foo.com/thumbnail1",
				"http://foo.com/thumbnail2"
			],
			"studyDetails":{
				totalImageCount:3
			}
		});

		// beforeEach(function(){
		thumbnailHelper.convertThumbnails(testData);
		// });

		describe("Verify that convertThumbnails converts thumbnails to loopable backbone collection",function(){
			it("should return true if thumbnails has a length",function(){
				expect(testData.get("thumbnails").length).toBeDefined();

			});
		});

	});