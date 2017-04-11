'use strict';

var parse = require('./progress-notes-titles-icd-10-parser').parse;

var log = sinon.stub(require('bunyan').createLogger({ name: 'progress-notes-titles-icd-10-parser' }));

describe('unit test to validate progress-notes-titles-icd-10', function() {
    it('can parse the RPC data correctly', function () {
        var result = parse(log, '5009597^Staphylococcal Arthritis, unspecified Joint^ICD-10-CM^M00.00^^^^^511044' + '\r\n' +
            '5009598^Staphylococcal Arthritis, right Shoulder^ICD-10-CM^M00.011^^^^^511045' + '\r\n' +
            '5009599^Staphylococcal Arthritis, left Shoulder^ICD-10-CM^M00.012^^^^^511046' + '\r\n' +
            '5009600^Staphylococcal Arthritis, unspecified Shoulder^ICD-10-CM^M00.019^^^^^511047' + '\r\n' +
            '5009601^Staphylococcal Arthritis, right Elbow^ICD-10-CM^M00.021^^^^^511048' + '\r\n' +
            '5009602^Staphylococcal Arthritis, left Elbow^ICD-10-CM^M00.022^^^^^511049' + '\r\n' +
            '5009603^Staphylococcal Arthritis, unspecified Elbow^ICD-10-CM^M00.029^^^^^511050' + '\r\n' +
            '5009604^Staphylococcal Arthritis, right Wrist^ICD-10-CM^M00.031^^^^^511051' + '\r\n' +
            '5009605^Staphylococcal Arthritis, left Wrist^ICD-10-CM^M00.032^^^^^511052' + '\r\n' +
            '5009606^Staphylococcal Arthritis, unspecified Wrist^ICD-10-CM^M00.039^^^^^511053' + '\r\n' +
            '5009607^Staphylococcal Arthritis, right Hand^ICD-10-CM^M00.041^^^^^511054' + '\r\n' +
            '5009608^Staphylococcal Arthritis, left Hand^ICD-10-CM^M00.042^^^^^511055' + '\r\n' +
            '5009609^Staphylococcal Arthritis, unspecified Hand^ICD-10-CM^M00.049^^^^^511056\r\n' +
            '5009610^Staphylococcal Arthritis, right Hip^ICD-10-CM^M00.051^^^^^511057' + '\r\n' +
            '5009611^Staphylococcal Arthritis, left Hip^ICD-10-CM^M00.052^^^^^511058' + '\r\n' +
            '5009612^Staphylococcal Arthritis, unspecified Hip^ICD-10-CM^M00.059^^^^^511059' + '\r\n' +
            '5009613^Staphylococcal Arthritis, right Knee^ICD-10-CM^M00.061^^^^^511060' + '\r\n' +
            '5009614^Staphylococcal Arthritis, left Knee^ICD-10-CM^M00.062^^^^^511061' + '\r\n' +
            '5009615^Staphylococcal Arthritis, unspecified Knee^ICD-10-CM^M00.069^^^^^511062' + '\r\n' +
            '5009616^Staphylococcal Arthritis, right Ankle and Foot^ICD-10-CM^M00.071^^^^^511063' + '\r\n' +
            '5009617^Staphylococcal Arthritis, left Ankle and Foot^ICD-10-CM^M00.072^^^^^511064' + '\r\n' +
            '5009618^Staphylococcal Arthritis, unspecified Ankle and Foot^ICD-10-CM^M00.079^^^^^511065' + '\r\n' +
            '5009619^Staphylococcal Arthritis, Vertebrae^ICD-10-CM^M00.08^^^^^511066' + '\r\n' +
            '5009620^Staphylococcal Polyarthritis^ICD-10-CM^M00.09^^^^^511067' + '\r\n');

        expect(result).to.eql(
            [
                {
                    preferredText: 'Staphylococcal Arthritis, unspecified Joint',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.00',
                    diagnosisIen: '511044',
                    ien: '5009597'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, right Shoulder',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.011',
                    diagnosisIen: '511045',
                    ien: '5009598'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, left Shoulder',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.012',
                    diagnosisIen: '511046',
                    ien: '5009599'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, unspecified Shoulder',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.019',
                    diagnosisIen: '511047',
                    ien: '5009600'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, right Elbow',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.021',
                    diagnosisIen: '511048',
                    ien: '5009601'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, left Elbow',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.022',
                    diagnosisIen: '511049',
                    ien: '5009602'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, unspecified Elbow',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.029',
                    diagnosisIen: '511050',
                    ien: '5009603'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, right Wrist',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.031',
                    diagnosisIen: '511051',
                    ien: '5009604'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, left Wrist',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.032',
                    diagnosisIen: '511052',
                    ien: '5009605'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, unspecified Wrist',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.039',
                    diagnosisIen: '511053',
                    ien: '5009606'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, right Hand',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.041',
                    diagnosisIen: '511054',
                    ien: '5009607'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, left Hand',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.042',
                    diagnosisIen: '511055',
                    ien: '5009608'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, unspecified Hand',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.049',
                    diagnosisIen: '511056',
                    ien: '5009609'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, right Hip',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.051',
                    diagnosisIen: '511057',
                    ien: '5009610'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, left Hip',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.052',
                    diagnosisIen: '511058',
                    ien: '5009611'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, unspecified Hip',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.059',
                    diagnosisIen: '511059',
                    ien: '5009612'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, right Knee',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.061',
                    diagnosisIen: '511060',
                    ien: '5009613'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, left Knee',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.062',
                    diagnosisIen: '511061',
                    ien: '5009614'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, unspecified Knee',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.069',
                    diagnosisIen: '511062',
                    ien: '5009615'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, right Ankle and Foot',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.071',
                    diagnosisIen: '511063',
                    ien: '5009616'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, left Ankle and Foot',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.072',
                    diagnosisIen: '511064',
                    ien: '5009617'
                },
                {
                    preferredText: 'Staphylococcal Arthritis, unspecified Ankle and Foot',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.079',
                    diagnosisIen: '511065',
                    ien: '5009618'
                },
                {   preferredText: 'Staphylococcal Arthritis, Vertebrae',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.08',
                    diagnosisIen: '511066',
                    ien: '5009619'
                },
                {
                    preferredText: 'Staphylococcal Polyarthritis',
                    icdCodingSystem: 'ICD-10-CM',
                    icdCode: 'M00.09',
                    diagnosisIen: '511067',
                    ien: '5009620'
                }
        ]);
    });
});
