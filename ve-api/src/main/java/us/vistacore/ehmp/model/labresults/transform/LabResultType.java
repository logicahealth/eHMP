package us.vistacore.ehmp.model.labresults.transform;

public enum LabResultType {

    CHEMISTRY("urn:va:lab-category:CH"),
    CYTOPATHOLOGY("urn:va:lab-category:CY"),
    ELECTRONMICROSCOPY("urn:va:lab-category:EM"),
    MICROBIOLOGY("urn:va:lab-category:MI"),
    SURGICALPATHOLOGY("urn:va:lab-category:SP");

    private String code;

    LabResultType(String code) {
        this.code = code;
    }

    public String getCode() {
        return this.code;
    }
}
