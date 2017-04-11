package us.vistacore.ehmp.model.transform;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.hl7.fhir.instance.formats.JsonComposer;
import org.hl7.fhir.instance.model.AtomFeed;
import org.hl7.fhir.instance.model.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;

/**
 * This class is used to convert a FHIR representation of a resource into a JSON representation.
 *
 * @author Kyle.Marchant, Les.Westberg
 *
 */
public final class FhirToJson {

    private FhirToJson() { }

    private static final Logger LOGGER = LoggerFactory.getLogger(FhirToJson.class);

    /**
     * This method returns the JSON representation of the FHIR resource object.
     *
     * @param oFhirResource The FHIR object representation
     * @return The JSON String
     * @throws Exception
     */
    public static String transform(Resource oFhirResource) throws Exception {
        String sJsonVitals = "";
        JsonElement oJsonElement = transformToJsonElement(oFhirResource);
        sJsonVitals = oJsonElement.toString();
        return sJsonVitals;
    }


    /**
     * This method transforms the FHIR resource to a JsonElement object.
     *
     * @param oFhirResource The resource to be transformed.
     * @return The JSON object that was created.
     * @throws Exception The error if one occurs.
     */
    public static JsonElement transformToJsonElement(Resource oFhirResource) throws Exception {
        JsonElement oJsonElement = new JsonObject();        // Json Element
        JsonObject oJsonObj = null;                         // Json Object
        JsonComposer oJsonComposer = new JsonComposer();    // Json Composer
        JsonParser oJsonParser = new JsonParser();          // Json Parser
        OutputStream bOut = null;                           // Byte Array
        String sOutputJson;                                 // Output "string" version of the JSON

        // Use the JsonComposer class to serialize the JSON instead of GSON
        //------------------------------------------------------------------
        bOut = new ByteArrayOutputStream(); // Byte Array
        oJsonComposer.compose(bOut, oFhirResource, false);
        sOutputJson = bOut.toString();
        oJsonObj = (JsonObject) oJsonParser.parse(sOutputJson);
        oJsonElement = oJsonObj.getAsJsonObject();
        LOGGER.debug("Output JSON string from FhirToJson: " + oJsonElement.toString());
        return oJsonElement;
    }

    /**
     * Convert Atom Feed to JSON Bundle
     *
     * @param feed  The Atom Feed
     * @param pretty if true, string is formatted with readable indentation
     * @return JSON String serialization of the AtomFeed, or null
     */
    public static String transform(AtomFeed feed, boolean pretty) {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        JsonComposer composer = new JsonComposer();
        String jsonString = null;
        try {
            composer.compose(output, feed, pretty);
            jsonString = output.toString("UTF-8");
        } catch (UnsupportedEncodingException e) {
            LOGGER.warn("error (UnsupportedEncodingException)", e);
        } catch (Exception e) {
            LOGGER.warn("error", e);
        }
        return jsonString;
    }

}
