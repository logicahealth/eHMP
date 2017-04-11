package us.vistacore.ehmp.model.allergies;

import us.vistacore.ehmp.model.TerminologyCode;

import java.util.ArrayList;
import java.util.List;

/**
 * This class represents the data for a single allergy result retrieved from
 * Vista.
 *
 * @author Les.Westberg
 *
 */
public class AllergiesResult {
    private String sourceVistaSite;

    private String entered;
    private String facilityCode;
    private String facilityName;
    private Boolean historical;
    private String kind;
    private String localId;
    private List<Product> products;
    private List<Reaction> reactions;
    private String reference;
    private String summary;
    private String uid;
    private String verified;

    private String originatorName;
    private String originationDatetime;
    private String allergyType;
    private String mechanism;

    private List<Comment> comments;
    private List<AllergyObservation> observations;
    private List<TerminologyCode> codes;

    /**
     * Default Constructor.
     */
    public AllergiesResult() {
        super();
    }

    /**
     * Add product to the list of products.
     * @param product The product to be added to the list.
     */
    public void addProducts(Product product) {
        if (products == null) {
            products = new ArrayList<Product>();
        }
        products.add(product);
    }

    /**
     * Set the product list to be the given product list.
     * @param productsList The product list to be set.
     */
    public void setProductsList(List<Product> productsList) {
        this.products = productsList;
    }

    /**
     * Retrieve the list of products.
     * @return The list of products
     */
    public List<Product> getProductsList() {
        return products;
    }

    /**
     * Add a reaction to the list of reactions.
     * @param reaction The reaction to be added.
     */
    public void addReactions(Reaction reaction) {
        if (reactions == null) {
            reactions = new ArrayList<Reaction>();
        }
        reactions.add(reaction);
    }

    /**
     * Set the reactions to be the given reactions list.
     * @param reactionsList The reaction list to be set.
     */
    public void setReactionsList(List<Reaction> reactionsList) {
        this.reactions = reactionsList;
    }

    /**
     * Return the list of reactions.
     * @return The list of reactions.
     */
    public List<Reaction> getReactionsList() {
        return reactions;
    }

    /**
     * Return the source vista site.
     * @return The source vista site.
     */
    public String getSourceVistaSite() {
        return sourceVistaSite;
    }

    /**
     * Set the source vista site.
     * @param sourceVistaSite The source vista site.
     */
    public void setSourceVistaSite(String sourceVistaSite) {
        this.sourceVistaSite = sourceVistaSite;
    }

    /**
     * Return the date/time the data was entered.
     * @return The date/time the data was entered.
     */
    public String getEntered() {
        return entered;
    }

    /**
     * Set the date/time the data was entered.
     * @param entered The date/time the data was entered.
     */
    public void setEntered(String entered) {
        this.entered = entered;
    }

    /**
     * Return the facility code of the facility where the allergy was recorded.
     * @return The facility code of the facility where the allergy was recorded.
     */
    public String getFacilityCode() {
        return facilityCode;
    }

    /**
     * Set the facility code where the allergy was recorded.
     * @param facilityCode  The facility code of the facility where the allergy was recorded.
     */
    public void setFacilityCode(String facilityCode) {
        this.facilityCode = facilityCode;
    }

    /**
     * Return the name of the facility where the allergy was recorded.
     * @return The name of the facility where the allergy was recorded.
     */
    public String getFacilityName() {
        return facilityName;
    }

    /**
     * Set the name of the facility where the allergy was recorded.
     * @param facilityName The name of the facility where the allergy was recorded.
     */
    public void setFacilityName(String facilityName) {
        this.facilityName = facilityName;
    }

    /**
     * Return whether this allergy was recorded as a historical allergy.
     * @return TRUE if this allergy was recorded as a historical allergy.
     */
    public Boolean getHistorical() {
        return historical;
    }

    /**
     * Set to true if this allergy was recorded as a historical allergy.
     * @param historical  TRUE if this is a historical allergy.
     */
    public void setHistorical(Boolean historical) {
        this.historical = historical;
    }

    /**
     * Return the kind of data. This will always be set to
     * "Allergy/Adverse Reaction" for allergy results.
     *
     * @return The kind of data. This will always be set to
     *         "Allergy/Adverse Reaction" for allergy results.
     */
    public String getKind() {
        return kind;
    }

    /**
     * Set the kind of data. This will always be set to
     * "Allergy/Adverse Reaction" for allergy results.
     *
     * @param kind The kind of data. This will always be set to
     *            "Allergy/Adverse Reaction" for allergy results.
     */
    public void setKind(String kind) {
        this.kind = kind;
    }

    /**
     * Return the unique identifier for this allergy result in VistA
     * @return The unique identifier of this allergy result in VistA
     */
    public String getLocalId() {
        return localId;
    }

    /**
     * Set the unique identifier for this allergy result in VistA
     * @param localId The unique identifier for this allergy result in VistA
     */
    public void setLocalId(String localId) {
        this.localId = localId;
    }

    /**
     * Return the summary description of this allergy.
     * @return The summary description of this allergy.
     */
    public String getSummary() {
        return summary;
    }

    /**
     * Set the summary description of this allergy.
     * @param summary The summary description of this allergy.
     */
    public void setSummary(String summary) {
        this.summary = summary;
    }

    /**
     * Return the reference for this allergy.
     * @return The reference for this allergy.
     */
    public String getReference() {
        return reference;
    }

    /**
     * Set the reference for this allergy.
     * @param reference The reference for this allergy.
     */
    public void setReference(String reference) {
        this.reference = reference;
    }

    /**
     * Return the UID for this allergy.
     *
     * @return The UID for this allergy.
     */
    public String getUid() {
        return uid;
    }

    /**
     * Set the UID for this allergy.
     * @param uid The UID for this allergy.
     */
    public void setUid(String uid) {
        this.uid = uid;
    }

    /**
     * Return the date and time this allergy was verified.
     * @return The date and time this allergy was verified.
     */
    public String getVerified() {
        return verified;
    }

    /**
     * Set the date and time this allergy was verified.
     * @param verified  The date and time this allergy was verified.
     */
    public void setVerified(String verified) {
        this.verified = verified;
    }

    /**
     * Return the name of the originator.
     * @return The name of the originator.
     */
    public String getOriginatorName() {
        return originatorName;
    }

    /**
     * Set the name of the originator.
     * @param originatorName  The name of the originator.
     */
    public void setOriginatorName(String originatorName) {
        this.originatorName = originatorName;
    }

    /**
     * Return the date/time when this allergy originated.
     * @return The date/time when this allergy originated.
     */
    public String getOriginationDatetime() {
        return originationDatetime;
    }

    /**
     * Set the date/time when this allergy originated.
     * @param originationDatetime The date/time when this allergy originated.
     */
    public void setOriginationDatetime(String originationDatetime) {
        this.originationDatetime = originationDatetime;
    }

    /**
     * Return the type of allergy (i.e. Drug, Food, Other).
     * @return The type of allergy (i.e. Drug, Food, Other).
     */
    public String getAllergyType() {
        return allergyType;
    }

    /**
     * Sets the type of allergy (i.e. Drug, Food, Other).
     * @param allergyType  The type of allergy (i.e. Drug, Food, Other).
     */
    public void setAllergyType(String allergyType) {
        this.allergyType = allergyType;
    }

    /**
     * Return the comments of the allergy result.
     * @return The comments of the allergy result.
     */
    public List<Comment> getComments() {
        return comments;
    }

    /**
     * Set the comments of the allergy result.
     * @param comments The comments of the allergy result.
     */
    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    /**
     * Returns the reaction mechanism, aka., reaction nature
     * @return The reaction mechanism
     */
    public String getMechanism() {
        return mechanism;
    }

    /**
     * Sets the reaction mechanism, aka., reaction nature
     * @param mechanism The reaction mechanism
     */
    public void setMechanism(String mechanism) {
        this.mechanism = mechanism;
    }

    public List<AllergyObservation> getObservations() {
        return observations;
    }

    public void setObservations(List<AllergyObservation> observations) {
        this.observations = observations;
    }

    /**
     * Add code to the list of codes.
     * @param code The code to be added to the list.
     */
    public void addCodes(TerminologyCode code) {
        if (codes == null) {
            codes = new ArrayList<TerminologyCode>();
        }
        codes.add(code);
    }

    /**
     * Set the codes list to be the given code list.
     * @param codesList The code list to be set.
     */
    public void setCodesList(List<TerminologyCode> codesList) {
        this.codes = codesList;
    }

    /**
     * Retrieve the list of codes.
     * @return The list of codes
     */
    public List<TerminologyCode> getCodesList() {
        return codes;
    }



    public static class Comment {
        private String entered;
        private String enteredByName;
        private String enteredByDisplayName;
        private String comment;
        private String enteredByUid;

        public String getEntered() {
            return entered;
        }

        public void setEntered(String entered) {
            this.entered = entered;
        }

        public String getEnteredByName() {
            return enteredByName;
        }

        public void setEnteredByName(String enteredByName) {
            this.enteredByName = enteredByName;
        }

        public String getEnteredByDisplayName() {
            return enteredByDisplayName;
        }

        public void setEnteredByDisplayName(String enteredByDisplayName) {
            this.enteredByDisplayName = enteredByDisplayName;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }

        public String getEnteredByUid() {
            return enteredByUid;
        }

        public void setEnteredByUid(String enteredByUid) {
            this.enteredByUid = enteredByUid;
        }
    }

    public static class AllergyObservation {
        private String date;
        private String severity;

        public AllergyObservation(String date, String severity) {
            this.setDate(date);
            this.setSeverity(severity);
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public String getSeverity() {
            return severity;
        }

        public void setSeverity(String severity) {
            this.severity = severity;
        }
    }
}
