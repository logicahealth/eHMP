/*global sinon, describe, it */
'use strict';

var parse = require('./immunization-manufacturer-parser').parse;

var log = sinon.stub(require('bunyan').createLogger({ name: 'immunization-manufacturer-parser' }));
//var log = require('bunyan').createLogger({ name: 'immunization-manufacturer-parser' }); //Uncomment this line (and comment above) to see output in IntelliJ console

describe('unit test to validate immunization-manufacturer', function() {
    it('can parse the RPC data correctly', function () {
    	/* jshint -W109 */
        var result = parse(log, 'RECORD^1 OF 68' + '\r\n' +
                                'NAME^ABBOTT LABORATORIES' + '\r\n' +
                                'MVX CODE^AB' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^includes Ross Products Division, Solvay' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^2 OF 68' + '\r\n' +
                                'NAME^ACAMBIS, INC' + '\r\n' +
                                'MVX CODE^ACA' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^acquired by sanofi in sept 2008' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^3 OF 68' + '\r\n' +
                                'NAME^ADAMS LABORATORIES, INC.' + '\r\n' +
                                'MVX CODE^AD' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^4 OF 68' + '\r\n' +
                                'NAME^AKORN, INC' + '\r\n' +
                                'MVX CODE^AKR' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^5 OF 68' + '\r\n' +
                                'NAME^ALPHA THERAPEUTIC CORPORATION' + '\r\n' +
                                'MVX CODE^ALP' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^6 OF 68' + '\r\n' +
                                'NAME^ARMOUR' + '\r\n' +
                                'MVX CODE^AR' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^part of CSL' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^7 OF 68' + '\r\n' +
                                'NAME^AVENTIS BEHRING L.L.C.' + '\r\n' +
                                'MVX CODE^AVB' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^part of CSL' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^8 OF 68' + '\r\n' +
                                'NAME^AVIRON' + '\r\n' +
                                'MVX CODE^AVI' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^acquired by Medimmune' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^9 OF 68' + '\r\n' +
                                'NAME^BARR LABORATORIES' + '\r\n' +
                                'MVX CODE^BRR' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^Subsidiary of Teva Pharmaceuticals' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^10 OF 68' + '\r\n' +
                                'NAME^BAXTER HEALTHCARE CORPORATION' + '\r\n' +
                                'MVX CODE^BAH' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^includes Hyland Immuno, Immuno International AG,and North American Vaccine, Inc./acquired some assets from alpha therapeutics' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^11 OF 68' + '\r\n' +
                                'NAME^BAXTER HEALTHCARE CORPORATION-INACTIVE' + '\r\n' +
                                'MVX CODE^BA' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^12 OF 68' + '\r\n' +
                                'NAME^BAYER CORPORATION' + '\r\n' +
                                'MVX CODE^BAY' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^Bayer Biologicals now owned by Talecris' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^13 OF 68' + '\r\n' +
                                'NAME^BERNA PRODUCTS' + '\r\n' +
                                'MVX CODE^BP' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^14 OF 68' + '\r\n' +
                                'NAME^BERNA PRODUCTS CORPORATION' + '\r\n' +
                                'MVX CODE^BPC' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^includes Swiss Serum and Vaccine Institute Berne' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^15 OF 68' + '\r\n' +
                                'NAME^BIOTEST PHARMACEUTICALS CORPORATION' + '\r\n' +
                                'MVX CODE^BTP' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^New owner of NABI HB as of December 2007, Does NOT replace NABI Biopharmaceuticals in this code list.' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^16 OF 68' + '\r\n' +
                                'NAME^CANGENE CORPORATION' + '\r\n' +
                                'MVX CODE^CNJ' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^Purchased by Emergent Biosolutions' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^17 OF 68' + '\r\n' +
                                'NAME^CELLTECH MEDEVA PHARMACEUTICALS' + '\r\n' +
                                'MVX CODE^CMP' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^Part of Novartis' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^18 OF 68' + '\r\n' +
                                'NAME^CENTEON L.L.C.' + '\r\n' +
                                'MVX CODE^CEN' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^19 OF 68' + '\r\n' +
                                'NAME^CHIRON CORPORATION' + '\r\n' +
                                'MVX CODE^CHI' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^Part of Novartis' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^20 OF 68' + '\r\n' +
                                'NAME^CONNAUGHT' + '\r\n' +
                                'MVX CODE^CON' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^acquired by Merieux' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^21 OF 68' + '\r\n' +
                                'NAME^CRUCELL' + '\r\n' +
                                'MVX CODE^CRU' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^acquired Berna,  now a J & J company' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^22 OF 68' + '\r\n' +
                                'NAME^CSL BEHRING, INC' + '\r\n' +
                                'MVX CODE^CSL' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^CSL Biotherapies renamed to CSL Behring' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^23 OF 68' + '\r\n' +
                                'NAME^DYNPORT VACCINE COMPANY, LLC' + '\r\n' +
                                'MVX CODE^DVC' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^24 OF 68' + '\r\n' +
                                'NAME^EMERGENT BIODEFENSE OPERATIONS LANSING' + '\r\n' +
                                'MVX CODE^MIP' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^A unit of Emergent BioSolutions, Bioport renamed. Formerly Michigan Biologic Products Institute' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^25 OF 68' + '\r\n' +
                                'NAME^EVANS MEDICAL LIMITED' + '\r\n' +
                                'MVX CODE^EVN' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^Part of Novartis' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^26 OF 68' + '\r\n' +
                                'NAME^GEOVAX LABS, INC.' + '\r\n' +
                                'MVX CODE^GEO' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^27 OF 68' + '\r\n' +
                                'NAME^GLAXOSMITHKLINE' + '\r\n' +
                                'MVX CODE^SKB' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^includes SmithKline Beecham and Glaxo Wellcome' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^28 OF 68' + '\r\n' +
                                'NAME^GREER LABORATORIES, INC.' + '\r\n' +
                                'MVX CODE^GRE' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^29 OF 68' + '\r\n' +
                                'NAME^GRIFOLS' + '\r\n' +
                                'MVX CODE^GRF' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^30 OF 68' + '\r\n' +
                                'NAME^ID BIOMEDICAL' + '\r\n' +
                                'MVX CODE^IDB' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^31 OF 68' + '\r\n' +
                                'NAME^IMMUNO INTERNATIONAL AG' + '\r\n' +
                                'MVX CODE^IAG' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^Part of Baxter' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^32 OF 68' + '\r\n' +
                                'NAME^IMMUNO-U.S., INC.' + '\r\n' +
                                'MVX CODE^IUS' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^33 OF 68' + '\r\n' +
                                'NAME^INTERCELL BIOMEDICAL' + '\r\n' +
                                'MVX CODE^INT' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^34 OF 68' + '\r\n' +
                                'NAME^JOHNSON AND JOHNSON' + '\r\n' +
                                'MVX CODE^JNJ' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^acquired CRUCELL which acquired Berna' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^35 OF 68' + '\r\n' +
                                'NAME^KEDRIAN BIOPHARMA' + '\r\n' +
                                'MVX CODE^KED' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^acquired Rho(D) from Ortho' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^36 OF 68' + '\r\n' +
                                'NAME^KOREA GREEN CROSS CORPORATION' + '\r\n' +
                                'MVX CODE^KGC' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^37 OF 68' + '\r\n' +
                                'NAME^LEDERLE' + '\r\n' +
                                'MVX CODE^LED' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^became a part of WAL, now owned by Pfizer' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^38 OF 68' + '\r\n' +
                                'NAME^MASSACHUSETTS BIOLOGIC LABORATORIES' + '\r\n' +
                                'MVX CODE^MBL' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^formerly Massachusetts Public Health Biologic Laboratories' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^39 OF 68' + '\r\n' +
                                'NAME^MASSACHUSETTS PUBLIC HEALTH BIOLOGIC LABORATORIES' + '\r\n' +
                                'MVX CODE^MA' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^40 OF 68' + '\r\n' +
                                'NAME^MEDIMMUNE, INC.' + '\r\n' +
                                'MVX CODE^MED' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^acquisitions of U.S. Bioscience in 1999 and Aviron in 2002, as well as the integration with Cambridge Antibody Technology and the strategic alignment with our new parent company, AstraZeneca, in 2007.' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^41 OF 68' + '\r\n' +
                                'NAME^MERCK AND CO., INC.' + '\r\n' +
                                'MVX CODE^MSD' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^42 OF 68' + '\r\n' +
                                'NAME^MERIEUX' + '\r\n' +
                                'MVX CODE^IM' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^Part of sanofi' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^43 OF 68' + '\r\n' +
                                'NAME^MILES' + '\r\n' +
                                'MVX CODE^MIL' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^44 OF 68' + '\r\n' +
                                'NAME^NABI' + '\r\n' +
                                'MVX CODE^NAB' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^formerly North American Biologicals, Inc.' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^45 OF 68' + '\r\n' +
                                'NAME^NEW YORK BLOOD CENTER' + '\r\n' +
                                'MVX CODE^NYB' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^46 OF 68' + '\r\n' +
                                'NAME^NORTH AMERICAN VACCINE, INC.' + '\r\n' +
                                'MVX CODE^NAV' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^part of Baxter' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^47 OF 68' + '\r\n' +
                                'NAME^NOVARTIS PHARMACEUTICAL CORPORATION' + '\r\n' +
                                'MVX CODE^NOV' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^includes Chiron, PowderJect Pharmaceuticals, Celltech Medeva Vaccines and Evans Limited, Ciba-Geigy Limited and Sandoz Limited' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^48 OF 68' + '\r\n' +
                                'NAME^NOVAVAX, INC.' + '\r\n' +
                                'MVX CODE^NVX' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^49 OF 68' + '\r\n' +
                                'NAME^ORGANON TEKNIKA CORPORATION' + '\r\n' +
                                'MVX CODE^OTC' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^50 OF 68' + '\r\n' +
                                'NAME^ORTHO-CLINICAL DIAGNOSTICS' + '\r\n' +
                                'MVX CODE^ORT' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^a J & J company (formerly Ortho Diagnostic Systems, Inc.)' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^51 OF 68' + '\r\n' +
                                'NAME^OTHER MANUFACTURER' + '\r\n' +
                                'MVX CODE^OTH' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^52 OF 68' + '\r\n' +
                                'NAME^PARKEDALE PHARMACEUTICALS' + '\r\n' +
                                'MVX CODE^PD' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^no website and no news articles (formerly Parke-Davis)' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^53 OF 68' + '\r\n' +
                                'NAME^PFIZER, INC' + '\r\n' +
                                'MVX CODE^PFR' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^includes Wyeth-Lederle Vaccines and Pediatrics, Wyeth Laboratories, Lederle Laboratories, and Praxis Biologics,' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^54 OF 68' + '\r\n' +
                                'NAME^POWDERJECT PHARMACEUTICALS' + '\r\n' +
                                'MVX CODE^PWJ' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^See Novartis' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^55 OF 68' + '\r\n' +
                                'NAME^PRAXIS BIOLOGICS' + '\r\n' +
                                'MVX CODE^PRX' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^became a part of WAL, now owned by Pfizer' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^56 OF 68' + '\r\n' +
                                'NAME^PROTEIN SCIENCES' + '\r\n' +
                                'MVX CODE^PSC' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^57 OF 68' + '\r\n' +
                                'NAME^SANOFI PASTEUR' + '\r\n' +
                                'MVX CODE^PMC' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^formerly Aventis Pasteur, Pasteur Merieux Connaught; includes Connaught Laboratories and Pasteur Merieux. Acquired ACAMBIS.' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^58 OF 68' + '\r\n' +
                                'NAME^SCLAVO, INC.' + '\r\n' +
                                'MVX CODE^SCL' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^59 OF 68' + '\r\n' +
                                'NAME^SOLVAY PHARMACEUTICALS' + '\r\n' +
                                'MVX CODE^SOL' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^Part of Abbott' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^60 OF 68' + '\r\n' +
                                'NAME^SWISS SERUM AND VACCINE INST.' + '\r\n' +
                                'MVX CODE^SI' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^Part of Berna' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^61 OF 68' + '\r\n' +
                                'NAME^TALECRIS BIOTHERAPEUTICS' + '\r\n' +
                                'MVX CODE^TAL' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^includes Bayer Biologicals' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^62 OF 68' + '\r\n' +
                                'NAME^THE RESEARCH FOUNDATION FOR MICROBIAL DISEASES OF OSAKA UNIVERSITY (BIKEN)' + '\r\n' +
                                'MVX CODE^JPN' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^63 OF 68' + '\r\n' +
                                'NAME^UNITED STATES ARMY MEDICAL RESEARCH AND MATERIAL COMMAND' + '\r\n' +
                                'MVX CODE^USA' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^64 OF 68' + '\r\n' +
                                'NAME^UNKNOWN MANUFACTURER' + '\r\n' +
                                'MVX CODE^UNK' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^65 OF 68' + '\r\n' +
                                'NAME^VAXGEN' + '\r\n' +
                                'MVX CODE^VXG' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^acquired by Emergent Biodefense Operations Lansing, Inc' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^66 OF 68' + '\r\n' +
                                'NAME^WYETH' + '\r\n' +
                                'MVX CODE^WAL' + '\r\n' +
                                'INACTIVE FLAG^ACTIVE' + '\r\n' +
                                'CDC NOTES^acquired by Pfizer 10/15/2009' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^67 OF 68' + '\r\n' +
                                'NAME^WYETH-AYERST' + '\r\n' +
                                'MVX CODE^WA' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^became WAL, now owned by Pfizer' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n' +

                                'RECORD^68 OF 68' + '\r\n' +
                                'NAME^ZLB BEHRING' + '\r\n' +
                                'MVX CODE^ZLB' + '\r\n' +
                                'INACTIVE FLAG^INACTIVE' + '\r\n' +
                                'CDC NOTES^acquired by CSL' + '\r\n' +
                                'STATUS^ACTIVE' + '\r\n');

        expect(result).to.eql([
            {
                "record": "1 OF 68",
                "name": "ABBOTT LABORATORIES",
                "mvx": "AB",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "includes Ross Products Division, Solvay",
                "status": "ACTIVE"
            },
            {
                "record": "2 OF 68",
                "name": "ACAMBIS, INC",
                "mvx": "ACA",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "acquired by sanofi in sept 2008",
                "status": "ACTIVE"
            },
            {
                "record": "3 OF 68",
                "name": "ADAMS LABORATORIES, INC.",
                "mvx": "AD",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "4 OF 68",
                "name": "AKORN, INC",
                "mvx": "AKR",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "5 OF 68",
                "name": "ALPHA THERAPEUTIC CORPORATION",
                "mvx": "ALP",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "6 OF 68",
                "name": "ARMOUR",
                "mvx": "AR",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "part of CSL",
                "status": "ACTIVE"
            },
            {
                "record": "7 OF 68",
                "name": "AVENTIS BEHRING L.L.C.",
                "mvx": "AVB",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "part of CSL",
                "status": "ACTIVE"
            },
            {
                "record": "8 OF 68",
                "name": "AVIRON",
                "mvx": "AVI",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "acquired by Medimmune",
                "status": "ACTIVE"
            },
            {
                "record": "9 OF 68",
                "name": "BARR LABORATORIES",
                "mvx": "BRR",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "Subsidiary of Teva Pharmaceuticals",
                "status": "ACTIVE"
            },
            {
                "record": "10 OF 68",
                "name": "BAXTER HEALTHCARE CORPORATION",
                "mvx": "BAH",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "includes Hyland Immuno, Immuno International AG,and North American Vaccine, Inc./acquired some assets from alpha therapeutics",
                "status": "ACTIVE"
            },
            {
                "record": "11 OF 68",
                "name": "BAXTER HEALTHCARE CORPORATION-INACTIVE",
                "mvx": "BA",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "12 OF 68",
                "name": "BAYER CORPORATION",
                "mvx": "BAY",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "Bayer Biologicals now owned by Talecris",
                "status": "ACTIVE"
            },
            {
                "record": "13 OF 68",
                "name": "BERNA PRODUCTS",
                "mvx": "BP",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "14 OF 68",
                "name": "BERNA PRODUCTS CORPORATION",
                "mvx": "BPC",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "includes Swiss Serum and Vaccine Institute Berne",
                "status": "ACTIVE"
            },
            {
                "record": "15 OF 68",
                "name": "BIOTEST PHARMACEUTICALS CORPORATION",
                "mvx": "BTP",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "New owner of NABI HB as of December 2007, Does NOT replace NABI Biopharmaceuticals in this code list.",
                "status": "ACTIVE"
            },
            {
                "record": "16 OF 68",
                "name": "CANGENE CORPORATION",
                "mvx": "CNJ",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "Purchased by Emergent Biosolutions",
                "status": "ACTIVE"
            },
            {
                "record": "17 OF 68",
                "name": "CELLTECH MEDEVA PHARMACEUTICALS",
                "mvx": "CMP",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "Part of Novartis",
                "status": "ACTIVE"
            },
            {
                "record": "18 OF 68",
                "name": "CENTEON L.L.C.",
                "mvx": "CEN",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "19 OF 68",
                "name": "CHIRON CORPORATION",
                "mvx": "CHI",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "Part of Novartis",
                "status": "ACTIVE"
            },
            {
                "record": "20 OF 68",
                "name": "CONNAUGHT",
                "mvx": "CON",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "acquired by Merieux",
                "status": "ACTIVE"
            },
            {
                "record": "21 OF 68",
                "name": "CRUCELL",
                "mvx": "CRU",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "acquired Berna,  now a J & J company",
                "status": "ACTIVE"
            },
            {
                "record": "22 OF 68",
                "name": "CSL BEHRING, INC",
                "mvx": "CSL",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "CSL Biotherapies renamed to CSL Behring",
                "status": "ACTIVE"
            },
            {
                "record": "23 OF 68",
                "name": "DYNPORT VACCINE COMPANY, LLC",
                "mvx": "DVC",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "24 OF 68",
                "name": "EMERGENT BIODEFENSE OPERATIONS LANSING",
                "mvx": "MIP",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "A unit of Emergent BioSolutions, Bioport renamed. Formerly Michigan Biologic Products Institute",
                "status": "ACTIVE"
            },
            {
                "record": "25 OF 68",
                "name": "EVANS MEDICAL LIMITED",
                "mvx": "EVN",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "Part of Novartis",
                "status": "ACTIVE"
            },
            {
                "record": "26 OF 68",
                "name": "GEOVAX LABS, INC.",
                "mvx": "GEO",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "27 OF 68",
                "name": "GLAXOSMITHKLINE",
                "mvx": "SKB",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "includes SmithKline Beecham and Glaxo Wellcome",
                "status": "ACTIVE"
            },
            {
                "record": "28 OF 68",
                "name": "GREER LABORATORIES, INC.",
                "mvx": "GRE",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "29 OF 68",
                "name": "GRIFOLS",
                "mvx": "GRF",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "30 OF 68",
                "name": "ID BIOMEDICAL",
                "mvx": "IDB",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "31 OF 68",
                "name": "IMMUNO INTERNATIONAL AG",
                "mvx": "IAG",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "Part of Baxter",
                "status": "ACTIVE"
            },
            {
                "record": "32 OF 68",
                "name": "IMMUNO-U.S., INC.",
                "mvx": "IUS",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "33 OF 68",
                "name": "INTERCELL BIOMEDICAL",
                "mvx": "INT",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "34 OF 68",
                "name": "JOHNSON AND JOHNSON",
                "mvx": "JNJ",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "acquired CRUCELL which acquired Berna",
                "status": "ACTIVE"
            },
            {
                "record": "35 OF 68",
                "name": "KEDRIAN BIOPHARMA",
                "mvx": "KED",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "acquired Rho(D) from Ortho",
                "status": "ACTIVE"
            },
            {
                "record": "36 OF 68",
                "name": "KOREA GREEN CROSS CORPORATION",
                "mvx": "KGC",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "37 OF 68",
                "name": "LEDERLE",
                "mvx": "LED",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "became a part of WAL, now owned by Pfizer",
                "status": "ACTIVE"
            },
            {
                "record": "38 OF 68",
                "name": "MASSACHUSETTS BIOLOGIC LABORATORIES",
                "mvx": "MBL",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "formerly Massachusetts Public Health Biologic Laboratories",
                "status": "ACTIVE"
            },
            {
                "record": "39 OF 68",
                "name": "MASSACHUSETTS PUBLIC HEALTH BIOLOGIC LABORATORIES",
                "mvx": "MA",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "40 OF 68",
                "name": "MEDIMMUNE, INC.",
                "mvx": "MED",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "acquisitions of U.S. Bioscience in 1999 and Aviron in 2002, as well as the integration with Cambridge Antibody Technology and the strategic alignment with our new parent company, AstraZeneca, in 2007.",
                "status": "ACTIVE"
            },
            {
                "record": "41 OF 68",
                "name": "MERCK AND CO., INC.",
                "mvx": "MSD",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "42 OF 68",
                "name": "MERIEUX",
                "mvx": "IM",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "Part of sanofi",
                "status": "ACTIVE"
            },
            {
                "record": "43 OF 68",
                "name": "MILES",
                "mvx": "MIL",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "44 OF 68",
                "name": "NABI",
                "mvx": "NAB",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "formerly North American Biologicals, Inc.",
                "status": "ACTIVE"
            },
            {
                "record": "45 OF 68",
                "name": "NEW YORK BLOOD CENTER",
                "mvx": "NYB",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "46 OF 68",
                "name": "NORTH AMERICAN VACCINE, INC.",
                "mvx": "NAV",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "part of Baxter",
                "status": "ACTIVE"
            },
            {
                "record": "47 OF 68",
                "name": "NOVARTIS PHARMACEUTICAL CORPORATION",
                "mvx": "NOV",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "includes Chiron, PowderJect Pharmaceuticals, Celltech Medeva Vaccines and Evans Limited, Ciba-Geigy Limited and Sandoz Limited",
                "status": "ACTIVE"
            },
            {
                "record": "48 OF 68",
                "name": "NOVAVAX, INC.",
                "mvx": "NVX",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "49 OF 68",
                "name": "ORGANON TEKNIKA CORPORATION",
                "mvx": "OTC",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "50 OF 68",
                "name": "ORTHO-CLINICAL DIAGNOSTICS",
                "mvx": "ORT",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "a J & J company (formerly Ortho Diagnostic Systems, Inc.)",
                "status": "ACTIVE"
            },
            {
                "record": "51 OF 68",
                "name": "OTHER MANUFACTURER",
                "mvx": "OTH",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "52 OF 68",
                "name": "PARKEDALE PHARMACEUTICALS",
                "mvx": "PD",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "no website and no news articles (formerly Parke-Davis)",
                "status": "ACTIVE"
            },
            {
                "record": "53 OF 68",
                "name": "PFIZER, INC",
                "mvx": "PFR",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "includes Wyeth-Lederle Vaccines and Pediatrics, Wyeth Laboratories, Lederle Laboratories, and Praxis Biologics,",
                "status": "ACTIVE"
            },
            {
                "record": "54 OF 68",
                "name": "POWDERJECT PHARMACEUTICALS",
                "mvx": "PWJ",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "See Novartis",
                "status": "ACTIVE"
            },
            {
                "record": "55 OF 68",
                "name": "PRAXIS BIOLOGICS",
                "mvx": "PRX",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "became a part of WAL, now owned by Pfizer",
                "status": "ACTIVE"
            },
            {
                "record": "56 OF 68",
                "name": "PROTEIN SCIENCES",
                "mvx": "PSC",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "57 OF 68",
                "name": "SANOFI PASTEUR",
                "mvx": "PMC",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "formerly Aventis Pasteur, Pasteur Merieux Connaught; includes Connaught Laboratories and Pasteur Merieux. Acquired ACAMBIS.",
                "status": "ACTIVE"
            },
            {
                "record": "58 OF 68",
                "name": "SCLAVO, INC.",
                "mvx": "SCL",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "59 OF 68",
                "name": "SOLVAY PHARMACEUTICALS",
                "mvx": "SOL",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "Part of Abbott",
                "status": "ACTIVE"
            },
            {
                "record": "60 OF 68",
                "name": "SWISS SERUM AND VACCINE INST.",
                "mvx": "SI",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "Part of Berna",
                "status": "ACTIVE"
            },
            {
                "record": "61 OF 68",
                "name": "TALECRIS BIOTHERAPEUTICS",
                "mvx": "TAL",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "includes Bayer Biologicals",
                "status": "ACTIVE"
            },
            {
                "record": "62 OF 68",
                "name": "THE RESEARCH FOUNDATION FOR MICROBIAL DISEASES OF OSAKA UNIVERSITY (BIKEN)",
                "mvx": "JPN",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "63 OF 68",
                "name": "UNITED STATES ARMY MEDICAL RESEARCH AND MATERIAL COMMAND",
                "mvx": "USA",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "64 OF 68",
                "name": "UNKNOWN MANUFACTURER",
                "mvx": "UNK",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "",
                "status": "ACTIVE"
            },
            {
                "record": "65 OF 68",
                "name": "VAXGEN",
                "mvx": "VXG",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "acquired by Emergent Biodefense Operations Lansing, Inc",
                "status": "ACTIVE"
            },
            {
                "record": "66 OF 68",
                "name": "WYETH",
                "mvx": "WAL",
                "inactiveFlag": "ACTIVE",
                "cdcNotes": "acquired by Pfizer 10/15/2009",
                "status": "ACTIVE"
            },
            {
                "record": "67 OF 68",
                "name": "WYETH-AYERST",
                "mvx": "WA",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "became WAL, now owned by Pfizer",
                "status": "ACTIVE"
            },
            {
                "record": "68 OF 68",
                "name": "ZLB BEHRING",
                "mvx": "ZLB",
                "inactiveFlag": "INACTIVE",
                "cdcNotes": "acquired by CSL",
                "status": "ACTIVE"
            }
        ]);
		/* jshint +W109 */
    });
});
