define(function() {
    'use strict';
    var displayGroupManifest = {
        name: 'ALL SERVICES',
        shortName: 'ALL',
        mixedName: 'All',
        members: [{
            name: 'PHARMACY',
            shortName: 'RX',
            mixedName: 'Meds',
            members: [{
                name: 'INPATIENT MEDICATIONS',
                shortName: 'I RX',
                mixedName: 'Inpt. Meds',
                members: [{
                    name: 'UNIT DOSE MEDICATIONS',
                    shortName: 'UD RX',
                    mixedName: 'Inpt. Meds',
                    members: []
                }, {
                    name: 'IV MEDICATIONS',
                    shortName: 'IV RX',
                    mixedName: 'Infusion',
                    members: [{
                        name: 'PARENTERAL NUTRITION',
                        shortName: 'TPN',
                        mixedName: 'TPN',
                        members: []
                    }]
                }]
            }, {
                name: 'OUTPATIENT MEDICATIONS',
                shortName: 'O RX',
                mixedName: 'Out. Meds',
                members: []
            }, {
                name: 'NON-VA MEDICATIONS',
                shortName: 'NV RX',
                mixedName: 'Non-VA Meds',
                members: []
            }, {
                name: 'CLINIC ORDERS',
                shortName: 'C RX',
                mixedName: 'Clinic Orders',
                members: []
            }]
        }, {
            name: 'LABORATORY',
            shortName: 'LAB',
            mixedName: 'Lab',
            members: [{
                name: 'CHEMISTRY',
                shortName: 'CH',
                mixedName: 'Chemistry',
                members: []
            }, {
                name: 'HEMATOLOGY',
                shortName: 'HEMA',
                mixedName: 'Hematology',
                members: []
            }, {
                name: 'MICROBIOLOGY',
                shortName: 'MI',
                mixedName: 'Microbiology',
                members: []
            }, {
                name: 'BLOOD BANK',
                shortName: 'BB',
                mixedName: 'Blood Bank',
                members: [{
                    name: 'BLOOD PRODUCTS',
                    shortName: 'VBEC',
                    mixedName: 'Blood Bank',
                    members: [{
                        name: 'BLOOD COMPONENTS',
                        shortName: 'VBC',
                        mixedName: 'Blood Components',
                        members: []
                    }, {
                        name: 'DIAGNOSTIC TESTS',
                        shortName: 'VBT',
                        mixedName: 'Diagnostic Tests',
                        members: []
                    }]
                }]
            }, {
                name: 'ANATOMIC PATHOLOGY',
                shortName: 'AP',
                mixedName: 'Anat. Path.',
                members: []
            }, {
                name: 'ELECTRON MICROSCOPY',
                shortName: 'EM',
                mixedName: 'Electron Microscopy',
                members: []
            }, {
                name: 'SURGICAL PATHOLOGY',
                shortName: 'SP',
                mixedName: 'Surg. Path.',
                members: []
            }, {
                name: 'AUTOPSY',
                shortName: 'AU',
                mixedName: 'Autopsy',
                members: []
            }, {
                name: 'CYTOLOGY',
                shortName: 'CY',
                mixedName: 'Cytology',
                members: []
            }]
        }, {
            name: 'IMAGING',
            shortName: 'XRAY',
            mixedName: 'Imaging',
            members: [{
                name: 'GENERAL RADIOLOGY',
                shortName: 'RAD',
                mixedName: 'Radiology',
                members: []
            }, {
                name: 'CT SCAN',
                shortName: 'CT',
                mixedName: '',
                members: []
            }, {
                name: 'MAGNETIC RESONANCE IMAGING',
                shortName: 'MRI',
                mixedName: 'MRI',
                members: []
            }, {
                name: 'ANGIO/NEURO/INTERVENTIONAL',
                shortName: 'ANI',
                mixedName: 'Angio/Neuro',
                members: []
            }, {
                name: 'CARDIOLOGY STUDIES (NUC MED)',
                shortName: 'CARD',
                mixedName: 'Cardiology',
                members: []
            }, {
                name: 'NUCLEAR MEDICINE',
                shortName: 'NM',
                mixedName: 'Nuclear Med',
                members: []
            }, {
                name: 'ULTRASOUND',
                shortName: 'US',
                mixedName: 'Ultrasound',
                members: []
            }, {
                name: 'VASCULAR LAB',
                shortName: 'VAS',
                mixedName: 'Vascular Lab',
                members: []
            }, {
                name: 'MAMMOGRAPHY',
                shortName: 'MAM',
                mixedName: 'Mammography',
                members: []
            }]
        }, {
            name: 'DIETETICS',
            shortName: 'DIET',
            mixedName: 'Diet',
            members: [{
                name: 'DIET ORDERS',
                shortName: 'DO',
                mixedName: 'Diet',
                members: []
            }, {
                name: 'TUBEFEEDINGS',
                shortName: 'TF',
                mixedName: 'Tubefeeding',
                members: []
            }, {
                name: 'DIETETIC CONSULTS',
                shortName: 'D CON',
                mixedName: 'Diet Consult',
                members: []
            }, {
                name: 'DIET ADDITIONAL ORDERS',
                shortName: 'D AO',
                mixedName: 'Diet Add\'l',
                members: []
            }, {
                name: 'EARLY/LATE TRAYS',
                shortName: 'E/L T',
                mixedName: 'Early/Late Trays',
                members: []
            }, {
                name: 'PRECAUTIONS',
                shortName: 'PREC',
                mixedName: 'Precautions',
                members: []
            }, {
                name: 'OUTPATIENT MEALS',
                shortName: 'MEAL',
                mixedName: 'Outpt Meal',
                members: []
            }]
        }, {
            name: 'CONSULTS',
            shortName: 'CSLT',
            mixedName: 'Consults',
            members: []
        }, {
            name: 'VITALS/MEASUREMENTS',
            shortName: 'V/M',
            mixedName: 'Vitals',
            members: []
        }, {
            name: 'NURSING',
            shortName: 'NURS',
            mixedName: 'Nursing',
            members: [{
                name: 'ACTIVITY',
                shortName: 'ACT',
                mixedName: 'Activity',
                members: []
            }, {
                name: 'TREATMENTS',
                shortName: 'NTX',
                mixedName: 'Treatments',
                members: []
            }]
        }, {
            name: 'SURGERY',
            shortName: 'SURG',
            mixedName: 'Surgery',
            members: []
        }, {
            name: 'M.A.S',
            shortName: 'ADT',
            mixedName: 'A/D/T',
            members: [{
                name: 'DIAGNOSIS',
                shortName: 'DX',
                mixedName: 'Diagnosis',
                members: []
            }, {
                name: 'CONDITION',
                shortName: 'COND',
                mixedName: 'Condition',
                members: []
            }]
        }, {
            name: 'OTHER HOSPITAL SERVICES',
            shortName: 'OTHER',
            mixedName: 'Other',
            members: []
        }, {
            name: 'PROCEDURES',
            shortName: 'PROC',
            mixedName: 'Procedures',
            members: []
        }, {
            name: 'ALLERGIES',
            shortName: 'ALG',
            mixedName: 'Allergy',
            members: []
        }, {
            name: 'SUPPLIES/DEVICES',
            shortName: 'SPLY',
            mixedName: 'Supplies',
            members: []
        }],
    };

    return displayGroupManifest;
});