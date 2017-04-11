package us.vistacore.ehmp.model;

import org.apache.commons.lang.StringUtils;

public enum VprDomain {

    /**
     * Additional JDS Indexes, not mapped to VPR Domains:
     *   parent-documents
     *   accession
     *   microbiology
     *   order-status
     *   pathology
     *   notesview
     *   cwad
     *   med-active-inpt
     *   med-active-outpt
     *   curvisit
     *   task
     *   diagnosis
     *   roadtrip
     *   auxiliary
     *   patsyncerr
     */
    ACCESSION("accession"),
    PATIENT("patient"),
    VITAL("vital", "vitalsign"),
    PROBLEM("problem"),
    ALLERGY("allergy"),
    ORDER("order"),
    TREATMENT("treatment"),
    MED("med", "medication"),
    CONSULT("consult"),  // Had Duplicate listing in DOMAIN^VPRJPMX, took out use if 'procedure' index
    PROCEDURE("procedure"),
    OBS("obs", "observation"),
    LAB("lab", "laboratory"),
    IMAGE("image", "procedure"),
    SURGERY("surgery", "procedure"),
    DOCUMENT("document"),
    MH("mh", "mentalhealth"),
    IMMUNIZATION("immunization"),
    POV("pov", "purposeofvisit"),
    SKIN("skin", "skintest"),
    EXAM("exam"),
    CPT("cpt", "visitcptcode"),
    EDUCATION("education", "educationtopic"),
    FACTOR("factor", "healthfactor"),
    APPOINTMENT("appointment", "encounter"),
    VISIT("visit", "encounter"),
    RAD("rad", "imaging"),
    PTF("ptf", "visittreatment"),
    PATIENT_SELECT("pt-select");

    private static String domainErrorString;

    private String jdsIndex;
    private String id;

    VprDomain(String id) {
        this.id = id;
        this.jdsIndex = id;
    }

    VprDomain(String id, String jdsIndex) {
        this.id = id;
        this.jdsIndex = jdsIndex;
    }

    /**
     * Returns the VPR name of this Domain
     * @return VPR Name
     */
    public String getId() {

        return this.id;
    }

    /**
     * Returns the JDS name of this Domain
     * @return JDS Name
     */
    public String getJdsIndex() {
        return this.jdsIndex;
    }


    public static VprDomain idToValue(String id) {
        VprDomain[] allValues = VprDomain.values();

        for (int i = 0; i < allValues.length; i++) {
            if (allValues[i].getId().equals(id)) {
                return allValues[i];
            }
        }

        if (domainErrorString == null) {
            domainErrorString = '[' + StringUtils.join(allValues, ',') + ']';
        }
        throw new VprDataTypeException("value must be one of: " + domainErrorString);
    }

    /**
     * Returns the VPR name of this Data Type
     * @return VPR Name
     */
    @Override
    public String toString() {
        return this.getId();
    }
    /**
     * Checks if input string is a valid Domain name in the VprDomain Enum.
     * example: to return true on medication use VprDomain.hasDomain("MED");
     * @param val
     * @return true or false
     */
    public static boolean hasDomain(String val) {
        boolean hasDomain = false;
        for (VprDomain vprDomain : VprDomain.values()) {
            if (vprDomain.getId().equalsIgnoreCase(val)) {
                hasDomain = true;
                break;
            }
        }
        return hasDomain;
    }

    public static class VprDataTypeException extends IllegalArgumentException {

        /**
         * Generated Serial Version ID.
         */
        private static final long serialVersionUID = 2270793257538243448L;

        public VprDataTypeException(String msg) {
            super(msg);
        }
    }
}
