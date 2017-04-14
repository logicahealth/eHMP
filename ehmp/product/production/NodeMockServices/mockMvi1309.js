/*jslint node: true */
'use strict';

/**
 * Based on the patientId, we will determine which of the responses (1310) to return for the soap message submitted (1309).
 * This will return a String that is used to load the corresponding file.
 *
 * @param patientId The identifier of the patient for which you want the detailed 1310 response returned.
 * @returns {string}
 */
function fetchMvi1309FileName(patientId) {
    if (patientId === "")  //Passed in PatientID is required
        return "0 Results";
    else if (patientId === "10108V420871^NI^200M^USVHA")
        return "ICN 10108V420871";
    else if (patientId === "43215678^NI^200DOD^USDOD")
        return "EDIPI 43215678";
    else if (patientId === "5000000116V912836^NI^200M^USVHA")
        return "ICN 5000000116V912836";
    else if (patientId === "5000000352V586511^NI^200M^USVHA")
        return "ICN 5000000352V586511";
    else if (patientId === "5000002735V529059^NI^200M^USVHA")
        return "ICN 5000002735V529059";
    else if (patientId === "5000002734V893260^NI^200M^USVHA")
        return "ICN 5000002734V893260";
    else if (patientId === "5000002706V879852^NI^200M^USVHA")
        return "ICN 5000002706V879852";
    else if (patientId === "5000002707V548711^NI^200M^USVHA")
        return "ICN 5000002707V548711";
    else if (patientId === "5000002708V201670^NI^200M^USVHA")
        return "ICN 5000002708V201670";
    else if (patientId === "5000002711V857509^NI^200M^USVHA")
        return "ICN 5000002711V857509";
    else if (patientId === "5000002712V535924^NI^200M^USVHA")
        return "ICN 5000002712V535924";
    else if (patientId === "5000002713V260846^NI^200M^USVHA")
        return "ICN 5000002713V260846";
    else if (patientId === "5000002714V012798^NI^200M^USVHA")
        return "ICN 5000002714V012798";
    else if (patientId === "5000002715V176683^NI^200M^USVHA")
        return "ICN 5000002715V176683";
    else if (patientId === "5000002716V344135^NI^200M^USVHA")
        return "ICN 5000002716V344135";
    else if (patientId === "5000002717V403467^NI^200M^USVHA")
        return "ICN 5000002717V403467";
    else if (patientId === "5000002718V689352^NI^200M^USVHA")
        return "ICN 5000002718V689352";
    else if (patientId === "5000002719V798211^NI^200M^USVHA")
        return "ICN 5000002719V798211";
    else if (patientId === "5000002720V643731^NI^200M^USVHA")
        return "ICN 5000002720V643731";
    else if (patientId === "5000002721V709660^NI^200M^USVHA")
        return "ICN 5000002721V709660";
    else if (patientId === "5000002722V988159^NI^200M^USVHA")
        return "ICN 5000002722V988159";
    else if (patientId === "5000002723V891414^NI^200M^USVHA")
        return "ICN 5000002723V891414";
    else if (patientId === "5000002724V527376^NI^200M^USVHA")
        return "ICN 5000002724V527376";
    else if (patientId === "5000002725V255208^NI^200M^USVHA")
        return "ICN 5000002725V255208";
    else if (patientId === "5000002726V030023^NI^200M^USVHA")
        return "ICN 5000002726V030023";
    else if (patientId === "5000002727V162545^NI^200M^USVHA")
        return "ICN 5000002727V162545";
    else if (patientId === "5000002728V316997^NI^200M^USVHA")
        return "ICN 5000002728V316997";
    else if (patientId === "5000002729V474882^NI^200M^USVHA")
        return "ICN 5000002729V474882";
    else if (patientId === "5000002730V470645^NI^200M^USVHA")
        return "ICN 5000002730V470645";
    else if (patientId === "5000002731V642197^NI^200M^USVHA")
        return "ICN 5000002731V642197";
    else if (patientId === "5000002732V706482^NI^200M^USVHA")
        return "ICN 5000002732V706482";
    else if (patientId === "5000002733V984331^NI^200M^USVHA")
        return "ICN 5000002733V984331";
    else if (patientId === "5000002745V891312^NI^200M^USVHA")
        return "ICN 5000002745V891312";
    else if (patientId === "5000000217V519385^NI^200M^USVHA")
        return "ICN 5000000217V519385";
    else if (patientId === "5000000317V387446^NI^200M^USVHA")
        return "ICN 5000000317V387446";
    else if (patientId === "10118V572553^NI^200M^USVHA")
        return "ICN 10118V572553";
    else if (patientId === "5000000126V406128^NI^200M^USVHA")
        return "ICN 5000000126V406128";
    else if (patientId === "5000000227V477236^NI^200M^USVHA")
        return "ICN 5000000227V477236";
    else if (patientId === "5000000327V828570^NI^200M^USVHA")
        return "ICN 5000000327V828570";
    else if (patientId === "10180V273016^NI^200M^USVHA")
        return "ICN 10180V273016";
    else if (patientId === "5000000187V951630^NI^200M^USVHA")
        return "ICN 5000000187V951630";
    else if (patientId === "10107V395912^NI^200M^USVHA")
        return "ICN 10107V395912";
    else if (patientId === "100031V310296^NI^200M^USVHA")
        return "ICN 100031V310296";
    else if (patientId === "4325678^NI^200DOD^USDOD")
        return "EDIPI 4325678";
    else if (patientId === "4325678V4325678^NI^200M^USVHA")
        return "ICN 4325678V4325678";
    else if (patientId === "4325679V4325679^NI^200M^USVHA")
        return "ICN 4325679V4325679";
    else if (patientId === "5000000123V015819^NI^200M^USVHA")
        return "ICN 5000000123V015819";
    else if (patientId === "5000001544V052517^NI^200M^USVHA")
        return "ICN 5000001544V052517";
    else
        return "0 Results";
}

module.exports.fetchMvi1309FileName = fetchMvi1309FileName;