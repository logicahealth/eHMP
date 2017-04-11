package us.vistacore.ehmp.webapi.meta;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import us.vistacore.ehmp.util.NullChecker;

public class MetaData {

    private static final Logger LOGGER = LoggerFactory.getLogger(MetaData.class);

    public MetaData() {
    }

    private String commithash = "";
    private String version = "";
    private String fhir = "";
    private String vpr = "";

    public String getCommithash() {
        if (NullChecker.isNotNullish(commithash)) {
            return commithash;
        }
        try {
            ManifestHelper helper = new ManifestHelper();
            commithash = helper.getImplementationCommitHash();
            return commithash;
        } catch (Exception ex) {
            LOGGER.error("Error getting commithash ", ex);
        }
        return "error";
    }

    public String getVersion() {
        if (NullChecker.isNotNullish(version)) {
            return version;
        }
        try {
            ManifestHelper helper = new ManifestHelper();
            version = helper.getImplementationVersion();
            return version;
        } catch (Exception ex) {
            LOGGER.error("Error getting version ", ex);
        }
        return "error";
    }

    public String getVpr() {
        if (NullChecker.isNotNullish(vpr)) {
            return vpr;
        }
        try {
            ManifestHelper helper = new ManifestHelper();
            vpr = helper.get("VPR-Version");
            return vpr;
        } catch (Exception ex) {
            LOGGER.error("Error getting vpr ", ex);
        }
        return "error";
    }

    public String getFhir() {
        if (NullChecker.isNotNullish(fhir)) {
            return fhir;
        }
        try {
            ManifestHelper helper = new ManifestHelper();
            fhir = helper.get("FHIR-Version");
            return fhir;
        } catch (Exception ex) {
            LOGGER.error("Error getting fhir ", ex);
        }
        return "error";
    }

}
