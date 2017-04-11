var _ = require('lodash');
var moment = require('moment');
var fs = require('fs');
var config = require('./config');
var log = require('bunyan').createLogger(config.logger);
var xml2js = require('xml2js');
var util = require('util');
var path    = require("path");



function studyQuery(req, res) {


	var filePath = '';
	var body = req.body;
	var icn = body.patientICN;
	var bodySiteNumber = body.siteNumber;

	if (_.isUndefined(bodySiteNumber) || bodySiteNumber === '') {
		bodySiteNumber = 600;
	}

	log.info('=====> studyQuery');
	
	log.info('             patientIcn: ' + icn);


	if (body === null || body === '' || body === undefined) {
		res.status(404).end(
			'Did you forget to send a message, the body was empty');
		return;
	}


	// build baseUrl for details
	// vitelnet data here

	var baseUrl = 'http://' + req.headers.host;
	var vixRootUrl = baseUrl; 
	var secToken = 'tFC8H4kxytwQ_Lx1f2M8fe1Sm1QMyb_TqDRgE94C7sOSStsmFfzJ_9hebsi3Hp6pMWd0sQeVjriA2gL1-hFpfJYc-UcpXhJvSqOfTrfC_5cvhY1DZ2sh-MLEGk0MXLl5zp0C6iMnYYaarn8SvxZCn78iNVTBrBgdi3Mj7orevN8%3d';

	try {
		_.each(body.studies, function(record) {
			var siteNumber = record.siteNumber;
			if (_.isUndefined(siteNumber) || siteNumber === '') {
				siteNumber = bodySiteNumber;
			}
			record.imageCount = 2;
			record.detailsUrl = encodeURI(baseUrl + '/vix/viewer/studydetails' + '?ContextId=' + record.contextId + '&SiteNumber=' + siteNumber + '&PatientICN=' + icn + '&SecurityToken=' + secToken + '&VixRootUrl=' + vixRootUrl);
			record.statusCode = 200;
			record.viewerUrl = encodeURI(baseUrl + '/vix/viewer' + '?ContextId=' + record.contextId + '&SiteNumber=' + siteNumber + '&PatientICN=' + icn + '&SecurityToken=' + secToken + '&VixRootUrl=' + vixRootUrl);
			record.thumbnailUrl = encodeURI(baseUrl +  '/vix/viewer/thumbnails' );
		});

		
		res.type('application/json').send(body);

	} catch (err) {

		var s = 'Server error: ' + err;
		log.warn(s);
		res.status(500).end(s);
		return;
	}



}


function studyDetails(req, res) {
	//http://54.235.252.102:9911/vix/viewer/studydetails?ContextId=RPT%5eCPRS%5e3%5eRA%5ei6839581.8353-1%5e75%5eCAMP+MASTER%5e%5e%5e%5e%5e%5e1&SiteNumber=500&PatientICN=10108&SecurityToken=tFC8H4kxytwQ_Lx1f2M8fe1Sm1QMyb_TqDRgE94C7sOSStsmFfzJ_9hebsi3Hp6pMWd0sQeVjriA2gL1-hFpfJYc-UcpXhJvSqOfTrfC_5cvhY1DZ2sh-MLEGk0MXLl5zp0C6iMnYYaarn8SvxZCn78iNVTBrBgdi3Mj7orevN8%3d&VixRootUrl=http%3a%2f%2f54.235.66.32%3a8080
	log.info('====>studyDetails');
	var baseUrl = 'http://' + req.headers.host;
	// canned response 

	var response = {
		viewerUrl:  baseUrl + '/vix/viewer?ContextId=RPT%5eCPRS%5e3%5eRA%5ei6839581.8353-1%5e75%5eCAMP+MASTER%5e%5e%5e%5e%5e%5e1&SiteNumber=500&PatientICN=10108&SecurityToken=tFC8H4kxytwQ_Lx1f2M8fe1Sm1QMyb_TqDRgE94C7sOSStsmFfzJ_9hebsi3Hp6pMWd0sQeVjriA2gL1-hFpfJYc-UcpXhJvSqOfTrfC_5cvhY1DZ2sh-MLEGk0MXLl5zp0C6iMnYYaarn8SvxZCn78iNVTBrBgdi3Mj7orevN8%3d',
		totalImageCount: 49,
		studies: [{
			contextId: 'RPT^CPRS^3^RA^i6839581.8353-1^75^CAMP MASTER^^^^^^1',
			imageCount: 49,
			studyDescription: 'CT HEAD W/O CONT',
			studyDate: '2016-04-18T16:46:00-04:00',
			acquisitionDate: '2016-04-18T16:48:00-04:00',
			studyId: 'urn:vastudy:500-896-10108V420871',
			series: [{
				caption: 'CT HEAD W/O CONT (#40)',
				thumbnailUrl:  baseUrl +  '/vix/viewer/thumbnails',
				imageCount: 1,
				viewerUrl:  baseUrl + '/vix/viewer?ContextId=RPT%5eCPRS%5e3%5eRA%5ei6839581.8353-1%5e75%5eCAMP+MASTER%5e%5e%5e%5e%5e%5e1&SiteNumber=500&PatientICN=10108&SecurityToken=tFC8H4kxytwQ_Lx1f2M8fe1Sm1QMyb_TqDRgE94C7sOSStsmFfzJ_9hebsi3Hp6pMWd0sQeVjriA2gL1-hFpfJYc-UcpXhJvSqOfTrfC_5cvhY1DZ2sh-MLEGk0MXLl5zp0C6iMnYYaarn8SvxZCn78iNVTBrBgdi3Mj7orevN8%3d'
			}, {
				caption: 'CT HEAD W/O CONT (#17)',
				thumbnailUrl: baseUrl +  '/vix/viewer/thumbnails',
				imageCount: 48,
				viewerUrl:  baseUrl + '/vix/viewer?ContextId=RPT%5eCPRS%5e3%5eRA%5ei6839581.8353-1%5e75%5eCAMP+MASTER%5e%5e%5e%5e%5e%5e1&SiteNumber=500&PatientICN=10108&SecurityToken=tFC8H4kxytwQ_Lx1f2M8fe1Sm1QMyb_TqDRgE94C7sOSStsmFfzJ_9hebsi3Hp6pMWd0sQeVjriA2gL1-hFpfJYc-UcpXhJvSqOfTrfC_5cvhY1DZ2sh-MLEGk0MXLl5zp0C6iMnYYaarn8SvxZCn78iNVTBrBgdi3Mj7orevN8%3d'
			}]
		}]
	};

	res.type('application/json').send(response);



}

function thumbnails(req, res) {


	res.sendFile(path.join(__dirname+'/homerXray.jpg'));

}

function viewer(req, res) {

	res.sendFile(path.join(__dirname+'/viewer.html'))
}
 

module.exports.viewer = viewer;
module.exports.studyQuery = studyQuery;
module.exports.studyDetails = studyDetails;
module.exports.thumbnails = thumbnails;
