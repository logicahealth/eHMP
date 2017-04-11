package us.vistacore.ehmp.model.allergies;

import java.util.Hashtable;

import org.hl7.fhir.instance.model.AdverseReaction.ReactionSeverity;

import us.vistacore.ehmp.util.NullChecker;

/**
 * This class contains the mapping of the Vista allergy severity field to the FHIR reaction severity field.
 *
 */
public final class AllergySeverityMap {

    private AllergySeverityMap() { }

    private static Hashtable<String, ReactionSeverity>
                hVistaSeverityToHL7SeverityMap = new Hashtable<String, ReactionSeverity>();
    static {
        hVistaSeverityToHL7SeverityMap.put("severe", ReactionSeverity.severe);
        hVistaSeverityToHL7SeverityMap.put("moderate", ReactionSeverity.moderate);
        hVistaSeverityToHL7SeverityMap.put("mild", ReactionSeverity.minor);
    }


    /**
     * Return the appropriate FHIR severity from the given VistA severity.
     *
     * @param sVistaSeverity The severity in VistA
     * @return The severity in FHIR
     */
    public static ReactionSeverity getFhirSeverity(String sVistaSeverity) {
        ReactionSeverity oFhirSeverity = null;

        if (NullChecker.isNotNullish(sVistaSeverity)) {
            oFhirSeverity = hVistaSeverityToHL7SeverityMap.get(sVistaSeverity.toLowerCase());
        }

        return oFhirSeverity;
    }
}
