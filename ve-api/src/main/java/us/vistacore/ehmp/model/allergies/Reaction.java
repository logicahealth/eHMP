package us.vistacore.ehmp.model.allergies;

/**
 * This class represents an allergy reaction.
 *
 * @author Les.Westberg
 *
 */
public class Reaction {
    private String name;
    private String vuid;

    private String reference;

    /**
     * Default constructor.
     */
    public Reaction() {
        super();
    }

    /**
     * Return the name of the allergy reaction.
     *
     * @return The name of the allergy reaction.
     */
    public String getReactionsName() {
        return name;
    }

    /**
     * Set the name of the allergy reaction.
     *
     * @param reactionsName
     *            The name of the allergy reaction.
     */
    public void setReactionsName(String reactionsName) {
        this.name = reactionsName;
    }

    /**
     * Return the VUID for the allergy reaction.
     *
     * @return The VUID for the allergy reaction.
     */
    public String getReactionsVuid() {
        return vuid;
    }

    /**
     * Set the VUID for the allergy reaction.
     *
     * @param reactionsVuid The VUID for the allergy reaction.
     */
    public void setReactionsVuid(String reactionsVuid) {
        this.vuid = reactionsVuid;
    }

    /**
     * Return the reference for this allergy reaction.
     *
     * @return The reference for this allergy reaction.
     */
    public String getReference() {
        return reference;
    }

    /**
     * Set the reference for this allergy reaction.
     *
     * @param reference The reference for this allergy reaction.
     */
    public void setReference(String reference) {
        this.reference = reference;
    }
}
