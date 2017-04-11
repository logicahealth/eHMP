define([
    'jquery'
], function($) {
    "use strict";

    return {
        getInformationStatementList: function(infoStatement, informationStatementList){
            var informationStatements = [];

            if(infoStatement){
                var splitStatementList = infoStatement.split('|');

                _.each(splitStatementList, function(statement){
                    var statementSplit = statement.split('~');
                    var matchedStatements = informationStatementList.where({
                        ien: statementSplit[0],
                        editionStatus: 'CURRENT'
                    });

                    _.each(matchedStatements, function(item){
                        informationStatements.push({
                            value: false,
                            ien: item.get('ien'),
                            label: item.get('label'),
                            name: item.get('ien')
                        });
                    });
                });
            }

            return informationStatements;
        },
        getFormattedVisName: function(visModel){
            //xxx - Oct 25, 2011 Edition (English)
            var formattedName = '';
            var formattedEditionDate = '';
            var formattedLanguage = '';

            if(visModel.get('name')){
                var nameSplit = visModel.get('name').split(' ');

                for(var i = 0; i < nameSplit.length; i++){
                    if(nameSplit[i].toUpperCase() !== 'VIS'){
                        formattedName += nameSplit[i].charAt(0) + nameSplit[i].substring(1).toLowerCase() + ' ';
                    }
                }

                if(visModel.get('editionDate')){
                    var editionSplit = visModel.get('editionDate').split(' ');
                    formattedEditionDate = editionSplit[0].charAt(0).toUpperCase() + editionSplit[0].substring(1).toLowerCase() + ' ' + editionSplit[1] + ' ' + editionSplit[2];
                }

                if(visModel.get('language')){
                    formattedLanguage = visModel.get('language').charAt(0).toUpperCase() + visModel.get('language').substring(1).toLowerCase();
                }
            }

            return formattedName + '- ' + formattedEditionDate + ' Edition (' + formattedLanguage + ')';
        },
        getInformationSourceList: function(collection){
            var pickList = [];
            var label;
            _.each(collection, function(item){
                //lodash startCase function strips out apostrophe, so we temporarily change
                // them to 12 A's and get them back
                item.label = item.label.replace('\'', 'AAAAAAAAAAAA');
                label = _.startCase(item.label.toLowerCase());
                if(label !== 'New Immunization Record'){
                    label = label.replace('Historical Information ', '');
                    label = label.replace('aaaaaaaaaaaa', '\'');
                    var informationSource = {
                        label: label,
                        value: item.value
                    };
                    pickList.push(informationSource);
                }
            });

            return pickList;
        },
        getSeriesList: function(maxInSeries){
            var pickList = [];

            if(maxInSeries){
                var maxInSeriesNum = Number(maxInSeries);
                for(var i = 1; i <= maxInSeriesNum; i++){
                    pickList.push({label: i.toString(), value: i.toString()});
                }
            }

            pickList.push({label: 'Booster', value: 'B'});
            pickList.push({label: 'Complete', value: 'C'});
            pickList.push({label: 'Partially Complete', value: 'P'});

            return pickList;
        },
        doesItemMatch: function(substringRegex, item, administered){
            var inactiveFlag = item.get('inactiveFlag');
            var selectableHistoric = item.get('selectableHistoric');
              if((administered && inactiveFlag === '0') || ((!administered && inactiveFlag === '0') || (!administered && inactiveFlag === '1' && selectableHistoric === 'Y'))){
                if(substringRegex.test(item.get('label')) || substringRegex.test(item.get('cvxCode')) || substringRegex.test(item.get('shortName')) ||
                    substringRegex.test(item.get('cdcFullVaccineName')) || substringRegex.test(item.get('cdcProductName')) || substringRegex.test(item.get('acronym'))){
                    return true;
                }
            }

            return false;
        },
        findUser: function(providerList, user){
            var returnedUser;
            var userIen = user.get('duz')[user.get('site')];

            if(userIen){
                returnedUser = providerList.findWhere({code: userIen});
            }

            return returnedUser;
        }
    };
});