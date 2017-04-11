var fs = require('fs');
var admnMap = require('./mapsv3/map21869-3.js')
var medsMap = require('./mapsv3/map10160-0.js');
var demoMap = require('./mapsv3/map52536-0.js');
var apptMap = require('./mapsv3/map56446-8.js');
var encoMap = require('./mapsv3/map46240-8.js');
var noteMap = require('./mapsv3/map11536-0.js');
var procMap = require('./mapsv3/map47519-4.js');
var ordersallMap = require('./mapsv3/map46209-3.js');
var ordersmedMap = require('./mapsv3/map29305-0.js');
var ordersconMap = require('./mapsv3/map11487-6.js');
var orderslabMap = require('./mapsv3/map26436-6.js');
var ordersradMap = require('./mapsv3/map18726-0.js');
var quesMap = require('./mapsv3/map10187-3.js');
var admnMapv4 = require('./mapsv4/map21869-3.js')
var medsMapv4 = require('./mapsv4/map10160-0.js');
var demoMapv4 = require('./mapsv4/map52536-0.js');
var apptMapv4 = require('./mapsv4/map56446-8.js');
var encoMapv4 = require('./mapsv4/map46240-8.js');
var noteMapv4 = require('./mapsv4/map11536-0.js');
var procMapv4 = require('./mapsv4/map47519-4.js');
var ordersallMapv4 = require('./mapsv4/map46209-3.js');
var ordersmedMapv4 = require('./mapsv4/map29305-0.js');
var ordersconMapv4 = require('./mapsv4/map11487-6.js');
var orderslabMapv4 = require('./mapsv4/map26436-6.js');
var ordersradMapv4 = require('./mapsv4/map18726-0.js');
var quesMapv4 = require('./mapsv4/map10187-3.js');
var allergiesMapv4 = require('./mapsv4/map48765-2.js');
var immsMapv4 = require('./mapsv4/map39235-7.js');
var problemsMapv4 = require('./mapsv4/map11450-4.js');
var apLabsMapv4 = require('./mapsv4/map26439-0.js');
var chLabsMapv4 = require('./mapsv4/map11502-2.js');
var miLabsMapv4 = require('./mapsv4/map18725-2.js');
var radReportsMapv4 = require('./mapsv4/map30954-2.js');
var deployFormsMapv4 = require('./mapsv4/map51847-2.js');
var encNotesMapv4 = require('./mapsv4/map34109-9.js');

var getJSONFileListingByLOINC = function (loinc, path) {
    var fileListArray = fs.readdirSync(path);

    var filteredNames = fileListArray.filter(function (fileName) {
        if (fileName.indexOf(loinc) > 6){
            return fileName;
        }
    })

    return filteredNames;
};

var domains = {
    "admissions": {v2loinc: "21869-3", v3loinc: "21869-3", mapper: admnMap},
    "appointments": {v2loinc: "56446-8", v3loinc: "56446-8", mapper: apptMap},
    "demographics": {v2loinc: "52536-0", v3loinc: "52536-0", mapper: demoMap},
    "encounters": {v2loinc: "46240-8", v3loinc: "46240-8", mapper: encoMap},
    "meds": {v2loinc: "10160-0", v3loinc: "10160-0", mapper: medsMap},
    "notes": {v2loinc: "60733-3", v3loinc: "11536-0", mapper: noteMap},
    "allOrders": {v2loinc: "46209-3", v3loinc: "46209-3", mapper: ordersallMap},
    "ordersConsults": {v2loinc: "11487-6", v3loinc: "11487-6", mapper: ordersconMap},
    "ordersLabs": {v2loinc: "26436-6", v3loinc: "26436-6", mapper: orderslabMap},
    "ordersMeds": {v2loinc: "29305-0", v3loinc: "29305-0", mapper: ordersmedMap},
    "ordersRads": {v2loinc: "18726-0", v3loinc: "18726-0", mapper: ordersradMap},
    "procedures": {v2loinc: "47519-4", v3loinc: "47519-4", mapper: procMap},
    "questionnaires": {v2loinc: "10187-3", v3loinc: "10187-3", mapper: quesMap}
    //"insurances": {loinc: "48768-6", mapper: insuMap}
}

var domainsv4 = {
    "admissions": {v2loinc: "21869-3", v4loinc: "52536-0", mapper: admnMapv4},
    "appointments": {v2loinc: "56446-8", v4loinc: "56446-8", mapper: apptMapv4},
    "demographics": {v2loinc: "52536-0", v4loinc: "45970-1", mapper: demoMapv4},
    "encounters": {v2loinc: "46240-8", v4loinc: "46240-8", mapper: encoMapv4},
    "meds": {v2loinc: "10160-0", v4loinc: "10160-0", mapper: medsMapv4},
    "notes": {v2loinc: "60733-3", v4loinc: "11536-0", mapper: noteMapv4},
    "allOrders": {v2loinc: "46209-3", v4loinc: "46209-3", mapper: ordersallMapv4},
    "ordersConsults": {v2loinc: "11487-6", v4loinc: "11487-6", mapper: ordersconMapv4},
    "ordersLabs": {v2loinc: "26436-6", v4loinc: "26436-6", mapper: orderslabMapv4},
    "ordersMeds": {v2loinc: "29305-0", v4loinc: "29305-0", mapper: ordersmedMapv4},
    "ordersRads": {v2loinc: "18726-0", v4loinc: "75490-3", mapper: ordersradMapv4},
    "procedures": {v2loinc: "47519-4", v4loinc: "47519-4", mapper: procMapv4},
    "questionnaires": {v2loinc: "10187-3", v4loinc: "10187-3", mapper: quesMapv4},

    "allergies": {v2loinc: "48765-2", v4loinc: "52472-8", mapper: allergiesMapv4},
    "immunizations": {v2loinc: "39235-7", v4loinc: "39235-7", mapper: immsMapv4},
    "problems": {v2loinc: "11450-4", v4loinc: "11450-4", mapper: problemsMapv4},
    "labApResults": {v2loinc: "26439-0", v4loinc: "26439-0", mapper: apLabsMapv4},
    "labChemResults": {v2loinc: "11502-2", v4loinc: "11502-2", mapper: chLabsMapv4},
    "labMicroResults": {v2loinc: "18725-2", v4loinc: "18725-2", mapper: miLabsMapv4},

    "radiologyReports": {v2loinc: "30954-2", v4loinc: "18726-0", mapper: radReportsMapv4},
    "deploymentForms": {v2loinc: "51847-2", v4loinc: "51847-2", mapper: deployFormsMapv4},
    "encounterNotes": {v2loinc: "34109-9", v4loinc: "34109-9", mapper: encNotesMapv4}

    //"insurances": {loinc: "48768-6", mapper: insuMapv4}
}


var getMapper= function (domainName) {


}

module.exports.getJSONFileListingByLOINC = getJSONFileListingByLOINC;
module.exports.domains = domains;
module.exports.domainsv4 = domainsv4;