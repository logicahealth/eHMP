package us.vistacore.ehmp.model.meds.transform;

/**
 * This class represents the type of medication
 * @author josephg
 *
 */
public enum MedicationType {
    INPATIENT("I"),
    NON_VA("N"),
    OUTPATIENT("O"),
    IV("V");

    private String code;

    MedicationType(final String code) {
        this.code = code;
    }

    public String getCode() {
        return this.code;
    }
}
