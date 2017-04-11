/*jslint node: true */
'use strict';

/**
 * Returns the name of the xml file that contains a SOAP response with the patient photo that corresponds to the veteranCardId.
 * This function will return a String that is used to load the corresponding patient photo file.
 *
 * @param veteranCardId The identifier of the veteran's card for which you want the corresponding VHIC card photo returned.
 * @returns {string} The file name (without a file extension) of the corresponding SOAP response.
 */
function fetchVhicPhotoFileName(veteranCardId) {
    if (veteranCardId === "")
        return "0 Results";
    else if (veteranCardId === "1111")
        return "Card ID 1111";
    else if (veteranCardId === "8118")
        return "Card ID 8118";
    else if (veteranCardId === "33001")
        return "Card ID 33001";
    else if (veteranCardId === "33002")
        return "Card ID 33002";
    else if (veteranCardId === "33003")
        return "Card ID 33003";
    else if (veteranCardId === "33004")
        return "Card ID 33004";
    else if (veteranCardId === "33005")
        return "Card ID 33005";
    else if (veteranCardId === "33006")
        return "Card ID 33006";
    else if (veteranCardId === "33007")
        return "Card ID 33007";
    else if (veteranCardId === "33008")
        return "Card ID 33008";
    else if (veteranCardId === "33009")
        return "Card ID 33009";
    else if (veteranCardId === "33010")
        return "Card ID 33010";
    else if (veteranCardId === "33011")
        return "Card ID 33011";
    else if (veteranCardId === "33012")
        return "Card ID 33012";
    else if (veteranCardId === "33013")
        return "Card ID 33013";
    else if (veteranCardId === "33014")
        return "Card ID 33014";
    else if (veteranCardId === "33015")
        return "Card ID 33015";
    else if (veteranCardId === "33016")
        return "Card ID 33016";
    else if (veteranCardId === "33017")
        return "Card ID 33017";
    else if (veteranCardId === "33018")
        return "Card ID 33018";
    else if (veteranCardId === "33019")
        return "Card ID 33019";
    else if (veteranCardId === "33020")
        return "Card ID 33020";
    else if (veteranCardId === "33021")
        return "Card ID 33021";
    else if (veteranCardId === "33022")
        return "Card ID 33022";
    else if (veteranCardId === "33023")
        return "Card ID 33023";
    else if (veteranCardId === "33024")
        return "Card ID 33024";
    else if (veteranCardId === "33025")
        return "Card ID 33025";
    else if (veteranCardId === "33026")
        return "Card ID 33026";
    else if (veteranCardId === "33027")
        return "Card ID 33027";
    else if (veteranCardId === "33028")
        return "Card ID 33028";
    else if (veteranCardId === "33029")
        return "Card ID 33029";
    else if (veteranCardId === "33030")
        return "Card ID 33030";
    else if (veteranCardId === '32758')
        return "Card ID 32758"
    else if (veteranCardId === "1114")
        return "Card On Hold";
    else if (veteranCardId === "down_for_maintenance")
        return "Down For Maintenance";
    else
        return "0 Results";
}

module.exports.fetchVhicPhotoFileName = fetchVhicPhotoFileName;
