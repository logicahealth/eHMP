package us.vistacore.ehmp.model.transform;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;

import org.hl7.fhir.instance.formats.XmlComposer;
import org.hl7.fhir.instance.model.AtomFeed;
import org.hl7.fhir.instance.model.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 * This class is used to convert a Java FHIR representation to an XML FHIR representation.
 *
 * @author Kyle.Marchant, Les.Westberg
 *
 */
public final class FhirToXML {

    private FhirToXML() { }

    private static final Logger LOGGER = LoggerFactory.getLogger(FhirToXML.class);

    /**
     * This method returns the XML representation of the FHIR vitals object.
     *
     * @param oFhirResource The FHIR resource object to be transformed.
     * @return The XML representing the FHIR resource.
     * @throws Exception
     */
    public static String transform(Resource oFhirResource) throws Exception {
        XmlComposer oXmlComposer = new XmlComposer();   // XML Composer
        OutputStream bOut = null;                       // Byte Array
        String sOutputXml;                              // Output "string" version of the XML

        // Use the XMLComposer class to serialize the Fhir Class
        //------------------------------------------------------
        bOut = new ByteArrayOutputStream(); // Byte Array
        oXmlComposer.compose(bOut, oFhirResource, false);
        sOutputXml = bOut.toString();
        LOGGER.debug("Output XML from FhirToXML: " + sOutputXml);
        return sOutputXml;
    }


    /**
     * Convert Atom Feed to XML Feed
     *
     * @param feed  The Atom Feed
     * @param pretty if true, string is formatted with readable indentation
     * @return XML String serialization of the AtomFeed, or null
     */
    public static String transform(AtomFeed feed, boolean pretty) {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        XmlComposer composer = new XmlComposer();
        String xmlString = null;
        try {
            composer.compose(output, feed, pretty);
            xmlString = output.toString("UTF-8");
        } catch (UnsupportedEncodingException e) {
            LOGGER.warn("error (UnsupportedEncodingException)", e);
        } catch (Exception e) {
            LOGGER.warn("error", e);
        }
        return xmlString;
    }

}
