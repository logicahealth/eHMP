package us.vistacore.ehmp.model.meds;

/**
 * This class represents the medication result information that will be received
 * from Vista RPC call
 * @author josephg
 *
 */
public class VPRMedicationsRpcOutput {

    private String apiVersion;
    private MedicationData data;

    /**
     * Default constructor.
     */
    public VPRMedicationsRpcOutput() {
    }

    public String getApiVersion() {
        return apiVersion;
    }

    public void setApiVersion(final String apiVersion) {
        this.apiVersion = apiVersion;
    }

    public MedicationData getData() {
        return data;
    }

    public void setData(final MedicationData data) {
        this.data = data;
    }
}
