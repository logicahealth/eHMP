'use strict';

//-----------------------------------------------------------------
// This will test the solr-vlerdocument-xform.js functions.
//
// Author: Les Westberg
//-----------------------------------------------------------------

require('../../../../env-setup');

var _ = require('underscore');
var xformer = require(global.VX_UTILS + 'solr-xform/solr-vlerdocument-xform');
var xformHtmlToTxt = xformer._steps.xformHtmlToTxt;
var getTextFromHtml =  xformer._steps.getTextFromHtml;
var log = require(global.VX_DUMMIES + 'dummy-logger');
// NOTE: be sure next line is commented out before pushing
// log = require('bunyan').createLogger({
//     name: 'record-enrichment-vlerdocument-xformer-spec',
//     level: 'debug'
// });

var vlerDocTestHtml = '<head><meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1"></head><body><h2 align="center">SILVER SPRING</h2><div style="text-align:center;"><span style="font-size:larger;font-weight:bold">Summarization of Episode Note</span></div><b>Created On: </b>August 8, 2014<table width="100%" class="first"><tbody><tr><td width="15%" valign="top"><b>Patient: </b></td><td width="35%" valign="top"> Chdrone Chdrzzztestpatient <br>1234 HOWARD ST<br>LA JOLLA,CA,92038<br>tel:+1-760-111-1111<b> Home</b><br>tel:+1-000-000-0000<b> Work</b></td><td width="15%" align="right" valign="top"><b>Patient ID: </b></td><td width="35%" valign="top">65189967</td></tr><tr><td width="15%" valign="top"><b>Birthdate: </b></td><td width="35%" valign="top">March 3, 1960</td><td width="15%" align="right" valign="top"><b>Sex: </b></td><td width="35%" valign="top">M</td></tr><tr><td width="15%" valign="top"><b>Language(s):</b></td><td width="35%" valign="top"><li>English</li></td><td width="15%" valign="top"></td><td width="35%" valign="top"></td></tr></tbody></table><table width="100%" class="second"><tbody><tr><td width="15%"><b>Source:</b></td><td width="85%">SILVER SPRING</td></tr></tbody></table><div style="margin-bottom:35px"><h3><a name="toc">Table of Contents</a></h3><ul><li><a style="font-family:georgia;font-size:12pt" href="#N65836">Active Allergies and Adverse Reactions</a></li><li><a style="font-family:georgia;font-size:12pt" href="#N67381">Active Problems</a></li><li><a style="font-family:georgia;font-size:12pt" href="#N67699">Encounters from 05/08/2014 to 08/08/2014</a></li><li><a style="font-family:georgia;font-size:12pt" href="#N68106">Immunizations</a></li><li><a style="font-family:georgia;font-size:12pt" href="#N68629">Last Filed Vitals</a></li><li><a style="font-family:georgia;font-size:12pt" href="#N66179">Medications</a></li><li><a style="font-family:georgia;font-size:12pt" href="#N68401">Procedures from 05/08/2014 to 08/08/2014</a></li><li><a style="font-family:georgia;font-size:12pt" href="#N68524">Results from 05/08/2014 to 08/08/2014</a></li></ul></div><h3><span style="font-weight:bold;line-height:40%"><a name="N65836" href="#toc">Active Allergies and Adverse Reactions</a></span></h3><table border="1" style="font-size:14px"><thead><tr><th class="first">Allergens - Count (2)</th><th class="first">Verification Date</th><th class="first">Event Type</th><th class="first">Reaction</th><th class="first">Severity</th><th class="first">Source</th></tr></thead><tbody><tr class="second"><td><div style="overflow:hidden; white-space:nowrap; width:180px; padding-right:5px;"><span onmouseover="DisplayTip(this,25,-50,0)">CALCIUM</span></div></td><td><div style="overflow:hidden; white-space:nowrap; width:100px;">Jul 7, 2014</div></td><td><div style="overflow:hidden; white-space:nowrap; width:180px;"><span onmouseover="DisplayTip(this,25,-50,0)">propensity to adverse reactions to drug</span></div></td><td><div style="overflow:hidden; white-space:nowrap; width:180px;"><span title="Not Available">--</span></div></td><td><div style="overflow:hidden; white-space:nowrap; width:100px;">--</div></td><td><div style="overflow:hidden; white-space:nowrap; width:150px;"><span onmouseover="DisplayTip(this,25,-50,0)">SILVER SPRING</span></div></td></tr><tr class="second"><td><div style="overflow:hidden; white-space:nowrap; width:180px; padding-right:5px;"><span onmouseover="DisplayTip(this,25,-50,0)">FISH - DERIVATIVE</span></div></td><td><div style="overflow:hidden; white-space:nowrap; width:100px;">Jul 7, 2014</div></td><td><div style="overflow:hidden; white-space:nowrap; width:180px;"><span onmouseover="DisplayTip(this,25,-50,0)">propensity to adverse reactions to drug</span></div></td><td><span>^multipart^^Base64^4p88C4AO8BAK1H1sj5aeNRMrkm1AePKgDaPxbUr5H</span><div style="overflow:hidden; white-space:nowrap; width:180px;"><span title="Not Available">--</span></div></td><td><div style="overflow:hidden; white-space:nowrap; width:100px;">--</div></td><td><div style="overflow:hidden; white-space:nowrap; width:150px;"><span onmouseover="DisplayTip(this,25,-50,0)">SILVER SPRING</span></div></td></tr></tbody></table><br><br><br>&nbsp;<div id="TipBox" style="display:none;position:absolute;font-size:12px;font-weight:bold;font-family:verdana;border:#72B0E6 solid 1px;padding:15px;color:black;background-color:#FFFFFF;">&nbsp;</div></body>';
var vlerDocTestHtmlCompressed = 'XQAAAQDXEAAAAAAAAAAeGgimJFD4kTPJ1iXZB80UrqKhmEzCVqhM0QYtZFFw8L3bMV5OErdLTCF4YESAXsoGxWhAl+664O7bR0VbD0fAQ6u2+SFNKuUcevPD0iirLjz4fYIq1MHsTRJiapusEgyN9VSJDbaFldKh7Fyw4dx1ouMzReOsCV5zUwCbuVOkXnwSAjLhUZmZ9deuJNVb26JtaTxUUxO1XmQC1s1LuXDGdEWUQubvkvSHih67phTkNlp4sDFhcowsHvhR2zXIidQEKoJdN0TULc1S4YjCP5LNTsyFqV7RLkRmvuzdAOHvy6wbCKda0sw/wNGtIBYlp8hajDXpSsAuxwBUcT9SqI1ZxWMEDMBBGZH5ynPxsB3Wsl3WIXOxa7Pe+V1EFKzxP9gsifLoxYcapPcrxwwga4SPTIOklPf/P9qVnWOLJevO8B0W+34LeL2MtwFuxwxvD3dxvimYeRY4vC0Gsjtxyf3phvZnloIULPedoEz0S2soPryX/zmf7zmd2KyQVsV+N6pu6sPVOzAroKKhmcrMof8FoqsO9e1ZsxvKvhFuAMGTcXWt2nR4KjRHQAplqIq+8o4i2QmhpVxXTxHP4vvBXhkoIrS45JLd5pPT3SWfqSi3GXAvj+YzV+BCmOwz0DG3cmBcLBmkOvS+LiOUzNxgjFxzN1D0yMHtiLZ2MqPh8gyvOFKey5qpORJgBR0pxyFyNTxy/ggMD2TWgbnW4+AHBEdnxOcs2TlVXpM1iMJ1A5DG3LIEUY8l5Ofw+BaJ3WWZhprWjbAD6COagR2XYx3iXkKim+lGdBMIb7+38DgZIcyIzkO2qu0uQRSna7qzPbyWwJ6vwMFCvNEuPNdTiFxxJ1PjMMdjon4xJOaDWaVgOTSx7r3f2iXc14IucaItK6Q7SlnyIxC4jvlNu8JMgdiCNsUjtfln8/4p88C4AO8BAK1H1sj5aeNRMrkm1AePKgDaPxbUr5H+NTPUR+covFdVpu+slrknUis4khoIc5i+8El0eB8LFjOxux0P8vK74jLVzMtW3VpsI8ShXDlc9G2pItWnzNq43pa3+qOCR/oPGFcFdD3gM3ZYt5H8ITjH8en2saUk7nTVM18WayaohBISj4n+JCBpyOEaxQCEsQon85XB0tA6949pimM5AbfiHvrLLNDzhn5UqwcuAjC1GsnjMxcCLV6N3dHz9KMZVPjg9xKEz4Bx38LGVTn3LzGuWJvk2BRxDbV6ak+ZPIHJX8AkiIUK+foy/lnF3lsnHuaPhvWj+140GUVL0jXOzWW0YVtqbsgjsz+BpX21IzK/YqGxRR6Sd5n1WeWYZy8RSNBPg7q/zwcFDa9crrEMzz9PX8mVmxfraOAJGwLepKhjdfH9h/1J6tUnMwg7NHq43zTmSigSd7tn2zt729hBPBCd49vp0EoX99R61USBcpZr6rYPvINND2ecMGIfbCAMKS91wvMIdfyrqnI/GAuB4qgA8t3FXm1Lod3395wiqZVSoinqhgyuAq8RuLYZakfUuj3YoxDSXD3nUJD8GAeOF6uPxKG9Vzj7LsvU66ZHvf9s3yB80xf+AwFg';
var vlerDocTestFixSpaces =  '<head><META http-equiv=\'Content-Type\' content=\'text/html; charset=ISO-8859-1\'><link href=\'app/applets/ccd_grid/assets/vler_resource/c32Styles/c32.css\' type=\'text/css\' rel=\'stylesheet\' xmlns:voc=\'urn:hl7-org:v3/voc\' xmlns:n3=\'http://www.w3.org/1999/xhtml\' xmlns:n2=\'urn:hl7-org:v3/meta/voc\' xmlns:msxsl=\'urn:schemas-microsoft-com:xslt\' xmlns:n1=\'urn:hl7-org:v3\' xmlns:xsi=\'http://www.w3.org/2001/XMLSchema-instance\' xmlns:section=\'urn:gov.va.med\'><script type=\'text/javascript\' src=\'app/applets/ccd_grid/assets/vler_resource/c32Styles/c32.js\'></script><h2 align=\'center\'>SILVER SPRING</h2></head><div style=\'text-align:center;\'><span style=\'font-size:larger;font-weight:bold\'>Summarization of Episode Note</span></div><b>Created On: </b>August 8, 2014<table width=\'100%\' class=\'first\'><tr><td width=\'15%\' valign=\'top\'><b>Patient: </b></td><td width=\'35%\' valign=\'top\'> Chdrone Chdrzzztestpatient <br>1234 HOWARD ST<br>LA JOLLA,CA,92038<br>tel:+1-760-111-1111<b> Home</b><br>tel:+1-000-000-0000<b> Work</b></td><td width=\'15%\' align=\'right\' valign=\'top\'><b>Patient ID: </b></td><td width=\'35%\' valign=\'top\'>65189967</td></tr><tr><td width=\'15%\' valign=\'top\'><b>Birthdate: </b></td><td width=\'35%\' valign=\'top\'>March 3, 1960</td><td width=\'15%\' align=\'right\' valign=\'top\'><b>Sex: </b></td><td width=\'35%\' valign=\'top\'>M</td></tr><tr><td width=\'15%\' valign=\'top\'><b>Language(s):</b></td><td width=\'35%\' valign=\'top\'><li>English</li></td><td width=\'15%\' valign=\'top\'></td><td width=\'35%\' valign=\'top\'></td></tr></table><table width=\'100%\' class=\'second\'><tr><td width=\'15%\'><b>Source:</b></td><td width=\'85%\'>SILVER SPRING</td></tr></table><div style=\'margin-bottom:35px\'><h3><a name=\'toc\'>Table of Contents</a></h3><ul><li><a style=\'font-family:georgia;font-size:12pt\' href=\'#N65836\'>Active Allergies and Adverse Reactions</a></li><li><a style=\'font-family:georgia;font-size:12pt\' href=\'#N67381\'>Active Problems</a></li><li><a style=\'font-family:georgia;font-size:12pt\' href=\'#N67699\'>Encounters from 05/08/2014 to 08/08/2014</a></li><li><a style=\'font-family:georgia;font-size:12pt\' href=\'#N68106\'>Immunizations</a></li><li><a style=\'font-family:georgia;font-size:12pt\' href=\'#N68629\'>Last Filed Vitals</a></li><li><a style=\'font-family:georgia;font-size:12pt\' href=\'#N66179\'>Medications</a></li><li><a style=\'font-family:georgia;font-size:12pt\' href=\'#N68401\'>Procedures from 05/08/2014 to 08/08/2014</a></li><li><a style=\'font-family:georgia;font-size:12pt\' href=\'#N68524\'>Results from 05/08/2014 to 08/08/2014</a></li></ul></div><h3><span style=\'font-weight:bold;line-height:40%\'><a name=\'N65836\' href=\'#toc\'>Active Allergies and Adverse Reactions</a></span></h3><table border=\'1\' style=\'font-size:14px\'><thead><tr><th class=\'first\'>Allergens - Count (2)</th><th class=\'first\'>Verification Date</th><th class=\'first\'>Event Type</th><th class=\'first\'>Reaction</th><th class=\'first\'>Severity</th><th class=\'first\'>Source</th></tr></thead><tbody><tr class=\'second\'><td><div style=\'overflow:hidden; white-space:nowrap; width:180px; padding-right:5px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>CALCIUM</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:100px;\'>Jul 7, 2014</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:180px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>propensity to adverse reactions to drug</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:180px;\'><span title=\'Not Available\'>--</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:100px;\'>--</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:150px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>SILVER SPRING</span></div></td></tr><tr class=\'second\'><td><div style=\'overflow:hidden; white-space:nowrap; width:180px; padding-right:5px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>FISH - DERIVATIVE</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:100px;\'>Jul 7, 2014</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:180px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>propensity to adverse reactions to drug</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:180px;\'><span title=\'Not Available\'>--</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:100px;\'>--</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:150px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>SILVER SPRING</span></div></td></tr></tbody></table><br><br><h3><span style=\'font-weight:bold;line-height:40%\'><a name=\'N67381\' href=\'#toc\'>Active Problems</a></span></h3><table border=\'1\' style=\'font-size:14px\'><thead><tr><th class=\'first\'>Problems - Count (1)</th><th class=\'first\'>Status</th><th class=\'first\'>Problem Code</th><th class=\'first\'>Date of Onset</th><th class=\'first\'>Provider</th><th class=\'first\'>Source</th></tr></thead><tbody><tr class=\'second\'><td><div style=\'overflow:hidden; white-space:nowrap; width:240px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>FEVER</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'>Active</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:150px\'>386661006</div></td><td><div style=\'overflow:hidden; white-space:nowrap;\'>Jul 7, 2014</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:160px;\'>Crain, Laurie (M.D.)</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:150px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>SILVER SPRING</span></div></td></tr></tbody></table><br><br><h3><span style=\'font-weight:bold;line-height:40%\'><a name=\'N67699\' href=\'#toc\'>Encounters from 05/08/2014 to 08/08/2014</a></span></h3><div xmlns:ns=\'urn:schemas-microsoft-com:xslt\'><table class=\'comments\'><tbody><tr><td><img src=\'app/applets/ccd_grid/assets/vler_resource/c32Styles/comments_notice.jpg\' alt=\'NOTE:\'><text style=\'line-height:10%\'><b> NOTE: Click on the Encounter Comments field to display/hide additional data where applicable</b></text></td></tr></tbody></table><br></div><table border=\'1\' style=\'font-size:14px;\'><thead><tr><th class=\'first\'>Date/Time - Count (2)</th><th class=\'first\'>Encounter Type</th><th class=\'first\'>Encounter Comments</th><th class=\'first\'>Provider</th></tr></thead><tbody><tr class=\'second\'><td><div style=\'overflow:hidden; white-space:nowrap; width:auto;\'>Jul 8, 2014</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:auto;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>Office Visit</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:360px;height:1em\'><span title=\'Not Available\'>--</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:160px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>Greene, Peter</span></div></td></tr><tr class=\'second\'><td><div style=\'overflow:hidden; white-space:nowrap; width:auto;\'>Jul 7, 2014</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:auto;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>Office Visit</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:360px;height:1em\'><span onmouseover=\'DisplayTip(this,25,-50,1)\'>Headache (Primary Dx)</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:160px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>Crain, Laurie</span></div></td></tr></tbody></table><br><br><h3><span style=\'font-weight:bold;line-height:40%\'><a name=\'N68106\' href=\'#toc\'>Immunizations</a></span></h3><table border=\'1\' style=\'font-size:14px\'><thead><tr><th class=\'first\'>Immunizations - Count (3)</th><th class=\'first\'>Series</th><th class=\'first\'>Date Issued</th><th class=\'first\'>Reaction</th><th class=\'first\'>Comments</th></tr></thead><tbody><tr class=\'second\'><td><div style=\'overflow:hidden; white-space:nowrap; width:200px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>INF (Influenza) unspecified formulation</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:100px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'><span title=\'Not Available\'>--</span></span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:100px;\'>Jul 7, 2014</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:260px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'><span title=\'Not Available\'>--</span></span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:240px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'><span title=\'Not Available\'>--</span></span></div></td></tr><tr class=\'second\'><td><div style=\'overflow:hidden; white-space:nowrap; width:200px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>INF (Influenza) unspecified formulation</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:100px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'><span title=\'Not Available\'>--</span></span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:100px;\'>Jul 7, 2014</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:260px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'><span title=\'Not Available\'>--</span></span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:240px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'><span title=\'Not Available\'>--</span></span></div></td></tr><tr class=\'second\'><td><div style=\'overflow:hidden; white-space:nowrap; width:200px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>INFan (Influenza attenuated virus, intranasal)</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:100px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'><span title=\'Not Available\'>--</span></span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:100px;\'>Jul 7, 2014</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:260px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'><span title=\'Not Available\'>--</span></span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:240px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'><span title=\'Not Available\'>--</span></span></div></td></tr></tbody></table><br><br><h3><span style=\'font-weight:bold;line-height:40%\'><a name=\'N68629\' href=\'#toc\'>Last Filed Vitals</a></span></h3><table border=\'1\' style=\'font-size:14px\'><thead><tr><th class=\'first\'>Date - Count (1)</th><th class=\'first\'>TEMP</th><th class=\'first\'>PULSE</th><th class=\'first\'>RESP</th><th class=\'first\'>BP</th><th class=\'first\'>Ht</th><th class=\'first\'>HT-Lying</th><th class=\'first\'>Wt</th><th class=\'first\'>POx</th><th class=\'first\'>OFC</th><th class=\'first\'>Source</th></tr></thead><tbody><tr class=\'second\'><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'>Jul 8, 2014</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:70px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>36.7Cel</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:70px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>98</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:70px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>29</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:70px;\'>120/90</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:70px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>156cm</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:70px;\'><span title=\'Not Available\'>--</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:70px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>70.761kg</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:70px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>98%</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:70px;\'><span title=\'Not Available\'>--</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:150px;\'><span title=\'Not Available\'>--</span></div></td></tr><br></tbody></table><br><br><h3><span style=\'font-weight:bold;line-height:40%\'><a name=\'N66179\' href=\'#toc\'>Medications</a></span></h3><table border=\'1\' style=\'font-size:14px\'><thead><tr><th class=\'first\'>Medications - Count (4)</th><th class=\'first\'>Status</th><th class=\'first\'>Quantity</th><th class=\'first\'>Order Expiration</th><th class=\'first\'>Provider</th><th class=\'first\'>Prescription #</th><th class=\'first\'>Dispense Date</th><th class=\'first\'>Sig</th><th class=\'first\'>Source</th></tr></thead><tbody><tr class=\'second\'><td><div style=\'overflow:hidden; white-space:nowrap; width:180px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>Ciprofloxacin 250 Mg Oral Tab</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>No Longer Active</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:40px;\'><span title=\'Not Available\'>--</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'>Aug 8, 2014</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:140px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>Greene, Peter</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'>130511892</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'>Jul 8, 2014</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:160px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>TAKE 1 TAB</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:100px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>SILVER SPRING</span></div></td></tr><tr class=\'second\'><td><div style=\'overflow:hidden; white-space:nowrap; width:180px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>Albuterol Sulfate 2.5 Mg /3 Ml (0.083 %) Inhl Neb Soln</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>Active</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:40px;\'><span title=\'Not Available\'>--</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'>Jul 8, 2015</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:140px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>Crain, Laurie</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'>130511612</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'>Jul 7, 2014</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:160px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>INHALE \'CONTENTS OF 1 AMPULE VIA NEBULIZER\' PO 3 TO 4 TIMES DAILY PRN</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:100px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>SILVER SPRING</span></div></td></tr><tr class=\'second\'><td><div style=\'overflow:hidden; white-space:nowrap; width:180px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>Benzonatate 100 Mg Oral Cap</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>Active</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:40px;\'><span title=\'Not Available\'>--</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'>Jul 8, 2015</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:140px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>Crain, Laurie</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'>130511613</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'>Jul 7, 2014</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:160px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>1C PO Q8H PRN \'FOR COUGH\'</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:100px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>SILVER SPRING</span></div></td></tr><tr class=\'second\'><td><div style=\'overflow:hidden; white-space:nowrap; width:180px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>Atenolol 25 Mg Oral Tab</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>Active</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:40px;\'><span title=\'Not Available\'>--</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'>Jul 9, 2015</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:140px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>Crain, Laurie</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'>130511890</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:80px;\'>Jul 8, 2014</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:160px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>1T PO DAILY</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:100px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>SILVER SPRING</span></div></td></tr></tbody></table><br><br><h3><span style=\'font-weight:bold;line-height:40%\'><a name=\'N68401\' href=\'#toc\'>Procedures from 05/08/2014 to 08/08/2014</a></span></h3><div><table class=\'comments\'><tbody><tr><td><img src=\'app/applets/ccd_grid/assets/vler_resource/c32Styles/comments_notice.jpg\' alt=\'NOTE:\'><text><b> NOTE: Click on the Procedure Comments field to display/hide additional data where applicable</b></text></td></tr></tbody></table><br></div><table border=\'1\' style=\'font-size:14px\'><thead><tr><th class=\'first\'>Date/Time - Count (1)</th><th class=\'first\'>Procedure Type</th><th class=\'first\'>Procedure Comments</th><th class=\'first\'>Provider</th></tr></thead><tbody><tr class=\'second\'><td><div style=\'overflow:hidden; white-space:nowrap;\'>Jul 7, 2014</div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:260px;\'><span onmouseover=\'DisplayTip(this,25,-50,0)\'>INTRAVENOUS INFUSION, HYDRATION EACH ADDL HR</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:260px;height:1em\'><span onmouseover=\'DisplayTip(this,25,-50,1)\'>INTRAVENOUS INFUSION, HYDRATION EACH ADDL HRSTAT07/07/2014 12:00 AM EDTHEADACHE</span></div></td><td><div style=\'overflow:hidden; white-space:nowrap; width:180px;\'><span title=\'Not Available\'>--</span></div></td></tr></tbody></table><br><br><h3><span style=\'font-weight:bold;line-height:40%\'><a name=\'N68524\' href=\'#toc\'>Results from 05/08/2014 to 08/08/2014</a></span></h3><table border=\'1\' style=\'font-size:14px\'><thead><tr><th class=\'first\'>Date/Time - Count (2)</th><th class=\'first\'>Result Type</th><th class=\'first\'>Source</th><th class=\'first\'>Result - Unit</th><th class=\'first\'>Interpretation</th><th class=\'first\'>Reference Range</th><th class=\'first\'>Status</th></tr></thead><tbody></tbody></table><br><br><br>&nbsp;<span style=\'font-weight:bold; border:2px solid;\'> EMERGENCY CONTACT INFO MISSING! </span><p><b>Electronically generated on:&nbsp; </b>August 8, 2014</p><div id=\'TipBox\' style=\'display:none;position:absolute;font-size:12px;font-weight:bold;font-family:verdana;border:#72B0E6 solid 1px;padding:15px;color:black;background-color:#FFFFFF;\'>&nbsp;</div>';

var xformConfig = {
    vlerdocument: {
        regexFilters: ['\\^multipart\\^\\^Base64\\^\\w*']
    }
};

var noConfig = null;

describe('solr-vlerdocument-xform.js', function() {
    describe('Transformer', function() {
        it('Happy Path', function() {
            var vprRecord = {
                'authorList': [{
                    'institution': 'Conemaugh Health System',
                    'name': '7.9^Epic - Version 7.9^^^^^^^&1.2.840.114350.1.1&ISO'
                }],
                'creationTime': '20140617014116',
                'doucmentUniqueId': '29deea5f-efa3-4d1c-a43d-d64ea4f4de30',
                'homeCommunityId': 'urn:oid:1.3.6.1.4.1.26580.10',
                'kind': 'C32 Document',
                'mimeType': null,
                'name': 'Continuity of Care Document',
                'pid': 'VLER;10108V420871',
                'repositoryUniqueId': '1.2.840.114350.1.13.48.3.7.2.688879',
                'sections': [{
                    'code': {
                        'code': '48765-2',
                        'display': null,
                        'system': '2.16.840.1.113883.6.1',
                        'systemName': null
                    },
                    'templateIds': [{
                        'root': '2.16.840.1.113883.3.88.11.83.102'
                    }, {
                        'root': '1.3.6.1.4.1.19376.1.5.3.1.3.13'
                    }, {
                        'root': '2.16.840.1.113883.10.20.1.2'
                    }],
                    'text': 'First line of text.',
                    'title': 'Allergies and Adverse Reactions'
                }, {
                    'code': {
                        'code': '11450-4',
                        'display': null,
                        'system': '2.16.840.1.113883.6.1',
                        'systemName': null
                    },
                    'templateIds': [{
                        'root': '2.16.840.1.113883.3.88.11.83.103'
                    }, {
                        'root': '1.3.6.1.4.1.19376.1.5.3.1.3.6'
                    }, {
                        'root': '2.16.840.1.113883.10.20.1.11'
                    }],
                    'text': 'Second line of text.',
                    'title': 'Problems'
                }, {
                    'code': {
                        'code': '10160-0',
                        'display': null,
                        'system': '2.16.840.1.113883.6.1',
                        'systemName': null
                    },
                    'templateIds': [{
                        'root': '2.16.840.1.113883.3.88.11.83.112'
                    }, {
                        'root': '1.3.6.1.4.1.19376.1.5.3.1.3.19'
                    }, {
                        'root': '2.16.840.1.113883.10.20.1.8'
                    }],
                    'text': 'Third line of text.',
                    'title': 'Medications'
                }],
                'fullHtml': 'XQAAAQADAAAAAAAAAAAzG8pMNEjf//XEQAA=',
                'compressed': true,
                'sourcePatientId': '\'8394^^^& 1.3.6.1.4.1.26580.10.1.100&ISO\'',
                'stampTime': '20150415124228',
                'summary': 'Continuity of Care Document',
                'uid': 'urn:va:vlerdocument:VLER:10108V420871:29deea5f-efa3-4d1c-a43d-d64ea4f4de30'
            };
            xformer(vprRecord, log, noConfig, function(error, solrRecord) {
                expect(error).toBeFalsy();
                // Verify Common Fields
                //---------------------
                expect(solrRecord.uid).toBe(vprRecord.uid);
                expect(solrRecord.pid).toBe(vprRecord.pid);
                expect(solrRecord.kind).toBe(vprRecord.kind);
                expect(solrRecord.summary).toBe(vprRecord.summary);

                // Verify Vlerdocument Specific Fields
                //-------------------------------
                expect(solrRecord.domain).toBe('vlerdocument');
                expect(solrRecord.creation_time).toBe(vprRecord.creationTime);
                expect(solrRecord.datetime).toBe(vprRecord.creationTime);
                expect(solrRecord.datetime_all).toContain(vprRecord.creationTime);
                expect(solrRecord.name).toBe(vprRecord.name);
                expect(_.isArray(solrRecord.section)).toBe(true);
                if (_.isArray(solrRecord.section)) {
                    expect(solrRecord.section.length).toBe(3);
                    if (solrRecord.section.length === 3) {
                        expect(solrRecord.section).toContain(vprRecord.sections[0].title + ' ' + vprRecord.sections[0].text);
                        expect(solrRecord.section).toContain(vprRecord.sections[1].title + ' ' + vprRecord.sections[1].text);
                        expect(solrRecord.section).toContain(vprRecord.sections[2].title + ' ' + vprRecord.sections[2].text);
                    }
                }
                expect(solrRecord.document_unique_id).toBe(vprRecord.documentUniqueId);
                expect(solrRecord.home_community_id).toBe(vprRecord.homeCommunityId);
                expect(solrRecord.repository_unique_id).toBe(vprRecord.repositoryUniqueId);
                expect(solrRecord.source_patient_id).toBe(vprRecord.sourcePatientId);
                expect(solrRecord.body).toEqual('foo');
            });
        });

        it('Error Path: xformHtmlToTxt returns error', function(done) {
            var vprRecord = {
                'authorList': [{
                    'institution': 'Conemaugh Health System',
                    'name': '7.9^Epic - Version 7.9^^^^^^^&1.2.840.114350.1.1&ISO'
                }],
                'creationTime': '20140617014116',
                'doucmentUniqueId': '29deea5f-efa3-4d1c-a43d-d64ea4f4de30',
                'homeCommunityId': 'urn:oid:1.3.6.1.4.1.26580.10',
                'kind': 'C32 Document',
                'mimeType': null,
                'name': 'Continuity of Care Document',
                'pid': 'VLER;10108V420871',
                'repositoryUniqueId': '1.2.840.114350.1.13.48.3.7.2.688879',
                'fullHtml': 'invalid data',
                'compressed': true,
                'sourcePatientId': '\'8394^^^& 1.3.6.1.4.1.26580.10.1.100&ISO\'',
                'stampTime': '20150415124228',
                'summary': 'Continuity of Care Document',
                'uid': 'urn:va:vlerdocument:VLER:10108V420871:29deea5f-efa3-4d1c-a43d-d64ea4f4de30'
            };

            xformer(vprRecord, log, noConfig, function(error, solrRecord) {
                expect(error).toBeTruthy();
                expect(solrRecord).toBeFalsy();
                done();
            });
        });
    });

    describe('xformHtmlToTxt', function() {
        it('Normal path: no html to convert', function(done) {
            var solrRecord = {};
            var vprRecord = {};

            xformHtmlToTxt(solrRecord, vprRecord, log, noConfig, function(error) {
                expect(error).toBeFalsy();
                expect(solrRecord.body).toBeFalsy();
                done();
            });
        });
        it('Normal path: decompress then transform to text', function(done) {
            var solrRecord = {};
            var vprRecord = {
                fullHtml: vlerDocTestHtmlCompressed,
                compressed: true
            };
            xformHtmlToTxt(solrRecord, vprRecord, log, noConfig, function(error) {
                expect(error).toBeFalsy();
                expect(solrRecord.body).toBeTruthy();
                expect(solrRecord.body).toContain('Summarization of Episode Note');
                done();
            });
        });
        it('Normal path: transform to text (no decompression needed)', function(done) {
            var solrRecord = {};
            var vprRecord = {
                fullHtml: vlerDocTestHtml
            };
            xformHtmlToTxt(solrRecord, vprRecord, log, xformConfig, function(error) {
                expect(error).toBeFalsy();
                expect(solrRecord.body).toBeTruthy();
                expect(solrRecord.body).toContain('Summarization of Episode Note');
                expect(solrRecord.body).not.toContain('multipart');
                done();
            });
        });
        it('Error path: decompress error', function(done) {
            var solrRecord = {};
            var vprRecord = {
                fullHtml: 'invalid data',
                compressed: true
            };

            xformHtmlToTxt(solrRecord, vprRecord, log, noConfig, function(error) {
                expect(error).toBeTruthy();
                expect(solrRecord.body).toBeFalsy();
                done();
            });
        });
        it('Normal path: word spaces not missing', function(done){
            var solrRecord = {};
            var vprRecord = {
                fullHtml: vlerDocTestFixSpaces
            };

            xformHtmlToTxt(solrRecord, vprRecord, log, noConfig, function(error) {
                expect(error).toBeFalsy();
                expect(solrRecord.body).toBeTruthy();
                expect(solrRecord.body || []).not.toContain('NoteCreated');
                expect(solrRecord.body || []).not.toContain('2014Patient');
                expect(solrRecord.body || []).not.toContain('OnsetProviderSourceFEVERActive');
                expect(solrRecord.body || []).toContain(' FEVER ');
                done();
            });
        });
    });

    describe('getTextFromHtml', function(){
        it('No xformConfig', function(){
            var result = getTextFromHtml(noConfig, vlerDocTestHtml);
            expect(result).toContain('Summarization of Episode Note');
            expect(result).not.toContain('<td>');
            expect(result).toContain('multipart');
        });

        it('No vlerdocument config', function(){
            var result = getTextFromHtml({}, vlerDocTestHtml);
            expect(result).toContain('Summarization of Episode Note');
            expect(result).not.toContain('<td>');
            expect(result).toContain('multipart');
        });

        it('run regexFilters from xformConfig', function(){
            var result = getTextFromHtml(xformConfig, vlerDocTestHtml);
            expect(result).toContain('Summarization of Episode Note');
            expect(result).not.toContain('<td>');
            expect(result).not.toContain('multipart');
        });
    });
});